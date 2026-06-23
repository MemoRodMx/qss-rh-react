import { useNavigate } from "react-router-dom";
import { useEmployees } from "../hooks/useEmployees";
import { Badge } from "@/components/ui/badge";
import { formatEmployeeNumber } from "@/lib/utils";
import { DataListLayout, type ColumnDef } from "@/components/data-list";
import type { Employee } from "../types";
import { Users } from "lucide-react";

const statusVariant: Record<
  string,
  "success" | "secondary" | "warning" | "destructive"
> = {
  ACTIVO: "success",
  INACTIVO: "secondary",
  SUSPENDIDO: "warning",
  BAJA: "destructive",
};

const statusLabels: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
  BAJA: "Baja",
};

const columns: ColumnDef<Employee>[] = [
  {
    key: "fullname",
    header: "Nombre",
    render: (e) =>
      e.fullname || `${e.name} ${e.surname} ${e.lastname}`,
  },
  {
    key: "employee_number",
    header: "No. Empleado",
    render: (e) => formatEmployeeNumber(e.employee_number),
  },
  {
    key: "rfc",
    header: "RFC",
    render: (e) => e.rfc || "—",
  },
  {
    key: "position_name",
    header: "Puesto",
    render: (e) => e.position_name || "—",
    className: "max-w-[140px]",
    hiddenOn: "lg",
  },
  {
    key: "plant_name",
    header: "Planta",
    render: (e) => e.plant_name || "—",
    className: "max-w-[120px]",
    hiddenOn: "xl",
  },
  {
    key: "shift_name",
    header: "Turno",
    render: (e) => e.shift_name || "—",
    className: "max-w-[100px]",
    hiddenOn: "xl",
  },
  {
    key: "status",
    header: "Estatus",
    render: (e) => (
      <Badge
        variant={statusVariant[e.status] || "secondary"}
        className="capitalize"
      >
        {statusLabels[e.status] || e.status}
      </Badge>
    ),
  },
];

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
    refresh,
    deleteEmployee,
  } = useEmployees(10);

  return (
    <DataListLayout
      title="Empleados"
      subtitle="Gestión de empleados y colaboradores"
      icon={<Users className="h-4 w-4" />}
      entityName="empleados"
      entityLabel="el empleado"
      createLabel="Agregar empleado"
      onCreateClick={() => navigate("/employees/new")}
      searchPlaceholder="Buscar por nombre, RFC, CURP, número de empleado..."
      search={search}
      onSearchChange={setSearch}
      data={employees}
      isLoading={isLoading}
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      onRefresh={refresh}
      onEditClick={(e) => navigate(`/employees/${e._id}/edit`)}
      onDeleteConfirm={deleteEmployee}
      getId={(e) => e._id}
      getNameForDelete={(e) =>
        e.fullname || `${e.name} ${e.surname}`
      }
      columns={columns}
    />
  );
}
