// FILE: src/components/charts/HistogramSeverity.tsx
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

type HistogramSeverityProps = { rows: Row[] };

const SEV_GRADIENTS = [
  "#8ab4ff", // 1
  "#9fd1ff", // 2
  "#ffd88a", // 3
  "#ffb38a", // 4
  "#ff8ad8", // 5
];

const HistogramSeverity: React.FC<HistogramSeverityProps> = ({ rows }) => {
  const data = useMemo(() => {
    const buckets = [1, 2, 3, 4, 5].map((severity) => ({ severity, count: 0 }));
    (rows ?? []).forEach((row) => {
      const s = row.tingkat_keparahan;
      if (typeof s === "number" && s >= 1 && s <= 5) {
        buckets[Math.round(s) - 1].count += 1;
      }
    });
    return buckets;
  }, [rows]);

  const hasData = data.some((b) => b.count > 0);
  const maxY = useMemo(
    () => Math.max(5, ...data.map((d) => d.count)) + 1,
    [data]
  );

  return (
    <section
      className={[
        "group card glossy-fix h-full space-y-4 relative overflow-hidden",
      ].join(" ")}
    >
      {/* overlay gloss gelap saat hover */}
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
            Severity
          </p>
          <h3 className="text-lg font-semibold text-white">
            Histogram tingkat keparahan
          </h3>
        </div>
        <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
          Nilai berkisar 1 (rendah) hingga 5 (ekstrem).
        </p>
      </header>

      {!hasData ? (
        <div className="relative z-[1] flex h-[300px] items-center justify-center text-sm text-white/60">
          Data severity belum tersedia.
        </div>
      ) : (
        <div className="relative z-[1] h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 12, right: 18, left: 18, bottom: 8 }}
            >
              {/* grid tipis berkilau */}
              <CartesianGrid
                strokeDasharray="3 8"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="severity"
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, maxY]}
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                width={36}
                axisLine={false}
                tickLine={false}
              />

              {/* gradien per level */}
              <defs>
                {SEV_GRADIENTS.map((c, i) => (
                  <linearGradient
                    key={i}
                    id={`sev-${i + 1}`}
                    x1="0"
                    y1="1"
                    x2="0"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={c} stopOpacity={0.75} />
                    <stop offset="55%" stopColor={c} stopOpacity={0.95} />
                    <stop
                      offset="100%"
                      stopColor="#ffffff"
                      stopOpacity={0.18}
                    />
                  </linearGradient>
                ))}
              </defs>

              <Tooltip
                formatter={(value: number, _name, payload) => [
                  `${value} insiden`,
                  `Severity ${payload?.payload?.severity}`,
                ]}
                contentStyle={{
                  background: "rgba(15,17,36,.92)",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.15)",
                  color: "#f8faff",
                  boxShadow: "0 8px 28px rgba(0,0,0,.35)",
                }}
                labelStyle={{ color: "#f8faff" }}
                itemStyle={{ color: "#f8faff" }}
              />

              <Bar
                dataKey="count"
                radius={[10, 10, 0, 0]}
                background={{ fill: "rgba(255,255,255,0.06)" }}
                isAnimationActive
              >
                {data.map((d) => (
                  <Cell key={d.severity} fill={`url(#sev-${d.severity})`} />
                ))}

                {/* angka di atas bar (kontras tinggi) */}
                <LabelList
                  dataKey="count"
                  position="top"
                  formatter={(v: number) => (v ? fmtInt(v) : "")}
                  style={{
                    fill: "rgba(255,255,255,0.98)",
                    fontSize: 12,
                    fontWeight: 600,
                    paintOrder: "stroke",
                    stroke: "rgba(0,0,0,0.25)",
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

export default HistogramSeverity;
