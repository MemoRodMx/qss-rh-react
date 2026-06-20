import { useState, useEffect, useCallback } from "react";
import { settingsService } from "../services/settingsService";
import type { PositionOption, AreaOption } from "../types";

interface UseSettingsReturn {
  positions: PositionOption[];
  selectedCodes: string[];
  setSelectedCodes: (codes: string[]) => void;
  areas: AreaOption[];
  selectedRecorridoAreaCodes: string[];
  setSelectedRecorridoAreaCodes: (codes: string[]) => void;
  ccEmails: string[];
  setCcEmails: (emails: string[]) => void;
  companyId: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  save: () => Promise<{ success: boolean; message: string }>;
  saveSettings: () => Promise<{ success: boolean; message: string }>;
}

export function useSettings(): UseSettingsReturn {
  const [positions, setPositions] = useState<PositionOption[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [selectedRecorridoAreaCodes, setSelectedRecorridoAreaCodes] = useState<
    string[]
  >([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [positionsData, areasData, companyRes] = await Promise.all([
          settingsService.listPositions(),
          settingsService.listAreas(),
          import("@/lib/api").then((m) => m.default.get("/companies/list")),
        ]);
        if (cancelled) return;

        setPositions(positionsData);
        setAreas(areasData);

        const companyList = Array.isArray(companyRes.data)
          ? companyRes.data
          : companyRes.data?.data ?? [];
        const cId = companyList.length > 0 ? companyList[0]._id : "";
        setCompanyId(cId);

        if (cId) {
          const config = await settingsService.getConfig(cId);
          setSelectedRecorridoAreaCodes(config.recorrido_area_codes ?? []);
          setCcEmails(config.rest_role_notification_cc_emails ?? []);
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
    return { success: true, message: "OK" };
  }, []);

  const saveSettings = useCallback(async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    if (!companyId) {
      return { success: false, message: "No se encontró la empresa" };
    }
    setIsSaving(true);
    setError(null);
    try {
      await settingsService.saveConfig({
        company_id: companyId,
        recorrido_area_codes: selectedRecorridoAreaCodes,
        rest_role_notification_cc_emails: ccEmails,
      });
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
  }, [companyId, selectedRecorridoAreaCodes, ccEmails]);

  return {
    positions,
    selectedCodes,
    setSelectedCodes,
    areas,
    selectedRecorridoAreaCodes,
    setSelectedRecorridoAreaCodes,
    ccEmails,
    setCcEmails,
    companyId,
    isLoading,
    isSaving,
    error,
    save,
    saveSettings,
  };
}
