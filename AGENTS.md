# JOKI PAANG (SmartLand)

Platform digital untuk pengukuran tanah, estimasi nilai properti, dan laporan berbasis peta interaktif.

## Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Frontend | Vanilla HTML + CSS + JS | No build step |
| CSS Framework | Tailwind CSS v3 | CDN (`cdn.tailwindcss.com`) |
| Design System | `css/style.css` | CSS custom properties, BEM-like |
| Map | Leaflet 1.9.4 | CDN (`unpkg.com`), OpenStreetMap tiles |
| Charts | Chart.js | CDN (`cdn.jsdelivr.net`) |
| Fonts | Sora, Plus Jakarta Sans, JetBrains Mono | Google Fonts |
| Storage | localStorage | Semua data pengukuran, harga referensi, iklan |
| Admin | Static HTML + localStorage auth | Hardcoded credentials |

## Struktur

```
├── index.html           # Landing page (hero, fitur, CTA)
├── dashboard.html       # Dashboard (stat cards, chart, aktivitas)
├── ukur.html            # Ukur tanah via peta Leaflet + marker draggable
├── estimasi.html        # Kalkulator estimasi nilai tanah
├── laporan.html         # Riwayat pengukuran + tabel + stat summary
├── tentang.html         # Tentang
├── alur.html            # Panduan penggunaan
├── bisnis.html          # Prospek & model bisnis (SWOT, PESTLE)
├── kesimpulan.html      # Kesimpulan tim
├── mockup.html          # Canvas preview (internal tool)
│
├── css/
│   └── style.css        # Design system + semua komponen CSS
├── js/
│   ├── script.js        # Navbar, scroll reveal, toast, active nav
│   └── app.js           # Leaflet map, measurement, history, PDF export
│
├── admin/
│   ├── index.html       # Admin dashboard (chart + stats)
│   ├── login.html       # Admin login
│   ├── harga.html       # CRUD harga referensi tanah
│   ├── iklan.html       # CRUD iklan properti
│   └── pengukuran.html  # Daftar semua pengukuran
│
└── AGENTS.md
```

## Brand & Warna

| Token | Value | Penggunaan |
|-------|-------|------------|
| `--primary` | `#16a34a` (hijau forest) | Tombol, link, aksen utama |
| `--primary-light` | `#22c55e` | Hover state |
| `--primary-dark` | `#15803d` | Gradient hero |
| `--accent` | `#d97706` (amber) | Nilai estimasi, badge, aksen sekunder |
| `--accent-dim` | `rgba(217,119,6,0.1)` | Background total estimasi |
| Background section | `#f0fdf4` (hijau soft) | `.section-alt` |
| Card border-top | `3px solid var(--primary)` | `.dash-card`, `.stat-summary` |

Palet pendukung: navy (`#0f172a`) di hero gradient, putih/abu-abu untuk card & text.

## Halaman Penting

### `ukur.html` — Map & Measurement

- Leaflet map dengan tile OSM
- Dua mode: **Jelajah** (pan map) dan **Ukur** (tambah titik)
- Marker: `L.marker` + `L.divIcon` (lingkaran hijau 16px, **draggable**)
- Poligon hijau + garis amber antar titik
- Hitung luas (`* Math.cos(midLat)`) dan perimeter (haversine)
- Estimasi modal (harga/m²), simpan ke localStorage
- **Wajib**: Leaflet JS (`unpkg.com`) di-load **sebelum** `app.js`

### `dashboard.html` — Stat Cards

- 4 kartu: Total Pengukuran, Total Luas, Total Nilai, Rata-rata Luas
- Font responsive: `clamp(0.85rem, 3.5vw, 1.35rem)` + `word-break`
- Chart.js line chart (riwayat 7 hari)
- Tombol **Hapus Semua Data** (konfirmasi ganda)
- Guard NaN: `(h.luas || 0)` dan `(h.nilai || 0)`

### `laporan.html` — Riwayat & Export

- Tabel dengan kolom: Lokasi, Luas, Perimeter, Estimasi Nilai, Tanggal, Aksi
- Stat summary di atas tabel (sama dengan dashboard)
- Tombol **PDF** (buka window baru → print), **Hapus**
- Inline script patch `window.loadHistory` — panggil `origLoad()` dulu baru update stats
- Hanya render tabel SEKALI (app.js redundant call dihapus)

### `estimasi.html` — Kalkulator

- Input luas + harga/m² + referensi kecamatan
- Hitung otomatis, tampilkan hasil + detail
- Simpan ke laporan (localStorage)

## Notification — Toast System

- Semua `alert()` sudah diganti dengan `showToast(message, type)`
- Tipe: `'success'` (hijau), `'error'` (merah), `'info'` (biru)
- CSS di `style.css`: slide-in dari kanan, auto-dismiss 3.5 detik
- JS global di `script.js:52` (`window.showToast`)

## Data Flow

```
localStorage('smartland_measurements')
  └─ Array of { id, lokasi, luas, perimeter, nilai, tanggal, waktu, points[] }

localStorage('smartland_harga_ref')
  └─ Array of { kecamatan, harga }

localStorage('smartland_iklan')
  └─ Array of { id, judul, agency, harga, link, images[] }
```

## Konvensi Kode

- **JS**: ES5 compatible (var, function expressions, no arrow/const/let in shared files)
- **CSS**: Custom properties di `:root`, kelas BEM-like (`.dobel`, `.dash-card`)
- **Styling**: Hindari `alert()` / `confirm()` — pakai `showToast()` / custom modal
- **Responsive**: Tailwind utility classes + `clamp()` untuk font
- **Navbar**: Fixed top, hamburger mobile, overlay di luar `<header>`

## Catatan Penting

1. **Leaflet** harus di-load **sebelum** `app.js` di `ukur.html` — atau `L` undefined
2. **Rumus luas**: `area * (111320^2) * Math.cos(midLat)` — jangan dibalik pake `/`
3. **`section-alt`** udah diubah background-nya dari `#f9fafb` ke `#f0fdf4` (tint hijau)
4. **Double render** di `laporan.html` udah difix — `loadHistory()` cuma dipanggil sekali dari inline script
5. **Semua field `nilai`/`luas`** harus pakai guard `|| 0` saat reduce

## Admin Auth

- Login: `admin/login.html` → set `localStorage('smartland_admin') = 'true'`
- Proteksi: `if (localStorage.getItem('smartland_admin') !== 'true')` redirect
- Credential hardcoded (demo/educational)
- Username: admin
- Password: smartland123
