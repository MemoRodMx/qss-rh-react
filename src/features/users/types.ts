// ── Privilege resource definition ────────────────────────────────────────────
export interface PrivilegeResource {
  key: string;
  label: string;
  icon: string;
}

export const PRIVILEGE_RESOURCES: PrivilegeResource[] = [
  { key: "companies", label: "Empresas", icon: "Building2" },
  { key: "customers", label: "Clientes", icon: "Wallet" },
  { key: "employees", label: "Empleados", icon: "Users" },
  {
    key: "vacation-requests",
    label: "Solicitudes de Vacaciones",
    icon: "CalendarClock",
  },
  {
    key: "attendance-records",
    label: "Registro de Asistencia",
    icon: "IdCard",
  },
  { key: "catalogs", label: "Catálogos", icon: "Book" },
  { key: "users", label: "Usuarios", icon: "User" },
  { key: "settings", label: "Configuración", icon: "Cog" },
];

export const PRIV_OPS = ["view", "create", "edit", "delete"] as const;
export type PrivOp = (typeof PRIV_OPS)[number];

// ── User entity (matches API response) ───────────────────────────────────────
export interface User {
  _id: string;
  username: string;
  password?: string;
  role: string;
  employee_id?: string;
  supervisor_name?: string;
  isActive: boolean;
  privileges?: Record<string, PrivilegeOps>;
  company_id?: string;
}

export interface PrivilegeOps {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

// ── Employee option for autocomplete ─────────────────────────────────────────
export interface EmployeeOption {
  _id: string;
  employee_number: string;
  fullname: string;
  label: string;
}

// ── Form values (react-hook-form) ────────────────────────────────────────────
export interface UserFormValues {
  username: string;
  password: string;
  role: string;
  employee_id: string;
  // Privileges stored as a nested object keyed by resource:
  // { companies: { view, create, edit, delete }, ... }
  privileges: Record<string, PrivilegeOps>;
}

// ── User list response ───────────────────────────────────────────────────────
export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ── Role options ─────────────────────────────────────────────────────────────
// Definición centralizada en src/lib/roles.ts (fuente única de verdad).
