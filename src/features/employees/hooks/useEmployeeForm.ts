import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEmployeeFormCatalogs } from "./useEmployeeFormCatalogs";
import { useEmployeeFormEditRecord } from "./useEmployeeFormEditRecord";
import { useEmployeeFormCascades } from "./useEmployeeFormCascades";
import { useEmployeeFormCalcs } from "./useEmployeeFormCalcs";
import { useEmployeeFormAutoGen } from "./useEmployeeFormAutoGen";
import { useEmployeeFormOptimal } from "./useEmployeeFormOptimal";
import { useEmployeeFormSubmit } from "./useEmployeeFormSubmit";

// ── Zod schema ──────────────────────────────────────────────────────────────
export const employeeFormSchema = z.object({
  customer_id: z.string().min(1, "El cliente es obligatorio"),
  employee_number: z.string().optional().default(""),
  name: z.string().min(1, "El nombre es obligatorio"),
  surname: z.string().min(1, "El apellido paterno es obligatorio"),
  lastname: z.string().optional().default(""),
  rfc: z.string().optional().default(""),
  curp: z.string().optional().default(""),
  resident: z.boolean().optional().default(false),
  genre: z.string().min(1, "El género es obligatorio"),
  birth_date: z.string().optional().default(""),
  birth_place: z.string().optional().default(""),
  city_of_birth: z.string().optional().default(""),
  nss: z.string().optional().default(""),
  status: z.string().min(1, "El estado es obligatorio"),
  seniority: z.number().optional().default(0),
  hire_date: z.string().optional().default(""),
  contract_type: z.string().min(1, "El tipo de contrato es obligatorio"),
  sat_zip_code: z.string().optional().default(""),
  email: z.string().optional().default(""),
  marital_status: z.string().min(1, "El estado civil es obligatorio"),
  work_location_plant_id: z.string().optional().default(""),
  work_location_position_id: z.string().optional().default(""),
  work_location_shift_id: z.string().optional().default(""),
  work_location_schedule_id: z.string().optional().default(""),
  work_location_direct_supervisor_id: z.string().optional().default(""),
  work_location_area_id: z.string().optional().default(""),
  salary_salary_type: z.string().optional().default(""),
  salary_daily_salary: z.string().optional().default(""),
  salary_attendance_bonus: z.string().optional().default(""),
  salary_zone: z.string().optional().default(""),
  salary_payment_way: z.string().optional().default(""),
  salary_last_salary_modification: z.string().optional().default(""),
  salary_integrated_factor: z.string().optional().default(""),
  salary_day_per_month: z.string().optional().default(""),
  salary_variable_salary: z.string().optional().default(""),
  salary_weekly_salary: z.string().optional().default(""),
  salary_monthly_salary: z.string().optional().default(""),
  salary_is_customized: z.boolean().optional().default(false),
  bank_bank_id: z.string().optional().default(""),
  bank_account_number: z.string().optional().default(""),
  bank_card_number: z.string().optional().default(""),
  bank_clabe: z.string().optional().default(""),
  address_street: z.string().optional().default(""),
  address_exterior_number: z.string().optional().default(""),
  address_internal_number: z.string().optional().default(""),
  address_colony: z.string().optional().default(""),
  address_city: z.string().optional().default(""),
  address_state: z.string().optional().default(""),
  address_zipcode: z.string().optional().default(""),
  address_country: z.string().optional().default(""),
  personal_data_house_owner: z.boolean().optional().default(false),
  personal_data_schooling: z.string().optional().default(""),
  personal_data_landline_phone_number: z.string().optional().default(""),
  personal_data_mobile_phone_number: z.string().optional().default(""),
  personal_data_emergency_phone_number: z.string().optional().default(""),
  personal_data_relationship: z.string().optional().default(""),
});

type FormValues = z.infer<typeof employeeFormSchema>;

// ── Tab configuration ───────────────────────────────────────────────────────
export type TabId =
  | "general"
  | "work_location"
  | "salary"
  | "bank"
  | "address"
  | "personal_data";

export interface TabConfig {
  id: TabId;
  label: string;
  labelShort: string;
}

export const TABS: TabConfig[] = [
  { id: "general", label: "Datos generales", labelShort: "Generales" },
  { id: "work_location", label: "Ubicación laboral", labelShort: "Ubicación" },
  { id: "salary", label: "Salario", labelShort: "Salario" },
  { id: "bank", label: "Banco", labelShort: "Banco" },
  { id: "address", label: "Dirección", labelShort: "Dirección" },
  { id: "personal_data", label: "Datos personales", labelShort: "Personales" },
];

