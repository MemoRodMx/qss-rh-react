import { Shield } from "lucide-react";

interface AuditLogEmptyStateProps {
  hasFilters: boolean;
}

export function AuditLogEmptyState({ hasFilters }: AuditLogEmptyStateProps) {
  return (
    <tr>
      <td colSpan={8} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <Shield className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? "No se encontraron registros con esos filtros"
              : "Sin registros de auditoría"}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {hasFilters
              ? "Ajusta los filtros para buscar eventos específicos."
              : "No hay eventos registrados en el sistema."}
          </p>
        </div>
      </td>
    </tr>
  );
}
