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
    customers,
    plants,
    positions,
    shifts,
    schedules,
    areas,
    banks,
    states,
    municipalities,
    colonies,

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
      customers={customers}
      plants={plants}
      positions={positions}
      shifts={shifts}
      schedules={schedules}
      areas={areas}
      banks={banks}
      states={states}
      municipalities={municipalities}
      colonies={colonies}
      // Supervisor
      supervisor={supervisor}
      setSupervisor={setSupervisor}
      // Actions
      onSubmit={form.handleSubmit(onSubmit)}
      navigate={navigate}
    />
  );
}
