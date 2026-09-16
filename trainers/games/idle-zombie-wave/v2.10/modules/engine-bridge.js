/**
 * Engine Bridge for Idle Zombie Wave: Survivors (Unity 6 + Puerts WebGL)
 * Connects the trainer to the C# runtime (CS.*) and TypeScript Webpack internals.
 */
export class EngineBridge {
  constructor() {
    this.targetWindow = null;
    this.CS = null;
    this.puer = null;
    this.webpackRequire = null;
    this.modules = {};
    this.ready = false;
  }

  /**
   * Automatically locate game window/iframe and bind runtime objects
   */
  async init() {
    this.targetWindow = this._findGameWindow();
    if (!this.targetWindow) {
      throw new Error('Game window / iframe not found. Make sure the game has loaded.');
    }

    // Wait until CS is initialized
    await this._waitForCS();
    this.CS = this.targetWindow.CS;
    this.puer = this.targetWindow.puer || this.targetWindow.puerts;

    // Hook Webpack modules
    this._hookWebpack();

    this.ready = true;
    console.log('[Trainer EngineBridge] Successfully connected to game runtime.');
    return this;
  }

  _findGameWindow() {
    // 1. Current window check
    if (typeof window.CS !== 'undefined' && window.CS.UIDataTransfer) {
      return window;
    }

    // 2. Search iframes
    const iframes = document.querySelectorAll('iframe');
    for (const frame of iframes) {
      try {
        const win = frame.contentWindow;
        if (win && typeof win.CS !== 'undefined' && win.CS.UIDataTransfer) {
          return win;
        }
      } catch (e) {
        // Cross-origin iframe
      }
    }

    // Default to window
    return window;
  }

  _waitForCS(timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (this.targetWindow.CS && this.targetWindow.CS.UIDataTransfer) {
          return resolve();
        }
        if (Date.now() - start > timeoutMs) {
          return reject(new Error('Timeout waiting for game C# engine (CS) initialization.'));
        }
        setTimeout(check, 250);
      };
      check();
    });
  }

  _hookWebpack() {
    const win = this.targetWindow;
    if (win.__game_webpack_require__) {
      this.webpackRequire = win.__game_webpack_require__;
    } else if (win.PUERTS_JS_RESOURCES && win.PUERTS_JS_RESOURCES['scripts/bundle.mjs']) {
      try {
        const fnStr = win.PUERTS_JS_RESOURCES['scripts/bundle.mjs'].toString();
        const patchedStr = fnStr.replace(
          'globalThis.$entry=__webpack_exports__',
          'win.__game_webpack_require__=__webpack_require__;globalThis.$entry=__webpack_exports__'
        );
        const patchedFn = new Function('win', 'return (' + patchedStr + ')')(win);
        const exports = {};
        const mod = { exports };
        patchedFn(exports, this.puer ? this.puer.require : () => {}, mod, 'scripts/bundle.mjs', 'scripts');
        this.webpackRequire = win.__game_webpack_require__;
      } catch (err) {
        console.warn('[Trainer EngineBridge] Could not extract webpack require, falling back to pure CS mode.', err);
      }
    }

    // Cache common modules if webpack require is available
    if (this.webpackRequire) {
      try {
        this.modules.Global = this.webpackRequire('./src/Global.ts');
        this.modules.Player = this.webpackRequire('./src/data/Player.ts');
        this.modules.ItemsSystem = this.webpackRequire('./src/data/system/ItemsSystem.ts');
        this.modules.SceneManager = this.webpackRequire('./src/scene/SceneManager.ts');
        this.modules.DotsBridge = this.webpackRequire('./src/common/DotsBridge.ts');
        this.modules.ActionDef = this.webpackRequire('./src/common/ActionDef.ts');
        this.modules.UIGm = this.webpackRequire('./src/ui/debug/UIGm.ts');
      } catch (e) {
        console.warn('[Trainer EngineBridge] Partial module load error:', e);
      }
    }
  }

  /**
   * Dispatches a C# event via CS.UIDataTransfer.UIEvents
   */
  dispatchCSharpEvent(command, param1 = 0, param2 = 0, param3 = 0, param4 = 0) {
    if (!this.CS || !this.CS.UIDataTransfer || !this.CS.UIEventData_ToCSharp) return false;
    const evt = new this.CS.UIEventData_ToCSharp();
    evt.Command = command;
    evt.Param1 = param1;
    evt.Param2 = param2;
    evt.Param3 = param3;
    evt.Param4 = param4;
    this.CS.UIDataTransfer.UIEvents.Add(evt);
    return true;
  }
}
