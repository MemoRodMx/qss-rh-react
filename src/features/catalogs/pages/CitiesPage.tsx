import { useCatalogList } from "../hooks/useCatalogList";
import { cityService } from "../services/cityService";
import type { City } from "../types";
import { CatalogListLayout } from "../components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";

export function CitiesPage() {
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
  } = useCatalogList<City>(cityService);

  return (
    <CatalogListLayout
      title="Ciudades"
      subtitle="Catálogo de ciudades del sistema"
      icon={<Map className="h-4 w-4 text-primary" />}
      searchPlaceholder="Buscar por nombre, código..."
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
        const city = item as City;
        return (
          <div
            key={city._id}
            className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] animate-fade-in-up"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
              <Map className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {city.name}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">{city.code}</div>
          </div>
        );
      }}
      renderMobileCard={(item) => {
        const city = item as City;
        return (
          <Card
            key={city._id}
            className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                  <Map className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {city.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{city.code}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }}
      emptyIcon={<Map className="h-8 w-8 text-primary" />}
      emptyTitle="No hay ciudades registradas"
      emptySubtitle="El catálogo está vacío."
    />
  );
}
