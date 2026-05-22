export const APP_NAME = "QSS RRHH";
export const APP_DESCRIPTION = "Sistema de control de recursos humanos";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  EMPLOYEES: "/employees",
  EMPLOYEE_NEW: "/employees/new",
  EMPLOYEE_EDIT: "/employees/:id/edit",
  EMPLOYEE_DETAIL: "/employees/:id",
  COMPANIES: "/companies",
  COMPANY_NEW: "/companies/new",
  COMPANY_EDIT: "/companies/:id/edit",
} as const;

export const SHADOW_LEVELS = {
  1: "shadow-[var(--shadow-1)]",
  2: "shadow-[var(--shadow-2)]",
  3: "shadow-[var(--shadow-3)]",
  4: "shadow-[var(--shadow-4)]",
  5: "shadow-[var(--shadow-5)]",
} as const;
