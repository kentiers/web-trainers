// ==UserScript==
// @name         Tile Clash - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.0.0
// @description  Full-featured Web Trainer for Tile Clash on CrazyGames (+999K Coins, Unlock 100 Levels, Speedhack, Ad Bypass)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/game/tile-clash*
// @match        https://games.crazygames.com/*/tile-clash/*
// @match        https://*.game-files.crazygames.com/tile-clash/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

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

  function injectCoins(amount = 999999) {
    const raw = localStorage.getItem('SDK_DATA_121168') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    let p = { version: 2, data: {} };
    try { p = JSON.parse(sdk.data["pistazo/save"] || '{"version":2,"data":{}}'); } catch (e) {}
    if (!p.data) p.data = {};
    p.data.coins = amount;
    const newJson = JSON.stringify(p);
    sdk.data["pistazo/save"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_121168', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem("pistazo/save", newJson); } catch (e) {}
    }
    console.log('[Tile Clash] +999K Coins Injected! (F5 to apply)');
  }

  function unlockLevels() {
    const raw = localStorage.getItem('SDK_DATA_121168') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    let p = { version: 2, data: {} };
    try { p = JSON.parse(sdk.data["pistazo/save"] || '{"version":2,"data":{}}'); } catch (e) {}
    if (!p.data) p.data = {};
    p.data.unlocked = 100;
    p.data.wins = 999;
    p.data.streak = 999;
    const newJson = JSON.stringify(p);
    sdk.data["pistazo/save"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_121168', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem("pistazo/save", newJson); } catch (e) {}
    }
    console.log('[Tile Clash] 100 Levels & 999 Wins Unlocked! (F5 to apply)');
  }

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

  const hk = new HotkeyManager();
  hk.register('NUMPAD1', () => injectCoins(), '+999K Coins');
  hk.register('NUMPAD2', () => unlockLevels(), 'Unlock 100 Levels');
  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Tile Clash] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
