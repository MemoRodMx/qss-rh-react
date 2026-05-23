import api from "@/lib/api";
import type { User, UserListResponse, EmployeeOption } from "../types";

export const userService = {
  // ── CRUD ──────────────────────────────────────────────────────────────────
  async list(page = 1, limit = 10, search?: string): Promise<UserListResponse> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<UserListResponse>("/users", { params });
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(
    payload: Record<string, unknown>,
  ): Promise<{ status: number; _id?: string }> {
    const { data } = await api.post("/users", payload);
    return data;
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async reactivate(
    id: string,
  ): Promise<{ message: string; conflict?: boolean }> {
    const { data } = await api.patch(`/direct-supervisors/relink-user/${id}`);
    return data;
  },

  // ── Employee search ────────────────────────────────────────────────────────
  async searchEmployees(query: string): Promise<EmployeeOption[]> {
    if (!query || query.length < 2) return [];

    const { data } = await api.get("/employees/search", {
      params: { q: query },
    });

    const list = Array.isArray(data) ? data : [];
    return list.map(
      (emp: { _id: string; employee_number: string; fullname: string }) => ({
        _id: emp._id,
        employee_number: emp.employee_number,
        fullname: emp.fullname,
        label: `${emp.employee_number} - ${emp.fullname}`,
      }),
    );
  },

  async getEmployeeById(id: string): Promise<EmployeeOption | null> {
    try {
      const { data } = await api.get(`/employees/${id}`);
      const fullname = `${data.name || ""} ${data.surname || ""} ${
        data.lastname || ""
      }`.trim();
      return {
        _id: data._id,
        employee_number: data.employee_number,
        fullname,
        label: `${data.employee_number} - ${fullname}`,
      };
    } catch {
      return null;
    }
  },
};
