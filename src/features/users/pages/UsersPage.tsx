import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  RefreshCw,
  UserPlus,
  Users,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useUsers } from "../hooks/useUsers";

export function UsersPage() {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    refresh,
    deleteUser,
    reactivateUser,
    activationMessage,
    clearActivationMessage,
  } = useUsers(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = useCallback((userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, deleteUser]);

  const handleReactivate = useCallback(
    async (userId: string) => {
      try {
        await reactivateUser(userId);
      } catch {
        // Error handled in hook
      }
    },
    [reactivateUser],
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-heading font-semibold text-foreground">
            Usuarios
          </h1>
          <p className="text-xs text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Button
          onClick={() => navigate("/users/new")}
          className="cursor-pointer gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Activation message banner */}
      {activationMessage && (
        <div
          className={`flex items-center gap-2 p-3 mb-4 rounded-lg border text-sm ${
            activationMessage.severity === "warn"
              ? "bg-amber/10 border-amber/30 text-amber-700 dark:text-amber-400"
              : "bg-emerald/10 border-emerald/30 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{activationMessage.text}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={clearActivationMessage}
            className="cursor-pointer"
          >
            <span className="sr-only">Cerrar</span>
            <span aria-hidden="true">&times;</span>
          </Button>
        </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario o rol..."
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={refresh}
          className="cursor-pointer"
          title="Recargar"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-b from-muted/40 to-muted/20 border-b-2 border-border/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Usuario
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rol
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jefe Directo
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/40 last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        {search
                          ? "No se encontraron usuarios con ese criterio"
                          : "No hay usuarios registrados"}
                      </p>
                      {!search && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/users/new")}
                          className="cursor-pointer gap-1.5 mt-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Crear primer usuario
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="text-xs font-medium gap-1"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {user.supervisor_name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                        className={`text-xs font-medium ${
                          user.isActive
                            ? "bg-emerald/10 text-emerald-700 dark:text-emerald-400 border-emerald/30"
                            : "bg-muted text-muted-foreground border-border/50"
                        }`}
                      >
                        {user.isActive ? "ACTIVO" : "INACTIVO"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[140px]"
                        >
                          <DropdownMenuItem
                            onClick={() => navigate(`/users/${user._id}/edit`)}
                            className="cursor-pointer gap-2"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </DropdownMenuItem>
                          {user.isActive ? (
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(user._id)}
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Desactivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleReactivate(user._id)}
                              className="cursor-pointer gap-2 text-emerald-600 focus:text-emerald-600"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} de{" "}
              {total} usuarios
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-xs text-muted-foreground">
                        ...
                      </span>
                    )}
                    <Button
                      variant={p === page ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => setPage(p)}
                      className={`cursor-pointer text-xs ${
                        p === page ? "h-7 min-w-7" : "h-7 min-w-7"
                      }`}
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        dismissible={false}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desactivar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas desactivar este usuario? El usuario
              perderá acceso al sistema hasta que sea reactivado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="cursor-pointer gap-1.5"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Desactivando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Desactivar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
