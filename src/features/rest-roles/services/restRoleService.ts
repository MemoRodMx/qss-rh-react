import api from "@/lib/api";
import type {
  OptimalContractedResponse,
  EmployeeAssignment,
  RestRole,
  Descansos,
  AssignmentEntry,
} from "./types";

export const restRoleService = {
  async getOptimalContracted(
    supervisorId: string,
  ): Promise<OptimalContractedResponse> {
    const { data } = await api.get<OptimalContractedResponse>(
      `/rest-roles/optimal-contracted/${supervisorId}`,
    );
    return data;
  },

  async getEmployeesForAssignment(
    supervisorId: string,
  ): Promise<EmployeeAssignment[]> {
    const { data } = await api.get<EmployeeAssignment[]>(
      `/rest-roles/employees/${supervisorId}`,
    );
    return Array.isArray(data) ? data : [];
  },

  async findByParams(
    directSupervisorId: string,
    type: string,
    shiftId: string,
    week: number,
  ): Promise<RestRole | null> {
    const { data } = await api.get<RestRole>("/rest-roles/search/params", {
      params: {
        direct_supervisor_id: directSupervisorId,
        type,
        shift_id: shiftId,
        week: week.toString(),
      },
    });
    return data?._id ? data : null;
  },

  async create(payload: {
    company_id: string;
    direct_supervisor_id: string;
    type: string;
    business_unit: string;
    week: number;
    shift_id: string;
    descansos?: Descansos;
    assignments?: AssignmentEntry[];
  }): Promise<{ status: number; _id: string }> {
    const { data } = await api.post<{ status: number; _id: string }>(
      "/rest-roles",
      payload,
    );
    return data;
  },

  async update(
    id: string,
    payload: {
      descansos?: Descansos;
      assignments?: AssignmentEntry[];
    },
  ): Promise<{ status: number; message: string }> {
    const { data } = await api.patch<{ status: number; message: string }>(
      `/rest-roles/${id}`,
      payload,
    );
    return data;
  },
  async getById(id: string): Promise<RestRole> {
    const { data } = await api.get<RestRole>(`/rest-roles/${id}`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/rest-roles/${id}`);
  },
};
