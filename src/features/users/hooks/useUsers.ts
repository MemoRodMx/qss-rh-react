import { useState, useEffect, useCallback, useRef } from "react";
import { userService } from "../services/userService";
import type { User } from "../types";

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  deleteUser: (id: string) => Promise<void>;
  reactivateUser: (
    id: string,
  ) => Promise<{ message: string; conflict?: boolean }>;
  activationMessage: { text: string; severity: "success" | "warn" } | null;
  clearActivationMessage: () => void;
}

export function useUsers(limit = 10): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [activationMessage, setActivationMessage] = useState<{
    text: string;
    severity: "success" | "warn";
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    async (pageNum: number, searchTerm: string) => {
      const id = ++fetchIdRef.current;
      setIsLoading(true);

      try {
        const result = await userService.list(pageNum, limit, searchTerm);
        if (id === fetchIdRef.current) {
          setUsers(result.data);
          setTotal(result.total);
          setPage(result.page);
          setTotalPages(result.total_pages);
        }
      } catch {
        if (id === fetchIdRef.current) {
          setUsers([]);
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

  const deleteUser = useCallback(
    async (id: string) => {
      await userService.delete(id);
      const newPage = users.length === 1 && page > 1 ? page - 1 : page;
      fetchData(newPage, search);
    },
    [page, search, users.length, fetchData],
  );

  const reactivateUser = useCallback(
    async (id: string) => {
      const result = await userService.reactivate(id);
      setActivationMessage({
        text: result?.message ?? "Usuario activado exitosamente",
        severity: result?.conflict ? "warn" : "success",
      });
      fetchData(page, search);
      return result;
    },
    [page, search, fetchData],
  );

  const clearActivationMessage = useCallback(() => {
    setActivationMessage(null);
  }, []);

  return {
    users,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage: goToPage,
    refresh,
    deleteUser,
    reactivateUser,
    activationMessage,
    clearActivationMessage,
  };
}
