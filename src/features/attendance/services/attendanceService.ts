import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type {
  AttendanceRecordListItem,
  AttendanceRecordDetail,
  SupervisorOption,
  PlantOption,
  EmployeeBySupervisorItem,
  LoanSuggestion,
} from "../types";

// Helper to unwrap { status, data } API responses
function unwrapData<T>(response: unknown): T {
  const obj = response as { data?: T };
  return (obj?.data ?? response) as T;
}

export const attendanceService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<AttendanceRecordListItem>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<AttendanceRecordListItem>>(
      "/attendance-records",
      { params },
    );
    // API returns { status, data, page, limit, total }
    // Axios gives us the full response body as `data`
    return data as PaginatedResponse<AttendanceRecordListItem>;
  },

  async getById(id: string): Promise<AttendanceRecordDetail> {
    const { data } = await api.get<{
      status: number;
      data: AttendanceRecordDetail;
    }>(`/attendance-records/${id}`);
    // API wraps in { status, data }, unwrap it
    return unwrapData<AttendanceRecordDetail>(data);
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { data } = await api.post("/attendance-records", payload);
    return { status: (data as { status: number })?.status ?? 201 };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { data } = await api.patch(`/attendance-records/${id}`, payload);
    return { status: (data as { status: number })?.status ?? 200 };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/attendance-records/${id}`);
  },

  async listSupervisors(): Promise<SupervisorOption[]> {
    const { data } = await api.get("/direct-supervisors", {
      params: { limit: 200 },
    });
    // API returns { status, data: [...] } or just [...]
    return unwrapData<SupervisorOption[]>(data);
  },

  async listSupervisorPlants(supervisorId: string): Promise<PlantOption[]> {
    const { data } = await api.get(
      `/direct-supervisors/${supervisorId}/plants`,
    );
    // API returns { status, data: [...] } or just [...]
    return unwrapData<PlantOption[]>(data);
  },

  async listEmployeesBySupervisor(
    supervisorId: string,
    plantId: string,
  ): Promise<EmployeeBySupervisorItem[]> {
    const { data } = await api.get(
      `/attendance-records/by-supervisor/${supervisorId}/employees`,
      { params: { plant_id: plantId } },
    );
    // API returns { status, data: [...] }
    return unwrapData<EmployeeBySupervisorItem[]>(data);
  },

  async searchEmployees(query: string): Promise<LoanSuggestion[]> {
    const { data } = await api.get("/employees/search", {
      params: { q: query },
    });
    // API returns { status, data: [...] } or just [...]
    return unwrapData<LoanSuggestion[]>(data);
  },
};
