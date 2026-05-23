import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { AuditLogFilters } from "../components/AuditLogFilters";
import { AuditLogTable } from "../components/AuditLogTable";
import { AuditLogMobileCards } from "../components/AuditLogMobileCards";
import { AuditLogDetailDialog } from "../components/AuditLogDetailDialog";
import type { AuditLog } from "../types";

export function AuditLogsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    logs,
    isLoading,
    total,
    page,
    totalPages,
    filters,
    setFilterEntity,
    setFilterAction,
    setFilterUsername,
    setFilterStartDate,
    setFilterEndDate,
    applyFilters,
    clearFilters,
    setPage,
    refresh,
    dateError,
  } = useAuditLogs(20);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Restrict to System role only
  useEffect(() => {
    if (user && user.role !== "System") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Don't render anything while checking auth or if not System
  if (!user || user.role !== "System") {
    return null;
  }

  const hasFilters =
    !!filters.entity ||
    !!filters.action ||
    !!filters.username.trim() ||
    !!filters.startDate ||
    !!filters.endDate;

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-heading font-semibold text-foreground">
            Auditoría del Sistema
          </h1>
          <p className="text-xs text-muted-foreground">
            Registro de eventos y cambios en el sistema
          </p>
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={refresh}
          className="cursor-pointer"
          title="Recargar"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Filters */}
      <AuditLogFilters
        entity={filters.entity}
        action={filters.action}
        username={filters.username}
        startDate={filters.startDate}
        endDate={filters.endDate}
        dateError={dateError}
        onEntityChange={setFilterEntity}
        onActionChange={setFilterAction}
        onUsernameChange={setFilterUsername}
        onStartDateChange={setFilterStartDate}
        onEndDateChange={setFilterEndDate}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      {/* Desktop table */}
      <div className="hidden md:block">
        <AuditLogTable
          logs={logs}
          isLoading={isLoading}
          total={total}
          page={page}
          totalPages={totalPages}
          hasFilters={hasFilters}
          onViewDetail={handleViewDetail}
          onPageChange={setPage}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        <AuditLogMobileCards
          logs={logs}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onViewDetail={handleViewDetail}
          onPageChange={setPage}
        />
      </div>

      {/* Detail dialog */}
      <AuditLogDetailDialog
        log={selectedLog}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
