import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type {
  DirectSupervisor,
  AreaOption,
  ShiftOption,
  EmployeeSuggestion,
} from "../types";

export const directSupervisorsService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<DirectSupervisor>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<DirectSupervisor>>(
      "/direct-supervisors",
      { params },
    );
    return data;
  },

  async getById(id: string): Promise<DirectSupervisor> {
    const { data } = await api.get<DirectSupervisor>(
      `/direct-supervisors/${id}`,
    );
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/direct-supervisors", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/direct-supervisors/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/direct-supervisors/${id}`);
  },

  async listAreas(customerId?: string): Promise<AreaOption[]> {
    const params: Record<string, unknown> = {};
    if (customerId) params.customer_id = customerId;

    const { data } = await api.get("/areas/list", { params });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listShifts(): Promise<ShiftOption[]> {
    const { data } = await api.get("/shifts-and-schedules", {
      params: { page: 1, limit: 200 },
    });
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  async searchEmployees(query: string): Promise<EmployeeSuggestion[]> {
    const { data } = await api.get("/employees/search", {
      params: { q: query },
    });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },
};
