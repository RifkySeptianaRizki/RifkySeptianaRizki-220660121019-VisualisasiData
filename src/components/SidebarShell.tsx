import { X } from "lucide-react";
import React, { useEffect } from "react";

type SidebarShellProps = {
  /** desktop => panel fix kanan; drawer => slide-in mobile */
  variant: "desktop" | "drawer";
  /** lebar panel (px) */
  width?: number;
  /** buka/tutup */
  isOpen?: boolean;
  /** tutup handler */
  onClose?: () => void;
  /** judul opsional di header (drawer) */
  title?: string;
  children: React.ReactNode;
};

/**
 * Sidebar kanan:
 * - Desktop: fixed di kanan, hidden di <lg>, kaca/glossy, scrollable.
 * - Drawer (mobile): overlay + slide-in dari kanan.
 */
const SidebarShell: React.FC<SidebarShellProps> = ({
  variant,
  width = 360,
  isOpen = true,
  onClose,
  title,
  children,
}) => {
  // ESC untuk menutup saat drawer terbuka
  useEffect(() => {
    if (variant !== "drawer" || !isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, isOpen, onClose]);

  if (variant === "desktop") {
    return (
      <aside
        className={[
          "fixed inset-y-0 right-0 z-50 hidden lg:flex", // z-50
          "transition-transform duration-300 will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        style={{ width }}
        aria-hidden={!isOpen}
      >
        <div
          className={[
            "m-0 flex h-full w-full flex-col",
            "border-l border-white/15",
            "glass-panel glossy bg-white/8 backdrop-blur-xl",
            "shadow-[0_10px_40px_rgba(0,0,0,.35)]",
          ].join(" ")}
        >
          {/* header tipis + tombol close */}
          <div className="relative flex items-center justify-between px-4 py-3">
            <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent_65%)]">
              <div className="absolute inset-x-4 top-0 h-px bg-white/25" />
            </div>
            <h3 className="text-sm font-semibold text-white/85">Filter</h3>
            <button
              className="btn-ghost rounded-xl p-2 hover:bg-white/10"
              onClick={onClose}
              aria-label="Tutup filter"
              title="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* isi scroll */}
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-6 pt-1">
            {children}
          </div>
        </div>
      </aside>
    );
  }

  // DRAWER (mobile & tablet)
  return (
    <div
      className={[
        "lg:hidden fixed inset-0 z-50", // z-50
        isOpen ? "" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      {/* backdrop */}
      <div
        className={[
          "absolute inset-0 bg-black/40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      {/* panel kanan */}
      <div
        className={[
          "absolute inset-y-0 right-0 w-[min(92vw,380px)]",
          "border-l border-white/15 glass-panel glossy bg-white/8 backdrop-blur-xl",
          "shadow-[0_10px_40px_rgba(0,0,0,.40)]",
          "transition-transform duration-300 will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
          "flex flex-col",
        ].join(" ")}
      >
        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent_65%)]">
            <div className="absolute inset-x-4 top-0 h-px bg-white/25" />
          </div>
          <h3 className="text-sm font-semibold text-white/85">
            {title ?? "Filter"}
          </h3>
          <button
            className="btn-ghost rounded-xl p-2 hover:bg-white/10"
            onClick={onClose}
            aria-label="Tutup"
            title="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-6 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarShell;
