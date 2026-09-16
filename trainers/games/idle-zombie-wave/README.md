# Idle Zombie Wave: Survivors (v2.10) - Verified Trainer & RE Notes

## 1. Game Architecture & Runtime Analysis
* **Platform:** CrazyGames (Web / Browser)
* **Game Engine:** Unity 6 (WebGL)
* **Scripting Engine:** **Puerts WebGL** (Tencent TypeScript/JS bridge connecting browser JS to compiled C#)
* **Tested Environment:** Chromium / WebGL live runtime on CrazyGames
* **Target Version:** `v2.10` (Build 136)

---

## 2. Status Pengujian Fitur Cheat (100% Verified)

Semua fitur di bawah ini **telah dites langsung di game yang sedang berjalan** dan terbukti berfungsi tanpa error:

| Cheat | Hotkey | Metode Injeksi | Status | Hasil Pengujian |
| :--- | :--- | :--- | :--- | :--- |
| **God Mode (WUDI)** | `NUMPAD 1` | `AddSkill(12)` + Auto HP Lock | ✅ **WORKING** | HP barikade melonjak ke $1.000.001.216$, kebal seluruh serangan zombie. |
| **One-Hit Kill** | `NUMPAD 2` | `AddSkill(13)` Buff | ✅ **WORKING** | Kerusakan peluru diperkuat drastis, zombie musnah 1 tembak. |
| **Instant Full Heal** | `NUMPAD 3` | `CurHp = MaxHp` + `AddHp` | ✅ **WORKING** | HP barikade yang rusak kembali $100\%$ penuh seketika. |
| **+5,000 Battle Scrap** | `NUMPAD 4` | `SyncMaterial` Event | ✅ **WORKING** | Menambah scrap untuk belanja upgrade senjata & drone di tengah wave. |
| **Speedhack (2x / 5x)** | `F11` | `Time.timeScale` | ✅ **WORKING** | Mempercepat jalannya pertarungan secara mulus tanpa lag/desync. |
| **+500,000 Gold** | `NUMPAD 7` | Dual-Sync (`Player.data` + Cloud) | ✅ **WORKING** | Koin emas bertambah di RAM dan langsung tersimpan ke cloud save. |
| **+50,000 Diamonds** | `NUMPAD 8` | Dual-Sync (`Player.data` + Cloud) | ✅ **WORKING** | Diamond bertambah permanen untuk gacha & item store. |
| **+100 Box Keys** | `NUMPAD 9` | Item IDs `5` & `6` | ✅ **WORKING** | Menambah Kunci Peti Perak & Emas. |
| **+500 Energy** | `NUMPAD 0` | Item ID `10` | ✅ **WORKING** | Menambah stamina bermain stage. |
| **+5,000 Supplies** | `CTRL+1` | Item IDs `33` & `34` | ✅ **WORKING** | Menambah Kayu & Kristal Energi barikade. |
| **Developer GM Menu** | `F12` | `UIGm.show()` | ✅ **WORKING** | Memunculkan panel debug resmi buatan developer game. |

> **Catatan Filter Fitur:** Fitur *Win Wave* dan *Win Mission* instan **tidak dimasukkan** karena memerlukan hook instance private scene yang tidak stabil dari frame luar. Sesuai prinsip keandalan, hanya fitur yang $100\%$ terverifikasi bekerja yang disertakan.

---

## 3. Cara Menjalankan

### Cara 1: DevTools Console (Cepat / Sekali Pakai)
1. Buka game [Idle Zombie Wave di CrazyGames](https://www.crazygames.com/game/idle-zombie-wave).
2. Tunggu game selesai loading dan masuk ke pertempuran pertama.
3. Tekan **F12** $\rightarrow$ buka tab **Console**.
4. Salin seluruh isi file `v2.10/console-loader.js`, paste ke Console, lalu tekan **ENTER**.
5. Window trainer HUD bergaya FLiNG akan langsung muncul di pojok kanan atas!

### Cara 2: Userscript (Otomatis Aktif Setiap Buka Game)
1. Install ekstensi browser **Tampermonkey** atau **Violentmonkey**.
2. Buat script baru $\rightarrow$ salin isi file `v2.10/trainer.user.js`.
3. Setiap kali membuka halaman game di CrazyGames, trainer akan otomatis aktif.
4. Tekan tombol **INSERT** pada keyboard untuk menyembunyikan/menampilkan HUD overlay.
