/* diorama-switch · 一间房，一枚开关
   Copyright (C) 2026 Robincheng34

   本程序是自由软件：你可以依据自由软件基金会发布的 GNU 通用公共许可证
   第三版（或任何更新版本）的条款重新分发和/或修改它。完整条款见 LICENSE。
*/
/* ============================================================
   <diorama-switch> —— 一枚装着房间的开关
   ------------------------------------------------------------
   <diorama-switch room="cyber" height="260" value="0.3"></diorama-switch>

   · 引入本文件即注册元素，并从 ./rooms/index.js 注册全部八间房；
     只要其中一间时，改成只 import 那个房间文件即可。
   · 昼夜由单一进度变量 --p 驱动：0 = 06:40 清晨，1 = 22:15 深夜。
   · 球是液态的：速度驱动一条弹簧，拖动时拉长、按下压扁、松手果冻回弹。
   ============================================================ */

import { getRoom, ROOMS } from './rooms/index.js';

const CSS_URL = new URL('./diorama-switch.css', import.meta.url).href;

class DioramaSwitch extends HTMLElement {
  static get observedAttributes(){ return ['room', 'height', 'value']; }

  constructor(){
    super();
    this._p = null;          /* 内部进度，null = 未初始化 */
    this._raf = 0;
    this._drag = null;
    this._L = { q:0, qv:0, pr:0, prv:0, target:0, v:0, lx:0, lt:0, t:0, raf:0 };
  }

  /* ---------- 生命周期 ---------- */
  connectedCallback(){
    if (!this._built) this._build();
    this._applyAttr('room'); this._applyAttr('height');
    if (this._p === null) this._p = this._num(this.getAttribute('value'), 0);
    this._paint();
  }

  disconnectedCallback(){
    cancelAnimationFrame(this._raf);
    cancelAnimationFrame(this._L.raf);
  }

  attributeChangedCallback(name, oldV, newV){
    if (oldV === newV) return;
    if (name === 'value' && this._drag) return;      /* 拖动中不让外部值打断 */
    this._applyAttr(name);
    if (name === 'value' && this._built) this._set(this._num(newV, this._p || 0), true);
  }

  /* ---------- 公开 API ---------- */
  get value(){ return this._p ?? 0; }
  set value(v){ this._set(this._num(v, 0), true); }
  get room(){ return this.getAttribute('room') || 'work'; }
  set room(id){ this.setAttribute('room', id); }

