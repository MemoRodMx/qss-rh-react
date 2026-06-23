import { useState, Fragment } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building,
  BriefcaseBusiness,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Users,
  UserCog,
  Shield,
  ListChecks,
} from "lucide-react";

import { useAuth } from "@/features/auth/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
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

const navSections = [
  {
    label: "Principal",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/employees", label: "Empleados", icon: Users },
      // { to: "/attendance", label: "Asistencia", icon: Calendar },
      // { to: "/vacation-requests", label: "Vacaciones", icon: CalendarDays },
      { to: "/rest-roles", label: "Roles de Descanso", icon: ListChecks },
    ],
  },
  {
    label: "Organizaciones",
    items: [
      { to: "/companies", label: "Empresas", icon: Building },
      { to: "/customers", label: "Clientes", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Reportes",
    items: [
      { to: "/reports", label: "Reportes", icon: FileText },
      { to: "/audit-logs", label: "Auditoría", icon: Shield },
    ],
  },
  {
    label: "Sistema",
    items: [
      { to: "/users", label: "Usuarios", icon: UserCog },
      { to: "/settings", label: "Configuración", icon: Settings },
    ],
  },
  {
    label: "Catálogos",
    items: [{ to: "/catalogs", label: "Catálogos", icon: BookOpen }],
  },
];

const roleConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  System: { label: "Sistema", variant: "default" },
  Admin: { label: "Admin", variant: "secondary" },
  User: { label: "Usuario", variant: "outline" },
};

function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role] ?? {
    label: role,
    variant: "default" as const,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
        config.variant === "default" &&
          "bg-[hsl(var(--sidebar-accent)_/_0.15)] text-[hsl(var(--sidebar-accent))]",
        config.variant === "secondary" && "bg-emerald-500/15 text-emerald-400",
        config.variant === "outline" &&
          "bg-[hsl(var(--sidebar-text)_/_0.08)] text-[hsl(var(--sidebar-muted))]",
      )}
    >
      {config.label}
    </span>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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

  const navLinkClasses = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-[hsl(var(--sidebar-accent)_/_0.10)] text-[hsl(var(--sidebar-text))] shadow-[inset_3px_0_0_0] shadow-[hsl(var(--sidebar-accent)_/_0.8)]"
        : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-border))] hover:text-[hsl(var(--sidebar-text))]",
    );

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-[hsl(var(--sidebar-border)_/_0.6)] bg-gradient-to-b from-[hsl(var(--sidebar-bg))] to-[hsl(var(--sidebar-surface))] transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <span className="animate-fade-in text-sm font-semibold tracking-tight text-[hsl(var(--sidebar-text))]">
            {APP_NAME}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="cursor-pointer text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-border))] hover:text-[hsl(var(--sidebar-text))]"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <Separator className="bg-[hsl(var(--sidebar-border)_/_0.4)]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <Fragment key={sectionIdx}>
            {sectionIdx > 0 && (
              <Separator className="my-2 bg-[hsl(var(--sidebar-border)_/_0.3)]" />
            )}
            {!collapsed && (
              <span className="mt-1 block px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-muted)_/_0.45)]">
                {section.label}
              </span>
            )}
            {section.items.map((item) => {
              if (item.to === "/audit-logs" && user?.role !== "System") {
                return null;
              }

              if (collapsed) {
                return (
                  <Tooltip key={item.to}>
                    <TooltipTrigger
                      render={
                        <NavLink
                          to={item.to}
                          className={({ isActive }: { isActive: boolean }) =>
                            navLinkClasses(isActive)
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

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navLinkClasses(isActive)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </Fragment>
        ))}
      </nav>

      <Separator className="bg-[hsl(var(--sidebar-border)_/_0.4)]" />

      {/* User info */}
      <div
        className={cn("bg-[hsl(var(--sidebar-bg))]", collapsed ? "p-2" : "p-3")}
      >
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center justify-center">
                  <Avatar className="h-9 w-9 ring-2 ring-[hsl(var(--sidebar-accent)_/_0.2)]">
                    <AvatarFallback className="bg-[hsl(var(--sidebar-border))] text-xs text-[hsl(var(--sidebar-text))]">
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
          <div className="flex items-center gap-3 animate-fade-in">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-[hsl(var(--sidebar-accent)_/_0.2)] ring-offset-2 ring-offset-[hsl(var(--sidebar-surface))]">
              <AvatarFallback className="bg-[hsl(var(--sidebar-border))] text-sm font-semibold text-[hsl(var(--sidebar-text))]">
                {initials}
              </AvatarFallback>
              <AvatarBadge className="bg-emerald-400" />
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-[hsl(var(--sidebar-text))] leading-tight">
                {user?.name}
              </p>
              <p className="truncate text-xs text-[hsl(var(--sidebar-muted))] leading-tight">
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
                    className="cursor-pointer shrink-0 text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-border))] hover:text-[hsl(var(--sidebar-text))]"
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
