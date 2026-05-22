import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { Employee, SelectOption, SupervisorOption } from "../types";

interface RawSupervisor {
  _id: string;
  employee_number: string;
  name: string;
}

interface RawState {
  code: string;
  name: string;
}

interface RawCatalogItem {
  code: string;
  name: string;
}

export const employeeService = {
  async list(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<PaginatedResponse<Employee>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<Employee>>("/employees", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Employee> {
    const { data } = await api.get<Employee>(`/employees/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/employees", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/employees/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },

  async getNextEmployeeNumber(): Promise<string> {
    const { data } = await api.get<{ next_number: string }>(
      "/employees/next-number",
    );
    return data.next_number;
  },

  async listCustomers(): Promise<SelectOption[]> {
    const { data } = await api.get("/customers/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listPlants(customerId?: string): Promise<SelectOption[]> {
    if (!customerId) return [];
    const { data } = await api.get("/plants/by-customer", {
      params: { customer_id: customerId },
    });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listPositions(): Promise<SelectOption[]> {
    const { data } = await api.get("/positions");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listAreas(): Promise<SelectOption[]> {
    const { data } = await api.get("/areas/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listShifts(): Promise<SelectOption[]> {
    const { data } = await api.get("/shifts-and-schedules/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listSchedules(shiftName?: string): Promise<SelectOption[]> {
    if (!shiftName) return [];
    const { data } = await api.get(
      `/shifts-and-schedules/schedules-by-shift/${shiftName}`,
    );
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listSupervisors(
    searchTerm?: string,
    plantCode?: string,
    shiftCode?: string,
  ): Promise<SupervisorOption[]> {
    const params: Record<string, unknown> = {};
    if (searchTerm?.trim()) params.search = searchTerm.trim();
    if (plantCode) params.plant_code = plantCode;
    if (shiftCode) params.shift_code = shiftCode;
    params.limit = 10;

    const url = plantCode
      ? "/direct-supervisors/by-plant"
      : "/direct-supervisors";
    const { data } = await api.get(url, { params });
    // /direct-supervisors returns { data: [...] }, /direct-supervisors/by-plant returns array
    const list: RawSupervisor[] = plantCode
      ? Array.isArray(data)
        ? data
        : []
      : data?.data || [];
    return list.map((s) => ({
      _id: s._id,
      employee_number: s.employee_number,
      name: s.name,
      label: `${s.employee_number} - ${s.name}`,
    }));
  },

  async getSupervisorById(id: string): Promise<SupervisorOption | null> {
    try {
      const { data } = await api.get<RawSupervisor>(
        `/direct-supervisors/${id}`,
      );
      if (!data) return null;
      return {
        _id: data._id,
        employee_number: data.employee_number,
        name: data.name,
        label: `${data.employee_number} - ${data.name}`,
      };
    } catch {
      return null;
    }
  },

  async listStates(): Promise<SelectOption[]> {
    const { data } = await api.get("/catalogs/states", {
      params: { limit: 50 },
    });
    return ((data?.data ?? []) as RawState[]).map((s) => ({
      code: s.code,
      name: s.name,
    }));
  },

  async listMunicipalities(stateCode: string): Promise<SelectOption[]> {
    const { data } = await api.get(`/catalogs/municipalities/${stateCode}`);
    return ((Array.isArray(data) ? data : []) as RawCatalogItem[])
      .map((m) => ({ code: m.code, name: m.name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  },

  async listColonies(zipcode: string): Promise<SelectOption[]> {
    const { data } = await api.get(`/catalogs/colonies/${zipcode}`);
    return ((Array.isArray(data) ? data : []) as RawCatalogItem[])
      .map((c) => ({ code: c.code, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  },

  async listBanks(): Promise<SelectOption[]> {
    const { data } = await api.get("/banks/list");
    return Array.isArray(data) ? data : [];
  },
};
