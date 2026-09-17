/**
 * EvoWars.io (v2.18) - True Construct 2 Layer Prototype Zoom & FOV Engine
 * Hooks into Construct 2's cr.layer.prototype.getScale to override internal game loop resets.
 */
export class FovController {
  constructor() {
    this.currentZoom = 1.0;
    this.hooked = false;
    this.uiLayers = ['HUD', 'Lightbox', 'Leaderboard', 'MiniMap', 'Thumbstick', 'GameOverCommon', 'GameOverRevive', 'GameOverNoRevive'];
  }

  installHook() {
    if (this.hooked) return true;
    const r = typeof window.cr_getC2Runtime === 'function' ? window.cr_getC2Runtime() : null;
    if (!r?.layouts) return false;

    const anyLayout = Object.values(r.layouts)[0];
    const proto = anyLayout?.layers?.[0] ? Object.getPrototypeOf(anyLayout.layers[0]) : null;
    if (!proto || typeof proto.getScale !== 'function') return false;

    const origGetScale = proto.getScale;
    const self = this;

    proto.getScale = function () {
      const base = origGetScale.call(this);
      if (self.uiLayers.includes(this.name)) return base;
      return base * (self.currentZoom || 1.0);
    };

    // Attach smooth mouse wheel zoom directly to canvas
    window.addEventListener('wheel', (e) => {
      if (e.target?.id === 'c2canvas') {
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        self.setZoom(Math.min(1.5, Math.max(0.3, self.currentZoom + delta)));
        if (r) r.redraw = true;
      }
    }, { passive: true });

    this.hooked = true;
    return true;
  }

  setZoom(scale = 0.7) {
    this.installHook();
    this.currentZoom = scale;
    const r = typeof window.cr_getC2Runtime === 'function' ? window.cr_getC2Runtime() : null;
    if (r) r.redraw = true;
    return this.currentZoom;
  }

  cycleZoom() {
    // 1.0x (Default) -> 0.7x (Wide) -> 0.5x (Ultra Wide) -> 1.0x
    const next = this.currentZoom === 1.0 ? 0.7 : (this.currentZoom === 0.7 ? 0.5 : 1.0);
    return this.setZoom(next);
  }
}
