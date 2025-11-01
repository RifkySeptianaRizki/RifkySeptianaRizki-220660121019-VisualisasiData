// FILE: src/components/map/MapView.tsx
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip as LeafletTooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Row } from "../../lib/types";

/* ===================== Konstanta peta ===================== */
const DEFAULT_CENTER: [number, number] = [-2.5489, 118.0149];
const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-12, 94], // SW Indonesia
  [6, 141], // NE Indonesia
];

/* ===================== Util parsing koordinat ===================== */
const LAT_KEYS = [
  "lat",
  "latitude",
  "lat_dd",
  "koordinat_lat",
  "koord_lat",
  "y",
];
const LON_KEYS = [
  "lon",
  "lng",
  "long",
  "longitude",
  "lon_dd",
  "koordinat_lon",
  "koord_lon",
  "x",
];

// "-6,214 " -> -6.214 ; "(106.8)" -> 106.8
const parseCoord = (v: unknown) => {
  if (v == null) return NaN;
  let s = String(v).trim();
  s = s.replace(/[()]/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

const norm = (s?: string) =>
  (s ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const normalizeProvince = (p?: string) => {
  const k = norm(p);
  const alias: Record<string, string> = {
    "dki jakarta": "jakarta",
    "daerah khusus ibukota jakarta": "jakarta",
    "di yogyakarta": "yogyakarta",
    "d i yogyakarta": "yogyakarta",
    diy: "yogyakarta",
    "kepulauan bangka belitung": "bangka belitung",
    "kep bangka belitung": "bangka belitung",
    "kepulauan riau": "kepri",
    "kep riau": "kepri",
    ntt: "nusa tenggara timur",
    ntb: "nusa tenggara barat",
    // pembaruan provinsi Papua
    papua: "papua", // data lama
  };
  return alias[k] || k;
};

// titik tengah provinsi (perkiraan — cukup untuk plotting agregat)
const PROV_CENTROIDS: Record<string, [number, number]> = {
  aceh: [4.695, 96.749],
  "sumatera utara": [2.115, 99.545],
  "sumatera barat": [-0.739, 100.8],
  riau: [0.51, 101.438],
  kepri: [3.945, 108.142],
  jambi: [-1.61, 103.612],
  "sumatera selatan": [-3.319, 104.914],
  bengkulu: [-3.518, 102.535],
  lampung: [-4.558, 105.406],
  "bangka belitung": [-2.322, 106.09],
  jakarta: [-6.2, 106.816],
  "jawa barat": [-6.889, 107.64],
  "jawa tengah": [-7.15, 110.14],
  yogyakarta: [-7.795, 110.369],
  "jawa timur": [-7.536, 112.238],
  banten: [-6.405, 106.064],
  bali: [-8.455, 115.195],
  "nusa tenggara barat": [-8.652, 117.361],
  "nusa tenggara timur": [-9.007, 124.125],
  "kalimantan barat": [0.132, 111.096],
  "kalimantan tengah": [-1.618, 113.382],
  "kalimantan selatan": [-3.092, 115.283],
  "kalimantan timur": [0.537, 116.419],
  "kalimantan utara": [3.014, 116.002],
  "sulawesi utara": [1.493, 124.845],
  "sulawesi tengah": [-1.43, 121.445],
  "sulawesi selatan": [-3.668, 119.974],
  "sulawesi tenggara": [-4.144, 122.174],
  gorontalo: [0.699, 122.446],
  "sulawesi barat": [-2.512, 119.325],
  maluku: [-3.118, 129.463],
  "maluku utara": [1.57, 127.808],
  papua: [-4.269, 138.08],
  "papua barat": [-1.336, 133.174],
  "papua barat daya": [-0.869, 131.26],
  "papua selatan": [-6.234, 140.311],
  "papua tengah": [-3.777, 137.001],
  "papua pegunungan": [-4.1, 138.7],
};

// Ambil lat/lon dari row; jika kosong, fallback ke centroid provinsi
const pickLatLon = (row: any): [number, number] | null => {
  // 1) pasangan kolom eksplisit
  for (const lk of LAT_KEYS) {
    for (const ok of LON_KEYS) {
      const lat = parseCoord(row?.[lk]);
      const lon = parseCoord(row?.[ok]);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return [lat, lon];
    }
  }
  // 2) string gabungan "lat,lon" / "lat;lon"
  const combo =
    row?.coord ||
    row?.coords ||
    row?.koordinat ||
    row?.coordinate ||
    row?.coordinates;
  if (combo != null) {
    const s = String(combo).replace(",", ".");
    const m = s.match(/(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)/);
    if (m) {
      const lat = parseCoord(m[1]);
      const lon = parseCoord(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return [lat, lon];
    }
  }
  // 3) fallback: provinsi
  const pkey = normalizeProvince(row?.provinsi || row?.province || row?.prov);
  if (pkey && PROV_CENTROIDS[pkey]) return PROV_CENTROIDS[pkey];
  return null;
};

/* ===================== Styling marker ===================== */
const severityColor = (sev: number | null | undefined): string => {
  if (!Number.isFinite(Number(sev))) return "#8ab4ff";
  if (Number(sev) >= 5) return "#ff4d8d";
  if (Number(sev) >= 4) return "#ff8ad8";
  if (Number(sev) >= 3) return "#ffd88a";
  return "#8ab4ff";
};

const severityRadius = (sev: number | null | undefined): number => {
  const s = Number(sev);
  if (!Number.isFinite(s)) return 7;
  return 6 + Math.max(1, Math.min(5, Math.round(s))); // 7..11
};

/* ===================== Fit bounds helper ===================== */
const FitToMarkers = ({
  bounds,
}: {
  bounds: [[number, number], [number, number]];
}) => {
  const map = useMap();
  useEffect(() => {
    try {
      map.fitBounds(bounds, { padding: [24, 24] });
    } catch {
      map.setView(DEFAULT_CENTER, 5);
    }
  }, [map, bounds]);
  return null;
};

/* ===================== Komponen utama ===================== */
type MapViewProps = { rows: Row[] };

const MapView: React.FC<MapViewProps> = ({ rows }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    return () => setReady(false);
  }, []);

  // siapkan marker: gunakan koordinat asli atau fallback provinsi
  const markers = useMemo(() => {
    return (rows ?? [])
      .map((r) => {
        const pos = pickLatLon(r as any);
        if (!pos) return null;
        return {
          id:
            (r as any).id_insiden ??
            (r as any).id ??
            `${(r as any).provinsi}-${(r as any).jenis_insiden}`,
          pos,
          prov: (r as any).provinsi || "Tidak diketahui",
          cat: (r as any).kategori_besar || "-",
          sev: (r as any).tingkat_keparahan ?? null,
        };
      })
      .filter(Boolean) as {
      id: string | number;
      pos: [number, number];
      prov: string;
      cat: string;
      sev: number | null;
    }[];
  }, [rows]);

  // info kecil di console untuk diagnosa
  useEffect(() => {
    const total = rows?.length ?? 0;
    const withCoord = (rows ?? []).filter((r) => pickLatLon(r as any)).length;
    if (total) {
      // eslint-disable-next-line no-console
      console.log(
        `[Map] baris: ${total}, terbaca koordinat (termasuk fallback provinsi): ${withCoord}`
      );
    }
  }, [rows]);

  // bounds ringan
  const bounds: [[number, number], [number, number]] = useMemo(() => {
    if (!markers.length) return DEFAULT_BOUNDS;
    let minLat = Infinity,
      minLon = Infinity,
      maxLat = -Infinity,
      maxLon = -Infinity;
    for (const m of markers) {
      minLat = Math.min(minLat, m.pos[0]);
      minLon = Math.min(minLon, m.pos[1]);
      maxLat = Math.max(maxLat, m.pos[0]);
      maxLon = Math.max(maxLon, m.pos[1]);
    }
    const pad = 0.5;
    return [
      [minLat - pad, minLon - pad],
      [maxLat + pad, maxLon + pad],
    ];
  }, [markers]);

  return (
    <section className="card glossy-fix h-full space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Geospasial
          </p>
          <h3 className="text-lg font-semibold text-white">
            Sebaran lokasi insiden
          </h3>
        </div>
        <p className="text-xs text-white/50">
          Fokus area rawan dengan marker proporsional.
        </p>
      </header>

      <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-white/10">
        {/* legenda kaca mengambang */}
        <div className="pointer-events-none absolute right-3 top-3 z-[500]">
          <div className="glass rounded-2xl px-3 py-2 border border-white/15 shadow-glass">
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="opacity-70">Severity:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="inline-flex items-center gap-1">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: severityColor(s) }}
                  />
                  <span className="opacity-80">{s}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {!ready ? (
          <div className="grid h-full place-items-center text-sm text-white/60">
            Memuat peta…
          </div>
        ) : (
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={5}
            className="h-full w-full"
            scrollWheelZoom={false}
            minZoom={4}
            maxZoom={12}
            zoomControl={true}
          >
            {/* Basemap gelap modern (tanpa API key) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* auto fit ke data */}
            <FitToMarkers bounds={bounds} />

            {/* Marker: ring lembut + inti */}
            {markers.map((m) => {
              const col = severityColor(m.sev);
              const r = severityRadius(m.sev);
              return (
                <div key={String(m.id)}>
                  {/* ring luar */}
                  <CircleMarker
                    center={m.pos}
                    radius={r + 3}
                    pathOptions={{
                      color: col,
                      fillColor: col,
                      fillOpacity: 0.12,
                      weight: 1,
                      opacity: 0.6,
                    }}
                  />
                  {/* inti */}
                  <CircleMarker
                    center={m.pos}
                    radius={r}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 1,
                      opacity: 0.9,
                      fillColor: col,
                      fillOpacity: 0.85,
                    }}
                  >
                    <LeafletTooltip
                      direction="top"
                      offset={[0, -6]}
                      opacity={1}
                      className="!bg-[rgba(15,17,36,0.92)] !text-white !border !border-white/20 !rounded-xl !px-3 !py-2"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold leading-tight">
                          {m.prov}
                        </p>
                        <p className="text-xs text-white/70 leading-tight">
                          {m.cat}
                        </p>
                        <p className="text-[11px] text-white/60 leading-tight">
                          Severity:{" "}
                          <span className="font-semibold">{m.sev ?? "-"}</span>
                        </p>
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                </div>
              );
            })}
          </MapContainer>
        )}
      </div>
    </section>
  );
};

export default MapView;
