/**
 * Tile Clash - Direct DevTools Console Injector
 *
 * How to use:
 * 1. Open game: https://www.crazygames.com/game/tile-clash
 * 2. Press F12 -> Console -> Switch context to "index.html" (tile-clash frame)
 * 3. Paste this code and press ENTER.
 * 4. Controls:
 *    - NUMPAD 1: +999K Coins
 *    - NUMPAD 2: Unlock 100 Levels & 999 Wins
 *    - F11: Cycle Timescale (1x / 2x / 5x)
 */
(function () {
  'use strict';

  console.log('%c[Tile Clash Trainer Active]', 'color:#00ffff;font-weight:bold;font-size:14px;');

  function addCoins() {
    const raw = localStorage.getItem('SDK_DATA_121168') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    let p = { version: 2, data: {} };
    try { p = JSON.parse(sdk.data["pistazo/save"] || '{"version":2,"data":{}}'); } catch (e) {}
    if (!p.data) p.data = {};
    p.data.coins = 999999;
    const newJson = JSON.stringify(p);
    sdk.data["pistazo/save"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_121168', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem("pistazo/save", newJson); } catch (e) {}
    }
    console.log('%c[Economy] +999,999 Coins Injected! (F5 to apply)', 'color:#00ff00;');
  }

  function unlockLevels() {
    const raw = localStorage.getItem('SDK_DATA_121168') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    let p = { version: 2, data: {} };
    try { p = JSON.parse(sdk.data["pistazo/save"] || '{"version":2,"data":{}}'); } catch (e) {}
    if (!p.data) p.data = {};
    p.data.unlocked = 100;
    p.data.wins = 999;
    p.data.streak = 999;
    const newJson = JSON.stringify(p);
    sdk.data["pistazo/save"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_121168', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem("pistazo/save", newJson); } catch (e) {}
    }
    console.log('%c[Progression] 100 Levels & Max Streak Unlocked! (F5 to apply)', 'color:#00ff00;');
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
    if (e.code === 'Numpad1') { e.preventDefault(); addCoins(); }
    else if (e.code === 'Numpad2') { e.preventDefault(); unlockLevels(); }
    else if (e.code === 'F11') { e.preventDefault(); cycleSpeed(); }
  }, true);

  console.log('Ready! Hotkeys: NUMPAD 1 (+999K Coins), NUMPAD 2 (Unlock Levels), F11 (Speed).');
})();
