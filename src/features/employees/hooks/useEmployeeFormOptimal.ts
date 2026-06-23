import { useEffect, useRef } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { customerService } from "@/features/customers/services/customerService";
import type { EmployeeFormValues } from "../types";

interface UseEmployeeFormOptimalOptions {
  watch: UseFormWatch<EmployeeFormValues>;
  setValue: UseFormSetValue<EmployeeFormValues>;
}

export function useEmployeeFormOptimal({
  watch,
  setValue,
}: UseEmployeeFormOptimalOptions) {
  const optimoSalaryRef = useRef<number | null>(null);
  const optimoBonusRef = useRef<number | null>(null);

  const watchedCustomerId = watch("customer_id");
  const watchedAreaId = watch("work_location_area_id");
  const watchedPositionId = watch("work_location_position_id");
  const watchedIsCustomized = watch("salary_is_customized");

  // Fetch optimal contracted salary
  useEffect(() => {
    if (!watchedCustomerId || !watchedAreaId || !watchedPositionId) return;
    if (watchedIsCustomized) return;

    customerService
      .getOptimalContracted(watchedCustomerId, watchedAreaId)
      .then((optimos) => {
        const match = optimos.find(
          (o) => o.position === watchedPositionId,
        );
        if (match) {
          optimoSalaryRef.current = match.salary;
          optimoBonusRef.current = match.bonus;
          setValue("salary_daily_salary", String(match.salary));
          setValue("salary_attendance_bonus", String(match.bonus));
          setValue("salary_is_customized", false);
        } else {
          optimoSalaryRef.current = null;
          optimoBonusRef.current = null;
        }
      })
      .catch(() => {});
  }, [
    watchedCustomerId,
    watchedAreaId,
    watchedPositionId,
    watchedIsCustomized,
    setValue,
  ]);

  // Detect customization (user changed salary/bonus manually)
  const watchedDailySalary = watch("salary_daily_salary");
  const watchedAttendanceBonus = watch("salary_attendance_bonus");

  useEffect(() => {
    if (watchedIsCustomized) return;

    if (optimoSalaryRef.current !== null && optimoBonusRef.current !== null) {
      const dailyDiffers =
        watchedDailySalary !== "" &&
        parseFloat(watchedDailySalary) !== optimoSalaryRef.current;
      const bonusDiffers =
        watchedAttendanceBonus !== "" &&
        parseFloat(watchedAttendanceBonus) !== optimoBonusRef.current;

      if (dailyDiffers || bonusDiffers) {
        setValue("salary_is_customized", true);
      }
    }
  }, [watchedDailySalary, watchedAttendanceBonus, watchedIsCustomized, setValue]);
}
