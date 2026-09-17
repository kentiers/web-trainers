/**
 * Swarm Survivor - Mothership & Combat Cheats
 */
import { SwarmSaveEditor } from './save-editor.js';

export class SwarmCombatCheats {
  constructor() {
    this.editor = new SwarmSaveEditor();
  }

  enableGodMode() {
    this.editor.applyGodMothership();
    return true;
  }

  grantUnlimitedFunds() {
    return this.editor.setCurrencies(999999, 99999, 50000);
  }

  unlockArsenal() {
    return this.editor.unlockAllWeapons();
  }

  setTimescale(speed = 1.0) {
    if (typeof window.applyUniversalSpeed === 'function') {
      window.applyUniversalSpeed(speed);
    }
  }
}
