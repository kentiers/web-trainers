/**
 * FLiNG-Inspired Dark Cyberpunk UI Overlay for Web Game Trainers
 * Uses Shadow DOM to isolate styles from the game page.
 */
export class FLiNGOverlay {
  constructor(trainer) {
    this.trainer = trainer;
    this.container = null;
    this.shadowRoot = null;
    this.minimized = false;
    this.visible = true;

    this._initDOM();
    this._attachEvents();
  }

  _initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'fling-trainer-overlay-root';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      * {
        box-sizing: border-box;
        user-select: none;
      }
      .trainer-window {
        position: fixed;
        top: 40px;
        right: 40px;
        width: 380px;
        background: #111217;
        border: 1px solid #272a38;
        border-radius: 8px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.85), 0 0 1px rgba(255,255,255,0.1);
        z-index: 2147483647;
        color: #e1e4ed;
        font-size: 13px;
        backdrop-filter: blur(10px);
        overflow: hidden;
        transition: transform 0.15s ease, opacity 0.15s ease;
      }
      .trainer-window.minimized .content {
        display: none;
      }
      .header {
        background: linear-gradient(180deg, #1d202b 0%, #151720 100%);
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #222634;
        cursor: grab;
      }
      .header:active {
        cursor: grabbing;
      }
      .title-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .brand-badge {
        background: #ff2a55;
        color: #fff;
        font-weight: 900;
        font-size: 10px;
        padding: 2px 5px;
        border-radius: 3px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .title {
        font-weight: 700;
        color: #ffffff;
        font-size: 13px;
        letter-spacing: 0.2px;
      }
      .version-tag {
        font-size: 10px;
        color: #6c738a;
        background: #191b24;
        padding: 1px 5px;
        border-radius: 10px;
        border: 1px solid #272c3d;
      }
      .header-controls {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .icon-btn {
        background: transparent;
        border: none;
        color: #838a9d;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.15s;
      }
      .icon-btn:hover {
        background: #252a3a;
        color: #fff;
      }
      .content {
        padding: 12px;
        max-height: 520px;
        overflow-y: auto;
      }
      .content::-webkit-scrollbar {
        width: 5px;
      }
      .content::-webkit-scrollbar-thumb {
        background: #2b3042;
        border-radius: 3px;
      }
      .category-section {
        margin-bottom: 14px;
      }
      .category-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #00e5ff;
        letter-spacing: 0.8px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .category-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #1e2230;
      }
      .cheat-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 7px 10px;
        background: #161821;
        border: 1px solid #202433;
        border-radius: 6px;
        margin-bottom: 6px;
        transition: border-color 0.15s, background-color 0.15s;
      }
      .cheat-row:hover {
        border-color: #2e354a;
        background: #1a1c27;
      }
      .cheat-info {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
      }
      .hotkey-pill {
        background: #202435;
        color: #ffaa00;
        font-family: monospace;
        font-weight: 700;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #30374e;
        min-width: 44px;
        text-align: center;
      }
      .cheat-label {
        font-weight: 500;
        color: #c9cedd;
        font-size: 12px;
      }
      /* Toggle Switch */
      .switch {
        position: relative;
        display: inline-block;
        width: 38px;
        height: 20px;
      }
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #202433;
        transition: .2s;
        border-radius: 20px;
        border: 1px solid #2e354a;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
        background-color: #7b849b;
        transition: .2s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #00e676;
        border-color: #00e676;
      }
      input:checked + .slider:before {
        transform: translateX(18px);
        background-color: #ffffff;
      }
      /* Action Button */
      .action-btn {
        background: linear-gradient(180deg, #272c3d 0%, #1d212e 100%);
        border: 1px solid #363d54;
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        padding: 5px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .action-btn:hover {
        background: linear-gradient(180deg, #32394e 0%, #24293a 100%);
        border-color: #00e5ff;
        color: #00e5ff;
      }
      .action-btn:active {
        transform: scale(0.96);
      }
      /* Toast notifications */
      .toast {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(17, 18, 23, 0.95);
        color: #00e676;
        border: 1px solid #00e676;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease, transform 0.2s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      }
      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(-4px);
      }
      .footer {
        padding: 8px 14px;
        background: #0d0e12;
        border-top: 1px solid #1c1f2b;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        color: #555c70;
      }
      .footer a {
        color: #ff2a55;
        text-decoration: none;
        font-weight: 600;
      }
    `;

    const html = `
      <div class="trainer-window" id="window">
        <div class="header" id="header">
          <div class="title-group">
            <span class="brand-badge">MOD</span>
            <span class="title">${this.trainer.name}</span>
            <span class="version-tag">v${this.trainer.version}</span>
          </div>
          <div class="header-controls">
            <button class="icon-btn" id="btn-sound" title="Toggle Sound">🔊</button>
            <button class="icon-btn" id="btn-min" title="Minimize">_</button>
            <button class="icon-btn" id="btn-close" title="Hide (Press INS to toggle)">✕</button>
          </div>
        </div>
        <div class="content" id="content"></div>
        <div class="footer">
          <span>Target: <b>${this.trainer.game}</b></span>
          <span>Hotkeys Active (Press <b>INSERT</b> to hide)</span>
        </div>
        <div class="toast" id="toast"></div>
      </div>
    `;

    this.shadowRoot.appendChild(style);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    this.shadowRoot.appendChild(wrapper);

    document.body.appendChild(this.container);
    this.renderCheats();
  }

  renderCheats() {
    const content = this.shadowRoot.getElementById('content');
    content.innerHTML = '';

    // Group cheats by category
    const categories = new Map();
    for (const [id, cheat] of this.trainer.cheats) {
      const cat = cheat.category || 'General';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat).push(cheat);
    }

    for (const [catName, cheats] of categories) {
      const section = document.createElement('div');
      section.className = 'category-section';

      const title = document.createElement('div');
      title.className = 'category-title';
      title.textContent = catName;
      section.appendChild(title);

      for (const cheat of cheats) {
        const row = document.createElement('div');
        row.className = 'cheat-row';
        row.id = `row-${cheat.id}`;

        const info = document.createElement('div');
        info.className = 'cheat-info';

        if (cheat.hotkey) {
          const pill = document.createElement('span');
          pill.className = 'hotkey-pill';
          pill.textContent = cheat.hotkey;
          info.appendChild(pill);
        }

        const label = document.createElement('span');
        label.className = 'cheat-label';
        label.textContent = cheat.label;
        info.appendChild(label);

        row.appendChild(info);

        if (cheat.type === 'toggle') {
          const switchLabel = document.createElement('label');
          switchLabel.className = 'switch';
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = cheat.enabled;
          input.id = `switch-${cheat.id}`;
          input.addEventListener('change', () => {
            cheat.toggle();
          });
          const slider = document.createElement('span');
          slider.className = 'slider';
          switchLabel.appendChild(input);
          switchLabel.appendChild(slider);
          row.appendChild(switchLabel);
        } else if (cheat.type === 'action') {
          const btn = document.createElement('button');
          btn.className = 'action-btn';
          btn.textContent = 'Execute';
          btn.addEventListener('click', async () => {
            await cheat.execute();
            this.showToast(`${cheat.label} Activated`);
          });
          row.appendChild(btn);
        }

        section.appendChild(row);
      }

      content.appendChild(section);
    }

    // Subscribe to trainer state changes to sync UI
    this.trainer.onStateChange = (cheat, result) => {
      const sw = this.shadowRoot.getElementById(`switch-${cheat.id}`);
      if (sw && cheat.type === 'toggle') {
        sw.checked = cheat.enabled;
      }
      this.showToast(`${cheat.label}: ${cheat.enabled ? 'ON' : 'OFF'}`);
    };
  }

  showToast(text) {
    const toast = this.shadowRoot.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 1600);
  }

  _attachEvents() {
    // Draggable window
    const win = this.shadowRoot.getElementById('window');
    const header = this.shadowRoot.getElementById('header');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.header-controls')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      const onMouseMove = (ev) => {
        if (!isDragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        win.style.left = `${initialLeft + dx}px`;
        win.style.top = `${initialTop + dy}px`;
        win.style.right = 'auto';
      };

      const onMouseUp = () => {
        isDragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // Minimize button
    const btnMin = this.shadowRoot.getElementById('btn-min');
    btnMin.addEventListener('click', () => {
      this.minimized = !this.minimized;
      win.classList.toggle('minimized', this.minimized);
      btnMin.textContent = this.minimized ? '+' : '_';
    });

    // Close / Hide button
    const btnClose = this.shadowRoot.getElementById('btn-close');
    btnClose.addEventListener('click', () => {
      this.toggleVisibility();
    });

    // Sound toggle
    const btnSound = this.shadowRoot.getElementById('btn-sound');
    btnSound.addEventListener('click', () => {
      this.trainer.soundEnabled = !this.trainer.soundEnabled;
      btnSound.textContent = this.trainer.soundEnabled ? '🔊' : '🔇';
      this.showToast(`Sound: ${this.trainer.soundEnabled ? 'ON' : 'OFF'}`);
    });

    // Insert key toggle overlay
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Insert') {
        this.toggleVisibility();
      }
    });
  }

  toggleVisibility() {
    this.visible = !this.visible;
    const win = this.shadowRoot.getElementById('window');
    win.style.display = this.visible ? 'block' : 'none';
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
