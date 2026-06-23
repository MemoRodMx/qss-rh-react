import { useEffect, useRef, useCallback } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { generateCurp, generateRfc } from "../utils/useCurpRfc";
import { toast } from "sonner";
import type { EmployeeFormValues } from "../types";

interface UseEmployeeFormAutoGenOptions {
  watch: UseFormWatch<EmployeeFormValues>;
  setValue: UseFormSetValue<EmployeeFormValues>;
  isInitialLoad: boolean;
}

export function useEmployeeFormAutoGen({
  watch,
  setValue,
  isInitialLoad,
}: UseEmployeeFormAutoGenOptions) {
  const regenToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyRegen = useCallback(() => {
    if (regenToastTimerRef.current) return;
    regenToastTimerRef.current = setTimeout(() => {
      toast.warning("CURP / RFC regenerados", {
        description:
          "Se recalcularon CURP y/o RFC por cambios en los datos de identidad. Verifique que sean correctos.",
        duration: 6000,
      });
      regenToastTimerRef.current = null;
    }, 400);
  }, []);

  const watchedName = watch("name");
  const watchedSurname = watch("surname");
  const watchedLastname = watch("lastname");
  const watchedBirthDate = watch("birth_date");
  const watchedGenre = watch("genre");
  const watchedBirthPlace = watch("birth_place");
  const watchedCurp = watch("curp");
  const watchedRfc = watch("rfc");

  // Auto-generate CURP
  useEffect(() => {
    if (isInitialLoad) return;
    const curp = generateCurp(
      watchedName,
      watchedSurname,
      watchedLastname,
      watchedBirthDate || null,
      watchedGenre,
      watchedBirthPlace,
    );
    if (!curp || curp === watchedCurp) return;
    setValue("curp", curp);
    notifyRegen();
  }, [
    watchedName,
    watchedSurname,
    watchedLastname,
    watchedBirthDate,
    watchedGenre,
    watchedBirthPlace,
    watchedCurp,
    setValue,
    notifyRegen,
  ]);

  // Auto-generate RFC
  useEffect(() => {
    if (isInitialLoad) return;
    const rfc = generateRfc(
      watchedName,
      watchedSurname,
      watchedLastname,
      watchedBirthDate || null,
    );
    if (!rfc || rfc === watchedRfc) return;
    setValue("rfc", rfc);
    notifyRegen();
  }, [
    watchedName,
    watchedSurname,
    watchedLastname,
    watchedBirthDate,
    watchedRfc,
    setValue,
    notifyRegen,
  ]);
}
