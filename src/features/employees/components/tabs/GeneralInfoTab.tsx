import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { getNestedError } from "../../hooks/useEmployeeForm";
import {
  MARITAL_STATUS_OPTIONS,
  GENRE_OPTIONS,
  STATUS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
} from "../../types";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";

type Props = Pick<
  EmployeeFormShellProps,
  "register" | "setValue" | "watch" | "errors" | "customers" | "states"
>;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 pb-1.5 border-b border-border/30">
      {children}
    </h3>
  );
}

export function GeneralInfoTab({
  register,
  setValue,
  watch,
  errors,
  customers,
  states,
}: Props) {
  const errorsRecord = errors as unknown as Record<string, unknown>;

  const watchedGenre = watch("genre");
  const watchedBirthPlace = watch("birth_place");
  const watchedCustomerId = watch("customer_id");
  const watchedStatus = watch("status");
  const watchedContractType = watch("contract_type");
  const watchedMaritalStatus = watch("marital_status");

  const getError = (fieldName: string) =>
    getNestedError(errorsRecord, fieldName)?.message;

  return (
    <div className="space-y-8">
      {/* ── Número de empleado ───────────────────────────────────────────── */}
      <div>
        <SectionTitle>Número de empleado</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              id="employee_number"
              {...register("employee_number")}
              placeholder="Auto-asignado"
              readOnly
              className="bg-muted/30"
            />
          </div>
        </div>
      </div>

      {/* ── Nombre completo ──────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Nombre completo</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FloatLabelInput
              id="name"
              label="Nombre(s)"
              {...register("name")}
              error={getError("name")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="surname"
              label="Apellido paterno"
              {...register("surname")}
              error={getError("surname")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="lastname"
              label="Apellido materno"
              {...register("lastname")}
            />
          </div>
        </div>
      </div>

      {/* ── Datos de nacimiento y género ─────────────────────────────────── */}
      <div>
        <SectionTitle>Datos de nacimiento y género</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FloatLabelSelect
              id="genre"
              label="Género"
              value={watchedGenre}
              hasValue={!!watchedGenre}
              onValueChange={(val) =>
                setValue("genre", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  GENRE_OPTIONS.find((g) => g.value === value)?.label ?? value
                );
              }}
              error={getError("genre")}
            >
              {GENRE_OPTIONS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelInput
              id="birth_date"
              label="Fecha de nacimiento"
              type="date"
              {...register("birth_date")}
            />
          </div>
          <div>
            <FloatLabelSelect
              id="birth_place"
              label="Lugar de nacimiento"
              value={watchedBirthPlace}
              hasValue={!!watchedBirthPlace}
              onValueChange={(val) =>
                setValue("birth_place", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                const state = states.find((s) => s.code === value);
                return state?.name ?? value;
              }}
            >
              {states.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>
      </div>

      {/* ── Identificación fiscal y seguridad social ─────────────────────── */}
      <div>
        <SectionTitle>Identificación fiscal y seguridad social</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FloatLabelInput
              id="rfc"
              label="RFC"
              {...register("rfc")}
              className="uppercase"
              style={{ textTransform: "uppercase" }}
              error={getError("rfc")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="curp"
              label="CURP"
              {...register("curp")}
              className="uppercase"
              style={{ textTransform: "uppercase" }}
              error={getError("curp")}
            />
          </div>
          <div>
            <FloatLabelInput id="nss" label="NSS" {...register("nss")} />
          </div>
        </div>
      </div>

      {/* ── Otros ────────────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Otros</SectionTitle>
        <div className="flex items-center gap-2">
          <Checkbox
            id="resident"
            checked={watch("resident")}
            onCheckedChange={(checked) =>
              setValue("resident", checked === true)
            }
          />
          <label
            htmlFor="resident"
            className="cursor-pointer text-sm font-normal"
          >
            Residente en México
          </label>
        </div>
      </div>

      {/* ── Cliente ──────────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Cliente</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatLabelSelect
              id="customer_id"
              label="Cliente"
              value={watchedCustomerId}
              hasValue={!!watchedCustomerId}
              onValueChange={(val) =>
                setValue("customer_id", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                const customer = customers.find((c) => c.code === value);
                return customer?.name ?? value;
              }}
              error={getError("customer_id")}
            >
              {customers.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>
      </div>

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
              error={getError("status")}
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
              error={getError("contract_type")}
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
              error={getError("marital_status")}
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
    </div>
  );
}
