import api from "@/lib/api";
import type { PositionOption, AreaOption, SettingsPayload, SettingsResponse } from "../types";

export const settingsService = {
  async listPositions(): Promise<PositionOption[]> {
    const { data } = await api.get("/positions/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async listAreas(): Promise<AreaOption[]> {
    const { data } = await api.get("/areas/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getConfig(companyId: string): Promise<SettingsResponse> {
    const { data } = await api.get("/settings", {
      params: { company_id: companyId },
    });
    return data;
  },

  async saveConfig(payload: SettingsPayload): Promise<void> {
    await api.put("/settings", payload);
  },
};
