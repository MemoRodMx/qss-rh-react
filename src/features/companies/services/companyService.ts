import api from "@/lib/api";
import type { Company, PaginatedResponse } from "@/lib/types";

export const companyService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<Company>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<Company>>("/companies", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Company> {
    const { data } = await api.get<Company>(`/companies/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/companies", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/companies/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/companies/${id}`);
  },
};
