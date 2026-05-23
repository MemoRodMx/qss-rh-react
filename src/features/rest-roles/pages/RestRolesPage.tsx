import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestRoles } from "../hooks/useRestRoles";
import { STATUS_LABELS } from "../types";
import type { RestRoleStatus } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  CalendarClock,
  Plus,
  Eye,
  FileCheck,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";

const statusVariantMap: Record<
  string,
  "warning" | "success" | "destructive" | "secondary"
> = {
  "PENDIENTE DE REVISION": "warning",
  ACEPTADA: "success",
  RECHAZADA: "destructive",
};

const LIMIT_OPTIONS = [10, 25, 50, 75, 100];

export function RestRolesPage() {
  const navigate = useNavigate();
  const {
    roles,
    isLoading,
    total,
    page,
    totalPages,
    limit,
    search,
    setSearch,
    setPage,
    setLimit,
    refresh,
    deleteRole,
  } = useRestRoles(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteRole(deletingId);
      setDeleteDialogOpen(false);
    } catch {
      // Error handled silently
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Roles de Descanso
          </h1>
          <p className="text-sm text-muted-foreground">
            Roles de descanso semanales
          </p>
        </div>
        <Button
          variant="teal"
          size="sm"
          className="cursor-pointer gap-1.5"
          onClick={() => navigate("/rest-roles/new")}
        >
          <Plus className="h-4 w-4" />
          Agregar Rol
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por planta, turno, supervisor..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1"
            onClick={() => setSearch("")}
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={refresh}
          disabled={isLoading}
          title="Recargar datos"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 rounded-xl"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && roles.length === 0 && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>
            <p className="mb-1 text-base font-medium text-foreground">
              {search
                ? "Sin resultados"
                : "No hay roles de descanso registrados"}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {search
                ? `No se encontraron roles para "${search}"`
                : "Registra el primero para comenzar."}
            </p>
            {!search ? (
              <Button
                variant="teal"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={() => navigate("/rest-roles/new")}
              >
                <Plus className="h-4 w-4" />
                Agregar Rol
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1"
                onClick={() => setSearch("")}
              >
                <X className="h-3.5 w-3.5" />
                Limpiar búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data table */}
      {!isLoading && roles.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
              <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  {total} roles de descanso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Planta
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Turno
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Año
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Semana
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Jefe Directo
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {roles.map((role, index) => (
                      <tr
                        key={role._id}
                        className="transition-colors hover:bg-primary/[0.02] animate-fade-in-up"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {role.plant_name || role.plant_id}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {role.shift_name || role.shift_id}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {role.year}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {role.week}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {role.supervisor_name ||
                            role.supervisor_id?.name ||
                            "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              statusVariantMap[role.status] || "secondary"
                            }
                            className="capitalize cursor-pointer"
                          >
                            {STATUS_LABELS[role.status as RestRoleStatus] ||
                              role.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Review button - only for PENDIENTE */}
                            {role.status === "PENDIENTE DE REVISION" && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer"
                                onClick={() =>
                                  navigate(`/rest-roles/${role._id}/review`)
                                }
                                title="Revisar rol de descanso"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {/* Detail button - only for non-pending */}
                            {role.status !== "PENDIENTE DE REVISION" && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer"
                                onClick={() =>
                                  navigate(`/rest-roles/${role._id}/detail`)
                                }
                                title="Ver detalle del rol"
                              >
                                <FileCheck className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {/* Edit button - only for PENDIENTE */}
                            {role.status === "PENDIENTE DE REVISION" && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer text-muted-foreground hover:text-primary"
                                onClick={() =>
                                  navigate(`/rest-roles/${role._id}/edit`)
                                }
                                title="Modificar registro"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {/* Delete button - only for PENDIENTE */}
                            {role.status === "PENDIENTE DE REVISION" && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteClick(role._id)}
                                title="Eliminar registro"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {roles.map((role, index) => (
              <Card
                key={role._id}
                className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {role.plant_name || role.plant_id} — Sem. {role.week}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {role.shift_name || role.shift_id}
                      </p>
                    </div>
                    <Badge
                      variant={statusVariantMap[role.status] || "secondary"}
                      className="capitalize cursor-pointer"
                    >
                      {STATUS_LABELS[role.status as RestRoleStatus] ||
                        role.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    {role.supervisor_name && (
                      <p>Jefe Directo: {role.supervisor_name}</p>
                    )}
                    <p>
                      Año {role.year}, Semana {role.week}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/40">
                    {role.status === "PENDIENTE DE REVISION" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer gap-1 flex-1"
                          onClick={() =>
                            navigate(`/rest-roles/${role._id}/review`)
                          }
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Revisar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer gap-1 flex-1"
                          onClick={() =>
                            navigate(`/rest-roles/${role._id}/edit`)
                          }
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer gap-1 flex-1 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(role._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </>
                    )}
                    {role.status !== "PENDIENTE DE REVISION" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1 flex-1"
                        onClick={() =>
                          navigate(`/rest-roles/${role._id}/detail`)
                        }
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        Ver detalle
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Registros por página:
              </span>
              <Select
                value={String(limit)}
                onValueChange={(val) => setLimit(Number(val))}
              >
                <SelectTrigger className="w-20 h-8 text-xs cursor-pointer">
                  <SelectValue placeholder={String(limit)} />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {total} registros
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                className="cursor-pointer"
                disabled={page <= 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="cursor-pointer"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="cursor-pointer"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="cursor-pointer"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription className="text-center">
              ¿Estás seguro de que deseas eliminar este rol de descanso? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="cursor-pointer"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="cursor-pointer"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
