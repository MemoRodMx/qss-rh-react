import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "../hooks/useCustomers";
import { Badge } from "@/components/ui/badge";
import { CustomerOptimalSheet } from "../components/CustomerOptimalSheet";
import { DataListLayout, type ColumnDef } from "@/components/data-list";
import type { Customer } from "../types";
import { Users, Eye } from "lucide-react";

const statusVariant: Record<string, "success" | "secondary"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-MX", { month: "short" });
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const columns: ColumnDef<Customer>[] = [
  {
    key: "legal_name",
    header: "Cliente",
    render: (c) => c.legal_name,
  },
  {
    key: "rfc",
    header: "RFC",
    render: (c) => c.rfc || "—",
  },
  {
    key: "plant",
    header: "Planta",
    render: (c) => c.plant_id?.code ?? "—",
    className: "max-w-[140px]",
    hiddenOn: "xl",
  },
  {
    key: "areas",
    header: "Áreas",
    render: (c) => {
      if (!c.areas || c.areas.length === 0) return "—";
      return c.areas
        .map((a) => a.area_id?.code ?? "")
        .filter(Boolean)
        .join(", ") || "—";
    },
    className: "max-w-[160px]",
    hiddenOn: "xl",
  },
  {
    key: "contract_date",
    header: "Contrato",
    render: (c) => formatDate(c.contract_date),
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

export function CustomersPage() {
  const navigate = useNavigate();
  const {
    customers,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    refresh,
    deleteCustomer,
  } = useCustomers(10);

  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <DataListLayout
        title="Clientes"
        subtitle="Clientes y contratos activos"
        icon={<Users className="h-4 w-4" />}
        entityName="clientes"
        entityLabel="el cliente"
        createLabel="Agregar cliente"
        onCreateClick={() => navigate("/customers/new")}
        searchPlaceholder="Buscar por razón social, RFC, área..."
        search={search}
        onSearchChange={setSearch}
        data={customers}
        isLoading={isLoading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRefresh={refresh}
        onEditClick={(c) => navigate(`/customers/${c._id}/edit`)}
        onDeleteConfirm={deleteCustomer}
        getId={(c) => c._id}
        getNameForDelete={(c) => c.legal_name}
        columns={columns}
        extraActionIcon={<Eye className="h-3.5 w-3.5" />}
        extraActionLabel="Ver óptimo"
        extraActionClassName="hover:text-sky-500"
        onExtraActionClick={(c) => {
          setViewCustomerId(c._id);
          setSheetOpen(true);
        }}
      />

      <CustomerOptimalSheet
        customerId={viewCustomerId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
