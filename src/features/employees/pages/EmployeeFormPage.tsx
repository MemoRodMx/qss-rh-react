import { useEmployeeForm } from "../hooks/useEmployeeForm";
import { EmployeeFormShell } from "../components/EmployeeFormShell";

export function EmployeeFormPage() {
  const {
    // State
    activeTab,
    setActiveTab,
    isSubmitting,
    isLoadingRecord,
    serverError,
    isEditMode,

    // Form
    form,
    register,
    setValue,
    watch,
    errors,

    // Catalog data
    positions,
    shifts,
    schedules,
    areas,
    banks,
    states,
    municipalities,
    colonies,

    // Area dependencies display
    customerDisplayName,
    plantDisplayCode,
    plantDisplayName,

    // Supervisor
    supervisor,
    setSupervisor,

    // Actions
    onSubmit,
    navigate,
  } = useEmployeeForm();

  return (
    <EmployeeFormShell
      // State
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSubmitting={isSubmitting}
      isLoadingRecord={isLoadingRecord}
      serverError={serverError}
      isEditMode={isEditMode}
      // Form
      form={form}
      register={register}
      setValue={setValue}
      watch={watch}
      errors={errors}
      // Catalog data
      positions={positions}
      shifts={shifts}
      schedules={schedules}
      areas={areas}
      banks={banks}
      states={states}
      municipalities={municipalities}
      colonies={colonies}
      // Area dependencies display
      customerDisplayName={customerDisplayName}
      plantDisplayCode={plantDisplayCode}
      plantDisplayName={plantDisplayName}
      // Supervisor
      supervisor={supervisor}
      setSupervisor={setSupervisor}
      // Actions
      onSubmit={form.handleSubmit(onSubmit)}
      navigate={navigate}
    />
  );
}
