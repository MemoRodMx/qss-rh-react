import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { dashboardService } from "../services/dashboardService";
import type { DashboardStats } from "@/lib/types";

async function loadStats(): Promise<DashboardStats> {
  return dashboardService.getStats();
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loadStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        if (!cancelled) {
          const message =
            "No se pudieron cargar las estadísticas del dashboard";
          setError(message);
          toast.error("Error", { description: message });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const hasData =
    stats !== null &&
    (stats.total_employees > 0 ||
      stats.active_employees > 0 ||
      stats.on_leave > 0 ||
      stats.new_hires_this_month > 0 ||
      stats.attendance_rate > 0 ||
      stats.pending_requests > 0);

  return { stats, isLoading, error, hasData, refresh };
}
