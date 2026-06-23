import { useEffect } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { EmployeeFormValues } from "../types";

interface UseEmployeeFormCalcsOptions {
  watch: UseFormWatch<EmployeeFormValues>;
  setValue: UseFormSetValue<EmployeeFormValues>;
}

export function useEmployeeFormCalcs({ watch, setValue }: UseEmployeeFormCalcsOptions) {
  const watchedHireDate = watch("hire_date");
  const watchedDailySalary = watch("salary_daily_salary");
  const watchedDayPerMonth = watch("salary_day_per_month");

  // Auto-calculate seniority (complete years)
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

  // Auto-calculate weekly/monthly salary
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
  }, [watchedDailySalary, watchedDayPerMonth, setValue]);
}
