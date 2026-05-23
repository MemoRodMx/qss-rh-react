import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getNestedError } from "../../hooks/useEmployeeForm";
import { employeeService } from "../../services/employeeService";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";
import type { SupervisorOption } from "../../types";

type Props = Pick<
  EmployeeFormShellProps,
  | "register"
  | "setValue"
  | "watch"
  | "errors"
  | "plants"
  | "positions"
  | "shifts"
  | "schedules"
  | "areas"
  | "supervisor"
  | "setSupervisor"
>;

export function WorkLocationTab({
  register,
  setValue,
  watch,
  errors,
  plants,
  positions,
  shifts,
  schedules,
  areas,
  supervisor,
  setSupervisor,
}: Props) {
  const errorsRecord = errors as unknown as Record<string, unknown>;
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [supervisorResults, setSupervisorResults] = useState<
    SupervisorOption[]
  >([]);
  const [isSearchingSupervisor, setIsSearchingSupervisor] = useState(false);
  const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const watchedPlantId = watch("work_location_plant_id");
  const watchedShiftId = watch("work_location_shift_id");

  // Supervisor search with debounce
  useEffect(() => {
    if (!supervisorSearch || supervisorSearch.length < 2) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearchingSupervisor(true);
      try {
        const results = await employeeService.listSupervisors(
          supervisorSearch,
          watchedPlantId || undefined,
          watchedShiftId || undefined,
        );
        setSupervisorResults(results);
        setShowSupervisorDropdown(results.length > 0);
      } catch {
        setSupervisorResults([]);
      } finally {
        setIsSearchingSupervisor(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [supervisorSearch, watchedPlantId, watchedShiftId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowSupervisorDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSupervisor = (sup: SupervisorOption) => {
    setSupervisor(sup);
    setValue("work_location_direct_supervisor_id", sup._id);
    setSupervisorSearch(sup.label);
    setShowSupervisorDropdown(false);
  };

  const clearSupervisor = () => {
    setSupervisor(null);
    setValue("work_location_direct_supervisor_id", "");
    setSupervisorSearch("");
    setShowSupervisorDropdown(false);
  };

  const renderFieldError = (fieldName: string) => {
    const error = getNestedError(errorsRecord, fieldName);
    if (!error) return null;
    return <p className="mt-1 text-xs text-destructive">{error.message}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Plant + Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="work_location_plant_id">Planta</Label>
          <Select
            value={watch("work_location_plant_id")}
            onValueChange={(val) =>
              setValue("work_location_plant_id", val ?? "")
            }
          >
            <SelectTrigger id="work_location_plant_id">
              <SelectValue placeholder="Seleccionar planta">
                {(value: string | null) => {
                  if (!value) return "Seleccionar planta";
                  const plant = plants.find((p) => p.code === value);
                  return plant?.name ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {plants.map((p) => (
                <SelectItem key={p.code} value={p.code}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="work_location_position_id">Puesto</Label>
          <Select
            value={watch("work_location_position_id")}
            onValueChange={(val) =>
              setValue("work_location_position_id", val ?? "")
            }
          >
            <SelectTrigger id="work_location_position_id">
              <SelectValue placeholder="Seleccionar puesto">
                {(value: string | null) => {
                  if (!value) return "Seleccionar puesto";
                  const pos = positions.find((p) => p.code === value);
                  return pos?.name ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {positions.map((p) => (
                <SelectItem key={p.code} value={p.code}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Shift + Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="work_location_shift_id">Turno</Label>
          <Select
            value={watch("work_location_shift_id")}
            onValueChange={(val) => {
              setValue("work_location_shift_id", val ?? "");
              setValue("work_location_schedule_id", "");
            }}
          >
            <SelectTrigger id="work_location_shift_id">
              <SelectValue placeholder="Seleccionar turno">
                {(value: string | null) => {
                  if (!value) return "Seleccionar turno";
                  const shift = shifts.find((s) => s.code === value);
                  return shift?.name ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {shifts.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="work_location_schedule_id">Horario</Label>
          <Select
            value={watch("work_location_schedule_id")}
            onValueChange={(val) =>
              setValue("work_location_schedule_id", val ?? "")
            }
            disabled={!watchedShiftId || schedules.length === 0}
          >
            <SelectTrigger id="work_location_schedule_id">
              <SelectValue
                placeholder={
                  !watchedShiftId
                    ? "Primero selecciona un turno"
                    : schedules.length === 0
                      ? "Sin horarios disponibles"
                      : "Seleccionar horario"
                }
              >
                {(value: string | null) => {
                  if (!value) return null;
                  const schedule = schedules.find((s) => s.code === value);
                  return schedule?.label ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {schedules.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="work_location_area_id">Área</Label>
          <Select
            value={watch("work_location_area_id")}
            onValueChange={(val) =>
              setValue("work_location_area_id", val ?? "")
            }
          >
            <SelectTrigger id="work_location_area_id">
              <SelectValue placeholder="Seleccionar área">
                {(value: string | null) => {
                  if (!value) return "Seleccionar área";
                  const area = areas.find((a) => a.code === value);
                  return area?.name ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.code} value={a.code}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 4: Supervisor (autocomplete) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative" ref={dropdownRef}>
          <Label htmlFor="supervisor_search">Supervisor directo</Label>
          <Input
            id="supervisor_search"
            value={supervisorSearch}
            onChange={(e) => {
              setSupervisorSearch(e.target.value);
              if (supervisor) clearSupervisor();
            }}
            placeholder="Buscar supervisor por nombre o número..."
          />
          {isSearchingSupervisor && (
            <p className="mt-1 text-xs text-muted-foreground">Buscando...</p>
          )}
          {showSupervisorDropdown && supervisorResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-border/50 bg-card shadow-[var(--shadow-3)] max-h-48 overflow-y-auto">
              {supervisorResults.map((sup) => (
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
          {renderFieldError("work_location_direct_supervisor_id")}
        </div>
      </div>
    </div>
  );
}
