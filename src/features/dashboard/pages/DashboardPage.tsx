import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  CalendarCheck,
  Clock,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
import { dashboardService } from "../services/dashboardService";
import type { DashboardStats } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const defaultStats: DashboardStats = {
  total_employees: 0,
  active_employees: 0,
  on_leave: 0,
  new_hires_this_month: 0,
  attendance_rate: 0,
  pending_requests: 0,
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch(() => {
        // Fallback to defaults on error
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
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
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen general de la empresa
        </p>
      </div>

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
    </div>
  );
}
