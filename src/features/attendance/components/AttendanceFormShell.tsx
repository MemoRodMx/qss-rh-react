import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { FloatLabelTextarea } from "@/components/ui/float-label-textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, ArrowLeft, Loader2, X } from "lucide-react";
import { attendanceService } from "../services/attendanceService";
import { AttendanceStatusSelector } from "./AttendanceStatusSelector";
import { LoanEmployeeSearch } from "./LoanEmployeeSearch";
import { AttendanceStatus } from "../types";
import type {
  AttendanceRecordDetail,
  EmployeeEntry,
  SupervisorOption,
  PlantOption,
  LoanSuggestion,
} from "../types";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const attendanceFormSchema = z.object({
  supervisor_id: z.string().min(1, "El supervisor es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
  plant_id: z.string().min(1, "La planta es requerida"),
  notes: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface AttendanceFormShellProps {
  mode: "create" | "edit";
  recordId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AttendanceFormShell({
  mode,
  recordId,
}: AttendanceFormShellProps) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  // Form state
  const [supervisors, setSupervisors] = useState<SupervisorOption[]>([]);
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeEntry[]>([]);
  const [isLoadingSupervisors, setIsLoadingSupervisors] = useState(true);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Read-only fields for edit mode
  const [readonlyDate, setReadonlyDate] = useState("");
  const [readonlySupervisor, setReadonlySupervisor] = useState("");

  // Store the full selected plant object to access plant_code and shift_code
  const [selectedPlantObj, setSelectedPlantObj] = useState<PlantOption | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      supervisor_id: "",
      date: "",
      plant_id: "",
      notes: "",
    },
  });

  const supervisorId = watch("supervisor_id") ?? "";
  const plantId = watch("plant_id") ?? "";

  // ─── Load supervisors ─────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoadingSupervisors(true);
      try {
        const data = await attendanceService.listSupervisors();
        setSupervisors(data);
      } catch {
        setServerError("Error al cargar supervisores");
      } finally {
        setIsLoadingSupervisors(false);
      }
    };
    load();
  }, []);

  // ─── Load plants when supervisor changes ──────────────────────────────────
  useEffect(() => {
    if (!supervisorId) {
      setPlants([]);
      setValue("plant_id", "");
      setSelectedPlantObj(null);
      return;
    }

    const load = async () => {
      setIsLoadingPlants(true);
      setPlants([]);
      setValue("plant_id", "");
      setSelectedPlantObj(null);
      try {
        const data = await attendanceService.listSupervisorPlants(supervisorId);
        setPlants(data);
      } catch {
        setServerError("Error al cargar plantas");
      } finally {
        setIsLoadingPlants(false);
      }
    };
    load();
  }, [supervisorId, setValue]);

  // ─── Load employees when plant changes ────────────────────────────────────
  useEffect(() => {
    if (!supervisorId || !plantId) {
      setEmployees([]);
      return;
    }

    const load = async () => {
      setIsLoadingEmployees(true);
      try {
        // The API expects plant_code (plants.code) as plant_id param
        const plantCode =
          selectedPlantObj?.plant_code ?? selectedPlantObj?.plant_id ?? plantId;
        const data = await attendanceService.listEmployeesBySupervisor(
          supervisorId,
          plantCode,
        );
        const entries: EmployeeEntry[] = data.map((emp) => ({
          employee_number: emp.employee_number,
          full_name: emp.full_name,
          status: AttendanceStatus.PRESENTE,
          notes: "",
          is_loan: false,
        }));
        setEmployees(entries);
      } catch {
        setServerError("Error al cargar empleados");
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    load();
  }, [supervisorId, plantId, selectedPlantObj]);

  // ─── Load existing record for edit mode ───────────────────────────────────
  useEffect(() => {
    if (!isEdit || !recordId) return;

    const load = async () => {
      setIsLoadingRecord(true);
      try {
        const record: AttendanceRecordDetail =
          await attendanceService.getById(recordId);

        setReadonlyDate(record.date_str);
        setReadonlySupervisor(record.supervisor_name);

        // Set form values
        setValue("supervisor_id", record.supervisor_id);
        setValue("date", record.date);
        setValue("plant_id", record.plant_id);
        setValue("notes", record.notes ?? "");

        // Set employees from record
        const entries: EmployeeEntry[] = record.employees.map((emp) => ({
          employee_number: emp.employee_number,
          full_name: emp.employee_name,
          status: emp.status,
          notes: emp.notes ?? "",
          is_loan: emp.is_loan ?? false,
        }));
        setEmployees(entries);
      } catch {
        setServerError("Error al cargar el registro de asistencia");
      } finally {
        setIsLoadingRecord(false);
      }
    };
    load();
  }, [isEdit, recordId, setValue]);

  // ─── Update employee status ───────────────────────────────────────────────
  const updateEmployeeStatus = useCallback(
    (empNumber: string, status: AttendanceStatus) => {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_number === empNumber ? { ...emp, status } : emp,
        ),
      );
    },
    [],
  );

  // ─── Update employee notes ────────────────────────────────────────────────
  const updateEmployeeNotes = useCallback(
    (empNumber: string, notes: string) => {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_number === empNumber ? { ...emp, notes } : emp,
        ),
      );
    },
    [],
  );

  // ─── Remove employee ──────────────────────────────────────────────────────
  const removeEmployee = useCallback((empNumber: string) => {
    setEmployees((prev) =>
      prev.filter((emp) => emp.employee_number !== empNumber),
    );
  }, []);

  // ─── Add loan employee ────────────────────────────────────────────────────
  const addLoanEmployee = useCallback((suggestion: LoanSuggestion) => {
    const newEntry: EmployeeEntry = {
      employee_number: suggestion.employee_number,
      full_name: suggestion.fullname,
      status: AttendanceStatus.PRESENTE,
      notes: "",
      is_loan: true,
    };
    setEmployees((prev) => [...prev, newEntry]);
  }, []);

  // ─── Bulk actions ─────────────────────────────────────────────────────────
  const setAllStatus = useCallback((status: AttendanceStatus) => {
    setEmployees((prev) => prev.map((emp) => ({ ...emp, status })));
  }, []);

  // ─── Submit handler ───────────────────────────────────────────────────────
  const onSubmit = async (values: AttendanceFormValues) => {
    setServerError(null);

    // Validate employees array is not empty
    if (employees.length === 0) {
      setServerError("Debe agregar al menos un empleado");
      return;
    }

    setIsSubmitting(true);

    try {
      // The API expects plant_code (plants.code) as plant_id
      const plantCode =
        selectedPlantObj?.plant_code ??
        selectedPlantObj?.plant_id ??
        values.plant_id;

      const payload: Record<string, unknown> = {
        date: values.date,
        supervisor_id: values.supervisor_id,
        plant_id: plantCode,
        employees: employees.map((emp) => ({
          employee_number: emp.employee_number,
          status: emp.status,
          is_loan: emp.is_loan ?? false,
          ...(emp.notes.trim() ? { notes: emp.notes.trim() } : {}),
        })),
        ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
      };

      // Include shift_id if available
      if (selectedPlantObj?.shift_code) {
        payload.shift_id = selectedPlantObj.shift_code;
      }

      if (isEdit && recordId) {
        await attendanceService.update(recordId, payload);
      } else {
        await attendanceService.create(payload);
      }

      navigate("/attendance");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(
        error?.response?.data?.message ||
          "Error al guardar el registro de asistencia",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (isLoadingRecord) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[1080px] space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => navigate("/attendance")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit
              ? "Editar Registro de Asistencia"
              : "Nuevo Registro de Asistencia"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Modifica los datos del registro de asistencia"
              : "Registra la asistencia del personal"}
          </p>
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive text-sm">Error</p>
            <p className="text-sm text-destructive/90">{serverError}</p>
          </div>
        </div>
      )}

      {/* Main Info Card */}
      <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20">
          <CardTitle>Información General</CardTitle>
          <CardDescription>
            Datos del supervisor, fecha y ubicación
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Read-only info for edit mode */}
          {isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/40">
              <div>
                <p className="text-xs text-muted-foreground">Supervisor</p>
                <p className="text-sm font-medium">{readonlySupervisor}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="text-sm font-medium">{readonlyDate}</p>
              </div>
            </div>
          )}

          {/* Supervisor Select */}
          <div>
            <FloatLabelSelect
              id="supervisor_id"
              label="Supervisor"
              value={supervisorId}
              hasValue={!!supervisorId}
              error={errors.supervisor_id?.message}
              disabled={isLoadingSupervisors || isEdit}
              onValueChange={(val) => {
                setValue("supervisor_id", val ?? "", { shouldValidate: true });
              }}
              valueRenderer={(value) => {
                if (!value) return "";
                return supervisors.find((s) => s._id === value)?.name ?? value;
              }}
            >
              {isLoadingSupervisors ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                supervisors.map((sup) => (
                  <SelectItem key={sup._id} value={sup._id}>
                    {sup.name}
                  </SelectItem>
                ))
              )}
            </FloatLabelSelect>
          </div>

          {/* Date */}
          <div>
            <FloatLabelInput
              id="date"
              label="Fecha"
              type="date"
              disabled={isEdit}
              error={errors.date?.message}
              {...register("date")}
            />
          </div>

          {/* Plant Select */}
          <div>
            <FloatLabelSelect
              id="plant_id"
              label="Planta"
              value={plantId}
              hasValue={!!plantId}
              error={errors.plant_id?.message}
              disabled={!supervisorId || isLoadingPlants || isEdit}
              onValueChange={(val) => {
                setValue("plant_id", val ?? "", { shouldValidate: true });
                const plant = plants.find((p) => p.plant_id === val) ?? null;
                setSelectedPlantObj(plant);
              }}
              valueRenderer={(value) => {
                if (!value) return "";
                const plant = plants.find((p) => p.plant_id === value);
                return plant?.plant_name || plant?.plant_code || value;
              }}
            >
              {isLoadingPlants ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                plants.map((plant) => (
                  <SelectItem key={plant.plant_id} value={plant.plant_id}>
                    {plant.plant_name || plant.plant_code || plant.plant_id}
                  </SelectItem>
                ))
              )}
            </FloatLabelSelect>
          </div>
        </CardContent>
      </Card>

      {/* Employees Card */}
      <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Empleados</CardTitle>
              <CardDescription>
                {isLoadingEmployees
                  ? "Cargando empleados..."
                  : `${employees.length} empleado${employees.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            {employees.length > 0 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setAllStatus(AttendanceStatus.PRESENTE)}
                >
                  Todos Presentes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setAllStatus(AttendanceStatus.AUSENTE)}
                >
                  Todos Ausentes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Loan employee search */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Préstamo de Personal Temporal</p>
            <LoanEmployeeSearch
              entriesList={employees}
              onAdd={addLoanEmployee}
              disabled={isSubmitting}
            />
          </div>

          {/* Employees table */}
          {isLoadingEmployees ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {supervisorId && plantId
                ? "No se encontraron empleados para esta planta"
                : "Seleccione un supervisor y una planta para cargar los empleados"}
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 bg-card shadow-[var(--shadow-2)] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-b from-muted/40 to-muted/20 border-b-2 border-border/50">
                    <TableHead className="w-[100px]">Emp #</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[280px]">Estatus</TableHead>
                    <TableHead className="w-[200px]">Observación</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow
                      key={emp.employee_number}
                      className="border-b border-border/40"
                    >
                      <TableCell className="font-mono text-xs">
                        {emp.employee_number}
                        {emp.is_loan && (
                          <span className="ml-1 text-[10px] text-primary font-medium">
                            (Préstamo)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{emp.full_name}</TableCell>
                      <TableCell>
                        <AttendanceStatusSelector
                          value={emp.status}
                          onChange={(status) =>
                            updateEmployeeStatus(emp.employee_number, status)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Observación..."
                          className="h-8 text-xs"
                          value={emp.notes}
                          onChange={(e) =>
                            updateEmployeeNotes(
                              emp.employee_number,
                              e.target.value,
                            )
                          }
                          disabled={isSubmitting}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="cursor-pointer text-destructive hover:text-destructive"
                          onClick={() => removeEmployee(emp.employee_number)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Card */}
      <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20">
          <CardTitle>Observaciones Generales</CardTitle>
          <CardDescription>
            Notas adicionales sobre el registro de asistencia
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FloatLabelTextarea
            id="notes"
            label="Observaciones (opcional)"
            error={errors.notes?.message}
            {...register("notes")}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => navigate("/attendance")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Guardar Cambios" : "Crear Registro"}
        </Button>
      </div>
    </form>
  );
}
