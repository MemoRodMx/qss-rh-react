import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCatalogList } from "../hooks/useCatalogList";
import { publicHolidayService } from "../services/publicHolidayService";
import type { PublicHoliday } from "../types";
import {
  CatalogListLayout,
  DeleteDialog,
} from "../components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Pencil,
  Trash2,
  Save,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

// ── Zod schema ───────────────────────────────────────────────────────────────
const holidayFormSchema = z.object({
  year: z.coerce
    .number({ message: "El año es obligatorio" })
    .int()
    .min(2020, "Año inválido")
    .max(2100, "Año inválido"),

  date: z.string().min(1, "La fecha es obligatoria"),
  description: z.string().min(1, "La descripción es obligatoria"),
});

type HolidayFormValues = z.infer<typeof holidayFormSchema>;

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

export function PublicHolidaysPage() {
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
  } = useCatalogList<PublicHoliday>(publicHolidayService);

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
  } = useForm<HolidayFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(holidayFormSchema) as any,
    defaultValues: {
      year: new Date().getFullYear(),
      date: "",
      description: "",
    },
  });

  // ── Open form for create ───────────────────────────────────────────────────
  const handleCreate = () => {
    setEditingId(null);
    reset({
      year: new Date().getFullYear(),
      date: "",
      description: "",
    });
    setServerError(null);
    setFormOpen(true);
  };

  // ── Open form for edit ─────────────────────────────────────────────────────
  const handleEdit = async (id: string) => {
    setServerError(null);
    try {
      const record = await publicHolidayService.getById(id);
      setEditingId(id);
      reset({
        year: record.year,
        date: record.date.split("T")[0],
        description: record.description,
      });
      setFormOpen(true);
    } catch {
      setServerError("Error al cargar el registro");
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: HolidayFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        year: values.year,
        date: values.date,
        description: values.description,
      };

      if (editingId) {
        await publicHolidayService.update(editingId, payload);
      } else {
        await publicHolidayService.create(payload);
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
  const handleDeleteClick = (id: string, description: string) => {
    setDeletingId(id);
    setDeletingIdentifier(description);
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

  const renderFieldError = (fieldName: string) => {
    const error = getNestedError(errors, fieldName);
    if (!error) return null;
    return <p className="mt-1 text-xs text-destructive">{error.message}</p>;
  };

  return (
    <>
      <CatalogListLayout
        title="Días Festivos"
        subtitle="Catálogo de días festivos del año"
        icon={<CalendarDays className="h-4 w-4 text-primary" />}
        createLabel="Agregar día festivo"
        searchPlaceholder="Buscar por descripción, año..."
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
          const holiday = item as PublicHoliday;
          return (
            <div
              key={holiday._id}
              className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] hover:border-l-[3px] hover:border-l-primary hover:pl-[17px] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {holiday.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(holiday.date).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {holiday.year}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={() => handleEdit(holiday._id)}
                  title="Modificar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    handleDeleteClick(holiday._id, holiday.description)
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
          const holiday = item as PublicHoliday;
          return (
            <Card
              key={holiday._id}
              className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                      <CalendarDays className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {holiday.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(holiday.date).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 flex-1"
                    onClick={() => handleEdit(holiday._id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 flex-1 text-destructive hover:text-destructive"
                    onClick={() =>
                      handleDeleteClick(holiday._id, holiday.description)
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
        emptyIcon={<CalendarDays className="h-8 w-8 text-primary" />}
        emptyTitle="No hay días festivos registrados"
        emptySubtitle="Agrega el primer día festivo para comenzar."
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
                {editingId ? "Modificar día festivo" : "Agregar día festivo"}
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
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                type="number"
                {...register("year")}
                className={errors.year ? "border-destructive" : ""}
              />
              {renderFieldError("year")}
            </div>

            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className={errors.date ? "border-destructive" : ""}
              />
              {renderFieldError("date")}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                {...register("description")}
                className={errors.description ? "border-destructive" : ""}
              />
              {renderFieldError("description")}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border/40">
              <Button
                type="submit"
                variant="teal"
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
        itemName="el día festivo"
        itemIdentifier={deletingIdentifier}
      />
    </>
  );
}
