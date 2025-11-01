// FILE: src/components/table/DataTable.tsx
import { useEffect, useMemo, useState } from "react";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import type { Row } from "../../lib/types";
import { fmtInt } from "../../lib/number";

type Props = { rows: Row[]; initialPageSize?: number };

type ColumnKey =
  | "tanggal_insiden"
  | "kategori_besar"
  | "jenis_insiden"
  | "sektor_pendidikan"
  | "provinsi"
  | "tingkat_keparahan"
  | "status_kasus"
  | "waktu_respon_jam"
  | "hari_penyelesaian";

/* ------------------------------------------------------------------ */
/*  Konfigurasi kolom + lebar fixed dengan <colgroup> (stabil & scroll) */
/* ------------------------------------------------------------------ */
const COL_WIDTHS = [
  "w-[110px]", // tanggal
  "w-[132px]", // kategori
  "min-w-[230px] xl:min-w-[300px]", // jenis insiden
  "w-[168px]", // sektor
  "w-[148px]", // provinsi
  "w-[92px]", // severity
  "w-[168px]", // status
  "w-[118px]", // respon
  "w-[128px]", // selesai
];

const columns: {
  key: ColumnKey;
  label: string;
  align?: "left" | "right" | "center";
}[] = [
  { key: "tanggal_insiden", label: "Tanggal" },
  { key: "kategori_besar", label: "Kategori" },
  { key: "jenis_insiden", label: "Jenis Insiden" },
  { key: "sektor_pendidikan", label: "Sektor" },
  { key: "provinsi", label: "Provinsi" },
  { key: "tingkat_keparahan", label: "Severity", align: "center" },
  { key: "status_kasus", label: "Status" },
  { key: "waktu_respon_jam", label: "Respon (jam)", align: "right" },
  { key: "hari_penyelesaian", label: "Selesai (hari)", align: "right" },
];

