# Task Tracker OTC — Modern React JS (Vite)

Aplikasi web modern untuk pelaporan dan monitoring penyelesaian pelatihan instruktur/trainer alat berat, mulai dari kelas teori hingga praktik lapangan unit tambang.

Proyek ini merupakan hasil migrasi dan refactoring arsitektur dari versi vanilla JavaScript (HTML/CSS/JS) menjadi Single Page Application (SPA) modern berbasis **React 18 + Vite**, **Framer Motion**, dan **Lucide React**, dengan tetap mempertahankan 100% fungsionalitas, kompatibilitas backend Google Apps Script, serta skema basis data Google Sheets.

---

## 🚀 Fitur & Peningkatan Utama

1. **Vite + React 18**: Build secepat kilat (*hot module replacement* instan) dengan *code splitting* otomatis (`vendor-react`, `vendor-motion`, `vendor-chart`, `vendor-icons`).
2. **Framer Motion Integration**: Transisi halaman halus, animasi stagger pada kartu statistik & baris tabel, serta animasi dialog modal / *bottom-sheet*.
3. **Desain Responsif Penuh**:
   - Desktop: Sidebar navigasi dengan target progress bar + Topbar.
   - Mobile: Sidebar tersembunyi, modal beralih ke *bottom-sheet*, dan *Bottom Navigation Bar* 5 menu dengan tombol aksi cepat FAB (*Floating Action Button*).
4. **Dark Mode & Light Mode**: Toggle tema instan dengan persistensi di `localStorage` dan sinkronisasi otomatis CSS custom properties.
5. **Chart.js Visualizations**: Grafik batang aktivitas teori vs praktik, donat status kelulusan, dan line chart intensitas aktivitas per jam.
6. **PDF Otomatis & WhatsApp Direct**: Download PDF laporan via Base64 Blob, pratinjau PDF instan, dan integrasi pengiriman ringkasan pesan ke WhatsApp pengawas.
7. **Role-Based Access Control (RBAC)**: Proteksi rute berbasis peran (Trainer, Pengawas, Administrator).
8. **Modul Pengawas ke Superintendent (v1.3)**: Pencatatan penugasan trainer harian, cetak langsung via browser, dan arsip PDF.
9. **Manajemen Pengguna & Data Master**: Generator kata sandi acak, ekspor akun/laporan ke CSV, dan konfigurasi master (modul, armada, departemen, lokasi).
10. **Custom Branding**: Administrator dapat mengunggah logo instansi yang dioptimasi via HTML5 Canvas ke Base64 secara instan.

---

## 📁 Struktur Folder Proyek

```text
task-tracker-otc-react/
├── index.html                   # HTML Entry template (Plus Jakarta Sans & JetBrains Mono)
├── package.json                 # Dependency manifest
├── vite.config.js               # Konfigurasi Vite & Rollup Manual Chunks
├── dist/                        # Hasil kompilasi siap produksi (Production Build)
└── src/
    ├── main.jsx                 # React root renderer
    ├── App.jsx                  # Router registry, AuthProvider, ThemeProvider, ToastProvider
    ├── api/
    │   └── apiClient.js         # HTTP Client (POST text/plain ke GAS) & SWR Cache
    ├── config/
    │   └── appConfig.js         # Endpoint URL Google Apps Script & batas timeout
    ├── context/
    │   ├── AuthContext.jsx      # Autentikasi, sesi login, RBAC, dan user profile
    │   ├── ThemeContext.jsx     # State tema terang/gelap (light/dark)
    │   └── ToastContext.jsx     # Notifikasi toast mengambang beranimasi
    ├── components/
    │   ├── common/              # Komponen reusable (Modal, Toast, StatusPill, Loader, EmptyState, dll.)
    │   └── layout/              # Shell aplikasi (Sidebar, Topbar, BottomNav, AppLayout)
    ├── pages/
    │   ├── Login/               # Halaman Login
    │   ├── Dashboard/           # Halaman Dashboard Kinerja & Visualisasi
    │   ├── Laporan/             # Daftar Laporan, Input Baru, Ubah, & Detail Laporan OTC
    │   ├── Pengawas/            # Modul Laporan Pengawas ke Superintendent
    │   ├── Pengguna/            # Kelola Akun Pengguna & Matriks Hak Akses
    │   ├── Master/              # Konfigurasi Data Master (4 Tab)
    │   ├── Log/                 # Log Audit Keamanan & Grafik Per Jam
    │   └── Profil/              # Profil Pengguna & Upload Logo Kustom
    ├── styles/
    │   └── style.css            # Sistem desain lengkap, token warna, & layout
    └── utils/
        └── formatters.js        # Format tanggal WITA, angka, CSV, PDF Blob, WhatsApp link
```

---

## 🛠️ Cara Menjalankan Proyek

Pastikan Anda berada di direktori `d:\material\task-tracker-otc-react`.

### 1. Mode Pengembangan (Development Server)
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000` dengan fitur live reload / HMR.

### 2. Kompilasi Produksi (Production Build)
```bash
npm run build
```
File hasil kompilasi akan berada di folder `dist/` dan siap diunggah ke hosting mana pun.

### 3. Pratinjau Hasil Build (Preview Server)
```bash
npm run preview
```

---

## 🔗 Konfigurasi Backend

Konfigurasi backend berada di `src/config/appConfig.js`:
```javascript
export const APP_CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzTgAyo4TVv0h7Rx_vaYEIYFf4qsbOaivE6wNNaCZZytu7Q4cjhE8Btgo4wfC0E3W0J/exec',
  APP_NAME: 'Task Tracker OTC',
  TIMEOUT_MS: 60000
};
```
Backend menggunakan Google Apps Script yang terhubung ke Google Sheets sebagai database.
Metode request tetap menggunakan `POST` dengan `Content-Type: text/plain;charset=utf-8` untuk menjamin nol kendala CORS preflight.
