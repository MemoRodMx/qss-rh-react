import { useCatalogList } from "../hooks/useCatalogList";
import { colonyService } from "../services/colonyService";
import type { Colony } from "../types";
import { CatalogListLayout } from "../components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function ColoniesPage() {
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
  } = useCatalogList<Colony>(colonyService);

  return (
    <CatalogListLayout
      title="Colonias"
      subtitle="Catálogo de colonias registradas"
      icon={<MapPin className="h-4 w-4 text-primary" />}
      searchPlaceholder="Buscar por código, nombre, CP..."
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
      renderTableHeader={() => null}
      renderDesktopRow={(item) => {
        const colony = item as Colony;
        return (
          <div
            key={colony._id}
            className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] animate-fade-in-up"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {colony.name}
              </p>
              <p className="text-xs text-muted-foreground">{colony.code}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              CP: {colony.zipcode}
            </div>
          </div>
        );
      }}
      renderMobileCard={(item) => {
        const colony = item as Colony;
        return (
          <Card
            key={colony._id}
            className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {colony.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{colony.code}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground ml-12">
                CP: {colony.zipcode}
              </p>
            </CardContent>
          </Card>
        );
      }}
      emptyIcon={<MapPin className="h-8 w-8 text-primary" />}
      emptyTitle="No hay colonias registradas"
      emptySubtitle="El catálogo está vacío."
    />
  );
}
