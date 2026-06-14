import api from "@/lib/api";
import type {
  Employee,
  EmployeeListResponse,
  CatalogOption,
  SupervisorOption,
  BankOption,
} from "../types";

export const employeeService = {
  // ── CRUD ──────────────────────────────────────────────────────────────────
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<EmployeeListResponse> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<EmployeeListResponse>("/employees", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Employee> {
    const { data } = await api.get<Employee>(`/employees/${id}`);
    return data;
  },

  async create(
    payload: Record<string, unknown>,
  ): Promise<{ status: number; _id?: string }> {
    const { data } = await api.post("/employees", payload);
    return data;
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number; supervisor_name_updated?: boolean }> {
    const { data } = await api.patch(`/employees/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },

  async getNextNumber(): Promise<string> {
    const { data } = await api.get<{ next_number: string }>(
      "/employees/next-number",
    );
    return data.next_number;
  },

  // ── Customers ─────────────────────────────────────────────────────────────
  async listCustomers(): Promise<Array<{ code: string; name: string }>> {
    const { data } = await api.get("/customers/list");
    return Array.isArray(data) ? data : [];
  },

  // ── Plants ────────────────────────────────────────────────────────────────
  async listPlants(
    customerId?: string,
  ): Promise<Array<{ code: string; name: string }>> {
    if (!customerId) return [];
    const { data } = await api.get("/plants/by-customer", {
      params: { customer_id: customerId },
    });
    return Array.isArray(data) ? data : [];
  },

  // ── Positions ─────────────────────────────────────────────────────────────
  async listPositions(): Promise<
    Array<{ code: string; name: string; description?: string }>
  > {
    const { data } = await api.get("/positions");
    const raw = data?.data ?? [];
    return raw.map(
      (p: { code: string; name?: string; description?: string }) => ({
        code: p.code,
        name: p.name ?? p.description ?? "",
        description: p.description ?? p.name ?? "",
      }),
    );
  },

  // ── Shifts ────────────────────────────────────────────────────────────────
  async listShifts(): Promise<Array<{ code: string; name: string }>> {
    const { data } = await api.get("/shifts-and-schedules/list");
    const raw = Array.isArray(data) ? data : (data?.data ?? []);
    return raw.map((s: { code?: string; name: string }) => ({
      ...s,
      code: s.code?.toLowerCase?.() ?? s.code,
    }));
  },

  // ── Schedules ─────────────────────────────────────────────────────────────
  async listSchedules(
    shiftName: string,
  ): Promise<Array<{ code: string; label: string }>> {
    const { data } = await api.get(
      `/shifts-and-schedules/schedules-by-shift/${shiftName}`,
    );
    return data?.data ?? [];
  },

  // ── Supervisors ───────────────────────────────────────────────────────────
  async listSupervisors(
    search: string,
    areaCode?: string,
    shiftCode?: string,
  ): Promise<SupervisorOption[]> {
    const query: Record<string, unknown> = { search, limit: 10 };
    const url = areaCode
      ? "/direct-supervisors/by-area"
      : "/direct-supervisors";

    if (areaCode) {
      query.area_code = areaCode;
      if (shiftCode) query.shift_code = shiftCode;
    }

    const { data } = await api.get(url, { params: query });
    const list = areaCode
      ? Array.isArray(data)
        ? data
        : []
      : data?.data || [];

    return list.map(
      (s: { _id: string; employee_number: string; name: string }) => ({
        _id: s._id,
        employee_number: s.employee_number,
        name: s.name,
        label: `${s.employee_number} - ${s.name}`,
      }),
    );
  },

  async listSupervisorsByPlant(
    plantId: string,
    search: string,
  ): Promise<SupervisorOption[]> {
    if (!plantId) return [];
    const { data } = await api.get("/direct-supervisors/by-plant", {
      params: { plant_id: plantId, search, limit: 10 },
    });
    const list = Array.isArray(data) ? data : [];
    return list.map(
      (s: { _id: string; employee_number: string; name: string }) => ({
        _id: s._id,
        employee_number: s.employee_number,
        name: s.name,
        label: `${s.employee_number} - ${s.name}`,
      }),
    );
  },

  async getSupervisorById(id: string): Promise<SupervisorOption | null> {
    try {
      const { data } = await api.get(`/direct-supervisors/${id}`);
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

  // ── States ────────────────────────────────────────────────────────────────
  async listStates(): Promise<CatalogOption[]> {
    const { data } = await api.get("/catalogs/states", {
      params: { limit: 50 },
    });
    return (data?.data ?? [])
      .map((s: { code: string; name: string }) => ({
        code: s.code,
        name: s.name,
      }))
      .sort((a: { name: string }, b: { name: string }) =>
        a.name.localeCompare(b.name, "es"),
      );
  },

  // ── Municipalities ────────────────────────────────────────────────────────
  async listMunicipalities(stateCode: string): Promise<CatalogOption[]> {
    const { data } = await api.get(`/catalogs/municipalities/${stateCode}`);
    return (Array.isArray(data) ? data : [])
      .map((m: { code: string; name: string }) => ({
        code: m.code,
        name: m.name,
      }))
      .sort((a: { name: string }, b: { name: string }) =>
        a.name.localeCompare(b.name, "es"),
      );
  },

  // ── Colonies ──────────────────────────────────────────────────────────────
  async listColonies(zipcode: string): Promise<CatalogOption[]> {
    const { data } = await api.get(`/catalogs/colonies/${zipcode}`);
    return (Array.isArray(data) ? data : [])
      .map((c: { code: string; name: string }) => ({
        code: c.code,
        name: c.name,
      }))
      .sort((a: { name: string }, b: { name: string }) =>
        a.name.localeCompare(b.name, "es"),
      );
  },

  // ── Areas ─────────────────────────────────────────────────────────────────
  async listAreas(customerId?: string): Promise<CatalogOption[]> {
    const params: Record<string, unknown> = {};
    if (customerId) params.customer_id = customerId;

    const { data } = await api.get("/areas/list", { params });
    return (Array.isArray(data) ? data : []).map(
      (a: { code: string; name: string }) => ({
        code: a.code,
        name: a.name,
      }),
    );
  },

  // ── Banks ─────────────────────────────────────────────────────────────────
  async listBanks(): Promise<BankOption[]> {
    const { data } = await api.get("/banks/list");
    return Array.isArray(data) ? data : [];
  },
};
