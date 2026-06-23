import { useState, useCallback } from "react";
import { employeeService } from "../services/employeeService";
import type { CatalogOption, BankOption } from "../types";

export function useEmployeeFormCatalogs() {
  const [positions, setPositions] = useState<
    Array<{ code: string; name: string; description?: string }>
  >([]);
  const [shifts, setShifts] = useState<Array<{ code: string; name: string }>>(
    [],
  );
  const [areas, setAreas] = useState<CatalogOption[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [states, setStates] = useState<CatalogOption[]>([]);
  const [catalogsError, setCatalogsError] = useState<string | null>(null);

  const loadCatalogs = useCallback(async () => {
    setCatalogsError(null);
    try {
      const [areasData, positionsData, shiftsData, banksData, statesData] =
        await Promise.all([
          employeeService.listAreas(),
          employeeService.listPositions(),
          employeeService.listShifts(),
          employeeService.listBanks(),
          employeeService.listStates(),
        ]);
      setAreas(areasData);
      setPositions(positionsData);
      setShifts(shiftsData);
      setBanks(banksData);
      setStates(statesData);
    } catch {
      setCatalogsError("Error al cargar datos auxiliares");
    }
  }, []);

  return { positions, shifts, areas, banks, states, catalogsError, loadCatalogs };
}
