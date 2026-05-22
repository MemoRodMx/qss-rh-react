import api from "@/lib/api";
import type { Company, PaginatedResponse } from "@/lib/types";

export interface PlantOption {
  _id: string;
  code: string;
  name: string;
}

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

  /**
   * Returns plants as a 2D array in PickList format: [availablePlants, selectedPlants]
   * The API returns this format natively.
   */
  async listPlants(
    companyId?: string,
  ): Promise<[PlantOption[], PlantOption[]]> {
    const url = companyId
      ? `/plants/list?company_id=${companyId}`
      : "/plants/list";
    const response = await api.get(url);
    // The API returns a 2D array: [available, selected]
    const raw = response.data;
    if (Array.isArray(raw)) {
      // Ensure it's a 2D array
      if (raw.length === 2 && Array.isArray(raw[0]) && Array.isArray(raw[1])) {
        return raw as [PlantOption[], PlantOption[]];
      }
      // If it's a flat array, treat as available only
      return [raw as PlantOption[], []];
    }
    if (raw?.data && Array.isArray(raw.data)) {
      const d = raw.data;
      if (d.length === 2 && Array.isArray(d[0]) && Array.isArray(d[1])) {
        return d as [PlantOption[], PlantOption[]];
      }
      return [d as PlantOption[], []];
    }
    return [[], []];
  },
};
