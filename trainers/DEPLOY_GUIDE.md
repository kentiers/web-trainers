# Panduan Deploy GitHub & Distribusi Tampermonkey

Panduan untuk mendistribusikan trainer ke publik via GitHub secara aman (kode terlindungi dari pencurian) dan efisien (otomatis update tanpa user perlu reinstall).

---

## 1. Arsitektur Distribusi

```
[Komputer Kamu] 
     │ (1) git push
     ▼
[GitHub Repository Kamu] (cth: github.com/username/web-trainers)
     │
     │ (2) Raw CDN / jsDelivr (dist/hub.min.js terenkripsi)
     ▼
[Pengguna Tampermonkey]
     │ Cukup install file `loader.user.js` sekali saja!
     ▼
[Otomatis Update] Setiap kamu push update ke GitHub, semua user langsung dapat fiturnya!
```

---

## 2. Cara Deploy ke GitHub Kamu

1. **Buat Repository Baru di GitHub:**
   * Masuk ke GitHub $\rightarrow$ klik **New Repository**.
   * Beri nama misalnya: `web-trainers`.
   * Pilih **Public**.

2. **Jalankan Build Script (Proteksi Kode):**
   Sebelum upload, jalankan perintah build agar kode di-bundle dan di-obfuscate sehingga aman dari pencurian kode:
   ```bash
   node trainers/scripts/build.js
   ```
   *File terproteksi akan dihasilkan di `trainers/dist/hub.min.js`.*

3. **Upload ke GitHub:**
   ```bash
   git add .
   git commit -m "Release Trainer Hub v2.1"
   git remote add origin https://github.com/<username-kamu>/web-trainers.git
   git push -u origin main
   ```

4. **Sesuaikan URL di `trainers/loader.user.js`:**
   Buka file `trainers/loader.user.js`, ubah baris URL menjadi link GitHub kamu:
   ```javascript
   const REMOTE_HUB_URL = 'https://raw.githubusercontent.com/<username-kamu>/web-trainers/main/dist/hub.min.js';
   ```

---

## 3. Cara Membagikan ke Orang Lain

Kamu cukup membagikan file **`loader.user.js`** kepada teman atau pengguna:
* Ukuran filenya sangat kecil (~1 KB).
* Begitu mereka pasang di Tampermonkey, skrip akan otomatis mengambil engine inti yang terenkripsi dari GitHub kamu.
* **Keuntungan:** Jika ada game baru atau update patch, kamu tinggal `git push`. Semua pengguna langsung mendapatkan versi terbaru tanpa perlu setting apa-apa lagi!

---

## 4. Fitur SPA Auto-Destroy (Pindah Halaman Game)

* Pada versi `2.1`, engine sudah dilengkapi **Single Page Application (SPA) Router Watcher**.
* Saat pengguna sedang berada di game yang didukung, panel trainer muncul.
* Begitu pengguna mengklik game lain di CrazyGames/Poki yang tidak ada di list atau kembali ke beranda, **panel trainer seketika hilang otomatis (destroyed)** tanpa perlu me-refresh halaman!
