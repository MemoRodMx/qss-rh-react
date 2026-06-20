import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { Customer, SelectOption, CsfData } from "../types";

export interface PlantOption {
  _id: string;
  code: string;
  name: string;
}

export const customerService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<Customer>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<Customer>>("/customers", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Customer> {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/customers", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/customers/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async listAreas(customerId?: string): Promise<SelectOption[]> {
    const params: Record<string, unknown> = {};
    if (customerId) params.customer_id = customerId;
    const { data } = await api.get("/areas/list", { params });

    // New format: { data: [available[], selected[]] }
    if (data?.data && Array.isArray(data.data)) {
      // Return flat list for dropdowns
      const [available, selected] = data.data;
      return [...(Array.isArray(available) ? available : []), ...(Array.isArray(selected) ? selected : [])];
    }
    // Old format: flat array
    if (Array.isArray(data)) return data;
    return data?.data ?? [];
  },

  async listAreasPickList(
    customerId?: string,
  ): Promise<[SelectOption[], SelectOption[]]> {
    const params: Record<string, unknown> = {};
    if (customerId) params.customer_id = customerId;
    const { data } = await api.get("/areas/list", { params });

    if (data?.data && Array.isArray(data.data) && data.data.length === 2) {
      return data.data as [SelectOption[], SelectOption[]];
    }
    if (Array.isArray(data) && data.length === 2) {
      return data as [SelectOption[], SelectOption[]];
    }
    return [[], []];
  },

  async listPositions(customerId?: string): Promise<SelectOption[]> {
    const params = customerId ? { "customer-id": customerId } : {};
    const { data } = await api.get("/positions/list", { params });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listShifts(customerId?: string): Promise<SelectOption[]> {
    const params = customerId ? { "customer-id": customerId } : {};
    const { data } = await api.get("/shifts-and-schedules/list", { params });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listWorkdayTypes(): Promise<SelectOption[]> {
    const { data } = await api.get("/workday-types/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listPlants(
    customerId?: string,
  ): Promise<[PlantOption[], PlantOption[]]> {
    const url = customerId
      ? `/plants/list?customer_id=${customerId}`
      : "/plants/list";
    const response = await api.get(url);
    const raw = response.data;
    if (raw?.data && Array.isArray(raw.data)) {
      const d = raw.data;
      if (d.length === 2 && Array.isArray(d[0]) && Array.isArray(d[1])) {
        return d as [PlantOption[], PlantOption[]];
      }
      return [d as PlantOption[], []];
    }
    if (Array.isArray(raw)) {
      if (raw.length === 2 && Array.isArray(raw[0]) && Array.isArray(raw[1])) {
        return raw as [PlantOption[], PlantOption[]];
      }
      return [raw as PlantOption[], []];
    }
    return [[], []];
  },

  async parseCsf(file: File): Promise<CsfData> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<CsfData>("/customers/parse-csf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
