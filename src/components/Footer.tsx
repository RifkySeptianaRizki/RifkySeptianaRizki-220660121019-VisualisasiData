// FILE: src/components/Footer.tsx
import React from "react";
import { Github, Mail } from "lucide-react";

type FooterLink = { label: string; href: string };

type FooterProps = {
  totalAll: number;
  totalVisible: number;
  lastUpdated?: string; // YYYY-MM-DD
  logoSrc?: string; // path logo (svg/png)
  brand?: string;
  links?: FooterLink[];
};

/* Tombol ikon util-only, aman di iOS/production (tanpa .btn) */
const IconLink: React.FC<React.ComponentProps<"a">> = ({
  className = "",
  children,
  ...props
}) => (
  <a
    {...props}
    className={[
      "inline-flex h-10 w-10 items-center justify-center rounded-full",
      "border border-white/15 bg-white/10 text-white/80",
      "hover:bg-white/18 hover:text-white",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
      // penting untuk iOS Safari agar tidak 'putih'
      "[appearance:none] [-webkit-appearance:none] bg-clip-padding",
      // jika ada overlay/glare, pastikan di atas
      "relative z-10",
      "transition-colors",
      className,
    ].join(" ")}
    aria-current={undefined}
  >
    {children}
  </a>
);

const Footer: React.FC<FooterProps> = ({
  totalAll,
  totalVisible,
  lastUpdated,
  logoSrc,
  brand = "Grafik Anti-Kekerasan",
  links = [
    {
      label: "Sumber Data",
      href: "https://komnasperempuan.go.id/siaran-pers-detail/siaran-pers-komnas-perempuan-merespons-kasus-kekerasan-seksual-di-perguruan-tinggi",
    },
  ],
}) => {
  return (
    <footer className="px-3 pb-12 pt-3 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <section
          className={[
            "relative rounded-[28px] glass-panel glossy",
            "border border-white/15 ring-1 ring-white/10",
            "bg-white/[0.07] backdrop-blur-xl",
            "shadow-[0_16px_60px_rgba(0,0,0,0.35)]",
            "px-5 py-6 sm:px-8 lg:px-10",
            "transition-shadow duration-300 hover:shadow-[0_22px_80px_rgba(0,0,0,0.45)]",
          ].join(" ")}
          aria-labelledby="footer-brand"
        >
          {/* glare & vignette */}
          <div className="pointer-events-none absolute inset-0 rounded-[28px]">
            <div className="absolute inset-x-8 top-0 h-px bg-white/25 [mask-image:linear-gradient(to_right,transparent,white,transparent)]" />
            <div className="absolute inset-0 rounded-[28px] [background:radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,.06),transparent_55%)]" />
          </div>

          <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Kiri: logo bulat + brand */}
            <div className="flex min-w-0 items-center gap-4">
              <span
                className={[
                  "relative border border-white/20 bg-white/10",
                  "rounded-full overflow-hidden aspect-square",
                  "h-11 w-11 sm:h-12 sm:w-12",
                  "grid place-items-center",
                ].join(" ")}
                aria-hidden="true"
              >
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <span className="h-3 w-3 rounded-full bg-[color:var(--primary)] shadow-[0_0_28px_rgba(138,180,255,.9)]" />
                )}
                <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
                <span className="pointer-events-none absolute -inset-px rounded-full [background:linear-gradient(180deg,rgba(255,255,255,.22),transparent_40%)]" />
              </span>

              <div className="min-w-0">
                <p
                  id="footer-brand"
                  className="text-[10px] uppercase tracking-[0.32em] text-white/85"
                >
                  {brand}
                </p>
                <h2 className="truncate text-base font-semibold text-gradient">
                  Transparan • Informatif • Aksiable
                </h2>
              </div>
            </div>

            {/* Tengah: angka ringkas */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatPill label="Dataset" value={formatInt(totalAll)} />
              <StatPill label="Terlihat" value={formatInt(totalVisible)} />
              <StatPill
                label="Pembaruan"
                value={lastUpdated ?? "—"}
                muted
                className="hidden sm:block"
              />
            </div>

            {/* Kanan: tautan & aksi */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
              <ul className="flex flex-wrap items-center gap-3 text-sm text-primary font-bold">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      className="rounded-lg px-1.5 py-1 outline-none transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-white/30"
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Aksi ikon */}
              <div className="flex items-center gap-2">
                <IconLink
                  href="mailto:rifkiseptianarizki@gmail.com"
                  aria-label="Email"
                  title="Email"
                >
                  <Mail className="h-5 w-5" />
                </IconLink>

                <IconLink
                  href="https://github.com/RifkySeptianaRizki"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </IconLink>
              </div>
            </div>
          </div>

          {/* catatan */}
          <div className="relative z-[1] mt-6 border-t border-white/10 pt-3 text-center text-[11px] text-white/55">
            © {new Date().getFullYear()}{" "}
            <span className="font-medium">Created by </span>
            <span className="font-bold">Rifky Septiana Rizki</span> •
            <span className="mx-1 font-bold">220660121019</span> —
            <span className="mx-1">Open Source (MIT)</span> • Kode sumber{" "}
            <a
              href="https://github.com/RifkySeptianaRizki"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white"
            >
              GitHub
            </a>
            <span className="mt-1 block">
              Support by <span className="font-bold">Resilient Academia</span>
            </span>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;

/* ---------- Sub-komponen ---------- */
const StatPill = ({
  label,
  value,
  muted = false,
  className = "",
}: {
  label: string;
  value: number | string;
  muted?: boolean;
  className?: string;
}) => (
  <div
    className={[
      "relative rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-center",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
      "transition-colors hover:bg-white/[0.10]",
      className,
    ].join(" ")}
  >
    <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/25" />
    <div className="text-[11px] uppercase tracking-widest text-white/55">
      {label}
    </div>
    <div
      className={[
        "tabular-nums",
        muted
          ? "text-sm font-medium text-white/85"
          : "text-xl font-semibold text-white",
      ].join(" ")}
    >
      {value}
    </div>
  </div>
);

/* ---------- util ---------- */
const formatInt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
