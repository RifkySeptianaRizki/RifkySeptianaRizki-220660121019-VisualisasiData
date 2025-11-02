/* eslint-disable react/jsx-no-duplicate-props */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { Filters, Row } from "../lib/types";
import { fmtInt } from "../lib/number";
import { unique } from "../lib/data";

/* -------------------- helpers -------------------- */
const sanitize = (arr: (string | null | undefined)[]) =>
  unique(arr.map((s) => (s ?? "").toString().trim()).filter(Boolean));

const norm = (s = "") =>
  s
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const contains = (hay: string, needle: string) =>
  norm(hay).includes(norm(needle));
const isAllSelected = <T,>(cur: readonly T[], all: readonly T[]) =>
  all.length > 0 && cur.length === all.length;

/* -------------------- tiny UI atoms (util-only) -------------------- */
const pillCls =
  "inline-flex items-center rounded-xl border border-white/12 " +
  "bg-white/7 px-3 py-1.5 text-[12px] leading-none text-white/80";

const chipBase =
  "inline-flex items-center whitespace-nowrap rounded-xl border px-3 py-1.5 " +
  "text-[12px] leading-none outline-none transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-white/25 " +
  "appearance-none select-none";
const chipIdle = "border-white/12 bg-white/7 text-white/80 hover:bg-white/10";
const chipActive = "border-white/20 bg-white/20 text-white";
const Chip: React.FC<{
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}> = ({ active, children, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    role="switch"
    aria-checked={!!active}
    className={`${chipBase} ${active ? chipActive : chipIdle}`}
  >
    {children}
  </button>
);

const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = "",
  ...props
}) => (
  <button
    type="button"
    {...props}
    className={
      "rounded-xl border border-transparent px-2.5 py-1.5 text-xs " +
      "text-white/70 hover:text-white hover:bg-white/10 hover:border-white/10 " +
      "transition-colors " +
      className
    }
  />
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = "",
  ...props
}) => (
  <input
    {...props}
    className={
      "h-10 w-full rounded-xl border border-white/10 bg-white/5 " +
      "px-3 text-[14px] text-white placeholder-white/40 outline-none " +
      "focus:border-white/20 focus:ring-2 focus:ring-white/20 " +
      "appearance-none " +
      className
    }
  />
);

/* -------------------- generic section shells -------------------- */
const Pill: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <span className={`${pillCls} ${className}`}>{children}</span>;

const SectionShell: React.FC<{
  title: string;
  open: boolean;
  onToggle: (open: boolean) => void;
  countLabel?: string;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  children: React.ReactNode;
}> = ({
  title,
  open,
  onToggle,
  countLabel,
  toolbarLeft,
  toolbarRight,
  children,
}) => (
  <details
    open={open}
    onToggle={(e) => onToggle((e.currentTarget as HTMLDetailsElement).open)}
    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
  >
    <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 font-semibold text-white hover:bg-white/5">
      <span>{title}</span>
      <div className="flex items-center gap-2">
        {countLabel ? <Pill>{countLabel}</Pill> : null}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </div>
    </summary>

    {(toolbarLeft || toolbarRight) && (
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/60">
        <div className="min-w-0">{toolbarLeft}</div>
        <div className="flex items-center gap-2">{toolbarRight}</div>
      </div>
    )}

    <div
      className={`${
        toolbarLeft || toolbarRight ? "" : "border-t border-white/10"
      } px-4 py-4`}
    >
      {children}
    </div>
  </details>
);

