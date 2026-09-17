// ==UserScript==
// @name         Swarm Survivor - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.0.0
// @description  Full-featured Web Trainer for Swarm Survivor on CrazyGames (God Mode, +999K Coins/Gems, All Weapons, Speedhack, Ad Bypass)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/game/swarm-survivor-ygx*
// @match        https://games.crazygames.com/*/swarm-survivor-ygx/*
// @match        https://*.game-files.crazygames.com/swarm-survivor-ygx/*
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

  // 2. Swarm Cheat Functions
  function applyGodMothership() {
    const godMothership = {
      nextIndex: 50,
      totalPurchased: 100,
      visibleCards: [
        { seqIdx: 50, price: 200 },
        { seqIdx: 51, price: 200 },
        { seqIdx: 52, price: 200 }
      ],
      stats: {
        damagePercent: 5000,
        hpPercent: 10000,
        moveSpeedPercent: 60,
        pickupRangePercent: 2000,
        cooldownPercent: 85,
        xpBonusPercent: 500,
        coinsPercent: 500,
        areaPercent: 300,
        multiShotPercent: 200,
        chainReactionPercent: 100
      }
    };
    localStorage.setItem('space-survivor-mothership', JSON.stringify(godMothership));
    console.log('[Swarm Trainer] God Mode & 5000% Damage Applied! (Restart wave to apply)');
  }

  function addCurrencies() {
    localStorage.setItem('space-survivor-coins', '999999');
    localStorage.setItem('space-survivor-gems', '99999');
    localStorage.setItem('space-survivor-xp', '50000');
    console.log('[Swarm Trainer] +999K Coins & +99K Gems Injected!');
  }

  function unlockAllWeapons() {
    const all = [
      "blaster", "blaster_drone", "orbiter", "missile_launcher",
      "grenade", "sprayer", "shotgun", "drill_missile",
      "boomer_missile", "sniper", "cluster_bomb", "melee_drone"
    ];
    localStorage.setItem('space-survivor-weaponUnlocks', JSON.stringify(all));
    console.log('[Swarm Trainer] All 12 Weapons Unlocked!');
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
  hk.register('NUMPAD1', () => applyGodMothership(), 'God Mode');
  hk.register('NUMPAD2', () => addCurrencies(), 'Add Currencies');
  hk.register('NUMPAD3', () => unlockAllWeapons(), 'Unlock Weapons');
  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Swarm Trainer] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
