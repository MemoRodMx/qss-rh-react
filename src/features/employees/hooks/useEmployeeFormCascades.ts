import { useState, useEffect } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { employeeService } from "../services/employeeService";
import type { EmployeeFormValues, CatalogOption, SupervisorOption } from "../types";

interface UseEmployeeFormCascadesOptions {
  watch: UseFormWatch<EmployeeFormValues>;
  setValue: UseFormSetValue<EmployeeFormValues>;
  shifts: Array<{ code: string; name: string }>;
  isInitialLoad: boolean;
}

export function useEmployeeFormCascades({
  watch,
  setValue,
  shifts,
  isInitialLoad,
}: UseEmployeeFormCascadesOptions) {
  const [schedules, setSchedules] = useState<
    Array<{ code: string; label: string }>
  >([]);
  const [municipalities, setMunicipalities] = useState<CatalogOption[]>([]);
  const [birthMunicipalities, setBirthMunicipalities] = useState<CatalogOption[]>([]);
  const [colonies, setColonies] = useState<CatalogOption[]>([]);

  const [customerDisplayName, setCustomerDisplayName] = useState("");
  const [plantDisplayCode, setPlantDisplayCode] = useState("");
  const [plantDisplayName, setPlantDisplayName] = useState("");
  const [supervisor, setSupervisor] = useState<SupervisorOption | null>(null);

  const watchedAreaId = watch("work_location_area_id");
  const watchedShiftId = watch("work_location_shift_id");
  const watchedState = watch("address_state");
  const watchedZipcode = watch("address_zipcode");
  const watchedBirthPlace = watch("birth_place");

  // Cascade: area → customer + plant
  useEffect(() => {
    if (!watchedAreaId) {
      if (!isInitialLoad) {
        setValue("customer_id", "");
        setValue("work_location_plant_id", "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAreaId, setValue]);

  // Cascade: shift → schedules
  useEffect(() => {
    if (!watchedShiftId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Cascade: state → municipalities
  useEffect(() => {
    if (!watchedState) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMunicipalities([]);
      return;
    }
    employeeService
      .listMunicipalities(watchedState)
      .then(setMunicipalities)
      .catch(() => {});
  }, [watchedState]);

  // Cascade: birth_place → birthMunicipalities
  useEffect(() => {
    if (!watchedBirthPlace) {
      if (!isInitialLoad) {
        setValue("city_of_birth", "");
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBirthMunicipalities([]);
      return;
    }
    let cancelled = false;
    employeeService
      .listMunicipalities(watchedBirthPlace)
      .then((data) => {
        if (!cancelled) setBirthMunicipalities(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedBirthPlace, setValue]);

  // Cascade: zipcode → colonies
  useEffect(() => {
    if (!watchedZipcode || watchedZipcode.length < 5) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColonies([]);
      return;
    }
    let cancelled = false;
    employeeService
      .listColonies(watchedZipcode)
      .then((data) => {
        if (!cancelled) setColonies(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [watchedZipcode]);

  return {
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
  };
}
