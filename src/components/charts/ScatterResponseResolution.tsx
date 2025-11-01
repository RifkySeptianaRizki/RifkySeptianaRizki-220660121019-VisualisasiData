// FILE: src/components/charts/ScatterResponseResolution.tsx
import { useMemo } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { Row } from "../../lib/types";

type ScatterResponseResolutionProps = {
  rows: Row[];
};

type ScatterPoint = {
  response: number; // jam
  resolution: number; // hari
  label: string;
};

const ScatterResponseResolution: React.FC<ScatterResponseResolutionProps> = ({
  rows,
}) => {
  const data = useMemo<ScatterPoint[]>(() => {
    return (rows ?? [])
      .map((row) => {
        const response = row.waktu_respon_jam;
        const resolution = row.hari_penyelesaian;
        if (
          typeof response !== "number" ||
          !Number.isFinite(response) ||
          typeof resolution !== "number" ||
          !Number.isFinite(resolution)
        ) {
          return null;
        }
        return {
          response,
          resolution,
          label: row.jenis_insiden || String(row.id_insiden ?? ""),
        };
      })
      .filter((p): p is ScatterPoint => Boolean(p));
  }, [rows]);

  // domain & mean ringan untuk ReferenceLine (murah, tidak berat)
  const { maxX, maxY, meanX, meanY } = useMemo(() => {
    if (data.length === 0) return { maxX: 0, maxY: 0, meanX: 0, meanY: 0 };
    const sx = data.reduce((a, b) => a + b.response, 0);
    const sy = data.reduce((a, b) => a + b.resolution, 0);
    const mx = Math.max(...data.map((d) => d.response));
    const my = Math.max(...data.map((d) => d.resolution));
    return {
      maxX: Math.ceil(mx * 1.05),
      maxY: Math.ceil(my * 1.05),
      meanX: sx / data.length,
      meanY: sy / data.length,
    };
  }, [data]);

  // titik custom super-ringan (tanpa filter/blur)
  const Dot = (props: any) => {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3.2}
        fill="var(--line-non, #8ab4ff)" // biru lembut
        stroke="rgba(255,255,255,.85)"
        strokeWidth={0.8}
        opacity={0.95}
      />
    );
  };

  return (
    <section className="card glossy-fix h-full space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Respons
          </p>
          <h3 className="text-lg font-semibold text-white">
            Waktu respon vs hari penyelesaian
          </h3>
        </div>
        <p className="text-xs text-white/50">
          Identifikasi anomali waktu tindak lanjut.
        </p>
      </header>

      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-white/60">
          Data waktu respon atau hari penyelesaian belum lengkap.
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 20, left: 20, bottom: 16 }}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="3 8"
              />
              <XAxis
                dataKey="response"
                name="Waktu respon (jam)"
                type="number"
                domain={[0, maxX]}
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="resolution"
                name="Hari penyelesaian"
                type="number"
                domain={[0, maxY]}
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                width={52}
                axisLine={false}
                tickLine={false}
              />

              {/* Garis rata-rata ringan */}
              <ReferenceLine
                x={meanX}
                stroke="rgba(138,180,255,.6)"
                strokeDasharray="5 6"
              />
              <ReferenceLine
                y={meanY}
                stroke="rgba(255,216,138,.6)"
                strokeDasharray="5 6"
              />

              <Tooltip
                cursor={{ strokeDasharray: "4 4" }}
                contentStyle={{
                  background: "rgba(15,17,36,.92)",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.15)",
                  color: "#fff", // <-- putih untuk kontainer
                  boxShadow: "0 8px 28px rgba(0,0,0,.35)",
                }}
                itemStyle={{ color: "#fff" }} // <-- putih untuk item nilai & nama
                labelStyle={{ color: "#fff", opacity: 0.8 }} // <-- putih untuk label (judul)
                formatter={(v: number, n: string) => [
                  n.includes("respon") ? `${v} jam` : `${v} hari`,
                  n,
                ]}
                labelFormatter={() => ""}
              />

              <Scatter
                data={data}
                shape={<Dot />} // titik ringan
                isAnimationActive={false} // non-animasi: anti-lag
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default ScatterResponseResolution;
