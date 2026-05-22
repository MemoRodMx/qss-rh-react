import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { PublicHoliday } from "../types";

export const publicHolidayService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<PublicHoliday>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<PublicHoliday>>(
      "/public-holidays",
      { params },
    );
    return data;
  },

  async getById(id: string): Promise<PublicHoliday> {
    const { data } = await api.get<PublicHoliday>(`/public-holidays/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/public-holidays", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/public-holidays/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/public-holidays/${id}`);
  },
};
