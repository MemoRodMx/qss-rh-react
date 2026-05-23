import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { restRoleService } from "../services/restRoleService";
import { DAY_NAMES_MAP, STATUS_LABELS } from "../types";
import type { RestRole, RestRoleStatus } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Users,
  CalendarDays,
  Building2,
  Clock,
  UserCheck,
  Calendar,
  Hash,
} from "lucide-react";

const statusVariantMap: Record<
  string,
  "warning" | "success" | "destructive" | "secondary"
> = {
  "PENDIENTE DE REVISION": "warning",
  ACEPTADA: "success",
  RECHAZADA: "destructive",
};

export function RestRoleReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<RestRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadRole = async () => {
      setIsLoading(true);
      try {
        const data = await restRoleService.getById(id);
        setRole(data);
      } catch {
        setError("Error al cargar el rol de descanso");
      } finally {
        setIsLoading(false);
      }
    };
    loadRole();
  }, [id]);

  const handleReview = async (action: "ACEPTADA" | "RECHAZADA") => {
    if (!id) return;
    setIsSubmitting(true);
    setError("");

    try {
      await restRoleService.review(id, {
        action,
        review_notes: reviewNotes.trim() || undefined,
      });
      navigate("/rest-roles");
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        apiError?.response?.data?.message || "Error al procesar la revisión",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[500px] rounded-xl" />
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
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Rol no encontrado
            </h1>
          </div>
        </div>
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
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Rol ya revisado
            </h1>
            <p className="text-sm text-muted-foreground">
              Este rol de descanso ya ha sido{" "}
              {role.status === "ACEPTADA" ? "aceptado" : "rechazado"}.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => navigate(`/rest-roles/${id}/detail`)}
        >
          Ver detalle
        </Button>
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
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Revisar Rol de Descanso
            </h1>
            <p className="text-sm text-muted-foreground">
              {role.plant_name || role.plant_id} — Semana {role.week} /{" "}
              {role.year}
            </p>
          </div>
        </div>
        <Badge
          variant={statusVariantMap[role.status] || "secondary"}
          className="capitalize cursor-pointer text-sm px-3 py-1"
        >
          {STATUS_LABELS[role.status as RestRoleStatus] || role.status}
        </Badge>
      </div>

      {/* Info card */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-primary" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Planta</p>
                <p className="text-sm font-medium text-foreground">
                  {role.plant_name || role.plant_id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Turno</p>
                <p className="text-sm font-medium text-foreground">
                  {role.shift_name || role.shift_id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jefe Directo</p>
                <p className="text-sm font-medium text-foreground">
                  {role.supervisor_name || role.supervisor_id?.name || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Año</p>
                <p className="text-sm font-medium text-foreground">
                  {role.year}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Hash className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Semana</p>
                <p className="text-sm font-medium text-foreground">
                  {role.week}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Days card */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            Empleados por Día
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {role.days?.map((day) => (
              <Card
                key={day.day_name}
                className={`border-border/50 bg-card shadow-[var(--shadow-1)] ${
                  day.employees?.length > 0
                    ? "border-l-[3px] border-l-primary"
                    : ""
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {DAY_NAMES_MAP[day.day_name] || day.day_name}
                    </span>
                    <Badge
                      variant={
                        day.employees?.length > 0 ? "secondary" : "outline"
                      }
                      className="text-[10px] cursor-pointer"
                    >
                      {day.employees?.length || 0}
                    </Badge>
                  </div>

                  {day.employees?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {day.employees.map((emp) => (
                        <Badge
                          key={emp.number}
                          variant="outline"
                          className="text-[10px] cursor-pointer"
                        >
                          {emp.full_name || emp.number}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">
                      Sin empleados asignados
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review form */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Decisión de Revisión
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="review_notes" className="text-sm font-medium">
              Notas de revisión
            </Label>
            <Textarea
              id="review_notes"
              placeholder="Agrega comentarios sobre tu decisión (opcional)..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => navigate("/rest-roles")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer gap-2"
              onClick={() => handleReview("RECHAZADA")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Rechazar
            </Button>
            <Button
              variant="teal"
              className="cursor-pointer gap-2"
              onClick={() => handleReview("ACEPTADA")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Aceptar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
