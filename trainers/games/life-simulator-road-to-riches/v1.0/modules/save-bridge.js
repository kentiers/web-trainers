/**
 * Life Simulator: Road to Riches - Full Reverse Engineered Cipher & Save Engine
 *
 * Algorithm Discovered:
 * - Cipher Salt: "MySuPeRSeCrEtKey432890fjhDSA"
 * - Multiplier: 17
 * - Offset: 23
 * - Checksum: DJB2 hash over string + secret key modulo 4294967296
 */
const SECRET_KEY = "MySuPeRSeCrEtKey432890fjhDSA";

export function simple_hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash * 33) + str.charCodeAt(i)) % 4294967296;
  }
  for (let i = 0; i < SECRET_KEY.length; i++) {
    hash = ((hash * 33) + SECRET_KEY.charCodeAt(i)) % 4294967296;
  }
  return hash.toString();
}

export function encode(val) {
  return (val * 17 + 23).toString();
}

export function decode(enc) {
  const n = parseFloat(enc);
  return (n - 23) / 17;
}

export function serializeHDTB(jsonStr) {
  const payload = new TextEncoder().encode(jsonStr);
  const buf = new Uint8Array(28 + payload.length);
  const view = new DataView(buf.buffer);
  buf[0] = 0x48; buf[1] = 0x44; buf[2] = 0x54; buf[3] = 0x42;
  view.setUint32(4, 4, true);
  view.setUint32(8, 1, true);
  buf[12] = 0x04; buf[13] = 0x04;
  view.setUint32(14, 6, true);
  buf.set(new TextEncoder().encode("player"), 18);
  view.setUint32(24, payload.length, true);
  buf.set(payload, 28);
  return buf;
}

export class LifeSimSavePatcher {
  constructor(storageKey = 'SDK_DATA_78464') {
    this.storageKey = storageKey;
  }

  getSave() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const sdk = JSON.parse(raw);
      if (!sdk.data || !sdk.data.player_save) return null;
      return {
        sdk,
        playerSave: JSON.parse(sdk.data.player_save)
      };
    } catch (e) {
      return null;
    }
  }

  async applyPatch({ moneyDelta = 0, maxStats = false }) {
    const data = this.getSave();
    if (!data) return false;

    const { sdk, playerSave } = data;

    // 1. Mutate Money with valid hash
    if (moneyDelta) {
      const curEnc = playerSave.protected?.money || "23";
      const curMoney = decode(curEnc);
      const newMoney = Math.max(0, curMoney + moneyDelta);
      const encM = encode(newMoney);
      playerSave.protected.money = encM;
      playerSave.hashes.money = simple_hash(encM);
    }

    // 2. Mutate Health & Mood with valid hashes
    if (maxStats) {
      const encH = encode(100);
      playerSave.protected.health = encH;
      playerSave.hashes.health = simple_hash(encH);

      const encM = encode(100);
      playerSave.protected.mood = encM;
      playerSave.hashes.mood = simple_hash(encM);

      if (playerSave.plain) {
        playerSave.plain.is_ads_disabled = true;
        playerSave.plain.is_time_control_buyed = true;
        playerSave.plain.is_immortality_elixir_owned = true;
        playerSave.plain.is_premium_card_owned = true;
      }
    }
    // 3. Serialize and save to localStorage
    const newJson = JSON.stringify(playerSave);
    sdk.data.player_save = newJson;
    sdk.metadata = { date: new Date().toISOString() };
    localStorage.setItem(this.storageKey, JSON.stringify(sdk));

    // 4. Update CrazyGames SDK In-Memory DataModule
    if (window.CrazyGames?.SDK?.data?.setItem) {
      try { window.CrazyGames.SDK.data.setItem('player_save', newJson); } catch (e) {}
    }

    // 5. Update Defold Engine IndexedDB Binary File (/data/.Rich Life Simulator/local_player)
    try {
      const req = indexedDB.open('/data');
      req.onsuccess = (ev) => {
        const db = ev.target.result;
        if (db.objectStoreNames.contains('FILE_DATA')) {
          const tx = db.transaction('FILE_DATA', 'readwrite');
          tx.objectStore('FILE_DATA').put({
            timestamp: new Date(),
            mode: 33206,
            contents: serializeHDTB(newJson)
          }, '/data/.Rich Life Simulator/local_player');
        }
      };
    } catch (e) {}

    return true;
  }
}
