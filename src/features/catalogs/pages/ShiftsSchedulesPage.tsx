import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCatalogList } from "../hooks/useCatalogList";
import { shiftScheduleService } from "../services/shiftScheduleService";
import type { ShiftSchedule, CustomerOption } from "../types";
import {
  CatalogListLayout,
  DeleteDialog,
} from "../components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Pencil,
  Trash2,
  Save,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

// ── Zod schema ───────────────────────────────────────────────────────────────
const shiftFormSchema = z.object({
  customer_id: z.string().min(1, "El cliente es obligatorio"),
  code: z.string().min(1, "El código es obligatorio"),
  shift: z.string().min(1, "El turno es obligatorio"),
  schedule: z.string().min(1, "El horario es obligatorio"),
  hours_per_shift: z.coerce
    .number({ message: "Las horas por turno son obligatorias" })
    .positive("Debe ser un número positivo"),
  description: z.string().min(1, "La descripción es obligatoria"),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

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

export function ShiftsSchedulesPage() {
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
  } = useCatalogList<ShiftSchedule>(shiftScheduleService);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingIdentifier, setDeletingIdentifier] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(shiftFormSchema) as any,
    defaultValues: {
      customer_id: "",
      code: "",
      shift: "",
      schedule: "",
      hours_per_shift: 8,
      description: "",
    },
  });

  const watchedCustomerId = watch("customer_id");

  // ── Load customers ─────────────────────────────────────────────────────────
  useEffect(() => {
    shiftScheduleService
      .listCustomers()
      .then(setCustomers)
      .catch(() => {});
  }, []);

  // ── Open form for create ───────────────────────────────────────────────────
  const handleCreate = () => {
    setEditingId(null);
    reset({
      customer_id: "",
      code: "",
      shift: "",
      schedule: "",
      hours_per_shift: 8,
      description: "",
    });
    setServerError(null);
    setFormOpen(true);
  };

  // ── Open form for edit ─────────────────────────────────────────────────────
  const handleEdit = async (id: string) => {
    setServerError(null);
    try {
      const record = await shiftScheduleService.getById(id);
      setEditingId(id);
      reset({
        customer_id: record.customer_id,
        code: record.code,
        shift: record.shift,
        schedule: record.schedule,
        hours_per_shift: record.hours_per_shift,
        description: record.description,
      });
      setFormOpen(true);
    } catch {
      setServerError("Error al cargar el registro");
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: ShiftFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        customer_id: values.customer_id,
        code: values.code,
        shift: values.shift,
        schedule: values.schedule,
        hours_per_shift: values.hours_per_shift,
        description: values.description,
      };

      if (editingId) {
        await shiftScheduleService.update(editingId, payload);
      } else {
        await shiftScheduleService.create(payload);
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

  const getCustomerName = (customerId: string | null | undefined) => {
    if (!customerId) return "-";
    const customer = customers.find((c) => c.code === customerId);
    return customer?.name || customerId;
  };

  return (
    <>
      <CatalogListLayout
        title="Turnos y Horarios"
        subtitle="Catálogo de turnos y horarios por cliente"
        icon={<Clock className="h-4 w-4 text-primary" />}
        createLabel="Agregar turno"
        searchPlaceholder="Buscar por código, turno, horario..."
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
          const shift = item as ShiftSchedule;
          return (
            <div
              key={shift._id}
              className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] hover:border-l-[3px] hover:border-l-primary hover:pl-[17px] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {shift.code} - {shift.shift}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {shift.schedule} | {shift.hours_per_shift}h
                </p>
              </div>
              <div className="hidden lg:block text-xs text-muted-foreground truncate max-w-[160px]">
                {getCustomerName(shift.customer_id)}
              </div>
              <div className="hidden xl:block text-xs text-muted-foreground truncate max-w-[160px]">
                {shift.description}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={() => handleEdit(shift._id)}
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
                      shift._id,
                      `${shift.code} - ${shift.shift}`,
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
          const shift = item as ShiftSchedule;
          return (
            <Card
              key={shift._id}
              className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {shift.code} - {shift.shift}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shift.schedule} | {shift.hours_per_shift}h
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Cliente: {getCustomerName(shift.customer_id)}</p>
                  <p>{shift.description}</p>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 flex-1"
                    onClick={() => handleEdit(shift._id)}
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
                        shift._id,
                        `${shift.code} - ${shift.shift}`,
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
        emptyIcon={<Clock className="h-8 w-8 text-primary" />}
        emptyTitle="No hay turnos registrados"
        emptySubtitle="Agrega el primer turno para comenzar."
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
                {editingId ? "Modificar turno" : "Agregar turno"}
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
            <div>
              <FloatLabelSelect
                id="customer_id"
                label="Cliente"
                value={watchedCustomerId}
                hasValue={!!watchedCustomerId}
                error={getNestedError(errors, "customer_id")?.message}
                onValueChange={(val) => {
                  if (val) {
                    setValue("customer_id", val, { shouldValidate: true });
                  }
                }}
                valueRenderer={(value) => {
                  if (!value) return "";
                  return customers.find((c) => c.code === value)?.name ?? value;
                }}
              >
                {customers.map((customer) => (
                  <SelectItem key={customer.code} value={customer.code}>
                    {customer.name}
                  </SelectItem>
                ))}
              </FloatLabelSelect>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FloatLabelInput
                  id="code"
                  label="Código"
                  error={getNestedError(errors, "code")?.message}
                  {...register("code")}
                />
              </div>
              <div>
                <FloatLabelInput
                  id="shift"
                  label="Turno"
                  error={getNestedError(errors, "shift")?.message}
                  {...register("shift")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FloatLabelInput
                  id="schedule"
                  label="Horario"
                  error={getNestedError(errors, "schedule")?.message}
                  {...register("schedule")}
                />
              </div>
              <div>
                <FloatLabelInput
                  id="hours_per_shift"
                  label="Horas por turno"
                  type="number"
                  step="0.5"
                  error={getNestedError(errors, "hours_per_shift")?.message}
                  {...register("hours_per_shift")}
                />
              </div>
            </div>

            <div>
              <FloatLabelInput
                id="description"
                label="Descripción"
                error={getNestedError(errors, "description")?.message}
                {...register("description")}
              />
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
        itemName="el turno"
        itemIdentifier={deletingIdentifier}
      />
    </>
  );
}
