import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { Plant } from "../types";

export const plantsService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<Plant>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<Plant>>("/plants", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Plant> {
    const { data } = await api.get<Plant>(`/plants/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ _id: string }> {
    const { data } = await api.post<{ _id: string }>("/plants", payload);
    return data;
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await api.patch(`/plants/${id}`, payload);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/plants/${id}`);
  },

  async listCompanies(): Promise<{ _id: string; name: string }[]> {
    const { data } = await api.get("/companies/list");
    const raw = data?.data ?? data;
    return Array.isArray(raw) ? raw : [];
  },
};
