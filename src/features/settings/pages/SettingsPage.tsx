import { Settings, Info, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "../hooks/useSettings";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

export function SettingsPage() {
  const {
    areas,
    selectedRecorridoAreaCodes,
    setSelectedRecorridoAreaCodes,
    isLoading,
    isSaving,
    saveRecorridoAreas,
  } = useSettings();

  const areaOptions = areas.map((a) => ({
    value: a.code,
    label: `${a.code} - ${a.name}`,
  }));

  const handleSave = async () => {
    const result = await saveRecorridoAreas();
    if (result.success) {
      toast.success("Configuración guardada", {
        description: result.message,
      });
    } else {
      toast.error("Error", { description: result.message });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1080px] space-y-6 p-6 animate-fade-in">
        <div className="h-6 w-48 bg-muted/40 rounded animate-pulse" />
        <div className="h-4 w-80 bg-muted/40 rounded animate-pulse" />
        <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] space-y-6 p-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
          <Settings className="h-5 w-5 text-cyan-500" />
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

      <div className="rounded-xl border border-border/40 bg-card shadow-[var(--shadow-2)] p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Áreas para roles de recorrido
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define qué áreas deben agruparse al final de la lista de asignación
            en los roles de descanso tipo "Recorrido".
          </p>
        </div>

        <div className="flex items-start gap-3 p-4 text-sm rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-blue-800 dark:text-blue-300">
              ¿Qué hace esta configuración?
            </p>
            <p className="text-blue-700 dark:text-blue-400 text-[13px] leading-relaxed">
              Los empleados que pertenezcan a las áreas seleccionadas aquí
              aparecerán{" "}
              <strong>al final de la lista</strong> en la pestaña "Asignación de
              empleados" de los roles de descanso tipo <strong>Recorrido</strong>.
              Esto permite agrupar visualmente al personal que cubre múltiples
              áreas, facilitando la asignación de recorridos.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Seleccionar áreas
          </label>

          <MultiSelect
            options={areaOptions}
            selected={selectedRecorridoAreaCodes}
            onChange={setSelectedRecorridoAreaCodes}
            placeholder="Seleccionar áreas..."
            searchPlaceholder="Buscar por código o nombre..."
          />

          {selectedRecorridoAreaCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedRecorridoAreaCodes.map((code) => {
                const area = areas.find((a) => a.code === code);
                return (
                  <span
                    key={code}
                    className="inline-flex h-6 items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2.5 text-xs font-medium text-foreground"
                  >
                    {area ? `${code} - ${area.name}` : code}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRecorridoAreaCodes(
                          selectedRecorridoAreaCodes.filter(
                            (c) => c !== code,
                          ),
                        )
                      }
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[180px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar configuración"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
