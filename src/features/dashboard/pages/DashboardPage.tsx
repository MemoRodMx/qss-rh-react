import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  CalendarCheck,
  Clock,
  Plus,
  LogIn,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "../components/StatCard";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DONUT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
];


export function DashboardPage() {
  const { stats, isLoading, error, hasData, refresh } = useDashboardStats();
  const navigate = useNavigate();

  const workforceData = useMemo(
    () => [
      { name: "Activos", value: stats?.active_employees ?? 0 },
      { name: "De baja", value: stats?.on_leave ?? 0 },
    ],
    [stats],
  );

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Buenos días"
      : today.getHours() < 18
        ? "Buenas tardes"
        : "Buenas noches";

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-accent">{greeting}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen general de la empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={refresh}
            className="cursor-pointer"
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4", isLoading && "animate-spin")}
            />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/attendance")}
            className="cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            Registrar asistencia
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/employees/new")}
            className="cursor-pointer btn-primary-action"
          >
            <Plus className="h-4 w-4" />
            Nuevo empleado
          </Button>
        </div>
      </div>

      {/* ── Error State ───────────────────────────────────────── */}
      {error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
          <BarChart3 className="h-10 w-10 text-destructive/60" />
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={refresh}
            className="cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </Button>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────── */}
      {!error && !hasData && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-card px-6 py-12 text-center shadow-[var(--shadow-1)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <BarChart3 className="h-7 w-7 text-primary/60" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Sin datos disponibles
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Aún no hay información registrada en el sistema. Agrega empleados y
            registros de asistencia para comenzar a ver estadísticas.
          </p>
        </div>
      )}

      {/* ── Data Content ──────────────────────────────────────── */}
      {!error && hasData && stats && (
        <>
          {/* Stat Cards */}
          <div className="stagger-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <StatCard
              title="Total Empleados"
              value={stats.total_employees}
              icon={Users}
              description="Plantilla completa"
            />
            <StatCard
              title="Activos"
              value={stats.active_employees}
              icon={UserCheck}
              description="Empleados activos"
            />
            <StatCard
              title="De Baja / Vacaciones"
              value={stats.on_leave}
              icon={UserX}
              description="Temporalmente inactivos"
            />
            <StatCard
              title="Nuevos este mes"
              value={stats.new_hires_this_month}
              icon={TrendingUp}
              description="Contrataciones recientes"
            />
            <StatCard
              title="Asistencia"
              value={`${stats.attendance_rate}%`}
              icon={CalendarCheck}
              description="Tasa de asistencia general"
            />
            <StatCard
              title="Solicitudes Pendientes"
              value={stats.pending_requests}
              icon={Clock}
              description="Vacaciones, permisos, etc."
            />
          </div>

          {/* Charts */}
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] max-w-lg">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-medium">
                Distribución de personal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={workforceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {workforceData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        className="transition-opacity duration-200 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(value, name) => [`${value}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center gap-6">
                {workforceData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          DONUT_COLORS[index % DONUT_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
