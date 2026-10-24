import { STRINGS, ROLES, PREVIEW } from './scenario.js';

const $ = (id) => document.getElementById(id);
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export class UI {
  constructor() {
    this.lang = localStorage.getItem('k3-lang') || 'en';
    this.decision = $('decision'); this.action = $('action');
    $('lang').addEventListener('click', () => { this.setLang(this.lang === 'en' ? 'id' : 'en'); this.onLang?.(); });
    $('sound').addEventListener('click', () => { this.onSound?.(); });
    $('view').addEventListener('click', () => { this.onView?.(); });
    this.renderStart();
  }
  t(obj) { return typeof obj === 'string' ? obj : (obj?.[this.lang] ?? obj?.en ?? ''); }
  setLang(l) { this.lang = l; localStorage.setItem('k3-lang', l); this.renderStart(); this.renderStatic(); }
  renderStatic() {
    $('lang').textContent = this.lang === 'en' ? 'ID' : 'EN';
    $('mission-k').textContent = this.t(STRINGS.mission); $('milestones-k').textContent = this.t(STRINGS.milestones).toUpperCase();
    $('timer-lbl').textContent = this.t(STRINGS.shiftTime); $('near-lbl').textContent = this.t(STRINGS.near);
  }
  renderStart() {
    this.renderStatic();
    $('start-lead').textContent = this.t(STRINGS.startLead);
    $('role-title').textContent = this.t(STRINGS.roleTitle);
    $('start-fine').textContent = this.t(STRINGS.startFine);
    $('start-disclaimer').textContent = this.t(STRINGS.disclaimer);
    // A short list to pick from, and one landing-style card for the picked role: what it looks like,
    // the keys it uses, and the button that starts it.
    const row = (r) => `<button type="button" class="pick" role="option" data-i="${ROLES.indexOf(r)}"><svg class="ic"><use href="#${r.icon}"/></svg><span class="n">${this.t(r.name)}</span></button>`;
    const walk = ROLES.filter((r) => !r.mode), hands = ROLES.filter((r) => r.mode);
    $('roles').innerHTML = `<div class="list" role="listbox" aria-label="${this.t(STRINGS.roleTitle)}">
        <div class="gk">${this.t(STRINGS.groupWalk)}</div>${walk.map(row).join('')}
        <div class="gk">${this.t(STRINGS.groupHands)}</div>${hands.map(row).join('')}
      </div><div class="preview" id="role-preview"></div>`;
    const rows = [...$('roles').querySelectorAll('.pick')];
    rows.forEach((b, k) => {
      b.addEventListener('click', () => this.selectRole(Number(b.dataset.i)));
      b.addEventListener('dblclick', () => this.onRole?.(ROLES[Number(b.dataset.i)]));
      b.addEventListener('keydown', (e) => {
        const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        if (step) { e.preventDefault(); const nb = rows[(k + step + rows.length) % rows.length]; nb.focus(); this.selectRole(Number(nb.dataset.i)); }
        else if (e.key === 'Enter') { e.preventDefault(); this.onRole?.(ROLES[Number(b.dataset.i)]); }
      });
    });
    this.selectRole(this.picked ?? 0);
  }
  selectRole(i) {
    this.picked = i; const r = ROLES[i], p = PREVIEW[r.id];
    $('roles').querySelectorAll('.pick').forEach((b) => { const on = Number(b.dataset.i) === i; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    const keys = p.keys[this.lang].map(([k, l]) => `<span>${k.split(' ').map((x) => `<kbd>${x}</kbd>`).join('')} ${l}</span>`).join('<span class="sep">·</span>');
    $('role-preview').innerHTML = `<div class="ap-bar">${this.t(r.tag)}</div>
      <h2>${this.t(r.name)}</h2><p>${this.t(r.blurb)}</p><div class="pkeys">${keys}</div>
      <img src="${p.shot}" alt="" /><button type="button" class="go" id="role-go">${this.t(p.go)}</button>`;
    $('role-go').addEventListener('click', () => this.onRole?.(r));
  }
  showRoles() { this.hideEnd(); $('overlay-start').classList.remove('hidden'); $('hud').classList.add('hidden'); }
  hideStart() { $('overlay-start').classList.add('hidden'); $('hud').classList.remove('hidden'); }
  setHudVisible(v) { $('hud').classList.toggle('hidden', !v); $('vignette').style.opacity = v ? 1 : 0.6; }
  setSound(on) { $('sound').classList.toggle('off', !on); }
  setView(v) { $('view').textContent = v === 'third' ? '1st' : '3rd'; $('view').title = this.t(STRINGS.view); $('crosshair').classList.toggle('hidden', v === 'third'); }

  setMission(role, hazards, results, idx) {
    $('mission-role').textContent = this.t(role.name);
    $('objective-text').textContent = this.t(hazards[idx]?.objective ?? '');
    $('milestones').innerHTML = hazards.map((h, i) => `<li class="${results[i] ?? (i === idx ? 'now' : '')}"><span class="ic"></span><span>${this.t(h.title)}</span></li>`).join('');
    $('near-count').textContent = results.filter((r) => r === 'near').length;
  }
  setDistance(d, elapsed) { $('distance').textContent = `${d.toFixed(0)} m ${this.t(STRINGS.distance)}`; $('timer').textContent = fmt(elapsed); }
  setHeading(yaw) { const px = ((yaw * 180 / Math.PI) % 360) / 90 * 120; const t = $('compass-track'); if (t) t.style.transform = `translateX(${px}px)`; }
  setHint(kind) { $('hint').textContent = kind === 'click' ? this.t(STRINGS.hintClick) : kind === 'walk' ? this.t(STRINGS.hint) : this.t(kind); }
  setObjectiveNote(text) { $('distance').textContent = text; }
  setTimer(elapsed) { $('timer').textContent = fmt(elapsed); }
  // Mode readout (speed, load, wind, exposure...). Empty string hides it.
  setGauge(html) { const g = $('gauge'); g.classList.toggle('hidden', !html); if (html !== this._gauge) { g.innerHTML = html; this._gauge = html; } }
  toast(h, ok, note) {
    const el = $('toast'); clearTimeout(this._toastT);
    el.innerHTML = `<span class="verdict ${ok ? 'ok' : 'bad'}">${this.t(ok ? STRINGS.passed : STRINGS.nearMiss)}</span><b>${this.t(h.title)}</b>${note ? `<span class="note">${note}</span>` : ''}<small>${h.rule?.name ?? ''}</small>`;
    el.classList.remove('hidden'); this._toastT = setTimeout(() => el.classList.add('hidden'), 4200);
  }

  showPrompt(h, disabled, onChoose) {
    this.decision.classList.remove('hidden');
    const L = ['A', 'B', 'C'];
    this.decision.innerHTML = `<div class="box">
      <div class="eyebrow">${this.t(STRINGS.decide)}</div>
      <h2>${this.t(h.title)}</h2>
      <p class="sit">${this.t(h.situation)}</p>
      <div class="options">${h.options.map((o, i) => `<button class="opt" data-i="${i}" ${disabled.has(i) ? 'disabled' : ''}><span class="letter">${L[i]}</span><br>${this.t(o)}</button>`).join('')}</div>
      <div class="keys">${this.t(STRINGS.chooseKey)}</div></div>`;
    this.decision.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => onChoose(Number(b.dataset.i))));
  }
  showFeedback(h, correct, onNext, label) {
    this.decision.classList.remove('hidden');
    this.decision.innerHTML = `<div class="box">
      <span class="verdict ${correct ? 'ok' : 'bad'}">${this.t(correct ? STRINGS.passed : STRINGS.nearMiss)}</span>
      <h2>${this.t(h.title)}</h2>
      <p class="why">${this.t(h.why)}</p>
      <div class="rule"><b>${h.rule.name}</b>${this.t(h.rule)}</div>
      <div class="actions"><button class="primary" id="card-next">${label ?? this.t(correct ? STRINGS.cont : STRINGS.retry)}</button></div></div>`;
    $('card-next').addEventListener('click', onNext);
  }
  hideCard() { this.decision.classList.add('hidden'); }

  showAction(a) {
    this.action.classList.remove('hidden');
    const key = a.key === 'Space' ? 'SPACE' : a.key.replace('Key', '');
    this.action.innerHTML = `<div class="lbl"><span class="key">${key}</span> ${this.t(a.label)}</div><div class="bar">${a.type === 'timing' ? `<div class="zone" style="left:${a.window[0] * 100}%;width:${(a.window[1] - a.window[0]) * 100}%"></div><div class="marker"></div>` : '<div class="fill"></div>'}</div><div class="msg"></div>`;
  }
  actionProgress(p) { const f = this.action.querySelector('.fill'); if (f) f.style.width = `${Math.min(100, p * 100)}%`; }
  actionTiming(k) { const m = this.action.querySelector('.marker'); if (m) m.style.left = `calc(${k * 100}% - 2px)`; }
  actionMiss() { const m = this.action.querySelector('.msg'); if (m) m.innerHTML = `<span class="miss">${this.t(STRINGS.actionMiss)}</span>`; }
  actionDone() { const m = this.action.querySelector('.msg'); if (m) m.innerHTML = `<span class="done">✓ ${this.t(STRINGS.actionDone)}</span>`; }
  hideAction() { this.action.classList.add('hidden'); }

  // own: the replay is the player's recorded run, not a scripted scene. tele: live telemetry chip.
  replayBanner(show, caption = '', own = false, tele = '') {
    $('replay-banner').classList.toggle('hidden', !show); $('replay-caption').textContent = caption;
    $('replay-tag').textContent = this.t(own ? STRINGS.yourRun : STRINGS.replayTag);
    const te = $('replay-tele'); te.textContent = tele || ''; te.classList.toggle('hidden', !tele);
  }
  flash() { const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 160); }

  showEnd({ role, hazards, results, seconds }, onRestart, onRoles) {
    const clean = results.filter((r) => r === 'pass').length, near = results.length - clean;
    const rows = hazards.map((h, i) => `<div class="row ${results[i]}"><span class="ic">${results[i] === 'pass' ? '✓' : '!'}</span><span>${this.t(h.title)}<small>${h.rule.name}</small></span><span><small>${this.t(results[i] === 'pass' ? STRINGS.firstTry : STRINGS.replayed)}</small></span></div>`).join('');
    $('overlay-end').innerHTML = `<div class="panel">
      <div class="eyebrow">SHIFTREPLAY · ${this.t(STRINGS.endTitle).toUpperCase()} · ${this.t(role.name).toUpperCase()}</div>
      <div class="stat-row"><div class="score">${clean}<small>/${hazards.length} ${this.t(STRINGS.endScore)}</small></div><div class="score" style="font-size:28px">${near}<small> ${this.t(STRINGS.endNear)}</small></div><div class="score" style="font-size:28px">${fmt(seconds)}<small> ${this.t(STRINGS.endTime)}</small></div></div>
      <div class="report">${rows}</div>
      <p>${this.t(STRINGS.endLead)}</p>
      <p class="disclaimer">${this.t(STRINGS.disclaimer)}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="primary" id="restart">${this.t(STRINGS.restart)}</button><button class="primary" id="roles-btn" style="background:rgba(255,255,255,0.1);color:#fff">${this.t(STRINGS.roleTitle)}</button></div></div>`;
    $('overlay-end').classList.remove('hidden');
    $('restart').addEventListener('click', onRestart); $('roles-btn').addEventListener('click', onRoles);
  }
  hideEnd() { $('overlay-end').classList.add('hidden'); }
}
