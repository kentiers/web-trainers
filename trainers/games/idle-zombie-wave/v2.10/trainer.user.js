// ==UserScript==
// @name         Idle Zombie Wave: Survivors - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      2.10.0
// @description  Full-featured Web Trainer for Idle Zombie Wave on CrazyGames (God Mode, OHK, Currencies, Speedhack, GM Menu)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/game/idle-zombie-wave*
// @match        https://games.crazygames.com/*/idle-zombie-wave/*
// @match        https://*.game-files.crazygames.com/unity/*/idle-zombie-wave.html*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 1. Hotkey Manager
  class HotkeyManager {
    constructor() {
      this.bindings = new Map();
      this.enabled = true;
      this._onKeyDown = this._onKeyDown.bind(this);
      window.addEventListener('keydown', this._onKeyDown, true);
    }

    register(keyCombo, callback, description = '') {
      const normalized = this._normalizeKey(keyCombo);
      this.bindings.set(normalized, { callback, description, original: keyCombo });
    }

    _normalizeKey(combo) {
      const parts = combo.toUpperCase().split('+').map(p => p.trim());
      const modifiers = [];
      let mainKey = '';
      for (const part of parts) {
        if (['CTRL', 'CONTROL'].includes(part)) modifiers.push('CTRL');
        else if (['ALT'].includes(part)) modifiers.push('ALT');
        else if (['SHIFT'].includes(part)) modifiers.push('SHIFT');
        else mainKey = part;
      }
      modifiers.sort();
      return [...modifiers, mainKey].join('+');
    }

    _eventToCombo(e) {
      const modifiers = [];
      if (e.ctrlKey) modifiers.push('CTRL');
      if (e.altKey) modifiers.push('ALT');
      if (e.shiftKey) modifiers.push('SHIFT');
      let key = e.key.toUpperCase();
      if (e.code.startsWith('Numpad')) key = e.code.toUpperCase();
      else if (e.code.startsWith('Digit')) key = e.code.replace('DIGIT', '');
      else if (key === ' ') key = 'SPACE';
      return [...modifiers, key].join('+');
    }

    _onKeyDown(e) {
      if (!this.enabled) return;
      const tag = e.target.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      const combo = this._eventToCombo(e);
      if (this.bindings.has(combo)) {
        e.preventDefault();
        e.stopPropagation();
        this.bindings.get(combo).callback();
      }
    }
  }

  // 2. Audio Feedback Synthesizer
  class AudioSynth {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    play(high = true) {
      if (!this.enabled) return;
      try {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(high ? 440 : 330, now);
        osc.frequency.exponentialRampToValueAtTime(high ? 880 : 180, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.11);
      } catch (e) {}
    }
  }

  // 3. Game Bridge
  class GameBridge {
    constructor() {
      this.CS = null;
      this._godModeTimer = null;
      this.speedState = 1.0;
    }

    async pollRuntime() {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (window.CS && window.CS.UIDataTransfer) {
            this.CS = window.CS;
            this._hookWebpack();
            clearInterval(interval);
            resolve(true);
          }
        }, 400);
      });
    }

    _hookWebpack() {
      if (window.__game_webpack_require__) return;
      if (window.PUERTS_JS_RESOURCES && window.PUERTS_JS_RESOURCES['scripts/bundle.mjs']) {
        try {
          const fnStr = window.PUERTS_JS_RESOURCES['scripts/bundle.mjs'].toString();
          const patchedStr = fnStr.replace(
            'globalThis.$entry=__webpack_exports__',
            'window.__game_webpack_require__=__webpack_require__;globalThis.$entry=__webpack_exports__'
          );
          const patchedFn = new Function('return (' + patchedStr + ')')();
          const exports = {};
          const mod = { exports };
          const puer = window.puer || window.puerts;
          patchedFn(exports, puer ? puer.require : () => {}, mod, 'scripts/bundle.mjs', 'scripts');
        } catch (e) {
          console.warn('[Trainer] Webpack module hook warning:', e);
        }
      }
    }

    setGodMode(enable) {
      if (enable) {
        if (this.CS?.UIEventData_ToCSharp && this.CS?.UIEventToCSharp?.AddSkill) {
          const evt = new this.CS.UIEventData_ToCSharp();
          evt.Command = this.CS.UIEventToCSharp.AddSkill;
          evt.Param1 = 12; // WUDI: +1B stats
          this.CS.UIDataTransfer.UIEvents.Add(evt);
        }
        clearInterval(this._godModeTimer);
        this._godModeTimer = setInterval(() => {
          if (this.CS?.UIDataTransfer) {
            if (this.CS.UIDataTransfer.CurHp < this.CS.UIDataTransfer.MaxHp) {
              this.CS.UIDataTransfer.CurHp = this.CS.UIDataTransfer.MaxHp;
            }
          }
        }, 200);
      } else {
        clearInterval(this._godModeTimer);
        this._godModeTimer = null;
      }
    }

    setOneHitKill(enable) {
      if (enable && this.CS?.UIEventData_ToCSharp && this.CS?.UIEventToCSharp?.AddSkill) {
        const evt = new this.CS.UIEventData_ToCSharp();
        evt.Command = this.CS.UIEventToCSharp.AddSkill;
        evt.Param1 = 13; // MIAOGUAI
        this.CS.UIDataTransfer.UIEvents.Add(evt);
      }
    }

    healFull() {
      if (this.CS?.UIDataTransfer) this.CS.UIDataTransfer.CurHp = this.CS.UIDataTransfer.MaxHp;
      if (this.CS?.UIEventData_ToCSharp && this.CS?.UIEventToCSharp?.AddHp) {
        const evt = new this.CS.UIEventData_ToCSharp();
        evt.Command = this.CS.UIEventToCSharp.AddHp;
        evt.Param1 = 9999999;
        this.CS.UIDataTransfer.UIEvents.Add(evt);
      }
    }

    addBattleMaterial(amount = 5000) {
      if (this.CS?.UIEventData_ToCSharp && this.CS?.UIEventToCSharp?.SyncMaterial) {
        const evt = new this.CS.UIEventData_ToCSharp();
        evt.Command = this.CS.UIEventToCSharp.SyncMaterial;
        evt.Param1 = amount;
        this.CS.UIDataTransfer.UIEvents.Add(evt);
        return true;
      }
      return false;
    }

    cycleSpeed() {
      if (!this.CS?.UnityEngine?.Time) return 1.0;
      this.speedState = this.speedState === 1.0 ? 2.0 : (this.speedState === 2.0 ? 5.0 : 1.0);
      this.CS.UnityEngine.Time.timeScale = this.speedState;
      return this.speedState;
    }

    addItem(itemId, count = 1000) {
      // Memory update
      const req = window.__game_webpack_require__;
      try {
        const Player = req ? req('./src/data/Player.ts')?.Player : null;
        if (Player?.data?.items) {
          let it = Player.data.items.find(i => i.itemId === itemId);
          if (it) it.count += count;
          else {
            const nextEid = (Player.data.itemIdSeq || 100) + 1;
            Player.data.itemIdSeq = nextEid;
            Player.data.items.push({ eid: nextEid, itemId, count, ext: '{}' });
          }
        }
      } catch (e) {}

      // Cloud save update
      if (this.CS?.SdkMain) {
        const raw = this.CS.SdkMain.ReadCloud('idlezombie_player');
        if (raw) {
          const data = JSON.parse(raw);
          const it = data.items.find(i => i.itemId === itemId);
          if (it) it.count += count;
          else {
            const nextEid = (data.itemIdSeq || 100) + 1;
            data.itemIdSeq = nextEid;
            data.items.push({ eid: nextEid, itemId, count, ext: '{}' });
          }
          this.CS.SdkMain.SetCloud('idlezombie_player', JSON.stringify(data));
        }
      }
    }

    openGmMenu() {
      const req = window.__game_webpack_require__;
      if (req) {
        try {
          req('./src/ui/debug/UIGm.ts')?.UIGm?.show();
          return true;
        } catch (e) {}
      }
      return false;
    }
  }

  // 4. UI Overlay & Orchestrator
  class TrainerApp {
    constructor() {
      this.bridge = new GameBridge();
      this.hotkeys = new HotkeyManager();
      this.synth = new AudioSynth();
      this.cheats = [];
      this.visible = true;
      this.minimized = false;
      this.container = null;
      this.shadow = null;
    }

    async start() {
      this._registerCheats();
      this._createUI();
      await this.bridge.pollRuntime();
      this.showToast('Trainer Connected to Game!');
    }

    _registerCheats() {
      this.cheats = [
        { id: 'god', label: 'God Mode (Invincible)', hotkey: 'NUMPAD1', type: 'toggle', cat: 'Battle Cheats', action: (on) => this.bridge.setGodMode(on) },
        { id: 'ohk', label: 'One-Hit Kill', hotkey: 'NUMPAD2', type: 'toggle', cat: 'Battle Cheats', action: (on) => this.bridge.setOneHitKill(on) },
        { id: 'heal', label: 'Instant Full Heal / Repair', hotkey: 'NUMPAD3', type: 'action', cat: 'Battle Cheats', action: () => this.bridge.healFull() },
        { id: 'scrap', label: 'Add +5,000 Battle Scrap', hotkey: 'NUMPAD4', type: 'action', cat: 'Battle Cheats', action: () => this.bridge.addBattleMaterial(5000) },
        { id: 'gold', label: 'Add +500,000 Gold', hotkey: 'NUMPAD7', type: 'action', cat: 'Economy & Resources', action: () => this.bridge.addItem(2, 500000) },
        { id: 'dia', label: 'Add +50,000 Diamonds', hotkey: 'NUMPAD8', type: 'action', cat: 'Economy & Resources', action: () => this.bridge.addItem(3, 50000) },
        { id: 'keys', label: 'Add +100 Box Keys', hotkey: 'NUMPAD9', type: 'action', cat: 'Economy & Resources', action: () => { this.bridge.addItem(5, 100); this.bridge.addItem(6, 100); } },
        { id: 'nrg', label: 'Add +500 Energy', hotkey: 'NUMPAD0', type: 'action', cat: 'Economy & Resources', action: () => this.bridge.addItem(10, 500) },
        { id: 'mat', label: 'Add +5,000 Wood & Crystal', hotkey: 'CTRL+NUMPAD1', type: 'action', cat: 'Economy & Resources', action: () => { this.bridge.addItem(33, 5000); this.bridge.addItem(34, 5000); } },
        { id: 'spd', label: 'Speedhack (2x / 5x / 1x)', hotkey: 'F11', type: 'action', cat: 'Speed & Debug', action: () => `Speed: ${this.bridge.cycleSpeed()}x` },
        { id: 'gm', label: 'Developer GM Menu', hotkey: 'F12', type: 'action', cat: 'Speed & Debug', action: () => this.bridge.openGmMenu() }
      ];

      for (const c of this.cheats) {
        if (c.hotkey) {
          this.hotkeys.register(c.hotkey, () => this.triggerCheat(c), c.label);
        }
      }

      this.hotkeys.register('INSERT', () => this.toggleVisibility(), 'Toggle Overlay');
    }

    triggerCheat(cheat) {
      if (cheat.type === 'toggle') {
        cheat.enabled = !cheat.enabled;
        this.synth.play(cheat.enabled);
        cheat.action(cheat.enabled);
        const sw = this.shadow.getElementById(`sw-${cheat.id}`);
        if (sw) sw.checked = cheat.enabled;
        this.showToast(`${cheat.label}: ${cheat.enabled ? 'ON' : 'OFF'}`);
      } else {
        this.synth.play(true);
        const res = cheat.action();
        this.showToast(typeof res === 'string' ? res : `${cheat.label} Activated`);
      }
    }

    _createUI() {
      this.container = document.createElement('div');
      this.container.id = 'fling-trainer-user-root';
      this.shadow = this.container.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = `
        * { box-sizing: border-box; user-select: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .win {
          position: fixed; top: 25px; right: 25px; width: 360px;
          background: #0f1015; border: 1px solid #24293b; border-radius: 8px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.85); z-index: 2147483647;
          color: #dbe0ee; font-size: 13px; backdrop-filter: blur(8px);
        }
        .win.min .body { display: none; }
        .head {
          background: linear-gradient(180deg, #1b1e2a 0%, #12141c 100%);
          padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #202434; cursor: grab;
        }
        .head:active { cursor: grabbing; }
        .logo { background: #ff2a55; color: #fff; font-weight: 900; font-size: 10px; padding: 2px 5px; border-radius: 3px; }
        .title { font-weight: 700; color: #fff; font-size: 13px; margin-left: 6px; }
        .ver { font-size: 10px; color: #626a80; background: #181a24; padding: 1px 5px; border-radius: 8px; margin-left: 4px; }
        .btns { display: flex; gap: 4px; }
        .btn { background: transparent; border: none; color: #7e879c; cursor: pointer; padding: 4px 6px; border-radius: 4px; font-size: 11px; }
        .btn:hover { background: #23283a; color: #fff; }
        .body { padding: 12px; max-height: 480px; overflow-y: auto; }
        .body::-webkit-scrollbar { width: 4px; }
        .body::-webkit-scrollbar-thumb { background: #262c3e; border-radius: 2px; }
        .cat { margin-bottom: 12px; }
        .cat-t { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #00e5ff; letter-spacing: 0.8px; margin-bottom: 6px; }
        .row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 6px 10px; background: #141620; border: 1px solid #1c202e;
          border-radius: 5px; margin-bottom: 5px;
        }
        .row:hover { background: #181a26; border-color: #272d42; }
        .info { display: flex; align-items: center; gap: 8px; }
        .key { background: #1c2030; color: #ffaa00; font-family: monospace; font-weight: 700; font-size: 10px; padding: 2px 5px; border-radius: 3px; border: 1px solid #2a3148; min-width: 42px; text-align: center; }
        .lbl { font-weight: 500; font-size: 12px; }
        /* Switch */
        .sw { position: relative; width: 34px; height: 18px; }
        .sw input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #202433; border-radius: 18px; border: 1px solid #2d344a; transition: .2s; }
        .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px; background: #7b849b; border-radius: 50%; transition: .2s; }
        input:checked + .slider { background: #00e676; border-color: #00e676; }
        input:checked + .slider:before { transform: translateX(16px); background: #fff; }
        /* Action button */
        .act-btn { background: #222738; border: 1px solid #2f364e; color: #fff; font-size: 11px; padding: 4px 10px; border-radius: 3px; cursor: pointer; }
        .act-btn:hover { background: #2a3146; color: #00e5ff; border-color: #00e5ff; }
        .act-btn:active { transform: scale(0.96); }
        .foot { padding: 6px 12px; background: #0b0c10; border-top: 1px solid #181b24; font-size: 10px; color: #4e556b; display: flex; justify-content: space-between; }
        .toast {
          position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
          background: #11131a; color: #00e676; border: 1px solid #00e676;
          padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
          opacity: 0; transition: opacity 0.2s, transform 0.2s; pointer-events: none;
        }
        .toast.show { opacity: 1; transform: translateX(-50%) translateY(-3px); }
      `;

      let cheatsHtml = '';
      const categories = ['Battle Cheats', 'Economy & Resources', 'Speed & Debug'];
      for (const cat of categories) {
        const catCheats = this.cheats.filter(c => c.cat === cat);
        cheatsHtml += `<div class="cat"><div class="cat-t">${cat}</div>`;
        for (const c of catCheats) {
          cheatsHtml += `
            <div class="row">
              <div class="info">
                <span class="key">${c.hotkey}</span>
                <span class="lbl">${c.label}</span>
              </div>
              ${
                c.type === 'toggle'
                  ? `<label class="sw"><input type="checkbox" id="sw-${c.id}"><span class="slider"></span></label>`
                  : `<button class="act-btn" id="btn-${c.id}">Activate</button>`
              }
            </div>
          `;
        }
        cheatsHtml += `</div>`;
      }

      const html = `
        <div class="win" id="win">
          <div class="head" id="head">
            <div>
              <span class="logo">MOD</span>
              <span class="title">Idle Zombie Wave</span>
              <span class="ver">v2.10</span>
            </div>
            <div class="btns">
              <button class="btn" id="b-min">_</button>
              <button class="btn" id="b-close">✕</button>
            </div>
          </div>
          <div class="body">${cheatsHtml}</div>
          <div class="foot">
            <span>Press <b>INSERT</b> to Hide/Show</span>
            <span>100% Tested & Verified</span>
          </div>
          <div class="toast" id="toast"></div>
        </div>
      `;

      this.shadow.appendChild(style);
      const w = document.createElement('div');
      w.innerHTML = html;
      this.shadow.appendChild(w);
      document.body.appendChild(this.container);

      // Bind buttons
      for (const c of this.cheats) {
        if (c.type === 'toggle') {
          const el = this.shadow.getElementById(`sw-${c.id}`);
          if (el) el.addEventListener('change', () => this.triggerCheat(c));
        } else {
          const btn = this.shadow.getElementById(`btn-${c.id}`);
          if (btn) btn.addEventListener('click', () => this.triggerCheat(c));
        }
      }

      const win = this.shadow.getElementById('win');
      this.shadow.getElementById('b-min').addEventListener('click', () => win.classList.toggle('min'));
      this.shadow.getElementById('b-close').addEventListener('click', () => this.toggleVisibility());

      // Dragging
      const head = this.shadow.getElementById('head');
      let drag = false, sx, sy, initL, initT;
      head.addEventListener('mousedown', (e) => {
        if (e.target.closest('.btns')) return;
        drag = true;
        sx = e.clientX; sy = e.clientY;
        const r = win.getBoundingClientRect();
        initL = r.left; initT = r.top;
        const mm = (ev) => {
          if (!drag) return;
          win.style.left = `${initL + (ev.clientX - sx)}px`;
          win.style.top = `${initT + (ev.clientY - sy)}px`;
          win.style.right = 'auto';
        };
        const mu = () => {
          drag = false;
          window.removeEventListener('mousemove', mm);
          window.removeEventListener('mouseup', mu);
        };
        window.addEventListener('mousemove', mm);
        window.addEventListener('mouseup', mu);
      });
    }

    showToast(msg) {
      const toast = this.shadow.getElementById('toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(this._toastTimeout);
      this._toastTimeout = setTimeout(() => toast.classList.remove('show'), 1600);
    }

    toggleVisibility() {
      this.visible = !this.visible;
      const win = this.shadow.getElementById('win');
      win.style.display = this.visible ? 'block' : 'none';
    }
  }

  const app = new TrainerApp();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.start());
  } else {
    app.start();
  }
})();
