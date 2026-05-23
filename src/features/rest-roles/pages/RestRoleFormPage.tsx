import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { restRoleService } from "../services/restRoleService";
import { DayAssignmentField } from "../components/DayAssignmentField";
import type { Supervisor, SupervisorPlant, ShiftOption } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  CalendarCheck,
  AlertTriangle,
  User,
} from "lucide-react";

// ── Zod schema ──────────────────────────────────────────────────────────────
const restRoleFormSchema = z.object({
  supervisor_id: z.string().min(1, "El supervisor es obligatorio"),
  plant_id: z.string().min(1, "La planta es obligatoria"),
  shift_id: z.string().min(1, "El turno es obligatorio"),
  year: z.coerce
    .number()
    .int("Debe ser un año válido")
    .min(2020, "Año inválido")
    .max(2100, "Año inválido"),
  week: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "La semana debe estar entre 1 y 53")
    .max(53, "La semana debe estar entre 1 y 53"),
});

type FormValues = z.infer<typeof restRoleFormSchema>;

function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff + start.getDay() * 86400000) / oneWeek);
}

// ── Component ───────────────────────────────────────────────────────────────
export function RestRoleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auxiliary data
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorPlants, setSupervisorPlants] = useState<SupervisorPlant[]>(
    [],
  );
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [positionIds, setPositionIds] = useState<string[]>([]);

  // Day assignments (managed outside react-hook-form)
  const [dayAssignments, setDayAssignments] = useState<
    Record<string, string[]>
  >({});

  // Confirmation dialog for changing supervisor/plant/shift with assigned employees
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    field: string;
    value: string;
  } | null>(null);

  const hasAssignments = Object.values(dayAssignments).some(
    (arr) => arr.length > 0,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(restRoleFormSchema) as any,
    defaultValues: {
      supervisor_id: "",
      plant_id: "",
      shift_id: "",
      year: new Date().getFullYear(),
      week: getCurrentWeek(),
    },
  });

  const watchedSupervisorId = watch("supervisor_id");
  const watchedPlantId = watch("plant_id");

  // ── Load auxiliary data ───────────────────────────────────────────────────
  const loadAuxData = useCallback(async () => {
    try {
      const [supervisorsData, shiftsData, positionIdsData] = await Promise.all([
        restRoleService.listSupervisors(),
        restRoleService.listShifts(),
        restRoleService.getConfiguredPositionIds(),
      ]);
      setSupervisors(supervisorsData);
      setShifts(shiftsData);
      setPositionIds(positionIdsData);
    } catch {
      setServerError("Error al cargar datos auxiliares");
    }
  }, []);

  // ── Load supervisor plants when supervisor changes ────────────────────────
  useEffect(() => {
    if (!watchedSupervisorId) {
      setSupervisorPlants([]);
      return;
    }

    let cancelled = false;

    async function loadPlants() {
      try {
        const plants =
          await restRoleService.getSupervisorPlants(watchedSupervisorId);
        if (!cancelled) {
          setSupervisorPlants(plants);
        }
      } catch {
        if (!cancelled) setSupervisorPlants([]);
      }
    }

    loadPlants();
    return () => {
      cancelled = true;
    };
  }, [watchedSupervisorId]);

  // ── Auto-select plant/shift when supervisor has only one ──────────────────
  useEffect(() => {
    if (supervisorPlants.length === 1) {
      const plant = supervisorPlants[0];
      setValue("plant_id", plant.plant_id, { shouldValidate: true });

      if (plant.shift_id) {
        setValue("shift_id", plant.shift_id, { shouldValidate: true });
      }
    }
  }, [supervisorPlants, setValue]);

  // ── Load record for edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) {
      loadAuxData();
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        await loadAuxData();

        const role = await restRoleService.getById(id!);
        if (cancelled) return;

        reset({
          supervisor_id: role.supervisor_id,
          plant_id: role.plant_id,
          shift_id: role.shift_id,
          year: role.year,
          week: role.week,
        });

        // Build day assignments from existing data
        const days: Record<string, string[]> = {};
        for (const day of role.days) {
          days[day.day_name] = day.employee_numbers;
        }
        setDayAssignments(days);
      } catch {
        setServerError("Error al cargar los datos del rol de descanso");
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, loadAuxData, reset]);

  // ── Handle field change with confirmation if needed ───────────────────────
  const handleFieldChange = (
    field: "supervisor_id" | "plant_id" | "shift_id",
    value: string,
  ) => {
    if (hasAssignments) {
      setPendingChange({ field, value });
      setConfirmDialogOpen(true);
    } else {
      setValue(field, value, { shouldValidate: true });
      if (field === "supervisor_id" || field === "plant_id") {
        setDayAssignments({});
      }
    }
  };

  const confirmFieldChange = () => {
    if (!pendingChange) return;
    setValue(
      pendingChange.field as "supervisor_id" | "plant_id" | "shift_id",
      pendingChange.value,
      { shouldValidate: true },
    );
    if (
      pendingChange.field === "supervisor_id" ||
      pendingChange.field === "plant_id"
    ) {
      setDayAssignments({});
    }
    setConfirmDialogOpen(false);
    setPendingChange(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    // Validate that at least one day has employees assigned
    const hasAnyEmployee = Object.values(dayAssignments).some(
      (arr) => arr.length > 0,
    );
    if (!hasAnyEmployee) {
      setServerError(
        "Debe asignar al menos un empleado a algún día de la semana",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const days = Object.entries(dayAssignments)
        .filter(([, employees]) => employees.length > 0)
        .map(([dayName, employeeNumbers]) => ({
          day_name: dayName,
          employee_numbers: employeeNumbers,
        }));

      const payload: Record<string, unknown> = {
        ...values,
        days,
      };

      if (isEditMode) {
        await restRoleService.update(id!, payload);
      } else {
        await restRoleService.create(payload);
      }

      navigate("/rest-roles");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar el rol de descanso",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render field error ────────────────────────────────────────────────────
  const renderFieldError = (fieldName: keyof FormValues) => {
    const error = errors[fieldName];
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

  // Find the selected plant to determine if shift is locked
  const selectedPlant = supervisorPlants.find(
    (sp) => sp.plant_id === watchedPlantId,
  );
  const isShiftLocked = !!selectedPlant?.shift_id;

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => navigate("/rest-roles")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEditMode ? "Modificar rol de descanso" : "Nuevo rol de descanso"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Actualiza los datos del rol de descanso."
              : "Completa los datos para crear un nuevo rol de descanso."}
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
        {/* ── General Info Card ────────────────────────────────────────────── */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supervisor */}
              <div>
                <Label htmlFor="supervisor_id">
                  Jefe directo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("supervisor_id")}
                  onValueChange={(val) =>
                    handleFieldChange("supervisor_id", val ?? "")
                  }
                >
                  <SelectTrigger
                    id="supervisor_id"
                    className={`min-w-[200px] ${errors.supervisor_id ? "border-destructive" : ""}`}
                  >
                    <span className="flex flex-1 text-left">
                      {supervisors.find((s) => s._id === watch("supervisor_id"))
                        ?.name || "Seleccionar supervisor"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError("supervisor_id")}
              </div>

              {/* Plant */}
              <div>
                <Label htmlFor="plant_id">
                  Planta <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("plant_id")}
                  onValueChange={(val) =>
                    handleFieldChange("plant_id", val ?? "")
                  }
                  disabled={!watchedSupervisorId}
                >
                  <SelectTrigger
                    id="plant_id"
                    className={`min-w-[200px] ${errors.plant_id ? "border-destructive" : ""}`}
                  >
                    <span className="flex flex-1 text-left">
                      {supervisorPlants.find(
                        (p) => p.plant_id === watch("plant_id"),
                      )?.plant_name || "Seleccionar planta"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {supervisorPlants.map((p) => (
                      <SelectItem key={p.plant_id} value={p.plant_id}>
                        {p.plant_name || p.plant_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError("plant_id")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Shift */}
              <div>
                <Label htmlFor="shift_id">
                  Turno <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("shift_id")}
                  onValueChange={(val) =>
                    handleFieldChange("shift_id", val ?? "")
                  }
                  disabled={!watchedPlantId || isShiftLocked}
                >
                  <SelectTrigger
                    id="shift_id"
                    className={`min-w-[200px] ${errors.shift_id ? "border-destructive" : ""}`}
                  >
                    <span className="flex flex-1 text-left">
                      {shifts.find(
                        (s) => (s.code ?? s._id) === watch("shift_id"),
                      )?.name || "Seleccionar turno"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s._id} value={s.code ?? s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isShiftLocked && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Turno asignado por la planta
                  </p>
                )}
                {renderFieldError("shift_id")}
              </div>

              {/* Year */}
              <div>
                <Label htmlFor="year">
                  Año <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  min={2020}
                  max={2100}
                  {...register("year")}
                  className={errors.year ? "border-destructive" : ""}
                  disabled={isEditMode}
                />
                {renderFieldError("year")}
              </div>

              {/* Week */}
              <div>
                <Label htmlFor="week">
                  Semana <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="week"
                  type="number"
                  min={1}
                  max={53}
                  {...register("week")}
                  className={errors.week ? "border-destructive" : ""}
                  disabled={isEditMode}
                />
                {renderFieldError("week")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Day Assignments Card ─────────────────────────────────────────── */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-primary" />
              Asignación de empleados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {!watchedPlantId ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Selecciona un supervisor y una planta para comenzar a asignar
                empleados.
              </p>
            ) : (
              <DayAssignmentField
                days={dayAssignments}
                onChange={setDayAssignments}
                plantId={watchedPlantId}
                plantCode={selectedPlant?.plant_code ?? undefined}
                shiftId={watch("shift_id")}
                positionIds={positionIds}
                disabled={isEditMode}
              />
            )}
          </CardContent>
        </Card>

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
            onClick={() => navigate("/rest-roles")}
          >
            Cancelar
          </Button>
        </div>
      </form>

      {/* Confirmation dialog for changing field with assignments */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center">
              ¿Cambiar selección?
            </DialogTitle>
            <DialogDescription className="text-center">
              Ya has asignado empleados a algunos días. Si cambias esta
              selección, se perderán las asignaciones actuales. ¿Deseas
              continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setPendingChange(null);
              }}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmFieldChange}
              className="cursor-pointer"
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
