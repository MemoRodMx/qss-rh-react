import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { restRoleService } from "../services/restRoleService";
import { DAY_NAMES, DAY_NAMES_MAP } from "../types";
import type {
  Supervisor,
  SupervisorPlant,
  Shift,
  EmployeeSuggestion,
  DayKey,
} from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  Loader2,
  AlertCircle,
  X,
  Plus,
  Users,
  CalendarDays,
} from "lucide-react";

interface FormErrors {
  supervisor_id?: string;
  plant_id?: string;
  shift_id?: string;
  year?: string;
  week?: string;
  days?: string;
  [key: string]: string | undefined;
}

interface DayEmployeeInput {
  day_name: DayKey;
  employee_numbers: string[];
}

export function RestRoleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Form state
  const [supervisorId, setSupervisorId] = useState("");
  const [plantId, setPlantId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [week, setWeek] = useState(getCurrentWeek());
  const [days, setDays] = useState<DayEmployeeInput[]>(() =>
    DAY_NAMES.map((d) => ({
      day_name: d.key,
      employee_numbers: [],
    })),
  );

  // Data lists
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [plants, setPlants] = useState<SupervisorPlant[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(isEditMode);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  // Employee search state per day
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {},
  );
  const [searchResults, setSearchResults] = useState<
    Record<string, EmployeeSuggestion[]>
  >({});
  const [isSearching, setIsSearching] = useState<Record<string, boolean>>({});
  const [showDropdown, setShowDropdown] = useState<Record<string, boolean>>({});
  const searchTimeoutRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const searchInputRef = useRef<Record<string, HTMLInputElement | null>>({});

  // Configured position IDs
  const [positionIds, setPositionIds] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const [supervisorsData, shiftsData, positionIdsData] =
          await Promise.all([
            restRoleService.listSupervisors(),
            restRoleService.listShifts(),
            restRoleService.getConfiguredPositionIds(),
          ]);

        setSupervisors(supervisorsData);
        setShifts(shiftsData);
        setPositionIds(positionIdsData);
      } catch {
        setSubmitError("Error al cargar datos iniciales");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadInitialData();
  }, []);

  // Load role data for edit mode
  useEffect(() => {
    if (!id) return;

    const loadRole = async () => {
      setIsLoadingRole(true);
      try {
        const role = await restRoleService.getById(id);

        setSupervisorId(
          typeof role.supervisor_id === "object" && role.supervisor_id?._id
            ? role.supervisor_id._id
            : "",
        );
        setPlantId(role.plant_id);
        setShiftId(role.shift_id);
        setYear(role.year);
        setWeek(role.week);

        // Load plants for this supervisor
        const supervisorObjId =
          typeof role.supervisor_id === "object" && role.supervisor_id?._id
            ? role.supervisor_id._id
            : role.supervisor_id;
        if (supervisorObjId) {
          try {
            const plantsData = await restRoleService.getSupervisorPlants(
              supervisorObjId as string,
            );
            setPlants(plantsData);
          } catch {
            // ignore
          }
        }

        // Map days
        if (role.days && role.days.length > 0) {
          const mappedDays: DayEmployeeInput[] = DAY_NAMES.map((d) => {
            const existingDay = role.days.find((rd) => rd.day_name === d.key);
            return {
              day_name: d.key,
              employee_numbers:
                existingDay?.employees?.map((e) => e.number) || [],
            };
          });
          setDays(mappedDays);
        }
      } catch {
        setSubmitError("Error al cargar el rol de descanso");
      } finally {
        setIsLoadingRole(false);
      }
    };
    loadRole();
  }, [id]);

  // Load plants when supervisor changes
  useEffect(() => {
    let cancelled = false;

    if (!supervisorId) {
      return;
    }

    const loadPlants = async () => {
      try {
        const plantsData =
          await restRoleService.getSupervisorPlants(supervisorId);
        if (cancelled) return;
        setPlants(plantsData);
        // Reset plant if current selection is not in new list
        if (plantId && !plantsData.some((p) => p.plant_id === plantId)) {
          setPlantId("");
          setShiftId("");
        }
      } catch {
        if (!cancelled) setPlants([]);
      }
    };
    loadPlants();

    return () => {
      cancelled = true;
    };
  }, [supervisorId, plantId]);

  // Employee search with debounce
  const handleSearchChange = useCallback(
    (dayName: string, value: string) => {
      setSearchQueries((prev) => ({ ...prev, [dayName]: value }));

      if (searchTimeoutRef.current[dayName]) {
        clearTimeout(searchTimeoutRef.current[dayName]);
      }

      if (!value.trim()) {
        setSearchResults((prev) => ({ ...prev, [dayName]: [] }));
        setShowDropdown((prev) => ({ ...prev, [dayName]: false }));
        return;
      }

      searchTimeoutRef.current[dayName] = setTimeout(async () => {
        setIsSearching((prev) => ({ ...prev, [dayName]: true }));
        try {
          const results = await restRoleService.searchEmployees(value.trim(), {
            position_ids: positionIds.join(","),
            plant_id: plantId || undefined,
            shift_id: shiftId || undefined,
          });
          setSearchResults((prev) => ({ ...prev, [dayName]: results }));
          setShowDropdown((prev) => ({
            ...prev,
            [dayName]: results.length > 0,
          }));
        } catch {
          setSearchResults((prev) => ({ ...prev, [dayName]: [] }));
        } finally {
          setIsSearching((prev) => ({ ...prev, [dayName]: false }));
        }
      }, 300);
    },
    [positionIds, plantId, shiftId],
  );

  const selectEmployee = (dayName: string, emp: EmployeeSuggestion) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_name !== dayName) return d;
        if (d.employee_numbers.includes(emp.employee_number)) return d;
        return {
          ...d,
          employee_numbers: [...d.employee_numbers, emp.employee_number],
        };
      }),
    );
    setSearchQueries((prev) => ({ ...prev, [dayName]: "" }));
    setSearchResults((prev) => ({ ...prev, [dayName]: [] }));
    setShowDropdown((prev) => ({ ...prev, [dayName]: false }));
    // Focus back on input
    setTimeout(() => searchInputRef.current[dayName]?.focus(), 50);
  };

  const removeEmployee = (dayName: string, employeeNumber: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_name !== dayName) return d;
        return {
          ...d,
          employee_numbers: d.employee_numbers.filter(
            (n) => n !== employeeNumber,
          ),
        };
      }),
    );
  };

  const handleAddEmployeeNumber = (dayName: string) => {
    const query = searchQueries[dayName]?.trim();
    if (!query) return;

    // Check if it looks like an employee number (alphanumeric)
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_name !== dayName) return d;
        if (d.employee_numbers.includes(query)) return d;
        return {
          ...d,
          employee_numbers: [...d.employee_numbers, query],
        };
      }),
    );
    setSearchQueries((prev) => ({ ...prev, [dayName]: "" }));
  };

  const handleKeyDown = (
    dayName: string,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmployeeNumber(dayName);
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!supervisorId) {
      newErrors.supervisor_id = "Selecciona un jefe directo";
    }
    if (!plantId) {
      newErrors.plant_id = "Selecciona una planta";
    }
    if (!shiftId) {
      newErrors.shift_id = "Selecciona un turno";
    }
    if (!year || year < 2020 || year > 2100) {
      newErrors.year = "Año inválido";
    }
    if (!week || week < 1 || week > 53) {
      newErrors.week = "Semana inválida (1-53)";
    }

    // Validate at least one employee assigned
    const hasEmployees = days.some((d) => d.employee_numbers.length > 0);
    if (!hasEmployees) {
      newErrors.days = "Asigna al menos un empleado a un día";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        supervisor_id: supervisorId,
        plant_id: plantId,
        shift_id: shiftId,
        year,
        week,
        days: days
          .filter((d) => d.employee_numbers.length > 0)
          .map((d) => ({
            day_name: d.day_name,
            employee_numbers: d.employee_numbers,
          })),
      };

      if (isEditMode && id) {
        await restRoleService.update(id, payload);
      } else {
        await restRoleService.create(payload);
      }

      navigate("/rest-roles");
    } catch (err: unknown) {
      const apiError = err as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      if (apiError?.response?.data?.errors) {
        const serverErrors: FormErrors = {};
        for (const [field, messages] of Object.entries(
          apiError.response.data.errors,
        )) {
          serverErrors[field] = Array.isArray(messages)
            ? messages[0]
            : String(messages);
        }
        setErrors(serverErrors);
      } else {
        setSubmitError(
          apiError?.response?.data?.message ||
            "Error al guardar el rol de descanso",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData || isLoadingRole) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => navigate("/rest-roles")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isEditMode ? "Editar Rol de Descanso" : "Nuevo Rol de Descanso"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? "Modifica los datos del rol de descanso"
                : "Registra un nuevo rol de descanso semanal"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Main info card */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-primary" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Supervisor */}
              <div className="space-y-2">
                <Label htmlFor="supervisor_id" className="text-sm font-medium">
                  Jefe Directo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={supervisorId}
                  onValueChange={(val) => {
                    if (!val) return;
                    setSupervisorId(val);
                    if (errors.supervisor_id) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.supervisor_id;
                        return next;
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    id="supervisor_id"
                    className={`cursor-pointer ${errors.supervisor_id ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Selecciona un jefe directo">
                      {(value: string | null) => {
                        if (!value) return null;
                        const s = supervisors.find((sup) => sup._id === value);
                        return s ? `${s.name} (${s.employee_number})` : value;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((sup) => (
                      <SelectItem key={sup._id} value={sup._id}>
                        {sup.name} ({sup.employee_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supervisor_id && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.supervisor_id}
                  </p>
                )}
              </div>

              {/* Plant */}
              <div className="space-y-2">
                <Label htmlFor="plant_id" className="text-sm font-medium">
                  Planta <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={plantId}
                  onValueChange={(val) => {
                    if (!val) return;
                    setPlantId(val);
                    if (errors.plant_id) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.plant_id;
                        return next;
                      });
                    }
                    // Reset shift when plant changes
                    setShiftId("");
                  }}
                  disabled={!supervisorId || plants.length === 0}
                >
                  <SelectTrigger
                    id="plant_id"
                    className={`cursor-pointer ${errors.plant_id ? "border-destructive" : ""}`}
                  >
                    <SelectValue
                      placeholder={
                        !supervisorId
                          ? "Primero selecciona un jefe directo"
                          : plants.length === 0
                            ? "Sin plantas disponibles"
                            : "Selecciona una planta"
                      }
                    >
                      {(value: string | null) => {
                        if (!value) return null;
                        const p = plants.find((pl) => pl.plant_id === value);
                        return p
                          ? p.plant_name || p.plant_code || p.plant_id
                          : value;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {plants.map((p) => (
                      <SelectItem key={p.plant_id} value={p.plant_id}>
                        {p.plant_name || p.plant_code || p.plant_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.plant_id && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.plant_id}
                  </p>
                )}
              </div>

              {/* Shift */}
              <div className="space-y-2">
                <Label htmlFor="shift_id" className="text-sm font-medium">
                  Turno <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={shiftId}
                  onValueChange={(val) => {
                    if (!val) return;
                    setShiftId(val);
                    if (errors.shift_id) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.shift_id;
                        return next;
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    id="shift_id"
                    className={`cursor-pointer ${errors.shift_id ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Selecciona un turno">
                      {(value: string | null) => {
                        if (!value) return null;
                        const s = shifts.find((sh) => sh._id === value);
                        return s ? `${s.name} (${s.code})` : value;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shift_id && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shift_id}
                  </p>
                )}
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">
                  Año <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  min={2020}
                  max={2100}
                  value={year}
                  onChange={(e) => {
                    setYear(Number(e.target.value));
                    if (errors.year) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.year;
                        return next;
                      });
                    }
                  }}
                  className={errors.year ? "border-destructive" : ""}
                />
                {errors.year && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.year}
                  </p>
                )}
              </div>

              {/* Week */}
              <div className="space-y-2">
                <Label htmlFor="week" className="text-sm font-medium">
                  Semana <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="week"
                  type="number"
                  min={1}
                  max={53}
                  value={week}
                  onChange={(e) => {
                    setWeek(Number(e.target.value));
                    if (errors.week) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.week;
                        return next;
                      });
                    }
                  }}
                  className={errors.week ? "border-destructive" : ""}
                />
                {errors.week && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.week}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days card */}
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)] mb-6">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" />
              Asignación de Empleados por Día
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {errors.days && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{errors.days}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {days.map((day) => (
                <Card
                  key={day.day_name}
                  className={`border-border/50 bg-card shadow-[var(--shadow-1)] ${
                    day.employee_numbers.length > 0
                      ? "border-l-[3px] border-l-primary"
                      : ""
                  }`}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {DAY_NAMES_MAP[day.day_name]}
                      </span>
                      <Badge
                        variant={
                          day.employee_numbers.length > 0
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px] cursor-pointer"
                      >
                        {day.employee_numbers.length}
                      </Badge>
                    </div>

                    {/* Employee search input */}
                    <div className="relative">
                      <div className="flex gap-1">
                        <Input
                          ref={(el) => {
                            searchInputRef.current[day.day_name] = el;
                          }}
                          placeholder="Buscar o escribir número..."
                          className="h-8 text-xs pr-7"
                          value={searchQueries[day.day_name] || ""}
                          onChange={(e) =>
                            handleSearchChange(day.day_name, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(day.day_name, e)}
                          onFocus={() => {
                            if (searchResults[day.day_name]?.length > 0) {
                              setShowDropdown((prev) => ({
                                ...prev,
                                [day.day_name]: true,
                              }));
                            }
                          }}
                          onBlur={() => {
                            setTimeout(
                              () =>
                                setShowDropdown((prev) => ({
                                  ...prev,
                                  [day.day_name]: false,
                                })),
                              200,
                            );
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="cursor-pointer shrink-0"
                          onClick={() => handleAddEmployeeNumber(day.day_name)}
                          disabled={!searchQueries[day.day_name]?.trim()}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Search dropdown */}
                      {showDropdown[day.day_name] &&
                        searchResults[day.day_name]?.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-[var(--shadow-4)] max-h-40 overflow-y-auto">
                            {searchResults[day.day_name].map((emp) => (
                              <button
                                key={emp.employee_number}
                                type="button"
                                className="w-full text-left px-3 py-2 text-xs hover:bg-primary/5 transition-colors cursor-pointer border-b border-border/30 last:border-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectEmployee(day.day_name, emp);
                                }}
                              >
                                {emp.label}
                              </button>
                            ))}
                          </div>
                        )}

                      {isSearching[day.day_name] && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Selected employees */}
                    <div className="flex flex-wrap gap-1 min-h-[28px]">
                      {day.employee_numbers.length === 0 && (
                        <span className="text-[10px] text-muted-foreground italic">
                          Sin empleados asignados
                        </span>
                      )}
                      {day.employee_numbers.map((empNum) => (
                        <Badge
                          key={empNum}
                          variant="secondary"
                          className="text-[10px] gap-1 max-w-full cursor-pointer"
                        >
                          <span className="truncate">{empNum}</span>
                          <button
                            type="button"
                            className="ml-0.5 hover:text-destructive transition-colors shrink-0"
                            onClick={() => removeEmployee(day.day_name, empNum)}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit error */}
        {submitError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate("/rest-roles")}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="teal"
            className="cursor-pointer gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? "Actualizar" : "Guardar"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff + start.getDay() * 86400000) / oneWeek);
}
