// ==UserScript==
// @name         Capybara Clicker 2 - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.0.0
// @description  Full-featured Web Trainer for Capybara Clicker 2 on CrazyGames (Turbo Auto-Clicker, +500 Burst, Speedhack, Ad Bypass)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/game/capybara-clicker-2*
// @match        https://games.crazygames.com/*/capybara-clicker-2/*
// @match        https://*.game-files.crazygames.com/*/capybara-clicker-2.html*
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

  // 2. Input Click Engine
  let autoClickTimer = null;
  function toggleAutoClicker(enabled) {
    if (autoClickTimer) {
      clearInterval(autoClickTimer);
      autoClickTimer = null;
    }
    if (enabled) {
      autoClickTimer = setInterval(() => {
        const c = document.getElementById('unity-canvas') || document.querySelector('canvas');
        if (c) {
          const rect = c.getBoundingClientRect();
          const x = rect.left + rect.width * 0.30;
          const y = rect.top + rect.height * 0.55;
          c.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
          c.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
        }
      }, 16);
    }
  }

  function fireBurst(count = 500) {
    let sent = 0;
    const t = setInterval(() => {
      const c = document.getElementById('unity-canvas') || document.querySelector('canvas');
      if (c) {
        const rect = c.getBoundingClientRect();
        const x = rect.left + rect.width * 0.30;
        const y = rect.top + rect.height * 0.55;
        c.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
        c.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
      }
      if (++sent >= count) clearInterval(t);
    }, 4);
  }

  // 3. Universal Speedhack
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
  let autoClickOn = false;

  hk.register('NUMPAD1', () => {
    autoClickOn = !autoClickOn;
    toggleAutoClicker(autoClickOn);
    console.log(`[Capybara Trainer] Turbo Clicker: ${autoClickOn ? 'ON' : 'OFF'}`);
  }, 'Toggle Turbo Clicker');

  hk.register('NUMPAD2', () => {
    fireBurst(500);
    console.log('[Capybara Trainer] +500 Clicks Burst Fired!');
  }, '+500 Clicks Burst');

  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Capybara Trainer] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
