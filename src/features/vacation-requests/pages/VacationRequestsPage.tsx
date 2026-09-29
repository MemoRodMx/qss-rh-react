import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVacationRequests } from "../hooks/useVacationRequests";
import { STATUS_SEVERITY, STATUS_LABELS } from "../types";
import type { VacationRequest } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  CalendarCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function formatEmployeeNumber(num: string): string {
  return `#${num.padStart(6, "0")}`;
}

interface DeleteDialogProps {
  request: VacationRequest | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteDialog({
  request,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={!!request} onOpenChange={onClose} dismissible={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar solicitud
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de eliminar la solicitud de vacaciones del empleado{" "}
            <strong>{request.employee_name || request.employee_number}</strong>?
            <br />
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VacationRequestsPage() {
  const navigate = useNavigate();
  const {
    requests,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    refresh,
    deleteRequest,
  } = useVacationRequests(10);

  const [deleteTarget, setDeleteTarget] = useState<VacationRequest | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRequest(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      // Error handled by hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReset = async (id: string) => {
    try {
      const { vacationRequestService } =
        await import("../services/vacationRequestService");
      await vacationRequestService.resetToNew(id);
      refresh();
    } catch {
      // Error handled silently
    }
  };

  const canReview = true; // Will be determined by auth context in real app

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Solicitudes de vacaciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las solicitudes de vacaciones de los empleados.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="btn-primary-action"
          onClick={() => navigate("/vacation-requests/new")}
        >
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por empleado o planta..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border/50">
                <TableHead className="bg-gradient-to-b from-muted/40 to-muted/20 text-xs font-semibold uppercase tracking-wider">
                  Empleado
                </TableHead>
                <TableHead className="bg-gradient-to-b from-muted/40 to-muted/20 text-xs font-semibold uppercase tracking-wider">
                  Planta
                </TableHead>
                <TableHead className="bg-gradient-to-b from-muted/40 to-muted/20 text-xs font-semibold uppercase tracking-wider">
                  Turno
                </TableHead>
                <TableHead className="bg-gradient-to-b from-muted/40 to-muted/20 text-xs font-semibold uppercase tracking-wider">
                  Ejercicio
                </TableHead>
                <TableHead className="bg-gradient-to-b from-muted/40 to-muted/20 text-xs font-semibold uppercase tracking-wider">
                  Días
                </TableHead>
                <TableHead className="bg-gradient-to-b from-muted/40 to-muted/20 text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="bg-gradient-to-b from-muted/40 to-muted/20 text-xs font-semibold uppercase tracking-wider text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <CalendarCheck className="h-8 w-8 text-muted-foreground/50" />
                      <p>No hay solicitudes de vacaciones</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer mt-2"
                        onClick={() => navigate("/vacation-requests/new")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Crear primera solicitud
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow
                    key={req._id}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {req.employee_name || "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatEmployeeNumber(req.employee_number)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {req.plant_name || req.plant_id}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {req.shift_name || req.shift_id}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {req.exercise}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {req.requested_days?.length || 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_SEVERITY[req.status] || "secondary"}
                        className="cursor-pointer text-[10px]"
                      >
                        {STATUS_LABELS[req.status] || req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Review button */}
                        {(req.status === "NUEVA" ||
                          req.status === "CAMBIO SOLICITADO" ||
                          req.status === "CAMBIOS REALIZADOS") &&
                          canReview && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer h-7 w-7"
                              onClick={() =>
                                navigate(`/vacation-requests/${req._id}/review`)
                              }
                              title="Revisar"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}

                        {/* Edit button */}
                        {(req.status === "NUEVA" ||
                          req.status === "CAMBIO SOLICITADO") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7"
                            onClick={() =>
                              navigate(`/vacation-requests/${req._id}/edit`)
                            }
                            title="Modificar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Delete button */}
                        {req.status === "NUEVA" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(req)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {/* Reset button (SYSTEM only) */}
                        {req.status !== "NUEVA" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7"
                            onClick={() => handleReset(req._id)}
                            title="Regresar a NUEVA"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {total} registro{total !== 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteDialog
        request={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
