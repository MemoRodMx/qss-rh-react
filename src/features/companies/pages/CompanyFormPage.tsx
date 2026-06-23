import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { companyService } from "../services/companyService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { FloatLabelDateInput } from "@/components/ui/float-label-date-input";
import {
  ArrowLeft,
  Save,
  Building2,
  FileText,
  MapPin,
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
type TabId = "general" | "documents" | "address";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof Building2;
}

const TABS: TabConfig[] = [
  { id: "general", label: "Datos generales", icon: Building2 },
  { id: "documents", label: "Documentación", icon: FileText },
  { id: "address", label: "Domicilio", icon: MapPin },
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
    },
  });

  const watchedStatus = watch("status");
  const watchedDocuments = watch("documents");

  // ── Load record for edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    async function load() {
      try {
        const company = await companyService.getById(id!);

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

        reset({
          legal_name: company.legal_name,
          rfc: company.rfc,
          patronal_registration: company.patronal_registration,
          legal_representative: company.legal_representative,
          fiscal_reg_number: company.fiscal_reg_number ?? "",
          status: company.status,
          address,
          documents: documents as CompanyFormValues["documents"],
        });
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
  }, [id, isEditMode, reset]);

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
            <CardContent className="p-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FloatLabelInput
                    id="legal_name"
                    label="Razón social"
                    error={errors.legal_name?.message}
                    {...register("legal_name")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="rfc"
                    label="RFC"
                    error={errors.rfc?.message}
                    className="uppercase"
                    style={{ textTransform: "uppercase" }}
                    {...register("rfc")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FloatLabelInput
                    id="patronal_registration"
                    label="Registro patronal"
                    error={errors.patronal_registration?.message}
                    {...register("patronal_registration")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="legal_representative"
                    label="Representante legal"
                    error={errors.legal_representative?.message}
                    {...register("legal_representative")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="fiscal_reg_number"
                    label="Número registro fiscalía"
                    {...register("fiscal_reg_number")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FloatLabelSelect
                    id="status"
                    label="Estado"
                    value={watchedStatus}
                    hasValue={!!watchedStatus}
                    error={errors.status?.message}
                    onValueChange={(val) =>
                      setValue("status", val as "ACTIVE" | "INACTIVE", {
                        shouldValidate: true,
                      })
                    }
                    valueRenderer={(value) => {
                      if (!value) return "";
                      const labels: Record<string, string> = {
                        ACTIVE: "Activo",
                        INACTIVE: "Inactivo",
                      };
                      return labels[value] ?? value;
                    }}
                  >
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </FloatLabelSelect>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: DOCUMENTACIÓN ───────────────────────────────────────────── */}
        {activeTab === "documents" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
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
                          <FloatLabelInput
                            id={`${doc.key}_document_number`}
                            label="Número"
                            error={numError?.message}
                            {...register(
                              `documents.${doc.key}.document_number`,
                            )}
                          />
                        </div>
                        <div>
                          <FloatLabelDateInput
                            id={`${doc.key}_expiration_date`}
                            label="Vencimiento"
                            value={watchedDocuments?.[doc.key]?.expiration_date ?? ""}
                            onChange={(val) =>
                              setValue(
                                `documents.${doc.key}.expiration_date`,
                                val || null,
                                { shouldValidate: true },
                              )
                            }
                            error={dateError?.message}
                          />
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
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FloatLabelInput
                    id="address.street"
                    label="Calle"
                    {...register("address.street")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="address.ext_number"
                    label="Núm. Exterior"
                    {...register("address.ext_number")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="address.int_number"
                    label="Núm. Interior"
                    {...register("address.int_number")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="address.colony"
                    label="Colonia"
                    {...register("address.colony")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="address.city"
                    label="Ciudad"
                    {...register("address.city")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="address.state"
                    label="Estado"
                    {...register("address.state")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="address.zipcode"
                    label="Código Postal"
                    maxLength={5}
                    {...register("address.zipcode")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Action bar ───────────────────────────────────────────────────── */}
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

  return count;
}
