// FILE: src/components/charts/PieStatus.tsx
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Row } from "../../lib/types";
import { fmtInt } from "../../lib/number";

type PieStatusProps = { rows: Row[] };
type Slice = { name: string; value: number; pct: number };

const COLORS = [
  "#8ab4ff",
  "#ff8ad8",
  "#ffd88a",
  "#4ade80",
  "#c084fc",
  "#f97316",
  "#60a5fa",
  "#f472b6",
];
const MIN_BUCKET_PCT = 0.03; // <3% dikelompokkan sebagai "Lainnya"

/* ====== Label persen di dalam ring (muncul jika >=6%) ====== */
const PercentLabel = (p: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = p;
  if (!percent || percent < 0.06) return null;
  const rad = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.62;
  const x = cx + r * Math.cos(-midAngle * rad);
  const y = cy + r * Math.sin(-midAngle * rad);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

/* ====== Tooltip custom ====== */
const TooltipBox = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (!active || !payload?.length) return null;
  const s = payload[0]?.payload as Slice | undefined;
  if (!s) return null;
  return (
    <div
      style={{
        background: "rgba(15,17,36,.92)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,.15)",
        color: "#f8faff",
        padding: "10px 12px",
        boxShadow: "0 8px 28px rgba(0,0,0,.35)",
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 2 }}>Status</div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{s.name}</div>
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <div>
          <span style={{ opacity: 0.8 }}>Insiden:</span>{" "}
          <b>{fmtInt(s.value)}</b>
        </div>
        <div>
          <span style={{ opacity: 0.8 }}>Proporsi:</span>{" "}
          <b>{(s.pct * 100).toFixed(1)}%</b>
        </div>
      </div>
    </div>
  );
};

const PieStatus: React.FC<PieStatusProps> = ({ rows }) => {
  const safe = rows ?? [];

  const { list, total } = useMemo(() => {
    const count = new Map<string, number>();
    for (const r of safe) {
      const key = r?.status_kasus?.toString().trim() || "Tidak tercatat";
      count.set(key, (count.get(key) ?? 0) + 1);
    }
    const sum = Array.from(count.values()).reduce((a, b) => a + b, 0);
    if (!sum) return { list: [] as Slice[], total: 0 };

    const raw: Slice[] = Array.from(count.entries())
      .map(([name, value]) => ({ name, value, pct: value / sum }))
      .sort((a, b) => b.value - a.value);

    let others = 0;
    const major: Slice[] = [];
    for (const s of raw)
      s.pct < MIN_BUCKET_PCT ? (others += s.value) : major.push(s);
    if (others > 0)
      major.push({ name: "Lainnya", value: others, pct: others / sum });

    return { list: major, total: sum };
  }, [safe]);

  return (
    <section className="group card glossy-fix h-full space-y-4 relative overflow-hidden hover-glass-black">
      {/* overlay liquid-glass hitam saat hover */}
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
            Status
          </p>
          <h3 className="text-lg font-semibold text-white">
            Komposisi status kasus
          </h3>
        </div>
        <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
          Tinjau progres penanganan.
        </p>
      </header>

      {!list.length ? (
        <div className="relative z-[1] flex h-[300px] items-center justify-center text-sm text-white/60">
          Belum ada status kasus untuk divisualisasikan.
        </div>
      ) : (
        <>
          <div className="relative z-[1] h-[320px] w-full">
            {/* label total di tengah */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/55">
                  Total
                </div>
                <div className="mt-0.5 text-2xl font-semibold text-white">
                  {fmtInt(total)}
                </div>
                <div className="mt-0.5 text-xs text-white/45">insiden</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {list.map((_, i) => (
                    <linearGradient
                      key={i}
                      id={`ring-${i}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ffffff"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="25%"
                        stopColor={COLORS[i % COLORS.length]}
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor={COLORS[i % COLORS.length]}
                        stopOpacity={0.85}
                      />
                    </linearGradient>
                  ))}
                </defs>

                {/* halo luar tipis */}
                <Pie
                  data={[{ value: 1 }]}
                  dataKey="value"
                  innerRadius={118}
                  outerRadius={122}
                  stroke="rgba(255,255,255,0.18)"
                  fill="rgba(138,180,255,0.08)"
                  isAnimationActive={false}
                />

                <Pie
                  data={list}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={3.5}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={1}
                  labelLine={false}
                  label={PercentLabel}
                  isAnimationActive
                >
                  {list.map((s, i) => (
                    <Cell key={s.name} fill={`url(#ring-${i})`} />
                  ))}
                </Pie>

                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
};

export default PieStatus;
