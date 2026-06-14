export interface PayrollCalendar {
  _id: string;
  year: number;
  week: number;
  init_date: string;
  end_date: string;
  accounting_month: number;
  imss_month: number;
  company_id?: string;
}

export interface PublicHoliday {
  _id: string;
  year: number;
  date: string;
  description: string;
  company_id?: string;
}

export interface ShiftSchedule {
  _id: string;
  customer_id: string;
  code: string;
  shift: string;
  schedule: string;
  hours_per_shift: number;
  description: string;
  company_id?: string;
}

export interface State {
  _id: string;
  code: string;
  name: string;
}

export interface City {
  _id: string;
  code: string;
  name: string;
}

export interface Zipcode {
  _id: string;
  code: string;
  state: string;
  municipality: string;
  locality: string;
}

export interface Colony {
  _id: string;
  code: string;
  name: string;
  zipcode: string;
}

export interface Plant {
  _id: string;
  customer_id: string;
  code: string;
  name: string;
  description?: string;
}

export interface WorkdayType {
  _id: string;
  code: string;
  name: string;
  description?: string;
  status: boolean;
}

export interface CustomerOption {
  name: string;
  code: string;
}
