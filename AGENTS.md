# JOKI PAANG (SmartLand)

Platform digital untuk pengukuran tanah, estimasi nilai properti, dan laporan berbasis peta interaktif.

## Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Frontend | Vanilla HTML + CSS + JS | No build step, no bundler, no package.json |
| CSS | Tailwind CSS v3 (CDN) + `css/style.css` | Custom properties + BEM-like |
| Map | Leaflet 1.9.4 (CDN) | OpenStreetMap tiles |
| Charts | Chart.js (CDN) | Dashboard & admin |
| Storage | localStorage | Semua data |
| Pencarian | Nominatim API (OSM) | Di `ukur.html` via `fetch` |

## Developer Commands

Tidak ada build, test, lint, atau typecheck. Cukup buka file `.html` langsung di browser atau via local server statis. Semua dependency via CDN (`<script>` / `<link>`).

## Struktur Penting

- **`js/script.js`** — ES5 (IIFE, `var`, function expressions). Navbar hamburger, scroll reveal, toast system (`window.showToast`), confirm modal (`window.showConfirm`), active nav link, auth UI injection. Dimuat di **semua halaman**.
- **`js/app.js`** — ES6+ (`const/let`, arrow functions, template literals, destructuring, optional chaining, spread). Leaflet map, measurement, history CRUD, PDF export. Dimuat hanya di halaman yang membutuhkan.
- **`css/style.css`** — Design system: CSS custom properties di `:root`, BEM-like classes.
- **Admin pages** (`admin/`) — Auth via `localStorage('smartland_admin')`, redirect jika tidak login. Setiap halaman admin punya auth check inline.
- **`js/app.js`** — ES6+. Juga menyertakan `exportReport()` dengan premium check.

## Konvensi Kode & Gotchas

- **Script split**: `script.js` ES5, `app.js` ES6+. Jangan mencampur style di dalam file yang sama.
- **Toast**: Pakai `showToast(msg, 'success'|'error'|'info')` — jangan `alert()` atau `confirm()`.
- **Confirm**: Pakai `showConfirm(msg, callback)` — callback menerima `true`/`false`. Modal built-in di `script.js`.
- **Guard NaN**: Saat reduce field `luas` / `nilai` dari localStorage, pakai `(item.luas || 0)`.
- **Rumus luas**: `area * (111320 ** 2) * Math.cos(midLat)` — jangan dibalik dengan `/`.
- **Leaflet load order**: `<script src="leaflet.js">` harus sebelum `<script src="app.js">` di `ukur.html`.
- **Double render** `laporan.html`: `app.js` panggil `loadHistory()`, lalu inline script override `window.loadHistory` untuk update stats. Hanya render tabel **sekali**.
- **Nominatim**: `ukur.html` fetch `https://nominatim.openstreetmap.org/search` — rate-limited, tanpa API key.
- **Brand warna**:
  - `--primary`: `#16a34a` (hijau forest)
  - `--accent`: `#d97706` (amber)
  - `--primary-dark`: `#15803d` (gradient hero)
  - `--accent-dim`: `rgba(217,119,6,0.1)` (bg total estimasi)
  - `.section-alt` background: `#f0fdf4`

## User Auth (Website)

- **Daftar**: `daftar.html` — simpan di `localStorage('smartland_users')` sebagai `Array<{ id, username, password, nama, premium }>`
- **Login**: `login.html` — set `localStorage('smartland_user') = { id, username, nama }`
- **Logout**: `window.logout()` (hapus `smartland_user`, redirect ke `index.html`)
- **Premium pages**: `dashboard.html`, `laporan.html` — redirect ke `premium.html` jika bukan premium
- **Protected pages**: `ukur.html`, `estimasi.html` — redirect ke `login.html` jika belum login
- **Premium**: `premium.html` — daftar premium Rp100rb. Set `user.premium = true` di `smartland_users`.
- **Public pages**: `index.html`, `tentang.html`, `alur.html`, `bisnis.html`, `kesimpulan.html`, `mockup.html` — bisa diakses tanpa login
- **Auth UI**: `script.js` inject otomatis tombol "Masuk" (jika guest) atau nama user + "Keluar" (jika login) ke navbar setiap halaman. Admin pages (`admin/`) dan `login.html`/`daftar.html` di-skip.
- **Data per-user**: Setiap measurement punya `userId` dan `userNama`. `loadHistory()` dan dashboard stats filter by `userId`.

## Data Flow

```
localStorage('smartland_users')         → Array<{ id, username, password, nama, createdAt, premium }>
localStorage('smartland_user')          → { id, username, nama }  (session aktif)
localStorage('smartland_measurements')  → Array<{ id, userId, userNama, lokasi, luas, harga, nilai, ... }>
localStorage('smartland_harga_ref')     → Array<{ id, lokasi, harga }>
localStorage('smartland_iklan')         → Array<{ id, judul, agency, harga, link, images[] }>
localStorage('smartland_activity_log')  → Array<{ id, userId, username, nama, action, timestamp }>
```

## Admin Auth (demo)

- **Username**: `admin` / **Password**: `smartland123`
- Login set `localStorage('smartland_admin') = 'true'`. Redirect jika tidak login.
- Admin melihat **semua** data pengukuran (lintas user) + info user di kolom "User".
