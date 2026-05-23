// ── Audit action constants ────────────────────────────────────────────────────
export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// ── Changed by sub-document ───────────────────────────────────────────────────
export interface AuditChangedBy {
  user_id: string;
  username: string;
  role: string;
}

// ── Main audit log entity ─────────────────────────────────────────────────────
export interface AuditLog {
  _id: string;
  action: AuditAction;
  entity: string;
  entity_id: string;
  company_id: string | null;
  endpoint: string;
  changed_by: AuditChangedBy;
  ip_address: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

// ── Paginated response ────────────────────────────────────────────────────────
export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ── Filters ───────────────────────────────────────────────────────────────────
export interface AuditLogFilters {
  entity: string | null;
  action: AuditAction | null;
  username: string;
  startDate: string | null;
  endDate: string | null;
}

// ── Select option types ───────────────────────────────────────────────────────
export interface SelectOption {
  label: string;
  value: string;
}

// ── Entity options ────────────────────────────────────────────────────────────
export const ENTITY_OPTIONS: SelectOption[] = [
  { label: "Empleados", value: "employees" },
  { label: "Usuarios", value: "users" },
  { label: "Empresas", value: "companies" },
  { label: "Clientes", value: "customers" },
  { label: "Plantas", value: "plants" },
  { label: "Puestos", value: "positions" },
  { label: "Áreas", value: "areas" },
  { label: "Bancos", value: "banks" },
  { label: "Turnos", value: "shifts-and-schedules" },
  { label: "Calendarios", value: "payroll-calendars" },
  { label: "Días festivos", value: "public-holidays" },
  { label: "Clases empleado", value: "employee-classes" },
  { label: "Motivos cambio salario", value: "salary-change-reasons" },
  { label: "Cambios de salario", value: "salary-changes" },
  { label: "Solicitudes vacaciones", value: "vacation-requests" },
  { label: "Roles de descanso", value: "rest-roles" },
  { label: "Asistencias", value: "attendance-records" },
  { label: "Jefes directos", value: "direct-supervisors" },
  { label: "Óptimos contratados", value: "customer-optimal-contracts" },
  { label: "Claves incidencia", value: "issue-codes" },
  { label: "Privilegios", value: "privileges" },
  { label: "Configuración", value: "settings" },
  { label: "Autenticación", value: "auth" },
];

// ── Action options ────────────────────────────────────────────────────────────
export const ACTION_OPTIONS: SelectOption[] = [
  { label: "Crear", value: "CREATE" },
  { label: "Editar", value: "UPDATE" },
  { label: "Eliminar", value: "DELETE" },
  { label: "Login", value: "LOGIN" },
];

// ── Action display config ─────────────────────────────────────────────────────
export const ACTION_LABEL: Record<string, string> = {
  CREATE: "Crear",
  UPDATE: "Editar",
  DELETE: "Eliminar",
  LOGIN: "Login",
};

export const ACTION_BADGE_CLASSES: Record<string, string> = {
  CREATE:
    "bg-emerald/10 text-emerald-700 dark:text-emerald-400 border-emerald/30",
  UPDATE: "bg-sky/10 text-sky-700 dark:text-sky-400 border-sky/30",
  DELETE: "bg-rose/10 text-rose-700 dark:text-rose-400 border-rose/30",
  LOGIN: "bg-muted text-muted-foreground border-border/50",
};
