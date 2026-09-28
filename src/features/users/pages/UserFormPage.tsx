import { useCallback } from "react";
import { useWatch } from "react-hook-form";
import { useUserForm } from "../hooks/useUserForm";
import { UserFormShell } from "../components/UserFormShell";
import type { PrivilegeOps } from "../types";

export function UserFormPage() {
  const {
    isSubmitting,
    isLoadingRecord,
    serverError,
    isEditMode,
    selectedEmployee,
    setSelectedEmployee,
    employeeSuggestions,
    setEmployeeSuggestions,
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    errors,
    roleOptions,
    onSubmit,
    searchEmployees,
    navigate,
  } = useUserForm();

  // Single source of truth: privileges live in react-hook-form.
  const privileges = useWatch({ control, name: "privileges" });

  const handlePrivilegesChange = useCallback(
    (values: Record<string, PrivilegeOps>) => {
      setValue("privileges", values);
    },
    [setValue],
  );

  return (
    <UserFormShell
      isEditMode={isEditMode}
      isSubmitting={isSubmitting}
      isLoadingRecord={isLoadingRecord}
      serverError={serverError}
      register={register}
      errors={errors}
      setValue={setValue as (name: string, value: unknown) => void}
      watch={watch}
      roleOptions={roleOptions}
      selectedEmployee={selectedEmployee}
      setSelectedEmployee={setSelectedEmployee}
      employeeSuggestions={employeeSuggestions}
      setEmployeeSuggestions={setEmployeeSuggestions}
      onSearchEmployees={searchEmployees}
      privileges={privileges ?? {}}
      onPrivilegesChange={handlePrivilegesChange}
      onSubmit={handleSubmit(onSubmit)}
      navigate={navigate}
    />
  );
}
