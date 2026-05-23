import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { attendanceService } from "../services/attendanceService";
import type { LoanSuggestion, EmployeeEntry } from "../types";
import { Search, Loader2, UserPlus } from "lucide-react";

interface LoanEmployeeSearchProps {
  entriesList: EmployeeEntry[];
  onAdd: (emp: LoanSuggestion) => void;
  disabled?: boolean;
}

export function LoanEmployeeSearch({
  entriesList,
  onAdd,
  disabled = false,
}: LoanEmployeeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LoanSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchEmployees = useCallback(
    async (q: string) => {
      if (!q.trim() || q.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        const data = await attendanceService.searchEmployees(q);
        const filtered = data.filter(
          (s) =>
            !entriesList.some((e) => e.employee_number === s.employee_number),
        );
        setResults(filtered);
        setIsOpen(filtered.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [entriesList],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      searchEmployees(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchEmployees]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (emp: LoanSuggestion) => {
    onAdd(emp);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o número de empleado..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-[var(--shadow-3)] max-h-48 overflow-y-auto">
          {results.map((emp) => (
            <button
              key={emp.employee_number}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => handleSelect(emp)}
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground text-sm">
                  {emp.fullname}
                </span>
                <span className="text-xs text-muted-foreground">
                  #{emp.employee_number}
                  {emp.plant_id ? ` · Planta: ${emp.plant_id}` : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen &&
        results.length === 0 &&
        query.trim().length >= 2 &&
        !isSearching && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-[var(--shadow-3)] p-3 text-sm text-muted-foreground text-center">
            No se encontraron empleados
          </div>
        )}
    </div>
  );
}
