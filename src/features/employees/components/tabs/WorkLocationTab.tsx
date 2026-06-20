import { useState, useEffect, useRef } from "react";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { getNestedError } from "../../hooks/useEmployeeForm";
import { employeeService } from "../../services/employeeService";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";
import type { SupervisorOption } from "../../types";
import {
  STATUS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from "../../types";

type Props = Pick<
  EmployeeFormShellProps,
  | "register"
  | "setValue"
  | "watch"
  | "errors"
  | "positions"
  | "shifts"
  | "schedules"
  | "areas"
  | "supervisor"
  | "setSupervisor"
  | "customerDisplayName"
  | "plantDisplayCode"
  | "plantDisplayName"
>;

function Hint({ children, show }: { children: React.ReactNode; show: boolean }) {
  if (!show) return null;
  return (
    <p className="mt-1 text-xs text-muted-foreground/70">{children}</p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 pb-1.5 border-b border-border/30">
      {children}
    </h3>
  );
}

export function WorkLocationTab({
  register,
  setValue,
  watch,
  errors,
  positions,
  shifts,
  schedules,
  areas,
  supervisor,
  setSupervisor,
  customerDisplayName,
  plantDisplayCode,
  plantDisplayName,
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

  const watchedShiftId = watch("work_location_shift_id");
  const watchedPositionId = watch("work_location_position_id");
  const watchedScheduleId = watch("work_location_schedule_id");
  const watchedAreaId = watch("work_location_area_id");
  const watchedStatus = watch("status");
  const watchedContractType = watch("contract_type");
  const watchedMaritalStatus = watch("marital_status");

  const hasArea = !!watchedAreaId;

  // Supervisor search with debounce (filtered by area + shift)
  useEffect(() => {
    if (!supervisorSearch || supervisorSearch.length < 2 || !watchedAreaId) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearchingSupervisor(true);
      try {
        const results = await employeeService.listSupervisors(
          supervisorSearch,
          watchedAreaId,
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
  }, [supervisorSearch, watchedAreaId, watchedShiftId]);

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
      {/* ── Contratación ─────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Contratación</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FloatLabelSelect
              id="status"
              label="Estatus"
              value={watchedStatus}
              hasValue={!!watchedStatus}
              onValueChange={(val) =>
                setValue("status", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  STATUS_OPTIONS.find((s) => s.value === value)?.label ?? value
                );
              }}
              error={getNestedError(errorsRecord, "status")?.message}
            >
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelInput
              id="hire_date"
              label="Fecha de alta"
              type="date"
              {...register("hire_date")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="seniority"
              label="Antigüedad (años)"
              {...register("seniority", { valueAsNumber: true })}
              readOnly
              className="bg-muted/30"
            />
          </div>
          <div>
            <FloatLabelSelect
              id="contract_type"
              label="Tipo de contrato"
              value={watchedContractType}
              hasValue={!!watchedContractType}
              onValueChange={(val) =>
                setValue("contract_type", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  CONTRACT_TYPE_OPTIONS.find((c) => c.value === value)?.label ??
                  value
                );
              }}
              error={getNestedError(errorsRecord, "contract_type")?.message}
            >
              {CONTRACT_TYPE_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelInput
              id="email"
              label="Correo electrónico"
              type="email"
              {...register("email")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="sat_zip_code"
              label="C.P. SAT"
              {...register("sat_zip_code")}
              maxLength={5}
            />
          </div>
          <div>
            <FloatLabelSelect
              id="marital_status"
              label="Estado civil"
              value={watchedMaritalStatus}
              hasValue={!!watchedMaritalStatus}
              onValueChange={(val) =>
                setValue("marital_status", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  MARITAL_STATUS_OPTIONS.find((m) => m.value === value)
                    ?.label ?? value
                );
              }}
              error={getNestedError(errorsRecord, "marital_status")?.message}
            >
              {MARITAL_STATUS_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>
      </div>

      {/* ── Ubicación de trabajo ─────────────────────────────────────────── */}
      <div>
        <SectionTitle>Ubicación de trabajo</SectionTitle>
        {/* Row 1: Area + Customer (r/o) + Plant (r/o) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <FloatLabelSelect
              id="work_location_area_id"
              label="Área"
              value={watchedAreaId}
              hasValue={!!watchedAreaId}
              onValueChange={(val) => {
                setValue("work_location_area_id", val ?? "");
                setSupervisor(null);
                setValue("work_location_direct_supervisor_id", "");
                setSupervisorSearch("");
                setShowSupervisorDropdown(false);
                setSupervisorResults([]);
              }}
              valueRenderer={(value) => {
                if (!value) return "";
                const area = areas.find((a) => a.code === value);
                return area ? `${area.code} - ${area.name}` : value;
              }}
            >
              {areas.map((a) => (
                <SelectItem key={a.code} value={a.code}>
                  {a.code} - {a.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
            <Hint show={areas.length === 0}>
              No hay áreas disponibles
            </Hint>
          </div>
          <div>
            <FloatLabelInput
              id="customer_display"
              label="Cliente"
              value={customerDisplayName}
              readOnly
              className="bg-muted/30"
              error={getNestedError(errorsRecord, "customer_id")?.message}
            />
            <Hint show={!customerDisplayName}>
              Se muestra al seleccionar un área
            </Hint>
          </div>
          <div>
            <FloatLabelInput
              id="plant_display"
              label="Planta"
              value={
                plantDisplayCode && plantDisplayName
                  ? `${plantDisplayCode} - ${plantDisplayName}`
                  : ""
              }
              readOnly
              className="bg-muted/30"
            />
            <Hint show={!plantDisplayName}>
              Se muestra al seleccionar un área
            </Hint>
          </div>
        </div>

        {/* Row 2: Position + Shift + Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                return pos
                  ? `${pos.code} - ${pos.description ?? pos.name}`
                  : value;
              }}
            >
              {positions.map((p) => (
                <SelectItem key={p.code} value={p.code}>
                  {p.code} - {p.description ?? p.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
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
                return shift ? `${shift.code} - ${shift.name}` : value;
              }}
            >
              {shifts.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.code} - {s.name}
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

        {/* Row 3: Supervisor (autocomplete) */}
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
            <Hint show={!hasArea}>
              Seleccione un área para buscar el jefe directo
            </Hint>
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
