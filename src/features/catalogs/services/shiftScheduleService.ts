import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { ShiftSchedule, CustomerOption } from "../types";

export const shiftScheduleService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<ShiftSchedule>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<ShiftSchedule>>(
      "/shifts-and-schedules",
      { params },
    );
    return data;
  },

  async getById(id: string): Promise<ShiftSchedule> {
    const { data } = await api.get<ShiftSchedule>(
      `/shifts-and-schedules/${id}`,
    );
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/shifts-and-schedules", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/shifts-and-schedules/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/shifts-and-schedules/${id}`);
  },

  async listCustomers(): Promise<CustomerOption[]> {
    const { data } = await api.get<CustomerOption[]>("/customers/list");
    return data;
  },
};
