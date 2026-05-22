import api from "@/lib/api";
import type { Employee, PaginatedResponse } from "@/lib/types";

export const employeeService = {
  async list(page = 1, limit = 20): Promise<PaginatedResponse<Employee>> {
    const { data } = await api.get<PaginatedResponse<Employee>>("/employees", {
      params: { page, limit },
    });
    return data;
  },

  async getById(id: string): Promise<Employee> {
    const { data } = await api.get<Employee>(`/employees/${id}`);
    return data;
  },
};
