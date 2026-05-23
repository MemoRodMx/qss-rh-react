import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type {
  RestRole,
  Supervisor,
  SupervisorPlant,
  EmployeeSearchResult,
  ShiftOption,
} from "../types";

export const restRoleService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<RestRole>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<RestRole>>("/rest-roles", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<RestRole> {
    const { data } = await api.get<RestRole>(`/rest-roles/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/rest-roles", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/rest-roles/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rest-roles/${id}`);
  },

  async review(
    id: string,
    payload: { status: string; notes?: string },
  ): Promise<void> {
    await api.patch(`/rest-roles/${id}/review`, payload);
  },

  async reopen(id: string): Promise<void> {
    await api.patch(`/rest-roles/${id}/reopen`);
  },

  async listSupervisors(): Promise<Supervisor[]> {
    const { data } = await api.get("/direct-supervisors", {
      params: { limit: 100 },
    });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getSupervisorPlants(supervisorId: string): Promise<SupervisorPlant[]> {
    const { data } = await api.get(
      `/direct-supervisors/${supervisorId}/plants`,
    );
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listShifts(): Promise<ShiftOption[]> {
    const { data } = await api.get("/shifts-and-schedules/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async searchEmployees(
    query: string,
    params?: { plant_id?: string; shift_id?: string; position_ids?: string[] },
  ): Promise<EmployeeSearchResult[]> {
    const searchParams: Record<string, unknown> = { q: query };
    if (params?.plant_id) searchParams.plant_id = params.plant_id;
    if (params?.shift_id) searchParams.shift_id = params.shift_id;
    if (params?.position_ids?.length) {
      searchParams.position_ids = params.position_ids.join(",");
    }

    const { data } = await api.get("/employees/search", {
      params: searchParams,
    });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async resolveEmployeeNumbers(
    numbers: string[],
  ): Promise<Array<{ employee_number: string; fullname: string }>> {
    const { data } = await api.post("/employees/resolve-numbers", {
      employee_numbers: numbers,
    });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getConfiguredPositionIds(): Promise<string[]> {
    const { data } = await api.get("/settings/rest-role-positions");
    return Array.isArray(data) ? data : (data?.position_ids ?? []);
  },
};
