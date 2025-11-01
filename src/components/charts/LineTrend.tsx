// FILE: src/components/charts/LineTrend.tsx
import { useMemo } from "react";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Row } from "../../lib/types";

/* ---------------- helpers ---------------- */
type TrendPoint = {
  key: string; // YYYY-MM
  label: string; // "Jan 2024"
  sexual: number;
  nonSexual: number;
};

// normalisasi string kategori supaya perbandingan tegas (bukan .includes)
const norm = (s?: string) =>
  (s ?? "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // buang diakritik
    .replace(/[-_/]/g, " ") // ganti tanda hubung/garis bawah
    .replace(/\s+/g, " ") // rapikan spasi
    .trim()
    .toLowerCase();

const isSexual = (cat?: string) => {
  const k = norm(cat);
  return k === "kekerasan seksual" || k === "seksual";
};
const isNonSexual = (cat?: string) => {
  const k = norm(cat);
  return k === "non seksual" || k === "nonseksual" || k.startsWith("non");
};

const monthKey = (dateString?: string): string | null => {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
};

const monthLabel = (key: string): string => {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
};

/* ---------------- component ---------------- */
export default function LineTrend({ rows }: { rows: Row[] }) {
  const data = useMemo<TrendPoint[]>(() => {
    const map = new Map<string, TrendPoint>();

    for (const r of rows) {
      const k = monthKey((r as any).tanggal_insiden);
      if (!k) continue;

      const item =
        map.get(k) ??
        ({
          key: k,
          label: monthLabel(k),
          sexual: 0,
          nonSexual: 0,
        } as TrendPoint);

      // KLASIFIKASI TEGAS (bukan .includes("seksual"))
      if (isSexual((r as any).kategori_besar)) item.sexual += 1;
      else if (isNonSexual((r as any).kategori_besar)) item.nonSexual += 1;
      else item.nonSexual += 1; // fallback aman

      map.set(k, item);
    }

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [rows]);

  // sumbu Y diberi headroom supaya garis terlihat meski count kecil
  const maxY = useMemo(
    () =>
      data.length
        ? Math.max(...data.map((d) => Math.max(d.sexual, d.nonSexual)))
        : 0,
    [data]
  );

  if (!data.length) {
    return (
      <section className="card">
        <div className="text-xs uppercase tracking-[0.3em] text-white/45">
          Tren bulanan
        </div>
        <h3 className="text-base font-semibold mb-2">Seksual vs Non-seksual</h3>
        <div className="h-[300px] grid place-items-center text-sm text-white/60">
          Data tren belum tersedia. Coba longgarkan filter.
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/45">
            Tren bulanan
          </div>
          <h3 className="text-base font-semibold">Seksual vs Non-seksual</h3>
        </div>
        <p className="text-xs text-white/60">
          Mengelompokkan insiden per bulan.
        </p>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={16}
            />
            <YAxis
              domain={[0, Math.max(5, maxY + 1)]}
              allowDecimals={false}
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              width={40}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v: any) => [v, ""]}
              contentStyle={{
                background: "rgba(15,17,36,.92)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.15)",
                color: "#f8faff",
              }}
            />
            <Legend
              wrapperStyle={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}
            />

            {/* warna solid kontras tinggi agar selalu terlihat */}
            <Line
              type="monotone"
              dataKey="sexual"
              name="Kekerasan seksual"
              stroke="var(--line-sexual, #ff8ad8)"
              strokeOpacity={0.95}
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="nonSexual"
              name="Non-seksual"
              stroke="var(--line-non, #8ab4ff)"
              strokeOpacity={0.95}
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive
            />

            <Brush
              dataKey="label"
              height={16}
              travellerWidth={10}
              stroke="#8ab4ff"
              fill="rgba(138,180,255,0.12)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
