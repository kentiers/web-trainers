/**
 * Hangman - Direct DevTools Console Injector
 *
 * How to use:
 * 1. Open game: https://www.crazygames.com/game/hangman-cfc
 * 2. Press F12 -> Console -> Switch context to "index.html" (hangman frame)
 * 3. Paste this code and press ENTER.
 * 4. Controls:
 *    - NUMPAD 1: +999K Diamonds
 *    - F11: Cycle Timescale (1x / 2x / 5x)
 */
(function () {
  'use strict';

  console.log('%c[Hangman Trainer Active]', 'color:#00ffff;font-weight:bold;font-size:14px;');

  function addDiamonds() {
    const raw = localStorage.getItem('CrazyGames-Game-Hangman-v1.2') || '{}';
    const save = JSON.parse(raw);
    save.diamond = 999999;
    save.firstTimer = false;
    save.clueClicked = true;
    localStorage.setItem('CrazyGames-Game-Hangman-v1.2', JSON.stringify(save));
    console.log('%c[Economy] +999,999 Diamonds Injected! (F5 to apply)', 'color:#00ff00;');
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
    if (e.code === 'Numpad1') { e.preventDefault(); addDiamonds(); }
    else if (e.code === 'F11') { e.preventDefault(); cycleSpeed(); }
  }, true);

  console.log('Ready! Hotkeys: NUMPAD 1 (+999K Diamonds), F11 (Speed).');
})();
