import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalogList } from "@/features/catalogs/hooks/useCatalogList";
import { directSupervisorsService } from "../services/directSupervisorsService";
import type { DirectSupervisor } from "../types";
import { CatalogListLayout, DeleteDialog } from "@/features/catalogs/components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Pencil, Trash2 } from "lucide-react";

export function DirectSupervisorsPage() {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<DirectSupervisor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    refresh,
  } = useCatalogList<DirectSupervisor>(directSupervisorsService);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await directSupervisorsService.delete(deleteTarget._id);
      setDeleteTarget(null);
      refresh();
    } catch {
      // error handled silently
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <CatalogListLayout
        title="Jefes Directos"
        subtitle="Catálogo de jefes directos del sistema"
        icon={<UserCog className="h-4 w-4 text-primary" />}
        searchPlaceholder="Buscar por número, nombre..."
        createLabel="Nuevo jefe"
        onCreateClick={() => navigate("/catalogs/direct-supervisors/new")}
        data={data}
        isLoading={isLoading}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onRefresh={refresh}
        onDelete={() => {}}
        renderTableHeader={() => (
          <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border/40 bg-muted/20">
            <div className="flex-[2] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jefe Directo
            </div>
            <div className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estado
            </div>
            <div className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Áreas
            </div>
            <div className="w-24 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Acciones
            </div>
          </div>
        )}
        renderDesktopRow={(item) => {
          const supervisor = item as DirectSupervisor;
          return (
            <div
              key={supervisor._id}
              className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] animate-fade-in-up"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                <UserCog className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-[2] min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {supervisor.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {supervisor.employee_number}
                </p>
              </div>
              <div className="flex-1">
                <Badge
                  variant={supervisor.status === "ACTIVO" ? "success" : "destructive"}
                  className="cursor-default text-[11px]"
                >
                  {supervisor.status === "ACTIVO" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                {supervisor.assigned_areas?.length ?? 0}{" "}
                {supervisor.assigned_areas?.length === 1 ? "área" : "áreas"}
              </div>
              <div className="w-24 flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() =>
                    navigate(`/catalogs/direct-supervisors/${supervisor._id}/edit`)
                  }
                  title="Editar jefe directo"
                >
                  <Pencil className="h-3.5 w-3.5 text-primary" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(supervisor)}
                  title="Eliminar jefe directo"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          );
        }}
        renderMobileCard={(item) => {
          const supervisor = item as DirectSupervisor;
          return (
            <Card
              key={supervisor._id}
              className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                    <UserCog className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {supervisor.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {supervisor.employee_number}
                      </span>
                      <Badge
                        variant={
                          supervisor.status === "ACTIVO" ? "success" : "destructive"
                        }
                        className="cursor-default text-[10px]"
                      >
                        {supervisor.status === "ACTIVO" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {supervisor.assigned_areas?.length ?? 0}{" "}
                      {supervisor.assigned_areas?.length === 1
                        ? "área asignada"
                        : "áreas asignadas"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() =>
                        navigate(`/catalogs/direct-supervisors/${supervisor._id}/edit`)
                      }
                      title="Editar jefe directo"
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(supervisor)}
                      title="Eliminar jefe directo"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }}
        emptyIcon={<UserCog className="h-8 w-8 text-primary" />}
        emptyTitle="No hay jefes directos registrados"
        emptySubtitle="El catálogo está vacío. Crea el primer jefe directo."
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemName="jefe directo"
        itemIdentifier={`${deleteTarget?.employee_number} - ${deleteTarget?.name ?? ""}`}
      />
    </>
  );
}
