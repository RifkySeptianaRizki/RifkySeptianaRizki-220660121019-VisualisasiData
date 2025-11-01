// FILE: src/components/BackgroundGrid.tsx
const BackgroundGrid: React.FC = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 select-none"
    >
      {/* 1) gradasi dasar lembut (atas/bawah) */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(138,180,255,0.08),transparent_60%),radial-gradient(120%_80%_at_50%_110%,rgba(255,140,200,0.06),transparent_60%)]" />

      {/* 2) grid modern dengan minor+major line */}
      <div className="absolute inset-0 bg-grid-modern opacity-[0.42]" />

      {/* 3) tekstur halus (tanpa berat) */}
      <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-soft-light" />

      {/* 4) aurora glow lembut (tanpa animasi) */}
      <div className="absolute -top-32 right-[-10%] h-[42vmax] w-[42vmax] rounded-full bg-[radial-gradient(closest-side,rgba(138,180,255,0.22),transparent_72%)] blur-[60px]" />
      <div className="absolute -bottom-24 left-[-10%] h-[36vmax] w-[36vmax] rounded-full bg-[radial-gradient(closest-side,rgba(255,180,220,0.16),transparent_72%)] blur-[70px]" />

      {/* 5) vignette halus biar UI pop-out */}
      <div className="absolute inset-0 bg-[radial-gradient(75%_55%_at_50%_45%,transparent_55%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
};

export default BackgroundGrid;
