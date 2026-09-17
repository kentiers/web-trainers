/**
 * Capybara Clicker 2 - Engine Bridge (Unity 2020 WebGL)
 * Bridges canvas input pipeline, mouse event dispatching, and Unity WebGL instance.
 */
export class UnityEngineBridge {
  constructor(canvasSelector = '#unity-canvas') {
    this.canvasSelector = canvasSelector;
  }

  getCanvas() {
    return document.querySelector(this.canvasSelector) || document.querySelector('canvas');
  }

  getUnityInstance() {
    return window.unityGameInstance || window.unityInstance || null;
  }

  getClickTargetCoords(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.30,
      y: rect.top + rect.height * 0.55
    };
  }

  sendMouseEvent(type, x, y, canvas) {
    const target = canvas || this.getCanvas();
    if (!target) return false;
    const ev = new MouseEvent(type, {
      clientX: x,
      clientY: y,
      button: 0,
      bubbles: true,
      cancelable: true
    });
    return target.dispatchEvent(ev);
  }

  dispatchLockedCapybaraClick(canvas) {
    const target = canvas || this.getCanvas();
    if (!target) return false;
    const coords = this.getClickTargetCoords(target);
    // Crucial: send mousemove first to pin Unity's internal cursor strictly on the Capybara sprite
    this.sendMouseEvent('mousemove', coords.x, coords.y, target);
    this.sendMouseEvent('mousedown', coords.x, coords.y, target);
    this.sendMouseEvent('mouseup', coords.x, coords.y, target);
    return true;
  }
}
