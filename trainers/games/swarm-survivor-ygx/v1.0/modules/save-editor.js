/**
 * Swarm Survivor - LocalStorage Save Editor & Economy Injector
 */
export class SwarmSaveEditor {
  constructor() {
    this.allWeapons = [
      "blaster", "blaster_drone", "orbiter", "missile_launcher",
      "grenade", "sprayer", "shotgun", "drill_missile",
      "boomer_missile", "sniper", "cluster_bomb", "melee_drone"
    ];
  }

  setCurrencies(coins = 999999, gems = 99999, xp = 50000) {
    localStorage.setItem('space-survivor-coins', coins.toString());
    localStorage.setItem('space-survivor-gems', gems.toString());
    localStorage.setItem('space-survivor-xp', xp.toString());
    return { coins, gems, xp };
  }

  unlockAllWeapons() {
    localStorage.setItem('space-survivor-weaponUnlocks', JSON.stringify(this.allWeapons));
    return this.allWeapons;
  }

  getMothership() {
    try {
      const raw = localStorage.getItem('space-survivor-mothership');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  applyGodMothership() {
    const godMothership = {
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
    localStorage.setItem('space-survivor-mothership', JSON.stringify(godMothership));
    return godMothership;
  }
}
