import { User, Globe, Code, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ACTION_LABEL, ACTION_BADGE_CLASSES, type AuditLog } from "../types";

interface AuditLogMobileCardsProps {
  logs: AuditLog[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onViewDetail: (log: AuditLog) => void;
  onPageChange: (page: number) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AuditLogMobileCards({
  logs,
  isLoading,
  page,
  totalPages,
  onViewDetail,
  onPageChange,
}: AuditLogMobileCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-1)] p-4"
          >
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-3 w-48" />
          </Card>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <Code className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Sin registros de auditoría
        </p>
        <p className="text-xs text-muted-foreground/60">
          Ajusta los filtros para buscar eventos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <Card
          key={log._id}
          className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-1)] p-4 cursor-pointer hover:shadow-[var(--shadow-2)] hover:-translate-y-0.5 transition-all duration-200"
          onClick={() => onViewDetail(log)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {log.entity}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(log.createdAt)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-medium border ${ACTION_BADGE_CLASSES[log.action] ?? "bg-muted text-muted-foreground border-border/50"}`}
            >
              {ACTION_LABEL[log.action] ?? log.action}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span>{log.changed_by.username}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3 shrink-0" />
              <span>{log.ip_address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Code className="h-3 w-3 shrink-0" />
              <code className="text-xs">{log.endpoint}</code>
            </div>
          </div>
        </Card>
      ))}

      {/* Mobile pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-3">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