/* ---------- helpers visual ---------- */
const toDateYMD = (v: unknown) => {
  const t = v ? new Date(String(v)).getTime() : NaN;
  if (!Number.isFinite(t)) return "—";
  const d = new Date(t);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const sevBadge = (n?: number) => {
  if (!Number.isFinite(n as number)) return "bg-white/12 text-white/85";
  if ((n as number) >= 5)
    return "bg-pink-500/20 text-pink-100 ring-1 ring-pink-300/20";
  if ((n as number) >= 4)
    return "bg-fuchsia-500/20 text-fuchsia-100 ring-1 ring-fuchsia-300/20";
  if ((n as number) >= 3)
    return "bg-amber-400/20 text-amber-50 ring-1 ring-amber-300/20";
  return "bg-sky-400/20 text-sky-50 ring-1 ring-sky-300/20";
};

/* warna kategori: bedakan tegas Non-seksual vs (Kekerasan) seksual */
const catBadge = (cat?: string) => {
  const v = (cat ?? "").toLowerCase().trim();
  if (v === "non-seksual" || v === "non seksual" || v.startsWith("non"))
    return "bg-sky-500/20 text-sky-100 ring-1 ring-sky-300/25";
  if (v.includes("seksual"))
    return "bg-rose-500/20 text-rose-100 ring-1 ring-rose-300/25";
  return "bg-white/14 text-white/85 ring-1 ring-white/10";
};

const statusBadge = (s?: string) => {
  const v = (s ?? "").toLowerCase();
  if (v.includes("selesai"))
    return "bg-emerald-500/18 text-emerald-100 ring-1 ring-emerald-300/20";
  if (v.includes("proses hukum"))
    return "bg-violet-500/18 text-violet-100 ring-1 ring-violet-300/20";
  if (v.includes("dirujuk"))
    return "bg-sky-500/18 text-sky-100 ring-1 ring-sky-300/20";
  if (v.includes("laporan awal"))
    return "bg-slate-400/20 text-slate-100 ring-1 ring-slate-300/20";
  if (v.includes("tindak lanjut") || v.includes("proses internal"))
    return "bg-amber-400/18 text-amber-50 ring-1 ring-amber-300/20";
  if (v.includes("ditutup"))
    return "bg-white/12 text-white/80 ring-1 ring-white/10";
  return "bg-white/14 text-white/85 ring-1 ring-white/10";
};

const numberOrDash = (v: unknown, suffix = "") =>
  Number.isFinite(Number(v)) ? `${Number(v)}${suffix}` : "—";

/* ---------- component ---------- */
const DataTable: React.FC<Props> = ({ rows, initialPageSize = 10 }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<ColumnKey>("tanggal_insiden");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [dense, setDense] = useState(false);

  // reset pagination bila input berubah
  useEffect(() => setPage(1), [rows, pageSize, sortKey, sortDir]);

  const sorted = useMemo(() => {
    const list = [...(rows ?? [])];
    const get = (r: Row) => {
      const v = (r as any)?.[sortKey];
      if (sortKey === "tanggal_insiden") return new Date(v ?? 0).getTime();
      return typeof v === "string" ? v.toLowerCase() : v;
    };
    list.sort((a, b) => {
      const va = get(a),
        vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const start = (page - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  const toggleSort = (key: ColumnKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "tanggal_insiden" ? "desc" : "asc");
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Tanggal",
      "Kategori",
      "Jenis Insiden",
      "Sektor",
      "Provinsi",
      "Severity",
      "Status",
      "Respon (jam)",
      "Selesai (hari)",
    ];
    const lines = (rows ?? []).map((r) => {
      const vals = [
        toDateYMD((r as any).tanggal_insiden),
        (r as any).kategori_besar ?? "",
        (r as any).jenis_insiden ?? (r as any).id_insiden ?? "",
        (r as any).sektor_pendidikan ?? "",
        (r as any).provinsi ?? "",
        (r as any).tingkat_keparahan ?? "",
        (r as any).status_kasus ?? "",
        (r as any).waktu_respon_jam ?? "",
        (r as any).hari_penyelesaian ?? "",
      ];
      return vals
        .map((v) =>
          String(v).includes(",") || String(v).includes('"')
            ? `"${String(v).replace(/"/g, '""')}"`
            : String(v)
        )
        .join(",");
    });
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset-terfilter.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <GlassCard className="space-y-4 p-4 sm:p-5">
      {/* Header & toolbar */}
      <header className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        {/* glare line */}
        <span className="pointer-events-none absolute inset-x-0 -top-2 h-px bg-white/20 [mask-image:linear-gradient(to_right,transparent,white,transparent)]" />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Tabel
          </p>
          <h3 className="text-lg font-semibold text-white">Detail insiden</h3>
          <p className="mt-0.5 text-xs text-white/50">
            Menampilkan {fmtInt(sorted.length)} baris • Halaman {page}/
            {fmtInt(totalPages)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="hidden sm:flex items-center gap-2 text-xs text-white/70">
            Baris/hal
            <select
              className="input !py-1 !px-2"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            className={`chip ${dense ? "chip-active" : ""}`}
            onClick={() => setDense((d) => !d)}
            title="Kepadatan baris"
          >
            {dense ? "Compact" : "Normal"}
          </button>
          <button
            className="btn rounded-full whitespace-nowrap"
            onClick={downloadCSV}
            title="Unduh CSV (data terfilter)"
          >
            <Download className="h-4 w-4" />
            <span className="ml-1">Export CSV</span>
          </button>
        </div>
      </header>

      {/* Tabel */}
      <div className="relative overflow-auto rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_28px_rgba(0,0,0,.35)]">
        {/* soft vignette edges */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl [background:radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,.04),transparent_55%)]" />
        <table
          className={`min-w-full text-sm relative z-[1] ${
            dense ? "[&_*]:!py-1.5" : ""
          }`}
        >
          {/* width kolom stabil & bisa scroll */}
          <colgroup>
            {COL_WIDTHS.map((c, i) => (
              <col key={i} className={c} />
            ))}
          </colgroup>

          <thead>
            <tr className="sticky top-0 z-10 bg-white/[0.06] backdrop-blur-md border-b border-white/10 shadow-[0_6px_14px_rgba(0,0,0,.22)]">
              {columns.map((c) => {
                const active = c.key === sortKey;
                const align =
                  c.align === "right"
                    ? "text-right"
                    : c.align === "center"
                    ? "text-center"
                    : "text-left";
                return (
                  <th
                    key={c.key}
                    role="columnheader"
                    aria-sort={
                      active
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={[
                      "px-3 py-2 font-semibold text-white/85 select-none whitespace-nowrap",
                      align,
                      "cursor-pointer transition-colors hover:text-white",
                    ].join(" ")}
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {active ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-white/60"
                >
                  Tidak ada data untuk ditampilkan.
                </td>
              </tr>
            ) : (
              visible.map((r, i) => {
                const jenis =
                  (r as any).jenis_insiden ?? (r as any).id_insiden ?? "—";
                const tgl = toDateYMD((r as any).tanggal_insiden);
                const kat = (r as any).kategori_besar ?? "—";
                const sev = (r as any).tingkat_keparahan as number | undefined;
                const status = (r as any).status_kasus;

                const zebra =
                  i % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.035]";

                return (
                  <tr
                    key={(r as any).id_insiden ?? `${tgl}-${i}`}
                    className={[
                      zebra,
                      "border-t border-white/5 transition-colors hover:bg-white/[0.065] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.12)]",
                    ].join(" ")}
                  >
                    <td className="px-3 py-2 text-white/85 whitespace-nowrap">
                      {tgl}
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${catBadge(
                          kat
                        )}`}
                      >
                        {kat}
                      </span>
                    </td>

                    {/* Jenis insiden: satu baris, truncate, tooltip untuk full text */}
                    <td
                      className="px-3 py-2 pb-3 text-white/90 whitespace-nowrap truncate"
                      title={jenis}
                    >
                      {jenis}
                    </td>

                    <td className="px-3 py-2 text-white/85 whitespace-nowrap">
                      {(r as any).sektor_pendidikan ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-white/85 whitespace-nowrap">
                      {(r as any).provinsi ?? "—"}
                    </td>

                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full tabular-nums ${sevBadge(
                          sev
                        )}`}
                        title="Tingkat keparahan 1–5"
                      >
                        {Number.isFinite(Number(sev)) ? sev : "—"}
                      </span>
                    </td>

                    {/* Status: satu baris, tanpa bungkus */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${statusBadge(
                          status
                        )}`}
                        title={String(status ?? "")}
                      >
                        {status ?? "—"}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-right text-white/85 whitespace-nowrap">
                      {numberOrDash((r as any).waktu_respon_jam)}
                    </td>
                    <td className="px-3 py-2 text-right text-white/85 whitespace-nowrap">
                      {numberOrDash((r as any).hari_penyelesaian)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-white/75">
        <div>
          Menampilkan{" "}
          <b>
            {fmtInt(start + 1)}–
            {fmtInt(Math.min(start + pageSize, sorted.length))}
          </b>{" "}
          dari <b>{fmtInt(sorted.length)}</b> baris
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage(1)}
          >
            « Awal
          </button>
          <button
            className="btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Prev
          </button>
          <span className="pill bg-white/7 border border-white/12">
            Hal {page} / {fmtInt(totalPages)}
          </span>
          <button
            className="btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next ›
          </button>
          <button
            className="btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            Akhir »
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

export default DataTable;

/* ===== wrapper kaca supaya konsisten ===== */
const GlassCard = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={[
      "relative rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur",
      "shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_24px_rgba(0,0,0,.25)]",
      "transition-shadow duration-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_14px_40px_rgba(0,0,0,.35)]",
      "isolate overflow-hidden",
      className,
    ].join(" ")}
  >
    <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/25 [mask-image:linear-gradient(to_right,transparent,white,transparent)]" />
    <span className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,.05),transparent_55%)]" />
    <div className="relative z-[1]">{children}</div>
  </section>
);
