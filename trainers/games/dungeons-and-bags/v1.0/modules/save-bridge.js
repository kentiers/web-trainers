/**
 * Dungeons and Bags (v1.0) - Precision Live RAM & Storage Patcher
 * Directly mutates C# PlayerData struct inside WebAssembly HEAPU32
 * and synchronizes CrazyGames SDK storage.
 */
export class DnbRamPatcher {
  constructor() {
    this.storageKey = 'SDK_DATA_70791';
  }

  get heap() {
    return window.unityGameInstance?.Module?.HEAPU32 || null;
  }

  getSavedData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const sdk = JSON.parse(raw);
      if (!sdk.data || !sdk.data['dungeon.json']) return null;
      return {
        sdk,
        dungeon: JSON.parse(sdk.data['dungeon.json'])
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Locates the live C# PlayerData struct in WebAssembly heap
   */
  findPlayerIndex(savedGems, savedCoins) {
    const h = this.heap;
    if (!h) return -1;
    for (let i = 0; i < h.length - 15; i++) {
      if (h[i] === savedGems && h[i + 1] === savedCoins) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Mutates both live WebAssembly RAM and persistent JSON storage
   */
  async patch(coinDelta = 0, gemDelta = 0, unlockHeroes = false, maxStats = false) {
    const data = this.getSavedData();
    if (!data || !data.dungeon.playerData) return false;

    const p = data.dungeon.playerData;
    const oldCoins = p.coins;
    const oldGems = p.currency;

    // 1. Mutate Live WebAssembly RAM
    const h = this.heap;
    if (h) {
      const idx = this.findPlayerIndex(oldGems, oldCoins);
      if (idx !== -1) {
        if (coinDelta) h[idx + 1] += coinDelta;
        if (gemDelta) h[idx] += gemDelta;
        if (maxStats) {
          h[idx + 5] = 5; // Health
          h[idx + 6] = 5; // Strength
          h[idx + 7] = 5; // Luck
          h[idx + 8] = 5; // Dodge
        }
      }
    }

    // 2. Mutate Storage
    if (coinDelta) p.coins = (p.coins || 0) + coinDelta;
    if (gemDelta) p.currency = (p.currency || 0) + gemDelta;
    if (unlockHeroes) p.heroLockStatus = [0, 0, 0, 0, 0];
    if (maxStats) {
      p.upgradeHealth = 5;
      p.upgradeStrength = 5;
      p.upgradeLucky = 5;
      p.upgradeDodge = 5;
    }

    const newDungeonStr = JSON.stringify(data.dungeon);
    data.sdk.data['dungeon.json'] = newDungeonStr;
    localStorage.setItem(this.storageKey, JSON.stringify(data.sdk));

    // 3. Update CrazyGames SDK In-Memory cache
    if (window.CrazyGames?.SDK?.data?.getDataModule) {
      try {
        const dm = await window.CrazyGames.SDK.data.getDataModule();
        if (dm?.dataHandler?.data) {
          dm.dataHandler.data['dungeon.json'] = newDungeonStr;
        }
      } catch (e) {}
    }

    return true;
  }
}
