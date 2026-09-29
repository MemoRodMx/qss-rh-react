import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalogList } from "../hooks/useCatalogList";
import { plantsService } from "../services/plantsService";
import type { Plant } from "../types";
import { CatalogListLayout } from "../components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Warehouse, Pencil, Trash2, AlertTriangle } from "lucide-react";

export function PlantsPage() {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Plant | null>(null);
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
  } = useCatalogList<Plant>(plantsService);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await plantsService.delete(deleteTarget._id);
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
        title="Plantas"
        subtitle="Catálogo de plantas del sistema"
        icon={<Warehouse className="h-4 w-4 text-primary" />}
        searchPlaceholder="Buscar por código, nombre..."
        createLabel="Nueva planta"
        onCreateClick={() => navigate("/catalogs/plants/new")}
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
              Planta
            </div>
            <div className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Código
            </div>
            <div className="w-24 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Acciones
            </div>
          </div>
        )}
        renderDesktopRow={(item) => {
          const plant = item as Plant;
          return (
            <div
              key={plant._id}
              className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] animate-fade-in-up"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                <Warehouse className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-[2] min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {plant.name}
                </p>
                {plant.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {plant.description}
                  </p>
                )}
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                {plant.code}
              </div>
              <div className="w-24 flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => navigate(`/catalogs/plants/${plant._id}/edit`)}
                  title="Editar planta"
                >
                  <Pencil className="h-3.5 w-3.5 text-primary" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(plant)}
                  title="Eliminar planta"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          );
        }}
        renderMobileCard={(item) => {
          const plant = item as Plant;
          return (
            <Card
              key={plant._id}
              className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                    <Warehouse className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {plant.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plant.code}
                    </p>
                    {plant.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {plant.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() =>
                        navigate(`/catalogs/plants/${plant._id}/edit`)
                      }
                      title="Editar planta"
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(plant)}
                      title="Eliminar planta"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }}
        emptyIcon={<Warehouse className="h-8 w-8 text-primary" />}
        emptyTitle="No hay plantas registradas"
        emptySubtitle="El catálogo está vacío. Crea la primera planta."
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        dismissible={false}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar planta
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar la planta{" "}
              <strong>{deleteTarget?.name}</strong> (
              {deleteTarget?.code})? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
