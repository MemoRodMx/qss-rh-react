import { Badge } from "@/components/ui/badge";

interface AttendanceSummaryBarProps {
  presenteCount: number;
  ausenteCount: number;
  vacacionesCount: number;
}

export function AttendanceSummaryBar({
  presenteCount,
  ausenteCount,
  vacacionesCount,
}: AttendanceSummaryBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="success" className="cursor-pointer text-[10px]">
        ✓ {presenteCount} Presente{presenteCount !== 1 ? "s" : ""}
      </Badge>
      <Badge variant="destructive" className="cursor-pointer text-[10px]">
        ✗ {ausenteCount} Ausente{ausenteCount !== 1 ? "s" : ""}
      </Badge>
      <Badge variant="default" className="cursor-pointer text-[10px]">
        ⊘ {vacacionesCount} Vacacione{vacacionesCount !== 1 ? "s" : ""}
      </Badge>
    </div>
  );
}
