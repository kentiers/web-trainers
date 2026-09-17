/**
 * Words and Blooms - Deep In-Memory DevTools Console Injector
 *
 * How to use:
 * 1. Open game: https://www.crazygames.com/game/words-and-blooms-tlc
 * 2. Press F12 -> Console -> Switch dropdown to "index.html" (words-and-blooms frame)
 * 3. Paste this code and press ENTER.
 * 4. Controls:
 *    - NUMPAD 1: Infinite Hints
 *    - NUMPAD 2: Infinite Shuffles
 *    - NUMPAD 3: Infinite Letters
 *    - F11     : Timescale Speedhack (0.5x / 1.0x / 2.0x / 5.0x)
 */
(() => {
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

  // If already running, apply to captured session
  function applyCheats() {
    if (window.__BLOOM_SESSION__) {
      try {
        Object.defineProperty(window.__BLOOM_SESSION__, 'hintsRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
        Object.defineProperty(window.__BLOOM_SESSION__, 'bloomHintsRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
        Object.defineProperty(window.__BLOOM_SESSION__, 'shufflesRemaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
        if (window.__BLOOM_SESSION__.bag) {
          window.__BLOOM_SESSION__.bag.index = 0;
          Object.defineProperty(window.__BLOOM_SESSION__.bag, 'remaining', { get() { return 999; }, set(v) {}, configurable: true, enumerable: true });
        }
      } catch (e) {}
    }
    if (window.__BLOOM_SCENE__) {
      try {
        window.__BLOOM_SCENE__.updateHintButton?.();
        window.__BLOOM_SCENE__.updateBloomButton?.();
        window.__BLOOM_SCENE__.updateShuffleButton?.();
        if (window.__BLOOM_SCENE__.lettersPanel && window.__BLOOM_SESSION__?.lettersLeft) {
          window.__BLOOM_SCENE__.lettersPanel.setValue(window.__BLOOM_SESSION__.lettersLeft);
        }
      } catch (e) {}
    }
    console.log('%c[Words & Blooms] Deep In-Memory Cheats Engaged (999 Hints & Shuffles, Infinite Letters)!', 'color: #10b981; font-weight: bold;');
  }

  applyCheats();

  // Stepped Timescale
  const SPEEDS = [0.5, 1.0, 2.0, 5.0];
  let speedIdx = 1;

  function cycleSpeed() {
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    const s = SPEEDS[speedIdx];
    if (window.Phaser?.GAMES?.[0]?.loop) {
      window.Phaser.GAMES[0].loop.targetFps = 60 * s;
    }
    console.log(`%c[Words & Blooms] Timescale: ${s.toFixed(1)}x`, 'color: #3b82f6; font-weight: bold;');
    return s;
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Numpad1' || e.code === 'Numpad2' || e.code === 'Numpad3') {
      applyCheats();
    } else if (e.code === 'F11') {
      e.preventDefault();
      cycleSpeed();
    }
  }, true);

  console.log('%cReady! Cheats hooked into memory engine.', 'color: #f59e0b; font-weight: bold;');
})();
