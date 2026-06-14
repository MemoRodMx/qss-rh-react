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

// ── Form values (flat structure for react-hook-form) ─────────────────────────
export interface UserFormValues {
  username: string;
  password: string;
  role: string;
  employee_id: string;
  // Privileges are stored as flat keys: `resources.${key}.${op}`
  [key: `resources.${string}.${string}`]: boolean;
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
export interface RoleOption {
  value: string;
  label: string;
  icon: string;
}

export const ALL_ROLE_OPTIONS: RoleOption[] = [
  { value: "System", label: "System", icon: "Shield" },
  { value: "Recursos Humanos", label: "Recursos Humanos", icon: "Users" },
  { value: "Gerente", label: "Gerente", icon: "Briefcase" },
  { value: "Supervisor", label: "Supervisor", icon: "Eye" },
  { value: "Coordinador", label: "Coordinador", icon: "GitBranch" },
];

export const ROLE_ICON_MAP: Record<string, string> = Object.fromEntries(
  ALL_ROLE_OPTIONS.map((r) => [r.value, r.icon]),
);
