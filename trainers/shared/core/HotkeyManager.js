/**
 * Universal Hotkey Manager for Web Game Trainers
 * Supports Numpad, Function Keys (F1-F12), Ctrl/Shift/Alt modifiers
 */
export class HotkeyManager {
  constructor() {
    this.bindings = new Map();
    this.enabled = true;
    this._onKeyDown = this._onKeyDown.bind(this);
    window.addEventListener('keydown', this._onKeyDown, true);
  }

  register(keyCombo, callback, description = '') {
    const normalized = this._normalizeKey(keyCombo);
    this.bindings.set(normalized, { callback, description, original: keyCombo });
  }

  unregister(keyCombo) {
    const normalized = this._normalizeKey(keyCombo);
    this.bindings.delete(normalized);
  }

  _normalizeKey(combo) {
    const parts = combo.toUpperCase().split('+').map(p => p.trim());
    const modifiers = [];
    let mainKey = '';

    for (const part of parts) {
      if (['CTRL', 'CONTROL'].includes(part)) modifiers.push('CTRL');
      else if (['ALT'].includes(part)) modifiers.push('ALT');
      else if (['SHIFT'].includes(part)) modifiers.push('SHIFT');
      else mainKey = part;
    }

    modifiers.sort();
    return [...modifiers, mainKey].join('+');
  }

  _eventToCombo(e) {
    const modifiers = [];
    if (e.ctrlKey) modifiers.push('CTRL');
    if (e.altKey) modifiers.push('ALT');
    if (e.shiftKey) modifiers.push('SHIFT');

    let key = e.key.toUpperCase();
    if (e.code.startsWith('Numpad')) {
      key = e.code.toUpperCase(); // e.g. NUMPAD1
    } else if (e.code.startsWith('Digit')) {
      key = e.code.replace('DIGIT', '');
    } else if (key === ' ') {
      key = 'SPACE';
    }

    modifiers.sort();
    return [...modifiers, key].join('+');
  }

  _onKeyDown(e) {
    if (!this.enabled) return;

    // Ignore if typing inside input / textarea
    const tag = e.target.tagName?.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

    const combo = this._eventToCombo(e);
    if (this.bindings.has(combo)) {
      e.preventDefault();
      e.stopPropagation();
      const binding = this.bindings.get(combo);
      binding.callback();
    }
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown, true);
    this.bindings.clear();
  }
}
