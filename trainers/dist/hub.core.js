/**
 * UNIVERSAL WEB GAME TRAINER HUB - CORE RUNTIME
 * Includes:
 * 1. Single Page Application (SPA) URL Watcher -> Auto destroy UI when leaving game
 * 2. Multi-tier Cross-Frame Bridge
 * 3. Flawless Anti-Stuck Universal Ad-Bypass (CrazyGames v1/v2/v3 + Poki)
 * 4. TasteSkill Swiss Cyberdeck Tactile HUD
 * 5. Game Registry & Dynamic Module Loader
 */
(function () {
  'use strict';

  // =========================================================================
  // 1. GAME REGISTRY
  // =========================================================================
  const GAME_REGISTRY = [
    {
      id: 'idle-zombie-wave',
      name: 'Zombie Wave',
      pattern: /idle-zombie-wave/i,
      version: 'v2.10',
      cheats: [
        { id: 'god', label: 'God Mode', key: 'NUM 1', code: 'Numpad1', type: 'toggle', cmd: 'GOD_MODE' },
        { id: 'ohk', label: 'One-Hit Kill', key: 'NUM 2', code: 'Numpad2', type: 'toggle', cmd: 'ONE_HIT_KILL' },
        { id: 'heal', label: 'Repair Wall', key: 'NUM 3', code: 'Numpad3', type: 'action', cmd: 'HEAL', btn: 'HEAL' },
        { id: 'scrap', label: '+5K Scrap', key: 'NUM 4', code: 'Numpad4', type: 'action', cmd: 'ADD_SCRAP', btn: '+5000', amount: 5000 },
        { id: 'speed', label: 'Timescale', key: 'F11', code: 'F11', type: 'speed', cmd: 'SET_SPEED' }
      ]
    }
    // Tambah game baru di sini di masa depan
  ];

  function matchGame(url) {
    for (const g of GAME_REGISTRY) {
      if (g.pattern.test(url)) return g;
    }
    return null;
  }

  // =========================================================================
  // 2. FLAWLESS ZERO-STUCK UNIVERSAL AD BYPASS HOOK
  // =========================================================================
  function hookAdSDKs() {
    const hookCG = () => {
      try {
        const adObj = window.CrazyGames?.SDK?.ad;
        if (adObj && !adObj.__hooked__) {
          adObj.__hooked__ = true;
          adObj.requestInProgress = false;
          adObj.adPlaying = false;

          adObj.requestAd = function (type, callbacks) {
            this.requestInProgress = true;
            this.adPlaying = true;
            if (window.audioController?.mute) {
              try { window.audioController.mute(); } catch (e) {}
            }

            return new Promise((resolve) => {
              setTimeout(() => {
                if (callbacks?.adStarted) {
                  try { callbacks.adStarted(); } catch (e) {}
                }
                setTimeout(() => {
                  this.adPlaying = false;
                  this.requestInProgress = false;
                  if (window.audioController?.unmute) {
                    try { window.audioController.unmute(); } catch (e) {}
                  }
                  if (callbacks?.adFinished) {
                    try { callbacks.adFinished(); } catch (e) {}
                  }
                  if (callbacks?.adCompleted) {
                    try { callbacks.adCompleted(); } catch (e) {}
                  }
                  resolve();
                }, 70);
              }, 15);
            });
          };

          adObj.hasAdblock = () => Promise.resolve(false);
          adObj.isAdPlaying = () => false;
        }

        if (window.Crazygames && !window.Crazygames.__hooked__) {
          window.Crazygames.__hooked__ = true;
          window.Crazygames.requestAd = function (type, callbacks) {
            return new Promise((resolve) => {
              setTimeout(() => {
                if (callbacks?.adStarted) callbacks.adStarted();
                setTimeout(() => {
                  if (typeof callbacks === 'function') callbacks();
                  else if (callbacks?.adFinished) callbacks.adFinished();
                  resolve();
                }, 70);
              }, 15);
            });
          };
        }
      } catch (e) {}
    };

    const hookPoki = () => {
      try {
        if (window.PokiSDK && !window.PokiSDK.__hooked__) {
          window.PokiSDK.__hooked__ = true;
          window.PokiSDK.commercialBreak = () => Promise.resolve();
          window.PokiSDK.rewardedBreak = () => new Promise((r) => setTimeout(() => r(true), 60));
        }
      } catch (e) {}
    };

    hookCG();
    hookPoki();
    let loops = 0;
    const t = setInterval(() => {
      hookCG();
      hookPoki();
      if (++loops > 20) clearInterval(t);
    }, 400);
  }

  hookAdSDKs();

  // =========================================================================
  // 3. FRAME TOPOLOGY IDENTIFICATION
  // =========================================================================
  const isTop = (window.top === window.self);
  const isGameCore = typeof window.CS !== 'undefined' || window.location.href.includes('game-files.crazygames.com');
  const isMiddle = !isTop && !isGameCore && window.location.href.includes('crazygames.com');

  // Tier 2 Relay
  if (isMiddle) {
    window.addEventListener('message', (e) => {
      if (e.data?.__TRAINER_BRIDGE__) {
        for (let i = 0; i < window.frames.length; i++) {
          try { window.frames[i].postMessage(e.data, '*'); } catch (err) {}
        }
      }
    });
    return;
  }

  // Tier 3 Core Executor
  if (isGameCore) {
    let speed = 1.0;
    window.addEventListener('message', (ev) => {
      if (!ev.data?.__TRAINER_BRIDGE__) return;
      const cmd = ev.data.cmd;
      const CS = window.CS;
      if (!CS) return;

      switch (cmd) {
        case 'GOD_MODE': {
          if (ev.data.val && CS.UIEventData_ToCSharp && CS.UIEventToCSharp?.AddSkill) {
            const evt = new CS.UIEventData_ToCSharp();
            evt.Command = CS.UIEventToCSharp.AddSkill;
            evt.Param1 = 12; // WUDI
            CS.UIDataTransfer.UIEvents.Add(evt);
            CS.UIDataTransfer.CurHp = CS.UIDataTransfer.MaxHp;
          }
          break;
        }
        case 'ONE_HIT_KILL': {
          if (ev.data.val && CS.UIEventData_ToCSharp && CS.UIEventToCSharp?.AddSkill) {
            const evt = new CS.UIEventData_ToCSharp();
            evt.Command = CS.UIEventToCSharp.AddSkill;
            evt.Param1 = 13; // MIAOGUAI
            CS.UIDataTransfer.UIEvents.Add(evt);
          }
          break;
        }
        case 'HEAL': {
          if (CS.UIDataTransfer) CS.UIDataTransfer.CurHp = CS.UIDataTransfer.MaxHp;
          if (CS.UIEventData_ToCSharp && CS.UIEventToCSharp?.AddHp) {
            const evt = new CS.UIEventData_ToCSharp();
            evt.Command = CS.UIEventToCSharp.AddHp;
            evt.Param1 = 9999999;
            CS.UIDataTransfer.UIEvents.Add(evt);
          }
          break;
        }
        case 'ADD_SCRAP': {
          const data = new CS.UIEventData_ToTS();
          data.Param1 = ev.data.amount || 5000;
          CS.JSManager.DispatchJSEvent(CS.JsEvent.PickMaterial, data);
          break;
        }
        case 'SET_SPEED': {
          speed = ev.data.speed || 1.0;
          if (CS.UnityEngine?.Time) CS.UnityEngine.Time.timeScale = speed;
          break;
        }
      }
    });
    return;
  }

  // =========================================================================
  // 4. TIER 1: TACTICAL HUD DENGAN LIFECYCLE CONTROLLER
  // =========================================================================
  if (!isTop) return;

  function broadcastCmd(cmd, payload = {}) {
    const msg = { __TRAINER_BRIDGE__: true, cmd, ...payload };
    for (let i = 0; i < window.frames.length; i++) {
      try { window.frames[i].postMessage(msg, '*'); } catch (e) {}
    }
  }

  let activeHUDInstance = null;

  class TacticalHUD {
    constructor(game) {
      this.game = game;
      this.speed = 1.0;
      this.container = null;
      this.shadow = null;
      this._keyHandler = null;
      this._render();
    }

    _render() {
      this.destroy(); // Bersihkan instance lama jika ada

      this.container = document.createElement('div');
      this.container.id = 'fl-tactical-deck';
      this.shadow = this.container.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = `
        :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
        * { box-sizing: border-box; user-select: none; margin: 0; padding: 0; }
        .hud-frame {
          position: fixed; top: 18px; right: 18px; width: 250px;
          background: #090a0d; border: 1px solid #1c202a; border-radius: 4px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -12px rgba(0,0,0,0.92);
          z-index: 2147483647; color: #8a919e; font-size: 11px;
        }
        .hud-frame.minimized .hud-body { display: none; }
        .hud-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px; background: #0e1117; border-bottom: 1px solid #161922; cursor: grab;
        }
        .hud-header:active { cursor: grabbing; }
        .meta { display: flex; align-items: center; gap: 6px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
        .title { font-family: ui-monospace, monospace; font-size: 10px; font-weight: 700; color: #f3f4f6; text-transform: uppercase; letter-spacing: 0.6px; }
        .ver { font-family: ui-monospace, monospace; font-size: 8.5px; color: #4b5563; }
        .ctrls { display: flex; gap: 2px; }
        .c-btn { background: transparent; border: none; color: #4b5563; width: 18px; height: 18px; cursor: pointer; border-radius: 2px; font-size: 10px; }
        .c-btn:hover { color: #fff; background: #1c202a; }
        .hud-body { padding: 8px; display: flex; flex-direction: column; gap: 5px; }
        .telemetry {
          display: flex; align-items: center; justify-content: space-between;
          padding: 4px 8px; background: #0a1118; border: 1px solid #0e2a22; border-radius: 3px;
          font-family: ui-monospace, monospace; font-size: 9px; color: #10b981;
        }
        .telemetry-left { display: flex; align-items: center; gap: 4px; }
        .pulse { width: 4px; height: 4px; border-radius: 50%; background: #10b981; }
        .row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 8px; background: #0f1218; border: 1px solid #161922; border-radius: 3px;
        }
        .row:hover { border-color: #262c3a; }
        .row-left { display: flex; align-items: center; gap: 7px; }
        .key {
          font-family: ui-monospace, monospace; font-size: 9px; font-weight: 700;
          color: #6b7280; background: #090a0d; border: 1px solid #1c202a;
          padding: 2px 4px; border-radius: 2px; min-width: 34px; text-align: center;
        }
        .lbl { font-size: 11px; font-weight: 500; color: #d1d5db; }
        .sw { position: relative; width: 28px; height: 14px; flex-shrink: 0; }
        .sw input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; inset: 0; cursor: pointer; background: #161922; border: 1px solid #262c3a; border-radius: 14px; transition: .15s; }
        .slider:before { position: absolute; content: ""; height: 8px; width: 8px; left: 2px; bottom: 2px; background: #4b5563; border-radius: 50%; transition: .15s; }
        input:checked + .slider { background: #064e3b; border-color: #059669; }
        input:checked + .slider:before { transform: translateX(14px); background: #10b981; }
        .act-btn {
          font-family: ui-monospace, monospace; font-size: 9px; font-weight: 700;
          color: #9ca3af; background: #141822; border: 1px solid #222736;
          padding: 3px 8px; border-radius: 2px; cursor: pointer;
        }
        .act-btn:hover { background: #1a202c; color: #fff; border-color: #374151; }
        .act-btn:active { transform: translateY(1px); }
        .hud-footer {
          padding: 5px 10px; background: #07080a; border-top: 1px solid #12151d;
          display: flex; justify-content: space-between; font-family: ui-monospace, monospace; font-size: 8.5px; color: #4b5563;
        }
      `;

      let cheatsHtml = '';
      for (const c of this.game.cheats) {
        cheatsHtml += `
          <div class="row">
            <div class="row-left">
              <span class="key">${c.key}</span>
              <span class="lbl">${c.label}</span>
            </div>
            ${
              c.type === 'toggle'
                ? `<label class="sw"><input type="checkbox" id="sw-${c.id}"><span class="slider"></span></label>`
                : c.type === 'speed'
                ? `<button class="act-btn" id="btn-${c.id}">1.0x</button>`
                : `<button class="act-btn" id="btn-${c.id}">${c.btn || 'Set'}</button>`
            }
          </div>
        `;
      }

      const html = `
        <div class="hud-frame" id="frame">
          <div class="hud-header" id="drag-handle">
            <div class="meta">
              <span class="dot"></span>
              <span class="title">${this.game.name}</span>
              <span class="ver">${this.game.version}</span>
            </div>
            <div class="ctrls">
              <button class="c-btn" id="b-min">_</button>
              <button class="c-btn" id="b-close">✕</button>
            </div>
          </div>
          <div class="hud-body">
            <div class="telemetry">
              <div class="telemetry-left"><span class="pulse"></span><span>AD BYPASS</span></div>
              <span style="color:#6b7280;">ENGAGED</span>
            </div>
            ${cheatsHtml}
          </div>
          <div class="hud-footer">
            <span>KEY: <b>INS</b></span>
            <span>FLiNG LAB</span>
          </div>
        </div>
      `;

      this.shadow.appendChild(style);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      this.shadow.appendChild(wrapper);
      document.body.appendChild(this.container);

      this._bind();
    }

    _bind() {
      // Bind controls
      for (const c of this.game.cheats) {
        if (c.type === 'toggle') {
          const sw = this.shadow.getElementById(`sw-${c.id}`);
          sw?.addEventListener('change', (e) => broadcastCmd(c.cmd, { val: e.target.checked }));
        } else if (c.type === 'speed') {
          const btn = this.shadow.getElementById(`btn-${c.id}`);
          btn?.addEventListener('click', () => {
            this.speed = this.speed === 1.0 ? 2.0 : (this.speed === 2.0 ? 5.0 : 1.0);
            broadcastCmd(c.cmd, { speed: this.speed });
            btn.textContent = `${this.speed.toFixed(1)}x`;
          });
        } else {
          const btn = this.shadow.getElementById(`btn-${c.id}`);
          btn?.addEventListener('click', () => broadcastCmd(c.cmd, { amount: c.amount }));
        }
      }

      const frame = this.shadow.getElementById('frame');
      this.shadow.getElementById('b-min')?.addEventListener('click', () => {
        frame.classList.toggle('minimized');
      });
      this.shadow.getElementById('b-close')?.addEventListener('click', () => {
        frame.style.display = 'none';
      });

      // Drag
      const handle = this.shadow.getElementById('drag-handle');
      let drag = false, sx, sy, initL, initT;
      handle?.addEventListener('mousedown', (e) => {
        if (e.target.closest('.ctrls')) return;
        drag = true;
        sx = e.clientX; sy = e.clientY;
        const rect = frame.getBoundingClientRect();
        initL = rect.left; initT = rect.top;

        const onMove = (ev) => {
          if (!drag) return;
          frame.style.left = `${initL + (ev.clientX - sx)}px`;
          frame.style.top = `${initT + (ev.clientY - sy)}px`;
          frame.style.right = 'auto';
        };
        const onUp = () => {
          drag = false;
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });

      // Hotkey listener
      this._keyHandler = (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        if (e.key === 'Insert') {
          frame.style.display = frame.style.display === 'none' ? 'block' : 'none';
          return;
        }
        for (const c of this.game.cheats) {
          if (c.code && e.code === c.code) {
            if (c.type === 'toggle') {
              const sw = this.shadow.getElementById(`sw-${c.id}`);
              if (sw) { sw.checked = !sw.checked; sw.dispatchEvent(new Event('change')); }
            } else {
              this.shadow.getElementById(`btn-${c.id}`)?.click();
            }
            break;
          }
        }
      };
      window.addEventListener('keydown', this._keyHandler);
    }

    destroy() {
      if (this._keyHandler) {
        window.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = null;
      }
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.container = null;
      this.shadow = null;
    }
  }

  // =========================================================================
  // 5. SINGLE PAGE APPLICATION (SPA) NAVIGATION WATCHER
  // Otomatis destroy panel jika pindah game atau bukan halaman game terdaftar!
  // =========================================================================
  let lastEvaluatedUrl = '';

  function handleNavigationChange() {
    const currentUrl = window.location.href;
    if (currentUrl === lastEvaluatedUrl) return;
    lastEvaluatedUrl = currentUrl;

    const game = matchGame(currentUrl);

    if (game) {
      // Jika berada di game yang didukung
      if (!activeHUDInstance || activeHUDInstance.game.id !== game.id) {
        if (activeHUDInstance) activeHUDInstance.destroy();
        activeHUDInstance = new TacticalHUD(game);
        console.log(`[Trainer Hub] Active profile: ${game.name}`);
      }
    } else {
      // Jika pindah ke game lain atau ke beranda (BUKAN game terdaftar)
      if (activeHUDInstance) {
        activeHUDInstance.destroy();
        activeHUDInstance = null;
        console.log('[Trainer Hub] Navigated away from supported game. HUD destroyed.');
      }
    }
  }

  // Intercept HTML5 History API (Next.js router.push / pushState / replaceState)
  const originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    handleNavigationChange();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    handleNavigationChange();
  };

  window.addEventListener('popstate', handleNavigationChange);

  // Polling URL observer untuk mendeteksi perubahan dinamis
  setInterval(handleNavigationChange, 500);

  // Initial check saat halaman pertama kali load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleNavigationChange);
  } else {
    handleNavigationChange();
  }
})();
