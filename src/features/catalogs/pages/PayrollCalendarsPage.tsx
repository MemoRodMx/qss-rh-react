import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCatalogList } from "../hooks/useCatalogList";
import { payrollCalendarService } from "../services/payrollCalendarService";
import type { PayrollCalendar } from "../types";
import {
  CatalogListLayout,
  DeleteDialog,
} from "../components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Pencil,
  Trash2,
  Save,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

// ── Zod schema ───────────────────────────────────────────────────────────────
const calendarFormSchema = z.object({
  year: z.coerce
    .number({ message: "El año es obligatorio" })
    .int()
    .min(2020, "Año inválido")
    .max(2100, "Año inválido"),
  week: z.coerce
    .number({ message: "La semana es obligatoria" })
    .int()
    .min(1, "Semana inválida")
    .max(53, "Semana inválida"),
  init_date: z.string().min(1, "La fecha de inicio es obligatoria"),
  end_date: z.string().min(1, "La fecha de fin es obligatoria"),
  accounting_month: z.coerce
    .number({ message: "El mes contable es obligatorio" })
    .int()
    .min(1, "Mes inválido")
    .max(12, "Mes inválido"),
  imss_month: z.coerce
    .number({ message: "El mes IMSS es obligatorio" })
    .int()
    .min(1, "Mes inválido")
    .max(12, "Mes inválido"),
});

type CalendarFormValues = z.infer<typeof calendarFormSchema>;

// ── Helper: get nested error ─────────────────────────────────────────────────
function getNestedError(
  errors: Record<string, unknown>,
  path: string,
): { message?: string } | undefined {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current as { message?: string } | undefined;
}

export function PayrollCalendarsPage() {
  const {
    data,
    isLoading,
    total,
    page,
    totalPages,
    search,
    setSearch,
    setPage,
    refresh,
    deleteRecord,
  } = useCatalogList<PayrollCalendar>(payrollCalendarService);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingIdentifier, setDeletingIdentifier] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CalendarFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(calendarFormSchema) as any,
    defaultValues: {
      year: new Date().getFullYear(),
      week: 1,
      init_date: "",
      end_date: "",
      accounting_month: new Date().getMonth() + 1,
      imss_month: new Date().getMonth() + 1,
    },
  });

  // ── Open form for create ───────────────────────────────────────────────────
  const handleCreate = () => {
    setEditingId(null);
    reset({
      year: new Date().getFullYear(),
      week: 1,
      init_date: "",
      end_date: "",
      accounting_month: new Date().getMonth() + 1,
      imss_month: new Date().getMonth() + 1,
    });
    setServerError(null);
    setFormOpen(true);
  };

  // ── Open form for edit ─────────────────────────────────────────────────────
  const handleEdit = async (id: string) => {
    setServerError(null);
    try {
      const record = await payrollCalendarService.getById(id);
      setEditingId(id);
      reset({
        year: record.year,
        week: record.week,
        init_date: record.init_date.split("T")[0],
        end_date: record.end_date.split("T")[0],
        accounting_month: record.accounting_month,
        imss_month: record.imss_month,
      });
      setFormOpen(true);
    } catch {
      setServerError("Error al cargar el registro");
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: CalendarFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        year: values.year,
        week: values.week,
        init_date: values.init_date,
        end_date: values.end_date,
        accounting_month: values.accounting_month,
        imss_month: values.imss_month,
      };

      if (editingId) {
        await payrollCalendarService.update(editingId, payload);
      } else {
        await payrollCalendarService.create(payload);
      }

      setFormOpen(false);
      refresh();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar el registro",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteClick = (id: string, label: string) => {
    setDeletingId(id);
    setDeletingIdentifier(label);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteRecord(deletingId);
      setDeleteDialogOpen(false);
    } catch {
      // handled silently
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
      setDeletingIdentifier("");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <CatalogListLayout
        title="Calendario de Nómina"
        subtitle="Catálogo de semanas del calendario de nómina"
        icon={<Calendar className="h-4 w-4 text-primary" />}
        createLabel="Agregar semana"
        searchPlaceholder="Buscar por año, semana..."
        onCreateClick={handleCreate}
        data={data}
        isLoading={isLoading}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onRefresh={refresh}
        onDelete={() => {}}
        renderTableHeader={() => null}
        renderDesktopRow={(item, index) => {
          const cal = item as PayrollCalendar;
          return (
            <div
              key={cal._id}
              className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] hover:border-l-[3px] hover:border-l-primary hover:pl-[17px] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Semana {cal.week} - {cal.year}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(cal.init_date)} - {formatDate(cal.end_date)}
                </p>
              </div>
              <div className="hidden lg:block text-xs text-muted-foreground">
                Mes contable: {cal.accounting_month}
              </div>
              <div className="hidden xl:block text-xs text-muted-foreground">
                Mes IMSS: {cal.imss_month}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={() => handleEdit(cal._id)}
                  title="Modificar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    handleDeleteClick(
                      cal._id,
                      `Semana ${cal.week} - ${cal.year}`,
                    )
                  }
                  title="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        }}
        renderMobileCard={(item, index) => {
          const cal = item as PayrollCalendar;
          return (
            <Card
              key={cal._id}
              className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Semana {cal.week} - {cal.year}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(cal.init_date)} - {formatDate(cal.end_date)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Mes contable: {cal.accounting_month}</p>
                  <p>Mes IMSS: {cal.imss_month}</p>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 flex-1"
                    onClick={() => handleEdit(cal._id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 flex-1 text-destructive hover:text-destructive"
                    onClick={() =>
                      handleDeleteClick(
                        cal._id,
                        `Semana ${cal.week} - ${cal.year}`,
                      )
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }}
        emptyIcon={<Calendar className="h-8 w-8 text-primary" />}
        emptyTitle="No hay semanas registradas"
        emptySubtitle="Agrega la primera semana del calendario de nómina."
      />

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer"
                onClick={() => setFormOpen(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>
                {editingId
                  ? "Modificar semana"
                  : "Agregar semana al calendario"}
              </DialogTitle>
            </div>
          </DialogHeader>

          {serverError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FloatLabelInput
                  id="year"
                  label="Año"
                  type="number"
                  error={getNestedError(errors, "year")?.message}
                  {...register("year")}
                />
              </div>
              <div>
                <FloatLabelInput
                  id="week"
                  label="Semana"
                  type="number"
                  min={1}
                  max={53}
                  error={getNestedError(errors, "week")?.message}
                  {...register("week")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FloatLabelInput
                  id="init_date"
                  label="Fecha de inicio"
                  type="date"
                  error={getNestedError(errors, "init_date")?.message}
                  {...register("init_date")}
                />
              </div>
              <div>
                <FloatLabelInput
                  id="end_date"
                  label="Fecha de fin"
                  type="date"
                  error={getNestedError(errors, "end_date")?.message}
                  {...register("end_date")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FloatLabelInput
                  id="accounting_month"
                  label="Mes contable"
                  type="number"
                  min={1}
                  max={12}
                  error={getNestedError(errors, "accounting_month")?.message}
                  {...register("accounting_month")}
                />
              </div>
              <div>
                <FloatLabelInput
                  id="imss_month"
                  label="Mes IMSS"
                  type="number"
                  min={1}
                  max={12}
                  error={getNestedError(errors, "imss_month")?.message}
                  {...register("imss_month")}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border/40">
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="cursor-pointer gap-1.5"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setFormOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemName="la semana"
        itemIdentifier={deletingIdentifier}
      />
    </>
  );
}
