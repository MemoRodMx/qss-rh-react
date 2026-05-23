export interface RestRole {
  _id: string;
  plant_id: string;
  plant_name?: string;
  plant_code?: string;
  shift_id: string;
  shift_name?: string;
  shift_code?: string;
  year: number;
  week: number;
  supervisor_id?: { _id: string; name: string; employee_number: string };
  supervisor_name?: string;
  creator_username?: string;
  reviewer_username?: string;
  reviewed_at?: string;
  review_notes?: string;
  status: RestRoleStatus;
  days: RestRoleDay[];
  status_log?: StatusLogEntry[];
  company_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RestRoleStatus = "PENDIENTE DE REVISION" | "ACEPTADA" | "RECHAZADA";

export interface RestRoleDay {
  day_name: DayKey;
  employees: RestRoleEmployee[];
}

export interface RestRoleEmployee {
  number: string;
  full_name: string;
}

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayConfig {
  key: DayKey;
  label: string;
}

export const DAY_NAMES: DayConfig[] = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

export const DAY_NAMES_MAP: Record<DayKey, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const STATUS_SEVERITY: Record<RestRoleStatus, string> = {
  "PENDIENTE DE REVISION": "warning",
  ACEPTADA: "success",
  RECHAZADA: "danger",
};

export const STATUS_LABELS: Record<RestRoleStatus, string> = {
  "PENDIENTE DE REVISION": "Pendiente de revisión",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
};

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

export interface Shift {
  _id: string;
  code: string;
  name: string;
}

export interface EmployeeSuggestion {
  employee_number: string;
  label: string;
}

export interface StatusLogEntry {
  status: RestRoleStatus;
  changed_at: string;
  changed_by_username: string;
  notes?: string;
}

export interface RestRoleFormValues {
  plant_id: string;
  shift_id: string;
  year: number;
  week: number;
  supervisor_id: string;
}

export interface DayPayload {
  day_name: string;
  employee_numbers: string[];
}

export interface ReviewFormValues {
  review_notes: string;
}
