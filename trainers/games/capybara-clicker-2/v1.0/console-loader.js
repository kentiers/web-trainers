/**
 * Capybara Clicker 2 - Direct DevTools Console Injector
 *
 * How to use:
 * 1. Open game on CrazyGames: https://www.crazygames.com/game/capybara-clicker-2
 * 2. Press F12 -> Console -> Switch execution context dropdown to "capybara-clicker-2.html"
 * 3. Paste this code and press ENTER.
 * 4. Hotkeys: NUMPAD 1 (Auto-Clicker), NUMPAD 2 (+500 Burst), F11 (Timescale 1x/2x/5x).
 */
(function () {
  'use strict';

  console.log('%c[Capybara Clicker 2 Trainer Initialized]', 'color:#00ffff;font-weight:bold;font-size:14px;');

  let activeInterval = null;
  let autoClickOn = false;

  function toggleAuto(enabled) {
    if (activeInterval) { clearInterval(activeInterval); activeInterval = null; }
    autoClickOn = !!enabled;
    if (autoClickOn) {
      activeInterval = setInterval(() => {
        const c = document.getElementById('unity-canvas') || document.querySelector('canvas');
        if (c) {
          const rect = c.getBoundingClientRect();
          const x = rect.left + rect.width * 0.30;
          const y = rect.top + rect.height * 0.55;
          c.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
          c.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
        }
      }, 16);
      console.log('%c[Turbo Clicker] ON (~60 clicks/sec)', 'color:#00ff00;');
    } else {
      console.log('%c[Turbo Clicker] OFF', 'color:#ff5555;');
    }
  }

  function burst(count = 500) {
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
      if (++sent >= count) {
        clearInterval(t);
        console.log('%c[Burst Clicker] 500 Clicks Completed!', 'color:#00ff00;');
      }
    }, 4);
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
    console.log(`%c[Timescale] Set to ${speedState.toFixed(1)}x`, 'color:#ffff00;');
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Numpad1') { e.preventDefault(); toggleAuto(!autoClickOn); }
    else if (e.code === 'Numpad2') { e.preventDefault(); burst(500); }
    else if (e.code === 'F11') { e.preventDefault(); cycleSpeed(); }
  }, true);

  console.log('Ready! Controls: NUMPAD 1 (Auto-Clicker), NUMPAD 2 (+500 Clicks), F11 (Timescale 1x/2x/5x).');
})();
