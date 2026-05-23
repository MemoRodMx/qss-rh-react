import { useState, useEffect, useCallback } from "react";
import { settingsService } from "../services/settingsService";
import type { PositionOption } from "../types";

interface UseSettingsReturn {
  positions: PositionOption[];
  selectedCodes: string[];
  setSelectedCodes: (codes: string[]) => void;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  save: () => Promise<{ success: boolean; message: string }>;
}

export function useSettings(): UseSettingsReturn {
  const [positions, setPositions] = useState<PositionOption[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [positionsData, configData] = await Promise.all([
          settingsService.listPositions(),
          settingsService.getConfig(),
        ]);
        if (!cancelled) {
          setPositions(positionsData);
          setSelectedCodes(configData);
        }
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar los datos de configuración");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    setIsSaving(true);
    setError(null);
    try {
      await settingsService.saveConfig({ position_ids: selectedCodes });
      return {
        success: true,
        message: "Configuración actualizada exitosamente",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo guardar la configuración";
      setError(message);
      return { success: false, message };
    } finally {
      setIsSaving(false);
    }
  }, [selectedCodes]);

  return {
    positions,
    selectedCodes,
    setSelectedCodes,
    isLoading,
    isSaving,
    error,
    save,
  };
}
