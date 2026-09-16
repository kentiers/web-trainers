# Web Game Trainers Hub

Proyek trainer modular untuk game-game berbasis web (Unity WebGL, HTML5 Canvas, Cocos, Phaser, Godot). Dirancang dengan arsitektur multi-game dan multi-versi yang rapi, modular, serta menggunakan komponen UI bergaya **FLiNG** dan **WeMod**.

---

## 1. Struktur Direktori

```
trainers/
├── README.md                      # Dokumentasi & panduan arsitektur umum
├── shared/                        # Komponen bersama (Reusable Modules)
│   ├── core/
│   │   ├── HotkeyManager.js       # Listener keyboard universal (Numpad, Function keys, Ctrl/Alt/Shift)
│   │   └── TrainerBase.js         # Base class trainer, state management, & audio synthesizer
│   └── ui/
│       └── FLiNGOverlay.js        # Floating draggable UI (Dark Gunmetal/Neon, Shadow DOM isolation)
└── games/                         # Direktori game individual
    └── <game-slug>/               # Satu folder khusus untuk tiap game (misal: idle-zombie-wave)
        ├── metadata.json          # Info game, URL, platform, engine, & daftar versi
        ├── README.md              # Catatan reverse engineering & dokumentasi game
        ├── v1.0/                  # Versi game lama
        │   ├── trainer.user.js
        │   └── console-loader.js
        └── v2.10/                 # Versi game saat ini
            ├── trainer.user.js    # Userscript Tampermonkey siap pakai
            ├── console-loader.js  # Loader cepat via DevTools Console (F12)
            └── modules/           # Module spesifik engine & memory game
                ├── engine-bridge.js
                ├── cheats-battle.js
                ├── cheats-economy.js
                └── save-editor.js
```

---

## 2. Cara Menambahkan Game Baru

Untuk menambahkan game baru (misalnya `vampire-survivors-web` atau `stickman-epic`):

1. **Buat folder game:**
   ```bash
   mkdir -p trainers/games/<nama-game>/v1.0/modules
   ```
2. **Buat `metadata.json`:**
   Cantumkan nama game, URL CrazyGames/Poki, tipe engine (Unity WebGL, Godot, PixiJS, dll.), dan versi rilis.
3. **Analisis Reverse Engineering:**
   * Buka DevTools (`F12`), identifikasi engine runtime (`unityInstance`, `Module`, `CS`, `Phaser`, `createUnityInstance`, dsb.).
   * Cari letak penyimpanan save data (`IndexedDB`, `LocalStorage`, atau cloud API).
   * Cari variabel/fungsi internal untuk HP, skor, koin, cooldown, atau kecepatan.
4. **Implementasikan Modul:**
   * `engine-bridge.js`: Penghubung ke runtime game.
   * `cheats-*.js`: Logika cheat spesifik game.
   * `trainer.user.js` & `console-loader.js`: Manfaatkan `shared/core` dan `shared/ui/FLiNGOverlay.js`.

---

## 3. Cara Mengelola Update Game (Versioning)

Ketika sebuah game merilis patch atau update baru (misal update dari `v2.10` ke `v2.11`):

1. **Buat folder versi baru di samping versi lama:**
   ```bash
   cp -r trainers/games/idle-zombie-wave/v2.10 trainers/games/idle-zombie-wave/v2.11
   ```
2. **Update `metadata.json`:**
   Tambahkan catatan versi baru pada bagian `versions`.
3. **Sesuaikan Offset & Signature:**
   * Jika struktur memori atau Webpack bundle berubah, update file pada folder `v2.11/modules/`.
   * Versi lama (`v2.10`) tetap utuh sehingga jika ada pemain yang memainkan versi arsip/mirror lama, trainer tetap kompatibel.

---

## 4. Daftar Game yang Didukung

| Game Slug | Nama Game | Engine | Versi Aktif | Status |
| :--- | :--- | :--- | :--- | :--- |
| `idle-zombie-wave` | Idle Zombie Wave: Survivors | Unity 6 WebGL (Puerts) | `v2.10` | ✅ Aktif & Teruji |
