/**
 * Capybara Clicker 2 - Clicker & Input Cheats Engine
 */
import { UnityEngineBridge } from './engine-bridge.js';

export class CapybaraClickerCheats {
  constructor() {
    this.bridge = new UnityEngineBridge();
    this.autoClickTimer = null;
    this.isAutoClicking = false;
    this.smartUpgradeTimer = null;
    this.isSmartUpgrading = false;
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

  toggleSmartUpgrade(enabled, intervalMs = 600) {
    if (this.smartUpgradeTimer) {
      clearInterval(this.smartUpgradeTimer);
      this.smartUpgradeTimer = null;
    }
    this.isSmartUpgrading = !!enabled;
    if (this.isSmartUpgrading) {
      const slots = [0.28, 0.39, 0.50, 0.61];
      let idx = 0;
      this.smartUpgradeTimer = setInterval(() => {
        const c = this.bridge.getCanvas();
        if (c) {
          const rect = c.getBoundingClientRect();
          const x = rect.left + rect.width * 0.58;
          const y = rect.top + rect.height * slots[idx];
          this.bridge.dispatchClick(x, y, c);
          idx = (idx + 1) % slots.length;
        }
      }, intervalMs);
    }
    return this.isSmartUpgrading;
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
