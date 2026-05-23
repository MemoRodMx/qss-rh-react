import { useState, useEffect, useCallback, useRef } from "react";
import { restRoleService } from "../services/restRoleService";
import type { RestRole } from "../types";

interface UseRestRolesReturn {
  roles: RestRole[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refresh: () => void;
  deleteRole: (id: string) => Promise<void>;
}

export function useRestRoles(initialLimit = 10): UseRestRolesReturn {
  const [roles, setRoles] = useState<RestRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    async (pageNum: number, searchTerm: string, limitNum: number) => {
      const id = ++fetchIdRef.current;
      setIsLoading(true);

      try {
        const result = await restRoleService.list(
          pageNum,
          limitNum,
          searchTerm,
        );
        if (id === fetchIdRef.current) {
          setRoles(result.data);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.total_pages);
        }
      } catch {
        if (id === fetchIdRef.current) {
          setRoles([]);
          setTotal(0);
        }
      } finally {
        if (id === fetchIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  // Search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchData(1, search, limit);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, limit, fetchData]);

  const goToPage = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchData(newPage, search, limit);
    },
    [search, limit, fetchData],
  );

  const changeLimit = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      // Reset to page 1 when changing limit
      fetchData(1, search, newLimit);
    },
    [search, fetchData],
  );

  const refresh = useCallback(() => {
    fetchData(page, search, limit);
  }, [page, search, limit, fetchData]);

  const deleteRole = useCallback(
    async (id: string) => {
      await restRoleService.delete(id);
      const newPage = roles.length === 1 && page > 1 ? page - 1 : page;
      fetchData(newPage, search, limit);
    },
    [page, search, limit, roles.length, fetchData],
  );

  return {
    roles,
    isLoading,
    total,
    page,
    totalPages,
    limit,
    search,
    setSearch,
    setPage: goToPage,
    setLimit: changeLimit,
    refresh,
    deleteRole,
  };
}
