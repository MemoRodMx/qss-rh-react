import { useState, useRef, type KeyboardEvent } from "react";
import { Settings, Info, X, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "../hooks/useSettings";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SettingsPage() {
  const {
    areas,
    selectedRecorridoAreaCodes,
    setSelectedRecorridoAreaCodes,
    ccEmails,
    setCcEmails,
    isLoading,
    isSaving,
    saveSettings,
  } = useSettings();

  const areaOptions = areas.map((a) => ({
    value: a.code,
    label: `${a.code} - ${a.name}`,
  }));

  const handleSave = async () => {
    const result = await saveSettings();
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
      <div className="max-w-[1080px] space-y-6 p-6 animate-fade-in">
        <div className="h-6 w-48 bg-muted/40 rounded animate-pulse" />
        <div className="h-4 w-80 bg-muted/40 rounded animate-pulse" />
        <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
        <div className="h-64 bg-muted/20 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-[1080px] space-y-6 p-6 animate-fade-in">
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
      </div>

      <div className="rounded-xl border border-border/40 bg-card shadow-[var(--shadow-2)] p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Lista de correo para notificaciones
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define los correos electrónicos que recibirán una copia (CC) de
            cada notificación de creación de roles de descanso.
          </p>
        </div>

        <div className="flex items-start gap-3 p-4 text-sm rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-amber-800 dark:text-amber-300">
              ¿Qué hace esta configuración?
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-[13px] leading-relaxed">
              Cada vez que se cree un rol de descanso, el sistema enviará una
              notificación por correo electrónico al{" "}
              <strong>jefe directo del empleado que funge como supervisor del rol</strong>.
              Las direcciones de correo agregadas aquí recibirán una{" "}
              <strong>copia carbón (CC)</strong> de cada una de esas
              notificaciones. Esto permite mantener informados a gerentes,
              coordinadores u otras áreas interesadas sin ser los destinatarios
              principales. La lista de CC puede editarse en cualquier momento y
              los cambios aplican a las notificaciones futuras.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Agregar correos para CC
          </label>

          <EmailTagsInput emails={ccEmails} onChange={setCcEmails} />

          {ccEmails.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {ccEmails.length} correo{ccEmails.length > 1 ? "s" : ""} en la
              lista de CC
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
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
  );
}

function EmailTagsInput({
  emails,
  onChange,
}: {
  emails: string[];
  onChange: (emails: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addEmail = (raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;

    if (!EMAIL_REGEX.test(trimmed)) {
      showError(`"${trimmed}" no es un correo válido`);
      return;
    }

    if (emails.includes(trimmed)) {
      showError(`"${trimmed}" ya está en la lista`);
      return;
    }

    onChange([...emails, trimmed]);
    setInputValue("");
    setError("");
  };

  const showError = (msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(""), 4000);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail(inputValue);
    } else if (e.key === ",") {
      e.preventDefault();
      addEmail(inputValue.replace(/,/g, ""));
    } else if (e.key === "Backspace" && inputValue === "" && emails.length > 0) {
      onChange(emails.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(",") || pasted.includes(";")) {
      e.preventDefault();
      const candidates = pasted
        .split(/[,;]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const newEmails = [...emails];
      for (const c of candidates) {
        if (EMAIL_REGEX.test(c) && !newEmails.includes(c)) {
          newEmails.push(c);
        }
      }
      onChange(newEmails);
    }
  };

  const remove = (email: string) => {
    onChange(emails.filter((e) => e !== email));
  };

  return (
    <div>
      <div
        className="flex min-h-[44px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-border/40 bg-background px-3 py-2 ring-offset-background focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.focus()}
      >
        {emails.map((email) => (
          <Badge
            key={email}
            variant="secondary"
            className="h-7 gap-1 pl-2.5 pr-1.5 text-xs font-normal"
          >
            <Mail className="h-3 w-3 text-muted-foreground" />
            {email}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(email);
              }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={emails.length === 0 ? "ej. gerente@empresa.com" : ""}
          className="flex-1 min-w-[160px] bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
