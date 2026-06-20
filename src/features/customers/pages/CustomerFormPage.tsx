import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { customerService, type PlantOption } from "../services/customerService";
import type { SelectOption, OptimalContracted, Coverage, CsfData } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { CsfUploader } from "../components/CsfUploader";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Briefcase,
  LayoutGrid,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";

const customerFormSchema = z.object({
  plant_id: z.string().optional().default(""),
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

const coverageSchema = z.object({
  shift: z.string().min(1, "Debe seleccionar el turno"),
  workday_type: z.string().optional(),
  monday: z.number().int().min(0, "No puede ser negativo").optional(),
  tuesday: z.number().int().min(0, "No puede ser negativo").optional(),
  wednesday: z.number().int().min(0, "No puede ser negativo").optional(),
  thursday: z.number().int().min(0, "No puede ser negativo").optional(),
  friday: z.number().int().min(0, "No puede ser negativo").optional(),
  saturday: z.number().int().min(0, "No puede ser negativo").optional(),
  sunday: z.number().int().min(0, "No puede ser negativo").optional(),
  monday_off: z.number().int().min(0, "No puede ser negativo").optional(),
  tuesday_off: z.number().int().min(0, "No puede ser negativo").optional(),
  wednesday_off: z.number().int().min(0, "No puede ser negativo").optional(),
  thursday_off: z.number().int().min(0, "No puede ser negativo").optional(),
  friday_off: z.number().int().min(0, "No puede ser negativo").optional(),
  saturday_off: z.number().int().min(0, "No puede ser negativo").optional(),
  sunday_off: z.number().int().min(0, "No puede ser negativo").optional(),
});

const optimalContractedSchema = z.array(
  z.object({
    position: z.string().min(1, "Debe seleccionar el puesto").optional(),
    salary: z.number().min(0, "No puede ser negativo").optional(),
    bonus: z.number().min(0, "No puede ser negativo").optional(),
    area_id: z.string().optional(),
    coverage: z.array(coverageSchema).optional(),
  }),
);

type FormValues = z.infer<typeof customerFormSchema>;

type TabId = "general" | "address" | "optimal" | "areas";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof Building2;
}

const TABS: TabConfig[] = [
  { id: "general", label: "Datos generales", icon: Building2 },
  { id: "address", label: "Dirección", icon: MapPin },
  { id: "areas", label: "Áreas", icon: LayoutGrid },
  { id: "optimal", label: "Óptimo contratado", icon: Briefcase },
];

const DAY_LABELS = [
  { key: "monday" as const, label: "Lun" },
  { key: "tuesday" as const, label: "Mar" },
  { key: "wednesday" as const, label: "Mié" },
  { key: "thursday" as const, label: "Jue" },
  { key: "friday" as const, label: "Vie" },
  { key: "saturday" as const, label: "Sáb" },
  { key: "sunday" as const, label: "Dom" },
] as const;

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

function countTabErrors(tabId: TabId, errors: Record<string, unknown>, ocErrors?: Record<string, string>): number {
  let count = 0;

  if (tabId === "general") {
    const fields = [
      "plant_id",
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

  if (tabId === "areas") {
    if (getNestedError(errors, "areas")) count++;
  }

  if (tabId === "optimal" && ocErrors) {
    count = Object.keys(ocErrors).length;
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
    area_id: "",
    coverage: [],
  };
}

function zodIssuesToOcErrors(
  issues: z.ZodIssue[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const parts = issue.path.map(String);
    let key: string;
    if (parts.length >= 2 && parts[1] === "coverage" && parts.length >= 4) {
      key = `${parts[0]}-${parts[2]}-${parts.slice(3).join("-")}`;
    } else if (parts.length >= 2) {
      key = `${parts[0]}-${parts.slice(1).join("-")}`;
    } else {
      key = parts.join("-") || "__root";
    }
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

interface ServerFieldError {
  field: string;
  errors: string[];
}

function serverErrorsToOcErrors(
  serverErrors: ServerFieldError[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const se of serverErrors) {
    const parts = se.field.split(".");
    if (parts[0] === "optimal_contracted") {
      parts.shift();
    }
    let key: string;
    if (parts.length >= 2 && parts[1] === "coverage" && parts.length >= 4) {
      key = `${parts[0]}-${parts[2]}-${parts.slice(3).join("-")}`;
    } else if (parts.length >= 2) {
      key = `${parts[0]}-${parts.slice(1).join("-")}`;
    } else {
      key = parts.join("-") || "__root";
    }
    errors[key] = se.errors.join(", ");
  }
  return errors;
}

function hasAnyError(
  ocErrors: Record<string, string>,
  ocIndex: number,
  covIndex?: number,
): boolean {
  const prefix = covIndex !== undefined
    ? `${ocIndex}-${covIndex}-`
    : `${ocIndex}-`;
  return Object.keys(ocErrors).some((k) => k.startsWith(prefix));
}

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);

  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [areas, setAreas] = useState<SelectOption[]>([]);
  const [positions, setPositions] = useState<SelectOption[]>([]);
  const [shifts, setShifts] = useState<SelectOption[]>([]);
  const [workdayTypes, setWorkdayTypes] = useState<SelectOption[]>([]);

  const [optimalContracted, setOptimalContracted] = useState<
    OptimalContracted[]
  >([]);

  const [availAreas, setAvailAreas] = useState<SelectOption[]>([]);
  const [selAreas, setSelAreas] = useState<SelectOption[]>([]);

  const [ocErrors, setOcErrors] = useState<Record<string, string>>({});

  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);

  const groupedByArea = useMemo(() => {
    const map = new Map<string, { area: SelectOption | null; positions: { pos: OptimalContracted; idx: number }[] }>();

    for (const area of selAreas) {
      map.set(area._id, { area, positions: [] });
    }

    let hasOrphans = false;
    for (const [idx, oc] of optimalContracted.entries()) {
      if (oc.area_id && map.has(oc.area_id)) {
        map.get(oc.area_id)!.positions.push({ pos: oc, idx });
      } else {
        hasOrphans = true;
        const key = oc.area_id || "__unassigned__";
        if (!map.has(key)) {
          map.set(key, { area: null, positions: [] });
        }
        map.get(key)!.positions.push({ pos: oc, idx });
      }
    }

    const groups = Array.from(map.entries())
      .filter(([key]) => key !== "__unassigned__")
      .map(([key, g]) => ({
        key,
        area: g.area,
        areaLabel: `${g.area?.code ?? ""} - ${g.area?.name ?? "Área no disponible"}`,
        positions: g.positions,
        count: g.positions.length,
        isAreaGroup: true,
      }))
      .sort((a, b) => (a.area?.name ?? "").localeCompare(b.area?.name ?? ""));

    if (hasOrphans) {
      const orphanPositions = optimalContracted
        .map((pos, idx) => ({ pos, idx }))
        .filter(({ pos }) => !pos.area_id || !selAreas.some((a) => a._id === pos.area_id));
      groups.push({
        key: "__unassigned__",
        area: null,
        areaLabel: "Sin área",
        positions: orphanPositions,
        count: orphanPositions.length,
        isAreaGroup: false,
      });
    }

    return groups;
  }, [optimalContracted, selAreas]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(customerFormSchema) as any,
    defaultValues: {
      plant_id: "",
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
  const watchedPlantId = watch("plant_id");

  const loadAuxData = useCallback(async (customerId?: string) => {
    try {
      const [areasData, positionsData, shiftsData, workdayTypesData] =
        await Promise.all([
          customerService.listAreas(customerId),
          customerService.listPositions(customerId),
          customerService.listShifts(),
          customerService.listWorkdayTypes(),
        ]);
      setAreas(areasData);
      setPositions(positionsData);
      setShifts(shiftsData);
      setWorkdayTypes(workdayTypesData);
    } catch {
      setServerError("Error al cargar datos auxiliares");
    }
  }, []);

  const loadPlants = useCallback(async () => {
    try {
      const [available] = await customerService.listPlants();
      setPlants(available);
    } catch {
      setPlants([]);
    }
  }, []);

  const loadAreas = useCallback(async (customerId?: string) => {
    try {
      const [available, selected] = await customerService.listAreasPickList(customerId);
      setAvailAreas(available);
      setSelAreas(selected);
    } catch {
      setAvailAreas([]);
      setSelAreas([]);
    }
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      loadAuxData();
      loadPlants();
      loadAreas();
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        await loadAuxData(id);
        await loadPlants();
        await loadAreas(id);

        const customer = await customerService.getById(id!);
        if (cancelled) return;

        const plantId =
          typeof customer.plant_id === "string"
            ? customer.plant_id
            : (customer.plant_id?._id ?? "");

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
          plant_id: plantId,
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

        const loadedOC = (customer.optimal_contracted ?? []).map((oc) => ({
          ...oc,
          coverage: oc.coverage.map((cov) => {
            const { modality: legacyModalidad, ...rest } = cov as unknown as Record<string, unknown>;
            return {
              ...rest,
              workday_type: ((legacyModalidad || cov.workday_type) as string)?.toUpperCase(),
            } as Coverage;
          }),
        }));
        setOptimalContracted(loadedOC);
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
  }, [id, isEditMode, loadAuxData, loadPlants, loadAreas, reset]);

  const addEmptyCoverage = useCallback(
    (ocIndex: number, shift: string) => {
      setOptimalContracted((prev) => {
        const next = [...prev];
        if (!next[ocIndex]) return prev;
        const existing = next[ocIndex].coverage ?? [];
        if (existing.some((cov) => cov.shift === shift)) return prev;
        next[ocIndex] = {
          ...next[ocIndex],
          coverage: [...existing, createEmptyCoverage(shift)],
        };
        return next;
      });
    },
    [],
  );

  const handleCsfApply = useCallback(
    (csfData: CsfData) => {
      if (csfData.rfc) setValue("rfc", csfData.rfc, { shouldValidate: true });
      if (csfData.legal_name)
        setValue("legal_name", csfData.legal_name, { shouldValidate: true });
      if (csfData.address.street)
        setValue("addr_street", csfData.address.street);
      if (csfData.address.number)
        setValue("addr_number", csfData.address.number);
      if (csfData.address.interior)
        setValue("addr_interior", csfData.address.interior);
      if (csfData.address.colony)
        setValue("addr_colony", csfData.address.colony);
      if (csfData.address.city)
        setValue("addr_city", csfData.address.city);
      if (csfData.address.state)
        setValue("addr_state", csfData.address.state);
      if (csfData.address.zipcode)
        setValue("addr_zipcode", csfData.address.zipcode);
    },
    [setValue],
  );

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setOcErrors({});
    setIsSubmitting(true);

    const ocResult = optimalContractedSchema.safeParse(optimalContracted);
    if (!ocResult.success) {
      const newErrors = zodIssuesToOcErrors(ocResult.error.issues);
      setOcErrors(newErrors);
      setActiveTab("optimal");
      setIsSubmitting(false);
      return;
    }

    try {
      const optimalContractedPayload = optimalContracted.map((oc) => {
        const { _id, ...rest } = oc;
        void _id;
        return {
          ...rest,
          coverage: (rest.coverage ?? []).map((cov) => {
            const { area_id: _a, ...cleanCov } = cov as Coverage & { area_id?: string };
            void _a;
            return cleanCov;
          }),
        };
      });

      const payload: Record<string, unknown> = {
        ...values,
        optimal_contracted: optimalContractedPayload,
        areas: selAreas.map((a) => ({ area_id: a._id })),
      };

      if (isEditMode) {
        await customerService.update(id!, payload);
      } else {
        await customerService.create(payload);
      }

      navigate("/customers");
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            errors?: ServerFieldError[];
          };
        };
      };

      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors) && serverErrors.length > 0) {
        const parsed = serverErrorsToOcErrors(serverErrors);
        if (Object.keys(parsed).length > 0) {
          setOcErrors(parsed);
          setActiveTab("optimal");
          setIsSubmitting(false);
          return;
        }
      }

      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar el cliente",
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
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const toggleArea = (areaId: string) => {
    const isSelected = selAreas.some((a) => a._id === areaId);
    if (isSelected) {
      const area = selAreas.find((a) => a._id === areaId);
      setSelAreas((prev) => prev.filter((a) => a._id !== areaId));
      if (area) setAvailAreas((prev) => [...prev, area]);
    } else {
      const area = availAreas.find((a) => a._id === areaId);
      setAvailAreas((prev) => prev.filter((a) => a._id !== areaId));
      if (area) setSelAreas((prev) => [...prev, area]);
    }
  };

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isEditMode ? "Modificar cliente" : "Agregar cliente"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Actualiza los datos del cliente."
              : "Completa los datos para dar de alta el cliente."}
          </p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <div className="border-b border-border/40 px-5">
            <div className="flex">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const hasErrors =
                  countTabErrors(
                    tab.id,
                    errors as unknown as Record<string, unknown>,
                    ocErrors,
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
                          ocErrors,
                        )}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "general" && (
            <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
              <CardContent className="p-5 space-y-6">
                {!isEditMode && (
                  <CsfUploader onApply={handleCsfApply} disabled={isSubmitting} />
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FloatLabelInput
                      id="rfc"
                      label="RFC"
                      className="uppercase"
                      {...register("rfc")}
                      error={errors.rfc?.message}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FloatLabelInput
                      id="legal_name"
                      label="Razón social"
                      className="uppercase"
                      {...register("legal_name")}
                      error={errors.legal_name?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FloatLabelSelect
                      id="plant_id"
                      label="Planta"
                      value={watchedPlantId}
                      hasValue={!!watchedPlantId}
                      onValueChange={(val) =>
                        setValue("plant_id", val ?? "", {
                          shouldValidate: true,
                        })
                      }
                      valueRenderer={(value) => {
                        if (!value) return "";
                        return (
                          plants.find((p) => p._id === value)?.name ?? value
                        );
                      }}
                      error={errors.plant_id?.message}
                    >
                      {plants.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          ({p.code}) {p.name}
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
                      error={errors.contract_date?.message}
                    />
                  </div>
                  <div>
                    <FloatLabelInput
                      id="left_date"
                      label="Fecha de baja"
                      type="date"
                      {...register("left_date")}
                      error={errors.left_date?.message}
                    />
                  </div>
                  <div>
                    <FloatLabelInput
                      id="readmission_date"
                      label="Fecha de reingreso"
                      type="date"
                      {...register("readmission_date")}
                      error={errors.readmission_date?.message}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "address" && (
            <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FloatLabelInput
                      id="addr_street"
                      label="Calle"
                      className="uppercase"
                      {...register("addr_street")}
                      error={errors.addr_street?.message}
                    />
                  </div>
                  <div>
                    <FloatLabelInput
                      id="addr_number"
                      label="Número"
                      className="uppercase"
                      {...register("addr_number")}
                      error={errors.addr_number?.message}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FloatLabelInput
                      id="addr_interior"
                      label="Interior"
                      className="uppercase"
                      {...register("addr_interior")}
                      error={errors.addr_interior?.message}
                    />
                  </div>
                  <div>
                    <FloatLabelInput
                      id="addr_colony"
                      label="Colonia"
                      className="uppercase"
                      {...register("addr_colony")}
                      error={errors.addr_colony?.message}
                    />
                  </div>
                  <div>
                    <FloatLabelInput
                      id="addr_city"
                      label="Ciudad"
                      className="uppercase"
                      {...register("addr_city")}
                      error={errors.addr_city?.message}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FloatLabelInput
                      id="addr_state"
                      label="Estado"
                      className="uppercase"
                      {...register("addr_state")}
                      error={errors.addr_state?.message}
                    />
                  </div>
                  <div>
                    <FloatLabelInput
                      id="addr_zipcode"
                      label="C.P."
                      className="uppercase"
                      {...register("addr_zipcode")}
                      error={errors.addr_zipcode?.message}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "areas" && (
            <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Disponibles ({availAreas.length})
                    </p>
                    <div className="rounded-lg border border-border/50 bg-muted/20 min-h-[200px] max-h-[300px] overflow-y-auto">
                      {availAreas.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                          No hay áreas disponibles
                        </p>
                      ) : (
                        availAreas.map((area) => (
                          <button
                            key={area._id}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 transition-colors cursor-pointer border-b border-border/30 last:border-b-0"
                            onClick={() => toggleArea(area._id ?? "")}
                          >
                            <span className="text-muted-foreground">
                              ({area.code ?? area._id})
                            </span>{" "}
                            {area.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Seleccionadas ({selAreas.length})
                    </p>
                    <div className="rounded-lg border border-border/50 bg-muted/20 min-h-[200px] max-h-[300px] overflow-y-auto">
                      {selAreas.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                          Ninguna área seleccionada
                        </p>
                      ) : (
                        selAreas.map((area) => (
                          <button
                            key={area._id}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/5 transition-colors cursor-pointer border-b border-border/30 last:border-b-0"
                            onClick={() => toggleArea(area._id ?? "")}
                          >
                            <span className="text-muted-foreground">
                              ({area.code ?? area._id})
                            </span>{" "}
                            {area.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Haz clic en un área para moverla entre disponibles y seleccionadas.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "optimal" && (
            <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
              <CardContent className="p-5 space-y-4">
                {optimalContracted.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {isEditMode
                      ? "No hay datos de óptimo contratado configurados."
                      : "Disponible tras guardar el cliente."}
                  </p>
                ) : (
                  <Accordion
                    type="multiple"
                    value={expandedAreas}
                    onValueChange={setExpandedAreas}
                  >
                    {groupedByArea.map((group) => (
                      <AccordionItem key={group.key} value={group.key}>
                        <AccordionHeader>
                          <AccordionTrigger>
                            <span className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{group.areaLabel}</span>
                              <Badge variant="secondary" className="text-[10px] px-1.5">
                                {group.count}
                              </Badge>
                            </span>
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {/* Per-group add button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="cursor-pointer gap-1 text-xs"
                              onClick={() => {
                                const isUnassigned = group.key === "__unassigned__";
                                const areaId = isUnassigned ? "" : group.key;
                                const newIdx = optimalContracted.length;
                                setExpandedAreas((prev) =>
                                  prev.includes(group.key) ? prev : [...prev, group.key],
                                );
                                setOptimalContracted((prev) => [
                                  ...prev,
                                  { ...createEmptyOptimalContracted(), area_id: areaId },
                                ]);
                                setTimeout(() => {
                                  const el = document.getElementById(`oc-position-${newIdx}`);
                                  el?.focus();
                                }, 50);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                              Agregar puesto
                            </Button>
                            {group.positions.map(({ pos: oc, idx: ocIdx }) => (
                  <div key={ocIdx} data-oc-idx={ocIdx} className="border border-border/40 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Puesto {ocIdx + 1}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7 text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar puesto</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que deseas eliminar este puesto y sus coberturas?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() =>
                                setOptimalContracted((prev) =>
                                  prev.filter((_, i) => i !== ocIdx),
                                )
                              }
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <FloatLabelSelect
                          id={`oc-position-${ocIdx}`}
                          label="Puesto"
                          value={oc.position}
                          hasValue={!!oc.position}
                          onValueChange={(val) => {
                            setOcErrors((prev) => {
                              const next = { ...prev };
                              delete next[`${ocIdx}-position`];
                              return next;
                            });
                            setOptimalContracted((prev) => {
                              const next = [...prev];
                              next[ocIdx] = { ...next[ocIdx], position: val ?? "" };
                              return next;
                            });
                          }}
                          valueRenderer={(value) => {
                            if (!value) return "";
                            const pos = positions.find((p) => (p.code ?? p._id) === value);
                            return pos ? `${pos.code ?? pos._id} - ${pos.name}` : value;
                          }}
                          error={ocErrors[`${ocIdx}-position`]}
                        >
                          {positions.map((p) => (
                            <SelectItem key={p._id ?? p.code} value={p.code ?? p._id}>
                              {p.code ?? p._id} - {p.name}
                            </SelectItem>
                          ))}
                        </FloatLabelSelect>
                      </div>
                      <div>
                        <FloatLabelInput
                          id={`oc-salary-${ocIdx}`}
                          label="Salario"
                          type="number"
                          value={oc.salary === 0 ? "" : String(oc.salary)}
                          onChange={(e) => {
                            setOcErrors((prev) => {
                              const next = { ...prev };
                              delete next[`${ocIdx}-salary`];
                              return next;
                            });
                            setOptimalContracted((prev) => {
                              const next = [...prev];
                              next[ocIdx] = {
                                ...next[ocIdx],
                                salary: Number(e.target.value) || 0,
                              };
                              return next;
                            });
                          }}
                          error={ocErrors[`${ocIdx}-salary`]}
                        />
                      </div>
                      <div>
                        <FloatLabelInput
                          id={`oc-bonus-${ocIdx}`}
                          label="Bono"
                          type="number"
                          value={oc.bonus === 0 ? "" : String(oc.bonus)}
                          onChange={(e) => {
                            setOcErrors((prev) => {
                              const next = { ...prev };
                              delete next[`${ocIdx}-bonus`];
                              return next;
                            });
                            setOptimalContracted((prev) => {
                              const next = [...prev];
                              next[ocIdx] = {
                                ...next[ocIdx],
                                bonus: Number(e.target.value) || 0,
                              };
                              return next;
                            });
                          }}
                          error={ocErrors[`${ocIdx}-bonus`]}
                        />
                      </div>
                      {group.key === "__unassigned__" && (
                      <div>
                        <FloatLabelSelect
                          id={`oc-area-${ocIdx}`}
                          label="Área"
                          value={oc.area_id}
                          hasValue={!!oc.area_id}
                          onValueChange={(val) => {
                            setOcErrors((prev) => {
                              const next = { ...prev };
                              delete next[`${ocIdx}-area_id`];
                              return next;
                            });
                            setOptimalContracted((prev) => {
                              const next = [...prev];
                              next[ocIdx] = { ...next[ocIdx], area_id: val ?? "" };
                              return next;
                            });
                          }}
                          valueRenderer={(value) => {
                            if (!value) return "";
                            const area = selAreas.find((a) => a._id === value);
                            return area ? `(${area.code}) ${area.name}` : value;
                          }}
                          error={ocErrors[`${ocIdx}-area_id`]}
                        >
                          {selAreas.map((a) => (
                            <SelectItem key={a._id} value={a._id}>
                              ({a.code}) {a.name}
                            </SelectItem>
                          ))}
                        </FloatLabelSelect>
                      </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Cobertura por turno
                      </p>
                      {oc.coverage.map((cov, covIdx) => (
                        <div key={covIdx} className="border border-border/30 rounded-md p-3 mb-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <div>
                              <FloatLabelSelect
                                id={`oc-shift-${ocIdx}-${covIdx}`}
                                label="Turno"
                                value={cov.shift}
                                hasValue={!!cov.shift}
                                onValueChange={(val) => {
                                  setOcErrors((prev) => {
                                    const next = { ...prev };
                                    delete next[`${ocIdx}-${covIdx}-shift`];
                                    return next;
                                  });
                                  setOptimalContracted((prev) => {
                                    const next = [...prev];
                                    const covs = [...(next[ocIdx]?.coverage ?? [])];
                                    covs[covIdx] = { ...covs[covIdx], shift: val ?? "" };
                                    next[ocIdx] = { ...next[ocIdx], coverage: covs };
                                    return next;
                                  });
                                }}
                                valueRenderer={(value) => {
                                  if (!value) return "";
                                  const shift = shifts.find(
                                    (s) => (s.code ?? s._id) === value,
                                  );
                                  return shift
                                    ? `${shift.code ?? shift._id} - ${shift.name}`
                                    : value;
                                }}
                                error={ocErrors[`${ocIdx}-${covIdx}-shift`]}
                              >
                                {shifts.map((s) => (
                                  <SelectItem key={s._id ?? s.code} value={s.code ?? s._id}>
                                    {s.code ?? s._id} - {s.name}
                                  </SelectItem>
                                ))}
                              </FloatLabelSelect>
                            </div>
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {DAY_LABELS.map(({ key, label }) => {
                              const errorKey = `${ocIdx}-${covIdx}-${key}`;
                              const hasDayError = !!ocErrors[errorKey];
                              return (
                                <div key={key} className="text-center">
                                  <label
                                    className={cn(
                                      "text-[10px] block mb-0.5",
                                      hasDayError
                                        ? "text-destructive"
                                        : "text-muted-foreground",
                                    )}
                                  >
                                    {label}
                                  </label>
                                  <Input
                                    type="number"
                                    min={0}
                                    aria-invalid={hasDayError}
                                    className={cn(
                                      "h-8 text-center text-xs px-1",
                                      hasDayError &&
                                        "border-destructive ring-1 ring-destructive/30",
                                    )}
                                    title={hasDayError ? ocErrors[errorKey] : undefined}
                                    value={cov[key] === 0 ? "" : String(cov[key])}
                                    onChange={(e) => {
                                      setOcErrors((prev) => {
                                        const next = { ...prev };
                                        delete next[errorKey];
                                        return next;
                                      });
                                      setOptimalContracted((prev) => {
                                        const next = [...prev];
                                        const covs = [...(next[ocIdx]?.coverage ?? [])];
                                        covs[covIdx] = {
                                          ...covs[covIdx],
                                          [key]: Number(e.target.value) || 0,
                                        };
                                        next[ocIdx] = { ...next[ocIdx], coverage: covs };
                                        return next;
                                      });
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          {(() => {
                            const dayErrors = DAY_LABELS
                              .map(({ key }) => ocErrors[`${ocIdx}-${covIdx}-${key}`])
                              .filter(Boolean);
                            if (dayErrors.length === 0) return null;
                            return (
                              <p className="text-xs text-destructive mt-1.5 text-center">
                                {dayErrors.join(" · ")}
                              </p>
                            );
                          })()}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-1 text-xs"
                        onClick={() =>
                          addEmptyCoverage(ocIdx, shifts[0]?.code ?? shifts[0]?._id ?? "")
                        }
                      >
                        <Plus className="h-3 w-3" />
                        Agregar turno
                      </Button>
                    </div>
                  </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-3 px-5 py-3 border-t border-border/40">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer gap-1"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => navigate("/customers")}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
