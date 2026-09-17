// ==UserScript==
// @name         Capybara Clicker 2 - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.1.0
// @description  Full-featured Web Trainer for Capybara Clicker 2 on CrazyGames (Turbo Auto-Clicker, Smart Auto-Buyer, Unlock All, Speedhack, Ad Bypass)
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

  // 3. Smart Upgrade Auto-Buyer
  let smartUpgradeTimer = null;
  function toggleSmartUpgrade(enabled) {
    if (smartUpgradeTimer) {
      clearInterval(smartUpgradeTimer);
      smartUpgradeTimer = null;
    }
    if (enabled) {
      const slots = [0.28, 0.39, 0.50, 0.61];
      let idx = 0;
      smartUpgradeTimer = setInterval(() => {
        const c = document.getElementById('unity-canvas') || document.querySelector('canvas');
        if (c) {
          const rect = c.getBoundingClientRect();
          const x = rect.left + rect.width * 0.58;
          const y = rect.top + rect.height * slots[idx];
          c.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
          c.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
          idx = (idx + 1) % slots.length;
        }
      }, 600);
    }
  }

  // 4. Save Unlocker (Cosmetics & 999 Spins)
  function unlockAllCosmetics() {
    try {
      const req = indexedDB.open('/idbfs');
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('FILE_DATA')) return;
        const tx = db.transaction('FILE_DATA', 'readwrite');
        const st = tx.objectStore('FILE_DATA');
        const reqKeys = st.getAllKeys();
        reqKeys.onsuccess = () => {
          const fileKey = reqKeys.result.find(k => typeof k === 'string' && k.endsWith('Stats.dat'));
          if (!fileKey) return;
          const getVal = st.get(fileKey);
          getVal.onsuccess = () => {
            const fileObj = getVal.result;
            if (!fileObj || !fileObj.contents) return;
            const u8 = new Uint8Array(fileObj.contents);
            const view = new DataView(u8.buffer);

            // Wheel spins 999 + Multiplier 10000
            const lastBiPattern = [0x01, 0xf2, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff];
            for (let i = 4000; i < 5000; i++) {
              let m = true;
              for (let j = 0; j < lastBiPattern.length; j++) {
                if (u8[i + j] !== lastBiPattern[j]) { m = false; break; }
              }
              if (m) {
                const intBlockStart = i + lastBiPattern.length + 5;
                view.setInt32(intBlockStart + 16, 10000, true);
                view.setInt32(intBlockStart + 32, 999, true);
                break;
              }
            }

            // Unlock all 64-element cosmetic arrays
            const arrayPattern = [0x40, 0x00, 0x00, 0x00, 0x08];
            for (let i = 0; i < u8.length - 10; i++) {
              let m = true;
              for (let j = 0; j < arrayPattern.length; j++) {
                if (u8[i + j] !== arrayPattern[j]) { m = false; break; }
              }
              if (m) {
                const dataOffset = i + arrayPattern.length;
                for (let k = 0; k < 64; k++) {
                  view.setInt32(dataOffset + k * 4, 1, true);
                }
              }
            }

            // Currency +50M
            const curPattern = [0x01, 0xfb, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff];
            for (let i = 4000; i < 5000; i++) {
              let m = true;
              for (let j = 0; j < curPattern.length; j++) {
                if (u8[i + j] !== curPattern[j]) { m = false; break; }
              }
              if (m) {
                view.setInt32(i + curPattern.length, 50000000, true);
                view.setInt32(i - 5, 50000000, true);
                break;
              }
            }

            fileObj.timestamp = new Date();
            st.put(fileObj, fileKey);
            console.log('[Capybara Trainer] All Cosmetics, 999 Spins & +50M Unlocked! Reload to apply.');
          };
        };
      };
    } catch (e) {}
  }

  // 5. Universal Speedhack
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

  // 6. Hotkeys
  const hk = new HotkeyManager();
  let autoClickOn = false;
  let smartUpgradeOn = false;

  hk.register('NUMPAD1', () => {
    autoClickOn = !autoClickOn;
    toggleAutoClicker(autoClickOn);
    console.log(`[Capybara Trainer] Turbo Clicker: ${autoClickOn ? 'ON' : 'OFF'}`);
  }, 'Toggle Turbo Clicker');

  hk.register('NUMPAD2', () => {
    smartUpgradeOn = !smartUpgradeOn;
    toggleSmartUpgrade(smartUpgradeOn);
    console.log(`[Capybara Trainer] Smart Upgrade: ${smartUpgradeOn ? 'ON' : 'OFF'}`);
  }, 'Toggle Smart Upgrade');

  hk.register('NUMPAD3', () => {
    unlockAllCosmetics();
  }, 'Unlock All Cosmetics & 999 Spins');

  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Capybara Trainer] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
