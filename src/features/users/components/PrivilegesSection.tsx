import { useState, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PRIVILEGE_RESOURCES, PRIV_OPS } from "../types";
import {
  Building2,
  Wallet,
  Users,
  Calendar,
  CalendarClock,
  IdCard,
  Book,
  User,
  Cog,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  Wallet,
  Users,
  Calendar,
  CalendarClock,
  IdCard,
  Book,
  User,
  Cog,
};

interface PrivilegesSectionProps {
  initialValues?: Record<string, boolean>;
  onChange?: (values: Record<string, boolean>) => void;
}

function buildDefaultValues(
  overrides?: Record<string, boolean>,
): Record<string, boolean> {
  const values: Record<string, boolean> = {};
  for (const res of PRIVILEGE_RESOURCES) {
    for (const op of PRIV_OPS) {
      const key = `resources.${res.key}.${op}`;
      values[key] = overrides?.[key] ?? true;
    }
  }
  return values;
}

export function PrivilegesSection({
  initialValues,
  onChange,
}: PrivilegesSectionProps) {
  const [privilegeValues, setPrivilegeValues] = useState<
    Record<string, boolean>
  >(() => buildDefaultValues(initialValues));

  const updatePrivilege = useCallback(
    (key: string, op: string, value: boolean) => {
      setPrivilegeValues((prev) => {
        const fieldKey = `resources.${key}.${op}`;
        const newValues = { ...prev, [fieldKey]: value };
        onChange?.(newValues);
        return newValues;
      });
    },
    [onChange],
  );

  const resourceCheckState = useCallback(
    (key: string): "all" | "some" | "none" => {
      const checked = PRIV_OPS.filter(
        (op) => privilegeValues[`resources.${key}.${op}`] === true,
      ).length;
      if (checked === PRIV_OPS.length) return "all";
      return checked > 0 ? "some" : "none";
    },
    [privilegeValues],
  );

  const allCheckState = useCallback((): "all" | "some" | "none" => {
    const total = PRIVILEGE_RESOURCES.length * PRIV_OPS.length;
    const checked = PRIVILEGE_RESOURCES.reduce(
      (acc, res) =>
        acc +
        PRIV_OPS.filter(
          (op) => privilegeValues[`resources.${res.key}.${op}`] === true,
        ).length,
      0,
    );
    if (checked === total) return "all";
    return checked > 0 ? "some" : "none";
  }, [privilegeValues]);

  const setResourceValues = useCallback(
    (key: string, value: boolean) => {
      setPrivilegeValues((prev) => {
        const newValues = { ...prev };
        for (const op of PRIV_OPS) {
          newValues[`resources.${key}.${op}`] = value;
        }
        onChange?.(newValues);
        return newValues;
      });
    },
    [onChange],
  );

  const setAllValues = useCallback(
    (value: boolean) => {
      const newValues: Record<string, boolean> = {};
      for (const res of PRIVILEGE_RESOURCES) {
        for (const op of PRIV_OPS) {
          newValues[`resources.${res.key}.${op}`] = value;
        }
      }
      setPrivilegeValues(newValues);
      onChange?.(newValues);
    },
    [onChange],
  );

  const allState = allCheckState();

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-1">
        Privilegios del Dashboard
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Define los módulos a los que este usuario tendrá acceso en el panel de
        administración.
      </p>

      {/* Select all */}
      <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-primary/5 border border-primary/20">
        <Checkbox
          id="privileges_all"
          checked={allState === "all"}
          data-indeterminate={allState === "some" || undefined}
          onCheckedChange={(checked) => setAllValues(checked === true)}
          className="cursor-pointer"
        />
        <Label
          htmlFor="privileges_all"
          className="text-xs font-semibold text-foreground cursor-pointer"
        >
          Seleccionar todos los privilegios
        </Label>
      </div>

      {/* Privilege grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRIVILEGE_RESOURCES.map((resource) => {
          const IconComponent = ICON_MAP[resource.icon] || Cog;
          const state = resourceCheckState(resource.key);

          return (
            <div
              key={resource.key}
              className="border border-border/50 rounded-lg p-3 bg-card hover:border-primary/50 transition-colors"
            >
              {/* Resource header */}
              <div
                className="flex items-center gap-2 pb-2 mb-2 border-b border-border/40 cursor-pointer"
                onClick={() => setResourceValues(resource.key, state !== "all")}
              >
                <Checkbox
                  id={`all_${resource.key}`}
                  checked={state === "all"}
                  data-indeterminate={state === "some" || undefined}
                  onCheckedChange={(checked) =>
                    setResourceValues(resource.key, checked === true)
                  }
                  className="cursor-pointer"
                />
                <IconComponent className="h-3.5 w-3.5 text-primary" />
                <Label
                  htmlFor={`all_${resource.key}`}
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  {resource.label}
                </Label>
              </div>

              {/* Operations */}
              <div className="flex flex-col gap-1.5">
                {PRIV_OPS.map((op) => {
                  const fieldKey = `resources.${resource.key}.${op}`;
                  const opLabels: Record<string, string> = {
                    view: "Ver",
                    create: "Crear",
                    edit: "Editar",
                    delete: "Eliminar",
                  };

                  return (
                    <label
                      key={fieldKey}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Checkbox
                        id={fieldKey}
                        checked={privilegeValues[fieldKey] === true}
                        onCheckedChange={(checked) =>
                          updatePrivilege(resource.key, op, checked === true)
                        }
                        className="cursor-pointer"
                      />
                      <span>{opLabels[op]}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
