import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAttendanceRecords } from "../hooks/useAttendanceRecords";

export function AttendanceRecordsPage() {
  const navigate = useNavigate();
  const {
    records,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    deleteRecord,
  } = useAttendanceRecords(10);

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
      await deleteRecord(deletingId);
    } catch {
      // Error handled by hook
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Registros de Asistencia
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los registros de asistencia del personal
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="btn-primary-action"
          onClick={() => navigate("/attendance/new")}
        >
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      {/* Search + Table Card */}
      <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-muted/40 to-muted/20 border-b-2 border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registros</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Cargando..."
                  : `${total} registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por fecha, supervisor..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {search
                  ? "No se encontraron registros con ese criterio de búsqueda"
                  : "No hay registros de asistencia aún"}
              </p>
              {!search && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 cursor-pointer"
                  onClick={() => navigate("/attendance/new")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer registro
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-b from-muted/40 to-muted/20 border-b-2 border-border/50">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Planta</TableHead>
                    <TableHead>Empleados</TableHead>
                    <TableHead>Registrado por</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow
                      key={record._id}
                      className="border-b border-border/40 cursor-pointer hover:bg-muted/30"
                      onClick={() => navigate(`/attendance/${record._id}`)}
                    >
                      <TableCell className="font-medium">
                        {record.date_str}
                      </TableCell>
                      <TableCell>{record.supervisor_name}</TableCell>
                      <TableCell>{record.plant_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer text-[10px]"
                        >
                          {record.attendance_count} empleado
                          {record.attendance_count !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.creator_username}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/attendance/${record._id}`);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/attendance/${record._id}/edit`);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(record._id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    Página {page} de {totalPages} ({total} registros)
                  </p>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        dismissible={false}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Registro</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este registro de asistencia?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="cursor-pointer"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
