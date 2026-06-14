export interface OptimalContractedRow {
  _id: string;
  workday_type: string;
  area: string;
  position: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export interface OptimalContractedResponse {
  rows: OptimalContractedRow[];
  optimo: Record<string, number>;
}

export interface EmployeeAssignment {
  employee_id: string;
  employee_number: string;
  name: string;
  area_id?: string;
  area_code?: string;
  area_name?: string;
  position_id?: string;
  position_name?: string;
  is_supervisor?: boolean;
}

export interface Descansos {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export interface AssignmentEntry {
  employee_id: string;
  area_id?: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  observations: string;
}

export interface RestRole {
  _id: string;
  company_id: string;
  direct_supervisor_id: string;
  type: "fijo" | "recorrido";
  business_unit: string;
  week: number;
  shift_id: string;
  descansos: Descansos;
  assignments: AssignmentEntry[];
  createdAt: string;
  updatedAt: string;
}

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export const DAY_LABELS: Record<string, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};
