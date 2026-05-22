import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { employeeService } from "../services/employeeService";
import { generateCurpBase, generateRfcBase } from "../hooks/useCurpRfc";
import type { SelectOption, SupervisorOption } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  DollarSign,
  Building2,
  MapPin,
  Phone,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";

const employeeFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  surname: z.string().min(1, "El primer apellido es obligatorio"),
  lastname: z.string().optional().default(""),
  rfc: z.string().optional().default(""),
  curp: z.string().optional().default(""),
  nss: z.string().optional().default(""),
  genre: z.string().min(1, "El género es obligatorio"),
  birth_date: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  birth_place: z.string().optional().default(""),
  resident: z.boolean().optional().default(true),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  hire_date: z.string().min(1, "La fecha de alta es obligatoria"),
  contract_type: z.string().optional().default(""),
  sat_zip_code: z.string().optional().default(""),
  marital_status: z.string().optional().default(""),
  status: z.string().min(1, "El estado es obligatorio"),
  "work_location.customer_id": z.string().optional().default(""),
  "work_location.plant_id": z.string().optional().default(""),
  "work_location.area_code": z.string().optional().default(""),
  "work_location.position_code": z.string().optional().default(""),
  "work_location.shift_id": z.string().optional().default(""),
  "work_location.schedule_id": z.string().optional().default(""),
  "work_location.direct_supervisor_id": z.string().optional().default(""),
  "salary.salary_type": z.string().optional().default(""),
  "salary.zone": z.string().optional().default(""),
  "salary.payment_way": z.string().optional().default(""),
  "salary.daily_salary": z.number().optional().default(0),
  "salary.weekly_salary": z.number().optional().default(0),
  "salary.monthly_salary": z.number().optional().default(0),
  "salary.attendance_bonus": z.number().optional().default(0),
  "salary.variable_salary": z.number().optional().default(0),
  "salary.integrated_factor": z.number().optional().default(0),
  "salary.day_per_month": z.number().optional().default(0),
  "salary.last_salary_modification": z
    .string()
    .nullable()
    .optional()
    .default(null),
  "bank.bank_id": z.string().optional().default(""),
  "bank.account_number": z.string().optional().default(""),
  "bank.card_number": z.string().optional().default(""),
  "bank.clabe": z.string().optional().default(""),
  "address.street": z.string().optional().default(""),
  "address.exterior_number": z.string().optional().default(""),
  "address.internal_number": z.string().optional().default(""),
  "address.country": z.string().optional().default(""),
  "address.state": z.string().optional().default(""),
  "address.city": z.string().optional().default(""),
  "address.zipcode": z.string().optional().default(""),
  "address.colony": z.string().optional().default(""),
  "personal_data.mobile_phone_number": z.string().optional().default(""),
  "personal_data.landline_phone_number": z.string().optional().default(""),
  "personal_data.emergency_phone_number": z.string().optional().default(""),
  "personal_data.schooling": z.string().optional().default(""),
  "personal_data.relationship": z.string().optional().default(""),
  "personal_data.house_owner": z.boolean().optional().default(false),
});

type FormValues = z.infer<typeof employeeFormSchema>;
type TabId =
  | "identity"
  | "employment"
  | "salary"
  | "bank"
  | "address"
  | "personal";

interface TabConfig {
  id: TabId;
  label: string;
  icon: typeof User;
}

const TABS: TabConfig[] = [
  { id: "identity", label: "Identidad", icon: User },
  { id: "employment", label: "Laboral", icon: Briefcase },
  { id: "salary", label: "Salario", icon: DollarSign },
  { id: "bank", label: "Banco", icon: Building2 },
  { id: "address", label: "Domicilio", icon: MapPin },
  { id: "personal", label: "Datos personales", icon: Phone },
];

const GENRE_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];
const STATUS_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "DE BAJA", label: "De baja" },
];
const CONTRACT_TYPE_OPTIONS = [
  { value: "INDEFINIDO", label: "Indefinido" },
  { value: "TEMPORAL", label: "Temporal" },
  { value: "PRUEBA", label: "Prueba" },
  { value: "HONORARIOS", label: "Honorarios" },
];
const MARITAL_STATUS_OPTIONS = [
  { value: "SOLTERO", label: "Soltero" },
  { value: "CASADO", label: "Casado" },
  { value: "DIVORCIADO", label: "Divorciado" },
  { value: "VIUDO", label: "Viudo" },
  { value: "UNION_LIBRE", label: "Unión libre" },
];
const SCHOOLING_OPTIONS = [
  { value: "PRIMARIA", label: "Primaria" },
  { value: "SECUNDARIA", label: "Secundaria" },
  { value: "PREPARATORIA", label: "Preparatoria" },
  { value: "TECNICO", label: "Técnico" },
  { value: "LICENCIATURA", label: "Licenciatura" },
  { value: "MAESTRIA", label: "Maestría" },
  { value: "DOCTORADO", label: "Doctorado" },
];
const SALARY_TYPE_OPTIONS = [
  { value: "FIJO", label: "Fijo" },
  { value: "VARIABLE", label: "Variable" },
  { value: "MIXTO", label: "Mixto" },
];
const ZONE_OPTIONS = [
  { value: "A", label: "Zona A" },
  { value: "B", label: "Zona B" },
  { value: "C", label: "Zona C" },
];
const PAYMENT_WAY_OPTIONS = [
  { value: "SEMANAL", label: "Semanal" },
  { value: "QUINCENAL", label: "Quincenal" },
  { value: "MENSUAL", label: "Mensual" },
];

