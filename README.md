# Universal Web Game Trainer Hub

Universal Auto-Detecting Web Game Trainer Hub & Precision Modding Engine for Browser Games (Unity WebGL, HTML5 Canvas, Cocos, Phaser, Godot).

Built with **TasteSkill Swiss Cyberdeck UI (Anti-AI-Slop)**, **Zero-Leak Memory Architecture**, and **Universal Anti-Stuck Ad-Reward Bypass**.

---

## ⚡ Quick Start (Paling Cepat)

### Cara 1: Pasang di Tampermonkey (Otomatis & Auto-Update)
Pasang Userscript Loader resmi kami di ekstensi Tampermonkey / Violentmonkey:
👉 **[Klik untuk Install `trainers/loader.user.js`](https://raw.githubusercontent.com/kentiers/web-trainers/main/trainers/loader.user.js)**

*Skrip ini berukuran sangat kecil (~1.5 KB) dan otomatis menarik versi terenkripsi terbaru dari repository ini setiap kali ada update.*

### Cara 2: Direct Console Injector (Tanpa Install Ekstensi)
1. Buka game yang didukung di browser.
2. Tekan **F12** $\rightarrow$ buka tab **Console**.
3. Pastikan dropdown context diarahkan ke iframe game (misal: `idle-zombie-wave.html`).
4. Salin kode dari folder game yang bersangkutan: `trainers/games/<slug>/<version>/console-loader.js`, lalu paste dan tekan **Enter**.

---

## 🎮 Game yang Didukung Saat Ini

| Game | Platform | Engine | Versi | Status | Fitur Unggulan |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Idle Zombie Wave: Survivors** | CrazyGames | Unity 6 (Puerts) | `v2.10` | 🟢 **ACTIVE** | God Mode (1B HP), 1-Hit Kill, Wall Repair, +5K Scrap, Speedhack |
| **Semua Game CrazyGames & Poki** | All Web | All Engines | All | 🟢 **GLOBAL** | **Instant Ad-Reward Bypass** (Tanpa nonton video, reward langsung masuk) |

---

## 📂 Struktur Repositori

```text
.
├── README.md                      # Dokumentasi utama (Halaman depan repositori GitHub)
├── .gitignore                     # Filter pengabaian file internal, dependencies & AI configs
└── trainers/
    ├── DEPLOY_GUIDE.md            # Panduan build, obfuscation, dan rilis
    ├── loader.user.js             # Client loader publik untuk Tampermonkey (~1.5 KB)
    ├── master-hub.user.js         # Full monolithic standalone script
    ├── dist/
    │   ├── hub.core.js            # Source code engine unminified (SPA Router + Hooks)
    │   └── hub.min.js             # Core engine terenkripsi (Anti-theft bytecode release)
    ├── scripts/
    │   └── build.js               # Compiler & obfuscator otomatis
    ├── shared/                    # Modul bersama (reusable antar game)
    │   ├── core/
    │   │   ├── HotkeyManager.js   # Listener keyboard universal
    │   │   └── TrainerBase.js     # Base class & audio feedback
    │   └── ui/
    │       └── FLiNGOverlay.js    # Tactile Swiss Cyberdeck UI (TasteSkill Standard)
    └── games/                     # Katalog game (terisolasi per-game dan per-versi)
        └── idle-zombie-wave/
            ├── metadata.json      # Metadata game & daftar versi
            ├── README.md          # Dokumentasi teknis reverse engineering
            └── v2.10/             # Build game versi v2.10
                ├── console-loader.js  # Direct console injector
                ├── trainer.user.js    # Version-specific userscript
                └── modules/           # Module C# reflection & cheats
                    ├── engine-bridge.js
                    ├── cheats-battle.js
                    ├── cheats-economy.js
                    └── save-editor.js
```

---

## 🛡️ Fitur Unggulan Arsitektur

1. **SPA Navigation Auto-Destroy (Smart Lifecycle):**
   Mendeteksi perubahan URL secara dinamis (`pushState` / `popstate`). Begitu kamu berpindah game atau keluar ke beranda CrazyGames/Poki, panel trainer otomatis lenyap dari layar seketika tanpa perlu refresh halaman.
2. **Universal Zero-Stuck Ad Bypass:**
   Mencegat SDK iklan CrazyGames (v1, v2, v3) dan Poki. Reset state internal secara konsisten sehingga tombol reward gacha/revive/double coin dapat diklik berulang kali tanpa pernah macet atau tersangkut.
3. **TasteSkill Tactile Cyberdeck UI:**
   Bebas dari desain *AI Slop* (tanpa gradien ungu norak atau teks bertele-tele). Mengusung desain industri minimalis, font monospace proporsional, tombol dengan tactile micro-push, dan sangat compact (lebar 235px).
4. **Zero Memory Leak:**
   Bebas dari loop polling `setInterval` yang rakus RAM. Menggunakan event-driven state mutation sehingga penggunaan RAM browser tetap dingin dan stabil.

---

## 🛠️ Panduan Menambahkan Game Baru

1. Buat folder baru: `trainers/games/<slug-game>/v1.0/modules/`.
2. Lakukan reverse engineering pada game target (identifikasi engine, global state, atau WebAssembly bridge).
3. Tambahkan profil game ke dalam array `GAME_REGISTRY` di `trainers/dist/hub.core.js`.
4. Jalankan build obfuscation:
   ```bash
   node trainers/scripts/build.js
   ```
5. Push ke GitHub:
   ```bash
   git add .
   git commit -m "feat: Add support for <nama-game>"
   git push
   ```
   *Semua pengguna Tampermonkey yang memakai `loader.user.js` akan otomatis mendapatkan update tanpa instalasi ulang.*

---

## 📄 Lisensi
Didistribusikan untuk tujuan edukasi keamanan software web dan reverse engineering game.
Dikembangkan oleh **Trainer Modding Lab**.
