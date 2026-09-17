// ==UserScript==
// @name         Words and Blooms - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      2.0.0
// @description  Zero-Reload In-Memory Web Trainer for Words and Blooms (Infinite Hints, Infinite Shuffles, Infinite Letters, Timescale)
// @author       Trainer Modding Suite
// @match        https://*.crazygames.com/game/words-and-blooms-tlc*
// @match        https://*.crazygames.com/*words-and-blooms*
// @match        *://*/*words-and-blooms*
// @run-at       document-start
// @allFrames    true
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Inject in-memory property hooks immediately at boot time
  function applyHooks() {
    try {
      Object.defineProperty(Object.prototype, 'hintsRemaining', {
        get() { return 999; },
        set() {},
        configurable: true
      });
      Object.defineProperty(Object.prototype, 'bloomHintsRemaining', {
        get() { return 999; },
        set() {},
        configurable: true
      });
      Object.defineProperty(Object.prototype, 'shufflesRemaining', {
        get() { return 999; },
        set() {},
        configurable: true
      });
    } catch (e) {}
  }

  applyHooks();

  function enableInfiniteLetters() {
    try {
      Object.defineProperty(Object.prototype, 'remaining', {
        get() { return 999; },
        set() {},
        configurable: true
      });
      if (window.Phaser?.GAMES?.[0]) {
        for (const scene of window.Phaser.GAMES[0].scene.scenes) {
          if (scene.session?.bag) scene.session.bag.index = 0;
          if (scene.lettersPanel && scene.session?.lettersLeft) {
            scene.lettersPanel.setValue(scene.session.lettersLeft);
          }
        }
      }
    } catch (e) {}
  }

  // Stepped Timescale
  let currentSpeed = 1.0;
  const SPEEDS = [0.5, 1.0, 2.0, 5.0];
  let speedIdx = 1;

  function cycleSpeed() {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    currentSpeed = SPEEDS[speedIdx];
    if (window.Phaser?.GAMES?.[0]?.loop) {
      window.Phaser.GAMES[0].loop.targetFps = 60 * currentSpeed;
    }
    return currentSpeed;
  }

  // Hotkey manager
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Numpad1') {
      applyHooks();
      console.log('[Words and Blooms] 999 Hints Activated!');
    } else if (e.code === 'Numpad2') {
      applyHooks();
      console.log('[Words and Blooms] 999 Shuffles Activated!');
    } else if (e.code === 'Numpad3') {
      enableInfiniteLetters();
      console.log('[Words and Blooms] Infinite Letters Activated!');
    } else if (e.code === 'F11') {
      e.preventDefault();
      const s = cycleSpeed();
      console.log(`[Words and Blooms] Timescale: ${s.toFixed(1)}x`);
    }
  }, true);
})();
