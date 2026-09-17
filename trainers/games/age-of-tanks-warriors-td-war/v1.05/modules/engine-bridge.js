/**
 * Age of Tanks Warriors: TD War (v1.05) - Engine Bridge
 * Native IL2CPP / WebAssembly Runtime Connector
 */
export class EngineBridge {
  constructor() {
    this.targetWindow = null;
    this.unityInstance = null;
    this.module = null;
    this.ready = false;
  }

  async init() {
    this.targetWindow = this._findWindow();
    if (!this.targetWindow) throw new Error('Game frame not found');

    await this._waitForUnity();
    this.unityInstance = this.targetWindow.unityGameInstance;
    this.module = this.unityInstance?.Module;
    this.ready = true;
    return this;
  }

  _findWindow() {
    if (window.unityGameInstance?.Module) return window;
    const iframes = document.querySelectorAll('iframe');
    for (const f of iframes) {
      try {
        if (f.contentWindow?.unityGameInstance?.Module) return f.contentWindow;
      } catch (e) {}
    }
    return window;
  }

  _waitForUnity(timeout = 15000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (this.targetWindow.unityGameInstance?.Module) return resolve();
        if (Date.now() - start > timeout) return reject(new Error('Unity timeout'));
        setTimeout(check, 300);
      };
      check();
    });
  }
}
