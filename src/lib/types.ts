export interface User {
  id: string;
  username: string;
  role: string;
  company_id?: string;
  avatar?: string;
}

export interface Employee {
  _id: string;
  employee_number: string;
  status: string;
  name: string;
  surname: string;
  lastname: string;
  email: string;
  hire_date: string;
  position?: string;
  department?: string;
  company_id?: string;
  avatar?: string;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  on_leave: number;
  new_hires_this_month: number;
  attendance_rate: number;
  pending_requests: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CompanyAddress {
  street?: string;
  ext_number?: string;
  int_number?: string;
  colony?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface CompanyDocument {
  document_number?: string;
  expiration_date?: string | null;
}

export interface Company {
  _id: string;
  legal_name: string;
  rfc: string;
  patronal_registration: string;
  legal_representative: string;
  fiscal_reg_number?: string;
  address?: CompanyAddress;
  repse?: CompanyDocument;
  canaco?: CompanyDocument;
  siem?: CompanyDocument;
  iso_18788?: CompanyDocument;
  celic?: CompanyDocument;
  operating_license?: CompanyDocument;
  land_use_license?: CompanyDocument;
  suppliers_registry?: CompanyDocument;
  status: "ACTIVE" | "INACTIVE";
  plants?: Array<{ plant_id: string }>;
  company_id?: string;
}
