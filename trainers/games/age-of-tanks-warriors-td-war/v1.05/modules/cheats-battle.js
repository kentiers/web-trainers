/**
 * Age of Tanks Warriors: TD War (v1.05) - Battle Cheats
 * Handles Time Dilation, Rapid Food/Energy generation, and Turret Fire Rate
 */
export class BattleCheats {
  constructor(bridge) {
    this.bridge = bridge;
    this.speedState = 1.0;
    this._realStart = performance.now();
    this._virtualStart = this._realStart;
    this._realNow = performance.now.bind(performance);
  }

  setSpeed(multiplier = 1.0) {
    const now = this._realNow();
    this._virtualStart = this._virtualStart + (now - this._realStart) * this.speedState;
    this._realStart = now;
    this.speedState = multiplier;

    if (this.speedState === 1.0) {
      window.performance.now = this._realNow;
    } else {
      const self = this;
      window.performance.now = function () {
        const current = self._realNow();
        return self._virtualStart + (current - self._realStart) * self.speedState;
      };
    }
    return this.speedState;
  }

  toggleTurbo(enable) {
    return this.setSpeed(enable ? 5.0 : 1.0);
  }
}
