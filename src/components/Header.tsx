// FILE: src/components/Header.tsx
import { BarChart3, Filter, Sparkles } from "lucide-react";
import { fmtInt } from "../lib/number";

type HeaderProps = {
  onOpenFilters: () => void;
  totalVisible: number;
  appliedFilters: number;
  logoSrc?: string;
};

const Header: React.FC<HeaderProps> = ({
  onOpenFilters,
  totalVisible,
  appliedFilters,
  logoSrc,
}) => {
  return (
    <header className="sticky top-3 mb-5 z-50 px-2 sm:px-4 lg:px-6 bg-transparent">
      <div className="mx-auto max-w-6xl">
        <div
          className={[
            "relative rounded-full glass-panel glossy",
            "border border-white/15 ring-1 ring-white/10",
            "backdrop-blur-xl bg-white/7 shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
            "px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8",
          ].join(" ")}
        >
          {/* glare tipis */}
          <div className="pointer-events-none absolute inset-0 rounded-full [mask-image:linear-gradient(to_bottom,white,transparent_50%)]">
            <div className="absolute inset-x-6 top-0 h-px bg-white/25" />
          </div>

          {/* selalu baris bahkan di mobile → tombol tetap di kanan */}
          <div className="flex items-center justify-between gap-2">
            {/* kiri: logo + judul */}
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 sm:h-10 sm:w-10 overflow-hidden">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="h-10 w-10 sm:h-10 sm:w-10 object-contain drop-shadow"
                  />
                ) : (
                  // fallback kalau logoSrc belum dikirim
                  <div className="h-3 w-3 rounded-full bg-[color:var(--primary)] shadow-[0_0_18px_rgba(138,180,255,.85)]" />
                )}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-[15px] sm:text-lg font-semibold text-gradient sm:text-xl">
                  Dashboard Kekerasan Perguruan Tinggi
                </h1>
              </div>
            </div>

            {/* kanan: metrik & tombol filter */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* metrik disembunyikan di mobile */}
              <span
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/80 border border-white/15"
                title="Jumlah baris terlihat saat ini"
                aria-label={`Total terlihat: ${fmtInt(totalVisible)}`}
              >
                <Sparkles className="h-4 w-4 opacity-80" />
                <span className="tabular-nums">{fmtInt(totalVisible)}</span>
                <span className="opacity-60">terlihat</span>
              </span>

              {/* tombol Filter: label SELALU tampil, lebih kecil di mobile */}
              <button
                type="button"
                onClick={onOpenFilters}
                aria-label="Buka filter"
                title="Buka filter"
                className="btn rounded-full whitespace-nowrap px-2.5 py-1.5 sm:px-3"
              >
                <Filter className="h-4 w-4" />
                <span className="ml-1 text-[12px] sm:text-[13px]">Filter</span>

                {appliedFilters > 0 && (
                  <span
                    className={[
                      "pill ml-1.5 sm:ml-2",
                      "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/15",
                      "text-[10px] sm:text-[11px] text-[color:var(--primary)]",
                    ].join(" ")}
                    aria-label={`${appliedFilters} filter aktif`}
                  >
                    {appliedFilters}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
