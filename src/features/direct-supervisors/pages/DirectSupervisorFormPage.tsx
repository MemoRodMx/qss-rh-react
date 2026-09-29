import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { ROLES } from "@/lib/roles";
import { directSupervisorsService } from "../services/directSupervisorsService";
import type { AreaOption, ShiftOption, EmployeeSuggestion } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { Skeleton } from "@/components/ui/skeleton";
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
  UserCog,
  AlertTriangle,
  Search,
  Loader2,
  X,
  Plus,
  Trash2,
  Building2,
  Shield,
} from "lucide-react";

const supervisorFormSchema = z.object({
  employee_number: z.string().min(1, "El empleado es obligatorio"),
  status: z.enum(["ACTIVO", "INACTIVO"]).optional().default("ACTIVO"),
});

type FormValues = z.infer<typeof supervisorFormSchema>;

interface AssignedAreaRow {
  area_id: string;
  shift_id: string | null;
}

interface LinkedUserInfo {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export function DirectSupervisorFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);

  // Catalogs
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);

  // Employee search
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [employeeResults, setEmployeeResults] = useState<EmployeeSuggestion[]>(
    [],
  );
  const [isSearchingEmployee, setIsSearchingEmployee] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSuggestion | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const employeeContainerRef = useRef<HTMLDivElement>(null);

  // Assigned plants
  const [assignedAreas, setAssignedAreas] = useState<AssignedAreaRow[]>([]);

  // Permissions
  const [canRegisterAttendance, setCanRegisterAttendance] = useState(false);

  // Credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Supervisor");

  // Linked user (edit mode)
  const [linkedUser, setLinkedUser] = useState<LinkedUserInfo | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Confirm dialog for credential actions
  const [confirmAction, setConfirmAction] = useState<
    "toggle-access" | "remove-user" | null
  >(null);

  const roleOptions = ["Supervisor", "Gerente", "Coordinador"].map((value) => {
    const role = ROLES.find((r) => r.value === value);
    return { value, label: role?.label ?? value };
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(supervisorFormSchema) as any,
    defaultValues: {
      employee_number: "",
      status: "ACTIVO",
    },
  });

  const watchedStatus = watch("status");

  // ── Employee search with debounce ────────────────────────────────────────
  const searchEmployees = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setEmployeeResults([]);
      setIsEmployeeOpen(false);
      return;
    }
    setIsSearchingEmployee(true);
    try {
      const data = await directSupervisorsService.searchEmployees(q.trim());
      setEmployeeResults(data);
      setIsEmployeeOpen(data.length > 0);
    } catch {
      setEmployeeResults([]);
    } finally {
      setIsSearchingEmployee(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchEmployees(employeeQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [employeeQuery, searchEmployees]);

  // Close employee dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        employeeContainerRef.current &&
        !employeeContainerRef.current.contains(e.target as Node)
      ) {
        setIsEmployeeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectEmployee = (emp: EmployeeSuggestion) => {
    setSelectedEmployee(emp);
    setValue("employee_number", emp.employee_number, { shouldValidate: true });
    setEmployeeQuery("");
    setEmployeeResults([]);
    setIsEmployeeOpen(false);
    setEmployeeError(null);
  };

  const handleClearEmployee = () => {
    setSelectedEmployee(null);
    setValue("employee_number", "", { shouldValidate: true });
    setEmployeeQuery("");
  };

  // ── Catalog loading ──────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      directSupervisorsService.listAreas(),
      directSupervisorsService.listShifts(),
    ])
      .then(([plantsData, shiftsData]) => {
        setAreas(plantsData);
        setShifts(shiftsData);
      })
      .catch(() => {
        setServerError("Error al cargar catálogos");
      });
  }, []);

  // ── Load record in edit mode ────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    async function load() {
      try {
        const data = await directSupervisorsService.getById(id!);
        if (cancelled) return;

        setValue("employee_number", data.employee_number);
        setValue("status", data.status as "ACTIVO" | "INACTIVO");
        setCanRegisterAttendance(data.can_register_attendance ?? false);

        // Set employee
        setSelectedEmployee({
          employee_number: data.employee_number,
          fullname: data.name,
        });

        // Set assigned plants
        if (data.assigned_areas?.length) {
          setAssignedAreas(
            (data.assigned_areas as unknown as Array<Record<string, unknown>>).map((ap) => ({
              area_id: (ap.area_id as { _id?: string })?._id ?? String(ap.area_id ?? ""),
              shift_id: ap.shift_id
                ? ((ap.shift_id as { _id?: string })?._id ?? String(ap.shift_id))
                : null,
            })),
          );
        }

        // Set linked user
        if (data.user_id && typeof data.user_id === "object") {
          setLinkedUser(data.user_id as unknown as LinkedUserInfo);
          setSelectedRole(data.user_id.role ?? "Supervisor");
          setUsername(data.user_id.username ?? "");
        }
      } catch {
        setServerError("Error al cargar los datos del jefe directo");
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, setValue]);

  // ── Plantas asignadas ───────────────────────────────────────────────────
  function addAreaRow() {
    setAssignedAreas((prev) => [...prev, { area_id: "", shift_id: null }]);
  }

  function removeAreaRow(index: number) {
    setAssignedAreas((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAreaRow(
    index: number,
    field: keyof AssignedAreaRow,
    value: string | null,
  ) {
    setAssignedAreas((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function getAvailableAreas(currentIndex: number): AreaOption[] {
    const usedIds = assignedAreas
      .filter((_, i) => i !== currentIndex)
      .map((r) => r.area_id)
      .filter(Boolean);
    return areas.filter((a) => !usedIds.includes(a._id));
  }

  // ── Linked user actions ─────────────────────────────────────────────────
  async function handleToggleAccess() {
    if (!linkedUser) return;
    setConfirmAction("toggle-access");
  }

  async function handleRemoveUser() {
    if (!linkedUser) return;
    setConfirmAction("remove-user");
  }

  async function handleConfirmAction() {
    const action = confirmAction;
    setConfirmAction(null);
    setActionLoading(true);
    setActionError(null);

    if (action === "toggle-access") {
      try {
        await api.patch(`/direct-supervisors/${id}/user/toggle-access`);
        const updated = await directSupervisorsService.getById(id!);
        if (updated.user_id && typeof updated.user_id === "object") {
          setLinkedUser(updated.user_id as unknown as LinkedUserInfo);
        } else {
          setLinkedUser(null);
        }
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        setActionError(
          err?.response?.data?.message || "Error al cambiar acceso",
        );
      }
    } else if (action === "remove-user") {
      try {
        await api.delete(`/direct-supervisors/${id}/user`);
        setLinkedUser(null);
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        setActionError(
          err?.response?.data?.message || "Error al eliminar usuario",
        );
      }
    }

    setActionLoading(false);
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  const onSubmit = async () => {
    if (!isEditMode && !selectedEmployee?.employee_number) {
      setEmployeeError("Debe seleccionar un empleado");
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    try {
      const validAreas = assignedAreas.filter((r) => r.area_id);
      const payload: Record<string, unknown> = {};

      if (isEditMode) {
        payload.status = watchedStatus;
      } else {
        payload.employee_number = selectedEmployee!.employee_number;
      }

      payload.can_register_attendance = canRegisterAttendance;

      if (validAreas.length > 0) {
        payload.assigned_areas = validAreas.map((r) => ({
          area_id: r.area_id,
          ...(r.shift_id ? { shift_id: r.shift_id } : {}),
        }));
      }

      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      if (linkedUser) {
        payload.credentials = {
          username: trimmedUsername || linkedUser.username,
          role: selectedRole,
          ...(trimmedPassword ? { password: trimmedPassword } : {}),
        };
      } else if (trimmedUsername && trimmedPassword) {
        payload.credentials = {
          username: trimmedUsername,
          password: trimmedPassword,
          role: selectedRole,
        };
      }

      if (isEditMode) {
        await directSupervisorsService.update(id!, payload);
      } else {
        await directSupervisorsService.create(payload);
      }
      navigate("/catalogs/direct-supervisors");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setServerError(
        err?.response?.data?.message ||
          "Ocurrió un error al guardar el jefe directo",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => navigate("/catalogs/direct-supervisors")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEditMode ? "Modificar jefe directo" : "Agregar jefe directo"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Modifica los datos del jefe directo"
              : "Registra un nuevo jefe directo en el sistema"}
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
        {/* Employee data */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-4">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <UserCog className="h-4 w-4 text-primary" />
              Datos del jefe directo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatLabelInput
                  id="employee_number"
                  label="Núm. de empleado"
                  disabled
                  value={selectedEmployee?.employee_number ?? ""}
                />
                <FloatLabelInput
                  id="name"
                  label="Nombre"
                  disabled
                  value={selectedEmployee?.fullname ?? ""}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div ref={employeeContainerRef} className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Empleado
                  </label>

                  {selectedEmployee ? (
                    <div className="flex items-center gap-2 rounded-lg border border-input bg-white dark:bg-card px-2.5 py-1.5 h-8">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm text-foreground truncate">
                        {selectedEmployee.employee_number} -{" "}
                        {selectedEmployee.fullname}
                      </span>
                      <button
                        type="button"
                        className="cursor-pointer text-muted-foreground hover:text-destructive"
                        onClick={handleClearEmployee}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por número o nombre..."
                        className="pl-9"
                        value={employeeQuery}
                        onChange={(e) => setEmployeeQuery(e.target.value)}
                        onFocus={() => {
                          if (employeeResults.length > 0) setIsEmployeeOpen(true);
                        }}
                      />
                      {isSearchingEmployee && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  )}

                  {/* Dropdown results */}
                  {isEmployeeOpen && employeeResults.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full max-w-[1080px] rounded-lg border border-border/50 bg-popover shadow-[var(--shadow-3)] max-h-48 overflow-y-auto">
                      {employeeResults.map((emp) => (
                        <button
                          key={emp.employee_number}
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-primary/10 transition-colors cursor-pointer"
                          onClick={() => handleSelectEmployee(emp)}
                        >
                          <span className="font-medium text-foreground">
                            {emp.employee_number}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-muted-foreground">
                            {emp.fullname}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {isEmployeeOpen &&
                    employeeResults.length === 0 &&
                    employeeQuery.trim().length >= 2 &&
                    !isSearchingEmployee && (
                      <div className="absolute z-50 mt-1 w-full max-w-[1080px] rounded-lg border border-border/50 bg-popover shadow-[var(--shadow-3)] p-3 text-sm text-muted-foreground text-center">
                        No se encontraron empleados
                      </div>
                    )}

                  {employeeError && (
                    <p className="text-xs text-destructive mt-1">
                      {employeeError}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isEditMode && (
              <div className="grid grid-cols-1 gap-4">
                <FloatLabelSelect
                  id="status"
                  label="Estado"
                  value={watchedStatus}
                  hasValue={!!watchedStatus}
                  onValueChange={(val) =>
                    setValue("status", (val as "ACTIVO" | "INACTIVO") ?? "ACTIVO", {
                      shouldValidate: true,
                    })
                  }
                  valueRenderer={(value) => {
                    if (!value) return "";
                    return value === "ACTIVO" ? "Activo" : "Inactivo";
                  }}
                  error={errors.status?.message}
                >
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </FloatLabelSelect>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-4">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="can_register_attendance"
                  checked={canRegisterAttendance}
                  onCheckedChange={(val) =>
                    setCanRegisterAttendance(val === true)
                  }
                />
                <label
                  htmlFor="can_register_attendance"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Registrar asistencias
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credentials */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-4">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Credenciales de acceso (opcional)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Linked user info (edit mode) */}
            {linkedUser && (
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    linkedUser.isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {linkedUser.isActive
                    ? "Acceso activo"
                    : "Acceso deshabilitado"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                  disabled={actionLoading}
                  onClick={handleToggleAccess}
                >
                  {linkedUser.isActive
                    ? "Deshabilitar acceso"
                    : "Habilitar acceso"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer text-destructive hover:bg-destructive/10"
                  disabled={actionLoading}
                  onClick={handleRemoveUser}
                >
                  Eliminar usuario
                </Button>
              </div>
            )}

            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FloatLabelInput
                id="credentials_username"
                label="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <FloatLabelInput
                id="credentials_password"
                label={isEditMode ? "Nueva contraseña" : "Contraseña"}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FloatLabelSelect
                id="role"
                label="Rol"
                value={selectedRole}
                hasValue={!!selectedRole}
                onValueChange={(val) => setSelectedRole(val ?? "Supervisor")}
                valueRenderer={(value) => {
                  if (!value) return "";
                  return value;
                }}
              >
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </FloatLabelSelect>
            </div>
          </CardContent>
        </Card>

        {/* Áreas asignadas */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              Áreas asignadas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {assignedAreas.map((row, index) => {
              const availableAreas = getAvailableAreas(index);

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-[280px]">
                    <FloatLabelSelect
                      id={`area_${index}`}
                      label="Área"
                      value={row.area_id}
                      hasValue={!!row.area_id}
                      onValueChange={(val) =>
                        updateAreaRow(index, "area_id", val ?? "")
                      }
                      valueRenderer={(value) => {
                        if (!value) return "";
                        const a = areas.find((ar) => ar._id === value);
                        return a ? `${a.code} - ${a.name}` : value;
                      }}
                    >
                      {availableAreas.map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          {a.code} - {a.name}
                        </SelectItem>
                      ))}
                    </FloatLabelSelect>
                  </div>

                  <div className="w-[280px]">
                    <FloatLabelSelect
                      id={`shift_${index}`}
                      label="Turno (opcional)"
                      value={row.shift_id ?? ""}
                      hasValue={!!row.shift_id}
                      onValueChange={(val) =>
                        updateAreaRow(index, "shift_id", val || null)
                      }
                      valueRenderer={(value) => {
                        if (!value) return "";
                        const s = shifts.find((sh) => sh._id === value);
                        return s ? `${s.code} - ${s.shift}` : value;
                      }}
                    >
                      {shifts.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.code} - {s.shift}
                        </SelectItem>
                      ))}
                    </FloatLabelSelect>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => removeAreaRow(index)}
                    title="Eliminar área"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={addAreaRow}
            >
              <Plus className="h-4 w-4" />
              Agregar área
            </Button>
          </CardContent>
        </Card>

        {/* Action bar */}
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
            onClick={() => navigate("/catalogs/direct-supervisors")}
          >
            Cancelar
          </Button>
        </div>

        {/* Credentials action confirm dialog */}
        <Dialog
          open={!!confirmAction}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null);
          }}
          dismissible={false}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-center">
                {confirmAction === "remove-user"
                  ? "Confirmar eliminación"
                  : linkedUser?.isActive
                    ? "Deshabilitar acceso"
                    : "Habilitar acceso"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {confirmAction === "remove-user"
                  ? `¿Estás seguro de que deseas eliminar el usuario "${linkedUser?.username ?? ""}"?`
                  : linkedUser?.isActive
                    ? "¿Estás seguro de que deseas deshabilitar el acceso?"
                    : "¿Estás seguro de que deseas habilitar el acceso?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
                className="cursor-pointer"
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmAction}
                className="cursor-pointer"
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Procesando..."
                  : confirmAction === "remove-user"
                    ? "Eliminar"
                    : linkedUser?.isActive
                      ? "Deshabilitar"
                      : "Habilitar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
}
