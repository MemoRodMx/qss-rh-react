import { useState, useEffect, useCallback, useRef } from "react";
import { auditLogService } from "../services/auditLogService";
import type { AuditLog, AuditLogFilters, AuditAction } from "../types";

const DEFAULT_FILTERS: AuditLogFilters = {
  entity: null,
  action: null,
  username: "",
  startDate: null,
  endDate: null,
};

interface UseAuditLogsReturn {
  logs: AuditLog[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  filters: AuditLogFilters;
  setFilterEntity: (value: string | null) => void;
  setFilterAction: (value: AuditAction | null) => void;
  setFilterUsername: (value: string) => void;
  setFilterStartDate: (value: string | null) => void;
  setFilterEndDate: (value: string | null) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  refresh: () => void;
  dateError: string | null;
}

export function useAuditLogs(limit = 20): UseAuditLogsReturn {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<AuditLogFilters>({
    ...DEFAULT_FILTERS,
  });
  const [dateError, setDateError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  // Track pending filters that haven't been applied yet
  const [pendingFilters, setPendingFilters] = useState<AuditLogFilters>({
    ...DEFAULT_FILTERS,
  });

  const fetchData = useCallback(
    async (pageNum: number, filtersToUse: AuditLogFilters) => {
      const id = ++fetchIdRef.current;
      setIsLoading(true);
      setDateError(null);

      // Validate dates
      if (
        filtersToUse.startDate &&
        filtersToUse.endDate &&
        filtersToUse.startDate > filtersToUse.endDate
      ) {
        if (id === fetchIdRef.current) {
          setDateError("La fecha 'Desde' no puede ser mayor que 'Hasta'");
          setIsLoading(false);
        }
        return;
      }

      try {
        const result = await auditLogService.list(filtersToUse, pageNum, limit);
        if (id === fetchIdRef.current) {
          setLogs(result.data);
          setTotal(result.total);
          setPageState(result.page);
          setTotalPages(result.total_pages);
        }
      } catch {
        if (id === fetchIdRef.current) {
          setLogs([]);
          setTotal(0);
          setPageState(1);
          setTotalPages(0);
        }
      } finally {
        if (id === fetchIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [limit],
  );

  // Initial fetch — use a ref to avoid the eslint warning about setState in effects
  const initialFetchRef = useRef(false);
  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchData(1, DEFAULT_FILTERS);
    }
  }, [fetchData]);

  const applyFilters = useCallback(() => {
    setFilters({ ...pendingFilters });
    fetchData(1, pendingFilters);
  }, [pendingFilters, fetchData]);

  const clearFilters = useCallback(() => {
    const cleared = { ...DEFAULT_FILTERS };
    setPendingFilters({ ...cleared });
    setFilters({ ...cleared });
    fetchData(1, cleared);
  }, [fetchData]);

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      fetchData(newPage, filters);
    },
    [filters, fetchData],
  );

  const refresh = useCallback(() => {
    fetchData(page, filters);
  }, [page, filters, fetchData]);

  return {
    logs,
    isLoading,
    total,
    page,
    totalPages,
    filters: pendingFilters,
    setFilterEntity: (value) =>
      setPendingFilters((prev) => ({ ...prev, entity: value })),
    setFilterAction: (value) =>
      setPendingFilters((prev) => ({ ...prev, action: value })),
    setFilterUsername: (value) =>
      setPendingFilters((prev) => ({ ...prev, username: value })),
    setFilterStartDate: (value) =>
      setPendingFilters((prev) => ({ ...prev, startDate: value })),
    setFilterEndDate: (value) =>
      setPendingFilters((prev) => ({ ...prev, endDate: value })),
    applyFilters,
    clearFilters,
    setPage,
    refresh,
    dateError,
  };
}
