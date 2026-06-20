import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { employeeService } from "../services/employeeService";

interface Props {
  employeeNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SalaryChangeRecord {
  _id: string;
  daily_salary: number;
  variable_salary: number;
  monthly_salary: number;
  integration_factor: number;
  integrated_salary: number;
  salary_change_reason: string;
  effective_date: string;
  source?: string;
  username?: string;
}

const PAGE_SIZE = 10;

const REASON_LABELS: Record<string, string> = {
  AJUSTE_OPTIMO: "Ajuste por óptimo contratado",
  EDICION_EMPLEADO: "Edición de empleado",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function SalaryHistoryDialog({ employeeNumber, open, onOpenChange }: Props) {
  const [records, setRecords] = useState<SalaryChangeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function loadPage(pageNum: number) {
    if (!employeeNumber) return;
    setLoading(true);
    try {
      const result = await employeeService.getSalaryHistory(
        employeeNumber,
        pageNum,
        PAGE_SIZE,
      );
      setRecords(result.data ?? []);
      setTotal(result.total ?? 0);
    } catch {
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open || !employeeNumber) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await employeeService.getSalaryHistory(
          employeeNumber,
          1,
          PAGE_SIZE,
        );
        if (cancelled) return;
        setRecords(result.data ?? []);
        setTotal(result.total ?? 0);
        setPage(1);
      } catch {
        if (!cancelled) {
          setRecords([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, employeeNumber]);

  function handlePrevPage() {
    const next = page - 1;
    setPage(next);
    loadPage(next);
  }

  function handleNextPage() {
    const next = page + 1;
    setPage(next);
    loadPage(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Histórico de salario
            {employeeNumber && (
              <span className="text-sm font-normal text-muted-foreground">
                — {employeeNumber}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay cambios de salario registrados para este empleado.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs">Salario diario</TableHead>
                    <TableHead className="text-xs">Salario mensual</TableHead>
                    <TableHead className="text-xs">Origen</TableHead>
                    <TableHead className="text-xs">Motivo</TableHead>
                    <TableHead className="text-xs">Realizado por</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="text-sm tabular-nums">
                        {formatDate(r.effective_date)}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {formatCurrency(r.daily_salary)}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {formatCurrency(r.monthly_salary)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.source === "AUTOMATIC" ? (
                          <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-600">
                            Automático
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600">
                            Manual
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {REASON_LABELS[r.salary_change_reason] ??
                          r.salary_change_reason}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.username || "Sistema"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      disabled={page <= 1}
                      onClick={handlePrevPage}
                    >
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      disabled={page >= totalPages}
                      onClick={handleNextPage}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
