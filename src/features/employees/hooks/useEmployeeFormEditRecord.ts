import { useEffect, useRef, useState } from "react";
import type { UseFormReset } from "react-hook-form";
import { employeeService } from "../services/employeeService";
import type { EmployeeFormValues, SupervisorOption } from "../types";

interface UseEmployeeFormEditRecordOptions {
  id: string;
  isEditMode: boolean;
  reset: UseFormReset<EmployeeFormValues>;
  loadCatalogs: () => Promise<void>;
  setCustomerDisplayName: (name: string) => void;
  setPlantDisplayCode: (code: string) => void;
  setPlantDisplayName: (name: string) => void;
  setSupervisor: (s: SupervisorOption | null) => void;
  onEditLoadDone: () => void;
}

export function useEmployeeFormEditRecord({
  id,
  isEditMode,
  reset,
  loadCatalogs,
  setCustomerDisplayName,
  setPlantDisplayCode,
  setPlantDisplayName,
  setSupervisor,
  onEditLoadDone,
}: UseEmployeeFormEditRecordOptions) {
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    cancelledRef.current = false;

    async function load() {
      setIsLoadingRecord(true);
      setLoadError(null);
      try {
        await loadCatalogs();

        const employee = await employeeService.getById(id);
        if (cancelledRef.current) return;

        const customerId =
          typeof employee.customer_id === "string"
            ? employee.customer_id
            : ((employee.customer_id as unknown as { _id?: string })?._id ?? "");

        const birthDate = employee.birth_date
          ? new Date(employee.birth_date).toISOString().split("T")[0]
          : "";
        const hireDate = employee.hire_date
          ? new Date(employee.hire_date).toISOString().split("T")[0]
          : "";
        const lastSalaryMod = employee.salary?.last_salary_modification
          ? new Date(employee.salary.last_salary_modification)
              .toISOString()
              .split("T")[0]
          : "";

        reset({
          customer_id: customerId,
          employee_number: employee.employee_number ?? "",
          name: employee.name ?? "",
          surname: employee.surname ?? "",
          lastname: employee.lastname ?? "",
          rfc: employee.rfc ?? "",
          curp: employee.curp ?? "",
          resident: employee.resident ?? false,
          genre: employee.genre ?? "",
          birth_date: birthDate,
          birth_place: employee.birth_place ?? "",
          city_of_birth: employee.city_of_birth ?? "",
          nss: employee.nss ?? "",
          status: employee.status ?? "",
          seniority: employee.seniority ?? 0,
          hire_date: hireDate,
          contract_type: employee.contract_type ?? "",
          sat_zip_code: employee.sat_zip_code ?? "",
          email: employee.email ?? "",
          marital_status: employee.marital_status ?? "",
          work_location_plant_id: employee.work_location?.plant_id ?? "",
          work_location_position_id: employee.work_location?.position_id ?? "",
          work_location_shift_id: employee.work_location?.shift_id ?? "",
          work_location_schedule_id: employee.work_location?.schedule_id ?? "",
          work_location_direct_supervisor_id:
            employee.work_location?.direct_supervisor_id ?? "",
          work_location_area_id: employee.work_location?.area_id ?? "",
          salary_salary_type: employee.salary?.salary_type ?? "",
          salary_daily_salary: employee.salary?.daily_salary?.toString() ?? "",
          salary_attendance_bonus:
            employee.salary?.attendance_bonus?.toString() ?? "",
          salary_zone: employee.salary?.zone ?? "",
          salary_payment_way: employee.salary?.payment_way ?? "",
          salary_last_salary_modification: lastSalaryMod,
          salary_integrated_factor:
            employee.salary?.integrated_factor?.toString() ?? "",
          salary_day_per_month:
            employee.salary?.day_per_month?.toString() ?? "",
          salary_variable_salary:
            employee.salary?.variable_salary?.toString() ?? "",
          salary_weekly_salary:
            employee.salary?.weekly_salary?.toString() ?? "",
          salary_monthly_salary:
            employee.salary?.monthly_salary?.toString() ?? "",
          salary_is_customized: employee.salary?.is_customized ?? false,
          bank_bank_id: employee.bank?.bank_id ?? "",
          bank_account_number: employee.bank?.account_number ?? "",
          bank_card_number: employee.bank?.card_number ?? "",
          bank_clabe: employee.bank?.clabe ?? "",
          address_street: employee.address?.street ?? "",
          address_exterior_number: employee.address?.exterior_number ?? "",
          address_internal_number: employee.address?.internal_number ?? "",
          address_colony: employee.address?.colony ?? "",
          address_city: employee.address?.city ?? "",
          address_state: employee.address?.state ?? "",
          address_zipcode: employee.address?.zipcode ?? "",
          address_country: employee.address?.country ?? "",
          personal_data_house_owner:
            employee.personal_data?.house_owner ?? false,
          personal_data_schooling: employee.personal_data?.schooling ?? "",
          personal_data_landline_phone_number:
            employee.personal_data?.landline_phone_number ?? "",
          personal_data_mobile_phone_number:
            employee.personal_data?.mobile_phone_number ?? "",
          personal_data_emergency_phone_number:
            employee.personal_data?.emergency_phone_number ?? "",
          personal_data_relationship:
            employee.personal_data?.relationship ?? "",
        });

        if (employee.work_location?.direct_supervisor_id) {
          const sup = await employeeService.getSupervisorById(
            employee.work_location.direct_supervisor_id,
          );
          if (!cancelledRef.current) setSupervisor(sup);
        }

        if (employee.work_location?.area_id) {
          const deps = await employeeService.getAreaDependencies(
            employee.work_location.area_id,
          );
          if (!cancelledRef.current && deps) {
            setCustomerDisplayName(deps.customer?.legal_name ?? "");
            setPlantDisplayCode(deps.plant?.code ?? "");
            setPlantDisplayName(deps.plant?.name ?? "");
          }
        }

        if (!cancelledRef.current) onEditLoadDone();
      } catch {
        if (!cancelledRef.current) {
          setLoadError("Error al cargar los datos del empleado");
        }
      } finally {
        if (!cancelledRef.current) setIsLoadingRecord(false);
      }
    }

    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [id, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  return { isLoadingRecord, loadError };
}
