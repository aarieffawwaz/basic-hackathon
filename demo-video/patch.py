import json, re, sys
REC='/private/tmp/claude-501/-Users-af--claude-spares-spare-3MMSkv/175c42f3-b31a-4c5f-9ab9-9d691f6be4e2/scratchpad/rec/clips/'
E=json.load(open(REC+'events.json'))
try: W={e['k']:e['t'] for e in json.load(open(REC+'events-walk.json'))}
except Exception: W={'action':3.2,'held':5.3,'walk-start':6.7,'walk-pause':10.1,'third':10.7,'walk-end':13.3}
def ev(clip,k,n=0): return [e for e in E[clip] if e['k']==k][n]
R=lambda v: str(round(v,2))
IMPACT_LOCAL = float(sys.argv[1]) if len(sys.argv)>1 else 7.9
PRO=13.6  # prologue length: the K3 problem before the product
MUS=2.1   # music enters this long before the hook
V={}
# intro: the sim's First Shift card + gate check, then the landing's truck lane with the tractor coming
V['in_walk_ms']=0.0; V['in_land_ms']=20.8
# hook
click=ev('cross','click',0); hook_ms=click['t']-3.5
V.update(hook_ms=hook_ms, a_in_x=1940, a_in_y=1150, a_at_x=ev('cross','cursor-at',0)['x'], a_at_y=ev('cross','cursor-at',0)['y'])
nm_local=ev('cross','nearmiss-card',0)['t']-hook_ms; V['hk_cap_in']=nm_local+0.45
# name: orbit after the hero text has faded
V['name_ms']=ev('landing','scroll-start',0)['t']+4.7
# proof1
rc=ev('roles-walk','click',0); p1_ms=rc['t']-3.0
V.update(p1_ms=p1_ms, r_in_x=1800, r_in_y=1120, r_at_x=ev('roles-walk','cursor-at',0)['x'], r_at_y=ev('roles-walk','cursor-at',0)['y'])
V['p1_cut']=4.4; V['walk_ms']=W['walk-start']-0.2; card_local=4.4+(11.8-V['walk_ms']); V['p1_card']=card_local; T1=round(card_local+0.8,2); V['T1']=T1; V['p1_rest']=round(T1-4.4,2); V['p1_punch']=4.4+0.9
# proof2
p2_ms=ev('cross','choose-again',0)['t']-1.2
clickC=ev('cross','click',1)['t']-p2_ms; cont=ev('cross','continue',0)['t']-p2_ms
sp=[e for e in E['cross'] if not isinstance(e['k'],str)]; space=(sp[0]['t']-p2_ms) if sp else cont+3.0
T2=round(space+1.7,2)
V.update(p2_ms=p2_ms, clickC=clickC, cont=cont, T2=T2, btn_x=477, btn_y=720, btn2_x=459, btn2_y=720, c_in_x=1940, c_in_y=1150, c_at_x=ev('cross','cursor-at',1)['x'], c_at_y=ev('cross','cursor-at',1)['y'])
# range: each excerpt starts so the flash lands about 1.2 s in
FL={'load':5.5,'snapback':4.2,'height':5.3}
try:
    for k,v in json.load(open('flash.json')).items(): FL[k]=v
except Exception: pass
V['load_ms']=FL['load']-1.3; V['snap_ms']=FL['snapback']-1.1; V['height_ms']=FL['height']-1.3
# payoff, claim
V['pay_ms']=ev('end','report',0)['t']+0.3; V['row_ox']=50; V['row_oy']=42
V['claim_ms']=ev('landing','scroll-start',0)['t']+19.0  # third person, then under the RTG
# root schedule
S={'intro':0,'hook':PRO,'name':PRO+17.5,'proof1':PRO+21.5,'proof2':round(PRO+21.5+T1,2)}; P2=S['proof2']
S['range']=round(P2+T2,2); S['payoff']=round(S['range']+8,2); S['claim']=round(S['payoff']+9,2); S['endcard']=round(S['claim']+7,2); TOTAL=round(S['endcard']+8.5,2)
common=open('templates/_common.css').read(); cursor=open('templates/_cursor.svg').read().strip()
def fill(s):
    s=s.replace('@@COMMON@@',common)
    s=re.sub(r'@@CURSOR:([\w-]+)@@', lambda m: cursor.replace('class="cursor"', f'class="cursor" id="{m.group(1)}"'), s)
    return re.sub(r'@@(\w+)@@', lambda m: R(V[m.group(1)]) if isinstance(V[m.group(1)],float) else str(V[m.group(1)]), s)
