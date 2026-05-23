import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTITY_OPTIONS, ACTION_OPTIONS, type AuditAction } from "../types";

interface AuditLogFiltersProps {
  entity: string | null;
  action: AuditAction | null;
  username: string;
  startDate: string | null;
  endDate: string | null;
  dateError: string | null;
  onEntityChange: (value: string | null) => void;
  onActionChange: (value: AuditAction | null) => void;
  onUsernameChange: (value: string) => void;
  onStartDateChange: (value: string | null) => void;
  onEndDateChange: (value: string | null) => void;
  onApply: () => void;
  onClear: () => void;
}

export function AuditLogFilters({
  entity,
  action,
  username,
  startDate,
  endDate,
  dateError,
  onEntityChange,
  onActionChange,
  onUsernameChange,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onClear,
}: AuditLogFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-2 mb-4">
      {/* Entity select */}
      <div className="min-w-[180px]">
        <Select
          value={entity ?? ""}
          onValueChange={(val) => onEntityChange(val || null)}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Entidad" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action select */}
      <div className="min-w-[140px]">
        <Select
          value={action ?? ""}
          onValueChange={(val) =>
            onActionChange((val || null) as AuditAction | null)
          }
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Acción" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Username input */}
      <div className="min-w-[160px]">
        <Input
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Usuario"
          onKeyUp={(e) => {
            if (e.key === "Enter") onApply();
          }}
        />
      </div>

      {/* Start date */}
      <div className="min-w-[150px]">
        <Input
          type="date"
          value={startDate ?? ""}
          onChange={(e) => onStartDateChange(e.target.value || null)}
        />
      </div>

      {/* End date */}
      <div className="min-w-[150px]">
        <Input
          type="date"
          value={endDate ?? ""}
          onChange={(e) => onEndDateChange(e.target.value || null)}
        />
      </div>

      {/* Action buttons */}
      <Button onClick={onApply} className="cursor-pointer gap-1.5" size="sm">
        <Search className="h-3.5 w-3.5" />
        Filtrar
      </Button>
      {(entity || action || username || startDate || endDate) && (
        <Button
          variant="outline"
          onClick={onClear}
          className="cursor-pointer gap-1.5"
          size="sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}

      {/* Date validation error */}
      {dateError && (
        <div className="w-full text-xs text-destructive mt-1">{dateError}</div>
      )}
    </div>
  );
}
