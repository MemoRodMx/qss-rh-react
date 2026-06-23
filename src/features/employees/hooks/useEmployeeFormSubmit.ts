import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { employeeService } from "../services/employeeService";
import type { EmployeeFormValues, EmployeePayload } from "../types";

function buildPayload(values: EmployeeFormValues): EmployeePayload {
  const payload: EmployeePayload = {
    customer_id: values.customer_id,
    name: values.name,
    surname: values.surname,
    genre: values.genre,
    status: values.status,
    contract_type: values.contract_type,
    marital_status: values.marital_status,
    resident: values.resident ?? false,
    seniority: values.seniority ?? 0,
  };

  if (values.employee_number) payload.employee_number = values.employee_number;
  if (values.lastname) payload.lastname = values.lastname;
  if (values.rfc) payload.rfc = values.rfc;
  if (values.curp) payload.curp = values.curp;
  if (values.birth_date) payload.birth_date = values.birth_date;
  if (values.birth_place) payload.birth_place = values.birth_place;
  if (values.city_of_birth) payload.city_of_birth = values.city_of_birth;
  if (values.nss) payload.nss = values.nss;
  if (values.hire_date) payload.hire_date = values.hire_date;
  if (values.sat_zip_code) payload.sat_zip_code = values.sat_zip_code;
  if (values.email) payload.email = values.email;

  // Work location
  const wl = values.work_location_area_id ||
    values.work_location_position_id ||
    values.work_location_shift_id ||
    values.work_location_schedule_id ||
    values.work_location_direct_supervisor_id ||
    values.work_location_plant_id;
  if (wl) {
    payload.work_location = {};
    if (values.work_location_plant_id) payload.work_location.plant_id = values.work_location_plant_id;
    if (values.work_location_position_id) payload.work_location.position_id = values.work_location_position_id;
    if (values.work_location_shift_id) payload.work_location.shift_id = values.work_location_shift_id;
    if (values.work_location_schedule_id) payload.work_location.schedule_id = values.work_location_schedule_id;
    if (values.work_location_direct_supervisor_id) payload.work_location.direct_supervisor_id = values.work_location_direct_supervisor_id;
    if (values.work_location_area_id) payload.work_location.area_id = values.work_location_area_id;
  }

  // Salary
  payload.salary = {};
  if (values.salary_salary_type) payload.salary.salary_type = values.salary_salary_type;
  if (values.salary_daily_salary) payload.salary.daily_salary = parseFloat(values.salary_daily_salary);
  if (values.salary_attendance_bonus) payload.salary.attendance_bonus = parseFloat(values.salary_attendance_bonus);
  if (values.salary_zone) payload.salary.zone = values.salary_zone;
  if (values.salary_payment_way) payload.salary.payment_way = values.salary_payment_way;
  if (values.salary_last_salary_modification) payload.salary.last_salary_modification = values.salary_last_salary_modification;
  if (values.salary_integrated_factor) payload.salary.integrated_factor = parseFloat(values.salary_integrated_factor);
  if (values.salary_day_per_month) payload.salary.day_per_month = parseFloat(values.salary_day_per_month);
  if (values.salary_variable_salary) payload.salary.variable_salary = parseFloat(values.salary_variable_salary);
  if (values.salary_weekly_salary) payload.salary.weekly_salary = parseFloat(values.salary_weekly_salary);
  if (values.salary_monthly_salary) payload.salary.monthly_salary = parseFloat(values.salary_monthly_salary);
  payload.salary.is_customized = values.salary_is_customized ?? false;

  // Bank
  const bk = values.bank_bank_id ||
    values.bank_account_number ||
    values.bank_card_number ||
    values.bank_clabe;
  if (bk) {
    payload.bank = {};
    if (values.bank_bank_id) payload.bank.bank_id = values.bank_bank_id;
    if (values.bank_account_number) payload.bank.account_number = values.bank_account_number;
    if (values.bank_card_number) payload.bank.card_number = values.bank_card_number;
    if (values.bank_clabe) payload.bank.clabe = values.bank_clabe;
  }

  // Address
  const addr = values.address_street ||
    values.address_exterior_number ||
    values.address_colony ||
    values.address_city ||
    values.address_state ||
    values.address_zipcode ||
    values.address_country;
  if (addr) {
    payload.address = {};
    if (values.address_street) payload.address.street = values.address_street;
    if (values.address_exterior_number) payload.address.exterior_number = values.address_exterior_number;
    if (values.address_internal_number) payload.address.internal_number = values.address_internal_number;
    if (values.address_colony) payload.address.colony = values.address_colony;
    if (values.address_city) payload.address.city = values.address_city;
    if (values.address_state) payload.address.state = values.address_state;
    if (values.address_zipcode) payload.address.zipcode = values.address_zipcode;
    if (values.address_country) payload.address.country = values.address_country;
  }

  // Personal data
  const pd = values.personal_data_schooling ||
    values.personal_data_landline_phone_number ||
    values.personal_data_mobile_phone_number ||
    values.personal_data_emergency_phone_number ||
    values.personal_data_relationship;
  if (pd) {
    payload.personal_data = {
      house_owner: values.personal_data_house_owner ?? false,
    };
    if (values.personal_data_schooling) payload.personal_data.schooling = values.personal_data_schooling;
    if (values.personal_data_landline_phone_number) payload.personal_data.landline_phone_number = values.personal_data_landline_phone_number;
    if (values.personal_data_mobile_phone_number) payload.personal_data.mobile_phone_number = values.personal_data_mobile_phone_number;
    if (values.personal_data_emergency_phone_number) payload.personal_data.emergency_phone_number = values.personal_data_emergency_phone_number;
    if (values.personal_data_relationship) payload.personal_data.relationship = values.personal_data_relationship;
  }

  return payload;
}

export function useEmployeeFormSubmit(isEditMode: boolean, id: string | undefined) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (values: EmployeeFormValues) => {
      setIsSubmitting(true);
      setServerError(null);

      try {
        const payload = buildPayload(values);

        if (isEditMode && id) {
          await employeeService.update(id, payload);
        } else {
          await employeeService.create(payload);
        }

        navigate("/employees");
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { message?: string } };
        };
        setServerError(
          err?.response?.data?.message ||
            "Ocurrió un error al guardar el empleado",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, id, navigate],
  );

  return { onSubmit, isSubmitting, serverError };
}
