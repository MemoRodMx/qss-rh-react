import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Warehouse,
  Clock,
  Briefcase,
  UserCog,
  CalendarDays,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CatalogEntry {
  label: string;
  description: string;
  to: string;
  icon: typeof MapPin;
}

const catalogGroups: { label: string; items: CatalogEntry[] }[] = [
  {
    label: "Operativos",
    items: [
      {
        label: "Plantas",
        description: "Plantas y ubicaciones operativas",
        to: "/catalogs/plants",
        icon: Warehouse,
      },
      {
        label: "Turnos y Horarios",
        description: "Configuración de turnos de trabajo",
        to: "/catalogs/shifts-schedules",
        icon: Clock,
      },
      {
        label: "Tipos de Jornada",
        description: "Tipos de jornada laboral",
        to: "/catalogs/workday-types",
        icon: Briefcase,
      },
      {
        label: "Jefes Directos",
        description: "Supervisores y jefes inmediatos",
        to: "/catalogs/direct-supervisors",
        icon: UserCog,
      },
    ],
  },
  {
    label: "Geográficos",
    items: [
      {
        label: "Estados",
        description: "Catálogo de estados de la república",
        to: "/catalogs/states",
        icon: MapPin,
      },
      {
        label: "Ciudades",
        description: "Municipios y localidades",
        to: "/catalogs/cities",
        icon: MapPin,
      },
      {
        label: "Códigos Postales",
        description: "Catálogo de códigos postales",
        to: "/catalogs/zipcodes",
        icon: MapPin,
      },
      {
        label: "Colonias",
        description: "Colonias por código postal",
        to: "/catalogs/colonies",
        icon: MapPin,
      },
    ],
  },
  {
    label: "Calendarios",
    items: [
      {
        label: "Días Festivos",
        description: "Calendario de días festivos",
        to: "/catalogs/public-holidays",
        icon: CalendarDays,
      },
      {
        label: "Calendario Nómina",
        description: "Semanas y períodos de nómina",
        to: "/catalogs/payroll-calendars",
        icon: CalendarDays,
      },
    ],
  },
];

export function CatalogsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(
    () =>
      catalogGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              item.label.toLowerCase().includes(search.toLowerCase()) ||
              item.description.toLowerCase().includes(search.toLowerCase()),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [search],
  );

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Catálogos
        </h1>
        <p className="text-sm text-muted-foreground">
          Administración de catálogos del sistema
        </p>
      </div>

      {/* ── Search ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar catálogo..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1"
            onClick={() => setSearch("")}
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* ── Catalog groups ────────────────────────────────────────── */}
      {filteredGroups.map((group) => (
        <section key={group.label} className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h2>
          <div className="stagger-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.to}
                  hoverable
                  className="group cursor-pointer border-border/50 bg-card shadow-[var(--shadow-1)] border-l-[3px] border-l-transparent hover:border-l-primary transition-all duration-200"
                  onClick={() => navigate(item.to)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 backdrop-blur-sm text-primary transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/15">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
