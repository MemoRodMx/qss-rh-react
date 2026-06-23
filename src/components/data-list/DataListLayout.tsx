import { useState, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const HIDDEN_CELL_CLASSES: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

export interface ColumnDef<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  hiddenOn?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface DataListLayoutProps<T> {
  title: string;
  subtitle: string;
  icon: ReactNode;
  entityName: string;
  entityLabel: string;

  createLabel?: string;
  onCreateClick?: () => void;

  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;

  data: T[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;

  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onEditClick: (item: T) => void;
  onDeleteConfirm: (id: string) => Promise<void>;

  getId: (item: T) => string;
  getNameForDelete: (item: T) => string;

  columns: ColumnDef<T>[];

  extraActionIcon?: ReactNode;
  extraActionLabel?: string;
  extraActionClassName?: string;
  onExtraActionClick?: (item: T) => void;
}

export function DataListLayout<T>({
  title,
  subtitle,
  icon,
  entityName,
  entityLabel,
  createLabel,
  onCreateClick,
  searchPlaceholder,
  search,
  onSearchChange,
  data,
  isLoading,
  total,
  page,
  totalPages,
  onPageChange,
  onRefresh,
  onEditClick,
  onDeleteConfirm,
  getId,
  getNameForDelete,
  columns,
  extraActionIcon,
  extraActionLabel,
  extraActionClassName,
  onExtraActionClick,
}: DataListLayoutProps<T>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
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
      await onDeleteConfirm(deletingId);
      setDeleteDialogOpen(false);
    } catch {
      // Error handled silently
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
      setDeletingName('');
    }
  };

  const statusColumn = columns.find((c) => c.key === 'status');
  const nameColumn = columns[0];
  const subtitleColumn = columns[1];
  const otherColumns = columns.slice(2).filter((c) => c.key !== 'status');

  const renderExtraButton = (item: T, isMobile: boolean) => {
    if (!extraActionIcon || !onExtraActionClick) return null;
    if (isMobile) {
      return (
        <Button
          variant="outline"
          size="sm"
          className={cn('cursor-pointer gap-1 flex-1', extraActionClassName)}
          onClick={() => onExtraActionClick(item)}
        >
          {extraActionIcon}
          {extraActionLabel}
        </Button>
      );
    }
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn('cursor-pointer text-muted-foreground', extraActionClassName)}
        onClick={() => onExtraActionClick(item)}
        title={extraActionLabel}
      >
        {extraActionIcon}
      </Button>
    );
  };

  const isEmptyValue = (value: ReactNode): boolean => {
    if (value === null || value === undefined || value === '') return true;
    if (value === '—') return true;
    return false;
  };

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Page header */}
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
            onClick={() => onSearchChange('')}
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
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
            <div className="mb-4 rounded-full bg-primary/10 p-4">{icon}</div>
            <p className="mb-1 text-base font-medium text-foreground">
              {search ? 'Sin resultados' : `No hay ${entityName} registrados`}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {search
                ? `No se encontraron ${entityName} para "${search}"`
                : `Registra el primero para comenzar.`}
            </p>
            {!search ? (
              createLabel && onCreateClick ? (
                <Button
                  variant="default"
                  size="sm"
                  className="cursor-pointer gap-1.5"
                  onClick={onCreateClick}
                >
                  <Plus className="h-4 w-4" />
                  {createLabel}
                </Button>
              ) : null
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3.5 w-3.5" />
                Limpiar búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Data table container — single unified element (no nested boxes) */}
          <div className="overflow-hidden rounded-xl border border-border/40 bg-card shadow-[var(--shadow-2)]">
            {/* Info bar — seamless top section, same element */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/40 bg-muted/20">
              <span className="[&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-primary">
                {icon}
              </span>
              <span className="text-sm font-medium text-foreground">
                {total} {entityName}
              </span>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-gradient-to-b from-muted/40 to-muted/20 border-b-2 border-border/50">
                  <tr>
                    <th className="h-10 px-5 text-left align-middle text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {nameColumn.header}
                    </th>
                    {subtitleColumn && (
                      <th className="h-10 px-5 text-left align-middle text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {subtitleColumn.header}
                      </th>
                    )}
                    {otherColumns.map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          'h-10 px-5 text-left align-middle text-xs font-medium text-muted-foreground whitespace-nowrap',
                          col.hiddenOn && HIDDEN_CELL_CLASSES[col.hiddenOn],
                        )}
                      >
                        {col.header}
                      </th>
                    ))}
                    {statusColumn && (
                      <th
                        key={statusColumn.key}
                        className={cn(
                          'h-10 px-5 text-left align-middle text-xs font-medium text-muted-foreground whitespace-nowrap',
                          statusColumn.hiddenOn && HIDDEN_CELL_CLASSES[statusColumn.hiddenOn],
                        )}
                      >
                        {statusColumn.header}
                      </th>
                    )}
                    <th className="h-10 px-5 text-right align-middle text-xs font-medium text-muted-foreground whitespace-nowrap w-[80px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr
                      key={getId(item)}
                      className="border-b border-border/40 transition-colors hover:bg-primary/[0.02] animate-fade-in-up"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      {/* Name column with icon */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-foreground truncate block">
                              {nameColumn.render(item)}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Subtitle column */}
                      {subtitleColumn && (
                        <td className="px-5 py-3 text-xs text-muted-foreground truncate max-w-[220px]">
                          {subtitleColumn.render(item)}
                        </td>
                      )}
                      {/* Other columns */}
                      {otherColumns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-5 py-3 text-xs text-muted-foreground truncate',
                            col.className,
                            col.hiddenOn && HIDDEN_CELL_CLASSES[col.hiddenOn],
                          )}
                        >
                          {col.render(item)}
                        </td>
                      ))}
                      {/* Status column */}
                      {statusColumn && (
                        <td
                          className={cn(
                            'px-5 py-3 whitespace-nowrap',
                            statusColumn.hiddenOn && HIDDEN_CELL_CLASSES[statusColumn.hiddenOn],
                          )}
                        >
                          {statusColumn.render(item)}
                        </td>
                      )}
                      {/* Actions */}
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {renderExtraButton(item, false)}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground hover:text-primary"
                            onClick={() => onEditClick(item)}
                            title="Modificar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleDeleteClick(getId(item), getNameForDelete(item))
                            }
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {data.map((item, index) => (
                <Card
                  key={getId(item)}
                  className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {nameColumn.render(item)}
                          </p>
                          {subtitleColumn && (
                            <p className="text-xs text-muted-foreground truncate">
                              {subtitleColumn.render(item)}
                            </p>
                          )}
                        </div>
                      </div>
                      {statusColumn && statusColumn.render(item)}
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      {otherColumns.map((col) => {
                        const value = col.render(item);
                        if (isEmptyValue(value)) return null;
                        return (
                          <p key={col.key}>
                            {col.header}: {value}
                          </p>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                      {renderExtraButton(item, true)}
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1 flex-1"
                        onClick={() => onEditClick(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1 flex-1 text-destructive hover:text-destructive"
                        onClick={() =>
                          handleDeleteClick(getId(item), getNameForDelete(item))
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Confirmar eliminación</DialogTitle>
            <DialogDescription className="text-center">
              ¿Estás seguro de que deseas eliminar {entityLabel}{' '}
              <strong>&quot;{deletingName}&quot;</strong>?
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
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
