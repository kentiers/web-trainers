// ==UserScript==
// @name         Words and Blooms - FLiNG Style Web Trainer
// @namespace    https://github.com/trainer-modding/web-trainers
// @version      2.1.0
// @description  Deep In-Memory Web Trainer for Words and Blooms (Infinite Hints, Infinite Shuffles, Infinite Letters, Timescale)
// @author       Trainer Modding Suite
// @match        https://*.crazygames.com/game/words-and-blooms-tlc*
// @match        https://*.crazygames.com/*words-and-blooms*
// @match        https://*.game-files.crazygames.com/*words-and-blooms*
// @match        *://*/*words-and-blooms*
// @run-at       document-start
// @allFrames    true
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const origDef = Object.defineProperty;
  window.__BLOOM_SESSION__ = window.__BLOOM_SESSION__ || null;
  window.__BLOOM_SCENE__ = window.__BLOOM_SCENE__ || null;

  Object.defineProperty = function (obj, prop, desc) {
    if (prop === 'session') {
      window.__BLOOM_SCENE__ = obj;
      return origDef.call(this, obj, prop, {
        get() {
          return this.__session__;
        },
        set(val) {
          this.__session__ = val;
          window.__BLOOM_SESSION__ = val;
          window.__BLOOM_SCENE__ = this;
          if (val) {
            try {
              origDef.call(this, val, 'hintsRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
              origDef.call(this, val, 'bloomHintsRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
              origDef.call(this, val, 'shufflesRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
              if (val.bag) {
                origDef.call(this, val.bag, 'remaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
                const origDraw = val.bag.draw?.bind(val.bag);
                if (origDraw) {
                  val.bag.draw = function (count) {
                    val.bag.index = 0;
                    return origDraw(count);
                  };
                }
              }
            } catch (e) {}
          }
        },
        configurable: true,
        enumerable: true
      });
    }

    if (prop === 'hintsRemaining' || prop === 'shufflesRemaining' || prop === 'bloomHintsRemaining') {
      window.__BLOOM_SESSION__ = obj;
      return origDef.call(this, obj, prop, {
        get() { return 999; },
        set(v) {},
        configurable: true,
        enumerable: true
      });
    }

    if (prop === 'bag') {
      const origVal = desc?.value;
      if (origVal) {
        try {
          origDef.call(this, origVal, 'remaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
          const origDraw = origVal.draw?.bind(origVal);
          if (origDraw) {
            origVal.draw = function (count) {
              origVal.index = 0;
              return origDraw(count);
            };
          }
        } catch (e) {}
      }
    }

    return origDef.call(this, obj, prop, desc);
  };

  function triggerHints() {
    if (window.__BLOOM_SESSION__) {
      try {
        Object.defineProperty(window.__BLOOM_SESSION__, 'hintsRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
        Object.defineProperty(window.__BLOOM_SESSION__, 'bloomHintsRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
      } catch (e) {}
    }
    window.__BLOOM_SCENE__?.updateHintButton?.();
    window.__BLOOM_SCENE__?.updateBloomButton?.();
    console.log('[Words and Blooms] Infinite Hints Locked at 999!');
  }

  function triggerShuffles() {
    if (window.__BLOOM_SESSION__) {
      try {
        Object.defineProperty(window.__BLOOM_SESSION__, 'shufflesRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
      } catch (e) {}
    }
    window.__BLOOM_SCENE__?.updateShuffleButton?.();
    console.log('[Words and Blooms] Infinite Shuffles Locked at 999!');
  }

  function triggerLetters() {
    if (window.__BLOOM_SESSION__?.bag) {
      try {
        window.__BLOOM_SESSION__.bag.index = 0;
        Object.defineProperty(window.__BLOOM_SESSION__.bag, 'remaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
      } catch (e) {}
    }
    if (window.__BLOOM_SCENE__?.lettersPanel && window.__BLOOM_SESSION__?.lettersLeft) {
      window.__BLOOM_SCENE__.lettersPanel.setValue(window.__BLOOM_SESSION__.lettersLeft);
    }
    console.log('[Words and Blooms] Infinite Letters Locked!');
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

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Numpad1') {
      triggerHints();
    } else if (e.code === 'Numpad2') {
      triggerShuffles();
    } else if (e.code === 'Numpad3') {
      triggerLetters();
    } else if (e.code === 'F11') {
      e.preventDefault();
      const s = cycleSpeed();
      console.log(`[Words and Blooms] Timescale: ${s.toFixed(1)}x`);
    }
  }, true);
})();