  /* 平滑拨到某个值；duration 毫秒 */
  animateTo(to, duration = 640){
    const target = Math.max(0, Math.min(1, to));
    cancelAnimationFrame(this._raf);
    if (this._reduce()){ this._set(target); return; }
    const from = this._p, t0 = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - t0) / duration);
      this._set(from + (target - from) * (1 - Math.pow(1 - t, 4.2)));  /* 先快后慢，落点带惯性 */
      if (t < 1) this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }
  /* 切换开关 */
  toggle(){ this.animateTo(this._p > .5 ? 0 : 1); }

  /* ---------- 内部 ---------- */
  _num(v, dflt){ const n = parseFloat(v); return Number.isFinite(n) ? n : dflt; }
  _reduce(){ return matchMedia('(prefers-reduced-motion: reduce)').matches; }

  _applyAttr(name){
    if (!this._built) return;
    if (name === 'room'){
      const r = getRoom(this.room) || ROOMS[0];
      this._sw.style.setProperty('--room', `url("${r.image}")`);
      this._sw.style.setProperty('--gx', r.gx);
      this._sw.style.setProperty('--gy', r.gy);
      this._sw.style.setProperty('--wx', r.wx);
      this._sw.style.setProperty('--wy', r.wy);
      if (r.accent) this.style.setProperty('--accent', r.accent);
      this.dataset.roomName = r.name;
      this.dataset.roomSpec = r.spec || '';
    }
    if (name === 'height'){
      const h = this._num(this.getAttribute('height'), 0);
      if (h > 0) this.style.setProperty('--h', h + 'px');
    }
  }

  _build(){
    this._built = true;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      ${CSS_URL
        ? `<link rel="stylesheet" href="${CSS_URL}">`
        : `<style>${(window.__DIORAMA_CSS__ || '')}</style>`}
      <div class="sw" part="switch" role="switch" aria-checked="false" tabindex="0">
        <span class="sw-shell" part="shell"></span>
        <span class="sw-step" part="step"></span>
        <span class="sw-lens" part="lens">
          <span class="sw-room"></span>
          <span class="sw-dusk"></span>
          <span class="sw-lamp"></span>
          <span class="sw-sheen"></span>
        </span>
        <span class="sw-ball" part="ball"></span>
      </div>`;
    this._sw = root.querySelector('.sw');
    this._bind();
  }

  _set(v, silent){
    const n = Math.max(0, Math.min(1, v));
    if (n === this._p) return;
    this._p = n;
    if (!silent) this.setAttribute('value', n.toFixed(3));
    this._paint();
  }

  _paint(){
    if (!this._built || this._p === null) return;
    this._sw.style.setProperty('--p', this._p.toFixed(4));
    const on = this._p > .5;
    this._sw.setAttribute('aria-checked', on ? 'true' : 'false');
    this._sw.classList.toggle('is-on', on);
    this.setAttribute('data-state', on ? 'night' : 'day');
    this.dispatchEvent(new CustomEvent('diorama-change', {
      detail: { value: this._p, room: this.room, on }, bubbles: true
    }));
  }

  /* ---------- 液态弹簧 ---------- */
  _lKick(){
    const L = this._L;
    if (this._reduce() || L.raf) return;
    L.t = 0; L.raf = requestAnimationFrame(now => this._lFrame(now));
  }
  _lFrame(now){
    const L = this._L, dt = L.t ? Math.min(.034, (now - L.t) / 1000) : .016;
    L.t = now;
    L.qv += ((L.target - L.q) * 300 - L.qv * 11) * dt;
    L.q  += L.qv * dt;
    const pt = this._drag ? 1 : 0;
    L.prv += ((pt - L.pr) * 420 - L.prv * 21) * dt;
    L.pr += L.prv * dt;
    this._sw.style.setProperty('--q', L.q.toFixed(4));
    this._sw.style.setProperty('--pr', Math.max(0, L.pr).toFixed(4));
    const busy = this._drag || Math.abs(L.q) > .0006 || Math.abs(L.qv) > .004
              || Math.abs(L.pr - pt) > .002 || Math.abs(L.prv) > .02;
    if (busy) L.raf = requestAnimationFrame(n => this._lFrame(n));
    else {
      L.raf = 0;
      this._sw.style.setProperty('--q', '0');
      this._sw.style.setProperty('--pr', pt.toFixed(3));
    }
  }
  /* 松手/点击给球一记冲量，让它果冻式回弹 */
  _lSquirt(v){
    const L = this._L;
    if (this._reduce()) return;
    L.target = 0;
    L.qv += Math.max(-4, Math.min(4, v));
    L.prv -= 1.2;
    this._lKick();
  }

  /* ---------- 交互 ---------- */
  _bind(){
    const sw = this._sw, L = this._L;

    sw.addEventListener('pointerdown', e => {
      if (this.hasAttribute('disabled')) return;
      cancelAnimationFrame(this._raf);
      sw.setPointerCapture(e.pointerId);
      const r = sw.getBoundingClientRect();
      const pad = r.height * .045, d = r.height * .82;
      this._drag = {
        x: e.clientX, p0: this._p, moved: false,
        travel: Math.max(1, r.width - pad * 2 - d)
      };
      L.lx = e.clientX; L.lt = performance.now(); L.v = 0; L.target = 0;
      this._lKick();
    });

    sw.addEventListener('pointermove', e => {
      const g = this._drag; if (!g) return;
      const dx = e.clientX - g.x;
      const now = performance.now(), dt = Math.max(8, now - L.lt);
      L.v = L.v * .55 + ((e.clientX - L.lx) / dt) * .45;   /* px/ms */
      L.lx = e.clientX; L.lt = now;
      L.target = Math.min(.36, Math.abs(L.v) * .40);        /* 越快，水滴越长 */
      if (Math.abs(dx) > 4) g.moved = true;
      if (g.moved) this._set(g.p0 + dx / g.travel);
      this._lKick();
    });

    const end = () => {
      const g = this._drag; this._drag = null;
      if (!g) return;
      this._lSquirt(L.v * 2.4);
      if (!g.moved) this.animateTo(this._p > .5 ? 0 : 1);
      else this.animateTo(this._p > .5 ? 1 : 0, 420);
    };
    sw.addEventListener('pointerup', end);
    sw.addEventListener('pointercancel', () => { this._drag = null; this._lSquirt(0); });

    sw.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); this.toggle(); }
      else if (e.key === 'ArrowRight'){ e.preventDefault(); this.animateTo(Math.min(1, this._p + .08), 200); }
      else if (e.key === 'ArrowLeft'){ e.preventDefault(); this.animateTo(Math.max(0, this._p - .08), 200); }
    });
    /* 键盘/触摸产生的合成点击兜底（指针点击已由 pointerup 处理） */
    sw.addEventListener('click', e => {
      if (e.detail === 0 && !this.hasAttribute('disabled')) this.toggle();
    });
  }
}

if (!customElements.get('diorama-switch')){
  customElements.define('diorama-switch', DioramaSwitch);
}

export { DioramaSwitch };
export { ROOMS, getRoom };
export default DioramaSwitch;
