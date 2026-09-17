/**
 * Words and Blooms - In-Memory Live Gameplay Patcher
 * Hooks Phaser session properties directly via prototype descriptors to guarantee
 * 999 Hints, 999 Shuffles, and Infinite Letters without ever reloading or wiping active puzzles.
 */
export class BloomsGameplayPatcher {
  static enableInfiniteHints() {
    try {
      Object.defineProperty(Object.prototype, 'hintsRemaining', {
        get() { return 999; },
        set(v) {},
        configurable: true
      });
      Object.defineProperty(Object.prototype, 'bloomHintsRemaining', {
        get() { return 999; },
        set(v) {},
        configurable: true
      });
      if (window.Phaser?.GAMES?.[0]) {
        for (const scene of window.Phaser.GAMES[0].scene.scenes) {
          if (scene.updateHintButton) scene.updateHintButton();
          if (scene.updateBloomButton) scene.updateBloomButton();
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static enableInfiniteShuffles() {
    try {
      Object.defineProperty(Object.prototype, 'shufflesRemaining', {
        get() { return 999; },
        set(v) {},
        configurable: true
      });
      if (window.Phaser?.GAMES?.[0]) {
        for (const scene of window.Phaser.GAMES[0].scene.scenes) {
          if (scene.updateShuffleButton) scene.updateShuffleButton();
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static enableInfiniteLetters() {
    try {
      Object.defineProperty(Object.prototype, 'remaining', {
        get() { return 999; },
        set(v) {},
        configurable: true
      });
      if (window.Phaser?.GAMES?.[0]) {
        for (const scene of window.Phaser.GAMES[0].scene.scenes) {
          if (scene.session?.bag) scene.session.bag.index = 0;
          if (scene.lettersPanel && scene.session?.lettersLeft) {
            scene.lettersPanel.setValue(scene.session.lettersLeft);
          }
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
