import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { employeeService } from "../../services/employeeService";
import type { SupervisorOption } from "../../types";

interface SupervisorAutocompleteProps {
  supervisor: SupervisorOption | null;
  setSupervisor: (s: SupervisorOption | null) => void;
  setFieldValue: (name: string, value: string) => void;
  watchedAreaId: string;
  watchedShiftId: string;
}

function Hint({ children, show }: { children: React.ReactNode; show: boolean }) {
  if (!show) return null;
  return (
    <p className="mt-1 text-xs text-muted-foreground/70">{children}</p>
  );
}

export function SupervisorAutocomplete({
  supervisor,
  setSupervisor,
  setFieldValue,
  watchedAreaId,
  watchedShiftId,
}: SupervisorAutocompleteProps) {
  const [search, setSearch] = useState(supervisor?.label ?? "");
  const [results, setResults] = useState<SupervisorOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasArea = !!watchedAreaId;

  useEffect(() => {
    if (!search || search.length < 1 || !watchedAreaId) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await employeeService.listSupervisors(
          search,
          watchedAreaId,
          watchedShiftId || undefined,
        );
        setResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, watchedAreaId, watchedShiftId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSupervisor = (sup: SupervisorOption) => {
    setSupervisor(sup);
    setFieldValue("work_location_direct_supervisor_id", sup._id);
    setSearch(sup.label);
    setShowDropdown(false);
  };

  const clearSupervisor = () => {
    setSupervisor(null);
    setFieldValue("work_location_direct_supervisor_id", "");
    setSearch("");
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <FloatLabelInput
        id="supervisor_search"
        label="Supervisor directo"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          if (supervisor) clearSupervisor();
        }}
      />
      <Hint show={!hasArea}>
        Seleccione un área para buscar el jefe directo
      </Hint>
      <Hint show={hasArea && !search && !supervisor}>
        Escriba para buscar un supervisor
      </Hint>
      {isSearching && (
        <p className="mt-1 text-xs text-muted-foreground">Buscando...</p>
      )}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border/50 bg-card shadow-[var(--shadow-3)] max-h-48 overflow-y-auto">
          {results.map((sup) => (
            <button
              key={sup._id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors cursor-pointer border-b border-border/30 last:border-b-0"
              onClick={() => selectSupervisor(sup)}
            >
              <span className="font-medium">{sup.name}</span>
              <span className="text-muted-foreground ml-2">
                #{sup.employee_number}
              </span>
            </button>
          ))}
        </div>
      )}
      {supervisor && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Supervisor: {supervisor.label}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-5 w-5 cursor-pointer text-destructive"
            onClick={clearSupervisor}
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
}
