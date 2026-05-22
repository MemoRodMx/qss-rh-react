import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { State } from "../types";

export const stateService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<State>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<State>>(
      "/catalogs/states",
      { params },
    );
    return data;
  },
};
