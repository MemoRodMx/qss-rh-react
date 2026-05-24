import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { customerService } from "../services/customerService";
import type { SelectOption, OptimalContracted, Coverage } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Briefcase,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";

// ── Zod schema ──────────────────────────────────────────────────────────────
const customerFormSchema = z.object({
  company_id: z.string().min(1, "La empresa es obligatoria"),
  area_code: z.string().min(1, "El área es obligatoria"),
  rfc: z.string().optional().default(""),
  legal_name: z.string().min(1, "La razón social es obligatoria"),
  contract_date: z.string().nullable().optional().default(null),
  left_date: z.string().nullable().optional().default(null),
  readmission_date: z.string().nullable().optional().default(null),
  addr_street: z.string().optional().default(""),
  addr_number: z.string().optional().default(""),
  addr_interior: z.string().optional().default(""),
  addr_colony: z.string().optional().default(""),
  addr_city: z.string().optional().default(""),
  addr_state: z.string().optional().default(""),
  addr_zipcode: z.string().optional().default(""),
  status: z.string().min(1, "Debe seleccionar un estado"),
});

type FormValues = z.infer<typeof customerFormSchema>;

// ── Tab configuration ───────────────────────────────────────────────────────
type TabId = "general" | "address" | "optimal";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof Building2;
}

const TABS: TabConfig[] = [
  { id: "general", label: "Datos generales", icon: Building2 },
  { id: "address", label: "Dirección", icon: MapPin },
  { id: "optimal", label: "Óptimo contratado", icon: Briefcase },
];

