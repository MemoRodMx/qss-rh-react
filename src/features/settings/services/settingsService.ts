import api from "@/lib/api";
import type { PositionOption, SettingsConfig } from "../types";

export const settingsService = {
  async listPositions(): Promise<PositionOption[]> {
    const { data } = await api.get("/positions/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getConfig(): Promise<string[]> {
    const { data } = await api.get("/settings/rest-role-positions");
    return Array.isArray(data) ? data : [];
  },

  async saveConfig(config: SettingsConfig): Promise<{ message: string }> {
    const { data } = await api.put("/settings/rest-role-positions", config);
    return data;
  },
};
