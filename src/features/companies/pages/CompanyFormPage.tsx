import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { companyService, type PlantOption } from "../services/companyService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Building2,
  FileText,
  MapPin,
  Warehouse,
  AlertTriangle,
} from "lucide-react";

// ── Document types ──────────────────────────────────────────────────────────
const DOCUMENT_TYPES = [
  { key: "repse", label: "REPSE" },
  { key: "canaco", label: "CANACO" },
  { key: "siem", label: "SIEM" },
  { key: "iso_18788", label: "ISO-18788" },
  { key: "celic", label: "CELIC" },
  { key: "operating_license", label: "Licencia de Operación" },
  { key: "land_use_license", label: "Licencia de Uso de Piso" },
  { key: "suppliers_registry", label: "Registro de Proveedor" },
] as const;

// ── Document pair schema factory ────────────────────────────────────────────
const documentPairSchema = z.object({
  document_number: z.string().optional().default(""),
  expiration_date: z.string().nullable().optional().default(null),
});

function createDocumentsSchema() {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const doc of DOCUMENT_TYPES) {
    shape[doc.key] = documentPairSchema.optional().default({
      document_number: "",
      expiration_date: null,
    });
  }
  return z.object(shape);
}

// ── Address schema ──────────────────────────────────────────────────────────
const addressSchema = z.object({
  street: z.string().optional().default(""),
  ext_number: z.string().optional().default(""),
  int_number: z.string().optional().default(""),
  colony: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  zipcode: z.string().optional().default(""),
});

// ── Zod schema ──────────────────────────────────────────────────────────────
const companyFormSchema = z
  .object({
    legal_name: z.string().min(1, "La razón social es obligatoria"),
    rfc: z
      .string()
      .min(1, "El RFC es obligatorio")
      .regex(
        /^[A-ZÑ&]{3,4}\d{6}[A-V1-9][A-Z1-9][0-9A]$/i,
        "El RFC no tiene un formato válido",
      ),
    patronal_registration: z
      .string()
      .min(1, "El registro patronal es obligatorio"),
    legal_representative: z
      .string()
      .min(1, "El representante legal es obligatorio"),
    fiscal_reg_number: z.string().optional().default(""),
    status: z.string().refine((val) => val === "ACTIVE" || val === "INACTIVE", {
      message: "Debe seleccionar un estado",
    }),
    address: addressSchema.optional(),
    documents: createDocumentsSchema(),
    plants: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    // Cross-validate each document pair
    const docs = data.documents as Record<
      string,
      { document_number?: string; expiration_date?: string | null }
    >;
    for (const doc of DOCUMENT_TYPES) {
      const d = docs[doc.key];
      if (!d) continue;
      const hasNumber = !!d.document_number?.trim();
      const hasDate = !!d.expiration_date;

      if (hasDate && !hasNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El número de documento es obligatorio si se indica una fecha de vencimiento`,
          path: ["documents", doc.key, "document_number"],
        });
      }
      if (hasNumber && !hasDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La fecha de vencimiento es obligatoria si se indica el número de documento`,
          path: ["documents", doc.key, "expiration_date"],
        });
      }
    }
  });

type CompanyFormValues = z.infer<typeof companyFormSchema>;

// ── Tab configuration ───────────────────────────────────────────────────────
type TabId = "general" | "documents" | "address" | "plants";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof Building2;
}

const TABS: TabConfig[] = [
  { id: "general", label: "Datos generales", icon: Building2 },
  { id: "documents", label: "Documentación", icon: FileText },
  { id: "address", label: "Domicilio", icon: MapPin },
  { id: "plants", label: "Plantas", icon: Warehouse },
];

