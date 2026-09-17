/**
 * Chicken Hell - Direct DevTools Console Injector v1.1
 *
 * How to use:
 * 1. Open game: https://www.crazygames.com/game/chicken-hell
 * 2. Press F12 -> Console -> Switch context dropdown to "chicken-hell.html"
 * 3. Paste this code and press ENTER.
 * 4. Controls:
 *    - NUMPAD 1: +999K Gold Rings
 *    - NUMPAD 2: Unlock All 7 Skins
 *    - NUMPAD 3: 999 Free Wheel Spins
 *    - NUMPAD 4: Toggle Turbo Boost
 *    - F11: Cycle Timescale (1x / 2x / 5x)
 */
(function () {
  'use strict';

  console.log('%c[Chicken Hell Trainer v1.1 Active]', 'color:#00ffff;font-weight:bold;font-size:14px;');

  function addRings() {
    const raw = localStorage.getItem('SDK_DATA_65663') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    sdk.data.INT_CURRENCY = "9999999";
    sdk.data.STATISTIC_CURRENCY_EARNED = "9999999";
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_65663', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem('INT_CURRENCY', '9999999'); } catch (e) {}
    }
    console.log('%c[Economy] +999K Gold Rings Injected! (F5 to apply)', 'color:#00ff00;');
  }

  function unlockSkins() {
    const raw = localStorage.getItem('SDK_DATA_65663') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    const guids = [
      "1382d6ce-37ab-6fb4-eaeb-489bddc16c4c", // Default
      "279e6016-a25c-dd84-8acf-56d0f3f82227", // Alien
      "ce19aa6b-03c9-8924-fa46-cf1d060548a9", // Pink
      "5fb8c559-daa6-0204-aba9-d216c07f9773", // Yellow
      "0e728ed8-256d-d944-69a8-a76b9e424302", // Green
      "8abbdcc2-6147-72e4-7b3a-182da79ad814", // Turtle
      "de442ee2-a439-cca4-2bf1-187616fce721"  // Purple
    ];
    for (const g of guids) {
      sdk.data[`COSMETIC_ISUNLOCKED_${g}`] = "1";
    }
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_65663', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      for (const g of guids) {
        try { window.CrazyGames.SDK.data.setItem(`COSMETIC_ISUNLOCKED_${g}`, "1"); } catch (e) {}
      }
    }
    console.log('%c[Skins] All 7 Skins Unlocked! (F5 to apply)', 'color:#00ff00;font-weight:bold;');
  }

  function addSpins() {
    const raw = localStorage.getItem('SDK_DATA_65663') || '{"data":{}}';
    const sdk = JSON.parse(raw);
    if (!sdk.data) sdk.data = {};
    sdk.data.FREE_WHEEL_SPINS_LEFT = "999";
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem('SDK_DATA_65663', JSON.stringify(sdk));
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem('FREE_WHEEL_SPINS_LEFT', '999'); } catch (e) {}
    }
    console.log('%c[Wheel] 999 Free Spins Granted! (F5 to apply)', 'color:#00ff00;');
  }

  let boostTimer = null;
  let boostOn = false;

  function toggleBoost(enabled) {
    if (boostTimer) { clearInterval(boostTimer); boostTimer = null; }
    boostOn = !!enabled;
    if (boostOn) {
      boostTimer = setInterval(() => {
        const c = document.getElementById('unity-canvas') || document.querySelector('canvas');
        if (c) {
          const rect = c.getBoundingClientRect();
          const x = rect.left + rect.width * 0.5;
          const y = rect.top + rect.height * 0.5;
          c.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
          c.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
        }
      }, 25);
      console.log('%c[Turbo Boost] ON (~40 boosts/sec)', 'color:#00ff00;');
    } else {
      console.log('%c[Turbo Boost] OFF', 'color:#ff5555;');
    }
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
    if (e.code === 'Numpad1') { e.preventDefault(); addRings(); }
    else if (e.code === 'Numpad2') { e.preventDefault(); unlockSkins(); }
    else if (e.code === 'Numpad3') { e.preventDefault(); addSpins(); }
    else if (e.code === 'Numpad4') { e.preventDefault(); toggleBoost(!boostOn); }
    else if (e.code === 'F11') { e.preventDefault(); cycleSpeed(); }
  }, true);

  console.log('Ready! Hotkeys: NUMPAD 1 (+999K Rings), NUMPAD 2 (All Skins), NUMPAD 3 (999 Spins), NUMPAD 4 (Boost), F11 (Speed).');
})();
