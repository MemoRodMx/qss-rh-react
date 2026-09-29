import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Shield,
  User,
} from "lucide-react";
import { PrivilegesSection } from "./PrivilegesSection";
import { EmployeeSearchInput } from "./EmployeeSearchInput";
import type { EmployeeOption, PrivilegeOps } from "../types";
import type { RoleOption } from "@/lib/roles";
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
  privileges: Record<string, PrivilegeOps>;
  onPrivilegesChange: (values: Record<string, PrivilegeOps>) => void;

  // Actions
  onSubmit: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

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
  privileges,
  onPrivilegesChange,
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
      <div className="animate-fade-in max-w-[1080px]">
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
    <div className="animate-fade-in max-w-[1080px]">
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
                  <FloatLabelInput
                    id="username"
                    label="Nombre de Usuario"
                    error={errors.username?.message}
                    {...register("username")}
                  />
                </div>

                {/* Password */}
                <div>
                  <FloatLabelInput
                    id="password"
                    type="password"
                    label="Contraseña"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                  {isEditMode && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Dejar vacío para no cambiar
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <FloatLabelSelect
                    id="role"
                    label="Rol"
                    value={(watch("role") as string) || ""}
                    hasValue={!!(watch("role") as string)}
                    error={errors.role?.message}
                    onValueChange={handleRoleChange}
                    valueRenderer={(value) => {
                      if (!value) return "";
                      const role = roleOptions.find((r) => r.value === value);
                      return role?.label ?? value;
                    }}
                  >
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <span className="flex items-center gap-2">
                          <role.icon className="h-3.5 w-3.5" />
                          <span>{role.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </FloatLabelSelect>
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
                value={privileges}
                onChange={onPrivilegesChange}
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
