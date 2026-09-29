import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";

interface CatalogListLayoutProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  createLabel?: string;
  searchPlaceholder: string;
  onCreateClick?: () => void;
  // Data
  data: unknown[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  // Delete
  onDelete: (id: string) => void;
  // Renderers
  renderDesktopRow: (item: unknown, index: number) => ReactNode;
  renderMobileCard: (item: unknown, index: number) => ReactNode;
  renderTableHeader: () => ReactNode;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptySubtitle: string;
}

export function CatalogListLayout({
  title,
  subtitle,
  icon,
  createLabel,
  searchPlaceholder,
  onCreateClick,
  data,
  isLoading,
  total,
  page,
  totalPages,
  search,
  onSearchChange,
  onPageChange,
  onRefresh,
  renderDesktopRow,
  renderMobileCard,
  renderTableHeader,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
}: CatalogListLayoutProps) {
  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {createLabel && onCreateClick && (
          <Button
            variant="default"
            size="sm"
            className="btn-primary-action"
            onClick={onCreateClick}
          >
            <Plus className="h-4 w-4" />
            {createLabel}
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {search && (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1"
            onClick={() => onSearchChange("")}
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={onRefresh}
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
      ) : data.length === 0 ? (
        /* Empty state */
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              {emptyIcon}
            </div>
            <p className="mb-1 text-base font-medium text-foreground">
              {search ? "Sin resultados" : emptyTitle}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {search
                ? `No se encontraron resultados para "${search}"`
                : emptySubtitle}
            </p>
            {search ? (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1"
                onClick={() => onSearchChange("")}
              >
                <X className="h-3.5 w-3.5" />
                Limpiar búsqueda
              </Button>
            ) : createLabel && onCreateClick ? (
              <Button
                variant="default"
                size="sm"
                className="cursor-pointer gap-1.5"
                onClick={onCreateClick}
              >
                <Plus className="h-4 w-4" />
                {createLabel}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
              <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  {icon}
                  {total} registros
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {renderTableHeader()}
                <div className="divide-y divide-border/40">
                  {data.map((item, index) => renderDesktopRow(item, index))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data.map((item, index) => renderMobileCard(item, index))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
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
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  itemName: string;
  itemIdentifier: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  itemName,
  itemIdentifier,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} dismissible={false}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">
            Confirmar eliminación
          </DialogTitle>
          <DialogDescription className="text-center">
            ¿Estás seguro de que deseas eliminar {itemName}{" "}
            <strong>"{itemIdentifier}"</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="cursor-pointer"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