// ── Coverage day labels ─────────────────────────────────────────────────────
const DAY_LABELS = [
  { key: "monday" as const, label: "Lun" },
  { key: "tuesday" as const, label: "Mar" },
  { key: "wednesday" as const, label: "Mié" },
  { key: "thursday" as const, label: "Jue" },
  { key: "friday" as const, label: "Vie" },
  { key: "saturday" as const, label: "Sáb" },
  { key: "sunday" as const, label: "Dom" },
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────
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

function countTabErrors(tabId: TabId, errors: Record<string, unknown>): number {
  let count = 0;

  if (tabId === "general") {
    const fields = [
      "company_id",
      "area_code",
      "rfc",
      "legal_name",
      "contract_date",
      "left_date",
      "readmission_date",
      "status",
    ];
    for (const f of fields) {
      if (getNestedError(errors, f)) count++;
    }
  }

  if (tabId === "address") {
    const fields = [
      "addr_street",
      "addr_number",
      "addr_interior",
      "addr_colony",
      "addr_city",
      "addr_state",
      "addr_zipcode",
    ];
    for (const f of fields) {
      if (getNestedError(errors, f)) count++;
    }
  }

  return count;
}

function createEmptyCoverage(shift: string): Coverage {
  return {
    shift,
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
    monday_off: 0,
    tuesday_off: 0,
    wednesday_off: 0,
    thursday_off: 0,
    friday_off: 0,
    saturday_off: 0,
    sunday_off: 0,
  };
}

function createEmptyOptimalContracted(): OptimalContracted {
  return {
    position: "",
    salary: 0,
    bonus: 0,
    coverage: [],
  };
}

// ── Component ───────────────────────────────────────────────────────────────
export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);

  // Select options
  const [companies, setCompanies] = useState<SelectOption[]>([]);
  const [areas, setAreas] = useState<SelectOption[]>([]);
  const [positions, setPositions] = useState<SelectOption[]>([]);
  const [shifts, setShifts] = useState<SelectOption[]>([]);

  // Optimal contracted state (managed outside react-hook-form)
  const [optimalContracted, setOptimalContracted] = useState<
    OptimalContracted[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues: {
      company_id: "",
      area_code: "",
      rfc: "",
      legal_name: "",
      contract_date: null,
      left_date: null,
      readmission_date: null,
      addr_street: "",
      addr_number: "",
      addr_interior: "",
      addr_colony: "",
      addr_city: "",
      addr_state: "",
      addr_zipcode: "",
      status: "",
    },
  });

  const watchedStatus = watch("status");
  const watchedCompanyId = watch("company_id");
  const watchedAreaCode = watch("area_code");

  // ── Load auxiliary data ───────────────────────────────────────────────────
  const loadAuxData = useCallback(async (customerId?: string) => {
    try {
      const [companiesData, areasData, positionsData, shiftsData] =
        await Promise.all([
          customerService.listCompanies(),
          customerService.listAreas(),
          customerService.listPositions(customerId),
          customerService.listShifts(),
        ]);
      setCompanies(companiesData);
      setAreas(areasData);
      setPositions(positionsData);
      setShifts(shiftsData);
    } catch {
      setServerError("Error al cargar datos auxiliares");
    }
  }, []);

  // ── Load record for edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) {
      loadAuxData();
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        await loadAuxData(id);

        const customer = await customerService.getById(id!);
        if (cancelled) return;

        const companyId =
          typeof customer.company_id === "string"
            ? customer.company_id
            : (customer.company_id?._id ?? "");

        const contractDate = customer.contract_date
          ? new Date(customer.contract_date).toISOString().split("T")[0]
          : null;
        const leftDate = customer.left_date
          ? new Date(customer.left_date).toISOString().split("T")[0]
          : null;
        const readmissionDate = customer.readmission_date
          ? new Date(customer.readmission_date).toISOString().split("T")[0]
          : null;

        reset({
          company_id: companyId,
          area_code: customer.area_code ?? "",
          rfc: customer.rfc ?? "",
          legal_name: customer.legal_name ?? "",
          contract_date: contractDate,
          left_date: leftDate,
          readmission_date: readmissionDate,
          addr_street: customer.address?.street ?? "",
          addr_number: customer.address?.number ?? "",
          addr_interior: customer.address?.interior ?? "",
          addr_colony: customer.address?.colony ?? "",
          addr_city: customer.address?.city ?? "",
          addr_state: customer.address?.state ?? "",
          addr_zipcode: customer.address?.zipcode ?? "",
          status: customer.status ?? "",
        });

        setOptimalContracted(customer.optimal_contracted ?? []);
      } catch {
        setServerError("Error al cargar los datos del cliente");
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, loadAuxData, reset]);

  // ── Optimal contracted handlers ───────────────────────────────────────────
  const addOptimalContracted = () => {
    setOptimalContracted((prev) => [...prev, createEmptyOptimalContracted()]);
  };

  const removeOptimalContracted = (index: number) => {
    setOptimalContracted((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOptimalContracted = (
    index: number,
    field: keyof OptimalContracted,
    value: string | number | null,
  ) => {
    if (value === null) return;
    setOptimalContracted((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addCoverage = (ocIndex: number, shiftCode: string) => {
    setOptimalContracted((prev) => {
      const updated = [...prev];
      const existing = updated[ocIndex].coverage.find(
        (c) => c.shift === shiftCode,
      );
      if (!existing) {
        updated[ocIndex] = {
          ...updated[ocIndex],
          coverage: [
            ...updated[ocIndex].coverage,
            createEmptyCoverage(shiftCode),
          ],
        };
      }
      return updated;
    });
  };

  const removeCoverage = (ocIndex: number, shiftCode: string) => {
    setOptimalContracted((prev) => {
      const updated = [...prev];
      updated[ocIndex] = {
        ...updated[ocIndex],
        coverage: updated[ocIndex].coverage.filter(
          (c) => c.shift !== shiftCode,
        ),
      };
      return updated;
    });
  };

  const updateCoverage = (
    ocIndex: number,
    shiftCode: string,
    field: keyof Coverage,
    value: number,
  ) => {
    setOptimalContracted((prev) => {
      const updated = [...prev];
      updated[ocIndex] = {
        ...updated[ocIndex],
        coverage: updated[ocIndex].coverage.map((c) =>
          c.shift === shiftCode ? { ...c, [field]: value } : c,
        ),
      };
      return updated;
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const optimalContractedPayload = optimalContracted.map((oc) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...rest } = oc;
        return rest;
      });

      const payload: Record<string, unknown> = {
        ...values,
        optimal_contracted: optimalContractedPayload,
      };

      if (isEditMode) {
        await customerService.update(id!, payload);
      } else {
        await customerService.create(payload);
      }

      navigate("/customers");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar el cliente",
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
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEditMode ? "Modificar cliente" : "Agregar cliente"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Actualiza los datos del cliente."
              : "Completa los datos para dar de alta el cliente."}
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
              const hasErrors =
                countTabErrors(
                  tab.id,
                  errors as unknown as Record<string, unknown>,
                ) > 0;
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
                      {countTabErrors(
                        tab.id,
                        errors as unknown as Record<string, unknown>,
                      )}
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
                  <FloatLabelInput
                    id="legal_name"
                    label="Razón social"
                    {...register("legal_name")}
                    error={errors.legal_name?.message}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="rfc"
                    label="RFC"
                    {...register("rfc")}
                    className="uppercase"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FloatLabelSelect
                    id="company_id"
                    label="Empresa"
                    value={watchedCompanyId}
                    hasValue={!!watchedCompanyId}
                    onValueChange={(val) =>
                      setValue("company_id", val ?? "", {
                        shouldValidate: true,
                      })
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
                  <FloatLabelSelect
                    id="area_code"
                    label="Área"
                    value={watchedAreaCode}
                    hasValue={!!watchedAreaCode}
                    onValueChange={(val) =>
                      setValue("area_code", val ?? "", { shouldValidate: true })
                    }
                    valueRenderer={(value) => {
                      if (!value) return "";
                      return (
                        areas.find((a) => (a.code ?? a._id) === value)?.name ??
                        value
                      );
                    }}
                    error={errors.area_code?.message}
                  >
                    {areas.map((a) => (
                      <SelectItem key={a._id} value={a.code ?? a._id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </FloatLabelSelect>
                </div>
                <div>
                  <FloatLabelSelect
                    id="status"
                    label="Estado"
                    value={watchedStatus}
                    hasValue={!!watchedStatus}
                    onValueChange={(val) =>
                      setValue("status", val ?? "", { shouldValidate: true })
                    }
                    valueRenderer={(value) => {
                      if (!value) return "";
                      const labels: Record<string, string> = {
                        ACTIVE: "Activo",
                        INACTIVE: "Inactivo",
                      };
                      return labels[value] ?? value;
                    }}
                    error={errors.status?.message}
                  >
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </FloatLabelSelect>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FloatLabelInput
                    id="contract_date"
                    label="Fecha de contrato"
                    type="date"
                    {...register("contract_date")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="left_date"
                    label="Fecha de baja"
                    type="date"
                    {...register("left_date")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="readmission_date"
                    label="Fecha de readmisión"
                    type="date"
                    {...register("readmission_date")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: DIRECCIÓN ───────────────────────────────────────────────── */}
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
                  <FloatLabelInput
                    id="addr_street"
                    label="Calle"
                    {...register("addr_street")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="addr_number"
                    label="Núm. Exterior"
                    {...register("addr_number")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="addr_interior"
                    label="Núm. Interior"
                    {...register("addr_interior")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="addr_colony"
                    label="Colonia"
                    {...register("addr_colony")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="addr_city"
                    label="Ciudad"
                    {...register("addr_city")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="addr_state"
                    label="Estado"
                    {...register("addr_state")}
                  />
                </div>
                <div>
                  <FloatLabelInput
                    id="addr_zipcode"
                    label="Código Postal"
                    {...register("addr_zipcode")}
                    maxLength={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: PERSONAL ÓPTIMO CONTRATADO ──────────────────────────────── */}
        {activeTab === "optimal" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-4 w-4 text-primary" />
                Personal óptimo contratado
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {optimalContracted.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay personal óptimo contratado registrado.
                </p>
              )}

              {optimalContracted.map((oc, ocIndex) => (
                <div
                  key={ocIndex}
                  className="rounded-xl border-2 border-border/60 bg-card shadow-[var(--shadow-2)] p-5 space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {ocIndex + 1}
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        Puesto {ocIndex + 1}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeOptimalContracted(ocIndex)}
                      title="Eliminar puesto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <FloatLabelSelect
                        label="Puesto"
                        value={oc.position}
                        hasValue={!!oc.position}
                        onValueChange={(val) =>
                          updateOptimalContracted(ocIndex, "position", val)
                        }
                        valueRenderer={(value) => {
                          if (!value) return "";
                          return (
                            positions.find((p) => (p.code ?? p._id) === value)
                              ?.name ?? value
                          );
                        }}
                      >
                        {positions.map((p) => (
                          <SelectItem key={p._id} value={p.code ?? p._id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </FloatLabelSelect>
                    </div>
                    <div>
                      <FloatLabelInput
                        label="Salario ($)"
                        type="number"
                        min={0}
                        step={0.01}
                        value={oc.salary || ""}
                        onChange={(e) =>
                          updateOptimalContracted(
                            ocIndex,
                            "salary",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <div>
                      <FloatLabelInput
                        label="Bono ($)"
                        type="number"
                        min={0}
                        step={0.01}
                        value={oc.bonus || ""}
                        onChange={(e) =>
                          updateOptimalContracted(
                            ocIndex,
                            "bonus",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Coverage section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Cobertura por turno
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {shifts.map((shift, shiftIdx) => {
                          const shiftCode = shift.code ?? shift._id;
                          const hasCoverage = oc.coverage.some(
                            (c) => c.shift === shiftCode,
                          );
                          return (
                            <Button
                              key={shift.code ?? shiftIdx}
                              type="button"
                              variant={hasCoverage ? "default" : "outline"}
                              size="sm"
                              className="cursor-pointer text-xs"
                              onClick={() => {
                                if (hasCoverage) {
                                  removeCoverage(ocIndex, shiftCode);
                                } else {
                                  addCoverage(ocIndex, shiftCode);
                                }
                              }}
                              title={
                                hasCoverage
                                  ? `Quitar turno ${shift.name}`
                                  : `Agregar turno ${shift.name}`
                              }
                            >
                              {hasCoverage ? "✓ " : ""}
                              {shift.name}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {oc.coverage.map((cov, covIndex) => {
                      const shiftName =
                        shifts.find((s) => (s.code ?? s._id) === cov.shift)
                          ?.name ?? cov.shift;
                      return (
                        <div
                          key={cov.shift}
                          className="rounded-xl border-2 border-border/50 bg-gradient-to-b from-muted/20 to-muted/5 shadow-[var(--shadow-1)] p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2 border-b border-border/30 pb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                              {covIndex + 1}
                            </span>
                            <p className="text-xs font-semibold text-foreground">
                              Turno: {shiftName}
                            </p>
                          </div>
                          <div className="grid grid-cols-7 gap-2">
                            {DAY_LABELS.map((day) => (
                              <div key={day.key} className="space-y-1">
                                <p className="text-[10px] text-muted-foreground text-center font-medium">
                                  {day.label}
                                </p>
                                <Input
                                  type="number"
                                  min={0}
                                  value={cov[day.key] ?? 0}
                                  onChange={(e) =>
                                    updateCoverage(
                                      ocIndex,
                                      cov.shift,
                                      day.key,
                                      Number(e.target.value),
                                    )
                                  }
                                  className="h-7 text-xs text-center"
                                  title="Empleados por día"
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  value={
                                    cov[`${day.key}_off` as keyof Coverage] ?? 0
                                  }
                                  onChange={(e) =>
                                    updateCoverage(
                                      ocIndex,
                                      cov.shift,
                                      `${day.key}_off` as keyof Coverage,
                                      Number(e.target.value),
                                    )
                                  }
                                  className="h-7 text-xs text-center border-destructive/30"
                                  title="Descansos máximos permitidos"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-center gap-6 pt-1">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-full bg-primary/40" />
                              Empleados por día
                            </span>
                            <span className="text-[10px] text-destructive/70 flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-full bg-destructive/40" />
                              Descansos máx.
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1"
                onClick={addOptimalContracted}
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar puesto
              </Button>
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
            onClick={() => navigate("/customers")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
