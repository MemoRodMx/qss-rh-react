import { useEmployeeForm } from "../hooks/useEmployeeForm";
import { EmployeeFormShell } from "../components/EmployeeFormShell";

export function EmployeeFormPage() {
  const {
    activeTab,
    setActiveTab,
    isSubmitting,
    isLoadingRecord,
    serverError,
    isEditMode,
    form,
    register,
    setValue,
    watch,
    errors,
    positions,
    shifts,
    schedules,
    areas,
    banks,
    states,
    municipalities,
    birthMunicipalities,
    colonies,
    customerDisplayName,
    plantDisplayCode,
    plantDisplayName,
    supervisor,
    setSupervisor,
    onSubmit,
    navigate,
  } = useEmployeeForm();

  return (
    <EmployeeFormShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSubmitting={isSubmitting}
      isLoadingRecord={isLoadingRecord}
      serverError={serverError}
      isEditMode={isEditMode}
      form={form}
      register={register}
      setValue={setValue}
      watch={watch}
      errors={errors}
      positions={positions}
      shifts={shifts}
      schedules={schedules}
      areas={areas}
      banks={banks}
      states={states}
      municipalities={municipalities}
      birthMunicipalities={birthMunicipalities}
      colonies={colonies}
      customerDisplayName={customerDisplayName}
      plantDisplayCode={plantDisplayCode}
      plantDisplayName={plantDisplayName}
      supervisor={supervisor}
      setSupervisor={setSupervisor}
      onSubmit={onSubmit}
      navigate={navigate}
    />
  );
}
