import { FileText } from "lucide-react";

export function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-card px-6 py-16 text-center shadow-[var(--shadow-1)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
        <FileText className="h-7 w-7 text-accent/60" />
      </div>
      <p className="text-sm font-medium text-foreground">
        Módulo de Reportes
      </p>
      <p className="text-xs text-muted-foreground max-w-sm">
        Esta sección estará disponible próximamente. Aquí podrás generar y
        visualizar reportes detallados del sistema.
      </p>
    </div>
  );
}