// ── Component ───────────────────────────────────────────────────────────────
export function CompanyFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);
  const [availPlants, setAvailPlants] = useState<PlantOption[]>([]);
  const [selPlants, setSelPlants] = useState<PlantOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(companyFormSchema) as any,
    defaultValues: {
      legal_name: "",
      rfc: "",
      patronal_registration: "",
      legal_representative: "",
      fiscal_reg_number: "",
      status: "" as "ACTIVE" | "INACTIVE",
      address: {
        street: "",
        ext_number: "",
        int_number: "",
        colony: "",
        city: "",
        state: "",
        zipcode: "",
      },
      documents: {},
      plants: [],
    },
  });

  const watchedStatus = watch("status");

  // ── Load plants ───────────────────────────────────────────────────────────
  const loadPlants = useCallback(async (companyId?: string) => {
    try {
      const [available, selected] = await companyService.listPlants(companyId);
      setAvailPlants(available);
      setSelPlants(selected);
    } catch {
      setAvailPlants([]);
      setSelPlants([]);
    }
  }, []);

  // ── Load record for edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) {
      loadPlants();
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [company, [available, selected]] = await Promise.all([
          companyService.getById(id!),
          companyService.listPlants(id),
        ]);

        if (cancelled) return;

        // Normalize document fields from nested objects to flat keys
        const documents: Record<
          string,
          { document_number: string; expiration_date: string | null }
        > = {};
        for (const doc of DOCUMENT_TYPES) {
          const companyAny = company as unknown as Record<string, unknown>;
          const docData = companyAny[doc.key] as
            | { document_number?: string; expiration_date?: string }
            | undefined;
          documents[doc.key] = {
            document_number: docData?.document_number ?? "",
            expiration_date: docData?.expiration_date
              ? new Date(docData.expiration_date).toISOString().split("T")[0]
              : null,
          };
        }

        // Map address fields
        const addr = company.address || {};
        const address = {
          street: addr.street ?? "",
          ext_number: addr.ext_number ?? "",
          int_number: addr.int_number ?? "",
          colony: addr.colony ?? "",
          city: addr.city ?? "",
          state: addr.state ?? "",
          zipcode: addr.zipcode ?? "",
        };

        // Selected plants
        const plantIds = selected.map((p) => p._id);

        reset({
          legal_name: company.legal_name,
          rfc: company.rfc,
          patronal_registration: company.patronal_registration,
          legal_representative: company.legal_representative,
          fiscal_reg_number: company.fiscal_reg_number ?? "",
          status: company.status,
          address,
          documents: documents as CompanyFormValues["documents"],
          plants: plantIds,
        });

        setAvailPlants(available);
        setSelPlants(selected);
      } catch {
        setServerError("Error al cargar los datos de la empresa");
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, loadPlants, reset]);

  // ── Toggle plant selection ────────────────────────────────────────────────
  const togglePlant = (plantId: string) => {
    // Find the plant in either list
    const plant =
      availPlants.find((p) => p._id === plantId) ||
      selPlants.find((p) => p._id === plantId);
    if (!plant) return;

    if (selPlants.find((p) => p._id === plantId)) {
      // Move from selected to available
      setSelPlants((prev) => prev.filter((p) => p._id !== plantId));
      setAvailPlants((prev) => [...prev, plant]);
    } else {
      // Move from available to selected
      setAvailPlants((prev) => prev.filter((p) => p._id !== plantId));
      setSelPlants((prev) => [...prev, plant]);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: CompanyFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Build payload matching API expectations
      const payload: Record<string, unknown> = {
        legal_name: values.legal_name,
        rfc: values.rfc.toUpperCase(),
        patronal_registration: values.patronal_registration,
        legal_representative: values.legal_representative,
        fiscal_reg_number: values.fiscal_reg_number || undefined,
        status: values.status,
        address: values.address,
        plants: selPlants.map((p) => ({ plant_id: p._id })),
      };

      // Add document fields
      const docs = values.documents as Record<
        string,
        { document_number?: string; expiration_date?: string | null }
      >;
      for (const doc of DOCUMENT_TYPES) {
        const d = docs[doc.key];
        if (d?.document_number || d?.expiration_date) {
          payload[doc.key] = {
            document_number: d.document_number || undefined,
            expiration_date: d.expiration_date || undefined,
          };
        }
      }

      if (isEditMode) {
        await companyService.update(id!, payload);
      } else {
        await companyService.create(payload);
      }

      navigate("/companies");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar la empresa",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderFieldError = (fieldName: string) => {
    const error = getNestedError(errors, fieldName);
    if (!error) return null;
    return <p className="mt-1 text-xs text-destructive">{error.message}</p>;
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoadingRecord) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => navigate("/companies")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEditMode ? "Modificar empresa" : "Agregar empresa"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Actualiza los datos de la empresa."
              : "Completa los datos para dar de alta la empresa."}
          </p>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-border">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const hasErrors = countTabErrors(tab.id, errors) > 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {hasErrors && (
                    <Badge
                      variant="destructive"
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {countTabErrors(tab.id, errors)}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB: DATOS GENERALES ─────────────────────────────────────────── */}
        {activeTab === "general" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-primary" />
                Identificación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="legal_name">Razón social</Label>
                  <Input
                    id="legal_name"
                    {...register("legal_name")}
                    className={errors.legal_name ? "border-destructive" : ""}
                  />
                  {renderFieldError("legal_name")}
                </div>
                <div>
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    {...register("rfc")}
                    className={`uppercase ${errors.rfc ? "border-destructive" : ""}`}
                    style={{ textTransform: "uppercase" }}
                  />
                  {renderFieldError("rfc")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="patronal_registration">
                    Registro patronal
                  </Label>
                  <Input
                    id="patronal_registration"
                    {...register("patronal_registration")}
                    className={
                      errors.patronal_registration ? "border-destructive" : ""
                    }
                  />
                  {renderFieldError("patronal_registration")}
                </div>
                <div>
                  <Label htmlFor="legal_representative">
                    Representante legal
                  </Label>
                  <Input
                    id="legal_representative"
                    {...register("legal_representative")}
                    className={
                      errors.legal_representative ? "border-destructive" : ""
                    }
                  />
                  {renderFieldError("legal_representative")}
                </div>
                <div>
                  <Label htmlFor="fiscal_reg_number">
                    Número registro fiscalía
                  </Label>
                  <Input
                    id="fiscal_reg_number"
                    {...register("fiscal_reg_number")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={watchedStatus}
                    onValueChange={(val) =>
                      setValue("status", val as "ACTIVE" | "INACTIVE", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className={errors.status ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderFieldError("status")}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: DOCUMENTACIÓN ───────────────────────────────────────────── */}
        {activeTab === "documents" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {DOCUMENT_TYPES.map((doc) => {
                  const numError = getNestedError(
                    errors,
                    `documents.${doc.key}.document_number`,
                  );
                  const dateError = getNestedError(
                    errors,
                    `documents.${doc.key}.expiration_date`,
                  );
                  return (
                    <div
                      key={doc.key}
                      className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {doc.label}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor={`${doc.key}_document_number`}
                            className="text-xs"
                          >
                            Número
                          </Label>
                          <Input
                            id={`${doc.key}_document_number`}
                            {...register(
                              `documents.${doc.key}.document_number`,
                            )}
                            className={numError ? "border-destructive" : ""}
                          />
                          {numError && (
                            <p className="mt-1 text-xs text-destructive">
                              {numError.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor={`${doc.key}_expiration_date`}
                            className="text-xs"
                          >
                            Vencimiento
                          </Label>
                          <Input
                            id={`${doc.key}_expiration_date`}
                            type="date"
                            {...register(
                              `documents.${doc.key}.expiration_date`,
                            )}
                            className={dateError ? "border-destructive" : ""}
                          />
                          {dateError && (
                            <p className="mt-1 text-xs text-destructive">
                              {dateError.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: DOMICILIO ───────────────────────────────────────────────── */}
        {activeTab === "address" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                Domicilio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address.street">Calle</Label>
                  <Input id="address.street" {...register("address.street")} />
                </div>
                <div>
                  <Label htmlFor="address.ext_number">Núm. Exterior</Label>
                  <Input
                    id="address.ext_number"
                    {...register("address.ext_number")}
                  />
                </div>
                <div>
                  <Label htmlFor="address.int_number">Núm. Interior</Label>
                  <Input
                    id="address.int_number"
                    {...register("address.int_number")}
                  />
                </div>
                <div>
                  <Label htmlFor="address.colony">Colonia</Label>
                  <Input id="address.colony" {...register("address.colony")} />
                </div>
                <div>
                  <Label htmlFor="address.city">Ciudad</Label>
                  <Input id="address.city" {...register("address.city")} />
                </div>
                <div>
                  <Label htmlFor="address.state">Estado</Label>
                  <Input id="address.state" {...register("address.state")} />
                </div>
                <div>
                  <Label htmlFor="address.zipcode">Código Postal</Label>
                  <Input
                    id="address.zipcode"
                    {...register("address.zipcode")}
                    maxLength={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: PLANTAS ─────────────────────────────────────────────────── */}
        {activeTab === "plants" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Warehouse className="h-4 w-4 text-primary" />
                Asignación de plantas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available plants */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Disponibles ({availPlants.length})
                  </p>
                  <div className="rounded-lg border border-border/50 bg-muted/20 min-h-[200px] max-h-[300px] overflow-y-auto">
                    {availPlants.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">
                        No hay plantas disponibles
                      </p>
                    ) : (
                      availPlants.map((plant) => (
                        <button
                          key={plant._id}
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 transition-colors cursor-pointer border-b border-border/30 last:border-b-0"
                          onClick={() => togglePlant(plant._id)}
                        >
                          <span className="text-muted-foreground">
                            ({plant.code})
                          </span>{" "}
                          {plant.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Selected plants */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Seleccionadas ({selPlants.length})
                  </p>
                  <div className="rounded-lg border border-border/50 bg-muted/20 min-h-[200px] max-h-[300px] overflow-y-auto">
                    {selPlants.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">
                        Ninguna planta seleccionada
                      </p>
                    ) : (
                      selPlants.map((plant) => (
                        <button
                          key={plant._id}
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/5 transition-colors cursor-pointer border-b border-border/30 last:border-b-0"
                          onClick={() => togglePlant(plant._id)}
                        >
                          <span className="text-muted-foreground">
                            ({plant.code})
                          </span>{" "}
                          {plant.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Haz clic en una planta para moverla entre las listas.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Action bar ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-6">
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
            onClick={() => navigate("/companies")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Helper: get nested error from react-hook-form errors ────────────────────
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

// ── Helper: count errors per tab ────────────────────────────────────────────
function countTabErrors(tabId: TabId, errors: Record<string, unknown>): number {
  let count = 0;

  if (tabId === "general") {
    const fields = [
      "legal_name",
      "rfc",
      "patronal_registration",
      "legal_representative",
      "fiscal_reg_number",
      "status",
    ];
    for (const f of fields) {
      if (getNestedError(errors, f)) count++;
    }
  }

  if (tabId === "documents") {
    for (const doc of DOCUMENT_TYPES) {
      if (getNestedError(errors, `documents.${doc.key}.document_number`))
        count++;
      if (getNestedError(errors, `documents.${doc.key}.expiration_date`))
        count++;
    }
  }

  if (tabId === "address") {
    const fields = [
      "address.street",
      "address.ext_number",
      "address.int_number",
      "address.colony",
      "address.city",
      "address.state",
      "address.zipcode",
    ];
    for (const f of fields) {
      if (getNestedError(errors, f)) count++;
    }
  }

  if (tabId === "plants") {
    if (getNestedError(errors, "plants")) count++;
  }

  return count;
}
