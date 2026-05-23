import api from "@/lib/api";
import type { AuditLogListResponse, AuditLogFilters } from "../types";

function buildQuery(
  filters: AuditLogFilters,
  page: number,
  limit: number,
): Record<string, unknown> {
  const query: Record<string, unknown> = { page, limit };

  if (filters.entity) query.entity = filters.entity;
  if (filters.action) query.action = filters.action;
  if (filters.username.trim())
    query.changed_by_username = filters.username.trim();
  if (filters.startDate) query.start_date = filters.startDate;
  if (filters.endDate) query.end_date = filters.endDate;

  return query;
}

export const auditLogService = {
  async list(
    filters: AuditLogFilters,
    page = 1,
    limit = 20,
  ): Promise<AuditLogListResponse> {
    const params = buildQuery(filters, page, limit);
    const { data } = await api.get<AuditLogListResponse>("/audit-logs", {
      params,
    });
    return data;
  },
};
