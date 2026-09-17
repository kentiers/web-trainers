/**
 * Words and Blooms - Zero-Reload DevTools Console Injector
 *
 * How to use:
 * 1. Open game: https://www.crazygames.com/game/words-and-blooms-tlc
 * 2. Press F12 -> Console -> Switch dropdown to "index.html" (words-and-blooms frame)
 * 3. Paste this code and press ENTER.
 * 4. Controls:
 *    - NUMPAD 1: Infinite Hints (999 Hints)
 *    - NUMPAD 2: Infinite Shuffles (999 Shuffles)
 *    - NUMPAD 3: Infinite Letters (Never Deplete)
 *    - F11     : Timescale Speedhack (0.5x / 1.0x / 2.0x / 5.0x)
 */
(() => {
  function hookProperties() {
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
      Object.defineProperty(Object.prototype, 'remaining', {
        get() { return 999; },
        set() {},
        configurable: true
      });
      console.log('%c[Words & Blooms] 999 Hints, 999 Shuffles & Infinite Letters Hooked!', 'color: #10b981; font-weight: bold;');
    } catch (e) {
      console.error(e);
    }
  }

  hookProperties();

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
      hookProperties();
    } else if (e.code === 'F11') {
      e.preventDefault();
      cycleSpeed();
    }
  }, true);

  console.log('%cReady! Cheats active in memory without reloading.', 'color: #f59e0b; font-weight: bold;');
})();
