import { useState, useEffect } from "react";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import api from "@/lib/api";
import { DAYS, DAY_LABELS } from "../types";
import type { OptimalContractedRow, Descansos } from "../types";

interface CatalogOption {
  _id: string;
  employee_number?: string;
  name: string;
  code?: string;
  shift?: string;
}

interface ShiftOption {
  value: string;
  label: string;
}

interface OptimoTabProps {
  supervisorId: string;
  onSupervisorChange: (id: string) => void;
  type: "fijo" | "recorrido";
  onTypeChange: (type: "fijo" | "recorrido") => void;
  businessUnit: string;
  onBusinessUnitChange: (val: string) => void;
  shiftId: string;
  onShiftChange: (id: string) => void;
  week: number;
  optimalRows: OptimalContractedRow[];
  optimoTotals: Record<string, number>;
  descansos: Descansos;
  onDescansosChange: (descansos: Descansos) => void;
  loading: boolean;
  isSupervisorUser?: boolean;
  mySupervisor?: { _id: string; employee_number: string; name: string } | null;
}

export function OptimoTab({
  supervisorId,
  onSupervisorChange,
  type,
  onTypeChange,
  businessUnit,
  onBusinessUnitChange,
  shiftId,
  onShiftChange,
  week,
  optimalRows,
  optimoTotals,
  descansos,
  onDescansosChange,
  loading,
  isSupervisorUser,
  mySupervisor,
}: OptimoTabProps) {
  const [supervisors, setSupervisors] = useState<
    { _id: string; employee_number: string; name: string }[]
  >([]);
  const [allShifts, setAllShifts] = useState<CatalogOption[]>([]);

  useEffect(() => {
    if (!isSupervisorUser) {
      api.get("/direct-supervisors/list").then((r) => {
        setSupervisors(Array.isArray(r.data) ? r.data : []);
      });
    }
    api.get("/shifts-and-schedules/catalog").then((r) => {
      const raw = Array.isArray(r.data) ? r.data : [];
      setAllShifts(raw);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shiftOptions: ShiftOption[] = allShifts.map((s) => ({
    value: s._id,
    label: `${s.code ?? ""} - ${s.shift ?? ""}`,
  }));

  const getTotal = () =>
    DAYS.reduce((sum, d) => sum + (Number(descansos[d]) || 0), 0);

  const getOptimoTotal = () =>
    DAYS.reduce((sum, d) => sum + (optimoTotals[d] || 0), 0);

  const getRowTotal = (row: OptimalContractedRow) =>
    DAYS.reduce((sum, d) => sum + (Number(row[d]) || 0), 0);

  const mySupervisorLabel = mySupervisor
    ? `${mySupervisor.employee_number || ""} - ${mySupervisor.name || ""}`.trim().replace(/^ - /, "")
    : "";

  const showTable = supervisorId && shiftId;

  return (
    <div className="space-y-4">
      {/* Primera línea: Jefe directo + Turno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isSupervisorUser ? (
          <FloatLabelInput
            id="supervisor"
            label="Jefe directo"
            value={mySupervisorLabel}
            readOnly
            className="bg-muted/30"
          />
        ) : (
          <FloatLabelSelect
            id="supervisor"
            label="Jefe directo"
            value={supervisorId}
            hasValue={!!supervisorId}
            onValueChange={(val) => onSupervisorChange(val ?? "")}
            valueRenderer={(value) => {
              if (!value) return "";
              const sup = supervisors.find((s) => s._id === value);
              return sup
                ? `${sup.employee_number || ""} - ${sup.name}`
                : value;
            }}
          >
            {supervisors.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.employee_number || ""} - {s.name}
              </SelectItem>
            ))}
          </FloatLabelSelect>
        )}

        <FloatLabelSelect
          id="shift"
          label="Turno"
          value={shiftId}
          hasValue={!!shiftId}
          disabled={!supervisorId}
          onValueChange={(val) => onShiftChange(val ?? "")}
          valueRenderer={(value) => {
            if (!value) return "";
            const sh = allShifts.find((s) => s._id === value);
            return sh
              ? `${sh.code ?? ""} - ${sh.shift ?? ""}`
              : value;
          }}
        >
          {shiftOptions.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </FloatLabelSelect>
      </div>

      {/* Segunda línea: Tipo + Unidad de negocio + Semana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FloatLabelSelect
          id="type"
          label="Tipo"
          value={type}
          hasValue={!!type}
          onValueChange={(val) => onTypeChange((val as "fijo" | "recorrido") ?? "fijo")}
          valueRenderer={(value) => {
            if (!value) return "";
            return value === "fijo" ? "Fijo" : "Recorrido";
          }}
        >
          <SelectItem value="fijo">Fijo</SelectItem>
          <SelectItem value="recorrido">Recorrido</SelectItem>
        </FloatLabelSelect>

        <FloatLabelInput
          id="business_unit"
          label="Unidad de negocio"
          value={businessUnit}
          onChange={(e) => onBusinessUnitChange(e.target.value.toUpperCase())}
        />

        <FloatLabelInput
          id="week"
          label="Semana"
          value={week.toString()}
          readOnly
          className="bg-muted/30"
        />
      </div>

      {showTable && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="text-sm font-medium">
              Óptimo Contratado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de jornada</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Puesto</TableHead>
                  {DAYS.map((d) => (
                    <TableHead key={d} className="text-center">
                      {DAY_LABELS[d]}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optimalRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-6">
                      {loading ? "Cargando..." : "Sin datos de óptimo contratado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  optimalRows.map((row, i) => (
                    <TableRow
                      key={row._id || i}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <TableCell className="text-center">{row.workday_type}</TableCell>
                      <TableCell className="text-center">{row.area}</TableCell>
                      <TableCell className="text-center">{row.position}</TableCell>
                      {DAYS.map((d) => (
                        <TableCell key={d} className="text-center">
                          {row[d] || 0}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-medium">
                        {getRowTotal(row)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="border-t-2 border-border/50">
                  <TableCell className="pt-[5px]"></TableCell>
                  <TableCell className="pt-[5px]"></TableCell>
                  <TableCell className="pt-[5px] text-right font-bold">Óptimo</TableCell>
                  {DAYS.map((d) => (
                    <TableCell key={d} className="pt-[5px] text-center font-bold">
                      {optimoTotals[d] || 0}
                    </TableCell>
                  ))}
                  <TableCell className="pt-[5px] text-center font-bold">
                    {getOptimoTotal()}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-primary/[0.03]">
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold">Descansos</TableCell>
                  {DAYS.map((d) => (
                    <TableCell key={d} className="p-1 text-center">
                      <input
                        type="number"
                        min={0}
                        value={descansos[d] || 0}
                        onChange={(e) =>
                          onDescansosChange({
                            ...descansos,
                            [d]: Number(e.target.value) || 0,
                          })
                        }
                        className="w-16 text-center border border-border/40 rounded px-1 py-0.5 text-sm bg-background"
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">
                    {getTotal()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
