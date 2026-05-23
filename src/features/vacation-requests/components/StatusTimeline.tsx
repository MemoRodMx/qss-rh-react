import { STATUS_SEVERITY, STATUS_LABELS } from "../types";
import type { VacationRequestStatusLogEntry } from "../types";
import { Badge } from "@/components/ui/badge";
import { Check, X, Plus, Pencil, Circle } from "lucide-react";

interface StatusTimelineProps {
  entries: VacationRequestStatusLogEntry[];
  showAll?: boolean;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-MX", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "ACEPTADA":
      return <Check className="h-3.5 w-3.5" />;
    case "RECHAZADA":
      return <X className="h-3.5 w-3.5" />;
    case "NUEVA":
      return <Plus className="h-3.5 w-3.5" />;
    case "CAMBIO SOLICITADO":
    case "CAMBIOS REALIZADOS":
      return <Pencil className="h-3.5 w-3.5" />;
    default:
      return <Circle className="h-3.5 w-3.5" />;
  }
}

function getStatusIconBg(status: string): string {
  switch (status) {
    case "ACEPTADA":
      return "bg-emerald-100 text-emerald-700 border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400";
    case "RECHAZADA":
      return "bg-red-100 text-red-700 border-red-500 dark:bg-red-950/30 dark:text-red-400";
    case "NUEVA":
      return "bg-blue-100 text-blue-700 border-blue-500 dark:bg-blue-950/30 dark:text-blue-400";
    case "CAMBIO SOLICITADO":
    case "CAMBIOS REALIZADOS":
      return "bg-amber-100 text-amber-700 border-amber-500 dark:bg-amber-950/30 dark:text-amber-400";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function StatusTimeline({
  entries,
  showAll = false,
}: StatusTimelineProps) {
  if (!entries || entries.length === 0) return null;

  const displayEntries = showAll
    ? [...entries].reverse()
    : [entries[entries.length - 1]];

  return (
    <div className="space-y-0">
      {displayEntries.map((entry, index) => (
        <div key={index} className="flex items-start gap-3 pb-4 last:pb-0">
          {/* Marker */}
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shrink-0 mt-0.5 ${getStatusIconBg(entry.status)}`}
          >
            {getStatusIcon(entry.status)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={STATUS_SEVERITY[entry.status] || "secondary"}
                className="capitalize cursor-pointer text-[10px]"
              >
                {STATUS_LABELS[entry.status] || entry.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(entry.changed_at)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Circle className="h-2.5 w-2.5" />
                {entry.changed_by_username}
              </span>
            </p>
            {entry.notes && (
              <p className="text-xs text-muted-foreground italic mt-1 bg-muted/30 rounded-md px-2 py-1">
                {entry.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
