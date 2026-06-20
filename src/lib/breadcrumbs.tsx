/**
 * Breadcrumb path-to-label mappings.
 * The Breadcrumbs component builds the trail by matching the current
 * pathname against these static labels + path segment parsing.
 */

/** Full-path breadcrumb labels for leaf/list routes */
const PATH_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/catalogs": "Catálogos",
  "/customers": "Clientes",
  "/companies": "Empresas",
  "/employees": "Empleados",
  "/users": "Usuarios",
  "/settings": "Configuración",
  "/audit-logs": "Auditoría",
  "/attendance": "Asistencia",
  "/rest-roles": "Roles de Descanso",
  "/vacation-requests": "Vacaciones",
};

/** Intermediate (non-leaf) segments mapped to display labels */
const SEGMENT_LABELS: Record<string, string> = {
  catalogs: "Catálogos",
  customers: "Clientes",
  companies: "Empresas",
  employees: "Empleados",
  users: "Usuarios",
  attendance: "Asistencia",
  "rest-roles": "Roles de Descanso",
  "vacation-requests": "Vacaciones",
  "audit-logs": "Auditoría",
  // Catalog children
  states: "Estados",
  cities: "Ciudades",
  zipcodes: "Códigos Postales",
  colonies: "Colonias",
  "public-holidays": "Días Festivos",
  "payroll-calendars": "Calendario Nómina",
  "shifts-schedules": "Turnos y Horarios",
  "workday-types": "Tipos de Jornada",
  plants: "Plantas",
  "direct-supervisors": "Jefes Directos",
};

/** Last-segment action labels */
const ACTION_LABELS: Record<string, string> = {
  new: "Nuevo",
  edit: "Editar",
  review: "Revisar",
};

export interface BreadcrumbEntry {
  label: string;
  path?: string;
}

/**
 * Build a breadcrumb trail from the current pathname.
 * Uses the flat path-label mapping + dynamic segment analysis.
 */
export function buildBreadcrumbTrail(pathname: string): BreadcrumbEntry[] {
  if (pathname === "/") return [{ label: "Dashboard" }];

  const trail: BreadcrumbEntry[] = [];

  // Root
  trail.push({ label: "Dashboard", path: "/" });

  const raw = pathname.split("/").filter(Boolean);
  let cumulative = "";

  for (let i = 0; i < raw.length; i++) {
    const segment = raw[i];
    cumulative += `/${segment}`;

    // Dynamic MongoDB ObjectId segment (24 hex chars)
    if (/^[a-f0-9]{24}$/.test(segment)) {
      continue;
    }

    // Known action segment (new, edit, review)
    if (ACTION_LABELS[segment]) {
      trail.push({ label: ACTION_LABELS[segment] });
      continue;
    }

    // Known static segment label
    const label = SEGMENT_LABELS[segment];
    if (label) {
      trail.push({ label, path: cumulative });
      continue;
    }

    // Unknown segment — capitalize and use as-is
    trail.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: cumulative,
    });
  }

  return trail;
}
