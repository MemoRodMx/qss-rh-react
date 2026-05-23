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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle2,
  XCircle,
  ClipboardCheck,
} from "lucide-react";

export function RestRoleReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [role, setRole] = useState<RestRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Confirm dialogs
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAccept = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await restRoleService.review(id, {
        status: "ACEPTADA",
        notes: notes || undefined,
      });
      navigate("/rest-roles");
    } catch {
      setServerError("Error al aceptar el rol de descanso");
    } finally {
      setIsSubmitting(false);
      setAcceptDialogOpen(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await restRoleService.review(id, {
        status: "RECHAZADA",
        notes: notes || undefined,
      });
      navigate("/rest-roles");
    } catch {
      setServerError("Error al rechazar el rol de descanso");
    } finally {
      setIsSubmitting(false);
      setRejectDialogOpen(false);
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

  if (role.status !== "PENDIENTE DE REVISION") {
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
            Revisión de rol de descanso
          </h1>
        </div>
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
            <p className="text-base font-medium text-foreground mb-1">
              Este rol ya fue revisado
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Estado actual:{" "}
              <Badge
                variant={STATUS_SEVERITY[role.status] || "secondary"}
                className="capitalize cursor-pointer"
              >
                {STATUS_LABELS[role.status] || role.status}
              </Badge>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => navigate(`/rest-roles/${id}`)}
            >
              Ver detalle
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
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
              Revisar rol de descanso
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
            {role.shift_name || role.shift_id} · Semana {role.week}, {role.year}
          </p>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── General Info (read-only) ──────────────────────────────────────── */}
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
        </CardContent>
      </Card>

      {/* ── Day Assignments (read-only) ───────────────────────────────────── */}
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

      {/* ── Review Form ───────────────────────────────────────────────────── */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Decisión de revisión
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div>
            <Label htmlFor="review-notes">Notas (opcional)</Label>
            <Textarea
              id="review-notes"
              placeholder="Agrega comentarios sobre tu decisión..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="default"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => setAcceptDialogOpen(true)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Aceptar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => navigate("/rest-roles")}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accept confirmation dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center">
              ¿Aceptar rol de descanso?
            </DialogTitle>
            <DialogDescription className="text-center">
              El rol de descanso será marcado como aceptado y no podrá ser
              modificado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setAcceptDialogOpen(false)}
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleAccept}
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar aceptación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject confirmation dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">
              ¿Rechazar rol de descanso?
            </DialogTitle>
            <DialogDescription className="text-center">
              El rol de descanso será marcado como rechazado. El creador podrá
              modificarlo y enviarlo nuevamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
