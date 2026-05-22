import { useEffect, useState } from "react";
import { employeeService } from "../services/employeeService";
import type { Employee } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusVariant: Record<
  string,
  "success" | "warning" | "secondary" | "teal"
> = {
  ACTIVO: "success",
  INACTIVO: "secondary",
  "DE BAJA": "warning",
};

const statusLabels: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  "DE BAJA": "De baja",
};

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    employeeService
      .list()
      .then((res) => setEmployees(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = employees.filter((emp) => {
    const fullName = [emp.name, emp.surname, emp.lastname]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const q = search.toLowerCase();
    return (
      fullName.includes(q) ||
      (emp.employee_number ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Empleados
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona la plantilla de empleados
          </p>
        </div>
        <Button variant="teal" size="sm" className="cursor-pointer gap-1.5">
          <UserPlus className="h-4 w-4" />
          Nuevo empleado
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o número de empleado..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 rounded-xl"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" />
              {filtered.length} empleados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {filtered.map((employee, index) => {
                const first = employee.name ?? "";
                const sur = employee.surname ?? "";
                const last = employee.lastname ?? "";
                const initials = `${first[0] ?? ""}${sur[0] ?? ""}`;
                return (
                  <div
                    key={employee._id}
                    className="flex items-center gap-4 px-5 py-3 transition-all duration-200 hover:bg-primary/[0.02] hover:border-l-[3px] hover:border-l-primary hover:pl-[17px] animate-fade-in-up"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-secondary/10 text-xs text-primary">
                        {initials || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {[first, sur, last].filter(Boolean).join(" ")}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        #{employee.employee_number}
                      </p>
                    </div>
                    <Badge
                      variant={statusVariant[employee.status] || "secondary"}
                      className="capitalize cursor-pointer"
                    >
                      {statusLabels[employee.status] || employee.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
