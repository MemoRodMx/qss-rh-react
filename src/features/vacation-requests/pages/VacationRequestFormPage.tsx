import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VacationRequestFormShell } from "../components/VacationRequestFormShell";
import { vacationRequestService } from "../services/vacationRequestService";
import type { VacationRequest } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

export function VacationRequestFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const mode = id ? "edit" : "create";

  const [initialData, setInitialData] =
    useState<Partial<VacationRequest> | null>(null);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      setIsLoading(true);
      setLoadError(null);

      vacationRequestService
        .getById(id)
        .then((data) => {
          setInitialData(data);
        })
        .catch(() => {
          setLoadError("Error al cargar la solicitud");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, mode]);

  const handleSuccess = () => {
    navigate("/vacation-requests");
  };

  const handleCancel = () => {
    navigate("/vacation-requests");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1080px] animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive max-w-[1080px]">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{loadError}</span>
      </div>
    );
  }

  return (
    <VacationRequestFormShell
      mode={mode}
      initialValues={
        initialData
          ? {
              _id: initialData._id,
              plant_id: initialData.plant_id,
              shift_id: initialData.shift_id,
              exercise: initialData.exercise,
              worked_vacations: initialData.worked_vacations,
              notes: initialData.notes,
              employee_number: initialData.employee_number,
              employee_name: initialData.employee_name,
              requested_days: initialData.requested_days,
            }
          : undefined
      }
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
