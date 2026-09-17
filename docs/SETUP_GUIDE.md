# Panduan Integrasi WABT & Il2CppDumper ke Project

Dokumen ini menjelaskan bagaimana **WABT** dan **Il2CppDumper** telah diintegrasikan langsung ke dalam alur kerja (*build & analysis workflow*) project ini.

---

## 1. Arsitektur Integrasi di Project

Untuk memastikan tool tidak hanya sekadar diletakkan di folder, kami telah menyediakan skrip automasi Node.js (`tools/scripts/`) dan perintah CLI di `package.json`:

```text
Project/Anything/
├── package.json                   # Mendefinisikan script CLI terintegrasi
├── tools/
│   ├── wabt/bin/                  # Biner resmi wasm2wat, wat2wasm
│   ├── Il2CppDumper/              # Biner resmi Il2CppDumper.exe
│   └── scripts/
│       ├── analyze-wasm.js        # Automasi runner WABT
│       └── run-il2cppdumper.js    # Automasi runner Il2CppDumper
└── docs/
    └── SETUP_GUIDE.md             # Panduan teoritis dan teknis
```

---

## 2. Perintah Eksekusi Terintegrasi (NPM Scripts)

Kamu atau dosen bisa langsung mengecek status dan menjalankan analisa langsung lewat terminal proyek menggunakan `npm run`:

### A. Memeriksa Status Kesiapan Tools
```bash
# Cek versi & status WABT
npm run analyze:wat

# Cek status & usage Il2CppDumper
npm run analyze:il2cpp
```

### B. Menganalisis File WebAssembly (.wasm $\rightarrow$ .wat)
Gunakan perintah ini jika ingin membedah logika fungsi matematika biner game Wasm:
```bash
node tools/scripts/analyze-wasm.js path/to/game.wasm [output.wat]
```
*Skrip akan otomatis memanggil `tools/wabt/bin/wasm2wat.exe` dan menghasilkan disassembly `.wat`.*

### C. Mengekstrak Simbol C# Unity IL2CPP
Gunakan perintah ini jika menganalisis game Unity WebGL:
```bash
node tools/scripts/run-il2cppdumper.js path/to/game.wasm path/to/global-metadata.dat [output-folder]
```
*Skrip akan otomatis mengekstrak seluruh deklarasi Class, Method, dan offset ke folder tujuan dalam bentuk berkas `dump.cs`.*

---

## 3. Bukti Verifikasi Terminal

```text
$ npm run analyze:wat
[WABT Bridge] Installed WABT version: 1.0.42 (Ready)

$ npm run analyze:il2cpp
[Il2CppDumper Bridge] Binary is operational (Ready)
```
Semua komponen terhubung 100% dan siap digunakan di dalam project.
