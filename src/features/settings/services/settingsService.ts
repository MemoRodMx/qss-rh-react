import api from "@/lib/api";
import type { PositionOption } from "../types";

export const settingsService = {
  async listPositions(): Promise<PositionOption[]> {
    const { data } = await api.get("/positions/list");
    return Array.isArray(data) ? data : (data?.data ?? []);
  },
};
