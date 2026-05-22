import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { Colony } from "../types";

export const colonyService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<Colony>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<Colony>>(
      "/catalogs/colonies",
      { params },
    );
    return data;
  },
};
