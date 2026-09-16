import { HotkeyManager } from './HotkeyManager.js';

/**
 * Base class for all web game trainers
 * Provides cheat state management, Web Audio synthesizer for FLiNG sound fx,
 * and hotkey orchestration.
 */
export class TrainerBase {
  constructor(metadata = {}) {
    this.name = metadata.name || 'Game Trainer';
    this.game = metadata.game || 'Unknown Game';
    this.version = metadata.version || '1.0';
    this.author = metadata.author || 'Trainer Dev';
    
    this.cheats = new Map(); // id -> cheat definition
    this.hotkeys = new HotkeyManager();
    this.audioContext = null;
    this.soundEnabled = true;
    this.onStateChange = null;
  }

  /**
   * Play FLiNG style retro activation / deactivation beep
   */
  playSound(activated = true) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (!this.audioContext) return;
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      const now = this.audioContext.currentTime;
      if (activated) {
        // High ascending pitch
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      } else {
        // Low descending pitch
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      }

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  }

  /**
   * Register a toggleable cheat (ON/OFF)
   */
  registerToggle({ id, label, hotkey, onEnable, onDisable, defaultState = false, category = 'General' }) {
    const cheat = {
      id,
      type: 'toggle',
      label,
      hotkey,
      category,
      enabled: defaultState,
      onEnable,
      onDisable,
      toggle: () => {
        cheat.enabled = !cheat.enabled;
        this.playSound(cheat.enabled);
        if (cheat.enabled && onEnable) onEnable();
        if (!cheat.enabled && onDisable) onDisable();
        if (this.onStateChange) this.onStateChange(cheat);
      }
    };

    this.cheats.set(id, cheat);

    if (hotkey) {
      this.hotkeys.register(hotkey, () => cheat.toggle(), label);
    }

    return cheat;
  }

  /**
   * Register an action cheat (Execute once, e.g. Add 100,000 Gold)
   */
  registerAction({ id, label, hotkey, execute, category = 'General' }) {
    const cheat = {
      id,
      type: 'action',
      label,
      hotkey,
      category,
      execute: async (...args) => {
        this.playSound(true);
        const result = await execute(...args);
        if (this.onStateChange) this.onStateChange(cheat, result);
        return result;
      }
    };

    this.cheats.set(id, cheat);

    if (hotkey) {
      this.hotkeys.register(hotkey, () => cheat.execute(), label);
    }

    return cheat;
  }

  destroy() {
    this.hotkeys.destroy();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
