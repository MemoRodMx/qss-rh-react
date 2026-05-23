import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { vacationRequestService } from "../services/vacationRequestService";
import type { EmployeeSuggestion } from "../types";
import { Search, Loader2, X } from "lucide-react";

interface EmployeeAutocompleteProps {
  value: EmployeeSuggestion | null;
  onChange: (employee: EmployeeSuggestion | null) => void;
  plantId?: string;
  shiftId?: string;
  disabled?: boolean;
  error?: string | null;
}

export function EmployeeAutocomplete({
  value,
  onChange,
  plantId,
  shiftId,
  disabled = false,
  error = null,
}: EmployeeAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EmployeeSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canSearch = !!plantId && !!shiftId;

  const searchEmployees = useCallback(
    async (q: string) => {
      if (!q.trim() || !canSearch) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        const data = await vacationRequestService.searchEmployees(q, {
          plant_id: plantId,
          shift_id: shiftId,
        });
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [plantId, shiftId, canSearch],
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

  const handleSelect = (emp: EmployeeSuggestion) => {
    onChange(emp);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
  };

  // If there's a selected employee, show it as a chip
  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-input bg-white dark:bg-card px-2.5 py-1.5 h-8">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="flex-1 text-sm text-foreground truncate">
          {value.label}
        </span>
        {!disabled && (
          <button
            type="button"
            className="cursor-pointer text-muted-foreground hover:text-destructive"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={
            disabled
              ? ""
              : !canSearch
                ? "Primero seleccione planta y turno"
                : "Buscar por nombre o número de empleado..."
          }
          className={`pl-9 ${error ? "border-destructive" : ""}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled || !canSearch}
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
              <span className="font-medium text-foreground">
                {emp.employee_number}
              </span>
              <span className="text-muted-foreground">-</span>
              <span className="text-muted-foreground">{emp.fullname}</span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && results.length === 0 && query.trim() && !isSearching && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-[var(--shadow-3)] p-3 text-sm text-muted-foreground text-center">
          No se encontraron empleados
        </div>
      )}
    </div>
  );
}
