import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditLogEmptyState } from "./AuditLogEmptyState";
import { ACTION_LABEL, ACTION_BADGE_CLASSES, type AuditLog } from "../types";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  hasFilters: boolean;
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

export function AuditLogTable({
  logs,
  isLoading,
  total,
  page,
  totalPages,
  hasFilters,
  onViewDetail,
  onPageChange,
}: AuditLogTableProps) {
  return (
    <div className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-b from-muted/40 to-muted/20 border-b-2 border-border/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[140px]">
                Fecha / Hora
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[130px]">
                Entidad
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">
                Acción
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[180px]">
                ID Entidad
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[200px]">
                Endpoint
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[140px]">
                Usuario
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[110px]">
                IP
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[60px]">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-36" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                  </td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <AuditLogEmptyState hasFilters={hasFilters} />
            ) : (
              logs.map((log) => (
                <tr
                  key={log._id}
                  className="border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs">{log.entity}</code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium border ${ACTION_BADGE_CLASSES[log.action] ?? "bg-muted text-muted-foreground border-border/50"}`}
                    >
                      {ACTION_LABEL[log.action] ?? log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-muted-foreground break-all">
                      {log.entity_id}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs">{log.endpoint}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold m-0">
                        {log.changed_by.username}
                      </p>
                      <p className="text-xs text-muted-foreground m-0">
                        {log.changed_by.role}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {log.ip_address}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onViewDetail(log)}
                      className="cursor-pointer"
                      title="Ver detalle"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Mostrando {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} de{" "}
            {total} registros
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-xs text-muted-foreground">
                      ...
                    </span>
                  )}
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => onPageChange(p)}
                    className={`cursor-pointer text-xs ${
                      p === page ? "h-7 min-w-7" : "h-7 min-w-7"
                    }`}
                  >
                    {p}
                  </Button>
                </span>
              ))}
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
        </div>
      )}
    </div>
  );
}
