import { Badge } from "@/components/ui/badge";
import { AttendanceStatus, STATUS_SEVERITY } from "../types";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
}

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  const labels: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENTE]: "Presente",
    [AttendanceStatus.AUSENTE]: "Ausente",
    [AttendanceStatus.VACACIONES]: "Vacaciones",
  };

  return (
    <Badge
      variant={STATUS_SEVERITY[status] || "secondary"}
      className="cursor-pointer text-[10px]"
    >
      {labels[status] || status}
    </Badge>
  );
}
