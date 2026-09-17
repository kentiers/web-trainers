// ==UserScript==
// @name         Words of Wonders - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.0.0
// @description  Full-featured Web Trainer for Words of Wonders on CrazyGames (+999K Gems, 999 Hints/Hammers, Speedhack, Ad Bypass)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/game/words-of-wonders*
// @match        https://games.crazygames.com/*/words-of-wonders/*
// @match        https://*.game-files.crazygames.com/words-of-wonders/*
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
  function injectGems(amount = 999999) {
    const raw = localStorage.getItem('SDK_DATA_21760') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    let wow = {};
    try { wow = JSON.parse(sdk.data["words-of-wonders:data"] || '{}'); } catch (e) {}
    wow["words-of-wonders:current_gem_count"] = amount.toString();
    const newJson = JSON.stringify(wow);
    sdk.data["words-of-wonders:data"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_21760', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem("words-of-wonders:data", newJson); } catch (e) {}
    }
    console.log('[Words of Wonders] +999K Gems Injected! (F5 to apply)');
  }

  function injectHints(amount = 999) {
    const raw = localStorage.getItem('SDK_DATA_21760') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    let wow = {};
    try { wow = JSON.parse(sdk.data["words-of-wonders:data"] || '{}'); } catch (e) {}
    wow["words-of-wonders:free_hint_count"] = amount.toString();
    wow["words-of-wonders:free_hammer_hint_count"] = amount.toString();
    const newJson = JSON.stringify(wow);
    sdk.data["words-of-wonders:data"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_21760', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem("words-of-wonders:data", newJson); } catch (e) {}
    }
    console.log('[Words of Wonders] 999 Free Hints & Hammers Injected! (F5 to apply)');
  }

  // 3. Timescale
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

  // 4. Hotkeys
  const hk = new HotkeyManager();
  hk.register('NUMPAD1', () => injectGems(), '+999K Gems');
  hk.register('NUMPAD2', () => injectHints(), '999 Hints');
  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Words of Wonders] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