/* opsi string dengan search + chip list + tinggi terkendali */
const OptionSection: React.FC<{
  title: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  open: boolean;
  onToggleOpen: (o: boolean) => void;
  countLabel?: string;
  placeholder?: string;
  maxHeight?: number;
}> = ({
  title,
  options,
  selected,
  onToggle,
  onSelectAll,
  onClear,
  open,
  onToggleOpen,
  countLabel,
  placeholder = "Cari opsi…",
  maxHeight = 168,
}) => {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => (q ? options.filter((o) => contains(o, q)) : options),
    [q, options]
  );
  const allSel = isAllSelected(selected, options);

  return (
    <SectionShell
      title={title}
      open={open}
      onToggle={onToggleOpen}
      countLabel={countLabel ?? `${selected.length}/${options.length}`}
      toolbarLeft={
        <span className="text-xs">Kelola {fmtInt(options.length)} opsi.</span>
      }
      toolbarRight={
        <>
          <GhostButton onClick={onSelectAll} disabled={allSel}>
            Pilih semua
          </GhostButton>
          <GhostButton onClick={onClear} disabled={selected.length === 0}>
            Bersihkan
          </GhostButton>
        </>
      }
    >
      <div className="space-y-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <TextInput
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={`Cari ${title}`}
            className="pl-9 pr-3"
          />
        </label>

        <div
          className="flex flex-wrap gap-2 pr-1"
          style={{ maxHeight, overflow: "auto" }}
        >
          {filtered.length === 0 ? (
            <span className="text-sm text-white/55">Tidak ada hasil…</span>
          ) : (
            filtered.map((opt) => {
              const active = selected.includes(opt);
              return (
                <Chip
                  key={opt}
                  active={active}
                  onClick={() => onToggle(opt)}
                  title={opt}
                >
                  {opt}
                </Chip>
              );
            })
          )}
        </div>
      </div>
    </SectionShell>
  );
};

const RangeSection: React.FC<{
  title: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onMin: (v: number) => void;
  onMax: (v: number) => void;
  onReset: () => void;
  open: boolean;
  onToggleOpen: (o: boolean) => void;
}> = ({
  title,
  min,
  max,
  valueMin,
  valueMax,
  onMin,
  onMax,
  onReset,
  open,
  onToggleOpen,
}) => (
  <SectionShell
    title={title}
    open={open}
    onToggle={onToggleOpen}
    countLabel={`${valueMin}-${valueMax}`}
    toolbarRight={
      <GhostButton
        onClick={onReset}
        disabled={valueMin === min && valueMax === max}
      >
        Reset
      </GhostButton>
    }
  >
    <div className="space-y-4">
      <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/55">
        Minimum
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={valueMin}
          onChange={(e) => onMin(Math.min(Number(e.target.value), valueMax))}
          className="w-full appearance-none accent-white/80"
          aria-label="Severity minimum"
        />
        <Pill className="w-min text-white">{valueMin}</Pill>
      </label>

      <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-white/55">
        Maksimum
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={valueMax}
          onChange={(e) => onMax(Math.max(Number(e.target.value), valueMin))}
          className="w-full appearance-none accent-white/80"
          aria-label="Severity maksimum"
        />
        <Pill className="w-min text-white">{valueMax}</Pill>
      </label>
    </div>
  </SectionShell>
);

/* -------------------- main -------------------- */
type Props = {
  raw: Row[];
  filters: Filters;
  setFilters: (partial: Partial<Filters>) => void;
  variant?: "sidebar" | "panel";
};

