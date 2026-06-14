import { useEffect, useState } from "react";
import { customerService } from "../services/customerService";
import type { Customer, OptimalContracted, SelectOption } from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Briefcase, EyeOff, Sun, Moon } from "lucide-react";

interface Props {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerOptimalSheet({ customerId, open, onOpenChange }: Props) {
  const DAY_LABELS = [
    "Lun",
    "Mar",
    "Mié",
    "Jue",
    "Vie",
    "Sáb",
    "Dom",
  ] as const;

  const DAY_KEYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

  const formatCurrency = (value: number): string =>
    value.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [positions, setPositions] = useState<SelectOption[]>([]);
  const [shifts, setShifts] = useState<SelectOption[]>([]);
  const [workdayTypes, setWorkdayTypes] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !customerId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setCustomer(null);
      try {
        const [cust, posData, shiftData, wtData] = await Promise.all([
          customerService.getById(customerId!),
          customerService.listPositions(),
          customerService.listShifts(),
          customerService.listWorkdayTypes(),
        ]);
        if (cancelled) return;
        setCustomer(cust);
        setPositions(posData);
        setShifts(shiftData);
        setWorkdayTypes(wtData);
      } catch {
        if (!cancelled) setError("Error al cargar los datos del cliente");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, customerId]);

  function getPositionName(code: string): string {
    return positions.find((p) => (p.code ?? p._id) === code)?.name ?? code;
  }

  function getShiftName(code: string): string {
    return shifts.find((s) => (s.code ?? s._id) === code)?.name ?? code;
  }

  function getWorkdayTypeName(code: string): string {
    return workdayTypes.find(
      (w) => (w.code ?? w._id ?? "").toLowerCase() === code.toLowerCase(),
    )?.name ?? code;
  }

  const optimalContracted: OptimalContracted[] =
    customer?.optimal_contracted ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[520px] max-w-[90vw]">
        {/* header */}
        <SheetHeader className="border-b border-border/40 pb-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <SheetTitle className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Óptimo contratado
              </SheetTitle>
              {customer && (
                <SheetDescription>
                  {customer.legal_name}
                  {customer.rfc && (
                    <span className="ml-2 text-xs text-muted-foreground/60">
                      RFC: {customer.rfc}
                    </span>
                  )}
                </SheetDescription>
              )}
            </>
          )}
        </SheetHeader>

        {/* body */}
        <div className="flex-1 px-5 py-4">
          {/* loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3 rounded-xl border border-border/40 p-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <Skeleton key={j} className="h-6" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* error */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <EyeOff className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {/* empty */}
          {!loading && !error && optimalContracted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <EyeOff className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">
                Sin óptimo contratado
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Este cliente no tiene personal óptimo contratado registrado.
              </p>
            </div>
          )}

          {/* data */}
          {!loading && !error && optimalContracted.length > 0 && (
            <div className="space-y-6 stagger-grid">
              {optimalContracted.map((oc, ocIndex) => (
                <div
                  key={ocIndex}
                  className="rounded-xl border-2 border-border/50 bg-card shadow-[var(--shadow-1)] overflow-hidden"
                >
                  {/* position header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {ocIndex + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {getPositionName(oc.position) || "—"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {oc.position || "Sin código"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground tracking-wider">
                          Salario
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {oc.salary ? formatCurrency(oc.salary) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground tracking-wider">
                          Bono
                        </p>
                        <p className="text-sm font-medium text-accent">
                          {oc.bonus ? formatCurrency(oc.bonus) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* coverage */}
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Cobertura por turno
                    </p>

                    {oc.coverage.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">
                        Sin coberturas registradas
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {oc.coverage.map((cov) => {
                          const total = DAY_KEYS.reduce(
                            (s, k) => s + (cov[k] || 0),
                            0,
                          );
                          const isAM = cov.shift?.toUpperCase() === "AM";
                          const shiftColor = isAM
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30"
                            : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30";
                          const ShiftIcon = isAM ? Sun : Moon;

                          return (
                            <div
                              key={cov.shift}
                              className={`rounded-lg border p-3 ${shiftColor}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-6 w-6 items-center justify-center rounded bg-white/60 dark:bg-black/20">
                                    <ShiftIcon className="h-3.5 w-3.5" />
                                  </span>
                                  <span className="text-xs font-semibold">
                                    {cov.shift} - {getShiftName(cov.shift)}
                                  </span>
                                </div>
                                {cov.workday_type && (
                                  <Badge variant="secondary" className="text-[10px] uppercase">
                                    {getWorkdayTypeName(cov.workday_type)}
                                  </Badge>
                                )}
                              </div>

                              {/* day grid + total column */}
                              <div className="grid grid-cols-8 gap-1.5">
                                {DAY_LABELS.map((label, i) => (
                                  <div key={label} className="text-center">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">
                                      {label}
                                    </p>
                                    <span className="inline-flex items-center justify-center w-full h-7 rounded-md bg-white/70 dark:bg-black/20 text-xs font-medium tabular-nums">
                                      {cov[DAY_KEYS[i]] ?? 0}
                                    </span>
                                  </div>
                                ))}
                                {/* total column */}
                                <div className="text-center">
                                  <p className="text-[10px] text-muted-foreground mb-0.5 font-semibold">
                                    Tot
                                  </p>
                                  <span className="inline-flex items-center justify-center w-full h-7 rounded-md bg-primary/10 text-xs font-bold text-primary tabular-nums">
                                    {total}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