function getNestedError(
  errors: Record<string, unknown>,
  path: string,
): { message?: string } | undefined {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else return undefined;
  }
  return current as { message?: string } | undefined;
}

function countTabErrors(tabId: TabId, errors: Record<string, unknown>): number {
  let count = 0;
  if (tabId === "identity") {
    for (const f of ["name", "surname", "genre", "birth_date"]) {
      if (getNestedError(errors, f)) count++;
    }
  }
  if (tabId === "employment") {
    for (const f of ["email", "hire_date", "status"]) {
      if (getNestedError(errors, f)) count++;
    }
  }
  return count;
}

/**
 * Strips empty strings from the payload recursively so that
 * optional fields are sent as absent (undefined) rather than "",
 * ensuring the API's @IsOptional() decorators skip validation for them.
 * Matches the Dashboard's cleanPayload logic.
 */
function cleanPayload(values: FormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  // Top-level fields
  payload.name = values.name;
  payload.surname = values.surname;
  if (values.lastname) payload.lastname = values.lastname;
  if (values.rfc) payload.rfc = values.rfc.toUpperCase();
  if (values.curp) payload.curp = values.curp.toUpperCase();
  if (values.nss) payload.nss = values.nss;
  payload.genre = values.genre;
  payload.birth_date = values.birth_date;
  if (values.birth_place) payload.birth_place = values.birth_place;
  payload.resident = values.resident;
  if (values.email) payload.email = values.email;
  payload.hire_date = values.hire_date;
  if (values.contract_type) payload.contract_type = values.contract_type;
  if (values.sat_zip_code) payload.sat_zip_code = values.sat_zip_code;
  if (values.marital_status) payload.marital_status = values.marital_status;
  payload.status = values.status;

  // customer_id at top level (Dashboard sends it at top level)
  if (values["work_location.customer_id"])
    payload.customer_id = values["work_location.customer_id"];

  // work_location nested object
  const wl: Record<string, string> = {};
  if (values["work_location.plant_id"])
    wl.plant_id = values["work_location.plant_id"];
  if (values["work_location.area_code"])
    wl.area_code = values["work_location.area_code"];
  if (values["work_location.position_code"])
    wl.position_code = values["work_location.position_code"];
  if (values["work_location.shift_id"])
    wl.shift_id = values["work_location.shift_id"];
  if (values["work_location.schedule_id"])
    wl.schedule_id = values["work_location.schedule_id"];
  if (values["work_location.direct_supervisor_id"])
    wl.direct_supervisor_id = values["work_location.direct_supervisor_id"];
  if (Object.keys(wl).length > 0) payload.work_location = wl;

  // salary nested object
  const sal: Record<string, unknown> = {};
  if (values["salary.salary_type"])
    sal.salary_type = values["salary.salary_type"];
  if (values["salary.zone"]) sal.zone = values["salary.zone"];
  if (values["salary.payment_way"])
    sal.payment_way = values["salary.payment_way"];
  if (values["salary.daily_salary"])
    sal.daily_salary = values["salary.daily_salary"];
  if (values["salary.weekly_salary"])
    sal.weekly_salary = values["salary.weekly_salary"];
  if (values["salary.monthly_salary"])
    sal.monthly_salary = values["salary.monthly_salary"];
  if (values["salary.attendance_bonus"])
    sal.attendance_bonus = values["salary.attendance_bonus"];
  if (values["salary.variable_salary"])
    sal.variable_salary = values["salary.variable_salary"];
  if (values["salary.integrated_factor"])
    sal.integrated_factor = values["salary.integrated_factor"];
  if (values["salary.day_per_month"])
    sal.day_per_month = values["salary.day_per_month"];
  if (values["salary.last_salary_modification"])
    sal.last_salary_modification = values["salary.last_salary_modification"];
  if (Object.keys(sal).length > 0) payload.salary = sal;

  // bank nested object
  const bank: Record<string, string> = {};
  if (values["bank.bank_id"]) bank.bank_id = values["bank.bank_id"];
  if (values["bank.account_number"])
    bank.account_number = values["bank.account_number"];
  if (values["bank.card_number"]) bank.card_number = values["bank.card_number"];
  if (values["bank.clabe"]) bank.clabe = values["bank.clabe"];
  if (Object.keys(bank).length > 0) payload.bank = bank;

  // address nested object
  const addr: Record<string, string> = {};
  if (values["address.street"]) addr.street = values["address.street"];
  if (values["address.exterior_number"])
    addr.exterior_number = values["address.exterior_number"];
  if (values["address.internal_number"])
    addr.internal_number = values["address.internal_number"];
  if (values["address.country"]) addr.country = values["address.country"];
  if (values["address.state"]) addr.state = values["address.state"];
  if (values["address.city"]) addr.city = values["address.city"];
  if (values["address.zipcode"]) addr.zipcode = values["address.zipcode"];
  if (values["address.colony"]) addr.colony = values["address.colony"];
  if (Object.keys(addr).length > 0) payload.address = addr;

  // personal_data nested object
  const pd: Record<string, unknown> = {};
  if (values["personal_data.mobile_phone_number"])
    pd.mobile_phone_number = values["personal_data.mobile_phone_number"];
  if (values["personal_data.landline_phone_number"])
    pd.landline_phone_number = values["personal_data.landline_phone_number"];
  if (values["personal_data.emergency_phone_number"])
    pd.emergency_phone_number = values["personal_data.emergency_phone_number"];
  if (values["personal_data.schooling"])
    pd.schooling = values["personal_data.schooling"];
  if (values["personal_data.relationship"])
    pd.relationship = values["personal_data.relationship"];
  pd.house_owner = values["personal_data.house_owner"];
  if (Object.keys(pd).length > 0) payload.personal_data = pd;

  return payload;
}

