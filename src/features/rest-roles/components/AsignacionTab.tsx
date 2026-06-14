import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { DAYS, DAY_LABELS } from "../types";
import type { EmployeeAssignment } from "../types";
import { useState, useEffect, useMemo, Fragment } from "react";
import api from "@/lib/api";

interface AsignacionTabProps {
  type: "fijo" | "recorrido";
  shiftId: string;
  employees: EmployeeAssignment[];
  optimoTotals: Record<string, number>;
  assignments: Record<string, Record<string, string>>;
  observations: Record<string, string>;
  onAssignmentChange: (employeeId: string, day: string, value: string) => void;
  onObservationChange: (employeeId: string, value: string) => void;
  supervisorId: string;
  assignmentErrors: Record<string, Record<string, string>>;
  validValuesInfo: string[];
}

export function AsignacionTab({
  type,
  shiftId,
  employees,
  optimoTotals,
  assignments,
  observations,
  onAssignmentChange,
  onObservationChange,
  supervisorId,
  assignmentErrors,
  validValuesInfo,
}: AsignacionTabProps) {
  const [shiftLabel, setShiftLabel] = useState("");

  const filteredEmployees = useMemo(
    () =>
      type === "fijo"
        ? employees
        : employees.filter((e) => !e.is_supervisor),
    [employees, type],
  );

  const groupedEmployees = useMemo(() => {
    if (type === "fijo") return null;
    const groups: { areaId: string; employees: EmployeeAssignment[] }[] =
      [];
    let currentGroup: {
      areaId: string;
      employees: EmployeeAssignment[];
    } | null = null;
    for (const emp of filteredEmployees) {
      const areaId = emp.area_id || "__no_area__";
      if (areaId !== currentGroup?.areaId) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { areaId, employees: [emp] };
      } else {
        currentGroup.employees.push(emp);
      }
    }
    if (currentGroup) groups.push(currentGroup);
    return groups;
  }, [type, filteredEmployees]);

  useEffect(() => {
    if (shiftId) {
      api
        .get(`/shifts-and-schedules/${shiftId}`)
        .then((r) => {
          const s = r.data;
          setShiftLabel(`${s.code ?? ""} - ${s.shift ?? s.name ?? ""}`);
        })
        .catch(() => setShiftLabel(""));
    }
  }, [shiftId]);

  const getRealForDay = (day: string): number =>
    filteredEmployees.filter((emp) => {
      const val = (assignments[emp.employee_id]?.[day] || "")
        .trim()
        .toUpperCase();
      return val !== "" && val !== "DS";
    }).length;

  const getMenosForDay = (day: string): number =>
    getRealForDay(day) - (optimoTotals[day] || 0);

  if (!supervisorId) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Seleccione un jefe directo en la pestaña "Óptimo del rol de descanso"
        para ver los empleados.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shiftLabel && (
        <p className="text-lg font-medium">Turno: {shiftLabel}</p>
      )}

      {filteredEmployees.length > 0 && validValuesInfo.length > 0 && (
        <div className="p-3 text-sm bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="font-medium mb-1">Valores permitidos en los campos de asignación:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {validValuesInfo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {filteredEmployees.length > 0 ? (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="text-sm font-medium">
              Asignación de empleados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {type === "recorrido" && <TableHead className="min-w-[100px]">Área</TableHead>}
                  {type === "fijo" && <TableHead className="min-w-[100px]">Puesto</TableHead>}
                  <TableHead className="min-w-[90px]">Núm. emp.</TableHead>
                  <TableHead className="min-w-[320px]">Nombre</TableHead>
                  {DAYS.map((d) => (
                    <TableHead key={d} className="text-center min-w-[50px]">
                      {DAY_LABELS[d].substring(0, 3)}
                    </TableHead>
                  ))}
                  <TableHead className="min-w-[200px]">Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedEmployees
                  ? groupedEmployees.map((group, gi) => (
                      <Fragment key={group.areaId}>
                        {gi > 0 && (
                          <TableRow className="bg-black/5 dark:bg-white/5">
                            <TableCell colSpan={11} className="p-0 h-[10px]" />
                          </TableRow>
                        )}
                        {group.employees.map((emp, ei) => (
                          <TableRow
                            key={emp.employee_id}
                            className="animate-fade-in-up"
                            style={{
                              animationDelay: `${(gi * group.employees.length + ei) * 30}ms`,
                            }}
                          >
                            {type === "recorrido" && (
                              <TableCell>
                                {emp.area_code || "—"}
                              </TableCell>
                            )}
                            {type === "fijo" && (
                              <TableCell>
                                {emp.position_name || "—"}
                              </TableCell>
                            )}
                            <TableCell>
                              {String(emp.employee_number).padStart(
                                5,
                                "0",
                              )}
                            </TableCell>
                            <TableCell>{emp.name}</TableCell>
                            {DAYS.map((d) => (
                              <TableCell key={d} className="p-1">
                                <Input
                                  value={
                                    assignments[emp.employee_id]?.[d] ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    onAssignmentChange(
                                      emp.employee_id,
                                      d,
                                      e.target.value,
                                    )
                                  }
                                  className={`h-8 text-center uppercase text-xs ${
                                    assignmentErrors[emp.employee_id]?.[d]
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                  maxLength={10}
                                />
                                {assignmentErrors[emp.employee_id]?.[
                                  d
                                ] && (
                                  <p className="text-red-500 text-[10px] mt-0.5 leading-tight">
                                    {
                                      assignmentErrors[emp.employee_id][
                                        d
                                      ]
                                    }
                                  </p>
                                )}
                              </TableCell>
                            ))}
                            <TableCell className="p-1">
                              <Input
                                value={
                                  observations[emp.employee_id] || ""
                                }
                                onChange={(e) =>
                                  onObservationChange(
                                    emp.employee_id,
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    ))
                  : filteredEmployees.map((emp, i) => (
                      <TableRow
                        key={emp.employee_id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        {type === "recorrido" && (
                          <TableCell>
                            {emp.area_name || "—"}
                          </TableCell>
                        )}
                        {type === "fijo" && (
                          <TableCell>
                            {emp.position_name || "—"}
                          </TableCell>
                        )}
                        <TableCell>
                          {String(emp.employee_number).padStart(
                            5,
                            "0",
                          )}
                        </TableCell>
                        <TableCell>{emp.name}</TableCell>
                        {DAYS.map((d) => (
                          <TableCell key={d} className="p-1">
                            <Input
                              value={
                                assignments[emp.employee_id]?.[d] || ""
                              }
                              onChange={(e) =>
                                onAssignmentChange(
                                  emp.employee_id,
                                  d,
                                  e.target.value,
                                )
                              }
                              className={`h-8 text-center uppercase text-xs ${
                                assignmentErrors[emp.employee_id]?.[d]
                                  ? "border-red-500"
                                  : ""
                              }`}
                              maxLength={10}
                            />
                            {assignmentErrors[emp.employee_id]?.[d] && (
                              <p className="text-red-500 text-[10px] mt-0.5 leading-tight">
                                {assignmentErrors[emp.employee_id][d]}
                              </p>
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="p-1">
                          <Input
                            value={observations[emp.employee_id] || ""}
                            onChange={(e) =>
                              onObservationChange(
                                emp.employee_id,
                                e.target.value,
                              )
                            }
                            className="h-8 text-xs"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-blue-50/50 dark:bg-blue-950/20 border-t-2 border-border/50">
                  <TableCell className="pt-[5px]"></TableCell>
                  <TableCell className="pt-[5px]"></TableCell>
                  <TableCell className="pt-[5px] text-right font-bold">Óptimo</TableCell>
                  {DAYS.map((d) => (
                    <TableCell key={d} className="pt-[5px] text-center font-bold">
                      {optimoTotals[d] || 0}
                    </TableCell>
                  ))}
                  <TableCell></TableCell>
                </TableRow>
                <TableRow className="bg-green-50/50 dark:bg-green-950/20">
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold">Real</TableCell>
                  {DAYS.map((d) => (
                    <TableCell key={d} className="text-center font-bold">
                      {getRealForDay(d)}
                    </TableCell>
                  ))}
                  <TableCell></TableCell>
                </TableRow>
                <TableRow className="bg-red-50/50 dark:bg-red-950/20">
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold">Menos</TableCell>
                  {DAYS.map((d) => {
                    const val = getMenosForDay(d);
                    return (
                      <TableCell
                        key={d}
                        className={`text-center font-bold ${val < 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {val}
                      </TableCell>
                    );
                  })}
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground p-8">
          No hay empleados asignados a este jefe directo.
        </div>
      )}
    </div>
  );
}
