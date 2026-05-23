import { Button } from "@/components/ui/button";
import { AttendanceStatus, STATUS_OPTIONS } from "../types";

interface AttendanceStatusSelectorProps {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
}

const STATUS_BUTTON_VARIANTS: Record<
  AttendanceStatus,
  "default" | "destructive" | "secondary" | "outline"
> = {
  [AttendanceStatus.PRESENTE]: "default",
  [AttendanceStatus.AUSENTE]: "destructive",
  [AttendanceStatus.VACACIONES]: "secondary",
};

export function AttendanceStatusSelector({
  value,
  onChange,
}: AttendanceStatusSelectorProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATUS_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="sm"
          variant={
            value === opt.value ? STATUS_BUTTON_VARIANTS[opt.value] : "outline"
          }
          className="cursor-pointer text-xs h-7 px-2.5"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
