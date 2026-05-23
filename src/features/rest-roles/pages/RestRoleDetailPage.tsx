import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { restRoleService } from "../services/restRoleService";
import { DAY_NAMES_MAP, STATUS_LABELS } from "../types";
import type { RestRole, RestRoleStatus } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Building2,
  Clock,
  UserCheck,
  Calendar,
  Hash,
  RefreshCw,
} from "lucide-react";

const statusVariantMap: Record<
  string,
  "warning" | "success" | "destructive" | "secondary"
> = {
  "PENDIENTE DE REVISION": "warning",
  ACEPTADA: "success",
  RECHAZADA: "destructive",
};

export function RestRoleDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<RestRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadRole = async () => {
      setIsLoading(true);
      try {
        const data = await restRoleService.getById(id);
        setRole(data);
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    loadRole();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
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
              Detalle del Rol de Descanso
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

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <RefreshCw className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge
                  variant={statusVariantMap[role.status] || "secondary"}
                  className="capitalize cursor-pointer mt-0.5"
                >
                  {STATUS_LABELS[role.status as RestRoleStatus] || role.status}
                </Badge>
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

      {/* Status log */}
      {role.status_log && role.status_log.length > 0 && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <RefreshCw className="h-4 w-4 text-primary" />
              Historial de Estados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {role.status_log.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-border/40 last:border-0 last:pb-0"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                    <RefreshCw className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={statusVariantMap[log.status] || "secondary"}
                        className="text-[10px] cursor-pointer"
                      >
                        {STATUS_LABELS[log.status as RestRoleStatus] ||
                          log.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        por {log.changed_by_username}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.notes}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(log.changed_at).toLocaleString("es-MX", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => navigate("/rest-roles")}
        >
          Volver al listado
        </Button>
      </div>
    </div>
  );
}
