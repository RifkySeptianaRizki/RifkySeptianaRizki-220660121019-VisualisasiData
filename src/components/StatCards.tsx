// FILE: src/components/StatCards.tsx
import { AlertTriangle, CheckCircle2, Clock3, ShieldHalf } from "lucide-react";
import { avg, fmtInt, fmtPct } from "../lib/number";
import type { Row } from "../lib/types";

type StatCardsProps = {
  rows: Row[];
  /** ukuran dataset asli (sebelum filter), untuk info cakupan */
  rawTotal: number;
};

/* ---------- helpers ---------- */
const clamp01 = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0);

// normalisasi kategori untuk membedakan "Kekerasan seksual" vs "Non-seksual"
const norm = (s?: string) =>
  (s ?? "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const isSexual = (cat?: string) => {
  const k = norm(cat);
  return k === "kekerasan seksual" || k === "seksual";
};

const glassIconWrap =
  "grid place-items-center h-9 w-9 rounded-2xl bg-white/7 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]";

const valueGradient =
  "bg-[linear-gradient(180deg,rgba(255,255,255,.98),rgba(255,255,255,.72))] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(138,180,255,.15)]";

/* ---------- component ---------- */
const StatCards: React.FC<StatCardsProps> = ({ rows, rawTotal }) => {
  const total = rows.length;

  const completed = rows.filter(
    (row) => norm(row.status_kasus) === "selesai"
  ).length;

  const sexual = rows.filter((row) => isSexual(row.kategori_besar)).length;

  const avgResponse = avg(rows.map((row) => row.waktu_respon_jam));

  const completionPctStr = total ? fmtPct(completed, total) : "0%";
  const sexualPctStr = total ? fmtPct(sexual, total) : "0%";

  const completionPct = clamp01(total ? completed / total : 0);
  const sexualPct = clamp01(total ? sexual / total : 0);
  const coveragePct = clamp01(rawTotal ? total / rawTotal : 0);

  const cards = [
    {
      key: "total",
      label: "Total Insiden",
      value: fmtInt(total),
      sub: rawTotal ? `Dari ${fmtInt(rawTotal)} entri dataset` : "Dataset terfilter",
      icon: ShieldHalf,
      iconClass: "text-[color:var(--primary)]",
      // progress: cakupan filter vs total dataset
      progress: coveragePct,
      progressLabel: `${fmtInt(total)} / ${fmtInt(rawTotal || total)}`,
      barClass: "from-[rgba(138,180,255,.55)] to-[rgba(138,180,255,.25)]",
    },
    {
      key: "done",
      label: "Kasus Selesai",
      value: fmtInt(completed),
      sub: total ? `${completionPctStr} selesai` : "Belum ada data",
      icon: CheckCircle2,
      iconClass: "text-emerald-300",
      progress: completionPct,
      progressLabel: completionPctStr,
      barClass: "from-[rgba(16,185,129,.55)] to-[rgba(16,185,129,.25)]",
    },
    {
      key: "sexual",
      label: "Proporsi Kekerasan Seksual",
      value: sexualPctStr,
      sub: total ? `${fmtInt(sexual)} insiden berjenis seksual` : "Belum ada data",
      icon: AlertTriangle,
      iconClass: "text-rose-300",
      progress: sexualPct,
      progressLabel: sexualPctStr,
      barClass: "from-[rgba(255,138,216,.55)] to-[rgba(255,138,216,.25)]",
    },
    {
      key: "response",
      label: "Rata-rata Waktu Respon",
      value: avgResponse !== null ? `${avgResponse.toFixed(1)} jam` : "Tidak tersedia",
      sub: "Berdasarkan entri dengan waktu respon",
      icon: Clock3,
      iconClass: "text-amber-300",
      progress: avgResponse !== null ? clamp01(avgResponse / 48) : 0, // skala kasar 0–48 jam
      progressLabel: avgResponse !== null ? `${avgResponse.toFixed(1)} jam` : "—",
      barClass: "from-[rgba(251,191,36,.55)] to-[rgba(251,191,36,.25)]",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, value, sub, icon: Icon, iconClass, progress, progressLabel, barClass }) => (
        <section key={key} className="card glossy-fix p-6 sm:p-5">
          {/* header */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">{label}</p>
            <div className={`${glassIconWrap}`}>
              <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
            </div>
          </div>

          {/* value */}
          <div className="mt-2">
            <p className={`text-[28px] leading-8 font-semibold ${valueGradient}`}>{value}</p>
            <p className="mt-1 text-xs text-white/60">{sub}</p>
          </div>

          {/* progress */}
          <div className="mt-3">
            <div
              className="h-2 w-full rounded-full bg-white/8 border border-white/10 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label={`${label} progress`}
              title={progressLabel}
            >
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barClass} transition-[width] duration-500`}
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-white/55">
              <span>{label === "Total Insiden" ? "Cakupan filter" : "Progress"}</span>
              <span className="tabular-nums">{progressLabel}</span>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default StatCards;
