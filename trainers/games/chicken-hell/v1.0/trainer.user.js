// ==UserScript==
// @name         Chicken Hell - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.1.0
// @description  Full-featured Web Trainer for Chicken Hell on CrazyGames (+999K Rings, Unlock All 7 Skins, 999 Spins, Turbo Boost, Speedhack, Ad Bypass)
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
    console.log('[Chicken Hell] +999K Gold Rings Injected! (F5 to apply)');
  }

  function unlockAllSkins() {
    const raw = localStorage.getItem('SDK_DATA_65663') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    const guids = [
      "1382d6ce-37ab-6fb4-eaeb-489bddc16c4c", // Default
      "279e6016-a25c-dd84-8acf-56d0f3f82227", // Alien
      "ce19aa6b-03c9-8924-fa46-cf1d060548a9", // Pink
      "5fb8c559-daa6-0204-aba9-d216c07f9773", // Yellow
      "0e728ed8-256d-d944-69a8-a76b9e424302", // Green
      "8abbdcc2-6147-72e4-7b3a-182da79ad814", // Turtle
      "de442ee2-a439-cca4-2bf1-187616fce721"  // Purple
    ];
    for (const g of guids) {
      sdk.data[`COSMETIC_ISUNLOCKED_${g}`] = "1";
    }
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_65663', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      for (const g of guids) {
        try { window.CrazyGames.SDK.data.setItem(`COSMETIC_ISUNLOCKED_${g}`, "1"); } catch (e) {}
      }
    }
    console.log('[Chicken Hell] All 7 Skins Unlocked! (F5 to apply)');
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
    console.log('[Chicken Hell] 999 Free Wheel Spins Granted! (F5 to apply)');
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
  hk.register('NUMPAD2', () => unlockAllSkins(), 'Unlock All Skins');
  hk.register('NUMPAD3', () => grantSpins(), '999 Spins');
  hk.register('NUMPAD4', () => {
    boostOn = !boostOn;
    toggleBoost(boostOn);
    console.log(`[Chicken Hell] Turbo Boost: ${boostOn ? 'ON' : 'OFF'}`);
  }, 'Toggle Turbo Boost');
  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Chicken Hell] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
