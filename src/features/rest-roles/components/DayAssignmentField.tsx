import { DAY_NAMES } from "../types";
import { EmployeeSearchInput } from "./EmployeeSearchInput";
import { Label } from "@/components/ui/label";

interface DayAssignmentFieldProps {
  days: Record<string, string[]>;
  onChange: (days: Record<string, string[]>) => void;
  plantId?: string;
  plantCode?: string;
  shiftId?: string;
  positionIds?: string[];
  disabled?: boolean;
  errors?: Record<string, string | undefined>;
}

export function DayAssignmentField({
  days,
  onChange,
  plantId,
  plantCode,
  shiftId,
  positionIds,
  disabled = false,
  errors,
}: DayAssignmentFieldProps) {
  const handleDayChange = (dayKey: string, employeeNumbers: string[]) => {
    onChange({ ...days, [dayKey]: employeeNumbers });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Asignación de empleados por día
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAY_NAMES.map((day) => {
          const dayEmployees = days[day.key] ?? [];
          const errorKey = `days.${day.key}`;
          const fieldError = errors?.[errorKey];

          return (
            <div
              key={day.key}
              className="rounded-xl border border-border/50 bg-card shadow-[var(--shadow-1)] p-4 space-y-2"
            >
              <Label className="text-sm font-medium text-foreground">
                {day.label}
              </Label>
              <EmployeeSearchInput
                value={dayEmployees}
                onChange={(empNumbers) => handleDayChange(day.key, empNumbers)}
                plantId={plantId}
                plantCode={plantCode}
                shiftId={shiftId}
                positionIds={positionIds}
                disabled={disabled}
                placeholder={`Buscar empleados para ${day.label.toLowerCase()}...`}
              />
              {fieldError && (
                <p className="mt-1 text-xs text-destructive">{fieldError}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
