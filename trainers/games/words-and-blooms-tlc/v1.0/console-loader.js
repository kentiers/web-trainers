/**
 * Words and Blooms - Direct DevTools Console Injector
 *
 * How to use:
 * 1. Open game: https://www.crazygames.com/game/words-and-blooms-tlc
 * 2. Press F12 -> Console -> Switch context dropdown to "index.html" (words-and-blooms frame)
 * 3. Paste this code and press ENTER.
 * 4. Controls:
 *    - NUMPAD 1: Max Stats & 999K High Score
 *    - NUMPAD 2: Skip All Tutorials & Intros
 *    - F11: Cycle Timescale (0.5x Slow-Mo / 1x / 2x / 5x)
 */
(function () {
  'use strict';

  console.log('%c[Words & Blooms Trainer Active]', 'color:#00ffff;font-weight:bold;font-size:14px;');

  function setStats() {
    const stats = {
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
    localStorage.setItem('wordsandcrowns.stats.v1', JSON.stringify(stats));
    localStorage.setItem('wordsandcrowns.stats.timed.v1', JSON.stringify(stats));
    localStorage.setItem('wordsandblooms.stats.rush.v1', JSON.stringify(stats));
    console.log('%c[Stats] 999K Score & Max Stats Applied!', 'color:#00ff00;');
  }

  function skipTuts() {
    localStorage.setItem('wordsandblooms.tutorial.done.v1', '1');
    localStorage.setItem('wordsandblooms.bloomintro.hide', '1');
    localStorage.setItem('wordsandblooms.rush.hideintro', '1');
    localStorage.setItem('wordsandblooms.bloom.used', '1');
    console.log('%c[Tutorials] All Tutorials Skipped!', 'color:#00ff00;');
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
    console.log(`%c[Timescale] Set to ${speedState.toFixed(1)}x`, 'color:#ffff00;');
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Numpad1') { e.preventDefault(); setStats(); }
    else if (e.code === 'Numpad2') { e.preventDefault(); skipTuts(); }
    else if (e.code === 'F11') { e.preventDefault(); cycleSpeed(); }
  }, true);

  console.log('Ready! Controls: NUMPAD 1 (999K Score), NUMPAD 2 (Skip Tutorials), F11 (Timescale).');
})();
