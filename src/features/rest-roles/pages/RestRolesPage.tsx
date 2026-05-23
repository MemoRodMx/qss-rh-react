import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestRoles } from "../hooks/useRestRoles";
import { STATUS_SEVERITY, STATUS_LABELS } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Search,
  CalendarCheck,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  ClipboardCheck,
} from "lucide-react";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-MX", { month: "short" });
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function RestRolesPage() {
  const navigate = useNavigate();
  const {
    roles,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    refresh,
    deleteRole,
  } = useRestRoles(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingLabel, setDeletingLabel] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string, label: string) => {
    setDeletingId(id);
    setDeletingLabel(label);
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
      setDeletingLabel("");
    }
  };

  const canReview = (status: string) => status === "PENDIENTE DE REVISION";
  const canEdit = (status: string) => status === "PENDIENTE DE REVISION";
  const canDelete = (status: string) => status === "PENDIENTE DE REVISION";

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Roles de Descanso
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de roles de descanso semanales
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="btn-primary-action"
          onClick={() => navigate("/rest-roles/new")}
        >
          <Plus className="h-4 w-4" />
          Nuevo Rol
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
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 rounded-xl"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : roles.length === 0 ? (
        /* Empty state */
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <p className="mb-1 text-base font-medium text-foreground">
              {search ? "Sin resultados" : "No hay roles de descanso"}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {search
                ? `No se encontraron roles para "${search}"`
                : "Crea el primer rol de descanso para comenzar."}
            </p>
            {!search ? (
              <Button
                variant="default"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={() => navigate("/rest-roles/new")}
              >
                <Plus className="h-4 w-4" />
                Nuevo Rol
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
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
              <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  {total} roles de descanso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {roles.map((role, index) => (
                    <div
                      key={role._id}
                      className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] hover:border-l-[3px] hover:border-l-primary hover:pl-[17px] animate-fade-in-up"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                        <CalendarCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {role.plant_name || role.plant_id} —{" "}
                          {role.shift_name || role.shift_id}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Semana {role.week}, {role.year} · Supervisor:{" "}
                          {role.supervisor_name || role.supervisor_id}
                        </p>
                      </div>
                      <div className="hidden lg:block text-xs text-muted-foreground">
                        Creado por: {role.creator_username || "—"}
                      </div>
                      <Badge
                        variant={STATUS_SEVERITY[role.status] || "secondary"}
                        className="capitalize cursor-pointer"
                      >
                        {STATUS_LABELS[role.status] || role.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {canReview(role.status) && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground hover:text-accent"
                            onClick={() =>
                              navigate(`/rest-roles/${role._id}/review`)
                            }
                            title="Revisar"
                          >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!canReview(role.status) && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground hover:text-primary"
                            onClick={() => navigate(`/rest-roles/${role._id}`)}
                            title="Ver detalle"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canEdit(role.status) && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground hover:text-primary"
                            onClick={() =>
                              navigate(`/rest-roles/${role._id}/edit`)
                            }
                            title="Modificar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canDelete(role.status) && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleDeleteClick(
                                role._id,
                                `${role.plant_name || role.plant_id} - Sem ${role.week}/${role.year}`,
                              )
                            }
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                        <CalendarCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {role.plant_name || role.plant_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {role.shift_name || role.shift_id} · Sem {role.week},{" "}
                          {role.year}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={STATUS_SEVERITY[role.status] || "secondary"}
                      className="capitalize cursor-pointer"
                    >
                      {STATUS_LABELS[role.status] || role.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p>
                      Supervisor: {role.supervisor_name || role.supervisor_id}
                    </p>
                    <p>Creado por: {role.creator_username || "—"}</p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/40">
                    {canReview(role.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1 flex-1"
                        onClick={() =>
                          navigate(`/rest-roles/${role._id}/review`)
                        }
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Revisar
                      </Button>
                    )}
                    {!canReview(role.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1 flex-1"
                        onClick={() => navigate(`/rest-roles/${role._id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detalle
                      </Button>
                    )}
                    {canEdit(role.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1 flex-1"
                        onClick={() => navigate(`/rest-roles/${role._id}/edit`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                    )}
                    {canDelete(role.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1 flex-1 text-destructive hover:text-destructive"
                        onClick={() =>
                          handleDeleteClick(
                            role._id,
                            `${role.plant_name || role.plant_id} - Sem ${role.week}/${role.year}`,
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
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
              ¿Estás seguro de que deseas eliminar el rol de descanso{" "}
              <strong>"{deletingLabel}"</strong>?
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
