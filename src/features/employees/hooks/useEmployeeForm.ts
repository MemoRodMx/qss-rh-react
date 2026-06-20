import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeeService } from "../services/employeeService";
import { generateCurpBase } from "../utils/useCurpRfc";
import type { CatalogOption, SupervisorOption, BankOption } from "../types";

// ── Zod schema ──────────────────────────────────────────────────────────────
const employeeFormSchema = z.object({
  // General
  customer_id: z.string().min(1, "El cliente es obligatorio"),
  employee_number: z.string().optional(),
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

  // Work location
  work_location_plant_id: z.string().optional().default(""),
  work_location_position_id: z.string().optional().default(""),
  work_location_shift_id: z.string().optional().default(""),
  work_location_schedule_id: z.string().optional().default(""),
  work_location_direct_supervisor_id: z.string().optional().default(""),
  work_location_area_id: z.string().optional().default(""),

  // Salary
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

  // Bank
  bank_bank_id: z.string().optional().default(""),
  bank_account_number: z.string().optional().default(""),
  bank_card_number: z.string().optional().default(""),
  bank_clabe: z.string().optional().default(""),

  // Address
  address_street: z.string().optional().default(""),
  address_exterior_number: z.string().optional().default(""),
  address_internal_number: z.string().optional().default(""),
  address_colony: z.string().optional().default(""),
  address_city: z.string().optional().default(""),
  address_state: z.string().optional().default(""),
  address_zipcode: z.string().optional().default(""),
  address_country: z.string().optional().default(""),

  // Personal data
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
    "name",
    "surname",
    "lastname",
    "rfc",
    "curp",
    "genre",
    "birth_date",
    "birth_place",
    "city_of_birth",
    "nss",
  ],
  work_location: [
    "customer_id",
    "work_location_plant_id",
    "work_location_position_id",
    "work_location_shift_id",
    "work_location_schedule_id",
    "work_location_direct_supervisor_id",
    "work_location_area_id",
    "status",
    "hire_date",
    "contract_type",
    "sat_zip_code",
    "email",
    "marital_status",
  ],
  salary: [
    "salary_salary_type",
    "salary_daily_salary",
    "salary_attendance_bonus",
    "salary_zone",
    "salary_payment_way",
    "salary_last_salary_modification",
    "salary_integrated_factor",
    "salary_day_per_month",
    "salary_variable_salary",
  ],
  bank: [
    "bank_bank_id",
    "bank_account_number",
    "bank_card_number",
    "bank_clabe",
  ],
  address: [
    "address_street",
    "address_exterior_number",
    "address_internal_number",
    "address_colony",
    "address_city",
    "address_state",
    "address_zipcode",
    "address_country",
  ],
  personal_data: [
    "personal_data_house_owner",
    "personal_data_schooling",
    "personal_data_landline_phone_number",
    "personal_data_mobile_phone_number",
    "personal_data_emergency_phone_number",
    "personal_data_relationship",
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

// ── Helper to get nested error ──────────────────────────────────────────────
export function getNestedError(
  errors: Record<string, unknown>,
  path: string,
): { message?: string } | undefined {
  return errors[path] as { message?: string } | undefined;
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useEmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);

  // Catalog data
  const [positions, setPositions] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [shifts, setShifts] = useState<Array<{ code: string; name: string }>>(
    [],
  );
  const [schedules, setSchedules] = useState<
    Array<{ code: string; label: string }>
  >([]);
  const [areas, setAreas] = useState<CatalogOption[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [states, setStates] = useState<CatalogOption[]>([]);
  const [municipalities, setMunicipalities] = useState<CatalogOption[]>([]);
  const [colonies, setColonies] = useState<CatalogOption[]>([]);

  // Area dependencies display
  const [customerDisplayName, setCustomerDisplayName] = useState("");
  const [plantDisplayCode, setPlantDisplayCode] = useState("");
  const [plantDisplayName, setPlantDisplayName] = useState("");

  // Supervisor
  const [supervisor, setSupervisor] = useState<SupervisorOption | null>(null);

  // Prevent cascade clearing during initial record load
  const isInitialLoadRef = useRef(isEditMode);

  // ── CURP / RFC auto-generation ────────────────────────────────────────────
  // Store the saved CURP/RFC so we can compare the generated base against them.
  // If the generated base matches the saved value's prefix, we keep the saved
  // value (preserving the homoclave). Only overwrite when a field change
  // actually produces a different base.
  const savedCurpRef = useRef("");
  const savedRfcRef = useRef("");

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(employeeFormSchema) as any,
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

  // Watched values for cascades
  const watchedAreaId = watch("work_location_area_id");
  const watchedShiftId = watch("work_location_shift_id");
  const watchedState = watch("address_state");
  const watchedZipcode = watch("address_zipcode");
  const watchedDailySalary = watch("salary_daily_salary");
  const watchedSalaryType = watch("salary_salary_type");
  const watchedDayPerMonth = watch("salary_day_per_month");
  const watchedHireDate = watch("hire_date");

  // ── Load auxiliary data ───────────────────────────────────────────────────
  const loadAuxData = useCallback(async () => {
    try {
      const [areasData, positionsData, shiftsData, banksData, statesData] =
        await Promise.all([
          employeeService.listAreas(),
          employeeService.listPositions(),
          employeeService.listShifts(),
          employeeService.listBanks(),
          employeeService.listStates(),
        ]);
      setAreas(areasData);
      setPositions(positionsData);
      setShifts(shiftsData);
      setBanks(banksData);
      setStates(statesData);
    } catch {
      setServerError("Error al cargar datos auxiliares");
    }
  }, []);

  // ── Load record for edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) {
      loadAuxData();
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        await loadAuxData();

        const employee = await employeeService.getById(id!);
        if (cancelled) return;

        const customerId =
          typeof employee.customer_id === "string"
            ? employee.customer_id
            : ((employee.customer_id as unknown as { _id?: string })?._id ??
              "");

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

        // Store saved CURP/RFC so auto-generation can compare and preserve homoclave
        savedCurpRef.current = employee.curp ?? "";
        savedRfcRef.current = employee.rfc ?? "";

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

        // Load supervisor
        if (employee.work_location?.direct_supervisor_id) {
          const sup = await employeeService.getSupervisorById(
            employee.work_location.direct_supervisor_id,
          );
          if (!cancelled) setSupervisor(sup);
        }

        // Load area dependencies (customer + plant display)
        if (employee.work_location?.area_id) {
          const deps = await employeeService.getAreaDependencies(
            employee.work_location.area_id,
          );
          if (!cancelled && deps) {
            setCustomerDisplayName(deps.customer?.legal_name ?? "");
            setPlantDisplayCode(deps.plant?.code ?? "");
            setPlantDisplayName(deps.plant?.name ?? "");
          }
        }

        if (!cancelled) isInitialLoadRef.current = false;
      } catch {
        setServerError("Error al cargar los datos del empleado");
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, loadAuxData, reset]);

  // ── Cascade: area → customer + plant ──────────────────────────────────────
  useEffect(() => {
    if (!watchedAreaId) {
      if (!isInitialLoadRef.current) {
        setValue("customer_id", "");
        setValue("work_location_plant_id", "");
        setCustomerDisplayName("");
        setPlantDisplayCode("");
        setPlantDisplayName("");
      }
      return;
    }
    employeeService
      .getAreaDependencies(watchedAreaId)
      .then((deps) => {
        if (deps?.customer?._id) {
          setValue("customer_id", deps.customer._id);
          setCustomerDisplayName(deps.customer.legal_name ?? "");
        }
        if (deps?.plant?.code) {
          setValue("work_location_plant_id", deps.plant.code);
          setPlantDisplayCode(deps.plant.code);
          setPlantDisplayName(deps.plant.name ?? "");
        }
      })
      .catch(() => {});
  }, [watchedAreaId, setValue]);

  // ── Cascade: shift → schedules ────────────────────────────────────────────
  useEffect(() => {
    if (!watchedShiftId) {
      setSchedules([]);
      return;
    }
    const shift = shifts.find((s) => s.code === watchedShiftId);
    if (shift) {
      employeeService
        .listSchedules(shift.name)
        .then(setSchedules)
        .catch(() => {});
    }
  }, [watchedShiftId, shifts]);

  // ── Cascade: state → municipalities ───────────────────────────────────────
  useEffect(() => {
    if (!watchedState) {
      setMunicipalities([]);
      return;
    }
    employeeService
      .listMunicipalities(watchedState)
      .then(setMunicipalities)
      .catch(() => {});
  }, [watchedState]);

  // ── Cascade: zipcode → colonies ───────────────────────────────────────────
  useEffect(() => {
    if (!watchedZipcode || watchedZipcode.length < 5) {
      setColonies([]);
      return;
    }
    employeeService
      .listColonies(watchedZipcode)
      .then(setColonies)
      .catch(() => {});
  }, [watchedZipcode]);

  // ── Auto-calculate seniority (complete years) ─────────────────────────────
  useEffect(() => {
    if (!watchedHireDate) {
      setValue("seniority", 0);
      return;
    }
    const hire = new Date(watchedHireDate);
    const today = new Date();
    let years = today.getFullYear() - hire.getFullYear();
    const monthDiff = today.getMonth() - hire.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < hire.getDate())
    ) {
      years--;
    }
    setValue("seniority", Math.max(0, years));
  }, [watchedHireDate, setValue]);

  // ── Auto-calculate weekly/monthly salary ──────────────────────────────────
  useEffect(() => {
    const daily = parseFloat(watchedDailySalary);
    if (!isNaN(daily) && daily > 0) {
      setValue("salary_weekly_salary", (daily * 7).toFixed(2));
      const daysPerMonth = parseFloat(watchedDayPerMonth);
      const multiplier =
        !isNaN(daysPerMonth) && daysPerMonth > 0 ? daysPerMonth : 30;
      setValue("salary_monthly_salary", (daily * multiplier).toFixed(2));
    } else {
      setValue("salary_weekly_salary", "");
      setValue("salary_monthly_salary", "");
    }
  }, [watchedDailySalary, watchedSalaryType, watchedDayPerMonth, setValue]);

  // ── CURP auto-generation ──────────────────────────────────────────────────
  // Only overwrite the CURP when the generated base actually differs from the
  // saved value's prefix (first 16 chars). This preserves the homoclave (last 2
  // chars) that the user may have entered manually.
  const watchedName = watch("name");
  const watchedSurname = watch("surname");
  const watchedLastname = watch("lastname");
  const watchedBirthDate = watch("birth_date");
  const watchedGenre = watch("genre");
  const watchedBirthPlace = watch("birth_place");

  useEffect(() => {
    const base = generateCurpBase(
      watchedName,
      watchedSurname,
      watchedLastname,
      watchedBirthDate || null,
      watchedGenre,
      watchedBirthPlace,
    );
    if (!base) return;

    const saved = savedCurpRef.current;
    // If there's a saved value and the generated base matches its first 16 chars,
    // keep the saved value (preserving the homoclave)
    if (saved && saved.startsWith(base)) return;

    setValue("curp", base);
  }, [
    watchedName,
    watchedSurname,
    watchedLastname,
    watchedBirthDate,
    watchedGenre,
    watchedBirthPlace,
    setValue,
  ]);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        customer_id: values.customer_id,
        employee_number: values.employee_number || undefined,
        name: values.name,
        surname: values.surname,
        lastname: values.lastname || undefined,
        rfc: values.rfc || undefined,
        curp: values.curp || undefined,
        resident: values.resident ?? false,
        genre: values.genre,
        birth_date: values.birth_date || null,
        birth_place: values.birth_place || undefined,
        city_of_birth: values.city_of_birth || undefined,
        nss: values.nss || undefined,
        status: values.status,
        hire_date: values.hire_date || null,
        contract_type: values.contract_type,
        sat_zip_code: values.sat_zip_code || undefined,
        email: values.email || undefined,
        marital_status: values.marital_status,
        work_location: {
          plant_id: values.work_location_plant_id || undefined,
          position_id: values.work_location_position_id || undefined,
          shift_id: values.work_location_shift_id || undefined,
          schedule_id: values.work_location_schedule_id || undefined,
          direct_supervisor_id:
            values.work_location_direct_supervisor_id || undefined,
          area_id: values.work_location_area_id || undefined,
        },
        salary: {
          salary_type: values.salary_salary_type || undefined,
          daily_salary: values.salary_daily_salary
            ? parseFloat(values.salary_daily_salary)
            : null,
          attendance_bonus: values.salary_attendance_bonus
            ? parseFloat(values.salary_attendance_bonus)
            : null,
          zone: values.salary_zone || undefined,
          payment_way: values.salary_payment_way || undefined,
          last_salary_modification:
            values.salary_last_salary_modification || null,
          integrated_factor: values.salary_integrated_factor
            ? parseFloat(values.salary_integrated_factor)
            : null,
          day_per_month: values.salary_day_per_month
            ? parseFloat(values.salary_day_per_month)
            : null,
          variable_salary: values.salary_variable_salary
            ? parseFloat(values.salary_variable_salary)
            : null,
        },
        bank: {
          bank_id: values.bank_bank_id || undefined,
          account_number: values.bank_account_number || undefined,
          card_number: values.bank_card_number || undefined,
          clabe: values.bank_clabe || undefined,
        },
        address: {
          street: values.address_street || undefined,
          exterior_number: values.address_exterior_number || undefined,
          internal_number: values.address_internal_number || undefined,
          colony: values.address_colony || undefined,
          city: values.address_city || undefined,
          state: values.address_state || undefined,
          zipcode: values.address_zipcode || undefined,
          country: values.address_country || undefined,
        },
        personal_data: {
          house_owner: values.personal_data_house_owner ?? false,
          schooling: values.personal_data_schooling || undefined,
          landline_phone_number:
            values.personal_data_landline_phone_number || undefined,
          mobile_phone_number:
            values.personal_data_mobile_phone_number || undefined,
          emergency_phone_number:
            values.personal_data_emergency_phone_number || undefined,
          relationship: values.personal_data_relationship || undefined,
        },
      };

      // Clean undefined values from nested objects
      const payloadAny = payload as Record<string, unknown>;
      for (const key of [
        "work_location",
        "salary",
        "bank",
        "address",
        "personal_data",
      ]) {
        const obj = payloadAny[key] as Record<string, unknown>;
        for (const k of Object.keys(obj)) {
          if (obj[k] === undefined) delete obj[k];
        }
        if (Object.keys(obj).length === 0) delete payloadAny[key];
      }

      if (isEditMode) {
        await employeeService.update(id!, payload);
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
  };

  return {
    // State
    activeTab,
    setActiveTab,
    isSubmitting,
    isLoadingRecord,
    serverError,
    isEditMode,

    // Form
    form,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    reset,

    // Catalog data
    positions,
    shifts,
    schedules,
    areas,
    banks,
    states,
    municipalities,
    colonies,

    // Area dependencies display
    customerDisplayName,
    plantDisplayCode,
    plantDisplayName,

    // Supervisor
    supervisor,
    setSupervisor,

    // Actions
    onSubmit,
    navigate,
  };
}
