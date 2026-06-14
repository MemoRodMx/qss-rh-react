import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { restRoleService } from "../services/restRoleService";
import { OptimoTab } from "../components/OptimoTab";
import { AsignacionTab } from "../components/AsignacionTab";
import { useRestRole } from "../hooks/useRestRole";

export default function RestRoleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState("optimo");
  const [serverError, setServerError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hook = useRestRole();

  useEffect(() => {
    hook.setBusinessUnit(hook.type.toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hook.type]);

  useEffect(() => {
    hook.loadCatalogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load existing role for edit mode
  useEffect(() => {
    if (!id) return;
    restRoleService.getById(id).then((data) => {
      hook.setType(data.type);
      hook.setBusinessUnit(data.business_unit);
      hook.loadRoleData(
        data.direct_supervisor_id?._id || data.direct_supervisor_id,
        data.shift_id?._id || data.shift_id,
        data.type,
      );
      if (data.descansos) {
        hook.setDescansos(data.descansos);
      }
      setInitialLoading(false);
    }).catch(() => setInitialLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setServerError(null);

    if (!hook.supervisorId || !hook.shiftId) {
      setActiveTab("optimo");
      toast.error("Faltan datos", {
        description: "Seleccione un jefe directo y un turno antes de guardar.",
      });
      return;
    }

    if (!hook.validateAssignmentValues()) {
      setActiveTab("asignacion");
      toast.error("Valores inválidos", {
        description: "Corrija los valores marcados en rojo antes de guardar.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await hook.saveAsignacionTab();
      hook.clearAssignmentErrors();
      toast.success("Rol de descanso guardado", {
        description: "El rol de descanso fue guardado correctamente.",
      });
      navigate("/rest-roles");
    } catch (err: unknown) {
      setServerError(hook.getErrorMessage(err));
      toast.error("Error al guardar", {
        description: "Revise los errores mostrados en el formulario.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="animate-fade-in max-w-[1400px]">
        <div className="h-6 w-48 bg-muted/40 rounded animate-pulse mb-4" />
        <div className="h-4 w-96 bg-muted/40 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Modificar rol de descanso" : "Agregar rol de descanso"}
        </h1>
        <p className="text-muted-foreground">
          Gestión de roles de descanso y asignación de empleados
        </p>
      </div>

      {serverError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {serverError}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="optimo" className="cursor-pointer">
            Óptimo del rol de descanso
          </TabsTrigger>
          <TabsTrigger value="asignacion" className="cursor-pointer">
            Asignación de empleados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="optimo">
          <OptimoTab
            supervisorId={hook.supervisorId}
            onSupervisorChange={hook.setSupervisor}
            type={hook.type}
            onTypeChange={(t) => hook.setType(t)}
            businessUnit={hook.businessUnit}
            onBusinessUnitChange={hook.setBusinessUnit}
            shiftId={hook.shiftId}
            onShiftChange={hook.setShiftId}
            week={hook.week}
            optimalRows={hook.optimalRows}
            optimoTotals={hook.optimoTotals}
            descansos={hook.descansos}
            onDescansosChange={hook.setDescansos}
            loading={hook.loading}
          />
        </TabsContent>

        <TabsContent value="asignacion">
          <AsignacionTab
            type={hook.type}
            shiftId={hook.shiftId}
            employees={hook.sortedEmployees}
            optimoTotals={hook.optimoTotals}
            assignments={hook.assignments}
            observations={hook.observations}
            onAssignmentChange={hook.updateAssignment}
            onObservationChange={hook.updateObservation}
            supervisorId={hook.supervisorId}
            assignmentErrors={hook.assignmentErrors}
            validValuesInfo={hook.validValuesInfo}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={() => navigate("/rest-roles")}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
