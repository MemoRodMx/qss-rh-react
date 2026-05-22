import api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/types";
import type { Zipcode } from "../types";

export const zipcodeService = {
  async list(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<Zipcode>> {
    const params: Record<string, unknown> = { page, limit };
    if (search?.trim()) params.search = search.trim();

    const { data } = await api.get<PaginatedResponse<Zipcode>>(
      "/catalogs/zipcodes",
      { params },
    );
    return data;
  },
};
