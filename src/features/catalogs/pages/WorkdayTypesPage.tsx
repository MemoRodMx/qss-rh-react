import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCatalogList } from "../hooks/useCatalogList";
import { workdayTypeService } from "../services/workdayTypeService";
import type { WorkdayType } from "../types";
import {
  CatalogListLayout,
  DeleteDialog,
} from "../components/CatalogListLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Pencil,
  Trash2,
  Save,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

const workdayTypeFormSchema = z.object({
  code: z.string().min(1, "El código es obligatorio"),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  status: z.boolean(),
});

type WorkdayTypeFormValues = z.infer<typeof workdayTypeFormSchema>;

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

function StatusBadge({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Habilitado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-800/40 dark:text-red-400">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Deshabilitado
    </span>
  );
}

const STATIC_ICON = <Briefcase className="h-4 w-4 text-primary" />;

export function WorkdayTypesPage() {
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
  } = useCatalogList<WorkdayType>(workdayTypeService);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
  } = useForm<WorkdayTypeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(workdayTypeFormSchema) as any,
    defaultValues: {
      code: "",
      name: "",
      description: "",
      status: true,
    },
  });

  const watchedStatus = watch("status");

  const handleCreate = () => {
    setEditingId(null);
    reset({ code: "", name: "", description: "", status: true });
    setServerError(null);
    setFormOpen(true);
  };

  const handleEdit = async (id: string) => {
    setServerError(null);
    try {
      const record = await workdayTypeService.getById(id);
      setEditingId(id);
      reset({
        code: record.code,
        name: record.name,
        description: record.description ?? "",
        status: record.status,
      });
      setFormOpen(true);
    } catch {
      setServerError("Error al cargar el registro");
    }
  };

  const onSubmit = async (values: WorkdayTypeFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        code: values.code,
        name: values.name,
        description: values.description || "",
        status: values.status,
      };

      if (editingId) {
        await workdayTypeService.update(editingId, payload);
      } else {
        await workdayTypeService.create(payload);
      }

      setFormOpen(false);
      refresh();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(
        err?.response?.data?.message ??
          "Ocurrió un error al guardar el registro",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <>
      <CatalogListLayout
        title="Tipos de Jornada"
        subtitle="Catálogo de tipos de jornada laboral"
        icon={STATIC_ICON}
        createLabel="Agregar tipo de jornada"
        searchPlaceholder="Buscar por código, nombre o descripción..."
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
          const row = item as WorkdayType;
          return (
            <div
              key={row._id}
              className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] hover:border-l-[3px] hover:border-l-primary hover:pl-[17px] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {row.code} - {row.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {row.description || "-"}
                </p>
              </div>
              <div className="hidden lg:block">
                <StatusBadge enabled={row.status} />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={() => handleEdit(row._id)}
                  title="Modificar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    handleDeleteClick(row._id, `${row.code} - ${row.name}`)
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
          const row = item as WorkdayType;
          return (
            <Card
              key={row._id}
              className="border-border/50 bg-card shadow-[var(--shadow-1)] animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/10">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {row.code} - {row.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.description || "-"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge enabled={row.status} />
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 flex-1"
                    onClick={() => handleEdit(row._id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 flex-1 text-destructive hover:text-destructive"
                    onClick={() =>
                      handleDeleteClick(row._id, `${row.code} - ${row.name}`)
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
        emptyIcon={<Briefcase className="h-8 w-8 text-primary" />}
        emptyTitle="No hay tipos de jornada registrados"
        emptySubtitle="Agrega el primer tipo de jornada para comenzar."
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
                  ? "Modificar tipo de jornada"
                  : "Agregar tipo de jornada"}
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
                  id="code"
                  label="Código"
                  error={getNestedError(errors, "code")?.message}
                  {...register("code")}
                />
              </div>
              <div>
                <FloatLabelInput
                  id="name"
                  label="Nombre"
                  error={getNestedError(errors, "name")?.message}
                  {...register("name")}
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

            <div className="flex items-center gap-2">
              <Checkbox
                id="status"
                checked={watchedStatus}
                onCheckedChange={(val) =>
                  setValue("status", val === true, { shouldValidate: true })
                }
              />
              <label
                htmlFor="status"
                className="text-sm text-foreground cursor-pointer"
              >
                Habilitado
              </label>
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
        itemName="el tipo de jornada"
        itemIdentifier={deletingIdentifier}
      />
    </>
  );
}
