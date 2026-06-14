export interface LinkedUser {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export interface AssignedAreaPopulated {
  area_id: string;
  area_code?: string;
  area_name?: string;
  shift_id: string | null;
  shift_code?: string | null;
  shift_name?: string | null;
}

export interface AssignedArea {
  area_id: string;
  shift_id: string | null;
}

export interface DirectSupervisor {
  _id: string;
  employee_number: string;
  employee_id: string;
  name: string;
  status: string;
  assigned_areas: AssignedAreaPopulated[];
  can_register_attendance: boolean;
  user_id: LinkedUser | null;
  fcm_token?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AreaOption {
  _id: string;
  code: string;
  name: string;
}

export interface ShiftOption {
  _id: string;
  code: string;
  shift: string;
}

export interface EmployeeSuggestion {
  employee_number: string;
  fullname: string;
}
