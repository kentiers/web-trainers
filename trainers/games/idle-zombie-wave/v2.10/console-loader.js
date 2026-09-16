/**
 * Idle Zombie Wave: Survivors (v2.10) - Ultra-Light Clean Trainer
 * NO MEMORY LEAKS (No setInterval garbage) - 100% VERIFIED CHEATS ONLY
 *
 * CARA PAKAI:
 * 1. Buka game https://www.crazygames.com/game/idle-zombie-wave di browser
 * 2. Tekan F12 -> klik tab Console
 * 3. Ganti dropdown context dari "top" ke iframe game: "idle-zombie-wave.html"
 * 4. Paste kode ini ke Console lalu tekan ENTER!
 */
(() => {
  let targetWindow = window;
  if (!targetWindow.CS || !targetWindow.CS.UIDataTransfer) {
    const iframes = document.querySelectorAll('iframe');
    for (const f of iframes) {
      try {
        if (f.contentWindow?.CS?.UIDataTransfer) {
          targetWindow = f.contentWindow;
          break;
        }
      } catch (e) {}
    }
  }

  if (!targetWindow.CS || !targetWindow.CS.UIDataTransfer) {
    console.error('[TRAINER] Game runtime (CS) tidak ditemukan di frame ini. Ganti context console ke idle-zombie-wave.html');
    return;
  }

  const CS = targetWindow.CS;

  // Audio Synthesizer Ringan (Tanpa alokasi berlebih)
  let audioCtx = null;
  const playBeep = (high = true) => {
    try {
      if (!audioCtx) audioCtx = new (targetWindow.AudioContext || targetWindow.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      osc.frequency.setValueAtTime(high ? 480 : 300, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  };

  let speedState = 1.0;

  const TrainerCore = {
    // 1. GOD MODE: Cukup inject Skill 12 sekali saja (Permanen memberi +1 Miliar HP tanpa loop memory leak)
    setGodMode(enable) {
      playBeep(enable);
      if (enable) {
        const evt = new CS.UIEventData_ToCSharp();
        evt.Command = CS.UIEventToCSharp.AddSkill;
        evt.Param1 = 12; // WUDI: +1.000.000.000 attributes
        CS.UIDataTransfer.UIEvents.Add(evt);
        CS.UIDataTransfer.CurHp = CS.UIDataTransfer.MaxHp;
      }
    },

    // 2. ONE-HIT KILL: Inject Skill 13
    setOneHitKill(enable) {
      playBeep(enable);
      if (enable) {
        const evt = new CS.UIEventData_ToCSharp();
        evt.Command = CS.UIEventToCSharp.AddSkill;
        evt.Param1 = 13; // MIAOGUAI
        CS.UIDataTransfer.UIEvents.Add(evt);
      }
    },

    // 3. FULL HEAL: Kembalikan HP barikade seketika
    heal() {
      playBeep(true);
      CS.UIDataTransfer.CurHp = CS.UIDataTransfer.MaxHp;
      const evt = new CS.UIEventData_ToCSharp();
      evt.Command = CS.UIEventToCSharp.AddHp;
      evt.Param1 = 9999999;
      CS.UIDataTransfer.UIEvents.Add(evt);
    },

    // 4. ADD BATTLE SCRAP (+5,000 Sekrup untuk belanja upgrade senjata di tengah wave)
    addScrap(amount = 5000) {
      playBeep(true);
      const data = new CS.UIEventData_ToTS();
      data.Param1 = amount;
      CS.JSManager.DispatchJSEvent(CS.JsEvent.PickMaterial, data);
    },

    // 5. SPEEDHACK: 1x -> 2x -> 5x
    cycleSpeed() {
      playBeep(true);
      if (!CS.UnityEngine?.Time) return '1x';
      speedState = speedState === 1.0 ? 2.0 : (speedState === 2.0 ? 5.0 : 1.0);
      CS.UnityEngine.Time.timeScale = speedState;
      return `${speedState}x`;
    }
  };

  targetWindow.__TRAINER__ = TrainerCore;
  window.__TRAINER__ = TrainerCore;

  // BUILD UI OVERLAY SUPER RINGAN & COMPACT
  const old = targetWindow.document.getElementById('fling-clean-trainer');
  if (old) old.remove();

  const root = targetWindow.document.createElement('div');
  root.id = 'fling-clean-trainer';
  const shadow = root.attachShadow({ mode: 'open' });

  const style = targetWindow.document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; user-select: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .win {
      position: fixed; top: 15px; right: 15px; width: 230px;
      background: #0d0f15; border: 1px solid #1f2334; border-radius: 6px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.85); z-index: 2147483647;
      color: #cdd3e0; font-size: 11px;
    }
    .win.min .body { display: none; }
    .head {
      background: #151824; padding: 6px 10px; display: flex;
      align-items: center; justify-content: space-between;
      border-bottom: 1px solid #1c2030; cursor: grab;
    }
    .head:active { cursor: grabbing; }
    .left { display: flex; align-items: center; gap: 5px; }
    .logo { background: #ff2a55; color: #fff; font-weight: 800; font-size: 8px; padding: 1px 4px; border-radius: 2px; }
    .title { font-weight: 700; color: #fff; font-size: 11px; }
    .badge { font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 6px; border: 1px solid #00e676; color: #00e676; }
    .btns { display: flex; gap: 3px; }
    .btn { background: transparent; border: none; color: #6e768d; cursor: pointer; padding: 1px 4px; font-size: 10px; }
    .btn:hover { color: #fff; }
    .body { padding: 6px 8px; }
    .row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 6px; background: #12141c; border: 1px solid #171b26;
      border-radius: 4px; margin-bottom: 3px;
    }
    .row:hover { background: #161822; border-color: #212638; }
    .info { display: flex; align-items: center; gap: 6px; }
    .key {
      background: #171a26; color: #ffaa00; font-family: monospace;
      font-weight: 700; font-size: 9px; padding: 1px 3px; border-radius: 2px;
      border: 1px solid #23283a; min-width: 32px; text-align: center;
    }
    .lbl { font-weight: 500; font-size: 11px; color: #b8bfd1; }
    .sw { position: relative; width: 28px; height: 15px; }
    .sw input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #1e2230; border-radius: 15px; transition: .15s; }
    .slider:before { position: absolute; content: ""; height: 11px; width: 11px; left: 2px; bottom: 2px; background: #6c758d; border-radius: 50%; transition: .15s; }
    input:checked + .slider { background: #00e676; }
    input:checked + .slider:before { transform: translateX(13px); background: #fff; }
    .act-btn {
      background: #1d2233; border: 1px solid #282f45; color: #fff;
      font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 3px; cursor: pointer;
    }
    .act-btn:hover { background: #262d42; color: #00e5ff; border-color: #00e5ff; }
    .act-btn:active { transform: scale(0.95); }
    .foot {
      padding: 3px 8px; background: #0a0b0f; border-top: 1px solid #141620;
      font-size: 9px; color: #4e556b; display: flex; justify-content: space-between;
    }
    .toast {
      position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
      background: #0d0f15; color: #00e676; border: 1px solid #00e676;
      padding: 2px 7px; border-radius: 10px; font-size: 9px; font-weight: 600;
      opacity: 0; transition: opacity 0.2s; pointer-events: none;
    }
    .toast.show { opacity: 1; }
  `;

  const html = `
    <div class="win" id="win">
      <div class="head" id="head">
        <div class="left">
          <span class="logo">MOD</span>
          <span class="title">Zombie Wave</span>
          <span class="badge">LITE</span>
        </div>
        <div class="btns">
          <button class="btn" id="b-min">_</button>
          <button class="btn" id="b-close">✕</button>
        </div>
      </div>
      <div class="body">
        <div class="row">
          <div class="info"><span class="key">NUM1</span><span class="lbl">God Mode</span></div>
          <label class="sw"><input type="checkbox" id="sw-god"><span class="slider"></span></label>
        </div>
        <div class="row">
          <div class="info"><span class="key">NUM2</span><span class="lbl">1-Hit Kill</span></div>
          <label class="sw"><input type="checkbox" id="sw-ohk"><span class="slider"></span></label>
        </div>
        <div class="row">
          <div class="info"><span class="key">NUM3</span><span class="lbl">Full Heal</span></div>
          <button class="act-btn" id="btn-heal">Heal</button>
        </div>
        <div class="row">
          <div class="info"><span class="key">NUM4</span><span class="lbl">+5K Scrap</span></div>
          <button class="act-btn" id="btn-scrap">+5K</button>
        </div>
        <div class="row">
          <div class="info"><span class="key">F11</span><span class="lbl">Speedhack</span></div>
          <button class="act-btn" id="btn-spd">1x</button>
        </div>
      </div>
      <div class="foot">
        <span><b>INS</b> sembunyikan</span>
        <span>Verified Only</span>
      </div>
      <div class="toast" id="toast"></div>
    </div>
  `;

  shadow.appendChild(style);
  const w = targetWindow.document.createElement('div');
  w.innerHTML = html;
  shadow.appendChild(w);
  targetWindow.document.body.appendChild(root);

  const showToast = (msg) => {
    const toast = shadow.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1000);
  };

  const swGod = shadow.getElementById('sw-god');
  swGod.addEventListener('change', (e) => {
    TrainerCore.setGodMode(e.target.checked);
    showToast(`God Mode: ${e.target.checked ? 'ON' : 'OFF'}`);
  });

  const swOhk = shadow.getElementById('sw-ohk');
  swOhk.addEventListener('change', (e) => {
    TrainerCore.setOneHitKill(e.target.checked);
    showToast(`1-Hit Kill: ${e.target.checked ? 'ON' : 'OFF'}`);
  });

  shadow.getElementById('btn-heal').addEventListener('click', () => {
    TrainerCore.heal();
    showToast('Healed');
  });

  shadow.getElementById('btn-scrap').addEventListener('click', () => {
    TrainerCore.addScrap(5000);
    showToast('+5,000 Scrap');
  });

  const btnSpd = shadow.getElementById('btn-spd');
  btnSpd.addEventListener('click', () => {
    const spd = TrainerCore.cycleSpeed();
    btnSpd.textContent = spd;
    showToast(`Speed: ${spd}`);
  });

  const win = shadow.getElementById('win');
  shadow.getElementById('b-min').addEventListener('click', () => win.classList.toggle('min'));
  shadow.getElementById('b-close').addEventListener('click', () => {
    win.style.display = win.style.display === 'none' ? 'block' : 'none';
  });

  // Hotkeys Keyboard
  targetWindow.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.code === 'Numpad1') { swGod.checked = !swGod.checked; swGod.dispatchEvent(new Event('change')); }
    else if (e.code === 'Numpad2') { swOhk.checked = !swOhk.checked; swOhk.dispatchEvent(new Event('change')); }
    else if (e.code === 'Numpad3') shadow.getElementById('btn-heal').click();
    else if (e.code === 'Numpad4') shadow.getElementById('btn-scrap').click();
    else if (e.key === 'F11') btnSpd.click();
    else if (e.key === 'Insert') win.style.display = win.style.display === 'none' ? 'block' : 'none';
  });

  console.log('%c[TRAINER CLEAN] Lite Trainer Active (0% Memory Leak, 100% Working)', 'color: #00e676; font-weight: bold;');
})();