// ── Tab error count ─────────────────────────────────────────────────────────
const TAB_FIELDS: Record<TabId, (keyof FormValues)[]> = {
  general: [
    "name", "surname", "lastname", "rfc", "curp", "genre",
    "birth_date", "birth_place", "city_of_birth", "nss",
  ],
  work_location: [
    "customer_id", "work_location_plant_id", "work_location_position_id",
    "work_location_shift_id", "work_location_schedule_id",
    "work_location_direct_supervisor_id", "work_location_area_id",
    "status", "hire_date", "contract_type", "sat_zip_code", "email", "marital_status",
  ],
  salary: [
    "salary_salary_type", "salary_daily_salary", "salary_attendance_bonus",
    "salary_zone", "salary_payment_way", "salary_last_salary_modification",
    "salary_integrated_factor", "salary_day_per_month", "salary_variable_salary",
  ],
  bank: ["bank_bank_id", "bank_account_number", "bank_card_number", "bank_clabe"],
  address: [
    "address_street", "address_exterior_number", "address_internal_number",
    "address_colony", "address_city", "address_state", "address_zipcode", "address_country",
  ],
  personal_data: [
    "personal_data_house_owner", "personal_data_schooling",
    "personal_data_landline_phone_number", "personal_data_mobile_phone_number",
    "personal_data_emergency_phone_number", "personal_data_relationship",
  ],
};

export function countTabErrors(
  tabId: TabId,
  errors: Record<string, unknown>,
): number {
  const fields = TAB_FIELDS[tabId];
  let count = 0;
  for (const field of fields) {
    if (errors[field]) count++;
  }
  return count;
}

export function getNestedError(
  errors: Record<string, unknown>,
  path: string,
): { message?: string } | undefined {
  return errors[path] as { message?: string } | undefined;
}

// ── Main hook ───────────────────────────────────────────────────────────────
export function useEmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState<TabId>("general");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver = zodResolver(employeeFormSchema) as any;

  const form = useForm<FormValues>({
    resolver,
    defaultValues: {
      customer_id: "",
      employee_number: "",
      name: "",
      surname: "",
      lastname: "",
      rfc: "",
      curp: "",
      resident: false,
      genre: "",
      birth_date: "",
      birth_place: "",
      city_of_birth: "",
      nss: "",
      status: "",
      seniority: 0,
      hire_date: "",
      contract_type: "",
      sat_zip_code: "",
      email: "",
      marital_status: "",
      work_location_plant_id: "",
      work_location_position_id: "",
      work_location_shift_id: "",
      work_location_schedule_id: "",
      work_location_direct_supervisor_id: "",
      work_location_area_id: "",
      salary_salary_type: "",
      salary_daily_salary: "",
      salary_attendance_bonus: "",
      salary_zone: "",
      salary_payment_way: "",
      salary_last_salary_modification: "",
      salary_integrated_factor: "",
      salary_day_per_month: "",
      salary_variable_salary: "",
      salary_weekly_salary: "",
      salary_monthly_salary: "",
      salary_is_customized: false,
      bank_bank_id: "",
      bank_account_number: "",
      bank_card_number: "",
      bank_clabe: "",
      address_street: "",
      address_exterior_number: "",
      address_internal_number: "",
      address_colony: "",
      address_city: "",
      address_state: "",
      address_zipcode: "",
      address_country: "",
      personal_data_house_owner: false,
      personal_data_schooling: "",
      personal_data_landline_phone_number: "",
      personal_data_mobile_phone_number: "",
      personal_data_emergency_phone_number: "",
      personal_data_relationship: "",
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState } = form;
  const { errors } = formState;

  // Track if initial load is done (for cascade prevention)
  const [isInitialLoad, setIsInitialLoad] = useState(isEditMode);

  // Load catalogs
  const { positions, shifts, areas, banks, states, loadCatalogs } =
    useEmployeeFormCatalogs();

  // Load catalogs on mount for create mode
  useEffect(() => {
    if (!isEditMode) {
      loadCatalogs();
    }
  }, [isEditMode, loadCatalogs]);

  // Cascades
  const {
    schedules,
    municipalities,
    birthMunicipalities,
    colonies,
    customerDisplayName,
    plantDisplayCode,
    plantDisplayName,
    supervisor,
    setCustomerDisplayName,
    setPlantDisplayCode,
    setPlantDisplayName,
    setSupervisor,
  } = useEmployeeFormCascades({
    watch,
    setValue,
    shifts,
    isInitialLoad,
  });

  // Edit record loading
  const { isLoadingRecord } = useEmployeeFormEditRecord({
    id: id ?? "",
    isEditMode,
    reset,
    loadCatalogs,
    setCustomerDisplayName,
    setPlantDisplayCode,
    setPlantDisplayName,
    setSupervisor,
    onEditLoadDone: () => {
      setIsInitialLoad(false);
    },
  });

  // Auto calculations
  useEmployeeFormCalcs({ watch, setValue });

  // CURP/RFC auto-generation
  useEmployeeFormAutoGen({
    watch,
    setValue,
    isInitialLoad,
  });

  // Optimal salary
  useEmployeeFormOptimal({ watch, setValue });

  // Submit
  const {
    onSubmit: submitFn,
    isSubmitting,
    serverError,
  } = useEmployeeFormSubmit(isEditMode, id);
  const onSubmit = handleSubmit(submitFn);

  return {
    activeTab,
    setActiveTab,
    isSubmitting,
    isLoadingRecord,
    serverError,
    isEditMode,
    form,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    reset,
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
  };
}
