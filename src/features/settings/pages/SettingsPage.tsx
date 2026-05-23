import { useCallback, useMemo } from "react";
import { useSettings } from "../hooks/useSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Info, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function SettingsPage() {
  const {
    positions,
    selectedCodes,
    setSelectedCodes,
    isLoading,
    isSaving,
    error,
    save,
  } = useSettings();

  const selectedCount = selectedCodes.length;

  const selectedLabels = useMemo(() => {
    return selectedCodes
      .map((code) => positions.find((p) => p.code === code)?.name ?? code)
      .join(", ");
  }, [selectedCodes, positions]);

  const handleValueChange = useCallback(
    (value: string | null) => {
      if (!value) return;

      if (value === "__select_all__") {
        if (selectedCodes.length === positions.length) {
          setSelectedCodes([]);
        } else {
          setSelectedCodes(positions.map((p) => p.code));
        }
        return;
      }

      setSelectedCodes(
        selectedCodes.includes(value)
          ? selectedCodes.filter((c) => c !== value)
          : [...selectedCodes, value],
      );
    },
    [selectedCodes, positions, setSelectedCodes],
  );

  const handleSave = useCallback(async () => {
    const result = await save();
    if (result.success) {
      toast.success(result.message, {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    } else {
      toast.error(result.message, {
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      });
    }
  }, [save]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1080px] space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card className="rounded-xl border border-border/50 bg-card p-6 shadow-[var(--shadow-2)]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-48" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground">
            Ajusta el comportamiento general del sistema
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings section: Roles de Descanso */}
      <Card className="rounded-xl border border-border/50 bg-card shadow-[var(--shadow-2)]">
        <div className="p-6">
          {/* Section header */}
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Roles de Descanso
            </h2>
            {selectedCount > 0 && (
              <Badge variant="secondary" className="cursor-default text-[11px]">
                {selectedCount}
              </Badge>
            )}
          </div>

          {/* Info message */}
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Solo los empleados cuyo puesto esté en esta lista aparecerán
              disponibles al asignar días en un rol de descanso.
            </p>
          </div>

          {/* Multi-select field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="rest-role-positions"
              className="text-sm font-medium"
            >
              Puestos permitidos
            </Label>
            <Select
              value={selectedCodes.length > 0 ? selectedCodes[0] : ""}
              onValueChange={handleValueChange}
            >
              <SelectTrigger id="rest-role-positions" className="min-w-[280px]">
                <SelectValue
                  placeholder="Seleccionar puestos..."
                  className="text-muted-foreground/60"
                >
                  {selectedCodes.length > 0
                    ? `${selectedCodes.length} puesto${selectedCodes.length !== 1 ? "s" : ""} seleccionado${selectedCodes.length !== 1 ? "s" : ""}`
                    : "Seleccionar puestos..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[280px]">
                {/* Select all / Deselect all */}
                <SelectItem value="__select_all__">
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    {selectedCodes.length === positions.length
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </span>
                </SelectItem>
                <div className="mx-2 my-1 h-px bg-border" />
                {positions.map((position) => (
                  <SelectItem key={position.code} value={position.code}>
                    <span className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedCodes.includes(position.code)}
                        className="pointer-events-none size-4"
                      />
                      <span>{position.name}</span>
                    </span>
                  </SelectItem>
                ))}
                {positions.length === 0 && (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No hay puestos disponibles
                  </div>
                )}
              </SelectContent>
            </Select>
            {selectedCodes.length > 0 && (
              <p
                className="text-xs text-muted-foreground/70 truncate max-w-[500px]"
                title={selectedLabels}
              >
                {selectedLabels}
              </p>
            )}
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Action bar */}
        <div className="flex items-center justify-end px-6 py-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="cursor-pointer gap-1.5"
          >
            {isSaving ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar configuración
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
