import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  AlertTriangle,
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

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Empleados", icon: Users },
  { to: "/attendance", label: "Asistencia", icon: Calendar },
  { to: "/reports", label: "Reportes", icon: FileText },
  { to: "/settings", label: "Configuración", icon: Settings },
];

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

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-white/10 bg-gradient-to-b from-[#1a3a3a] to-[#0f2a2a] transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <span className="animate-fade-in text-sm font-semibold tracking-tight text-teal-100">
            {APP_NAME}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="cursor-pointer text-teal-300 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/15 text-white shadow-[inset_3px_0_0_0] shadow-teal-300"
                    : "text-teal-200/70 hover:bg-white/10 hover:text-white",
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
                            ? "bg-white/15 text-white shadow-[inset_3px_0_0_0] shadow-teal-300"
                            : "text-teal-200/70 hover:bg-white/10 hover:text-white",
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
      </nav>

      <Separator className="bg-white/10" />

      {/* User info */}
      <div className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-teal-300/30">
            <AvatarFallback className="bg-teal-700 text-xs text-teal-100">
              {initials}
            </AvatarFallback>
            <AvatarBadge className="bg-emerald-400" />
          </Avatar>
          {!collapsed && (
            <div className="flex-1 truncate animate-fade-in">
              <p className="text-sm font-medium text-teal-100">{user?.name}</p>
              <p className="text-xs text-teal-200/60 capitalize">
                {user?.role}
              </p>
            </div>
          )}

          {/* Logout with confirmation dialog */}
          <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer shrink-0 text-teal-300 hover:bg-white/10 hover:text-white"
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
      </div>
    </aside>
  );
}
