import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../hooks/useEmployees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Users,
  UserPlus,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const statusVariant: Record<
  string,
  "success" | "warning" | "secondary" | "teal"
> = {
  ACTIVO: "success",
  INACTIVO: "secondary",
  "DE BAJA": "warning",
};

const statusLabels: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  "DE BAJA": "De baja",
};

export function EmployeesPage() {
  const navigate = useNavigate();
  const {
    employees,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    deleteEmployee,
  } = useEmployees(20);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget);
    } catch {
      // Error handled silently
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getFullName = (emp: {
    fullname?: string;
    name?: string;
    surname?: string;
    lastname?: string;
  }) => {
    // The list endpoint returns fullname directly
    if (emp.fullname) return emp.fullname;
    // Fallback: concatenate individual fields
    return [emp.name, emp.surname, emp.lastname].filter(Boolean).join(" ");
  };

  const getPositionName = (emp: {
    position_name?: string;
    work_location?: { position_code?: string };
  }): string => {
    return emp.position_name ?? emp.work_location?.position_code ?? "-";
  };

  const getPlantName = (emp: {
    plant_name?: string;
    work_location?: { plant_id?: string };
  }): string => {
    return emp.plant_name ?? emp.work_location?.plant_id ?? "-";
  };

  const getShiftName = (emp: {
    shift_name?: string;
    work_location?: { shift_id?: string };
  }): string => {
    return emp.shift_name ?? emp.work_location?.shift_id ?? "-";
  };

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Empleados
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona la plantilla de empleados
          </p>
        </div>
        <Button
          variant="teal"
          size="sm"
          className="cursor-pointer gap-1.5"
          onClick={() => navigate("/employees/new")}
        >
          <UserPlus className="h-4 w-4" />
          Nuevo empleado
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o número de empleado..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 rounded-xl"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && employees.length === 0 && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">
              {search
                ? "No se encontraron empleados con ese criterio de búsqueda."
                : "No hay empleados registrados."}
            </p>
            {!search && (
              <Button
                variant="teal"
                size="sm"
                className="mt-4 cursor-pointer gap-1.5"
                onClick={() => navigate("/employees/new")}
              >
                <UserPlus className="h-4 w-4" />
                Agregar primer empleado
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Employee table */}
      {!isLoading && employees.length > 0 && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" />
              {total} empleados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    RFC
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Puesto
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Planta
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Turno
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {employees.map((employee, index) => (
                  <tr
                    key={employee._id}
                    className="transition-colors hover:bg-primary/[0.02] animate-fade-in-up"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-left cursor-pointer"
                        onClick={() =>
                          navigate(`/employees/${employee._id}/edit`)
                        }
                      >
                        <div className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {getFullName(employee)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          #{String(employee.employee_number).padStart(5, "0")}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {employee.rfc || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {getPositionName(employee)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {getPlantName(employee)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {getShiftName(employee)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={statusVariant[employee.status] || "secondary"}
                        className="capitalize cursor-pointer"
                      >
                        {statusLabels[employee.status] || employee.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() =>
                            navigate(`/employees/${employee._id}/edit`)
                          }
                          title="Editar empleado"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Dialog
                          open={deleteTarget === employee._id}
                          onOpenChange={(open) => {
                            if (!open) setDeleteTarget(null);
                          }}
                        >
                          <DialogTrigger
                            className="cursor-pointer shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 inline-flex items-center justify-center rounded-lg border border-transparent size-7"
                            onClick={() => setDeleteTarget(employee._id)}
                            title="Eliminar empleado"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Confirmar eliminación
                              </DialogTitle>
                              <DialogDescription>
                                ¿Estás seguro de que deseas eliminar a{" "}
                                <strong>{getFullName(employee)}</strong> (#
                                {employee.employee_number})? Esta acción no se
                                puede deshacer.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter showCloseButton>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages} ({total} registros)
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              className="cursor-pointer"
              disabled={page <= 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="cursor-pointer"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="cursor-pointer"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="cursor-pointer"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
