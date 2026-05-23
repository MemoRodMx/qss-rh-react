import { useState, useEffect, useCallback, useRef } from "react";
import { attendanceService } from "../services/attendanceService";
import type { AttendanceRecordListItem } from "../types";

interface UseAttendanceRecordsReturn {
  records: AttendanceRecordListItem[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  deleteRecord: (id: string) => Promise<void>;
}

export function useAttendanceRecords(limit = 10): UseAttendanceRecordsReturn {
  const [records, setRecords] = useState<AttendanceRecordListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    async (pageNum: number, searchTerm: string) => {
      const id = ++fetchIdRef.current;
      setIsLoading(true);

      try {
        const result = await attendanceService.list(pageNum, limit, searchTerm);
        if (id === fetchIdRef.current) {
          setRecords(result.data);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(Math.ceil(result.total / limit));
        }
      } catch {
        if (id === fetchIdRef.current) {
          setRecords([]);
          setTotal(0);
        }
      } finally {
        if (id === fetchIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [limit],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchData(1, search);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchData]);

  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchData(newPage, search);
    },
    [search, fetchData],
  );

  const refresh = useCallback(() => {
    fetchData(page, search);
  }, [page, search, fetchData]);

  const deleteRecord = useCallback(
    async (id: string) => {
      await attendanceService.delete(id);
      const newPage = records.length === 1 && page > 1 ? page - 1 : page;
      fetchData(newPage, search);
    },
    [page, search, records.length, fetchData],
  );

  return {
    records,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage: goToPage,
    refresh,
    deleteRecord,
  };
}
