import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SALARY_TYPE_OPTIONS,
  ZONE_OPTIONS,
  PAYMENT_WAY_OPTIONS,
} from "../../types";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";

type Props = Pick<
  EmployeeFormShellProps,
  "register" | "setValue" | "watch" | "errors"
>;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 pb-1.5 border-b border-border/30">
      {children}
    </h3>
  );
}

export function SalaryTab({ register, setValue, watch }: Props) {
  return (
    <div className="space-y-8">
      {/* ── Clasificación salarial ───────────────────────────────────────── */}
      <div>
        <SectionTitle>Clasificación salarial</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="salary_salary_type">Tipo de salario</Label>
            <Select
              value={watch("salary_salary_type")}
              onValueChange={(val) => setValue("salary_salary_type", val ?? "")}
            >
              <SelectTrigger id="salary_salary_type">
                <SelectValue placeholder="Seleccionar">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar";
                    const opt = SALARY_TYPE_OPTIONS.find(
                      (s) => s.value === value,
                    );
                    return opt?.label ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SALARY_TYPE_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="salary_zone">Zona</Label>
            <Select
              value={watch("salary_zone")}
              onValueChange={(val) => setValue("salary_zone", val ?? "")}
            >
              <SelectTrigger id="salary_zone">
                <SelectValue placeholder="Seleccionar">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar";
                    const opt = ZONE_OPTIONS.find((z) => z.value === value);
                    return opt?.label ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ZONE_OPTIONS.map((z) => (
                  <SelectItem key={z.value} value={z.value}>
                    {z.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="salary_payment_way">Forma de pago</Label>
            <Select
              value={watch("salary_payment_way")}
              onValueChange={(val) => setValue("salary_payment_way", val ?? "")}
            >
              <SelectTrigger id="salary_payment_way">
                <SelectValue placeholder="Seleccionar">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar";
                    const opt = PAYMENT_WAY_OPTIONS.find(
                      (p) => p.value === value,
                    );
                    return opt?.label ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_WAY_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Importes ─────────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Importes</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="salary_daily_salary">Salario diario ($)</Label>
            <Input
              id="salary_daily_salary"
              type="number"
              step="0.01"
              min="0"
              {...register("salary_daily_salary")}
            />
          </div>
          <div>
            <Label htmlFor="salary_weekly_salary">Salario semanal ($)</Label>
            <Input
              id="salary_weekly_salary"
              {...register("salary_weekly_salary")}
              readOnly
              className="bg-muted/30"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Calculado (diario × 7)
            </p>
          </div>
          <div>
            <Label htmlFor="salary_monthly_salary">Salario mensual ($)</Label>
            <Input
              id="salary_monthly_salary"
              {...register("salary_monthly_salary")}
              readOnly
              className="bg-muted/30"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Calculado (diario × 30)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="salary_day_per_month">Días por mes</Label>
            <Input
              id="salary_day_per_month"
              type="number"
              step="0.01"
              min="0"
              {...register("salary_day_per_month")}
            />
          </div>
          <div>
            <Label htmlFor="salary_integrated_factor">
              Factor de integración
            </Label>
            <Input
              id="salary_integrated_factor"
              type="number"
              step="0.0001"
              min="0"
              {...register("salary_integrated_factor")}
            />
          </div>
          <div>
            <Label htmlFor="salary_attendance_bonus">
              Bono de asistencia ($)
            </Label>
            <Input
              id="salary_attendance_bonus"
              type="number"
              step="0.01"
              min="0"
              {...register("salary_attendance_bonus")}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary_variable_salary">Salario variable ($)</Label>
            <Input
              id="salary_variable_salary"
              type="number"
              step="0.01"
              min="0"
              {...register("salary_variable_salary")}
            />
          </div>
          <div>
            <Label htmlFor="salary_last_salary_modification">
              Última modificación salarial
            </Label>
            <Input
              id="salary_last_salary_modification"
              type="date"
              {...register("salary_last_salary_modification")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
