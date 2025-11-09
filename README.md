# Campus Violence Dashboard — React + Vite + Tailwind + Recharts + Leaflet

Dashboard interaktif dengan desain *liquid glass glossy* untuk mengeksplorasi dataset sintetis kekerasan di lingkungan pendidikan (82 baris, 2020–2024).

## 1) Prasyarat
- Node.js 18+ dan npm

## 2) Cara Setup (dari nol)
```bash
# (opsional) buat folder kerja
mkdir my-dashboard && cd my-dashboard

# ekstrak template ini (lihat file ZIP di bawah)
# atau salin seluruh folder `campus-violence-dashboard` ke komputer Anda

# masuk ke folder proyek
cd campus-violence-dashboard

# install dependencies
npm install

# jalankan dev server
npm run dev
```

Buka alamat yang ditampilkan (biasanya http://localhost:5173).

## 3) Build untuk produksi
```bash
npm run build
npm run preview
```

## 4) Struktur
- `public/dataset.csv` — dataset 82 baris (disalin dari file yang Anda kirim).
- `src/lib/data.ts` — loader & helper filter.
- `src/components/` — FilterPanel, StatCards, charts (Recharts), MapView (Leaflet).
- `tailwind.config.js`, `src/index.css` — tema & gaya glassmorphism.

## 5) Catatan
- Pie/Bar/Line/Histogram/Scatter sudah interaktif (hover tooltip, brush pada line).
- Peta menampilkan cluster per **provinsi** (CircleMarker) dengan popup daftar contoh insiden.
- Semua filter bekerja secara global dan mempengaruhi seluruh visual.
- Desain *glass* dapat disesuaikan di `src/index.css`.

Selamat mencoba!
