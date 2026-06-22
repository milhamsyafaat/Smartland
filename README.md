# SmartLand

**Platform digital untuk pengukuran tanah, estimasi nilai properti, dan laporan berbasis peta interaktif.**

## Fitur

- **Ukur Tanah** — Peta interaktif Leaflet dengan marker draggable, kalkulasi luas & perimeter otomatis
- **Estimasi Nilai** — Kalkulator harga tanah berdasarkan luas, harga/m², dan referensi kecamatan
- **Dashboard** — Statistik pengukuran, grafik riwayat 7 hari, ringkasan data
- **Laporan** — Tabel riwayat pengukuran, stat summary, ekspor PDF
- **Admin Panel** — CRUD harga referensi tanah, iklan properti, daftar pengukuran

## Teknologi

| Stack | Detail |
|-------|--------|
| Frontend | Vanilla HTML + CSS + JS |
| CSS | Tailwind CSS v3 (CDN) + custom `style.css` |
| Map | Leaflet 1.9.4 + OpenStreetMap tiles |
| Chart | Chart.js (CDN) |
| Storage | localStorage |
| Fonts | Sora, Plus Jakarta Sans, JetBrains Mono |

## Struktur

```
├── index.html           # Landing page
├── dashboard.html       # Dashboard statistik
├── ukur.html            # Ukur tanah via peta
├── estimasi.html        # Kalkulator estimasi nilai
├── laporan.html         # Riwayat pengukuran
├── tentang.html         # Tentang platform
├── alur.html            # Panduan penggunaan
├── bisnis.html          # Analisis bisnis (SWOT, PESTLE)
├── kesimpulan.html      # Kesimpulan tim
├── mockup.html          # Preview internal
├── css/style.css        # Design system
├── js/script.js         # Navbar, scroll, toast
├── js/app.js            # Map, measurement, history, PDF
├── admin/               # Panel admin (CRUD)
└── AGENTS.md            # Dokumentasi teknis
```

## Cara Pakai

1. Buka `index.html` di browser (atau jalankan via local server)
2. Navigasi ke **Ukur Tanah** untuk mulai mengukur via peta
3. Gunakan **Estimasi** untuk menghitung nilai properti
4. Lihat riwayat dan statistik di **Dashboard** & **Laporan**
5. Akses panel admin di `/admin/login.html` (demo)

## Akun Admin (Demo)

- **User**: Admin / Admin
- **Password**: admin123 / admin123
