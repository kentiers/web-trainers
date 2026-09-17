// ==UserScript==
// @name         Words and Blooms - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      1.0.0
// @description  Full-featured Web Trainer for Words and Blooms on CrazyGames (Max Stats, 999K Score, Skip Tutorials, Speedhack, Ad Bypass)
// @author       Trainer Modding Lab
// @match        https://www.crazygames.com/game/words-and-blooms-tlc*
// @match        https://games.crazygames.com/*/words-and-blooms-tlc/*
// @match        https://*.game-files.crazygames.com/words-and-blooms-tlc/*
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

  function injectMaxStats() {
    const statsTemplate = {
      gamesPlayed: 100,
      totalScore: 5000000,
      bestScore: 999999,
      bestDrops: 999,
      bestGameDate: new Date().toISOString(),
      totalWordsMade: 5000,
      totalLettersUsed: 25000,
      longestWord: "BLOOMING",
      highestWordScore: 50000,
      highestScoringWord: "BLOOMING",
      dlCreated: 500,
      tlCreated: 500,
      dwCreated: 500,
      twCreated: 500
    };

    localStorage.setItem('wordsandcrowns.stats.v1', JSON.stringify(statsTemplate));
    localStorage.setItem('wordsandcrowns.stats.timed.v1', JSON.stringify(statsTemplate));
    localStorage.setItem('wordsandblooms.stats.rush.v1', JSON.stringify(statsTemplate));
    console.log('[Words & Blooms] Max Stats & 999K Score Injected!');
  }

  function skipTutorials() {
    localStorage.setItem('wordsandblooms.tutorial.done.v1', '1');
    localStorage.setItem('wordsandblooms.bloomintro.hide', '1');
    localStorage.setItem('wordsandblooms.rush.hideintro', '1');
    localStorage.setItem('wordsandblooms.bloom.used', '1');
    console.log('[Words & Blooms] All Tutorials Skipped!');
  }

  let speedState = 1.0;
  const realNow = performance.now.bind(performance);
  let realStart = realNow();
  let virtualStart = realStart;

  function cycleSpeed() {
    speedState = speedState === 1.0 ? 2.0 : (speedState === 2.0 ? 5.0 : (speedState === 5.0 ? 0.5 : 1.0));
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
  hk.register('NUMPAD1', () => injectMaxStats(), 'Max Stats');
  hk.register('NUMPAD2', () => skipTutorials(), 'Skip Tutorials');
  hk.register('F11', () => {
    const s = cycleSpeed();
    console.log(`[Words & Blooms] Speed: ${s.toFixed(1)}x`);
  }, 'Cycle Timescale');
})();
