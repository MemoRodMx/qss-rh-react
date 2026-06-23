import { useState } from "react";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { FloatLabelDateInput } from "@/components/ui/float-label-date-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { SectionTitle } from "../shared/SectionTitle";
import {
  SALARY_TYPE_OPTIONS,
  ZONE_OPTIONS,
  PAYMENT_WAY_OPTIONS,
} from "../../types";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";
import { SalaryHistoryDialog } from "../SalaryHistoryDialog";

type Props = Pick<
  EmployeeFormShellProps,
  "register" | "setValue" | "watch" | "isEditMode"
>;

export function SalaryTab({ register, setValue, watch, isEditMode }: Props) {
  const watchedSalaryType = watch("salary_salary_type");
  const watchedZone = watch("salary_zone");
  const watchedPaymentWay = watch("salary_payment_way");
  const watchedIsCustomized = watch("salary_is_customized");
  const watchedLastSalaryMod = watch("salary_last_salary_modification");

  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Clasificación salarial</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FloatLabelSelect
              id="salary_salary_type"
              label="Tipo de salario"
              value={watchedSalaryType}
              hasValue={!!watchedSalaryType}
              onValueChange={(val) => setValue("salary_salary_type", val ?? "")}
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  SALARY_TYPE_OPTIONS.find((s) => s.value === value)?.label ??
                  value
                );
              }}
            >
              {SALARY_TYPE_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelSelect
              id="salary_zone"
              label="Zona"
              value={watchedZone}
              hasValue={!!watchedZone}
              onValueChange={(val) => setValue("salary_zone", val ?? "")}
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  ZONE_OPTIONS.find((z) => z.value === value)?.label ?? value
                );
              }}
            >
              {ZONE_OPTIONS.map((z) => (
                <SelectItem key={z.value} value={z.value}>
                  {z.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelSelect
              id="salary_payment_way"
              label="Forma de pago"
              value={watchedPaymentWay}
              hasValue={!!watchedPaymentWay}
              onValueChange={(val) => setValue("salary_payment_way", val ?? "")}
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  PAYMENT_WAY_OPTIONS.find((p) => p.value === value)?.label ??
                  value
                );
              }}
            >
              {PAYMENT_WAY_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Importes</SectionTitle>
          {isEditMode && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer h-7 text-xs gap-1"
              onClick={() => setHistoryOpen(true)}
            >
              <Clock className="h-3.5 w-3.5" />
              Histórico de salario
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="salary_is_customized"
            checked={watchedIsCustomized}
            onCheckedChange={(checked) => {
              setValue("salary_is_customized", !!checked);
            }}
          />
          <label
            htmlFor="salary_is_customized"
            className="text-sm cursor-pointer select-none"
          >
            Personalizar salario
          </label>
          {watchedIsCustomized ? (
            <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600">
              Personalizado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-600">
              Óptimo contratado
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <FloatLabelInput
              id="salary_daily_salary"
              label="Salario diario ($)"
              type="number"
              step="0.01"
              min="0"
              disabled={!watchedIsCustomized}
              {...register("salary_daily_salary")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="salary_weekly_salary"
              label="Salario semanal ($)"
              {...register("salary_weekly_salary")}
              readOnly
              className="bg-muted/30"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Calculado (diario × 7)
            </p>
          </div>
          <div>
            <FloatLabelInput
              id="salary_monthly_salary"
              label="Salario mensual ($)"
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
            <FloatLabelInput
              id="salary_day_per_month"
              label="Días por mes"
              type="number"
              step="0.01"
              min="0"
              {...register("salary_day_per_month")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="salary_integrated_factor"
              label="Factor de integración"
              type="number"
              step="0.0001"
              min="0"
              {...register("salary_integrated_factor")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="salary_attendance_bonus"
              label="Bono de asistencia ($)"
              type="number"
              step="0.01"
              min="0"
              disabled={!watchedIsCustomized}
              {...register("salary_attendance_bonus")}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatLabelInput
              id="salary_variable_salary"
              label="Salario variable ($)"
              type="number"
              step="0.01"
              min="0"
              {...register("salary_variable_salary")}
            />
          </div>
          <div>
            <FloatLabelDateInput
              id="salary_last_salary_modification"
              label="Última modificación salarial"
              value={watchedLastSalaryMod}
              onChange={(val) =>
                setValue("salary_last_salary_modification", val, {
                  shouldValidate: true,
                })
              }
            />
          </div>
        </div>
      </div>

      {isEditMode && (
        <SalaryHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          employeeNumber={watch("employee_number") as string}
        />
      )}
    </div>
  );
}
