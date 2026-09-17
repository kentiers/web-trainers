/**
 * Chicken Hell - Save Editor & Storage Patcher
 * Targets CrazyGames SDK_DATA_65663 storage schema.
 */
export class ChickenSaveEditor {
  constructor(storageKey = 'SDK_DATA_65663') {
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
