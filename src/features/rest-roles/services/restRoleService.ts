import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type {
  RestRole,
  Supervisor,
  SupervisorPlant,
  Shift,
  EmployeeSuggestion,
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
    payload: { action: string; review_notes?: string },
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
    return data?.data ?? data ?? [];
  },

  async getSupervisorPlants(supervisorId: string): Promise<SupervisorPlant[]> {
    const { data } = await api.get(
      `/direct-supervisors/${supervisorId}/plants`,
    );
    return data ?? [];
  },

  async listShifts(): Promise<Shift[]> {
    const { data } = await api.get("/shifts-and-schedules/list");
    return data?.data ?? data ?? [];
  },

  async searchEmployees(
    query: string,
    options?: {
      position_ids?: string;
      plant_id?: string;
      shift_id?: string;
    },
  ): Promise<EmployeeSuggestion[]> {
    const params: Record<string, unknown> = { q: query };
    if (options?.position_ids) params.position_ids = options.position_ids;
    if (options?.plant_id) params.plant_id = options.plant_id;
    if (options?.shift_id) params.shift_id = options.shift_id;

    const { data } = await api.get("/employees/search", { params });
    return (data ?? []).map(
      (emp: { employee_number: string; fullname: string }) => ({
        employee_number: emp.employee_number,
        label: `${emp.employee_number} - ${emp.fullname}`,
      }),
    );
  },

  async resolveEmployeeNumbers(
    employeeNumbers: string[],
  ): Promise<EmployeeSuggestion[]> {
    if (!employeeNumbers.length) return [];

    const { data } = await api.post("/employees/resolve-numbers", {
      employee_numbers: employeeNumbers,
    });
    return (data ?? []).map(
      (emp: { employee_number: string; fullname: string }) => ({
        employee_number: emp.employee_number,
        label: `${emp.employee_number} - ${emp.fullname}`,
      }),
    );
  },

  async getConfiguredPositionIds(): Promise<string[]> {
    try {
      const { data } = await api.get("/settings/rest-role-positions");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
