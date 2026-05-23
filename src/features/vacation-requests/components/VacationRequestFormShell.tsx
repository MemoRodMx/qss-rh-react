import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { vacationRequestService } from "../services/vacationRequestService";
import { EmployeeAutocomplete } from "./EmployeeAutocomplete";
import type { EmployeeSuggestion, PlantOption, ShiftOption } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  CalendarCheck,
  AlertTriangle,
  User,
  Building2,
  Clock,
  Calendar,
  X,
} from "lucide-react";

// ── Zod schema ──────────────────────────────────────────────────────────────
const vacationRequestSchema = z.object({
  plant_id: z.string().min(1, "La planta es obligatoria"),
  shift_id: z.string().min(1, "El turno es obligatorio"),
  exercise: z.coerce
    .number()
    .int("Debe ser un año válido")
    .min(2020, "El ejercicio mínimo es 2020")
    .max(2100, "El ejercicio máximo es 2100"),
  worked_vacations: z.boolean(),
  notes: z
    .string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof vacationRequestSchema>;

// ── Props ───────────────────────────────────────────────────────────────────
interface VacationRequestFormShellProps {
  mode: "create" | "edit";
  initialValues?: Partial<FormValues> & {
    _id?: string;
    employee_number?: string;
    employee_name?: string;
    requested_days?: string[];
  };
  onSuccess: () => void;
  onCancel: () => void;
}

// ── Component ───────────────────────────────────────────────────────────────
export function VacationRequestFormShell({
  mode,
  initialValues,
  onSuccess,
  onCancel,
}: VacationRequestFormShellProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Catalogs
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);

  // Employee autocomplete
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSuggestion | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  // Requested days (managed outside react-hook-form)
  const [requestedDays, setRequestedDays] = useState<Date[]>([]);

  // Track codes for employee search filtering
  const [currentPlantCode, setCurrentPlantCode] = useState<string>("");
  const [currentShiftCode, setCurrentShiftCode] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(vacationRequestSchema) as any,
    defaultValues: {
      plant_id: "",
      shift_id: "",
      exercise: new Date().getFullYear(),
      worked_vacations: false,
      notes: "",
    },
  });

  const watchedPlantId = watch("plant_id");
  const watchedShiftId = watch("shift_id");

  // ── Load catalogs ─────────────────────────────────────────────────────────
  const loadCatalogs = useCallback(async () => {
    try {
      const [plantsData, shiftsData] = await Promise.all([
        vacationRequestService.listPlants(),
        vacationRequestService.listShifts(),
      ]);
      setPlants(plantsData);
      setShifts(shiftsData);
    } catch {
      setServerError("Error al cargar catálogos");
    }
  }, []);

  // ── Initialize from initialValues ─────────────────────────────────────────
  useEffect(() => {
    loadCatalogs();

    if (initialValues) {
      reset({
        plant_id: initialValues.plant_id ?? "",
        shift_id: initialValues.shift_id ?? "",
        exercise: initialValues.exercise ?? new Date().getFullYear(),
        worked_vacations: initialValues.worked_vacations ?? false,
        notes: initialValues.notes ?? "",
      });

      setCurrentPlantCode(initialValues.plant_id ?? "");
      setCurrentShiftCode(initialValues.shift_id ?? "");

      // Parse requested days
      if (initialValues.requested_days?.length) {
        setRequestedDays(initialValues.requested_days.map((d) => new Date(d)));
      }

      // Set employee in edit mode
      if (mode === "edit" && initialValues.employee_number) {
        setSelectedEmployee({
          employee_number: initialValues.employee_number,
          fullname: initialValues.employee_name ?? "",
          label: initialValues.employee_name
            ? `${initialValues.employee_number} - ${initialValues.employee_name}`
            : initialValues.employee_number,
        });
      }
    }
  }, [initialValues, mode, loadCatalogs, reset]);

  // ── Sync plant/shift codes for employee search ────────────────────────────
  useEffect(() => {
    setCurrentPlantCode(watchedPlantId);
  }, [watchedPlantId]);

  useEffect(() => {
    setCurrentShiftCode(watchedShiftId);
  }, [watchedShiftId]);

  // ── Clear employee when plant/shift changes in create mode ────────────────
  useEffect(() => {
    if (mode === "create") {
      setSelectedEmployee(null);
      setEmployeeError(null);
    }
  }, [watchedPlantId, watchedShiftId, mode]);

  // ── Date helpers ──────────────────────────────────────────────────────────
  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString("es-MX", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isDateSelected = (date: Date): boolean => {
    return requestedDays.some((d) => d.toDateString() === date.toDateString());
  };

  const toggleDate = (date: Date) => {
    setRequestedDays((prev) => {
      const exists = prev.some((d) => d.toDateString() === date.toDateString());
      if (exists) {
        return prev.filter((d) => d.toDateString() !== date.toDateString());
      }
      return [...prev, date];
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setEmployeeError(null);

    // Validate employee in create mode
    if (mode === "create" && !selectedEmployee?.employee_number) {
      setEmployeeError("Debe seleccionar un empleado");
      return;
    }

    // Validate requested days
    if (requestedDays.length === 0) {
      setServerError("Debe seleccionar al menos un día");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        plant_id: values.plant_id,
        shift_id: values.shift_id,
        exercise: values.exercise,
        worked_vacations: values.worked_vacations,
        requested_days: requestedDays.map((d) => d.toISOString()),
      };

      if (mode === "create" && selectedEmployee) {
        payload.employee_number = selectedEmployee.employee_number;
      }

      if (values.notes?.trim()) {
        payload.notes = values.notes.trim();
      }

      if (mode === "edit" && initialValues?._id) {
        await vacationRequestService.update(initialValues._id, payload);
      } else {
        await vacationRequestService.create(payload);
      }

      onSuccess();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar la solicitud",
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

  // ── Build plant options ───────────────────────────────────────────────────
  const plantOptions = plants.map((p) => ({
    label: p.name,
    value: p.code,
  }));

  const shiftOptions = shifts.map((s) => ({
    label: s.name,
    value: s.code,
  }));

  // ── Calendar generation ───────────────────────────────────────────────────
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const DAY_NAMES_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={onCancel}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {mode === "create"
              ? "Nueva solicitud de vacaciones"
              : "Modificar solicitud de vacaciones"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Completa los datos para registrar la solicitud."
              : "Actualiza los datos de la solicitud."}
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
        {/* ── Location Card ────────────────────────────────────────────────── */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plant */}
              <div>
                <Label htmlFor="plant_id">
                  Planta <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("plant_id")}
                  onValueChange={(val) => {
                    setValue("plant_id", val ?? "", { shouldValidate: true });
                    setCurrentPlantCode(val ?? "");
                  }}
                >
                  <SelectTrigger
                    id="plant_id"
                    className={`min-w-[200px] ${errors.plant_id ? "border-destructive" : ""}`}
                  >
                    <span className="flex flex-1 text-left">
                      {plantOptions.find((o) => o.value === watch("plant_id"))
                        ?.label || "Seleccionar planta"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {plantOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError("plant_id")}
              </div>

              {/* Shift */}
              <div>
                <Label htmlFor="shift_id">
                  Turno <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("shift_id")}
                  onValueChange={(val) => {
                    setValue("shift_id", val ?? "", { shouldValidate: true });
                    setCurrentShiftCode(val ?? "");
                  }}
                >
                  <SelectTrigger
                    id="shift_id"
                    className={`min-w-[200px] ${errors.shift_id ? "border-destructive" : ""}`}
                  >
                    <span className="flex flex-1 text-left">
                      {shiftOptions.find((o) => o.value === watch("shift_id"))
                        ?.label || "Seleccionar turno"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {shiftOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError("shift_id")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Employee Card ────────────────────────────────────────────────── */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-primary" />
              Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="max-w-md">
              <Label className="mb-2 block">
                Empleado <span className="text-destructive">*</span>
              </Label>
              <EmployeeAutocomplete
                value={selectedEmployee}
                onChange={(emp) => {
                  setSelectedEmployee(emp);
                  setEmployeeError(null);
                }}
                plantId={currentPlantCode}
                shiftId={currentShiftCode}
                disabled={mode === "edit"}
                error={employeeError}
              />
              {employeeError && (
                <p className="mt-1 text-xs text-destructive">{employeeError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Request Data Card ────────────────────────────────────────────── */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Datos de la solicitud
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exercise */}
              <div>
                <Label htmlFor="exercise">
                  Ejercicio (año) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="exercise"
                  type="number"
                  min={2020}
                  max={2100}
                  {...register("exercise")}
                  className={errors.exercise ? "border-destructive" : ""}
                />
                {renderFieldError("exercise")}
              </div>

              {/* Worked vacations */}
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={watch("worked_vacations")}
                    onCheckedChange={(checked) =>
                      setValue("worked_vacations", checked === true, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <span className="text-sm font-medium">
                    Vacaciones trabajadas
                  </span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Requested Days Card ──────────────────────────────────────────── */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Días solicitados
              <span className="text-xs text-muted-foreground font-normal ml-1">
                ({requestedDays.length} día
                {requestedDays.length !== 1 ? "s" : ""})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {/* Selected days chips */}
            {requestedDays.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {requestedDays.map((date, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-1"
                  >
                    {formatDateDisplay(date)}
                    <button
                      type="button"
                      className="cursor-pointer hover:text-destructive ml-0.5"
                      onClick={() => toggleDate(date)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Inline calendar */}
            <div className="inline-block rounded-xl border border-border/50 bg-card shadow-[var(--shadow-1)] p-3">
              {/* Month/Year header */}
              <div className="text-center text-sm font-medium text-foreground mb-3">
                {today.toLocaleDateString("es-MX", {
                  month: "long",
                  year: "numeric",
                })}
              </div>

              {/* Day names header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_NAMES_SHORT.map((name) => (
                  <div
                    key={name}
                    className="text-center text-xs text-muted-foreground font-medium py-1"
                  >
                    {name}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="h-8 w-8" />;
                  }

                  const date = new Date(currentYear, currentMonth, day);
                  const isSelected = isDateSelected(date);
                  const isPast =
                    date <
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate(),
                    );
                  const isToday = date.toDateString() === today.toDateString();

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPast}
                      onClick={() => toggleDate(date)}
                      className={`h-8 w-8 rounded-full text-xs font-medium transition-all cursor-pointer
                        ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : isToday
                              ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                              : isPast
                                ? "text-muted-foreground/30 cursor-not-allowed"
                                : "text-foreground hover:bg-primary/10"
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {requestedDays.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Selecciona una o más fechas en el calendario
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Notes Card ───────────────────────────────────────────────────── */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Añade comentarios sobre la solicitud..."
                {...register("notes")}
                className={errors.notes ? "border-destructive" : ""}
              />
              {renderFieldError("notes")}
            </div>
          </CardContent>
        </Card>

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
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
