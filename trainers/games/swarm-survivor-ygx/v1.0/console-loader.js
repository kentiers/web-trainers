/**
 * Swarm Survivor - Direct DevTools Console Injector
 *
 * How to use:
 * 1. Open game: https://www.crazygames.com/game/swarm-survivor-ygx
 * 2. Press F12 -> Console -> Switch execution context dropdown to "index.html" (swarm-survivor frame)
 * 3. Paste this code and press ENTER.
 * 4. Controls:
 *    - NUMPAD 1: God Mode & 5000% Damage (Overclocked Mothership)
 *    - NUMPAD 2: +999K Coins & +99K Gems
 *    - NUMPAD 3: Unlock All 12 Weapons
 *    - F11: Cycle Timescale (1x / 2x / 5x)
 */
(function () {
  'use strict';

  console.log('%c[Swarm Survivor Trainer Active]', 'color:#00ffff;font-weight:bold;font-size:14px;');

  function godMode() {
    const god = {
      nextIndex: 50,
      totalPurchased: 100,
      visibleCards: [
        { seqIdx: 50, price: 200 },
        { seqIdx: 51, price: 200 },
        { seqIdx: 52, price: 200 }
      ],
      stats: {
        damagePercent: 5000,
        hpPercent: 10000,
        moveSpeedPercent: 60,
        pickupRangePercent: 2000,
        cooldownPercent: 85,
        xpBonusPercent: 500,
        coinsPercent: 500,
        areaPercent: 300,
        multiShotPercent: 200,
        chainReactionPercent: 100
      }
    };
    localStorage.setItem('space-survivor-mothership', JSON.stringify(god));
    console.log('%c[God Mode] +10000% HP, +5000% Damage, +2000% Magnet Applied!', 'color:#00ff00;');
  }

  function addMoney() {
    localStorage.setItem('space-survivor-coins', '999999');
    localStorage.setItem('space-survivor-gems', '99999');
    localStorage.setItem('space-survivor-xp', '50000');
    console.log('%c[Economy] +999,999 Coins & +99,999 Gems Injected!', 'color:#00ff00;');
  }

  function unlockWeapons() {
    const all = [
      "blaster", "blaster_drone", "orbiter", "missile_launcher",
      "grenade", "sprayer", "shotgun", "drill_missile",
      "boomer_missile", "sniper", "cluster_bomb", "melee_drone"
    ];
    localStorage.setItem('space-survivor-weaponUnlocks', JSON.stringify(all));
    console.log('%c[Arsenal] All 12 Weapons Unlocked!', 'color:#00ff00;');
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
    if (e.code === 'Numpad1') { e.preventDefault(); godMode(); }
    else if (e.code === 'Numpad2') { e.preventDefault(); addMoney(); }
    else if (e.code === 'Numpad3') { e.preventDefault(); unlockWeapons(); }
    else if (e.code === 'F11') { e.preventDefault(); cycleSpeed(); }
  }, true);

  console.log('Ready! Hotkeys: NUMPAD 1 (God Mode), NUMPAD 2 (+999K Funds), NUMPAD 3 (Weapons), F11 (Speed).');
})();
