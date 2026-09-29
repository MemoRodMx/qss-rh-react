import {
  type LucideIcon,
  Shield,
  Users,
  Briefcase,
  Eye,
  GitBranch,
} from "lucide-react";

export interface RoleOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Fuente única de verdad para los nombres de roles del dashboard.
 * Los valores (`value`) deben coincidir exactamente con el enum `UserRole` de la API.
 */
export const ROLES: RoleOption[] = [
  { value: "System", label: "System", icon: Shield },
  { value: "Administrativo", label: "Administrativo", icon: Users },
  { value: "Gerente", label: "Gerente", icon: Briefcase },
  { value: "Supervisor", label: "Supervisor", icon: Eye },
  { value: "Coordinador", label: "Coordinador", icon: GitBranch },
];

export const ALL_ROLE_OPTIONS: RoleOption[] = ROLES;

export const ROLE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label]),
);
