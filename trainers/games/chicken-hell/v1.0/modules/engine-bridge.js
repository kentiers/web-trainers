/**
 * Chicken Hell - Unity 2020 WebGL Input Engine Bridge
 */
export class ChickenEngineBridge {
  constructor(canvasSelector = '#unity-canvas') {
    this.canvasSelector = canvasSelector;
    this.boostInterval = null;
    this.isBoosting = false;
  }

  getCanvas() {
    return document.querySelector(this.canvasSelector) || document.querySelector('canvas');
  }

  dispatchBoostClick() {
    const c = this.getCanvas();
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = rect.left + rect.width * 0.5;
    const y = rect.top + rect.height * 0.5;
    c.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
    c.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
  }

  toggleTurboBoost(enabled, intervalMs = 25) {
    if (this.boostInterval) {
      clearInterval(this.boostInterval);
      this.boostInterval = null;
    }
    this.isBoosting = !!enabled;
    if (this.isBoosting) {
      this.boostInterval = setInterval(() => {
        this.dispatchBoostClick();
      }, intervalMs);
    }
    return this.isBoosting;
  }
}
