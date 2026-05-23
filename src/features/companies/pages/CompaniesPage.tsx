import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "../hooks/useCompanies";
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
  Building2,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const statusVariant: Record<string, "success" | "secondary"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export function CompaniesPage() {
  const navigate = useNavigate();
  const {
    companies,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    refresh,
    deleteCompany,
  } = useCompanies(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string, name: string) => {
    setDeletingId(id);
    setDeletingName(name);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteCompany(deletingId);
      setDeleteDialogOpen(false);
    } catch {
      // Error handled silently
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
      setDeletingName("");
    }
  };

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Empresas
          </h1>
          <p className="text-sm text-muted-foreground">
            Empresas registradas en el sistema
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="btn-primary-action"
          onClick={() => navigate("/companies/new")}
        >
          <Plus className="h-4 w-4" />
          Agregar empresa
        </Button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por razón social, RFC..."
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
      ) : companies.length === 0 ? (
        /* Empty state */
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <p className="mb-1 text-base font-medium text-foreground">
              {search ? "Sin resultados" : "No hay empresas registradas"}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {search
                ? `No se encontraron empresas para "${search}"`
                : "Registra la primera para comenzar."}
            </p>
            {!search ? (
              <Button
                variant="default"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={() => navigate("/companies/new")}
              >
                <Plus className="h-4 w-4" />
                Agregar empresa
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
                  <Building2 className="h-4 w-4 text-primary" />
                  {total} empresas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {companies.map((company, index) => (
                    <div
                      key={company._id}
                      className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] hover:border-l-[3px] hover:border-l-primary hover:pl-[17px] animate-fade-in-up"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {company.legal_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          RFC: {company.rfc}
                        </p>
                      </div>
                      <div className="hidden lg:block text-xs text-muted-foreground truncate max-w-[160px]">
                        {company.patronal_registration}
                      </div>
                      <div className="hidden xl:block text-xs text-muted-foreground truncate max-w-[160px]">
                        {company.legal_representative}
                      </div>
                      <Badge
                        variant={statusVariant[company.status] || "secondary"}
                        className="capitalize cursor-pointer"
                      >
                        {statusLabels[company.status] || company.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer text-muted-foreground hover:text-primary"
                          onClick={() =>
                            navigate(`/companies/${company._id}/edit`)
                          }
                          title="Modificar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            handleDeleteClick(company._id, company.legal_name)
                          }
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {companies.map((company, index) => (
              <Card
                key={company._id}
                className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {company.legal_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          RFC: {company.rfc}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={statusVariant[company.status] || "secondary"}
                      className="capitalize cursor-pointer"
                    >
                      {statusLabels[company.status] || company.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    {company.patronal_registration && (
                      <p>Reg. Patronal: {company.patronal_registration}</p>
                    )}
                    {company.legal_representative && (
                      <p>Rep. Legal: {company.legal_representative}</p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer gap-1 flex-1"
                      onClick={() => navigate(`/companies/${company._id}/edit`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer gap-1 flex-1 text-destructive hover:text-destructive"
                      onClick={() =>
                        handleDeleteClick(company._id, company.legal_name)
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </Button>
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
              ¿Estás seguro de que deseas eliminar la empresa{" "}
              <strong>"{deletingName}"</strong>?
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
