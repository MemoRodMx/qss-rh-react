import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  FileText,
  UserCircle,
} from "lucide-react";
import { attendanceService } from "../services/attendanceService";
import { AttendanceStatusBadge } from "../components/AttendanceStatusBadge";
import { AttendanceSummaryBar } from "../components/AttendanceSummaryBar";
import type { AttendanceRecordDetail } from "../types";

export function AttendanceRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<AttendanceRecordDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await attendanceService.getById(id);
        setRecord(data);
      } catch {
        setError("Error al cargar el registro de asistencia");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await attendanceService.delete(id);
      navigate("/attendance");
    } catch {
      setError("Error al eliminar el registro");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Compute summary counts
  const presenteCount =
    record?.employees.filter((e) => e.status === "PRESENTE").length ?? 0;
  const ausenteCount =
    record?.employees.filter((e) => e.status === "AUSENTE").length ?? 0;
  const vacacionesCount =
    record?.employees.filter((e) => e.status === "VACACIONES").length ?? 0;

  // ─── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error || !record) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">
          {error || "Registro no encontrado"}
        </h2>
        <Button
          variant="outline"
          className="cursor-pointer mt-2"
          onClick={() => navigate("/attendance")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a registros
        </Button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => navigate("/attendance")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Registro de Asistencia
            </h1>
            <p className="text-sm text-muted-foreground">
              {record.date_str} · {record.supervisor_name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => navigate(`/attendance/${id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-1)]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <Label className="text-xs text-muted-foreground">Fecha</Label>
                <p className="text-sm font-medium">{record.date_str}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-1)]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <Label className="text-xs text-muted-foreground">
                  Supervisor
                </Label>
                <p className="text-sm font-medium">{record.supervisor_name}</p>
                <p className="text-xs text-muted-foreground">
                  #{record.supervisor_employee_number}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-1)]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <Label className="text-xs text-muted-foreground">Planta</Label>
                <p className="text-sm font-medium">{record.plant_name}</p>
                {record.shift_name && (
                  <p className="text-xs text-muted-foreground">
                    Turno: {record.shift_name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-1)]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <UserCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <Label className="text-xs text-muted-foreground">
                  Registrado por
                </Label>
                <p className="text-sm font-medium">{record.creator_username}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(record.createdAt).toLocaleString("es-MX")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Bar */}
      <AttendanceSummaryBar
        presenteCount={presenteCount}
        ausenteCount={ausenteCount}
        vacacionesCount={vacacionesCount}
      />

      {/* Employees Table Card */}
      <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-muted/40 to-muted/20 border-b-2 border-border/50">
          <CardTitle>Empleados</CardTitle>
          <CardDescription>
            {record.employees.length} empleado
            {record.employees.length !== 1 ? "s" : ""} registrado
            {record.employees.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-b from-muted/40 to-muted/20 border-b-2 border-border/50">
                <TableHead className="w-[100px]">Emp #</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-[130px]">Estatus</TableHead>
                <TableHead>Observación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {record.employees.map((emp) => (
                <TableRow
                  key={emp.employee_number}
                  className="border-b border-border/40"
                >
                  <TableCell className="font-mono text-xs">
                    {emp.employee_number}
                    {emp.is_loan && (
                      <span className="ml-1 text-[10px] text-primary font-medium">
                        (Préstamo)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{emp.employee_name}</TableCell>
                  <TableCell>
                    <AttendanceStatusBadge status={emp.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emp.notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes Card */}
      {record.notes && (
        <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observaciones Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {record.notes}
            </p>
          </CardContent>
        </Card>
      )}

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
              onClick={handleDelete}
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
