import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { FloatLabelDateInput } from "@/components/ui/float-label-date-input";
import { SectionTitle } from "../shared/SectionTitle";
import { SupervisorAutocomplete } from "../shared/SupervisorAutocomplete";
import { getNestedError } from "../../hooks/useEmployeeForm";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";
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

  const watchedShiftId = watch("work_location_shift_id");
  const watchedPositionId = watch("work_location_position_id");
  const watchedScheduleId = watch("work_location_schedule_id");
  const watchedAreaId = watch("work_location_area_id");
  const watchedStatus = watch("status");
  const watchedContractType = watch("contract_type");
  const watchedMaritalStatus = watch("marital_status");
  const watchedHireDate = watch("hire_date");

  const handleAreaChange = (val: string | null) => {
    setValue("work_location_area_id", val ?? "");
    setSupervisor(null);
    setValue("work_location_direct_supervisor_id", "");
  };

  return (
    <div className="space-y-8">
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
            <FloatLabelDateInput
              id="hire_date"
              label="Fecha de alta"
              value={watchedHireDate}
              onChange={(val) =>
                setValue("hire_date", val, { shouldValidate: true })
              }
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

      <div>
        <SectionTitle>Ubicación de trabajo</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <FloatLabelSelect
              id="work_location_area_id"
              label="Área"
              value={watchedAreaId}
              hasValue={!!watchedAreaId}
              onValueChange={handleAreaChange}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SupervisorAutocomplete
            supervisor={supervisor}
            setSupervisor={setSupervisor}
            setFieldValue={(name, value) => {
              setValue(name as "work_location_direct_supervisor_id", value);
            }}
            watchedAreaId={watchedAreaId}
            watchedShiftId={watchedShiftId}
          />
        </div>
      </div>
    </div>
  );
}
