/**
 * Economy & Inventory Cheats for Idle Zombie Wave: Survivors
 * Dual-syncs in-memory Player state and persistent cloud save (CS.SdkMain).
 * Verified 100% functional.
 */
export const ITEM_IDS = {
  EXP: 1,
  GOLD: 2,
  DIAMONDS: 3,
  KEY_NORMAL: 5,
  KEY_GOLD: 6,
  MEDAL: 8,
  TECH_POINTS: 9,
  ENERGY: 10,
  BLUEPRINT_ELEMENT: 11,
  BLUEPRINT_ENGINEER: 12,
  BLUEPRINT_ENERGY: 13,
  BLUEPRINT_BULLET: 14,
  WOOD: 33,
  ENERGY_CRYSTAL: 34
};

export class EconomyCheats {
  constructor(bridge) {
    this.bridge = bridge;
  }

  get CS() {
    return this.bridge.CS;
  }

  /**
   * Add items with dual-sync (memory + persistent cloud save)
   */
  async addItem(itemId, count = 1000) {
    let memoryUpdated = false;
    let cloudUpdated = false;

    // 1. Update in-memory Player.data
    try {
      const Player = this.bridge.modules.Player?.Player || window.__game_webpack_require__?.('./src/data/Player.ts')?.Player;
      if (Player?.data?.items) {
        let it = Player.data.items.find(i => i.itemId === itemId);
        if (it) {
          it.count += count;
        } else {
          const nextEid = (Player.data.itemIdSeq || 100) + 1;
          Player.data.itemIdSeq = nextEid;
          Player.data.items.push({ eid: nextEid, itemId, count, ext: '{}' });
        }
        memoryUpdated = true;
      }
    } catch (e) {
      console.warn('[EconomyCheats] Memory update error:', e);
    }

    // 2. Update persistent cloud save
    if (this.CS?.SdkMain) {
      try {
        const raw = this.CS.SdkMain.ReadCloud('idlezombie_player');
        if (raw) {
          const data = JSON.parse(raw);
          let it = data.items.find(i => i.itemId === itemId);
          if (it) {
            it.count += count;
          } else {
            const nextEid = (data.itemIdSeq || 100) + 1;
            data.itemIdSeq = nextEid;
            data.items.push({ eid: nextEid, itemId, count, ext: '{}' });
          }
          this.CS.SdkMain.SetCloud('idlezombie_player', JSON.stringify(data));
          cloudUpdated = true;
        }
      } catch (err) {
        console.error('[EconomyCheats] CloudSave update error:', err);
      }
    }

    return { success: memoryUpdated || cloudUpdated, memoryUpdated, cloudUpdated };
  }

  async addGold(amount = 500000) {
    return await this.addItem(ITEM_IDS.GOLD, amount);
  }

  async addDiamonds(amount = 50000) {
    return await this.addItem(ITEM_IDS.DIAMONDS, amount);
  }

  async addKeys(amount = 100) {
    await this.addItem(ITEM_IDS.KEY_NORMAL, amount);
    return await this.addItem(ITEM_IDS.KEY_GOLD, amount);
  }

  async addEnergy(amount = 500) {
    return await this.addItem(ITEM_IDS.ENERGY, amount);
  }

  async addTechPoints(amount = 2000) {
    return await this.addItem(ITEM_IDS.TECH_POINTS, amount);
  }

  async addBuildingSupplies(amount = 5000) {
    await this.addItem(ITEM_IDS.WOOD, amount);
    return await this.addItem(ITEM_IDS.ENERGY_CRYSTAL, amount);
  }

  async addAllBlueprints(amount = 500) {
    await this.addItem(ITEM_IDS.BLUEPRINT_ELEMENT, amount);
    await this.addItem(ITEM_IDS.BLUEPRINT_ENGINEER, amount);
    await this.addItem(ITEM_IDS.BLUEPRINT_ENERGY, amount);
    return await this.addItem(ITEM_IDS.BLUEPRINT_BULLET, amount);
  }

  /**
   * Open the native developer debug/GM panel
   */
  openDeveloperGMPanel() {
    try {
      const UIGm = this.bridge.modules.UIGm?.UIGm || window.__game_webpack_require__?.('./src/ui/debug/UIGm.ts')?.UIGm;
      if (UIGm && typeof UIGm.show === 'function') {
        UIGm.show();
        return true;
      }
    } catch (e) {
      console.error('[EconomyCheats] Failed to open UIGm:', e);
    }
    return false;
  }
}
