import { useState, useEffect, useRef } from "react";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { getNestedError } from "../../hooks/useEmployeeForm";
import { employeeService } from "../../services/employeeService";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";
import type { SupervisorOption } from "../../types";

type Props = Pick<
  EmployeeFormShellProps,
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 pb-1.5 border-b border-border/30">
      {children}
    </h3>
  );
}

export function WorkLocationTab({
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
  const watchedPositionId = watch("work_location_position_id");
  const watchedScheduleId = watch("work_location_schedule_id");
  const watchedAreaId = watch("work_location_area_id");

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

  return (
    <div className="space-y-8">
      {/* ── Ubicación de trabajo ─────────────────────────────────────────── */}
      <div>
        <SectionTitle>Ubicación de trabajo</SectionTitle>
        {/* Row 1: Plant + Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FloatLabelSelect
              id="work_location_plant_id"
              label="Planta"
              value={watchedPlantId}
              hasValue={!!watchedPlantId}
              onValueChange={(val) =>
                setValue("work_location_plant_id", val ?? "")
              }
              valueRenderer={(value) => {
                if (!value) return "";
                const plant = plants.find((p) => p.code === value);
                return plant?.name ?? value;
              }}
            >
              {plants.map((p) => (
                <SelectItem key={p.code} value={p.code}>
                  {p.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelSelect
              id="work_location_position_id"
              label="Puesto"
              value={watchedPositionId}
              hasValue={!!watchedPositionId}
              onValueChange={(val) =>
                setValue("work_location_position_id", val ?? "")
              }
              valueRenderer={(value) => {
                if (!value) return "";
                const pos = positions.find((p) => p.code === value);
                return pos?.name ?? value;
              }}
            >
              {positions.map((p) => (
                <SelectItem key={p.code} value={p.code}>
                  {p.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>

        {/* Row 2: Shift + Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FloatLabelSelect
              id="work_location_shift_id"
              label="Turno"
              value={watchedShiftId}
              hasValue={!!watchedShiftId}
              onValueChange={(val) => {
                setValue("work_location_shift_id", val ?? "");
                setValue("work_location_schedule_id", "");
              }}
              valueRenderer={(value) => {
                if (!value) return "";
                const shift = shifts.find(
                  (s) => s.code?.toLowerCase() === value.toLowerCase(),
                );
                return shift?.name ?? value;
              }}
            >
              {shifts.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelSelect
              id="work_location_schedule_id"
              label="Horario"
              value={watchedScheduleId}
              hasValue={!!watchedScheduleId}
              disabled={!watchedShiftId || schedules.length === 0}
              onValueChange={(val) =>
                setValue("work_location_schedule_id", val ?? "")
              }
              valueRenderer={(value) => {
                if (!value) return "";
                const schedule = schedules.find((s) => s.code === value);
                return schedule?.label ?? value;
              }}
            >
              {schedules.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>

        {/* Row 3: Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FloatLabelSelect
              id="work_location_area_id"
              label="Área"
              value={watchedAreaId}
              hasValue={!!watchedAreaId}
              onValueChange={(val) =>
                setValue("work_location_area_id", val ?? "")
              }
              valueRenderer={(value) => {
                if (!value) return "";
                const area = areas.find((a) => a.code === value);
                return area?.name ?? value;
              }}
            >
              {areas.map((a) => (
                <SelectItem key={a.code} value={a.code}>
                  {a.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>

        {/* Row 4: Supervisor (autocomplete) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={dropdownRef}>
            <FloatLabelInput
              id="supervisor_search"
              label="Supervisor directo"
              value={supervisorSearch}
              onChange={(e) => {
                setSupervisorSearch(e.target.value);
                if (supervisor) clearSupervisor();
              }}
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
            {getNestedError(errorsRecord, "work_location_direct_supervisor_id")
              ?.message && (
              <p className="mt-1 text-xs text-destructive">
                {
                  getNestedError(
                    errorsRecord,
                    "work_location_direct_supervisor_id",
                  )?.message
                }
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
