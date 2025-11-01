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

type MapViewProps = { rows: Row[] };

const DEFAULT_CENTER: [number, number] = [-2.5489, 118.0149];
const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-12, 94], // SW Indonesia approx
  [6, 141], // NE Indonesia approx
];

// warna berdasarkan severity (1–5)
const severityColor = (sev: number | null | undefined): string => {
  if (!Number.isFinite(Number(sev))) return "#8ab4ff";
  if (Number(sev) >= 5) return "#ff4d8d";
  if (Number(sev) >= 4) return "#ff8ad8";
  if (Number(sev) >= 3) return "#ffd88a";
  return "#8ab4ff";
};

// radius marker mengikuti severity (ringan & tanpa animasi agar hemat)
const severityRadius = (sev: number | null | undefined): number => {
  const s = Number(sev);
  if (!Number.isFinite(s)) return 7;
  return 6 + Math.max(1, Math.min(5, Math.round(s))); // 7..11
};

/* Child komponen untuk fit bounds sekali ketika data berubah */
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
      // fallback: centering default jika gagal
      map.setView(DEFAULT_CENTER, 5);
    }
  }, [map, bounds]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ rows }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    return () => setReady(false);
  }, []);

  // siapkan marker dari data valid
  const markers = useMemo(() => {
    return (rows ?? [])
      .map((r) => {
        const lat = Number(r.lat);
        const lon = Number(r.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        return {
          id: r.id_insiden,
          pos: [lat, lon] as [number, number],
          prov: r.provinsi || "Tidak diketahui",
          cat: r.kategori_besar || "-",
          sev: r.tingkat_keparahan ?? null,
        };
      })
      .filter(Boolean) as {
      id: string | number | undefined;
      pos: [number, number];
      prov: string;
      cat: string;
      sev: number | null;
    }[];
  }, [rows]);

  // hitung bounds ringan (fallback ke batas Indonesia kalau kosong)
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
    // padding kecil
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
        {/* legend kaca mengambang */}
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
            {/* Basemap gelap yang modern (ringan, tanpa API key) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Auto fit ke data */}
            <FitToMarkers bounds={bounds} />

            {/* Render marker berlapis: ring + inti untuk efek subtle glow tanpa animasi */}
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
