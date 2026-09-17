// ==UserScript==
// @name         Hangman - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.0.0
// @description  Full-featured Web Trainer for Hangman on CrazyGames (+999K Diamonds, Speedhack, Ad Bypass)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/game/hangman-cfc*
// @match        https://games.crazygames.com/*/hangman-cfc/*
// @match        https://*.game-files.crazygames.com/hangman-cfc/*
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

  function injectDiamonds(amount = 999999) {
    const raw = localStorage.getItem('CrazyGames-Game-Hangman-v1.2') || '{}';
    const save = JSON.parse(raw);
    save.diamond = amount;
    save.firstTimer = false;
    save.clueClicked = true;
    localStorage.setItem('CrazyGames-Game-Hangman-v1.2', JSON.stringify(save));
    console.log('[Hangman Trainer] +999K Diamonds Injected! (F5 to apply)');
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
  hk.register('NUMPAD1', () => injectDiamonds(), '+999K Diamonds');
  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Hangman Trainer] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
