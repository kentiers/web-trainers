/**
 * Tile Clash - Save Editor & Storage Patcher
 * Targets CrazyGames SDK_DATA_121168 storage schema.
 */
export class TileClashSaveEditor {
  constructor(storageKey = 'SDK_DATA_121168') {
    this.storageKey = storageKey;
  }

  getSaveData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : { data: {} };
    } catch (e) {
      return { data: {} };
    }
  }

  injectCoinsAndLevels(coins = 999999, levels = 100) {
    const sdk = this.getSaveData();
    if (!sdk.data) sdk.data = {};

    let pistazo = { version: 2, data: {} };
    try {
      pistazo = JSON.parse(sdk.data["pistazo/save"] || '{"version":2,"data":{}}');
    } catch (e) {}

    if (!pistazo.data) pistazo.data = {};
    pistazo.data.coins = coins;
    pistazo.data.unlocked = levels;
    pistazo.data.wins = 999;
    pistazo.data.streak = 999;

    const newJson = JSON.stringify(pistazo);
    sdk.data["pistazo/save"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };

    localStorage.setItem(this.storageKey, JSON.stringify(sdk));

    if (window.CrazyGames?.SDK?.data?.setItem) {
      try {
        window.CrazyGames.SDK.data.setItem("pistazo/save", newJson);
      } catch (e) {}
    }
    return { coins, levels };
  }
}
