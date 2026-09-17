/**
 * Capybara Clicker 2 - BinaryFormatter Stats.dat Save Editor
 * Analyzes and mutates .NET BigInteger fields directly in IndexedDB /idbfs.
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

  async modifyCurrency(amount = 10000000) {
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
          const pattern = [0x01, 0xfb, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff];
          let foundIdx = -1;
          for (let i = 4000; i < 5000; i++) {
            let match = true;
            for (let j = 0; j < pattern.length; j++) {
              if (u8[i + j] !== pattern[j]) { match = false; break; }
            }
            if (match) { foundIdx = i; break; }
          }

          if (foundIdx === -1) return resolve(false);

          const curOffset = foundIdx + pattern.length;
          const view = new DataView(u8.buffer);
          view.setInt32(curOffset, amount, true);

          const lifeOffset = foundIdx - 5;
          view.setInt32(lifeOffset, Math.max(view.getInt32(lifeOffset, true), amount), true);

          fileObj.timestamp = new Date();
          st.put(fileObj, filePath);
          tx.oncomplete = () => resolve(true);
        };
      };
    });
  }
}
