import { useCallback } from "react";
import { useUserForm } from "../hooks/useUserForm";
import { UserFormShell } from "../components/UserFormShell";

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
    errors,
    roleOptions,
    onSubmit,
    searchEmployees,
    navigate,
  } = useUserForm();

  // Track privilege values from the PrivilegesSection
  const handlePrivilegeChange = useCallback(
    (values: Record<string, boolean>) => {
      // Sync privilege values back to the form
      for (const [key, value] of Object.entries(values)) {
        (setValue as (name: string, value: unknown) => void)(key, value);
      }
    },
    [setValue],
  );

  // Get current privilege values from form
  const getPrivilegeValues = useCallback((): Record<string, boolean> => {
    const values: Record<string, boolean> = {};
    const watched = watch();
    if (watched && typeof watched === "object") {
      for (const [key, val] of Object.entries(watched)) {
        if (key.startsWith("resources.")) {
          values[key] = val === true;
        }
      }
    }
    return values;
  }, [watch]);

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
      privilegeValues={getPrivilegeValues()}
      onPrivilegeChange={handlePrivilegeChange}
      onSubmit={handleSubmit(onSubmit)}
      navigate={navigate}
    />
  );
}
