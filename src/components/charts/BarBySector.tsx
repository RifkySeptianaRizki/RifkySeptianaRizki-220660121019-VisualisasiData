// FILE: src/components/charts/BarBySector.tsx
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Row } from "../../lib/types";
import { fmtInt } from "../../lib/number";

type BarBySectorProps = { rows: Row[] };

const COLORS = [
  "#8ab4ff",
  "#ffd88a",
  "#ff8ad8",
  "#4ade80",
  "#c084fc",
  "#f97316",
];

const ellipsize = (s: string, n = 24) =>
  s.length > n ? s.slice(0, n - 1) + "…" : s;

const BarBySector: React.FC<BarBySectorProps> = ({ rows }) => {
  const { data, total } = useMemo(() => {
    const counter = new Map<string, number>();
    (rows ?? []).forEach((r) => {
      const key = r?.sektor_pendidikan?.trim() || "Tidak tercatat";
      counter.set(key, (counter.get(key) ?? 0) + 1);
    });
    const list = Array.from(counter.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { data: list, total: list.reduce((a, b) => a + b.value, 0) };
  }, [rows]);

  return (
    <section
      className={[
        "group card glossy-fix h-full space-y-4 relative overflow-hidden",
        "hover-glass-black", // kelas hover (lihat CSS di bawah)
      ].join(" ")}
    >
      {/* overlay gloss black on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 100% at 10% 0%, rgba(0,0,0,.25), transparent 60%), linear-gradient(180deg, rgba(8,10,22,.45), rgba(8,10,22,.55))",
          WebkitBackdropFilter: "blur(6px) saturate(120%)",
          backdropFilter: "blur(6px) saturate(120%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
        }}
      />

      <header className="relative z-[1] flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45 group-hover:text-white/60 transition-colors">
            Distribusi sektor
          </p>
          <h3 className="text-lg font-semibold text-white">
            Insiden per sektor pendidikan
          </h3>
        </div>
        <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
          Soroti titik panas institusi.
        </p>
      </header>

      {!data.length ? (
        <div className="relative z-[1] flex h-[280px] items-center justify-center text-sm text-white/60">
          Tidak ada data sektor untuk ditampilkan.
        </div>
      ) : (
        <div className="relative z-[1] h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 12, right: 18, left: -40, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 8"
                stroke="rgba(255,255,255,0.08)"
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
                tickFormatter={(v) => ellipsize(String(v))}
                width={180}
              />

              <defs>
                {COLORS.map((c, i) => (
                  <linearGradient
                    key={i}
                    id={`bar-${i}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
                    <stop offset="30%" stopColor={c} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.85} />
                  </linearGradient>
                ))}
              </defs>

              <Tooltip
                contentStyle={{
                  background: "rgba(15,17,36,.92)",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.15)",
                  color: "#f8faff", // warna default konten
                  boxShadow: "0 8px 28px rgba(0,0,0,.35)",
                }}
                labelStyle={{ color: "#f8faff" }} // judul tooltip (label) > putih
                itemStyle={{ color: "#f8faff" }} // isi item tooltip > putih
                formatter={(v: any, _k: any, p: any) => {
                  const pct = total
                    ? ((v / total) * 100).toFixed(1) + "%"
                    : "0%";
                  return [
                    `${fmtInt(v)} (${pct})`,
                    p?.payload?.name ?? "Jumlah",
                  ];
                }}
              />

              <Bar
                dataKey="value"
                radius={[14, 14, 14, 14]}
                background={{ fill: "rgba(255,255,255,0.06)" }}
                isAnimationActive
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={`url(#bar-${i % COLORS.length})`} />
                ))}

                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: number) => fmtInt(v)}
                  style={{
                    fill: "rgba(255,255,255,0.98)",
                    fontSize: 12,
                    fontWeight: 600,
                    paintOrder: "stroke",
                    stroke: "rgba(0,0,0,0.25)", // garis tipis di belakang teks
                    strokeWidth: 2,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default BarBySector;
