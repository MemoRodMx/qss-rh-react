import { useState, useCallback, useMemo } from "react";
import { restRoleService } from "../services/restRoleService";
import type {
  OptimalContractedRow,
  EmployeeAssignment,
  AssignmentEntry,
  Descansos,
} from "../types";
import { DAYS } from "../types";
import api from "@/lib/api";

function getNextWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.ceil((days + start.getDay() + 1) / 7) + 1;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  const error = err as { response?: { data?: { message?: string; errors?: Array<{ field: string; errors: string[] }> } } };
  const body = error?.response?.data;
  if (body?.errors && Array.isArray(body.errors) && body.errors.length > 0) {
    const messages: string[] = [];
    for (const fieldError of body.errors) {
      for (const msg of fieldError.errors) {
        messages.push(msg);
      }
    }
    return messages.join(" · ");
  }
  return body?.message || (err as Error)?.message || "Error al guardar";
}

export function useRestRole() {
  const [type, setType] = useState<"fijo" | "recorrido">("fijo");
  const [businessUnit, setBusinessUnit] = useState("FIJO");
  const [supervisorId, setSupervisorId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const week = getNextWeek();

  const [optimalRows, setOptimalRows] = useState<OptimalContractedRow[]>([]);
  const [optimoTotals, setOptimoTotals] = useState<Record<string, number>>(
    Object.fromEntries(DAYS.map((d) => [d, 0])),
  );
  const [descansos, setDescansos] = useState<Descansos>(
    Object.fromEntries(DAYS.map((d) => [d, 0])) as unknown as Descansos,
  );

  const [employees, setEmployees] = useState<EmployeeAssignment[]>([]);
  const [assignments, setAssignments] = useState<
    Record<string, Record<string, string>>
  >({});
  const [observations, setObservations] = useState<Record<string, string>>({});

  const [existingRoleId, setExistingRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [areaCodes, setAreaCodes] = useState<string[]>([]);
  const [allShiftCodes, setAllShiftCodes] = useState<string[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [assignmentErrors, setAssignmentErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const [recorridoAreaCodes, setRecorridoAreaCodes] = useState<string[]>([]);
  const [areaIdByCode, setAreaIdByCode] = useState<Record<string, string>>({});

  const validAssignmentValues = ((): Set<string> => {
    const set = new Set<string>(["DS", ...areaCodes, ...allShiftCodes]);
    if (type === "recorrido") {
      for (const a of areaCodes) {
        for (const s of allShiftCodes) {
          set.add(`${a}/${s}`);
        }
      }
    }
    return set;
  })();

  const recorridoAreaIds = useMemo(
    () => new Set(recorridoAreaCodes.map((code) => areaIdByCode[code]).filter(Boolean)),
    [recorridoAreaCodes, areaIdByCode],
  );

  const sortedEmployees = useMemo(() => {
    if (recorridoAreaIds.size === 0) return employees;
    const normal: EmployeeAssignment[] = [];
    const recorrido: EmployeeAssignment[] = [];
    for (const emp of employees) {
      if (emp.area_id && recorridoAreaIds.has(emp.area_id)) {
        recorrido.push(emp);
      } else {
        normal.push(emp);
      }
    }
    return [...normal, ...recorrido];
  }, [employees, recorridoAreaIds]);

  const validValuesInfo = ((): string[] => {
    const items = ["DS (descanso)"];
    if (allShiftCodes.length)
      items.push(`Códigos de turno: ${allShiftCodes.join(", ")}`);
    if (areaCodes.length)
      items.push(`Códigos de área: ${areaCodes.join(", ")}`);
    if (type === "recorrido")
      items.push("Área/Turno: códigoDeÁrea/códigoDeTurno");
    return items;
  })();

  const validateAssignmentValues = (): boolean => {
    const errors: Record<string, Record<string, string>> = {};
    let hasErrors = false;
    const valid = validAssignmentValues;
    for (const emp of employees) {
      const eid = emp.employee_id;
      if (!assignments[eid]) continue;
      for (const d of DAYS) {
        const val = (assignments[eid][d] || "").trim().toUpperCase();
        if (val === "") continue;
        if (!valid.has(val)) {
          if (!errors[eid]) errors[eid] = {};
          errors[eid][d] = `"${val}" no es un valor válido`;
          hasErrors = true;
        }
      }
    }
    setAssignmentErrors(errors);
    return !hasErrors;
  };

  const clearAssignmentErrors = () => setAssignmentErrors({});

  const loadOptimalContracted = useCallback(async (supId: string) => {
    if (!supId) return;
    setLoading(true);
    try {
      const data = await restRoleService.getOptimalContracted(supId);
      setOptimalRows(data.rows ?? []);
      setOptimoTotals(data.optimo ?? Object.fromEntries(DAYS.map((d) => [d, 0])));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmployees = useCallback(async (supId: string) => {
    if (!supId) return;
    const data = await restRoleService.getEmployeesForAssignment(supId);
    setEmployees(data);

    const assignMap: Record<string, Record<string, string>> = {};
    const obsMap: Record<string, string> = {};
    for (const emp of data) {
      assignMap[emp.employee_id] = Object.fromEntries(
        DAYS.map((d) => [d, ""]),
      );
      obsMap[emp.employee_id] = "";
    }
    setAssignments((prev) => ({ ...assignMap, ...prev }));
    setObservations((prev) => ({ ...obsMap, ...prev }));
    clearAssignmentErrors();
  }, []);

  const loadExistingRole = useCallback(
    async (supId: string, t: string, sId: string, w: number) => {
      if (!supId || !sId) return;
      const data = await restRoleService.findByParams(supId, t, sId, w);
      if (data) {
        setExistingRoleId(data._id);
        if (data.descansos) {
          setDescansos(data.descansos);
        }
        if (data.assignments?.length) {
          const assignMap: Record<string, Record<string, string>> = {};
          const obsMap: Record<string, string> = {};
          for (const a of data.assignments) {
            assignMap[a.employee_id] = Object.fromEntries(
              DAYS.map((d) => [d, a[d] || ""]),
            );
            obsMap[a.employee_id] = a.observations || "";
          }
          setAssignments((prev) => ({ ...assignMap, ...prev }));
          setObservations((prev) => ({ ...obsMap, ...prev }));
        }
      } else {
        setExistingRoleId(null);
      }
    },
    [],
  );

  const setSupervisor = useCallback(
    (id: string) => {
      setSupervisorId(id);
      if (id && shiftId) {
        loadOptimalContracted(id);
        loadEmployees(id);
        loadExistingRole(id, type, shiftId, week);
      } else {
        setOptimalRows([]);
        setEmployees([]);
      }
    },
    [type, shiftId, week, loadOptimalContracted, loadEmployees, loadExistingRole],
  );

  const handleShiftChange = useCallback(
    (id: string) => {
      setShiftId(id);
      if (id && supervisorId) {
        loadOptimalContracted(supervisorId);
        loadEmployees(supervisorId);
        loadExistingRole(supervisorId, type, id, week);
      } else {
        setOptimalRows([]);
      }
    },
    [type, supervisorId, week, loadOptimalContracted, loadEmployees, loadExistingRole],
  );

  // Set both supervisor and shift at once and load data (used in edit mode)
  const loadRoleData = useCallback(
    (supId: string, sId: string, t: "fijo" | "recorrido") => {
      setSupervisorId(supId);
      setShiftId(sId);
      loadOptimalContracted(supId);
      loadEmployees(supId);
      loadExistingRole(supId, t, sId, week);
    },
    [week, loadOptimalContracted, loadEmployees, loadExistingRole],
  );

  const getRowTotal = (row: OptimalContractedRow): number =>
    DAYS.reduce((sum, d) => sum + (Number(row[d]) || 0), 0);

  const getRealForDay = (day: string): number =>
    employees.filter((emp) => {
      const val = (assignments[emp.employee_id]?.[day] || "")
        .trim()
        .toUpperCase();
      return val !== "" && val !== "DS";
    }).length;

  const getMenosForDay = (day: string): number =>
    getRealForDay(day) - (optimoTotals[day] || 0);

  const updateAssignment = (
    employeeId: string,
    day: string,
    value: string,
  ) => {
    setAssignments((prev) => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || Object.fromEntries(DAYS.map((d) => [d, ""]))),
        [day]: value.toUpperCase(),
      },
    }));
  };

  const updateObservation = (employeeId: string, value: string) => {
    setObservations((prev) => ({ ...prev, [employeeId]: value }));
  };

  const saveOptimoTab = async (): Promise<string | null> => {
    const payload = {
      company_id: companyId,
      direct_supervisor_id: supervisorId,
      type,
      business_unit: businessUnit,
      week,
      shift_id: shiftId,
      descansos,
    };

    if (existingRoleId) {
      await restRoleService.update(existingRoleId, { descansos });
      return existingRoleId;
    } else {
      const res = await restRoleService.create(payload);
      setExistingRoleId(res._id);
      return res._id;
    }
  };

  const saveAsignacionTab = async () => {
    const payload = {
      company_id: companyId,
      direct_supervisor_id: supervisorId,
      type,
      business_unit: businessUnit,
      week,
      shift_id: shiftId,
      descansos,
    };

    const assignList: AssignmentEntry[] = employees
      .filter((emp) => type !== "recorrido" || !emp.is_supervisor)
      .map((emp) => ({
        employee_id: emp.employee_id,
        area_id: type === "recorrido" ? emp.area_id : undefined,
        mon: assignments[emp.employee_id]?.mon || "",
        tue: assignments[emp.employee_id]?.tue || "",
        wed: assignments[emp.employee_id]?.wed || "",
        thu: assignments[emp.employee_id]?.thu || "",
        fri: assignments[emp.employee_id]?.fri || "",
        sat: assignments[emp.employee_id]?.sat || "",
        sun: assignments[emp.employee_id]?.sun || "",
        observations: observations[emp.employee_id] || "",
      }));

    if (existingRoleId) {
      await restRoleService.update(existingRoleId, {
        descansos,
        assignments: assignList,
      });
    } else {
      const res = await restRoleService.create({
        ...payload,
        assignments: assignList,
      });
      setExistingRoleId(res._id);
    }
  };

  // Load catalogs (areas + shifts + company + settings)
  const loadCatalogs = useCallback(async () => {
    try {
      const [areasRes, shiftsRes, companyRes] = await Promise.all([
        api.get("/areas/list"),
        api.get("/shifts-and-schedules/catalog"),
        api.get("/companies/list"),
      ]);
      const areas = Array.isArray(areasRes.data) ? areasRes.data : [];
      const shifts = Array.isArray(shiftsRes.data) ? shiftsRes.data : [];
      const companyList = Array.isArray(companyRes.data)
        ? companyRes.data
        : companyRes.data?.data ?? [];
      setAreaCodes(areas.map((a: { code: string }) => a.code));
      setAllShiftCodes(shifts.map((s: { code: string }) => s.code));

      const map: Record<string, string> = {};
      for (const a of areas) {
        if (a._id && a.code) map[a.code] = a._id;
      }
      setAreaIdByCode(map);

      if (companyList.length > 0) {
        const cId = companyList[0]._id;
        setCompanyId(cId);

        try {
          const settingsRes = await api.get("/settings", {
            params: { company_id: cId },
          });
          setRecorridoAreaCodes(
            settingsRes.data?.recorrido_area_codes ?? [],
          );
        } catch {
          // settings fetch is non-fatal
        }
      }
    } catch {
      // catalog load failure is non-fatal
    }
  }, []);

  return {
    type,
    setType,
    businessUnit,
    setBusinessUnit,
    supervisorId,
    shiftId,
    setShiftId: handleShiftChange,
    week,
    optimalRows,
    optimoTotals,
    descansos,
    setDescansos,
    employees,
    sortedEmployees,
    assignments,
    observations,
    existingRoleId,
    loading,
    setSupervisor,
    loadRoleData,
    getRowTotal,
    getRealForDay,
    getMenosForDay,
    updateAssignment,
    updateObservation,
    saveOptimoTab,
    saveAsignacionTab,
    areaCodes,
    allShiftCodes,
    assignmentErrors,
    validValuesInfo,
    validateAssignmentValues,
    clearAssignmentErrors,
    loadCatalogs,
    recorridoAreaCodes,
    recorridoAreaIds,
    getErrorMessage,
  };
}
