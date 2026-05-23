import { useState, useEffect, useCallback, useRef } from "react";
import { restRoleService } from "../services/restRoleService";
import type { RestRole } from "../types";

interface UseRestRolesReturn {
  roles: RestRole[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  deleteRole: (id: string) => Promise<void>;
}

export function useRestRoles(limit = 10): UseRestRolesReturn {
  const [roles, setRoles] = useState<RestRole[]>([]);
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
        const result = await restRoleService.list(pageNum, limit, searchTerm);
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

  const deleteRole = useCallback(
    async (id: string) => {
      await restRoleService.delete(id);
      const newPage = roles.length === 1 && page > 1 ? page - 1 : page;
      fetchData(newPage, search);
    },
    [page, search, roles.length, fetchData],
  );

  return {
    roles,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage: goToPage,
    refresh,
    deleteRole,
  };
}