const FilterPanel: React.FC<Props> = ({
  raw,
  filters,
  setFilters,
  variant = "sidebar",
}) => {
  const safeRows = raw ?? [];

  /* opsi unik ter-sanitasi & terurut */
  const sektorOptions = useMemo(
    () =>
      sanitize(safeRows.map((r) => r.sektor_pendidikan)).sort((a, b) =>
        a.localeCompare(b, "id-ID", { sensitivity: "base" })
      ),
    [safeRows]
  );

  const provinsiOptions = useMemo(
    () =>
      sanitize(safeRows.map((r) => r.provinsi)).sort((a, b) =>
        a.localeCompare(b, "id-ID", { sensitivity: "base" })
      ),
    [safeRows]
  );

  const statusOptions = useMemo(
    () =>
      sanitize(safeRows.map((r) => r.status_kasus)).sort((a, b) =>
        a.localeCompare(b, "id-ID", { sensitivity: "base" })
      ),
    [safeRows]
  );

  const tahunOptions = useMemo(() => {
    const list = safeRows
      .map((r) => r.tahun)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    return Array.from(new Set(list)).sort((a, b) => a - b);
  }, [safeRows]);

  const kategoriSegments = ["Kekerasan seksual", "Non-seksual"] as const;

  /* buka/tutup default */
  const [open, setOpen] = useState({
    sektor: variant === "sidebar",
    provinsi: variant === "sidebar",
    tahun: variant === "sidebar",
    kategori: true,
    status: variant === "sidebar",
    severity: true,
    search: true,
  });

  useEffect(() => {
    const all = variant === "sidebar";
    setOpen({
      sektor: all,
      provinsi: all,
      tahun: all,
      kategori: true,
      status: all,
      severity: true,
      search: true,
    });
  }, [variant]);

  /* search debounced */
  const [searchTerm, setSearchTerm] = useState(filters.search);
  useEffect(() => setSearchTerm(filters.search), [filters.search]);
  useEffect(() => {
    const t = setTimeout(() => {
      const v = (searchTerm || "").trim();
      if (filters.search !== v) setFilters({ search: v });
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm, filters.search, setFilters]);

  /* toggle handlers */
  const toggleStringFilter = useCallback(
    (key: "sektor" | "provinsi" | "kategori" | "status", value: string) => {
      const cur = filters[key] ?? [];
      const next = cur.includes(value)
        ? cur.filter((x) => x !== value)
        : [...cur, value];
      setFilters({ [key]: next } as Partial<Filters>);
    },
    [filters, setFilters]
  );

  const toggleYear = useCallback(
    (year: number) => {
      const cur = filters.tahun ?? [];
      const next = cur.includes(year)
        ? cur.filter((y) => y !== year)
        : [...cur, year];
      setFilters({ tahun: next });
    },
    [filters.tahun, setFilters]
  );

  /* chips aktif */
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    (filters.sektor || []).forEach((v) =>
      chips.push({
        key: `sektor-${v}`,
        label: `Sektor: ${v}`,
        onRemove: () =>
          setFilters({ sektor: filters.sektor.filter((x) => x !== v) }),
      })
    );
    (filters.provinsi || []).forEach((v) =>
      chips.push({
        key: `prov-${v}`,
        label: `Provinsi: ${v}`,
        onRemove: () =>
          setFilters({ provinsi: filters.provinsi.filter((x) => x !== v) }),
      })
    );
    (filters.tahun || []).forEach((v) =>
      chips.push({
        key: `tahun-${v}`,
        label: `Tahun: ${v}`,
        onRemove: () =>
          setFilters({ tahun: filters.tahun.filter((x) => x !== v) }),
      })
    );
    (filters.kategori || []).forEach((v) =>
      chips.push({
        key: `kat-${v}`,
        label: v,
        onRemove: () =>
          setFilters({ kategori: filters.kategori.filter((x) => x !== v) }),
      })
    );
    (filters.status || []).forEach((v) =>
      chips.push({
        key: `status-${v}`,
        label: `Status: ${v}`,
        onRemove: () =>
          setFilters({ status: filters.status.filter((x) => x !== v) }),
      })
    );
    if ((filters.severityMin ?? 1) > 1 || (filters.severityMax ?? 5) < 5) {
      chips.push({
        key: "sev",
        label: `Severity ${filters.severityMin}-${filters.severityMax}`,
        onRemove: () => setFilters({ severityMin: 1, severityMax: 5 }),
      });
    }
    if ((filters.search || "").trim()) {
      chips.push({
        key: "q",
        label: `Cari: ${filters.search}`,
        onRemove: () => {
          setFilters({ search: "" });
          setSearchTerm("");
        },
      });
    }
    return chips;
  }, [filters, setFilters]);

  const setAllSections = (opened: boolean) =>
    setOpen({
      sektor: opened,
      provinsi: opened,
      tahun: opened,
      kategori: true,
      status: opened,
      severity: true,
      search: true,
    });

  /* -------------- render -------------- */
  return (
    <div className={variant === "panel" ? "space-y-6 pb-8" : "space-y-6"}>
      {/* Top controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-white/45">
            Filter aktif
          </span>
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => setAllSections(true)}>
              Buka semua
            </GhostButton>
            <GhostButton onClick={() => setAllSections(false)}>
              Tutup semua
            </GhostButton>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeChips.length === 0 ? (
            <span className={`${chipBase} ${chipIdle}`}>
              Tidak ada filter aktif
            </span>
          ) : (
            activeChips.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`${chipBase} ${chipActive} flex items-center`}
                onClick={c.onRemove}
                aria-label={`Hapus ${c.label}`}
              >
                {c.label}
                <X className="ml-1.5 h-3.5 w-3.5" />
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/45">
        <span>{fmtInt(safeRows.length)} entri mentah.</span>
        <GhostButton
          onClick={() =>
            setFilters({
              sektor: [],
              provinsi: [],
              tahun: [],
              kategori: [],
              status: [],
              severityMin: 1,
              severityMax: 5,
              search: "",
            })
          }
        >
          Reset filter
        </GhostButton>
      </div>

      <div className="space-y-4">
        {/* Sektor */}
        <OptionSection
          title="Sektor Pendidikan"
          options={sektorOptions}
          selected={filters.sektor}
          onToggle={(v) => toggleStringFilter("sektor", v)}
          onSelectAll={() => setFilters({ sektor: sektorOptions })}
          onClear={() => setFilters({ sektor: [] })}
          open={open.sektor}
          onToggleOpen={(o) => setOpen((p) => ({ ...p, sektor: o }))}
          placeholder="Cari sektor…"
          maxHeight={148}
        />

        {/* Provinsi */}
        <OptionSection
          title="Provinsi"
          options={provinsiOptions}
          selected={filters.provinsi}
          onToggle={(v) => toggleStringFilter("provinsi", v)}
          onSelectAll={() => setFilters({ provinsi: provinsiOptions })}
          onClear={() => setFilters({ provinsi: [] })}
          open={open.provinsi}
          onToggleOpen={(o) => setOpen((p) => ({ ...p, provinsi: o }))}
          placeholder="Cari provinsi…"
          maxHeight={176}
        />

        {/* Tahun */}
        <OptionSection
          title="Tahun"
          options={tahunOptions.map(String)}
          selected={filters.tahun.map(String)}
          onToggle={(v) => toggleYear(Number(v))}
          onSelectAll={() => setFilters({ tahun: tahunOptions })}
          onClear={() => setFilters({ tahun: [] })}
          open={open.tahun}
          onToggleOpen={(o) => setOpen((p) => ({ ...p, tahun: o }))}
          placeholder="Cari tahun…"
          maxHeight={120}
        />

        {/* Kategori (segmented) */}
        <SectionShell
          title="Kategori"
          open={open.kategori}
          onToggle={(o) => setOpen((p) => ({ ...p, kategori: o }))}
          countLabel={`${filters.kategori.length}/2`}
          toolbarRight={
            <GhostButton
              onClick={() => setFilters({ kategori: [] })}
              disabled={filters.kategori.length === 0}
            >
              Bersihkan
            </GhostButton>
          }
        >
          <div className="flex flex-wrap gap-2">
            {(["Kekerasan seksual", "Non-seksual"] as const).map((seg) => (
              <Chip
                key={seg}
                active={filters.kategori.includes(seg)}
                onClick={() => toggleStringFilter("kategori", seg)}
                title={seg}
              >
                {seg}
              </Chip>
            ))}
          </div>
        </SectionShell>

        {/* Status */}
        <OptionSection
          title="Status Kasus"
          options={statusOptions}
          selected={filters.status}
          onToggle={(v) => toggleStringFilter("status", v)}
          onSelectAll={() => setFilters({ status: statusOptions })}
          onClear={() => setFilters({ status: [] })}
          open={open.status}
          onToggleOpen={(o) => setOpen((p) => ({ ...p, status: o }))}
          placeholder="Cari status…"
          maxHeight={148}
        />

        {/* Severity */}
        <RangeSection
          title="Severity (1–5)"
          min={1}
          max={5}
          valueMin={filters.severityMin}
          valueMax={filters.severityMax}
          onMin={(v) => setFilters({ severityMin: v })}
          onMax={(v) => setFilters({ severityMax: v })}
          onReset={() => setFilters({ severityMin: 1, severityMax: 5 })}
          open={open.severity}
          onToggleOpen={(o) => setOpen((p) => ({ ...p, severity: o }))}
        />

        {/* Search */}
        <SectionShell
          title="Cari"
          open={open.search}
          onToggle={(o) => setOpen((p) => ({ ...p, search: o }))}
        >
          <div className="space-y-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <TextInput
                type="search"
                placeholder="Cari jenis insiden, peran pelaku, atau lokasi…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Cari insiden"
                className="pl-9 pr-10"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-1.5 hover:bg-white/10"
                  onClick={() => setSearchTerm("")}
                  aria-label="Hapus pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <p className="text-xs text-white/45">
              Pencarian menyasar jenis insiden, peran pelaku, dan lokasi dengan
              pencocokan sebagian.
            </p>
          </div>
        </SectionShell>
      </div>
    </div>
  );
};

export default FilterPanel;