for name in ['intro','hook','name','proof1','proof2','range','payoff','claim']:
    open(f'compositions/{name}.html','w').write(fill(open(f'templates/{name}.tpl').read()))
# root: rewrite host starts, durations, sfx times, bgm lane
root=open('index.html').read()
def setattr_(s, id_, attr, val): return re.sub(rf'(id="{id_}"[^>]*?{attr}=")[^"]*(")', rf'\g<1>{val}\2', s, count=1)
for k,v in S.items(): root=setattr_(root,k,'data-start',R(v))
root=setattr_(root,'proof2','data-duration',R(T2)); root=setattr_(root,'proof1','data-duration',R(T1)); root=setattr_(root,'root','data-duration',R(TOTAL))
root=re.sub(r'(id="root"[^>]*?data-duration=")[^"]*(")', rf'\g<1>{R(TOTAL)}\2', root)
MS=round(PRO-MUS,2); root=setattr_(root,'bgm','data-start',R(MS)); root=setattr_(root,'bgm','data-duration',R(TOTAL-MS)); root=setattr_(root,'amb','data-duration',R(TOTAL)); root=setattr_(root,'endcard','data-duration','8.5')
SF={'sfx-whip-0':PRO-0.15,'sfx-click-a':PRO+3.5,'sfx-impact':PRO+IMPACT_LOCAL,'sfx-thud':PRO+IMPACT_LOCAL,'sfx-whip-1':PRO+17.35,'sfx-whip-2':PRO+21.35,'sfx-click-r':PRO+24.5,'sfx-whip-3':P2-0.15,'sfx-ok':P2+clickC+0.1,
    'sfx-click-c':P2+clickC,'sfx-space':P2+space,'sfx-click-again':P2+1.2,'sfx-click-cont':P2+cont,'sfx-whip-4':S['range']-0.15,
    'sfx-whip-7':S['payoff']-0.15,'sfx-whip-8':S['claim']-0.15,'sfx-riser':S['endcard']-10.0,'sfx-land':S['endcard']-0.05,'sfx-pop':S['endcard']+1.65}
for k,v in SF.items(): root=setattr_(root,k,'data-start',R(v))
H=MUS  # hook start in music-clip time
lane={"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0.4},{"t":H,"v":0.7},{"t":round(H+3.3,2),"v":0.7},{"t":round(H+3.8,2),"v":0.22},{"t":round(H+nm_local-0.3,2),"v":0.22},{"t":round(H+nm_local+0.5,2),"v":1.0},{"t":round(S['endcard']-MS-0.6,2),"v":1.0},{"t":round(S['endcard']-MS+0.2,2),"v":0.42},{"t":round(TOTAL-MS,2),"v":0.42}]}]}
amb={"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":1.0},{"t":round(PRO-0.6,2),"v":1.0},{"t":round(PRO+0.4,2),"v":0.5},{"t":round(S['endcard']-0.6,2),"v":0.5},{"t":round(S['endcard']+0.2,2),"v":0.3},{"t":TOTAL,"v":0.3}]}]}
root=re.sub(r"(id=\"amb\"[^>]*?data-automation=')[^']*(')", lambda m: m.group(1)+json.dumps(amb)+m.group(2), root)
root=re.sub(r"(id=\"bgm\"[^>]*?data-automation=')[^']*(')", lambda m: m.group(1)+json.dumps(lane)+m.group(2), root)
open('index.html','w').write(root)
print('schedule',S,'total',TOTAL,'T2',T2,'clickC',R(clickC),'cont',R(cont),'space',R(space),'nm_local',R(nm_local))
