import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { plantsService } from "../services/plantsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { FloatLabelTextarea } from "@/components/ui/float-label-textarea";
import { ArrowLeft, Save, Building2, AlertTriangle } from "lucide-react";

const plantFormSchema = z.object({
  company_id: z.string().min(1, "La empresa es obligatoria"),
  code: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres"),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional().default(""),
});

type PlantFormValues = z.infer<typeof plantFormSchema>;

interface CompanyOption {
  _id: string;
  name: string;
}

export function PlantFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlantFormValues>({
    resolver: zodResolver(plantFormSchema) as any,
    defaultValues: {
      company_id: "",
      code: "",
      name: "",
      description: "",
    },
  });

  const watchedCompanyId = watch("company_id");

  useEffect(() => {
    plantsService.listCompanies().then(setCompanies).catch(() => setCompanies([]));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    async function load() {
      try {
        const plant = await plantsService.getById(id!);
        if (cancelled) return;

        reset({
          company_id: plant.company_id ?? "",
          code: plant.code,
          name: plant.name,
          description: plant.description ?? "",
        });
      } catch {
        setServerError("Error al cargar los datos de la planta");
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, reset]);

  const onSubmit = async (values: PlantFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        company_id: values.company_id,
        code: values.code.toUpperCase(),
        name: values.name,
        description: values.description || undefined,
      };

      if (isEditMode) {
        await plantsService.update(id!, payload);
      } else {
        await plantsService.create(payload);
      }

      navigate("/catalogs/plants");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar la planta",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRecord) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => navigate("/catalogs/plants")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEditMode ? "Modificar planta" : "Agregar planta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Actualiza los datos de la planta."
              : "Completa los datos para registrar la planta."}
          </p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              Datos de la planta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FloatLabelSelect
                  id="company_id"
                  label="Empresa"
                  value={watchedCompanyId}
                  hasValue={!!watchedCompanyId}
                  onValueChange={(val) =>
                    setValue("company_id", val ?? "", { shouldValidate: true })
                  }
                  valueRenderer={(value) => {
                    if (!value) return "";
                    return (
                      companies.find((c) => c._id === value)?.name ?? value
                    );
                  }}
                  error={errors.company_id?.message}
                >
                  {companies.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </FloatLabelSelect>
              </div>
              <div>
                <FloatLabelInput
                  id="code"
                  label="Código"
                  className="uppercase"
                  style={{ textTransform: "uppercase" }}
                  error={errors.code?.message}
                  {...register("code")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <FloatLabelInput
                  id="name"
                  label="Nombre"
                  error={errors.name?.message}
                  {...register("name")}
                />
              </div>
              <div>
                <FloatLabelTextarea
                  id="description"
                  label="Descripción"
                  rows={3}
                  error={errors.description?.message}
                  {...register("description")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-6">
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
            onClick={() => navigate("/catalogs/plants")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
