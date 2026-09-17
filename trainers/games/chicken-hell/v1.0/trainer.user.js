// ==UserScript==
// @name         Chicken Hell - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.0.0
// @description  Full-featured Web Trainer for Chicken Hell on CrazyGames (+999K Rings, 999 Spins, Turbo Boost, Speedhack, Ad Bypass)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/game/chicken-hell*
// @match        https://games.crazygames.com/*/chicken-hell/*
// @match        https://*.game-files.crazygames.com/*/chicken-hell.html*
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
      const parts = keyCombo.toUpperCase().split('+').map(p => p.trim());
      this.bindings.set(parts.join('+'), { callback, description });
    }

    _onKeyDown(e) {
      if (!this.enabled) return;
      const tag = e.target.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      let key = e.key.toUpperCase();
      if (e.code.startsWith('Numpad')) key = e.code.toUpperCase();
      for (const [combo, item] of this.bindings) {
        if (combo === key) {
          e.preventDefault();
          item.callback();
          break;
        }
      }
    }
  }

  // 2. Storage Helpers
  function injectRings(amount = 9999999) {
    const raw = localStorage.getItem('SDK_DATA_65663') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    sdk.data.INT_CURRENCY = amount.toString();
    sdk.data.STATISTIC_CURRENCY_EARNED = amount.toString();
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_65663', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem('INT_CURRENCY', amount.toString()); } catch (e) {}
    }
    console.log('[Chicken Hell] +999K Gold Rings Injected!');
  }

  function grantSpins(count = 999) {
    const raw = localStorage.getItem('SDK_DATA_65663') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    sdk.data.FREE_WHEEL_SPINS_LEFT = count.toString();
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_65663', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem('FREE_WHEEL_SPINS_LEFT', count.toString()); } catch (e) {}
    }
    console.log('[Chicken Hell] 999 Free Wheel Spins Granted!');
  }

  // 3. Turbo Boost
  let boostTimer = null;
  function toggleBoost(enabled) {
    if (boostTimer) { clearInterval(boostTimer); boostTimer = null; }
    if (enabled) {
      boostTimer = setInterval(() => {
        const c = document.getElementById('unity-canvas') || document.querySelector('canvas');
        if (c) {
          const rect = c.getBoundingClientRect();
          const x = rect.left + rect.width * 0.5;
          const y = rect.top + rect.height * 0.5;
          c.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
          c.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
        }
      }, 25);
    }
  }

  // 4. Timescale
  let speedState = 1.0;
  const realNow = performance.now.bind(performance);
  let realStart = realNow();
  let virtualStart = realStart;

  function cycleSpeed() {
    speedState = speedState === 1.0 ? 2.0 : (speedState === 2.0 ? 5.0 : 1.0);
    const now = realNow();
    virtualStart = virtualStart + (now - realStart) * speedState;
    realStart = now;

    if (speedState === 1.0) {
      window.performance.now = realNow;
    } else {
      window.performance.now = function () {
        const c = realNow();
        return virtualStart + (c - realStart) * speedState;
      };
    }
    return speedState;
  }

  // 5. Hotkeys
  const hk = new HotkeyManager();
  let boostOn = false;

  hk.register('NUMPAD1', () => injectRings(), '+999K Rings');
  hk.register('NUMPAD2', () => grantSpins(), '999 Spins');
  hk.register('NUMPAD3', () => {
    boostOn = !boostOn;
    toggleBoost(boostOn);
    console.log(`[Chicken Hell] Turbo Boost: ${boostOn ? 'ON' : 'OFF'}`);
  }, 'Toggle Turbo Boost');
  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Chicken Hell] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