export function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState<TabId>("identity");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [customers, setCustomers] = useState<SelectOption[]>([]);
  const [plants, setPlants] = useState<SelectOption[]>([]);
  const [areas, setAreas] = useState<SelectOption[]>([]);
  const [positions, setPositions] = useState<SelectOption[]>([]);
  const [shifts, setShifts] = useState<SelectOption[]>([]);
  const [schedules, setSchedules] = useState<SelectOption[]>([]);
  const [states, setStates] = useState<SelectOption[]>([]);
  const [municipalities, setMunicipalities] = useState<SelectOption[]>([]);
  const [colonies, setColonies] = useState<SelectOption[]>([]);
  const [banks, setBanks] = useState<SelectOption[]>([]);
  const [nextEmployeeNumber, setNextEmployeeNumber] = useState("");

  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [supervisorSuggestions, setSupervisorSuggestions] = useState<
    SupervisorOption[]
  >([]);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<SupervisorOption | null>(null);
  const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
  const supervisorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const supervisorInputRef = useRef<HTMLInputElement>(null);

  // Tracks whether the form has been fully initialized (edit mode data loaded).
  // Prevents CURP/RFC auto-generation from overwriting saved values on initial load.
  const isInitializedRef = useRef(!isEditMode);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      surname: "",
      lastname: "",
      rfc: "",
      curp: "",
      nss: "",
      genre: "",
      birth_date: "",
      birth_place: "",
      resident: true,
      email: "",
      hire_date: "",
      contract_type: "",
      sat_zip_code: "",
      marital_status: "",
      status: "ACTIVO",
      "work_location.customer_id": "",
      "work_location.plant_id": "",
      "work_location.area_code": "",
      "work_location.position_code": "",
      "work_location.shift_id": "",
      "work_location.schedule_id": "",
      "work_location.direct_supervisor_id": "",
      "salary.salary_type": "",
      "salary.zone": "",
      "salary.payment_way": "",
      "salary.daily_salary": 0,
      "salary.weekly_salary": 0,
      "salary.monthly_salary": 0,
      "salary.attendance_bonus": 0,
      "salary.variable_salary": 0,
      "salary.integrated_factor": 0,
      "salary.day_per_month": 0,
      "salary.last_salary_modification": null,
      "bank.bank_id": "",
      "bank.account_number": "",
      "bank.card_number": "",
      "bank.clabe": "",
      "address.street": "",
      "address.exterior_number": "",
      "address.internal_number": "",
      "address.country": "",
      "address.state": "",
      "address.city": "",
      "address.zipcode": "",
      "address.colony": "",
      "personal_data.mobile_phone_number": "",
      "personal_data.landline_phone_number": "",
      "personal_data.emergency_phone_number": "",
      "personal_data.schooling": "",
      "personal_data.relationship": "",
      "personal_data.house_owner": false,
    },
  });

  const watchedCustomerId = watch("work_location.customer_id") as string;
  const watchedShiftId = watch("work_location.shift_id") as string;
  const watchedState = watch("address.state") as string;
  const watchedZipcode = watch("address.zipcode") as string;
  const watchedName = watch("name") as string;
  const watchedSurname = watch("surname") as string;
  const watchedLastname = watch("lastname") as string;
  const watchedBirthDate = watch("birth_date") as string;
  const watchedGenre = watch("genre") as string;
  const watchedBirthPlace = watch("birth_place") as string;
  const watchedDailySalary = watch("salary.daily_salary") as number;
  const watchedDayPerMonth = watch("salary.day_per_month") as number;
  const watchedPlantId = watch("work_location.plant_id") as string;
  const watchedShiftCode = watch("work_location.shift_id") as string;

  // Auto-generate CURP — only after initialization (skip on edit mode initial load)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const curp = generateCurpBase(
      watchedName,
      watchedSurname,
      watchedLastname,
      watchedBirthDate,
      watchedGenre,
      watchedBirthPlace,
    );
    if (curp) setValue("curp", curp, { shouldValidate: false });
  }, [
    watchedName,
    watchedSurname,
    watchedLastname,
    watchedBirthDate,
    watchedGenre,
    watchedBirthPlace,
    setValue,
  ]);

  // Auto-generate RFC — only after initialization (skip on edit mode initial load)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const rfc = generateRfcBase(
      watchedName,
      watchedSurname,
      watchedLastname,
      watchedBirthDate,
    );
    if (rfc) setValue("rfc", rfc, { shouldValidate: false });
  }, [
    watchedName,
    watchedSurname,
    watchedLastname,
    watchedBirthDate,
    setValue,
  ]);

  // Auto-calculate salary — only after initialization (skip on edit mode initial load)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (watchedDailySalary > 0) {
      const weekly = watchedDailySalary * 7;
      const monthly = watchedDailySalary * (watchedDayPerMonth || 30);
      setValue(
        "salary.weekly_salary" as keyof FormValues,
        (Math.round(weekly * 100) / 100) as never,
        { shouldValidate: false },
      );
      setValue(
        "salary.monthly_salary" as keyof FormValues,
        (Math.round(monthly * 100) / 100) as never,
        { shouldValidate: false },
      );
    }
  }, [watchedDailySalary, watchedDayPerMonth, setValue]);

  // Load auxiliary data
  const loadAuxData = useCallback(async () => {
    try {
      const [
        customersData,
        areasData,
        positionsData,
        shiftsData,
        statesData,
        banksData,
      ] = await Promise.all([
        employeeService.listCustomers(),
        employeeService.listAreas(),
        employeeService.listPositions(),
        employeeService.listShifts(),
        employeeService.listStates(),
        employeeService.listBanks(),
      ]);
      setCustomers(customersData);
      setAreas(areasData);
      setPositions(positionsData);
      setShifts(shiftsData);
      setStates(statesData);
      setBanks(banksData);
    } catch {
      setServerError("Error al cargar datos auxiliares");
    }
  }, []);

  // Load record for edit mode
  useEffect(() => {
    if (!isEditMode) {
      loadAuxData();
      // Get next employee number for create mode
      employeeService
        .getNextEmployeeNumber()
        .then(setNextEmployeeNumber)
        .catch(() => {});
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        await loadAuxData();
        const employee = await employeeService.getById(id!);
        if (cancelled) return;
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
          : null;

        const wl = employee.work_location ?? {};

        reset({
          name: employee.name ?? "",
          surname: employee.surname ?? "",
          lastname: employee.lastname ?? "",
          rfc: employee.rfc ?? "",
          curp: employee.curp ?? "",
          nss: employee.nss ?? "",
          genre: employee.genre ?? "",
          birth_date: birthDate,
          birth_place: employee.birth_place ?? "",
          resident: employee.resident ?? true,
          email: employee.email ?? "",
          hire_date: hireDate,
          contract_type: employee.contract_type ?? "",
          sat_zip_code: employee.sat_zip_code ?? "",
          marital_status: employee.marital_status ?? "",
          status: employee.status ?? "ACTIVO",
          "work_location.customer_id":
            employee.customer_id ?? wl.customer_id ?? "",
          "work_location.plant_id": wl.plant_id ?? "",
          "work_location.area_code": wl.area_code ?? "",
          "work_location.position_code": wl.position_code ?? "",
          "work_location.shift_id": wl.shift_id ?? "",
          "work_location.schedule_id": wl.schedule_id ?? "",
          "work_location.direct_supervisor_id": wl.direct_supervisor_id ?? "",
          "salary.salary_type": employee.salary?.salary_type ?? "",
          "salary.zone": employee.salary?.zone ?? "",
          "salary.payment_way": employee.salary?.payment_way ?? "",
          "salary.daily_salary": employee.salary?.daily_salary ?? 0,
          "salary.weekly_salary": employee.salary?.weekly_salary ?? 0,
          "salary.monthly_salary": employee.salary?.monthly_salary ?? 0,
          "salary.attendance_bonus": employee.salary?.attendance_bonus ?? 0,
          "salary.variable_salary": employee.salary?.variable_salary ?? 0,
          "salary.integrated_factor": employee.salary?.integrated_factor ?? 0,
          "salary.day_per_month": employee.salary?.day_per_month ?? 0,
          "salary.last_salary_modification": lastSalaryMod,
          "bank.bank_id": employee.bank?.bank_id ?? "",
          "bank.account_number": employee.bank?.account_number ?? "",
          "bank.card_number": employee.bank?.card_number ?? "",
          "bank.clabe": employee.bank?.clabe ?? "",
          "address.street": employee.address?.street ?? "",
          "address.exterior_number": employee.address?.exterior_number ?? "",
          "address.internal_number": employee.address?.internal_number ?? "",
          "address.country": employee.address?.country ?? "",
          "address.state": employee.address?.state ?? "",
          "address.city": employee.address?.city ?? "",
          "address.zipcode": employee.address?.zipcode ?? "",
          "address.colony": employee.address?.colony ?? "",
          "personal_data.mobile_phone_number":
            employee.personal_data?.mobile_phone_number ?? "",
          "personal_data.landline_phone_number":
            employee.personal_data?.landline_phone_number ?? "",
          "personal_data.emergency_phone_number":
            employee.personal_data?.emergency_phone_number ?? "",
          "personal_data.schooling": employee.personal_data?.schooling ?? "",
          "personal_data.relationship":
            employee.personal_data?.relationship ?? "",
          "personal_data.house_owner":
            employee.personal_data?.house_owner ?? false,
        });

        // Load supervisor
        if (wl.direct_supervisor_id) {
          const supervisor = await employeeService.getSupervisorById(
            wl.direct_supervisor_id,
          );
          if (supervisor && !cancelled) setSelectedSupervisor(supervisor);
        }

        // Load plants for the customer
        if (employee.customer_id || wl.customer_id) {
          const plantsData = await employeeService.listPlants(
            employee.customer_id || wl.customer_id,
          );
          if (!cancelled) setPlants(plantsData);
        }

        // Load schedules for the shift — use the shift name from the loaded shifts
        if (wl.shift_id) {
          // We need to find the shift name from the shifts state.
          // Since shifts may not be updated yet in this render cycle,
          // we fetch the schedules using the shift code directly.
          // The API accepts shift code as the parameter.
          const schedulesData = await employeeService.listSchedules(
            wl.shift_id,
          );
          if (!cancelled) setSchedules(schedulesData);
        }

        // Load municipalities
        if (employee.address?.state) {
          const municipalitiesData = await employeeService.listMunicipalities(
            employee.address.state,
          );
          if (!cancelled) setMunicipalities(municipalitiesData);
        }

        // Load colonies
        if (employee.address?.zipcode) {
          const coloniesData = await employeeService.listColonies(
            employee.address.zipcode,
          );
          if (!cancelled) setColonies(coloniesData);
        }
      } catch {
        setServerError("Error al cargar los datos del empleado");
      } finally {
        if (!cancelled) {
          setIsLoadingRecord(false);
          isInitializedRef.current = true;
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode, loadAuxData, reset]);

  // Cascading: customer -> plants
  useEffect(() => {
    if (!watchedCustomerId) {
      setPlants([]);
      return;
    }
    employeeService
      .listPlants(watchedCustomerId)
      .then(setPlants)
      .catch(() => {});
  }, [watchedCustomerId]);

  // Cascading: shift -> schedules
  useEffect(() => {
    if (!watchedShiftId) {
      setSchedules([]);
      return;
    }
    const shift = shifts.find((s) => s.code === watchedShiftId);
    if (shift?.name) {
      employeeService
        .listSchedules(shift.name)
        .then(setSchedules)
        .catch(() => {});
    }
  }, [watchedShiftId, shifts]);

  // Cascading: state -> municipalities
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

  // Cascading: zipcode -> colonies
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

  // Supervisor search with plant/shift context
  useEffect(() => {
    if (supervisorDebounceRef.current)
      clearTimeout(supervisorDebounceRef.current);
    supervisorDebounceRef.current = setTimeout(() => {
      if (supervisorSearch.length === 1) {
        setSupervisorSuggestions([]);
        return;
      }
      if (supervisorSearch.length === 0 && !watchedPlantId) {
        setSupervisorSuggestions([]);
        return;
      }
      employeeService
        .listSupervisors(supervisorSearch, watchedPlantId, watchedShiftCode)
        .then(setSupervisorSuggestions)
        .catch(() => {});
    }, 300);
    return () => {
      if (supervisorDebounceRef.current)
        clearTimeout(supervisorDebounceRef.current);
    };
  }, [supervisorSearch, watchedPlantId, watchedShiftCode]);

  // Submit
  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const payload = cleanPayload(values);
      if (isEditMode) await employeeService.update(id!, payload);
      else await employeeService.create(payload);
      navigate("/employees");
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            errors?: Array<{
              field: string;
              message: string;
            }>;
          };
        };
      };
      const responseData = err?.response?.data;

      // Handle per-field validation errors from API
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const fieldErrMap: Record<string, string> = {};
        for (const e of responseData.errors) {
          fieldErrMap[e.field] = e.message;
          // Also set react-hook-form error for the field
          setError(e.field as keyof FormValues, {
            message: e.message,
          });
        }
        setFieldErrors(fieldErrMap);
      }

      setServerError(
        responseData?.message || "Ocurrió un error al guardar el empleado",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render helpers
  const renderFieldError = (fieldName: string) => {
    const formError = getNestedError(
      errors as unknown as Record<string, unknown>,
      fieldName,
    );
    const serverFieldErr = fieldErrors[fieldName];
    const message = formError?.message || serverFieldErr;
    if (!message) return null;
    return <p className="mt-1 text-xs text-destructive">{message}</p>;
  };

  /**
   * Returns the label for a given value from a static options list.
   */
  const getOptionLabel = (
    value: string,
    options: { value: string; label: string }[],
  ): string => {
    return options.find((o) => o.value === value)?.label ?? value;
  };

  /**
   * Returns the display label for a given value from API options.
   */
  const getApiOptionLabel = (
    value: string,
    options: SelectOption[],
  ): string => {
    const opt = options.find((o) => o._id === value || o.code === value);
    if (!opt) return value;
    return opt.legal_name || opt.name || value;
  };

  const renderSelect = (
    label: string,
    fieldName: string,
    options: { value: string; label: string }[],
    placeholder = "Seleccionar",
  ) => {
    const value = watch(fieldName as keyof FormValues) as string;
    const hasError = !!(
      getNestedError(errors as unknown as Record<string, unknown>, fieldName) ||
      fieldErrors[fieldName]
    );
    return (
      <div>
        <Label htmlFor={fieldName}>{label}</Label>
        <Select
          value={value || null}
          onValueChange={(val: string | null) =>
            setValue(fieldName as keyof FormValues, (val ?? "") as never, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger
            id={fieldName}
            className={hasError ? "border-destructive" : ""}
          >
            <SelectValue placeholder={placeholder}>
              {value ? getOptionLabel(value, options) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {renderFieldError(fieldName)}
      </div>
    );
  };

  /**
   * Renders a select from API data.
   * Handles different response formats:
   * - Customers: { _id, legal_name } -> value: _id, label: legal_name
   * - Banks: { _id, name } -> value: _id, label: name
   * - Catalog items (plants, areas, positions, shifts, schedules, states, municipalities, colonies): { code, name } -> value: code, label: name
   */
  const renderApiSelect = (
    label: string,
    fieldName: string,
    options: SelectOption[],
    placeholder = "Seleccionar",
    disabled = false,
  ) => {
    const value = watch(fieldName as keyof FormValues) as string;
    const hasError = !!(
      getNestedError(errors as unknown as Record<string, unknown>, fieldName) ||
      fieldErrors[fieldName]
    );
    return (
      <div>
        <Label htmlFor={fieldName}>{label}</Label>
        <Select
          value={value || null}
          onValueChange={(val: string | null) =>
            setValue(fieldName as keyof FormValues, (val ?? "") as never, {
              shouldValidate: true,
            })
          }
          disabled={disabled}
        >
          <SelectTrigger
            id={fieldName}
            className={hasError ? "border-destructive" : ""}
          >
            <SelectValue placeholder={placeholder}>
              {value ? getApiOptionLabel(value, options) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => {
              // Customers have _id + legal_name
              if (opt.legal_name) {
                return (
                  <SelectItem key={opt._id!} value={opt._id!}>
                    {opt.legal_name}
                  </SelectItem>
                );
              }
              // Banks have _id + name
              if (opt._id && !opt.code) {
                return (
                  <SelectItem key={opt._id} value={opt._id}>
                    {opt.name ?? ""}
                  </SelectItem>
                );
              }
              // Catalog items have code + name
              return (
                <SelectItem key={opt.code!} value={opt.code!}>
                  {opt.name ?? ""}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {renderFieldError(fieldName)}
      </div>
    );
  };

  const renderInput = (
    label: string,
    fieldName: keyof FormValues,
    type = "text",
    placeholder = "",
    disabled = false,
  ) => {
    const hasError = !!(
      getNestedError(errors as unknown as Record<string, unknown>, fieldName) ||
      fieldErrors[fieldName]
    );
    return (
      <div>
        <Label htmlFor={fieldName}>{label}</Label>
        <Input
          id={fieldName}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={hasError ? "border-destructive" : ""}
          {...register(fieldName, { valueAsNumber: type === "number" })}
        />
        {renderFieldError(fieldName)}
      </div>
    );
  };

  const renderCheckbox = (label: string, fieldName: keyof FormValues) => {
    const value = watch(fieldName) as boolean;
    return (
      <div className="flex items-center gap-2 pt-6">
        <input
          type="checkbox"
          id={fieldName}
          checked={value}
          onChange={(e) =>
            setValue(fieldName, e.target.checked as never, {
              shouldValidate: true,
            })
          }
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
        />
        <Label
          htmlFor={fieldName}
          className="cursor-pointer text-sm font-normal"
        >
          {label}
        </Label>
      </div>
    );
  };

  // Loading skeleton
  if (isLoadingRecord) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-[1080px] animate-fade-in"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {isEditMode ? "Editar empleado" : "Nuevo empleado"}
            </h1>
            {nextEmployeeNumber && !isEditMode && (
              <p className="text-xs text-muted-foreground">
                Número de empleado: <strong>{nextEmployeeNumber}</strong>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant="teal"
            size="sm"
            className="cursor-pointer gap-1.5"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border/40 pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const tabErrCount = countTabErrors(
            tab.id,
            errors as unknown as Record<string, unknown>,
          );
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                transition-colors cursor-pointer rounded-t-lg border-b-2 -mb-px
                ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tabErrCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-4 min-w-4 px-1 text-[10px]"
                >
                  {tabErrCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Identity */}
      {activeTab === "identity" && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-primary" />
              Datos de identidad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("Nombre(s)", "name", "text", "Nombre(s)")}
              {renderInput(
                "Primer apellido",
                "surname",
                "text",
                "Primer apellido",
              )}
              {renderInput(
                "Segundo apellido",
                "lastname",
                "text",
                "Segundo apellido",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("RFC", "rfc", "text", "RFC")}
              {renderInput("CURP", "curp", "text", "CURP")}
              {renderInput("NSS", "nss", "text", "NSS")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSelect("Género", "genre", GENRE_OPTIONS)}
              {renderInput("Fecha de nacimiento", "birth_date", "date")}
              {renderApiSelect(
                "Lugar de nacimiento",
                "birth_place",
                states,
                "Seleccionar estado",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSelect(
                "Estado civil",
                "marital_status",
                MARITAL_STATUS_OPTIONS,
                "Seleccionar",
              )}
              {renderInput(
                "Código postal SAT",
                "sat_zip_code",
                "text",
                "Código postal SAT",
              )}
              {renderCheckbox("Residente", "resident")}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Employment */}
      {activeTab === "employment" && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-primary" />
              Datos laborales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput(
                "Correo electrónico",
                "email",
                "email",
                "correo@ejemplo.com",
              )}
              {renderInput("Fecha de alta", "hire_date", "date")}
              {renderSelect(
                "Tipo de contrato",
                "contract_type",
                CONTRACT_TYPE_OPTIONS,
                "Seleccionar",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSelect("Estatus", "status", STATUS_OPTIONS)}
            </div>
            <div className="border-t border-border/40 pt-4">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Ubicación laboral
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderApiSelect(
                  "Cliente",
                  "work_location.customer_id",
                  customers,
                  "Seleccionar cliente",
                )}
                {renderApiSelect(
                  "Planta",
                  "work_location.plant_id",
                  plants,
                  "Seleccionar planta",
                  !watchedCustomerId,
                )}
                {renderApiSelect(
                  "Área",
                  "work_location.area_code",
                  areas,
                  "Seleccionar área",
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {renderApiSelect(
                  "Puesto",
                  "work_location.position_code",
                  positions,
                  "Seleccionar puesto",
                )}
                {renderApiSelect(
                  "Turno",
                  "work_location.shift_id",
                  shifts,
                  "Seleccionar turno",
                )}
                {renderApiSelect(
                  "Horario",
                  "work_location.schedule_id",
                  schedules,
                  "Seleccionar horario",
                  !watchedShiftId,
                )}
              </div>
              <div className="mt-4">
                <Label>Supervisor directo</Label>
                <div className="relative">
                  {selectedSupervisor ? (
                    <div className="flex items-center gap-2 rounded-lg border border-input bg-white dark:bg-card px-3 py-1.5 text-sm">
                      <span className="flex-1">{selectedSupervisor.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSupervisor(null);
                          setValue(
                            "work_location.direct_supervisor_id",
                            "" as never,
                          );
                          setSupervisorSearch("");
                        }}
                        className="cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        ref={supervisorInputRef}
                        placeholder="Buscar supervisor..."
                        className="pl-8"
                        value={supervisorSearch}
                        onChange={(e) => {
                          setSupervisorSearch(e.target.value);
                          setShowSupervisorDropdown(true);
                        }}
                        onFocus={() => setShowSupervisorDropdown(true)}
                      />
                      {showSupervisorDropdown &&
                        supervisorSuggestions.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border/40 bg-card shadow-[var(--shadow-4)] max-h-48 overflow-y-auto">
                            {supervisorSuggestions.map((s) => (
                              <button
                                key={s._id}
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors cursor-pointer"
                                onClick={() => {
                                  setSelectedSupervisor(s);
                                  setValue(
                                    "work_location.direct_supervisor_id",
                                    s._id as never,
                                  );
                                  setSupervisorSearch("");
                                  setShowSupervisorDropdown(false);
                                }}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
                {renderFieldError("work_location.direct_supervisor_id")}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Salary */}
      {activeTab === "salary" && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-primary" />
              Datos salariales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSelect(
                "Tipo de salario",
                "salary.salary_type",
                SALARY_TYPE_OPTIONS,
                "Seleccionar",
              )}
              {renderSelect("Zona", "salary.zone", ZONE_OPTIONS, "Seleccionar")}
              {renderSelect(
                "Forma de pago",
                "salary.payment_way",
                PAYMENT_WAY_OPTIONS,
                "Seleccionar",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput(
                "Salario diario",
                "salary.daily_salary",
                "number",
                "0.00",
              )}
              {renderInput(
                "Salario semanal",
                "salary.weekly_salary",
                "number",
                "0.00",
              )}
              {renderInput(
                "Salario mensual",
                "salary.monthly_salary",
                "number",
                "0.00",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput(
                "Bono de asistencia",
                "salary.attendance_bonus",
                "number",
                "0.00",
              )}
              {renderInput(
                "Salario variable",
                "salary.variable_salary",
                "number",
                "0.00",
              )}
              {renderInput(
                "Factor de integración",
                "salary.integrated_factor",
                "number",
                "0.0000",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput(
                "Días por mes",
                "salary.day_per_month",
                "number",
                "30",
              )}
              {renderInput(
                "Última modificación salarial",
                "salary.last_salary_modification",
                "date",
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Bank */}
      {activeTab === "bank" && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              Datos bancarios
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderApiSelect(
                "Banco",
                "bank.bank_id",
                banks,
                "Seleccionar banco",
              )}
              {renderInput(
                "Número de cuenta",
                "bank.account_number",
                "text",
                "Número de cuenta",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(
                "Número de tarjeta",
                "bank.card_number",
                "text",
                "Número de tarjeta",
              )}
              {renderInput("CLABE", "bank.clabe", "text", "CLABE")}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Address */}
      {activeTab === "address" && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Domicilio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("Calle", "address.street", "text", "Calle")}
              {renderInput(
                "Número exterior",
                "address.exterior_number",
                "text",
                "No. exterior",
              )}
              {renderInput(
                "Número interior",
                "address.internal_number",
                "text",
                "No. interior",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("País", "address.country", "text", "México")}
              {renderApiSelect(
                "Estado",
                "address.state",
                states,
                "Seleccionar estado",
              )}
              {renderApiSelect(
                "Municipio",
                "address.city",
                municipalities,
                "Seleccionar municipio",
                !watchedState,
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(
                "Código postal",
                "address.zipcode",
                "text",
                "Código postal",
              )}
              {renderApiSelect(
                "Colonia",
                "address.colony",
                colonies,
                "Seleccionar colonia",
                !watchedZipcode || watchedZipcode.length < 5,
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Personal */}
      {activeTab === "personal" && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4 text-primary" />
              Datos personales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput(
                "Teléfono móvil",
                "personal_data.mobile_phone_number",
                "tel",
                "Teléfono móvil",
              )}
              {renderInput(
                "Teléfono fijo",
                "personal_data.landline_phone_number",
                "tel",
                "Teléfono fijo",
              )}
              {renderInput(
                "Teléfono de emergencia",
                "personal_data.emergency_phone_number",
                "tel",
                "Emergencia",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSelect(
                "Escolaridad",
                "personal_data.schooling",
                SCHOOLING_OPTIONS,
                "Seleccionar",
              )}
              {renderInput(
                "Parentesco",
                "personal_data.relationship",
                "text",
                "Parentesco",
              )}
              {renderCheckbox("Casa propia", "personal_data.house_owner")}
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
