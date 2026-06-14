import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { customerService } from "../services/customerService";
import type { CsfData } from "../types";
import {
  FileUp,
  FileCheck,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";

interface CsfUploaderProps {
  onApply: (data: CsfData) => void;
  disabled?: boolean;
}

type UploadState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; data: CsfData }
  | { phase: "error"; message: string };

export function CsfUploader({ onApply, disabled }: CsfUploaderProps) {
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setState({
        phase: "error",
        message: "El archivo debe ser un PDF.",
      });
      return;
    }

    setState({ phase: "loading" });

    try {
      const data = await customerService.parseCsf(file);

      if (!data.rfc && !data.legal_name) {
        setState({
          phase: "error",
          message:
            "No se encontraron datos fiscales en el documento. Verifica que sea una constancia de situación fiscal válida.",
        });
        return;
      }

      setState({ phase: "success", data });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setState({
        phase: "error",
        message:
          error?.response?.data?.message ??
          "Error al procesar el archivo. Intenta de nuevo.",
      });
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled || state.phase === "loading") return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, state.phase, handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (e.target) e.target.value = "";
    },
    [handleFile],
  );

  const triggerFilePick = () => {
    if (disabled || state.phase === "loading") return;
    fileInputRef.current?.click();
  };

  const handleApply = () => {
    if (state.phase === "success") {
      onApply(state.data);
    }
  };

  const handleReset = () => {
    setState({ phase: "idle" });
  };

  if (state.phase === "success") {
    const hasAddress =
      state.data.address.street ||
      state.data.address.number ||
      state.data.address.colony ||
      state.data.address.city ||
      state.data.address.state ||
      state.data.address.zipcode;

    return (
      <Card className="rounded-xl border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                Datos extraídos correctamente
              </p>
              <div className="mt-2 space-y-1 text-xs text-emerald-600/80 dark:text-emerald-400/70">
                {state.data.rfc && (
                  <p>
                    <span className="font-medium">RFC:</span> {state.data.rfc}
                  </p>
                )}
                {state.data.legal_name && (
                  <p className="truncate">
                    <span className="font-medium">Razón social:</span>{" "}
                    {state.data.legal_name}
                  </p>
                )}
                {hasAddress && (
                  <p>
                    <span className="font-medium">Dirección:</span> extraída
                  </p>
                )}
                {!state.data.rfc && !state.data.legal_name && !hasAddress && (
                  <p>No se encontraron datos para extraer.</p>
                )}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer shrink-0 text-muted-foreground hover:text-foreground"
            onClick={handleReset}
            title="Quitar"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-500/20">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={handleApply}
          >
            Aplicar datos
          </Button>
          <span className="text-[11px] text-muted-foreground">
            Se autocompletarán RFC, razón social y dirección.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFilePick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") triggerFilePick();
        }}
        className={`rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          disabled || state.phase === "loading"
            ? "border-border/30 bg-muted/10 opacity-50 pointer-events-none"
            : "border-primary/30 bg-primary/[0.02] hover:border-primary/50 hover:bg-primary/[0.04]"
        } p-5 text-center`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleInputChange}
          className="hidden"
        />

        {state.phase === "loading" ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              Analizando documento...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FileUp className="h-7 w-7 text-primary/60" />
            <p className="text-sm font-medium text-muted-foreground">
              Arrastra la constancia fiscal (PDF) o haz clic para cargarla
            </p>
            <span className="text-[11px] text-muted-foreground/60">
              Solo archivos PDF · Máx. 5 MB
            </span>
          </div>
        )}
      </div>

      {state.phase === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{state.message}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer shrink-0"
            onClick={handleReset}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
