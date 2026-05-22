import { useCatalogList } from "../hooks/useCatalogList";
import { zipcodeService } from "../services/zipcodeService";
import type { Zipcode } from "../types";
import { CatalogListLayout } from "../components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function ZipcodesPage() {
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
  } = useCatalogList<Zipcode>(zipcodeService);

  return (
    <CatalogListLayout
      title="Códigos Postales"
      subtitle="Catálogo de códigos postales"
      icon={<MapPin className="h-4 w-4 text-primary" />}
      searchPlaceholder="Buscar por código, estado, municipio..."
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
        const zip = item as Zipcode;
        return (
          <div
            key={zip._id}
            className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] animate-fade-in-up"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {zip.code}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {zip.state} / {zip.municipality}
              </p>
            </div>
            <div className="hidden lg:block text-xs text-muted-foreground truncate max-w-[160px]">
              {zip.locality}
            </div>
          </div>
        );
      }}
      renderMobileCard={(item) => {
        const zip = item as Zipcode;
        return (
          <Card
            key={zip._id}
            className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10 shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {zip.code}
                  </p>
                  <p className="text-xs text-muted-foreground">{zip.state}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground ml-12">
                <p>Municipio: {zip.municipality}</p>
                {zip.locality && <p>Localidad: {zip.locality}</p>}
              </div>
            </CardContent>
          </Card>
        );
      }}
      emptyIcon={<MapPin className="h-8 w-8 text-primary" />}
      emptyTitle="No hay códigos postales registrados"
      emptySubtitle="El catálogo está vacío."
    />
  );
}
