import { STRINGS } from './scenario.js';

const $ = (id) => document.getElementById(id);

export class UI {
  constructor() {
    this.lang = localStorage.getItem('k3-lang') || 'en';
    this.card = $('card');
    $('lang').addEventListener('click', () => { this.setLang(this.lang === 'en' ? 'id' : 'en'); this.onLang?.(); });
    this.renderStart();
  }
  t(obj) { return typeof obj === 'string' ? obj : (obj?.[this.lang] ?? obj?.en ?? ''); }
  setLang(l) { this.lang = l; localStorage.setItem('k3-lang', l); $('lang').textContent = l === 'en' ? 'ID' : 'EN'; this.renderStart(); }

  renderStart() {
    $('lang').textContent = this.lang === 'en' ? 'ID' : 'EN';
    $('start-lead').textContent = this.t(STRINGS.startLead);
    $('start-list').innerHTML = STRINGS.startList[this.lang].map((s) => `<li>${s}</li>`).join('');
    $('start-btn').textContent = this.t(STRINGS.startBtn);
    $('start-fine').textContent = this.t(STRINGS.startFine);
  }
  onStart(fn) { $('start-btn').addEventListener('click', fn); }
  hideStart() { $('overlay-start').classList.add('hidden'); $('hud').classList.remove('hidden'); }

  setObjective(text) { $('objective-text').textContent = this.t(text); }
  setHint(kind) { $('hint').textContent = this.t(kind === 'click' ? STRINGS.hintClick : STRINGS.hint); }
  setProgress(results, total, current) {
    const dots = Array.from({ length: total }, (_, i) => {
      const r = results[i];
      const cls = r === 'pass' ? 'pass' : r === 'near' ? 'near' : i === current ? 'now' : '';
      return `<span class="dot ${cls}"></span>`;
    }).join('');
    const near = results.filter((r) => r === 'near').length;
    $('progress').innerHTML = `<span>${this.t(STRINGS.hazards)}</span><span class="dots">${dots}</span><span>· ${near} ${this.t(STRINGS.near)}</span>`;
  }

  showPrompt(h, disabled, onChoose) {
    this.card.classList.remove("hidden");
    $("hint").classList.add("hidden");
    this.card.innerHTML = `
      <div class="eyebrow">${this.t(STRINGS.decide)}</div>
      <h2>${this.t(h.title)}</h2>
      <p>${this.t(h.situation)}</p>
      <div class="options">${h.options.map((o, i) => `<button class="opt" data-i="${i}" ${disabled.has(i) ? 'disabled' : ''}>${this.t(o)}</button>`).join('')}</div>`;
    this.card.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => onChoose(Number(b.dataset.i))));
  }
  showFeedback(h, correct, onNext) {
    this.card.classList.remove("hidden");
    $("hint").classList.add("hidden");
    this.card.innerHTML = `
      <span class="verdict ${correct ? 'ok' : 'bad'}">${this.t(correct ? STRINGS.passed : STRINGS.nearMiss)}</span>
      <h2>${this.t(h.title)}</h2>
      <p>${this.t(h.why)}</p>
      <div class="rule"><b>${h.rule.name}</b><br>${this.t(h.rule)}</div>
      <div class="actions"><button class="primary" id="card-next">${this.t(correct ? STRINGS.cont : STRINGS.retry)}</button></div>`;
    $('card-next').addEventListener('click', onNext);
  }
  hideCard() { this.card.classList.add("hidden"); $("hint").classList.remove("hidden"); }

  replayBanner(show, caption = '') {
    $('replay-banner').classList.toggle('hidden', !show);
    $('replay-caption').textContent = caption;
  }
  flash() { const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 160); }

  showEnd({ hazards, results, seconds }, onRestart) {
    const clean = results.filter((r) => r === 'pass').length;
    const near = results.length - clean;
    const rows = hazards.map((h, i) => `
      <div class="row ${results[i]}">
        <span class="ic">${results[i] === 'pass' ? '✓' : '!'}</span>
        <span>${this.t(h.title)}<small>${h.rule.name}</small></span>
        <span><small>${this.t(results[i] === 'pass' ? STRINGS.firstTry : STRINGS.replayed)}</small></span>
      </div>`).join('');
    const m = Math.floor(seconds / 60), s = Math.round(seconds % 60);
    $('overlay-end').innerHTML = `
      <div class="panel">
        <div class="eyebrow">K3 SIM · ${this.t(STRINGS.endTitle).toUpperCase()}</div>
        <div class="stat-row">
          <div class="score">${clean}<small>/${hazards.length} ${this.t(STRINGS.endScore)}</small></div>
          <div class="score" style="font-size:28px">${near}<small> ${this.t(STRINGS.endNear)}</small></div>
          <div class="score" style="font-size:28px">${m}:${String(s).padStart(2, '0')}<small> ${this.t(STRINGS.endTime)}</small></div>
        </div>
        <div class="report">${rows}</div>
        <p>${this.t(STRINGS.endLead)}</p>
        <button class="primary" id="restart">${this.t(STRINGS.restart)}</button>
      </div>`;
    $('overlay-end').classList.remove('hidden');
    $('restart').addEventListener('click', onRestart);
  }
  hideEnd() { $('overlay-end').classList.add('hidden'); }
}
