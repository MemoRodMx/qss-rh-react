import { useState, useEffect, useCallback, useRef } from "react";
import { vacationRequestService } from "../services/vacationRequestService";
import type { VacationRequest } from "../types";

interface UseVacationRequestsReturn {
  requests: VacationRequest[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  deleteRequest: (id: string) => Promise<void>;
}

export function useVacationRequests(limit = 10): UseVacationRequestsReturn {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
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
        const result = await vacationRequestService.list(
          pageNum,
          limit,
          searchTerm,
        );
        if (id === fetchIdRef.current) {
          setRequests(result.data);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.total_pages);
        }
      } catch {
        if (id === fetchIdRef.current) {
          setRequests([]);
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

  const deleteRequest = useCallback(
    async (id: string) => {
      await vacationRequestService.delete(id);
      const newPage = requests.length === 1 && page > 1 ? page - 1 : page;
      fetchData(newPage, search);
    },
    [page, search, requests.length, fetchData],
  );

  return {
    requests,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage: goToPage,
    refresh,
    deleteRequest,
  };
}
