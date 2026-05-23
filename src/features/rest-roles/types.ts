export interface RestRoleDay {
  day_name: string;
  employee_numbers: string[];
}

export interface RestRoleDayEmployee {
  number: string;
  full_name: string;
}

export interface RestRoleDayWithEmployees {
  day_name: string;
  employee_numbers: string[];
  employees: RestRoleDayEmployee[];
}

export interface RestRoleStatusLogEntry {
  status: string;
  notes: string | null;
  changed_by_username: string;
  changed_at: string;
}

export interface RestRole {
  _id: string;
  plant_id: string;
  plant_name?: string;
  shift_id: string;
  shift_name?: string;
  year: number;
  week: number;
  supervisor_id: string;
  supervisor_name?: string;
  created_by: string;
  creator_username?: string;
  status: "PENDIENTE DE REVISION" | "ACEPTADA" | "RECHAZADA";
  reviewed_by?: string;
  reviewer_username?: string;
  reviewed_at?: string;
  review_notes?: string;
  days: RestRoleDayWithEmployees[];
  status_log: RestRoleStatusLogEntry[];
}

export interface Supervisor {
  _id: string;
  name: string;
  employee_number: string;
}

export interface SupervisorPlant {
  plant_id: string;
  plant_code: string | null;
  plant_name: string | null;
  shift_id: string | null;
  shift_code: string | null;
  shift_name: string | null;
}

export interface EmployeeSearchResult {
  employee_number: string;
  fullname: string;
}

export interface DayAssignment {
  employee_number: string;
  label: string;
}

export interface ShiftOption {
  _id: string;
  code: string;
  name: string;
}

export interface PlantOption {
  _id: string;
  name: string;
}

export const DAY_NAMES = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
] as const;

export const DAY_NAMES_MAP: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const STATUS_SEVERITY: Record<
  string,
  "warning" | "success" | "destructive"
> = {
  "PENDIENTE DE REVISION": "warning",
  ACEPTADA: "success",
  RECHAZADA: "destructive",
};

export const STATUS_LABELS: Record<string, string> = {
  "PENDIENTE DE REVISION": "Pendiente de revisión",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
};
