import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { Customer, SelectOption } from "../types";

export const customerService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<Customer>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<Customer>>("/customers", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Customer> {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  async create(payload: Record<string, unknown>): Promise<{ status: number }> {
    const { status } = await api.post("/customers", payload);
    return { status };
  },

  async update(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<{ status: number }> {
    const { status } = await api.patch(`/customers/${id}`, payload);
    return { status };
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async listCompanies(): Promise<SelectOption[]> {
    const { data } = await api.get("/companies/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listAreas(): Promise<SelectOption[]> {
    const { data } = await api.get("/areas/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listPositions(customerId?: string): Promise<SelectOption[]> {
    const params = customerId ? { "customer-id": customerId } : {};
    const { data } = await api.get("/positions/list", { params });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listShifts(customerId?: string): Promise<SelectOption[]> {
    const params = customerId ? { "customer-id": customerId } : {};
    const { data } = await api.get("/shifts-and-schedules/list", { params });
    return Array.isArray(data) ? data : (data?.data ?? []);
  },
};
