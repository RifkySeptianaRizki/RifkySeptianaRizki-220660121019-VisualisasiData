// FILE: src/App.tsx
import BackgroundGrid from "./components/BackgroundGrid";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import SidebarShell from "./components/SidebarShell";
import FilterPanel from "./components/FilterPanel";
import StatCards from "./components/StatCards";
import LineTrend from "./components/charts/LineTrend";
import BarBySector from "./components/charts/BarBySector";
import PieStatus from "./components/charts/PieStatus";
import HistogramSeverity from "./components/charts/HistogramSeverity";
import ScatterResponseResolution from "./components/charts/ScatterResponseResolution";
import MapView from "./components/map/MapView";
import Loading from "./components/Loading";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import DataTable from "./components/table/DataTable";
import { applyFilters, loadData } from "./lib/data";
import { createDefaultFilters, Filters, Row } from "./lib/types";
import myLogo from "../assets/RALogo.png";

const RIGHT_WIDTH = 360;
const RIGHT_GUTTER = 24;

const App: React.FC = () => {
  const [rawRows, setRawRows] = useState<Row[]>([]);
  const [filters, setFilters] = useState<Filters>(() => createDefaultFilters());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    let subscribed = true;
    setLoading(true);
    loadData()
      .then((rows) => {
        if (!subscribed) return;
        setRawRows(rows);
        setError(null);
      })
      .catch((err) => {
        if (!subscribed) return;
        setError(err instanceof Error ? err.message : "Gagal memuat dataset");
        setRawRows([]);
      })
      .finally(() => {
        if (!subscribed) return;
        setLoading(false);
      });
    return () => {
      subscribed = false;
    };
  }, []);

  // kunci scroll saat panel terbuka (efektif utk drawer/mobile)
  useEffect(() => {
    if (panelOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return;
  }, [panelOpen]);

  const mergeFilters = useCallback((partial: Partial<Filters>) => {
    setFilters((prev) => {
      const next: Filters = { ...prev, ...partial };
      next.severityMin = Math.max(1, Math.min(5, next.severityMin));
      next.severityMax = Math.max(1, Math.min(5, next.severityMax));
      if (next.severityMin > next.severityMax) {
        if (partial.severityMin !== undefined) {
          next.severityMax = next.severityMin;
        } else if (partial.severityMax !== undefined) {
          next.severityMin = next.severityMax;
        }
      }
      next.search = next.search ?? "";
      return next;
    });
  }, []);

  const filteredRows = useMemo(
    () => applyFilters(rawRows, filters),
    [rawRows, filters]
  );

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    count += filters.sektor.length;
    count += filters.provinsi.length;
    count += filters.tahun.length;
    count += filters.kategori.length;
    count += filters.status.length;
    if (filters.severityMin > 1 || filters.severityMax < 5) count += 1;
    if (filters.search.trim()) count += 1;
    return count;
  }, [filters]);

  const lastUpdated = useMemo(() => {
    const times = rawRows
      .map((r) => (r as any).tanggal_insiden)
      .filter(Boolean)
      .map((d) => new Date(d).getTime())
      .filter((t) => Number.isFinite(t));
    if (!times.length) return undefined;
    const max = new Date(Math.max(...times));
    const yyyy = max.getFullYear();
    const mm = String(max.getMonth() + 1).padStart(2, "0");
    const dd = String(max.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [rawRows]);

  const desktopRightPadding = panelOpen ? RIGHT_WIDTH + RIGHT_GUTTER : 0;

  return (
    <div className="min-h-screen pb-18 relative">
      <BackgroundGrid />

      <Header
        logoSrc={myLogo}
        onOpenFilters={() => setPanelOpen(true)}
        totalVisible={filteredRows.length}
        appliedFilters={appliedFiltersCount}
      />

      <ErrorBoundary>
        <>
          <div className="px-4 pb-16 pt-6 sm:px-6 lg:px-10">
            <main
              className="space-y-6 transition-[padding] duration-300"
              style={{ paddingRight: desktopRightPadding }}
            >
              {loading ? (
                <Loading />
              ) : (
                <>
                  {error && (
                    <div className="card glossy-fix border border-red-500/30 bg-red-500/10 text-sm text-red-100">
                      <p className="font-semibold">Gagal memuat dataset.</p>
                      <p className="mt-1 text-red-200/80">{error}</p>
                    </div>
                  )}

                  <StatCards rows={filteredRows} rawTotal={rawRows.length} />

                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="xl:col-span-2">
                      <LineTrend rows={filteredRows} />
                    </div>

                    <BarBySector rows={filteredRows} />
                    <PieStatus rows={filteredRows} />
                    <HistogramSeverity rows={filteredRows} />

                    <div className="xl:col-span-1">
                      <ScatterResponseResolution rows={filteredRows} />
                    </div>
                  </div>

                  <MapView rows={filteredRows} />
                  <DataTable rows={filteredRows} initialPageSize={10} />
                </>
              )}
            </main>
          </div>

          {/* Drawer (mobile) */}
          <SidebarShell
            variant="drawer"
            isOpen={panelOpen}
            onClose={() => setPanelOpen(false)}
            title="Filter"
          >
            <FilterPanel
              raw={rawRows}
              filters={filters}
              setFilters={mergeFilters}
              variant="panel"
            />
          </SidebarShell>

          {/* Panel kanan (desktop) */}
          <SidebarShell
            variant="desktop"
            isOpen={panelOpen}
            onClose={() => setPanelOpen(false)}
            width={RIGHT_WIDTH}
          >
            <FilterPanel
              raw={rawRows}
              filters={filters}
              setFilters={mergeFilters}
              variant="sidebar"
            />
          </SidebarShell>

          <Footer
            totalAll={rawRows.length}
            totalVisible={filteredRows.length}
            lastUpdated={lastUpdated}
            logoSrc={myLogo}
          />
        </>
      </ErrorBoundary>
    </div>
  );
};

export default App;
