/**
 * Capybara Clicker 2 - Clicker & Input Cheats Engine
 */
import { UnityEngineBridge } from './engine-bridge.js';

export class CapybaraClickerCheats {
  constructor() {
    this.bridge = new UnityEngineBridge();
    this.autoClickTimer = null;
    this.isAutoClicking = false;
  }

  toggleAutoClicker(enabled, intervalMs = 16) {
    if (this.autoClickTimer) {
      clearInterval(this.autoClickTimer);
      this.autoClickTimer = null;
    }
    this.isAutoClicking = !!enabled;
    if (this.isAutoClicking) {
      this.autoClickTimer = setInterval(() => {
        const c = this.bridge.getCanvas();
        if (c) {
          const coords = this.bridge.getClickTargetCoords(c);
          this.bridge.dispatchClick(coords.x, coords.y, c);
        }
      }, intervalMs);
    }
    return this.isAutoClicking;
  }

  triggerBurst(count = 500, intervalMs = 4) {
    let sent = 0;
    const t = setInterval(() => {
      const c = this.bridge.getCanvas();
      if (c) {
        const coords = this.bridge.getClickTargetCoords(c);
        this.bridge.dispatchClick(coords.x, coords.y, c);
      }
      if (++sent >= count) clearInterval(t);
    }, intervalMs);
  }

  setTimescale(speed = 1.0) {
    if (typeof window.applyUniversalSpeed === 'function') {
      window.applyUniversalSpeed(speed);
    }
  }
}
