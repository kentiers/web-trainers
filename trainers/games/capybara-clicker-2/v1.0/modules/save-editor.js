/**
 * Capybara Clicker 2 - BinaryFormatter Stats.dat Save Editor
 * Analyzes and mutates .NET BigInteger fields and 64-element cosmetic bit arrays in IndexedDB /idbfs.
 */
export class CapybaraSaveEditor {
  constructor(dbName = '/idbfs', storeName = 'FILE_DATA') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  async findSaveFilePath() {
    return new Promise((resolve) => {
      const req = indexedDB.open(this.dbName);
      req.onerror = () => resolve(null);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.storeName)) return resolve(null);
        const tx = db.transaction(this.storeName, 'readonly');
        const st = tx.objectStore(this.storeName);
        const reqKeys = st.getAllKeys();
        reqKeys.onsuccess = () => {
          const keys = reqKeys.result;
          const match = keys.find(k => typeof k === 'string' && k.endsWith('Stats.dat'));
          resolve(match || null);
        };
      };
    });
  }

  async unlockAllCosmeticsAndSpins(currencyBonus = 50000000, spins = 999, multiplier = 10000) {
    const filePath = await this.findSaveFilePath();
    if (!filePath) return false;

    return new Promise((resolve) => {
      const req = indexedDB.open(this.dbName);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(this.storeName, 'readwrite');
        const st = tx.objectStore(this.storeName);
        const getReq = st.get(filePath);
        getReq.onsuccess = () => {
          const fileObj = getReq.result;
          if (!fileObj || !fileObj.contents) return resolve(false);

          const u8 = new Uint8Array(fileObj.contents);
          const view = new DataView(u8.buffer);

          // 1. Patch wheelSpinsCount and ascensionMultiplier
          const lastBiPattern = [0x01, 0xf2, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff];
          for (let i = 4000; i < 5000; i++) {
            let m = true;
            for (let j = 0; j < lastBiPattern.length; j++) {
              if (u8[i + j] !== lastBiPattern[j]) { m = false; break; }
            }
            if (m) {
              const intBlockStart = i + lastBiPattern.length + 5;
              view.setInt32(intBlockStart + 16, multiplier, true);
              view.setInt32(intBlockStart + 32, spins, true);
              break;
            }
          }

          // 2. Unlock all 64-element cosmetic arrays (Skins, Backgrounds, Accessories)
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

          // 3. Inject currency bonus
          const curPattern = [0x01, 0xfb, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff];
          for (let i = 4000; i < 5000; i++) {
            let m = true;
            for (let j = 0; j < curPattern.length; j++) {
              if (u8[i + j] !== curPattern[j]) { m = false; break; }
            }
            if (m) {
              view.setInt32(i + curPattern.length, currencyBonus, true);
              view.setInt32(i - 5, currencyBonus, true);
              break;
            }
          }

          fileObj.timestamp = new Date();
          st.put(fileObj, filePath);
          tx.oncomplete = () => resolve(true);
        };
      };
    });
  }
}
