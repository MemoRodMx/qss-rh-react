import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { WorkdayType } from "../types";

export const workdayTypeService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<WorkdayType>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<WorkdayType>>(
      "/workday-types",
      { params },
    );
    return data;
  },

  async getById(id: string): Promise<WorkdayType> {
    const { data } = await api.get<WorkdayType>(`/workday-types/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/workday-types", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/workday-types/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/workday-types/${id}`);
  },
};
