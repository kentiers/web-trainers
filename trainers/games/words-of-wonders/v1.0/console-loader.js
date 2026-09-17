/**
 * Words of Wonders - Direct DevTools Console Injector
 *
 * How to use:
 * 1. Open game: https://www.crazygames.com/game/words-of-wonders
 * 2. Press F12 -> Console -> Switch context dropdown to "index.html" (words-of-wonders frame)
 * 3. Paste this code and press ENTER.
 * 4. Controls:
 *    - NUMPAD 1: +999K Green Gems
 *    - NUMPAD 2: 999 Free Hints & Hammers
 *    - F11: Cycle Timescale (1x / 2x / 5x)
 */
(function () {
  'use strict';

  console.log('%c[Words of Wonders Trainer Active]', 'color:#00ffff;font-weight:bold;font-size:14px;');

  function addGems() {
    const raw = localStorage.getItem('SDK_DATA_21760') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    let wow = {};
    try { wow = JSON.parse(sdk.data["words-of-wonders:data"] || '{}'); } catch (e) {}
    wow["words-of-wonders:current_gem_count"] = "999999";
    const newJson = JSON.stringify(wow);
    sdk.data["words-of-wonders:data"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_21760', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem("words-of-wonders:data", newJson); } catch (e) {}
    }
    console.log('%c[Economy] +999,999 Gems Injected! (F5 to apply)', 'color:#00ff00;');
  }

  function addHints() {
    const raw = localStorage.getItem('SDK_DATA_21760') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    let wow = {};
    try { wow = JSON.parse(sdk.data["words-of-wonders:data"] || '{}'); } catch (e) {}
    wow["words-of-wonders:free_hint_count"] = "999";
    wow["words-of-wonders:free_hammer_hint_count"] = "999";
    const newJson = JSON.stringify(wow);
    sdk.data["words-of-wonders:data"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_21760', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem("words-of-wonders:data", newJson); } catch (e) {}
    }
    console.log('%c[Hints] 999 Free Hints & Hammers Injected! (F5 to apply)', 'color:#00ff00;');
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
    if (e.code === 'Numpad1') { e.preventDefault(); addGems(); }
    else if (e.code === 'Numpad2') { e.preventDefault(); addHints(); }
    else if (e.code === 'F11') { e.preventDefault(); cycleSpeed(); }
  }, true);

  console.log('Ready! Hotkeys: NUMPAD 1 (+999K Gems), NUMPAD 2 (999 Hints), F11 (Speed).');
})();
