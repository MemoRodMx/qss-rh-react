import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { TABS, countTabErrors } from "../hooks/useEmployeeForm";
import type { TabId } from "../hooks/useEmployeeForm";
import type { EmployeeFormValues } from "../types";
import { GeneralInfoTab } from "./tabs/GeneralInfoTab";
import { WorkLocationTab } from "./tabs/WorkLocationTab";
import { SalaryTab } from "./tabs/SalaryTab";
import { BankTab } from "./tabs/BankTab";
import { AddressTab } from "./tabs/AddressTab";
import { PersonalDataTab } from "./tabs/PersonalDataTab";

export interface EmployeeFormShellProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isSubmitting: boolean;
  isLoadingRecord: boolean;
  serverError: string | null;
  isEditMode: boolean;

  form: UseFormReturn<EmployeeFormValues>;
  register: UseFormReturn<EmployeeFormValues>["register"];
  setValue: UseFormReturn<EmployeeFormValues>["setValue"];
  watch: UseFormReturn<EmployeeFormValues>["watch"];
  errors: UseFormReturn<EmployeeFormValues>["formState"]["errors"];

  positions: Array<{ code: string; name: string; description?: string }>;
  shifts: Array<{ code: string; name: string }>;
  schedules: Array<{ code: string; label: string }>;
  areas: Array<{ code: string; name: string }>;
  banks: Array<{ _id: string; name: string }>;
  states: Array<{ code: string; name: string }>;
  municipalities: Array<{ code: string; name: string }>;
  birthMunicipalities: Array<{ code: string; name: string }>;
  colonies: Array<{ code: string; name: string }>;

  customerDisplayName: string;
  plantDisplayCode: string;
  plantDisplayName: string;

  supervisor: {
    _id: string;
    employee_number: string;
    name: string;
    label: string;
  } | null;
  setSupervisor: (
    s: {
      _id: string;
      employee_number: string;
      name: string;
      label: string;
    } | null,
  ) => void;

  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  navigate: (path: string) => void;
}

export function EmployeeFormShell(props: EmployeeFormShellProps) {
  const {
    activeTab,
    setActiveTab,
    isSubmitting,
    isLoadingRecord,
    serverError,
    isEditMode,
    errors,
    onSubmit,
    navigate,
  } = props;

  if (isLoadingRecord) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const errorsRecord = errors as unknown as Record<string, unknown>;

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => navigate("/employees")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEditMode ? "Modificar empleado" : "Agregar empleado"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Actualiza los datos del empleado."
              : "Completa los datos para dar de alta el empleado."}
          </p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="mb-6">
          <div className="flex border-b border-border overflow-x-auto">
            {TABS.map((tab) => {
              const hasErrors = countTabErrors(tab.id, errorsRecord) > 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.labelShort}</span>
                  {hasErrors && (
                    <Badge
                      variant="destructive"
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {countTabErrors(tab.id, errorsRecord)}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "general" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardContent className="p-5 space-y-6">
              <GeneralInfoTab {...props} />
            </CardContent>
          </Card>
        )}

        {activeTab === "work_location" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardContent className="p-5 space-y-6">
              <WorkLocationTab {...props} />
            </CardContent>
          </Card>
        )}

        {activeTab === "salary" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardContent className="p-5 space-y-6">
              <SalaryTab {...props} isEditMode={isEditMode} />
            </CardContent>
          </Card>
        )}

        {activeTab === "bank" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardContent className="p-5 space-y-6">
              <BankTab {...props} />
            </CardContent>
          </Card>
        )}

        {activeTab === "address" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardContent className="p-5 space-y-6">
              <AddressTab {...props} />
            </CardContent>
          </Card>
        )}

        {activeTab === "personal_data" && (
          <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
            <CardContent className="p-5 space-y-6">
              <PersonalDataTab {...props} />
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-6">
          <Button
            type="submit"
            variant="default"
            size="sm"
            className="cursor-pointer gap-1.5"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => navigate("/employees")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
