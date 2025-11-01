// FILE: src/components/StatCards.tsx
import { AlertTriangle, CheckCircle2, Clock3, ShieldHalf } from "lucide-react";
import { avg, fmtInt, fmtPct } from "../lib/number";
import type { Row } from "../lib/types";

type StatCardsProps = {
  rows: Row[];
  rawTotal: number;
};

/* ---------- helpers ---------- */
const clamp01 = (n: number) =>
  Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;

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

const IconWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className={[
      "relative grid h-10 w-10 place-items-center rounded-3xl",
      "border border-white/20 bg-white/10 backdrop-blur",
      "shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_6px_20px_rgba(0,0,0,.25)]",
      "overflow-hidden",
    ].join(" ")}
    aria-hidden="true"
  >
    {/* glare ring */}
    <span className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/25" />
    {/* soft inner gradient */}
    <span className="pointer-events-none absolute inset-0 rounded-3xl [background:radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,.12),transparent_55%)]" />
    <span className="relative z-[1]">{children}</span>
  </span>
);

const valueGradient =
  "bg-[linear-gradient(180deg,rgba(255,255,255,.98),rgba(255,255,255,.72))] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(138,180,255,.15)]";

const Track: React.FC<{
  progress: number;
  className?: string;
  label: string;
}> = ({ progress, className = "", label }) => {
  const pct = Math.round(clamp01(progress) * 100);
  return (
    <div className="mt-3">
      <div
        className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/8"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${label} progress`}
        title={`${pct}%`}
      >
        <div
          className={[
            "h-full rounded-full transition-[width] duration-500",
            "bg-gradient-to-r",
            className,
            // inner glow
            "shadow-[0_0_0_1px_rgba(255,255,255,.06),inset_0_1px_2px_rgba(255,255,255,.25)]",
          ].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-white/55">
        <span>{label === "Total Insiden" ? "Cakupan filter" : "Progress"}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
    </div>
  );
};

/* ---------- component ---------- */
const StatCards: React.FC<StatCardsProps> = ({ rows, rawTotal }) => {
  const total = rows.length;
  const completed = rows.filter(
    (r) => norm(r.status_kasus) === "selesai"
  ).length;
  const sexual = rows.filter((r) => isSexual(r.kategori_besar)).length;
  const avgResponse = avg(rows.map((r) => r.waktu_respon_jam));

  const completionPct = clamp01(total ? completed / total : 0);
  const sexualPct = clamp01(total ? sexual / total : 0);
  const coveragePct = clamp01(rawTotal ? total / rawTotal : 0);

  const cards = [
    {
      key: "total",
      label: "Total Insiden",
      value: fmtInt(total),
      sub: rawTotal
        ? `Dari ${fmtInt(rawTotal)} entri dataset`
        : "Dataset terfilter",
      icon: ShieldHalf,
      iconClass: "text-[color:var(--primary)]",
      progress: coveragePct,
      barClass: "from-[rgba(138,180,255,.65)] to-[rgba(138,180,255,.28)]",
    },
    {
      key: "done",
      label: "Kasus Selesai",
      value: fmtInt(completed),
      sub: total ? `${fmtPct(completed, total)} selesai` : "Belum ada data",
      icon: CheckCircle2,
      iconClass: "text-emerald-300",
      progress: completionPct,
      barClass: "from-[rgba(16,185,129,.6)] to-[rgba(16,185,129,.28)]",
    },
    {
      key: "sexual",
      label: "Proporsi Kekerasan Seksual",
      value: total ? fmtPct(sexual, total) : "0%",
      sub: total
        ? `${fmtInt(sexual)} insiden berjenis seksual`
        : "Belum ada data",
      icon: AlertTriangle,
      iconClass: "text-rose-300",
      progress: sexualPct,
      barClass: "from-[rgba(255,138,216,.6)] to-[rgba(255,138,216,.28)]",
    },
    {
      key: "response",
      label: "Rata-rata Waktu Respon",
      value:
        avgResponse !== null
          ? `${avgResponse.toFixed(1)} jam`
          : "Tidak tersedia",
      sub: "Berdasarkan entri dengan waktu respon",
      icon: Clock3,
      iconClass: "text-amber-300",
      progress: avgResponse !== null ? clamp01(avgResponse / 48) : 0,
      barClass: "from-[rgba(251,191,36,.6)] to-[rgba(251,191,36,.28)]",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(
        ({
          key,
          label,
          value,
          sub,
          icon: Icon,
          iconClass,
          progress,
          barClass,
        }) => (
          <section
            key={key}
            className={[
              "relative rounded-3xl p-5 sm:p-6",
              "border border-black/20 bg-white/[0.06] backdrop-blur-xl",
              "shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_14px_44px_rgba(0,0,0,.28)]",
              "transition-shadow duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_20px_64px_rgba(0,0,0,.34)]",
              "isolate overflow-hidden",
            ].join(" ")}
          >
            {/* glare & vignette */}
            <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/25 [mask-image:linear-gradient(to_right,transparent,white,transparent)]" />
            <span className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,.06),transparent_55%)]" />

            {/* header */}
            <div className="relative z-[1] flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/52">
                  {label}
                </p>
              </div>
              <IconWrap>
                <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
              </IconWrap>
            </div>

            {/* value */}
            <div className="relative z-[1] mt-2">
              <p
                className={`text-[28px] leading-8 font-semibold ${valueGradient}`}
              >
                {value}
              </p>
              <p className="mt-1 text-xs text-white/60">{sub}</p>
            </div>

            {/* progress */}
            <div className="relative z-[1]">
              <Track
                progress={progress}
                className={`from-0% to-100% ${barClass}`}
                label={label}
              />
            </div>
          </section>
        )
      )}
    </div>
  );
};

export default StatCards;
