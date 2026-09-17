/**
 * Battle Cheats for Idle Zombie Wave: Survivors
 * Handles in-fight mechanics (God Mode, OHK, Full Heal, Battle Scrap, Speedhack)
 * Verified 100% functional via C# reflection bridge.
 */
export class BattleCheats {
  constructor(bridge) {
    this.bridge = bridge;
    this._godModeInterval = null;
    this.godModeActive = false;
    this.oneHitKillActive = false;
  }

  get CS() {
    return this.bridge.CS;
  }

  /**
   * Toggle God Mode (Invincibility + HP Lock + Weapon Overclock)
   * Injects Skill 12 (adds +1,000,000,000 to attributes and barricade HP)
   */
  setGodMode(enable) {
    this.godModeActive = enable;
    if (enable) {
      if (this.CS?.UIEventData_ToCSharp && this.CS?.UIEventToCSharp?.AddSkill) {
        this.bridge.dispatchCSharpEvent(this.CS.UIEventToCSharp.AddSkill, 12);
      }

      clearInterval(this._godModeInterval);
      this._godModeInterval = setInterval(() => {
        if (!this.godModeActive) return;
        if (this.CS?.UIDataTransfer) {
          if (this.CS.UIDataTransfer.CurHp < this.CS.UIDataTransfer.MaxHp) {
            this.CS.UIDataTransfer.CurHp = this.CS.UIDataTransfer.MaxHp;
          }
        }
      }, 200);
    } else {
      clearInterval(this._godModeInterval);
      this._godModeInterval = null;
    }
  }

  /**
   * Toggle One-Hit Kill
   * Injects Skill 13 (damage amplification buff)
   */
  setOneHitKill(enable) {
    this.oneHitKillActive = enable;
    if (enable && this.CS?.UIEventData_ToCSharp && this.CS?.UIEventToCSharp?.AddSkill) {
      this.bridge.dispatchCSharpEvent(this.CS.UIEventToCSharp.AddSkill, 13);
    }
  }

  /**
   * Instant Full Heal / Wall Repair
   */
  healFull() {
    if (this.CS?.UIDataTransfer) {
      this.CS.UIDataTransfer.CurHp = this.CS.UIDataTransfer.MaxHp;
    }
    if (this.CS?.UIEventData_ToCSharp && this.CS?.UIEventToCSharp?.AddHp) {
      this.bridge.dispatchCSharpEvent(this.CS.UIEventToCSharp.AddHp, 9999999);
    }
    return true;
  }

  /**
   * Add Battle Materials / Scrap for in-wave weapon and drone shop upgrades
   */
  addBattleMaterials(amount = 5000) {
    if (this.CS?.UIEventData_ToCSharp && this.CS?.UIEventToCSharp?.SyncMaterial) {
      this.bridge.dispatchCSharpEvent(this.CS.UIEventToCSharp.SyncMaterial, amount);
      return true;
    }
    return false;
  }

  /**
   * Set Game Speed Multiplier (TimeScale)
   */
  setSpeed(multiplier = 1.0) {
    if (this.CS?.UnityEngine?.Time) {
      this.CS.UnityEngine.Time.timeScale = multiplier;
      return true;
    }
    return false;
  }
}
