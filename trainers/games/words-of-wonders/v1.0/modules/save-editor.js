/**
 * Words of Wonders - Save Editor & Storage Patcher
 * Targets window.famobi.localStorage & CrazyGames SDK_DATA_21760.
 */
export class WowSaveEditor {
  constructor(storageKey = 'SDK_DATA_21760') {
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

  injectGemsAndHints(gems = 999999, hints = 999) {
    // 1. Direct Famobi RAM Storage injection (Immediate)
    if (typeof window !== 'undefined' && window.famobi?.localStorage) {
      try {
        window.famobi.localStorage.setItem('current_gem_count', gems.toString());
        window.famobi.localStorage.setItem('free_hint_count', hints.toString());
        window.famobi.localStorage.setItem('free_hammer_hint_count', hints.toString());
      } catch (e) {}
    }

    // 2. LocalStorage SDK_DATA persistence
    const sdk = this.getSaveData();
    if (!sdk.data) sdk.data = {};

    let wowData = {};
    try {
      wowData = JSON.parse(sdk.data["words-of-wonders:data"] || '{}');
    } catch (e) {}

    wowData["words-of-wonders:current_gem_count"] = gems.toString();
    wowData["words-of-wonders:free_hint_count"] = hints.toString();
    wowData["words-of-wonders:free_hammer_hint_count"] = hints.toString();

    const newJson = JSON.stringify(wowData);
    sdk.data["words-of-wonders:data"] = newJson;
    sdk.metadata = { date: new Date().toISOString() };

    localStorage.setItem(this.storageKey, JSON.stringify(sdk));

    if (window.CrazyGames?.SDK?.data?.setItem) {
      try {
        window.CrazyGames.SDK.data.setItem("words-of-wonders:data", newJson);
      } catch (e) {}
    }
    return { gems, hints };
  }
}
