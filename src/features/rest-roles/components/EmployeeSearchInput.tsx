import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { restRoleService } from "../services/restRoleService";
import type { EmployeeSearchResult } from "../types";
import { Search, X, Loader2 } from "lucide-react";

function formatEmployeeNumber(num: string): string {
  return `#${num.padStart(6, "0")}`;
}

interface EmployeeSearchInputProps {
  value: string[];
  onChange: (employeeNumbers: string[]) => void;
  plantId?: string;
  plantCode?: string;
  shiftId?: string;
  positionIds?: string[];
  disabled?: boolean;
  placeholder?: string;
}

export function EmployeeSearchInput({
  value,
  onChange,
  plantCode,
  shiftId,
  positionIds,
  disabled = false,
  placeholder = "Buscar empleado por nombre o número...",
}: EmployeeSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EmployeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>(
    {},
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedRef = useRef<Set<string>>(new Set());

  const searchEmployees = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        const data = await restRoleService.searchEmployees(q, {
          plant_id: plantCode,
          shift_id: shiftId,
          position_ids: positionIds,
        });
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [plantCode, shiftId, positionIds],
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

  // Resolve employee names for chips display
  useEffect(() => {
    const unresolved = value.filter((num) => !resolvedRef.current.has(num));
    if (unresolved.length === 0) return;

    restRoleService.resolveEmployeeNumbers(unresolved).then((resolved) => {
      setEmployeeNames((prev) => {
        const next = { ...prev };
        for (const emp of resolved) {
          next[emp.employee_number] = emp.fullname;
          resolvedRef.current.add(emp.employee_number);
        }
        return next;
      });
    });
  }, [value]);

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

  const handleSelect = (emp: EmployeeSearchResult) => {
    if (!value.includes(emp.employee_number)) {
      onChange([...value, emp.employee_number]);
    }
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleRemove = (empNumber: string) => {
    onChange(value.filter((v) => v !== empNumber));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected employees chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((empNumber) => (
            <span
              key={empNumber}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-1"
            >
              <span className="font-medium">
                {formatEmployeeNumber(empNumber)}
              </span>
              {employeeNames[empNumber] && (
                <span className="text-foreground">
                  – {employeeNames[empNumber]}
                </span>
              )}
              {!disabled && (
                <button
                  type="button"
                  className="cursor-pointer hover:text-destructive ml-1"
                  onClick={() => handleRemove(empNumber)}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
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
