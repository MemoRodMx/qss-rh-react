export interface WorkLocation {
  customer_id?: string;
  plant_id?: string;
  area_code?: string;
  position_code?: string;
  shift_id?: string;
  schedule_id?: string;
  direct_supervisor_id?: string;
}

export interface Salary {
  salary_type?: string;
  zone?: string;
  payment_way?: string;
  daily_salary?: number;
  weekly_salary?: number;
  monthly_salary?: number;
  attendance_bonus?: number;
  variable_salary?: number;
  integrated_factor?: number;
  day_per_month?: number;
  last_salary_modification?: string | null;
}

export interface Bank {
  bank_id?: string;
  account_number?: string;
  card_number?: string;
  clabe?: string;
}

export interface Address {
  street?: string;
  exterior_number?: string;
  internal_number?: string;
  country?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  colony?: string;
}

export interface PersonalData {
  mobile_phone_number?: string;
  landline_phone_number?: string;
  emergency_phone_number?: string;
  schooling?: string;
  relationship?: string;
  house_owner?: boolean;
}

export interface Employee {
  _id: string;
  employee_number: string;
  status: string;
  name: string;
  surname: string;
  lastname: string;
  fullname?: string;
  position_name?: string;
  plant_name?: string;
  shift_name?: string;
  rfc?: string;
  curp?: string;
  nss?: string;
  genre?: string;
  birth_date?: string;
  birth_place?: string;
  resident?: boolean;
  email?: string;
  hire_date?: string;
  seniority?: string;
  contract_type?: string;
  sat_zip_code?: string;
  marital_status?: string;
  customer_id?: string;
  work_location?: WorkLocation;
  salary?: Salary;
  bank?: Bank;
  address?: Address;
  personal_data?: PersonalData;
  company_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeFormValues {
  name: string;
  surname: string;
  lastname: string;
  rfc: string;
  curp: string;
  nss: string;
  genre: string;
  birth_date: string;
  birth_place: string;
  resident: boolean;
  email: string;
  hire_date: string;
  contract_type: string;
  sat_zip_code: string;
  marital_status: string;
  status: string;
  // Work location
  "work_location.customer_id": string;
  "work_location.plant_id": string;
  "work_location.area_code": string;
  "work_location.position_code": string;
  "work_location.shift_id": string;
  "work_location.schedule_id": string;
  "work_location.direct_supervisor_id": string;
  // Salary
  "salary.salary_type": string;
  "salary.zone": string;
  "salary.payment_way": string;
  "salary.daily_salary": number;
  "salary.weekly_salary": number;
  "salary.monthly_salary": number;
  "salary.attendance_bonus": number;
  "salary.variable_salary": number;
  "salary.integrated_factor": number;
  "salary.day_per_month": number;
  "salary.last_salary_modification": string | null;
  // Bank
  "bank.bank_id": string;
  "bank.account_number": string;
  "bank.card_number": string;
  "bank.clabe": string;
  // Address
  "address.street": string;
  "address.exterior_number": string;
  "address.internal_number": string;
  "address.country": string;
  "address.state": string;
  "address.city": string;
  "address.zipcode": string;
  "address.colony": string;
  // Personal data
  "personal_data.mobile_phone_number": string;
  "personal_data.landline_phone_number": string;
  "personal_data.emergency_phone_number": string;
  "personal_data.schooling": string;
  "personal_data.relationship": string;
  "personal_data.house_owner": boolean;
}

/**
 * Flexible option type for API selects.
 * - Customers: { _id, legal_name }
 * - Banks: { _id, name }
 * - Plants, Areas, Positions, Shifts, Schedules, States, Municipalities, Colonies: { code, name }
 */
export interface SelectOption {
  _id?: string;
  name?: string;
  code?: string;
  label?: string;
  legal_name?: string;
}

export interface SupervisorOption {
  _id: string;
  label: string;
  employee_number: string;
  name?: string;
}
