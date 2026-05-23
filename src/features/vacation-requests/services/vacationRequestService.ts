import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type {
  VacationRequest,
  PlantOption,
  ShiftOption,
  EmployeeSuggestion,
  ReviewAction,
} from "../types";

export const vacationRequestService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<VacationRequest>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<VacationRequest>>(
      "/vacation-requests",
      { params },
    );
    return data;
  },

  async getById(id: string): Promise<VacationRequest> {
    const { data } = await api.get<VacationRequest>(`/vacation-requests/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/vacation-requests", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/vacation-requests/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vacation-requests/${id}`);
  },

  async resetToNew(id: string): Promise<void> {
    await api.patch(`/vacation-requests/${id}/reset`);
  },

  async review(
    id: string,
    payload: { action: ReviewAction; review_notes?: string },
  ): Promise<void> {
    await api.patch(`/vacation-requests/${id}/review`, payload);
  },

  async listPlants(): Promise<PlantOption[]> {
    const { data } = await api.get("/plants/all");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listShifts(): Promise<ShiftOption[]> {
    const { data } = await api.get("/shifts-and-schedules/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async searchEmployees(
    query: string,
    params?: { plant_id?: string; shift_id?: string },
  ): Promise<EmployeeSuggestion[]> {
    const searchParams: Record<string, unknown> = { q: query };
    if (params?.plant_id) searchParams.plant_id = params.plant_id;
    if (params?.shift_id) searchParams.shift_id = params.shift_id;

    const { data } = await api.get("/employees/search", {
      params: searchParams,
    });
    const employees = Array.isArray(data) ? data : (data?.data ?? []);
    return employees.map(
      (emp: { employee_number: string; fullname: string }) => ({
        employee_number: emp.employee_number,
        fullname: emp.fullname,
        label: `${emp.employee_number} - ${emp.fullname}`,
      }),
    );
  },
};
