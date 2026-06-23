import { useNavigate } from "react-router-dom";
import { useCompanies } from "../hooks/useCompanies";
import { Badge } from "@/components/ui/badge";
import { DataListLayout, type ColumnDef } from "@/components/data-list";
import type { Company } from "@/lib/types";
import { Building2 } from "lucide-react";

const statusVariant: Record<string, "success" | "secondary"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const columns: ColumnDef<Company>[] = [
  {
    key: "legal_name",
    header: "Empresa",
    render: (c) => c.legal_name,
  },
  {
    key: "rfc",
    header: "RFC",
    render: (c) => c.rfc,
  },
  {
    key: "patronal_registration",
    header: "Reg. Patronal",
    render: (c) => c.patronal_registration || "—",
    className: "max-w-[160px]",
    hiddenOn: "lg",
  },
  {
    key: "legal_representative",
    header: "Rep. Legal",
    render: (c) => c.legal_representative || "—",
    className: "max-w-[160px]",
    hiddenOn: "xl",
  },
  {
    key: "status",
    header: "Estatus",
    render: (c) => (
      <Badge
        variant={statusVariant[c.status] || "secondary"}
        className="capitalize"
      >
        {statusLabels[c.status] || c.status}
      </Badge>
    ),
  },
];

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

  return (
    <DataListLayout
      title="Empresas"
      subtitle="Empresas registradas en el sistema"
      icon={<Building2 className="h-4 w-4" />}
      entityName="empresas"
      entityLabel="la empresa"
      createLabel="Agregar empresa"
      onCreateClick={() => navigate("/companies/new")}
      searchPlaceholder="Buscar por razón social, RFC..."
      search={search}
      onSearchChange={setSearch}
      data={companies}
      isLoading={isLoading}
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      onRefresh={refresh}
      onEditClick={(c) => navigate(`/companies/${c._id}/edit`)}
      onDeleteConfirm={deleteCompany}
      getId={(c) => c._id}
      getNameForDelete={(c) => c.legal_name}
      columns={columns}
    />
  );
}
