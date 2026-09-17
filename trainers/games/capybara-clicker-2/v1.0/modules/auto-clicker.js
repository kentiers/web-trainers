/**
 * Capybara Clicker 2 - High-Performance Input Injection Engine
 * Targets Unity WebGL GLFW input pipeline across requestAnimationFrame ticks.
 */
export class CapybaraClickEngine {
  constructor(canvasSelector = '#unity-canvas') {
    this.canvasSelector = canvasSelector;
    this.activeInterval = null;
  }

  getCanvas() {
    return document.querySelector(this.canvasSelector) || document.querySelector('canvas');
  }

  getClickCoords(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.3,
      y: rect.top + rect.height * 0.55
    };
  }

  dispatchSingleClick(canvas, { x, y }) {
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
    canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
  }

  startAutoClicker(intervalMs = 16) {
    this.stopAutoClicker();
    this.activeInterval = setInterval(() => {
      const c = this.getCanvas();
      if (c) {
        this.dispatchSingleClick(c, this.getClickCoords(c));
      }
    }, intervalMs);
  }

  stopAutoClicker() {
    if (this.activeInterval) {
      clearInterval(this.activeInterval);
      this.activeInterval = null;
    }
  }

  fireBurst(count = 500, intervalMs = 4) {
    let fired = 0;
    const t = setInterval(() => {
      const c = this.getCanvas();
      if (c) {
        this.dispatchSingleClick(c, this.getClickCoords(c));
      }
      if (++fired >= count) clearInterval(t);
    }, intervalMs);
  }
}
