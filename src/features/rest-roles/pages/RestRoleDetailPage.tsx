import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { restRoleService } from "../services/restRoleService";
import {
  DAY_NAMES_MAP,
  STATUS_SEVERITY,
  STATUS_LABELS,
  type RestRole,
} from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CalendarCheck,
  AlertTriangle,
  User,
  Building2,
  Clock,
  Calendar,
  ClipboardCheck,
  History,
  RefreshCw,
} from "lucide-react";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-MX", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function RestRoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [role, setRole] = useState<RestRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  // Reopen dialog
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await restRoleService.getById(id!);
        if (!cancelled) setRole(data);
      } catch {
        if (!cancelled) setServerError("Error al cargar el rol de descanso");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleReopen = async () => {
    if (!id) return;
    setIsReopening(true);
    try {
      await restRoleService.reopen(id);
      // Reload the role data
      const data = await restRoleService.getById(id);
      setRole(data);
      setReopenDialogOpen(false);
    } catch {
      setServerError("Error al devolver a revisión");
    } finally {
      setIsReopening(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => navigate("/rest-roles")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Rol no encontrado
          </h1>
        </div>
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
            <p className="text-muted-foreground">
              El rol de descanso solicitado no existe o fue eliminado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => navigate("/rest-roles")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Detalle del rol de descanso
              </h1>
              <Badge
                variant={STATUS_SEVERITY[role.status] || "secondary"}
                className="capitalize cursor-pointer"
              >
                {STATUS_LABELS[role.status] || role.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {role.plant_name || role.plant_id} —{" "}
              {role.shift_name || role.shift_id} · Semana {role.week},{" "}
              {role.year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role.status !== "PENDIENTE DE REVISION" && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => setReopenDialogOpen(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Devolver a revisión
            </Button>
          )}
          {role.status === "PENDIENTE DE REVISION" && (
            <Button
              variant="teal"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => navigate(`/rest-roles/${id}/review`)}
            >
              <ClipboardCheck className="h-4 w-4" />
              Revisar
            </Button>
          )}
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── General Info ──────────────────────────────────────────────────── */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Información general
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Planta</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {role.plant_name || role.plant_id}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Turno</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {role.shift_name || role.shift_id}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Semana / Año</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Semana {role.week}, {role.year}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Supervisor</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {role.supervisor_name || role.supervisor_id}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Creado por</p>
              <p className="text-sm text-foreground">
                {role.creator_username || "—"}
              </p>
            </div>
            {role.reviewer_username && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Revisado por
                </p>
                <p className="text-sm text-foreground">
                  {role.reviewer_username}
                </p>
              </div>
            )}
            {role.reviewed_at && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Fecha de revisión
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(role.reviewed_at)}
                </p>
              </div>
            )}
            {role.review_notes && (
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Notas de revisión
                </p>
                <p className="text-sm text-foreground bg-muted/30 rounded-lg p-3">
                  {role.review_notes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Day Assignments ───────────────────────────────────────────────── */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-primary" />
            Asignación de empleados por día
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {role.days.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay empleados asignados.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {role.days.map((day) => (
                <div
                  key={day.day_name}
                  className="rounded-xl border border-border/50 bg-card shadow-[var(--shadow-1)] p-4"
                >
                  <p className="text-sm font-medium text-foreground mb-2">
                    {DAY_NAMES_MAP[day.day_name] || day.day_name}
                  </p>
                  {day.employees.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Sin empleados asignados
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {day.employees.map((emp) => (
                        <span
                          key={emp.number}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-1"
                        >
                          {emp.number} - {emp.full_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Status History ────────────────────────────────────────────────── */}
      {role.status_log && role.status_log.length > 0 && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4 text-primary" />
              Historial de cambios
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {role.status_log.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={STATUS_SEVERITY[entry.status] || "secondary"}
                        className="capitalize cursor-pointer text-[10px]"
                      >
                        {STATUS_LABELS[entry.status] || entry.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        por {entry.changed_by_username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.changed_at)}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reopen confirmation dialog */}
      <Dialog open={reopenDialogOpen} onOpenChange={setReopenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center">
              ¿Devolver a revisión?
            </DialogTitle>
            <DialogDescription className="text-center">
              El rol de descanso volverá al estado "Pendiente de revisión" para
              que pueda ser evaluado nuevamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setReopenDialogOpen(false)}
              className="cursor-pointer"
              disabled={isReopening}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReopen}
              className="cursor-pointer"
              disabled={isReopening}
            >
              {isReopening ? "Procesando..." : "Devolver a revisión"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
