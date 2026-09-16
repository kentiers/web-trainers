/**
 * Save Editor & Backup Utility for Idle Zombie Wave: Survivors
 * Interacts directly with SdkMain cloud storage and LocalStorage.
 */
export class SaveEditor {
  constructor(bridge) {
    this.bridge = bridge;
  }

  get CS() {
    return this.bridge.CS;
  }

  /**
   * Get raw JSON player save string
   */
  getRawSave() {
    if (this.CS?.SdkMain) {
      return this.CS.SdkMain.ReadCloud('idlezombie_player');
    }
    if (this.CS?.LocalStorage) {
      return this.CS.LocalStorage.Read('player');
    }
    return null;
  }

  /**
   * Parse player save to JavaScript Object
   */
  getSaveData() {
    const raw = this.getRawSave();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('[SaveEditor] JSON parse error:', e);
      return null;
    }
  }

  /**
   * Write modified data back to game storage
   */
  writeSaveData(data) {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    let ok = false;
    if (this.CS?.SdkMain) {
      this.CS.SdkMain.SetCloud('idlezombie_player', jsonStr);
      ok = true;
    }
    if (this.CS?.LocalStorage) {
      this.CS.LocalStorage.Write('player', jsonStr);
      ok = true;
    }
    return ok;
  }

  /**
   * Export save data as a downloadable JSON file
   */
  downloadBackup() {
    const raw = this.getRawSave();
    if (!raw) throw new Error('No save data found to export');

    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idle-zombie-wave-save-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Restore/Import save data from JSON string
   */
  restoreBackup(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!parsed.items || !parsed.player) {
      throw new Error('Invalid save file format');
    }
    return this.writeSaveData(jsonString);
  }

  /**
   * Unlock all heroes and set max VIP status
   */
  maxOutAccount() {
    const data = this.getSaveData();
    if (!data) return false;

    // Set VIP
    if (data.vip) {
      data.vip.lifeTime = true;
      data.vip.inSubscript = true;
      data.vip.type = 2;
    }

    // Set max currencies
    const setItem = (id, count) => {
      let it = data.items.find(i => i.itemId === id);
      if (it) it.count = count;
      else {
        const nextEid = (data.itemIdSeq || 100) + 1;
        data.itemIdSeq = nextEid;
        data.items.push({ eid: nextEid, itemId: id, count, ext: '{}' });
      }
    };

    setItem(2, 99999999);  // 100M Gold
    setItem(3, 999999);    // 1M Diamonds
    setItem(5, 9999);      // Normal Keys
    setItem(6, 9999);      // Gold Keys
    setItem(9, 99999);     // Tech Points
    setItem(10, 9999);     // Energy
    setItem(33, 99999);    // Wood
    setItem(34, 99999);    // Energy Crystal

    this.writeSaveData(data);
    return true;
  }
}
