// ── Employee entity (matches API response) ──────────────────────────────────
export interface Employee {
  _id: string;
  customer_id: string;
  employee_number: string;
  status: string;
  name: string;
  surname: string;
  lastname: string;
  fullname?: string;
  birth_date: string | null;
  resident: boolean;
  birth_place: string;
  city_of_birth: string;
  genre: string;
  rfc: string;
  curp: string;
  nss: string;
  hire_date: string | null;
  seniority: number;
  contract_type: string;
  sat_zip_code: string;
  email: string;
  marital_status: string;
  work_location?: EmployeeWorkLocation;
  salary?: EmployeeSalary;
  bank?: EmployeeBank;
  address?: EmployeeAddress;
  personal_data?: EmployeePersonalData;
  position_name?: string;
  plant_name?: string;
  shift_name?: string;
}

export interface EmployeeWorkLocation {
  plant_id: string;
  position_id: string;
  shift_id: string;
  schedule_id: string;
  direct_supervisor_id: string;
  area_id: string;
}

export interface EmployeeSalary {
  salary_type: string;
  daily_salary: number | null;
  attendance_bonus: number | null;
  zone: string;
  payment_way: string;
  last_salary_modification: string | null;
  integrated_factor: number | null;
  day_per_month: number | null;
  variable_salary: number | null;
  weekly_salary: number | null;
  monthly_salary: number | null;
}

export interface EmployeeBank {
  bank_id: string;
  account_number: string;
  card_number: string;
  clabe: string;
}

export interface EmployeeAddress {
  street: string;
  exterior_number: string;
  internal_number: string;
  colony: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export interface EmployeePersonalData {
  house_owner: boolean;
  schooling: string;
  landline_phone_number: string;
  mobile_phone_number: string;
  emergency_phone_number: string;
  relationship: string;
}

// ── Form values (flat structure for react-hook-form) ────────────────────────
export interface EmployeeFormValues {
  customer_id: string;
  employee_number?: string;
  name: string;
  surname: string;
  lastname: string;
  rfc: string;
  curp: string;
  resident: boolean;
  genre: string;
  birth_date: string;
  birth_place: string;
  city_of_birth: string;
  nss: string;
  status: string;
  seniority: number;
  hire_date: string;
  contract_type: string;
  sat_zip_code: string;
  email: string;
  marital_status: string;

  // Work location (nested)
  work_location_plant_id: string;
  work_location_position_id: string;
  work_location_shift_id: string;
  work_location_schedule_id: string;
  work_location_direct_supervisor_id: string;
  work_location_area_id: string;

  // Salary (nested)
  salary_salary_type: string;
  salary_daily_salary: string;
  salary_attendance_bonus: string;
  salary_zone: string;
  salary_payment_way: string;
  salary_last_salary_modification: string;
  salary_integrated_factor: string;
  salary_day_per_month: string;
  salary_variable_salary: string;
  salary_weekly_salary: string;
  salary_monthly_salary: string;

  // Bank (nested)
  bank_bank_id: string;
  bank_account_number: string;
  bank_card_number: string;
  bank_clabe: string;

  // Address (nested)
  address_street: string;
  address_exterior_number: string;
  address_internal_number: string;
  address_colony: string;
  address_city: string;
  address_state: string;
  address_zipcode: string;
  address_country: string;

  // Personal data (nested)
  personal_data_house_owner: boolean;
  personal_data_schooling: string;
  personal_data_landline_phone_number: string;
  personal_data_mobile_phone_number: string;
  personal_data_emergency_phone_number: string;
  personal_data_relationship: string;
}

// ── Catalog options ─────────────────────────────────────────────────────────
export interface CatalogOption {
  code: string;
  name: string;
}

export interface SupervisorOption {
  _id: string;
  employee_number: string;
  name: string;
  label: string;
}

export interface BankOption {
  _id: string;
  name: string;
}

// ── Employee list response ──────────────────────────────────────────────────
export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ── Constants ───────────────────────────────────────────────────────────────
export const MARITAL_STATUS_OPTIONS = [
  { value: "CASADO", label: "Casado" },
  { value: "SOLTERO", label: "Soltero" },
  { value: "DIVORCIADO", label: "Divorciado" },
  { value: "VIUDO", label: "Viudo" },
] as const;

export const GENRE_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
] as const;

export const STATUS_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "SUSPENDIDO", label: "Suspendido" },
  { value: "BAJA", label: "Baja" },
] as const;

export const CONTRACT_TYPE_OPTIONS = [
  { value: "TEMPORAL", label: "Temporal" },
  { value: "INDEFINIDO", label: "Indefinido" },
  { value: "PRUEBA", label: "Prueba" },
  { value: "OBRA", label: "Obra determinada" },
] as const;

export const SALARY_TYPE_OPTIONS = [
  { value: "FIJO", label: "Fijo" },
  { value: "VARIABLE", label: "Variable" },
  { value: "MIXTO", label: "Mixto" },
] as const;

export const ZONE_OPTIONS = [
  { value: "FRONTERIZA", label: "Fronteriza" },
  { value: "NO_FRONTERIZA", label: "No fronteriza" },
] as const;

export const PAYMENT_WAY_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "TARJETA", label: "Tarjeta" },
] as const;

export const SCHOOLING_OPTIONS = [
  { value: "PRIMARIA", label: "Primaria" },
  { value: "SECUNDARIA", label: "Secundaria" },
  { value: "PREPARATORIA", label: "Preparatoria" },
  { value: "UNIVERSIDAD", label: "Universidad" },
  { value: "POSGRADO", label: "Posgrado" },
  { value: "NINGUNO", label: "Ninguno" },
] as const;
