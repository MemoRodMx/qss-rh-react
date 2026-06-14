import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  AlertTriangle,
  BookOpen,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  UserCog,
  Shield,
  Warehouse,
  Briefcase,
  ListChecks,
} from "lucide-react";

import { useAuth } from "@/features/auth/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Empleados", icon: Users },
  { to: "/customers", label: "Clientes", icon: Building2 },
  { to: "/companies", label: "Empresas", icon: Building2 },
  { to: "/vacation-requests", label: "Vacaciones", icon: CalendarDays },
  { to: "/rest-roles", label: "Roles de Descanso", icon: ListChecks },
  { to: "/attendance", label: "Asistencia", icon: Calendar },
  { to: "/users", label: "Usuarios", icon: UserCog },
  { to: "/audit-logs", label: "Auditoría", icon: Shield },
  { to: "/reports", label: "Reportes", icon: FileText },
  { to: "/settings", label: "Configuración", icon: Settings },
];

const catalogItems = [
  { to: "/catalogs/states", label: "Estados", icon: MapPin },
  { to: "/catalogs/cities", label: "Ciudades", icon: MapPin },
  { to: "/catalogs/zipcodes", label: "Códigos Postales", icon: MapPin },
  { to: "/catalogs/colonies", label: "Colonias", icon: MapPin },
  {
    to: "/catalogs/public-holidays",
    label: "Días Festivos",
    icon: CalendarDays,
  },
  {
    to: "/catalogs/payroll-calendars",
    label: "Calendario Nómina",
    icon: CalendarDays,
  },
  { to: "/catalogs/shifts-schedules", label: "Turnos y Horarios", icon: Clock },
  { to: "/catalogs/workday-types", label: "Tipos de Jornada", icon: Briefcase },
  { to: "/catalogs/plants", label: "Plantas", icon: Warehouse },
  { to: "/catalogs/direct-supervisors", label: "Jefes Directos", icon: UserCog },
];

const roleConfig: Record<
  string,
  { label: string; variant: "teal" | "success" | "warning" | "default" }
> = {
  System: { label: "Sistema", variant: "teal" },
  Admin: { label: "Admin", variant: "success" },
  User: { label: "Usuario", variant: "warning" },
};

function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role] ?? {
    label: role,
    variant: "default" as const,
  };
  return (
    <Badge
      variant={config.variant}
      className="cursor-default text-[10px] leading-none px-1.5 py-0.5 text-white"
    >
      {config.label}
    </Badge>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    setLogoutDialogOpen(false);
    logout();
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-[hsl(var(--sidebar-border))] bg-gradient-to-b from-[hsl(var(--sidebar-bg))] to-[hsl(var(--sidebar-surface))] transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <span className="animate-fade-in text-sm font-semibold tracking-tight text-[hsl(var(--teal)_/_0.9)]">
            {APP_NAME}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="cursor-pointer text-[hsl(var(--teal)_/_0.85)] hover:bg-[hsl(var(--sidebar-border))] hover:text-white"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <Separator className="bg-[hsl(var(--sidebar-border))]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          // Skip audit-logs for non-System users
          if (item.to === "/audit-logs" && user?.role !== "System") {
            return null;
          }
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[hsl(var(--sidebar-border))] text-white shadow-[inset_3px_0_0_0] shadow-[hsl(var(--teal)_/_0.8)]"
                    : "text-[hsl(var(--teal)_/_0.8)] hover:bg-[hsl(var(--sidebar-border))] hover:text-white",
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger
                  render={
                    <NavLink
                      to={item.to}
                      className={({ isActive }: { isActive: boolean }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-[hsl(var(--sidebar-border))] text-white shadow-[inset_3px_0_0_0] shadow-[hsl(var(--teal)_/_0.8)]"
                            : "text-[hsl(var(--teal)_/_0.8)] hover:bg-[hsl(var(--sidebar-border))] hover:text-white",
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                    </NavLink>
                  }
                />
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}

        {/* ── Catálogos section ──────────────────────────────────────────── */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 text-[hsl(var(--teal)_/_0.8)] hover:bg-[hsl(var(--sidebar-border))] hover:text-white cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                </button>
              }
            />
            <TooltipContent side="right" sideOffset={8}>
              Catálogos
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setCatalogOpen(!catalogOpen)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                catalogOpen
                  ? "bg-[hsl(var(--sidebar-border))] text-white"
                  : "text-[hsl(var(--teal)_/_0.8)] hover:bg-[hsl(var(--sidebar-border))] hover:text-white",
              )}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Catálogos</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  catalogOpen && "rotate-180",
                )}
              />
            </button>

            {catalogOpen && (
              <div className="ml-2 space-y-0.5 border-l border-[hsl(var(--sidebar-border))] pl-2">
                {catalogItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                        isActive
                          ? "bg-[hsl(var(--sidebar-border))] text-white"
                          : "text-[hsl(var(--teal)_/_0.65)] hover:bg-[hsl(var(--sidebar-border))] hover:text-white",
                      )
                    }
                  >
                    <item.icon className="h-3 w-3 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </>
        )}
      </nav>

      <Separator className="bg-[hsl(var(--sidebar-border))]" />

      {/* User info */}
      <div
        className={cn("bg-[hsl(var(--sidebar-bg))]", collapsed ? "p-2" : "p-3")}
      >
        {collapsed ? (
          /* ── Collapsed: tooltip on avatar ─────────────────────────── */
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center justify-center">
                  <Avatar className="h-9 w-9 ring-2 ring-[hsl(var(--teal)_/_0.3)]">
                    <AvatarFallback className="bg-[hsl(var(--sidebar-border))] text-xs text-[hsl(var(--teal)_/_0.9)]">
                      {initials}
                    </AvatarFallback>
                    <AvatarBadge className="bg-emerald-400" />
                  </Avatar>
                </div>
              }
            />
            <TooltipContent side="right" sideOffset={8} className="space-y-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">@{user?.username}</p>
              <RoleBadge role={user?.role ?? ""} />
            </TooltipContent>
          </Tooltip>
        ) : (
          /* ── Expanded: full user card ─────────────────────────────── */
          <div className="flex items-center gap-3 animate-fade-in">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-[hsl(var(--teal)_/_0.3)] ring-offset-2 ring-offset-[hsl(var(--sidebar-surface))]">
              <AvatarFallback className="bg-[hsl(var(--sidebar-border))] text-sm font-semibold text-[hsl(var(--teal)_/_0.9)]">
                {initials}
              </AvatarFallback>
              <AvatarBadge className="bg-emerald-400" />
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-[hsl(var(--teal)_/_0.9)] leading-tight">
                {user?.name}
              </p>
              <p className="truncate text-xs text-[hsl(var(--teal))] leading-tight">
                @{user?.username}
              </p>
              <div className="mt-1">
                <RoleBadge role={user?.role ?? ""} />
              </div>
            </div>

            {/* Logout with confirmation dialog */}
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer shrink-0 text-[hsl(var(--teal)_/_0.85)] hover:bg-[hsl(var(--sidebar-border))] hover:text-white"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <DialogTitle className="text-center">
                    ¿Cerrar sesión?
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Estás a punto de cerrar tu sesión actual. ¿Deseas continuar?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setLogoutDialogOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    Cerrar sesión
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </aside>
  );
}
