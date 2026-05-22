import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { City } from "../types";

export const cityService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<City>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<City>>(
      "/catalogs/municipalities",
      { params },
    );
    return data;
  },
};
