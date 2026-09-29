import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vacationRequestService } from "../services/vacationRequestService";
import { StatusTimeline } from "../components/StatusTimeline";
import { STATUS_SEVERITY, STATUS_LABELS } from "../types";
import type { VacationRequest, ReviewAction } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Calendar,
  Clock,
  User,
  CalendarCheck,
} from "lucide-react";

function formatEmployeeNumber(num: string): string {
  return `#${num.padStart(6, "0")}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const REVIEW_ACTIONS: {
  action: ReviewAction;
  label: string;
  description: string;
  variant: "default" | "destructive" | "secondary";
  icon: React.ReactNode;
}[] = [
  {
    action: "ACEPTADA",
    label: "Aceptar",
    description: "La solicitud será aprobada.",
    variant: "default",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    action: "RECHAZADA",
    label: "Rechazar",
    description: "La solicitud será rechazada.",
    variant: "destructive",
    icon: <XCircle className="h-4 w-4" />,
  },
  {
    action: "CAMBIO SOLICITADO",
    label: "Solicitar cambios",
    description: "Se solicitarán cambios al solicitante.",
    variant: "secondary",
    icon: <Edit className="h-4 w-4" />,
  },
];

export function VacationRequestReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [request, setRequest] = useState<VacationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Review state
  const [selectedAction, setSelectedAction] = useState<ReviewAction | null>(
    null,
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setLoadError(null);

    vacationRequestService
      .getById(id)
      .then((data) => {
        setRequest(data);
      })
      .catch(() => {
        setLoadError("Error al cargar la solicitud");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleReview = async () => {
    if (!id || !selectedAction) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await vacationRequestService.review(id, {
        action: selectedAction,
        review_notes: reviewNotes.trim() || undefined,
      });
      navigate("/vacation-requests");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setSubmitError(
        err?.response?.data?.message || "Error al procesar la revisión",
      );
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleActionClick = (action: ReviewAction) => {
    setSelectedAction(action);
    setShowConfirm(true);
  };

  const isReviewable =
    request &&
    (request.status === "NUEVA" ||
      request.status === "CAMBIO SOLICITADO" ||
      request.status === "CAMBIOS REALIZADOS");

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
      </div>
    );
  }

  if (loadError || !request) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive max-w-[1080px]">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{loadError || "Solicitud no encontrada"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1080px] animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
          onClick={() => navigate("/vacation-requests")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Revisar solicitud
            </h1>
            <Badge
              variant={STATUS_SEVERITY[request.status] || "secondary"}
              className="cursor-pointer text-[10px]"
            >
              {STATUS_LABELS[request.status] || request.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Revisa los detalles de la solicitud y toma una decisión.
          </p>
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* ── Employee Info Card ─────────────────────────────────────────────── */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-primary" />
            Información del empleado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Empleado</Label>
              <p className="text-sm font-medium text-foreground">
                {request.employee_name || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatEmployeeNumber(request.employee_number)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Planta</Label>
              <p className="text-sm text-foreground">
                {request.plant_name || request.plant_id}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Turno</Label>
              <p className="text-sm text-foreground">
                {request.shift_name || request.shift_id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Request Details Card ───────────────────────────────────────────── */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Detalles de la solicitud
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-xs text-muted-foreground">Ejercicio</Label>
              <p className="text-sm font-medium text-foreground">
                {request.exercise}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Vacaciones trabajadas
              </Label>
              <p className="text-sm text-foreground">
                {request.worked_vacations ? "Sí" : "No"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Días solicitados
              </Label>
              <p className="text-sm font-medium text-foreground">
                {request.requested_days?.length || 0} día
                {request.requested_days?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Requested days list */}
          {request.requested_days?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {request.requested_days.map((day, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-1"
                >
                  <Calendar className="h-3 w-3" />
                  {formatDate(day)}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">Notas</Label>
              <p className="text-sm text-foreground bg-muted/30 rounded-md px-3 py-2 mt-1">
                {request.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Status History Card ────────────────────────────────────────────── */}
      <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
        <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-primary" />
            Historial de cambios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <StatusTimeline entries={request.status_log || []} showAll={true} />
        </CardContent>
      </Card>

      {/* ── Review Actions ─────────────────────────────────────────────────── */}
      {isReviewable && (
        <Card className="border-border/40 bg-card shadow-[var(--shadow-2)]">
          <CardHeader className="bg-gradient-to-b from-primary/5 to-primary/[0.02] border-b-2 border-primary/20 px-5 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Edit className="h-4 w-4 text-primary" />
              Acción de revisión
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Notes */}
            <div>
              <Label htmlFor="review_notes">
                Notas de revisión{" "}
                <span className="text-muted-foreground font-normal">
                  (obligatorio para rechazar o solicitar cambios)
                </span>
              </Label>
              <Textarea
                id="review_notes"
                rows={3}
                placeholder="Añade comentarios sobre tu decisión..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {REVIEW_ACTIONS.map((action) => {
                const needsNotes =
                  action.action === "RECHAZADA" ||
                  action.action === "CAMBIO SOLICITADO";
                const isDisabled = needsNotes && !reviewNotes.trim();

                return (
                  <Button
                    key={action.action}
                    variant={action.variant}
                    size="sm"
                    className="cursor-pointer gap-1.5"
                    disabled={isDisabled}
                    onClick={() => handleActionClick(action.action)}
                    title={
                      isDisabled
                        ? "Debe agregar notas de revisión"
                        : action.description
                    }
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Confirmation Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        dismissible={false}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction === "ACEPTADA" && (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              )}
              {selectedAction === "RECHAZADA" && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {selectedAction === "CAMBIO SOLICITADO" && (
                <Edit className="h-5 w-5 text-amber-500" />
              )}
              Confirmar acción
            </DialogTitle>
            <DialogDescription>
              {selectedAction === "ACEPTADA" &&
                "¿Estás seguro de aceptar esta solicitud de vacaciones?"}
              {selectedAction === "RECHAZADA" &&
                "¿Estás seguro de rechazar esta solicitud de vacaciones?"}
              {selectedAction === "CAMBIO SOLICITADO" &&
                "¿Estás seguro de solicitar cambios en esta solicitud?"}
            </DialogDescription>
          </DialogHeader>

          {reviewNotes.trim() && (
            <div className="rounded-lg bg-muted/30 p-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">
                Notas de revisión:
              </p>
              <p className="text-foreground">{reviewNotes.trim()}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant={
                selectedAction === "ACEPTADA"
                  ? "default"
                  : selectedAction === "RECHAZADA"
                    ? "destructive"
                    : "secondary"
              }
              size="sm"
              className="cursor-pointer"
              onClick={handleReview}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Procesando..."
                : `Confirmar ${
                    selectedAction === "ACEPTADA"
                      ? "aceptación"
                      : selectedAction === "RECHAZADA"
                        ? "rechazo"
                        : "cambios"
                  }`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
