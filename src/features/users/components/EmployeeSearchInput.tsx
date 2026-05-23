import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import type { EmployeeOption } from "../types";

interface EmployeeSearchInputProps {
  value: EmployeeOption | null;
  onChange: (employee: EmployeeOption | null) => void;
  onSearch: (query: string) => Promise<void>;
  suggestions: EmployeeOption[];
  setSuggestions: (suggestions: EmployeeOption[]) => void;
  error?: string;
}

export function EmployeeSearchInput({
  value,
  onChange,
  onSearch,
  suggestions,
  setSuggestions,
  error,
}: EmployeeSearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If value is set externally (edit mode), show the label
  // Use a ref to track the initial value to avoid cascading renders
  const initialValueSet = useRef(false);
  useEffect(() => {
    if (value && !initialValueSet.current) {
      setQuery(value.label);
      initialValueSet.current = true;
    }
  }, [value]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);
      onChange(null);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (val.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          await onSearch(val);
          setIsOpen(true);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [onChange, onSearch, setSuggestions],
  );

  const handleSelect = useCallback(
    (employee: EmployeeOption) => {
      setQuery(employee.label);
      onChange(employee);
      setSuggestions([]);
      setIsOpen(false);
    },
    [onChange, setSuggestions],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onChange(null);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }, [onChange, setSuggestions]);

  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [suggestions]);

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs font-medium text-foreground mb-1 block">
        Jefe Directo (Empleado)
      </label>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Buscar por nombre o número de empleado..."
          className={`pl-8 pr-8 ${error ? "border-destructive" : ""}`}
        />
        {isSearching && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
        )}
        {!isSearching && query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-[var(--shadow-3)] max-h-48 overflow-y-auto">
          {suggestions.map((emp) => (
            <button
              key={emp._id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-primary/10 transition-colors cursor-pointer border-b border-border/30 last:border-b-0"
              onClick={() => handleSelect(emp)}
            >
              <span className="font-medium">{emp.employee_number}</span>
              {" - "}
              <span className="text-muted-foreground">{emp.fullname}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen &&
        suggestions.length === 0 &&
        query.length >= 2 &&
        !isSearching && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-[var(--shadow-3)] p-3 text-sm text-muted-foreground text-center">
            No se encontraron empleados
          </div>
        )}
    </div>
  );
}
