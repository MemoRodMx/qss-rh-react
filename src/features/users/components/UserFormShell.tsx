import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Shield,
  User,
  Users,
  Briefcase,
  Eye,
  GitBranch,
} from "lucide-react";
import { PrivilegesSection } from "./PrivilegesSection";
import { EmployeeSearchInput } from "./EmployeeSearchInput";
import type { RoleOption, EmployeeOption } from "../types";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { UserFormValues } from "../types";

interface UserFormShellProps {
  // Form state
  isEditMode: boolean;
  isSubmitting: boolean;
  isLoadingRecord: boolean;
  serverError: string | null;

  // Form methods
  register: UseFormRegister<UserFormValues>;
  errors: FieldErrors<UserFormValues>;
  setValue: (name: string, value: unknown) => void;
  watch: (name: string) => unknown;

  // Role
  roleOptions: RoleOption[];

  // Employee search
  selectedEmployee: EmployeeOption | null;
  setSelectedEmployee: (emp: EmployeeOption | null) => void;
  employeeSuggestions: EmployeeOption[];
  setEmployeeSuggestions: (suggestions: EmployeeOption[]) => void;
  onSearchEmployees: (query: string) => Promise<void>;

  // Privileges
  privilegeValues: Record<string, boolean>;
  onPrivilegeChange: (values: Record<string, boolean>) => void;

  // Actions
  onSubmit: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  System: <Shield className="h-3.5 w-3.5" />,
  "Recursos Humanos": <Users className="h-3.5 w-3.5" />,
  Gerente: <Briefcase className="h-3.5 w-3.5" />,
  Supervisor: <Eye className="h-3.5 w-3.5" />,
  Coordinador: <GitBranch className="h-3.5 w-3.5" />,
};

export function UserFormShell({
  isEditMode,
  isSubmitting,
  isLoadingRecord,
  serverError,
  register,
  errors,
  setValue,
  watch,
  roleOptions,
  selectedEmployee,
  setSelectedEmployee,
  employeeSuggestions,
  setEmployeeSuggestions,
  onSearchEmployees,
  privilegeValues,
  onPrivilegeChange,
  onSubmit,
  navigate,
}: UserFormShellProps) {
  const handleRoleChange = useCallback(
    (value: string | null) => {
      if (value) setValue("role", value);
    },
    [setValue],
  );

  if (isLoadingRecord) {
    return (
      <div className="animate-fade-in max-w-[1080px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)] p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-[1080px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate("/users")}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-heading font-semibold text-foreground">
              {isEditMode ? "Editar Usuario" : "Nuevo Usuario"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditMode
                ? "Modifica los datos del usuario"
                : "Registra un nuevo usuario en el sistema"}
            </p>
          </div>
        </div>
      </div>

      {/* Server error banner */}
      {serverError && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          {/* ── Basic info card ─────────────────────────────────────────────── */}
          <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)] overflow-hidden">
            <div className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-heading font-semibold text-foreground">
                  Información del Usuario
                </h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <Label
                    htmlFor="username"
                    className="text-xs font-medium text-foreground"
                  >
                    Nombre de Usuario{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="ej. juan.perez"
                    className={`mt-1 ${errors.username ? "border-destructive" : ""}`}
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label
                    htmlFor="password"
                    className="text-xs font-medium text-foreground"
                  >
                    Contraseña{" "}
                    {!isEditMode && <span className="text-destructive">*</span>}
                    {isEditMode && (
                      <span className="text-muted-foreground font-normal">
                        (dejar vacío para no cambiar)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    placeholder={
                      isEditMode ? "••••••••" : "Mínimo 8 caracteres"
                    }
                    className={`mt-1 ${errors.password ? "border-destructive" : ""}`}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <Label
                    htmlFor="role"
                    className="text-xs font-medium text-foreground"
                  >
                    Rol <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={(watch("role") as string) || undefined}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger
                      id="role"
                      className={`mt-1 min-w-[180px] ${errors.role ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Seleccionar rol..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <span className="flex items-center gap-2">
                            {ROLE_ICONS[role.value]}
                            <span>{role.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Employee search */}
                <div>
                  <EmployeeSearchInput
                    value={selectedEmployee}
                    onChange={setSelectedEmployee}
                    onSearch={onSearchEmployees}
                    suggestions={employeeSuggestions}
                    setSuggestions={setEmployeeSuggestions}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* ── Privileges card ─────────────────────────────────────────────── */}
          <Card className="rounded-xl border-border/40 bg-card shadow-[var(--shadow-2)] overflow-hidden">
            <div className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-heading font-semibold text-foreground">
                  Privilegios
                </h2>
              </div>
            </div>
            <div className="p-5">
              <PrivilegesSection
                initialValues={privilegeValues}
                onChange={onPrivilegeChange}
              />
            </div>
          </Card>

          {/* ── Actions ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/users")}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting
                ? "Guardando..."
                : isEditMode
                  ? "Actualizar Usuario"
                  : "Crear Usuario"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
