import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { PayrollCalendar } from "../types";

export const payrollCalendarService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<PayrollCalendar>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<PayrollCalendar>>(
      "/payroll-calendars",
      { params },
    );
    return data;
  },

  async getById(id: string): Promise<PayrollCalendar> {
    const { data } = await api.get<PayrollCalendar>(`/payroll-calendars/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/payroll-calendars", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/payroll-calendars/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/payroll-calendars/${id}`);
  },
};
