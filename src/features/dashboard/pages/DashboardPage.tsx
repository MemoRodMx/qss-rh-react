import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "../components/StatCard";
import { dashboardService } from "../services/dashboardService";
import type { DashboardStats } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const defaultStats: DashboardStats = {
  total_employees: 0,
  active_employees: 0,
  on_leave: 0,
  new_hires_this_month: 0,
  attendance_rate: 0,
  pending_requests: 0,
};

const DONUT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--chart-3))",
];

const BAR_COLORS = {
  active: "hsl(var(--primary))",
  on_leave: "hsl(var(--accent))",
  pending: "hsl(var(--muted-foreground))",
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch(() => {
        // Fallback to defaults on error
      })
      .finally(() => setIsLoading(false));
  }, []);

  const workforceData = useMemo(
    () => [
      { name: "Activos", value: stats.active_employees },
      { name: "De baja", value: stats.on_leave },
      {
        name: "Solicitudes pendientes",
        value: stats.pending_requests,
      },
    ],
    [stats],
  );

  const barData = useMemo(
    () => [
      { name: "Activos", value: stats.active_employees, fill: BAR_COLORS.active },
      { name: "De baja", value: stats.on_leave, fill: BAR_COLORS.on_leave },
      {
        name: "Pendientes",
        value: stats.pending_requests,
        fill: BAR_COLORS.pending,
      },
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
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-accent">
            {greeting}
          </p>
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

      {/* ── Stat Cards ────────────────────────────────────────────── */}
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
          trend={{ value: 5, positive: true }}
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
          trend={{ value: 2, positive: true }}
        />
        <StatCard
          title="Solicitudes Pendientes"
          value={stats.pending_requests}
          icon={Clock}
          description="Vacaciones, permisos, etc."
        />
      </div>

      {/* ── Charts ────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workforce distribution */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
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
                  formatter={(value) => [`${value}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6">
              {workforceData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length],
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

        {/* Bar comparison */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-medium">
              Comparativo general
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  cursor={{ fill: "hsl(var(--primary) / 0.06)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
