// ==UserScript==
// @name         Universal Web Game Trainer Hub (FLiNG Style)
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      2.1.0
// @description  Precision Engineered Web Game Trainer Hub (Flawless Anti-Stuck Ad Bypass, Zero-Leak, Tactile Cyberdeck)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/*
// @match        https://games.crazygames.com/*
// @match        https://*.game-files.crazygames.com/*
// @match        https://poki.com/*
// @match        https://*.poki.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // =========================================================================
  // 1. FLAWLESS ZERO-STUCK AD REWARD HOOK (UNIVERSAL)
  // Memperbaiki state machine SDK (requestInProgress & adPlaying) agar tombol
  // reward ad tidak pernah macet / stuck meskipun diklik berkali-kali!
  // =========================================================================
  function hookGlobalAdSDKs() {
    // A. CrazyGames SDK v3 (window.CrazyGames.SDK.ad.requestAd)
    const interceptCrazyGamesV3 = () => {
      try {
        const adObj = window.CrazyGames?.SDK?.ad;
        if (adObj && !adObj.__hooked__) {
          adObj.__hooked__ = true;

          // Force reset flags
          adObj.requestInProgress = false;
          adObj.adPlaying = false;

          adObj.requestAd = function (type, callbacks) {
            // 1. Mark states in progress
            this.requestInProgress = true;
            this.adPlaying = true;
            if (window.audioController?.mute) {
              try { window.audioController.mute(); } catch (e) {}
            }

            return new Promise((resolve) => {
              // Micro-step 1: Trigger adStarted
              setTimeout(() => {
                if (callbacks && typeof callbacks.adStarted === 'function') {
                  try { callbacks.adStarted(); } catch (e) {}
                }

                // Micro-step 2: Trigger adFinished, reset states, & unmute audio
                setTimeout(() => {
                  this.adPlaying = false;
                  this.requestInProgress = false;

                  if (window.audioController?.unmute) {
                    try { window.audioController.unmute(); } catch (e) {}
                  }

                  if (callbacks) {
                    if (typeof callbacks.adFinished === 'function') {
                      try { callbacks.adFinished(); } catch (e) {}
                    }
                    if (typeof callbacks.adCompleted === 'function') {
                      try { callbacks.adCompleted(); } catch (e) {}
                    }
                  }
                  resolve();
                }, 70);
              }, 15);
            });
          };

          adObj.hasAdblock = () => Promise.resolve(false);
          adObj.isAdPlaying = () => false;
        }
      } catch (e) {}
    };

    // B. CrazyGames SDK v2 (window.Crazygames.requestAd)
    const interceptCrazyGamesV2 = () => {
      try {
        if (window.Crazygames && !window.Crazygames.__hooked__) {
          window.Crazygames.__hooked__ = true;
          window.Crazygames.requestAd = function (type, callbacks) {
            return new Promise((resolve) => {
              setTimeout(() => {
                if (callbacks && typeof callbacks.adStarted === 'function') {
                  try { callbacks.adStarted(); } catch (e) {}
                }
                setTimeout(() => {
                  if (typeof callbacks === 'function') {
                    try { callbacks(); } catch (e) {}
                  } else if (callbacks) {
                    if (typeof callbacks.adFinished === 'function') {
                      try { callbacks.adFinished(); } catch (e) {}
                    }
                  }
                  resolve();
                }, 70);
              }, 15);
            });
          };
        }
      } catch (e) {}
    };

    // C. Poki SDK (window.PokiSDK)
    const interceptPoki = () => {
      try {
        if (window.PokiSDK && !window.PokiSDK.__hooked__) {
          window.PokiSDK.__hooked__ = true;
          window.PokiSDK.commercialBreak = () => Promise.resolve();
          window.PokiSDK.rewardedBreak = () => new Promise(resolve => setTimeout(() => resolve(true), 60));
        }
      } catch (e) {}
    };

    interceptCrazyGamesV3();
    interceptCrazyGamesV2();
    interceptPoki();

    let count = 0;
    const interval = setInterval(() => {
      interceptCrazyGamesV3();
      interceptCrazyGamesV2();
      interceptPoki();
      count++;
      if (count > 25) clearInterval(interval);
    }, 400);
  }

  hookGlobalAdSDKs();

  // =========================================================================
  // 2. FRAME TOPOLOGY ROUTER
  // =========================================================================
  const isTopWindow = (window.top === window.self);
  const isGameCoreFrame = typeof window.CS !== 'undefined' || window.location.href.includes('game-files.crazygames.com');
  const isMiddleFrame = !isTopWindow && !isGameCoreFrame && window.location.href.includes('crazygames.com');

  // Tier 2 Forwarder (Transparent Relay)
  if (isMiddleFrame) {
    window.addEventListener('message', (e) => {
      if (e.data && e.data.__TRAINER_BRIDGE__) {
        for (let i = 0; i < window.frames.length; i++) {
          try { window.frames[i].postMessage(e.data, '*'); } catch (err) {}
        }
      }
    });
    return;
  }

  // Tier 3 Core Executor (Zero Memory Leak, Direct C# Memory Manipulation)
  if (isGameCoreFrame) {
    let speedState = 1.0;

    window.addEventListener('message', (ev) => {
      if (!ev.data || !ev.data.__TRAINER_BRIDGE__) return;
      const cmd = ev.data.cmd;
      const CS = window.CS;
      if (!CS) return;

      switch (cmd) {
        case 'GOD_MODE': {
          if (ev.data.value && CS.UIEventData_ToCSharp && CS.UIEventToCSharp?.AddSkill) {
            const evt = new CS.UIEventData_ToCSharp();
            evt.Command = CS.UIEventToCSharp.AddSkill;
            evt.Param1 = 12; // WUDI: +1 Billion attributes, permanent invincibility
            CS.UIDataTransfer.UIEvents.Add(evt);
            CS.UIDataTransfer.CurHp = CS.UIDataTransfer.MaxHp;
          }
          break;
        }

        case 'ONE_HIT_KILL': {
          if (ev.data.value && CS.UIEventData_ToCSharp && CS.UIEventToCSharp?.AddSkill) {
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
          speedState = ev.data.speed || 1.0;
          if (CS.UnityEngine?.Time) {
            CS.UnityEngine.Time.timeScale = speedState;
          }
          break;
        }
      }
    });
    return;
  }

  // =========================================================================
  // 3. TIER 1: TACTILE CYBERDECK UI
  // =========================================================================
  if (!isTopWindow) return;

  function sendGameCommand(cmd, payload = {}) {
    const msg = { __TRAINER_BRIDGE__: true, cmd, ...payload };
    for (let i = 0; i < window.frames.length; i++) {
      try { window.frames[i].postMessage(msg, '*'); } catch (e) {}
    }
  }

  class TacticalTrainerHUD {
    constructor() {
      this.speed = 1.0;
      this.container = null;
      this.shadow = null;
      this.visible = true;
      this.minimized = false;
      this._createDOM();
    }

    _createDOM() {
      const old = document.getElementById('fl-tactical-deck');
      if (old) old.remove();

      this.container = document.createElement('div');
      this.container.id = 'fl-tactical-deck';
      this.shadow = this.container.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = `
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        * {
          box-sizing: border-box;
          user-select: none;
          margin: 0;
          padding: 0;
        }
        .hud-frame {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 252px;
          background: #090a0d;
          border: 1px solid #1c202a;
          border-radius: 4px;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.04) inset,
            0 24px 48px -12px rgba(0, 0, 0, 0.92),
            0 0 0 1px rgba(0, 0, 0, 0.6);
          z-index: 2147483647;
          color: #8a919e;
          font-size: 11px;
          line-height: 1;
        }
        .hud-frame.minimized .hud-body { display: none; }
        .hud-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: #0e1117;
          border-bottom: 1px solid #161922;
          cursor: grab;
        }
        .hud-header:active { cursor: grabbing; }
        .brand-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
        }
        .brand-name {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #f3f4f6;
          text-transform: uppercase;
        }
        .version-chip {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
          font-size: 9px;
          color: #4b5563;
          letter-spacing: -0.2px;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .window-ctrl {
          background: transparent;
          border: none;
          color: #4b5563;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 10px;
          border-radius: 2px;
          transition: color 0.1s, background-color 0.1s;
        }
        .window-ctrl:hover {
          color: #e5e7eb;
          background: #1c202a;
        }
        .hud-body {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 8px;
          background: #0f1218;
          border: 1px solid #161922;
          border-radius: 3px;
          transition: border-color 0.12s ease;
        }
        .action-row:hover {
          border-color: #262c3a;
        }
        .action-meta {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .key-badge {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
          font-size: 9px;
          font-weight: 700;
          color: #6b7280;
          background: #090a0d;
          border: 1px solid #1c202a;
          padding: 2px 4px;
          border-radius: 2px;
          min-width: 34px;
          text-align: center;
          letter-spacing: -0.2px;
        }
        .action-label {
          font-size: 11px;
          font-weight: 500;
          color: #d1d5db;
          letter-spacing: -0.1px;
        }
        .toggle-switch {
          position: relative;
          width: 28px;
          height: 14px;
          flex-shrink: 0;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-track {
          position: absolute;
          inset: 0;
          cursor: pointer;
          background: #161922;
          border: 1px solid #262c3a;
          border-radius: 14px;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .toggle-track:before {
          position: absolute;
          content: "";
          height: 8px;
          width: 8px;
          left: 2px;
          bottom: 2px;
          background: #4b5563;
          border-radius: 50%;
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background 0.15s ease;
        }
        input:checked + .toggle-track {
          background: #064e3b;
          border-color: #059669;
        }
        input:checked + .toggle-track:before {
          transform: translateX(14px);
          background: #10b981;
        }
        .tactical-btn {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.3px;
          color: #9ca3af;
          background: #141822;
          border: 1px solid #222736;
          padding: 3px 8px;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.1s, color 0.1s, border-color 0.1s, transform 0.05s;
        }
        .tactical-btn:hover {
          background: #1a202c;
          border-color: #374151;
          color: #f3f4f6;
        }
        .tactical-btn:active {
          transform: translateY(1px);
          background: #0f131a;
        }
        .telemetry-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          background: #0a1118;
          border: 1px solid #0e2a22;
          border-radius: 3px;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
          font-size: 9px;
          color: #10b981;
          letter-spacing: 0.2px;
        }
        .telemetry-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pulse-ping {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #10b981;
        }
        .hud-footer {
          padding: 5px 10px;
          background: #07080a;
          border-top: 1px solid #12151d;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
          font-size: 8.5px;
          color: #4b5563;
        }
        .hud-footer span b {
          color: #9ca3af;
          font-weight: 700;
        }
      `;

      const html = `
        <div class="hud-frame" id="frame">
          <div class="hud-header" id="drag-handle">
            <div class="brand-meta">
              <span class="status-dot"></span>
              <span class="brand-name">Zombie Wave</span>
              <span class="version-chip">v2.10</span>
            </div>
            <div class="header-actions">
              <button class="window-ctrl" id="btn-min" title="Minimize">_</button>
              <button class="window-ctrl" id="btn-close" title="Hide (Press INS)">✕</button>
            </div>
          </div>

          <div class="hud-body">
            <div class="telemetry-bar">
              <div class="telemetry-indicator">
                <span class="pulse-ping"></span>
                <span>AD BYPASS</span>
              </div>
              <span style="color:#6b7280;">ENGAGED</span>
            </div>

            <div class="action-row">
              <div class="action-meta">
                <span class="key-badge">NUM 1</span>
                <span class="action-label">God Mode</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-god">
                <span class="toggle-track"></span>
              </label>
            </div>

            <div class="action-row">
              <div class="action-meta">
                <span class="key-badge">NUM 2</span>
                <span class="action-label">One-Hit Kill</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-ohk">
                <span class="toggle-track"></span>
              </label>
            </div>

            <div class="action-row">
              <div class="action-meta">
                <span class="key-badge">NUM 3</span>
                <span class="action-label">Repair Wall</span>
              </div>
              <button class="tactical-btn" id="btn-heal">HEAL</button>
            </div>

            <div class="action-row">
              <div class="action-meta">
                <span class="key-badge">NUM 4</span>
                <span class="action-label">+5K Scrap</span>
              </div>
              <button class="tactical-btn" id="btn-scrap">+5000</button>
            </div>

            <div class="action-row">
              <div class="action-meta">
                <span class="key-badge">F11</span>
                <span class="action-label">Timescale</span>
              </div>
              <button class="tactical-btn" id="btn-speed">1.0x</button>
            </div>
          </div>

          <div class="hud-footer">
            <span>KEY: <b>INS</b> TO TOGGLE</span>
            <span>FLiNG LAB</span>
          </div>
        </div>
      `;

      this.shadow.appendChild(style);
      const w = document.createElement('div');
      w.innerHTML = html;
      this.shadow.appendChild(w);
      document.body.appendChild(this.container);

      this._bindInteractions();
    }

    _bindInteractions() {
      const swGod = this.shadow.getElementById('toggle-god');
      swGod.addEventListener('change', (e) => {
        sendGameCommand('GOD_MODE', { value: e.target.checked });
      });

      const swOhk = this.shadow.getElementById('toggle-ohk');
      swOhk.addEventListener('change', (e) => {
        sendGameCommand('ONE_HIT_KILL', { value: e.target.checked });
      });

      this.shadow.getElementById('btn-heal').addEventListener('click', () => {
        sendGameCommand('HEAL');
      });

      this.shadow.getElementById('btn-scrap').addEventListener('click', () => {
        sendGameCommand('ADD_SCRAP', { amount: 5000 });
      });

      const btnSpd = this.shadow.getElementById('btn-speed');
      btnSpd.addEventListener('click', () => {
        this.speed = this.speed === 1.0 ? 2.0 : (this.speed === 2.0 ? 5.0 : 1.0);
        sendGameCommand('SET_SPEED', { speed: this.speed });
        btnSpd.textContent = `${this.speed.toFixed(1)}x`;
      });

      const frame = this.shadow.getElementById('frame');
      this.shadow.getElementById('btn-min').addEventListener('click', () => {
        this.minimized = !this.minimized;
        frame.classList.toggle('minimized', this.minimized);
      });

      this.shadow.getElementById('btn-close').addEventListener('click', () => {
        frame.style.display = 'none';
      });

      const dragHandle = this.shadow.getElementById('drag-handle');
      let isDragging = false, startX, startY, initL, initT;

      dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.closest('.header-actions')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = frame.getBoundingClientRect();
        initL = rect.left;
        initT = rect.top;

        const onMove = (ev) => {
          if (!isDragging) return;
          frame.style.left = `${initL + (ev.clientX - startX)}px`;
          frame.style.top = `${initT + (ev.clientY - startY)}px`;
          frame.style.right = 'auto';
        };

        const onUp = () => {
          isDragging = false;
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });

      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        if (e.code === 'Numpad1') {
          swGod.checked = !swGod.checked;
          swGod.dispatchEvent(new Event('change'));
        } else if (e.code === 'Numpad2') {
          swOhk.checked = !swOhk.checked;
          swOhk.dispatchEvent(new Event('change'));
        } else if (e.code === 'Numpad3') {
          this.shadow.getElementById('btn-heal').click();
        } else if (e.code === 'Numpad4') {
          this.shadow.getElementById('btn-scrap').click();
        } else if (e.key === 'F11') {
          btnSpd.click();
        } else if (e.key === 'Insert') {
          frame.style.display = frame.style.display === 'none' ? 'block' : 'none';
        }
      });
    }
  }

  if (window.location.href.includes('idle-zombie-wave')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new TacticalTrainerHUD());
    } else {
      new TacticalTrainerHUD();
    }
  }
})();
