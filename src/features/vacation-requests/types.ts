export interface VacationRequestStatusLogEntry {
  status: string;
  notes: string | null;
  changed_by_username: string;
  changed_at: string;
}

export interface VacationRequest {
  _id: string;
  employee_number: string;
  employee_name?: string;
  plant_id: string;
  plant_name?: string;
  shift_id: string;
  shift_name?: string;
  exercise: number;
  worked_vacations: boolean;
  requested_days: string[];
  notes?: string;
  status: VacationRequestStatus;
  creator_username?: string;
  status_log: VacationRequestStatusLogEntry[];
  created_at?: string;
  updated_at?: string;
}

export type VacationRequestStatus =
  | "NUEVA"
  | "ACEPTADA"
  | "RECHAZADA"
  | "CAMBIO SOLICITADO"
  | "CAMBIOS REALIZADOS";

export type ReviewAction = "ACEPTADA" | "RECHAZADA" | "CAMBIO SOLICITADO";

export interface PlantOption {
  _id: string;
  name: string;
  code: string;
}

export interface ShiftOption {
  _id: string;
  code: string;
  name: string;
}

export interface EmployeeSuggestion {
  employee_number: string;
  fullname: string;
  label: string;
}

export const STATUS_SEVERITY: Record<
  string,
  | "success"
  | "warning"
  | "destructive"
  | "secondary"
  | "default"
  | "teal"
  | "outline"
  | "ghost"
  | "link"
> = {
  NUEVA: "default",
  ACEPTADA: "success",
  RECHAZADA: "destructive",
  "CAMBIO SOLICITADO": "warning",
  "CAMBIOS REALIZADOS": "secondary",
};

export const STATUS_LABELS: Record<string, string> = {
  NUEVA: "Nueva",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  "CAMBIO SOLICITADO": "Cambio Solicitado",
  "CAMBIOS REALIZADOS": "Cambios Realizados",
};
