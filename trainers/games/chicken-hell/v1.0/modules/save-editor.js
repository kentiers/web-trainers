/**
 * Chicken Hell - Save Editor & Storage Patcher
 * Targets CrazyGames SDK_DATA_65663 storage schema.
 */
export class ChickenSaveEditor {
  constructor(storageKey = 'SDK_DATA_65663') {
    this.storageKey = storageKey;
    this.skinGuids = [
      "1382d6ce-37ab-6fb4-eaeb-489bddc16c4c", // Default
      "279e6016-a25c-dd84-8acf-56d0f3f82227", // Alien
      "ce19aa6b-03c9-8924-fa46-cf1d060548a9", // Pink
      "5fb8c559-daa6-0204-aba9-d216c07f9773", // Yellow
      "0e728ed8-256d-d944-69a8-a76b9e424302", // Green
      "8abbdcc2-6147-72e4-7b3a-182da79ad814", // Turtle
      "de442ee2-a439-cca4-2bf1-187616fce721"  // Purple
    ];
  }

  getSaveData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : { data: {} };
    } catch (e) {
      return { data: {} };
    }
  }

  injectRings(amount = 9999999) {
    const sdk = this.getSaveData();
    if (!sdk.data) sdk.data = {};
    sdk.data.INT_CURRENCY = amount.toString();
    sdk.data.STATISTIC_CURRENCY_EARNED = amount.toString();
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem(this.storageKey, JSON.stringify(sdk));

    if (window.CrazyGames?.SDK?.data?.setItem) {
      try {
        window.CrazyGames.SDK.data.setItem('INT_CURRENCY', amount.toString());
      } catch (e) {}
    }
    return amount;
  }

  unlockAllSkins() {
    const sdk = this.getSaveData();
    if (!sdk.data) sdk.data = {};
    for (const guid of this.skinGuids) {
      sdk.data[`COSMETIC_ISUNLOCKED_${guid}`] = "1";
    }
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem(this.storageKey, JSON.stringify(sdk));

    if (window.CrazyGames?.SDK?.data?.setItem) {
      for (const guid of this.skinGuids) {
        try {
          window.CrazyGames.SDK.data.setItem(`COSMETIC_ISUNLOCKED_${guid}`, "1");
        } catch (e) {}
      }
    }
    return this.skinGuids;
  }

  grantSpins(count = 999) {
    const sdk = this.getSaveData();
    if (!sdk.data) sdk.data = {};
    sdk.data.FREE_WHEEL_SPINS_LEFT = count.toString();
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem(this.storageKey, JSON.stringify(sdk));

    if (window.CrazyGames?.SDK?.data?.setItem) {
      try {
        window.CrazyGames.SDK.data.setItem('FREE_WHEEL_SPINS_LEFT', count.toString());
      } catch (e) {}
    }
    return count;
  }
}
