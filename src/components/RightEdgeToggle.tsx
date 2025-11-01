// FILE: src/components/RightEdgeToggle.tsx
import { Filter } from "lucide-react";

type Props = {
  open: boolean;
  onOpen: () => void;
};

const RightEdgeToggle: React.FC<Props> = ({ open, onOpen }) => {
  // tampilkan hanya di desktop dan saat panel tertutup
  if (open) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "hidden lg:flex items-center gap-2",
        "fixed right-3 top-1/2 -translate-y-1/2 z-[60]",
        "rounded-l-xl rounded-r-2xl",
        "glass-panel glossy bg-white/10 backdrop-blur-xl",
        "border border-white/20 shadow-[0_8px_28px_rgba(0,0,0,.35)]",
        "px-2.5 py-2 text-xs text-white hover:bg-white/14 transition-colors",
      ].join(" ")}
      aria-label="Buka filter"
      title="Buka filter"
    >
      <Filter className="h-4 w-4" />
      <span className="pr-1">Filter</span>
    </button>
  );
};

export default RightEdgeToggle;
