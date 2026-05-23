import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const renderFieldError = (fieldName: string) => {
    const error = getNestedError(errorsRecord, fieldName);
    if (!error) return null;
    return <p className="mt-1 text-xs text-destructive">{error.message}</p>;
  };

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
            <Label htmlFor="name">Nombre(s)</Label>
            <Input
              id="name"
              {...register("name")}
              className={errorsRecord.name ? "border-destructive" : ""}
            />
            {renderFieldError("name")}
          </div>
          <div>
            <Label htmlFor="surname">Apellido paterno</Label>
            <Input
              id="surname"
              {...register("surname")}
              className={errorsRecord.surname ? "border-destructive" : ""}
            />
            {renderFieldError("surname")}
          </div>
          <div>
            <Label htmlFor="lastname">Apellido materno</Label>
            <Input id="lastname" {...register("lastname")} />
          </div>
        </div>
      </div>

      {/* ── Datos de nacimiento y género ─────────────────────────────────── */}
      <div>
        <SectionTitle>Datos de nacimiento y género</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="genre">Género</Label>
            <Select
              value={watch("genre")}
              onValueChange={(val) =>
                setValue("genre", val ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="genre"
                className={errorsRecord.genre ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Seleccionar">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar";
                    const opt = GENRE_OPTIONS.find((g) => g.value === value);
                    return opt?.label ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {GENRE_OPTIONS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFieldError("genre")}
          </div>
          <div>
            <Label htmlFor="birth_date">Fecha de nacimiento</Label>
            <Input id="birth_date" type="date" {...register("birth_date")} />
          </div>
          <div>
            <Label htmlFor="birth_place">Lugar de nacimiento</Label>
            <Select
              value={watch("birth_place")}
              onValueChange={(val) =>
                setValue("birth_place", val ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger id="birth_place">
                <SelectValue placeholder="Seleccionar estado">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar estado";
                    const state = states.find((s) => s.code === value);
                    return state?.name ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Identificación fiscal y seguridad social ─────────────────────── */}
      <div>
        <SectionTitle>Identificación fiscal y seguridad social</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rfc">RFC</Label>
            <Input
              id="rfc"
              {...register("rfc")}
              className={`uppercase ${errorsRecord.rfc ? "border-destructive" : ""}`}
              style={{ textTransform: "uppercase" }}
            />
            {renderFieldError("rfc")}
          </div>
          <div>
            <Label htmlFor="curp">CURP</Label>
            <Input
              id="curp"
              {...register("curp")}
              className={`uppercase ${errorsRecord.curp ? "border-destructive" : ""}`}
              style={{ textTransform: "uppercase" }}
            />
            {renderFieldError("curp")}
          </div>
          <div>
            <Label htmlFor="nss">NSS</Label>
            <Input id="nss" {...register("nss")} />
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
          <Label
            htmlFor="resident"
            className="cursor-pointer text-sm font-normal"
          >
            Residente en México
          </Label>
        </div>
      </div>

      {/* ── Cliente ──────────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Cliente</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer_id">Cliente</Label>
            <Select
              value={watch("customer_id")}
              onValueChange={(val) =>
                setValue("customer_id", val ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="customer_id"
                className={errorsRecord.customer_id ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Seleccionar cliente">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar cliente";
                    const customer = customers.find((c) => c.code === value);
                    return customer?.name ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFieldError("customer_id")}
          </div>
        </div>
      </div>

      {/* ── Contratación ─────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Contratación</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status">Estatus</Label>
            <Select
              value={watch("status")}
              onValueChange={(val) =>
                setValue("status", val ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="status"
                className={errorsRecord.status ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Seleccionar">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar";
                    const opt = STATUS_OPTIONS.find((s) => s.value === value);
                    return opt?.label ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFieldError("status")}
          </div>
          <div>
            <Label htmlFor="hire_date">Fecha de alta</Label>
            <Input id="hire_date" type="date" {...register("hire_date")} />
          </div>
          <div>
            <Label htmlFor="seniority">Antigüedad (años)</Label>
            <Input
              id="seniority"
              {...register("seniority", { valueAsNumber: true })}
              readOnly
              className="bg-muted/30"
            />
          </div>
          <div>
            <Label htmlFor="contract_type">Tipo de contrato</Label>
            <Select
              value={watch("contract_type")}
              onValueChange={(val) =>
                setValue("contract_type", val ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="contract_type"
                className={
                  errorsRecord.contract_type ? "border-destructive" : ""
                }
              >
                <SelectValue placeholder="Seleccionar">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar";
                    const opt = CONTRACT_TYPE_OPTIONS.find(
                      (c) => c.value === value,
                    );
                    return opt?.label ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPE_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFieldError("contract_type")}
          </div>
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div>
            <Label htmlFor="sat_zip_code">C.P. SAT</Label>
            <Input
              id="sat_zip_code"
              {...register("sat_zip_code")}
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="marital_status">Estado civil</Label>
            <Select
              value={watch("marital_status")}
              onValueChange={(val) =>
                setValue("marital_status", val ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="marital_status"
                className={
                  errorsRecord.marital_status ? "border-destructive" : ""
                }
              >
                <SelectValue placeholder="Seleccionar">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar";
                    const opt = MARITAL_STATUS_OPTIONS.find(
                      (m) => m.value === value,
                    );
                    return opt?.label ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MARITAL_STATUS_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFieldError("marital_status")}
          </div>
        </div>
      </div>
    </div>
  );
}
