/**
 * Capybara Clicker 2 - Direct DevTools Console Injector v1.1
 *
 * How to use:
 * 1. Open game on CrazyGames: https://www.crazygames.com/game/capybara-clicker-2
 * 2. Press F12 -> Console -> Switch execution context dropdown to "capybara-clicker-2.html"
 * 3. Paste this code and press ENTER.
 * 4. Hotkeys:
 *    - NUMPAD 1: Toggle Turbo Auto-Clicker
 *    - NUMPAD 2: Toggle Smart Upgrade (Auto-Buyer)
 *    - NUMPAD 3: Unlock All Cosmetics & 999 Spins
 *    - F11: Cycle Timescale (1.0x / 2.0x / 5.0x)
 */
(function () {
  'use strict';

  console.log('%c[Capybara Clicker 2 Trainer v1.1 Active]', 'color:#00ffff;font-weight:bold;font-size:14px;');

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

  let smartUpgradeInterval = null;
  let smartUpgradeOn = false;

  function toggleSmartUpgrade(enabled) {
    if (smartUpgradeInterval) { clearInterval(smartUpgradeInterval); smartUpgradeInterval = null; }
    smartUpgradeOn = !!enabled;
    if (smartUpgradeOn) {
      const slots = [0.28, 0.39, 0.50, 0.61];
      let idx = 0;
      smartUpgradeInterval = setInterval(() => {
        const c = document.getElementById('unity-canvas') || document.querySelector('canvas');
        if (c) {
          const rect = c.getBoundingClientRect();
          const x = rect.left + rect.width * 0.58;
          const y = rect.top + rect.height * slots[idx];
          c.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
          c.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
          idx = (idx + 1) % slots.length;
        }
      }, 600);
      console.log('%c[Smart Upgrade] ON (Auto-buying tiers)', 'color:#00ff00;');
    } else {
      console.log('%c[Smart Upgrade] OFF', 'color:#ff5555;');
    }
  }

  function unlockAll() {
    try {
      const req = indexedDB.open('/idbfs');
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('FILE_DATA')) return;
        const tx = db.transaction('FILE_DATA', 'readwrite');
        const st = tx.objectStore('FILE_DATA');
        const reqKeys = st.getAllKeys();
        reqKeys.onsuccess = () => {
          const fileKey = reqKeys.result.find(k => typeof k === 'string' && k.endsWith('Stats.dat'));
          if (!fileKey) return;
          const getVal = st.get(fileKey);
          getVal.onsuccess = () => {
            const fileObj = getVal.result;
            if (!fileObj || !fileObj.contents) return;
            const u8 = new Uint8Array(fileObj.contents);
            const view = new DataView(u8.buffer);

            const lastBiPattern = [0x01, 0xf2, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff];
            for (let i = 4000; i < 5000; i++) {
              let m = true;
              for (let j = 0; j < lastBiPattern.length; j++) {
                if (u8[i + j] !== lastBiPattern[j]) { m = false; break; }
              }
              if (m) {
                const intBlockStart = i + lastBiPattern.length + 5;
                view.setInt32(intBlockStart + 16, 10000, true);
                view.setInt32(intBlockStart + 32, 999, true);
                break;
              }
            }

            const arrayPattern = [0x40, 0x00, 0x00, 0x00, 0x08];
            for (let i = 0; i < u8.length - 10; i++) {
              let m = true;
              for (let j = 0; j < arrayPattern.length; j++) {
                if (u8[i + j] !== arrayPattern[j]) { m = false; break; }
              }
              if (m) {
                const dataOffset = i + arrayPattern.length;
                for (let k = 0; k < 64; k++) {
                  view.setInt32(dataOffset + k * 4, 1, true);
                }
              }
            }

            const curPattern = [0x01, 0xfb, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff];
            for (let i = 4000; i < 5000; i++) {
              let m = true;
              for (let j = 0; j < curPattern.length; j++) {
                if (u8[i + j] !== curPattern[j]) { m = false; break; }
              }
              if (m) {
                view.setInt32(i + curPattern.length, 50000000, true);
                view.setInt32(i - 5, 50000000, true);
                break;
              }
            }

            fileObj.timestamp = new Date();
            st.put(fileObj, fileKey);
            console.log('%c[Success] All Cosmetics, 999 Spins & +50M Injected! Reload page to apply.', 'color:#00ff00;font-weight:bold;');
          };
        };
      };
    } catch (e) {
      console.error('Unlock error:', e);
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
    if (e.code === 'Numpad1') { e.preventDefault(); toggleAuto(!autoClickOn); }
    else if (e.code === 'Numpad2') { e.preventDefault(); toggleSmartUpgrade(!smartUpgradeOn); }
    else if (e.code === 'Numpad3') { e.preventDefault(); unlockAll(); }
    else if (e.code === 'F11') { e.preventDefault(); cycleSpeed(); }
  }, true);

  console.log('Ready! Controls: NUMPAD 1 (Auto-Clicker), NUMPAD 2 (Smart Upgrade), NUMPAD 3 (Unlock All & 999 Spins), F11 (Timescale 1x/2x/5x).');
})();
