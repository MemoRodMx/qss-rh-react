export const AttendanceStatus = {
  PRESENTE: "PRESENTE",
  AUSENTE: "AUSENTE",
  VACACIONES: "VACACIONES",
} as const;

export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface AttendanceEntryItem {
  employee_number: string;
  employee_name: string;
  status: AttendanceStatus;
  notes: string | null;
  is_loan: boolean;
}

export interface AttendanceRecordListItem {
  _id: string;
  date: string;
  date_str: string;
  supervisor_id: string;
  supervisor_name: string;
  plant_id: string;
  plant_name: string;
  shift_id: string | null;
  attendance_count: number;
  notes: string | null;
  creator_username: string;
  createdAt: string;
}

export interface AttendanceRecordDetail extends AttendanceRecordListItem {
  supervisor_employee_number: string;
  shift_name: string | null;
  employees: AttendanceEntryItem[];
  updatedAt: string;
}

export interface EmployeeBySupervisorItem {
  _id: string;
  employee_number: string;
  name: string;
  surname: string;
  lastname: string;
  full_name: string;
  work_location: {
    plant_id: string;
    shift_id: string;
    area_id: string;
  };
}

export interface SupervisorOption {
  _id: string;
  name: string;
  employee_number: string;
}

export interface PlantOption {
  plant_id: string;
  plant_code: string | null;
  plant_name: string | null;
  shift_id: string | null;
  shift_code: string | null;
  shift_name: string | null;
}

export interface LoanSuggestion {
  employee_number: string;
  fullname: string;
  plant_id?: string;
}

export interface EmployeeEntry {
  employee_number: string;
  full_name: string;
  status: AttendanceStatus;
  notes: string;
  is_loan?: boolean;
}

export const STATUS_OPTIONS = [
  { label: "Presente", value: AttendanceStatus.PRESENTE },
  { label: "Ausente", value: AttendanceStatus.AUSENTE },
  { label: "Vacaciones", value: AttendanceStatus.VACACIONES },
] as const;

export const STATUS_SEVERITY: Record<
  AttendanceStatus,
  | "success"
  | "destructive"
  | "default"
  | "secondary"
  | "warning"
  | "teal"
  | "outline"
  | "ghost"
  | "link"
> = {
  [AttendanceStatus.PRESENTE]: "success",
  [AttendanceStatus.AUSENTE]: "destructive",
  [AttendanceStatus.VACACIONES]: "default",
};
