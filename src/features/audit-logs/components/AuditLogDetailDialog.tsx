import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JsonDiffViewer } from "./JsonDiffViewer";
import { ACTION_LABEL, type AuditLog } from "../types";

interface AuditLogDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function AuditLogDetailDialog({
  log,
  open,
  onOpenChange,
}: AuditLogDetailDialogProps) {
  if (!log) return null;

  const actionLabel = ACTION_LABEL[log.action] ?? log.action;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalle — {actionLabel} en {log.entity}
          </DialogTitle>
        </DialogHeader>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground m-0">Fecha</p>
            <p className="text-sm font-medium m-0">
              {formatDate(log.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground m-0">Entidad</p>
            <code className="text-sm">{log.entity}</code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground m-0">ID</p>
            <code className="text-xs break-all">{log.entity_id}</code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground m-0">Endpoint</p>
            <code className="text-xs">{log.endpoint}</code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground m-0">Usuario</p>
            <p className="text-sm m-0">
              {log.changed_by.username}{" "}
              <span className="text-muted-foreground">
                ({log.changed_by.role})
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground m-0">IP</p>
            <p className="text-sm m-0">{log.ip_address}</p>
          </div>
        </div>

        {/* JSON diff */}
        <JsonDiffViewer before={log.before} after={log.after} />
      </DialogContent>
    </Dialog>
  );
}
