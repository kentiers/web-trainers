/**
 * Words and Blooms - Deep In-Memory Live Gameplay Patcher
 * Hooks Object.defineProperty at engine root to capture the active Phaser Scene and ve Session.
 * Overrides instance descriptors directly to lock Hints, Shuffles, and Letters without reloading.
 */
export class BloomsGameplayPatcher {
  static installHook() {
    if (window.__BLOOM_HOOK_INSTALLED__) return;
    window.__BLOOM_HOOK_INSTALLED__ = true;

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
  }

  static enableInfiniteHints() {
    if (window.__BLOOM_SESSION__) {
      try {
        Object.defineProperty(window.__BLOOM_SESSION__, 'hintsRemaining', {
          get() { return 999; },
          set(v) {},
          configurable: true,
          enumerable: true
        });
        Object.defineProperty(window.__BLOOM_SESSION__, 'bloomHintsRemaining', {
          get() { return 999; },
          set(v) {},
          configurable: true,
          enumerable: true
        });
      } catch (e) {}
    }
    if (window.__BLOOM_SCENE__) {
      try {
        window.__BLOOM_SCENE__.updateHintButton?.();
        window.__BLOOM_SCENE__.updateBloomButton?.();
      } catch (e) {}
    }
  }

  static enableInfiniteShuffles() {
    if (window.__BLOOM_SESSION__) {
      try {
        Object.defineProperty(window.__BLOOM_SESSION__, 'shufflesRemaining', {
          get() { return 999; },
          set(v) {},
          configurable: true,
          enumerable: true
        });
      } catch (e) {}
    }
    if (window.__BLOOM_SCENE__) {
      try {
        window.__BLOOM_SCENE__.updateShuffleButton?.();
      } catch (e) {}
    }
  }

  static enableInfiniteLetters() {
    if (window.__BLOOM_SESSION__?.bag) {
      try {
        window.__BLOOM_SESSION__.bag.index = 0;
        Object.defineProperty(window.__BLOOM_SESSION__.bag, 'remaining', {
          get() { return 999; },
          set(v) {},
          configurable: true,
          enumerable: true
        });
      } catch (e) {}
    }
    if (window.__BLOOM_SCENE__?.lettersPanel && window.__BLOOM_SESSION__?.lettersLeft) {
      try {
        window.__BLOOM_SCENE__.lettersPanel.setValue(window.__BLOOM_SESSION__.lettersLeft);
      } catch (e) {}
    }
  }
}
