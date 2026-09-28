import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  PRIVILEGE_RESOURCES,
  PRIV_OPS,
  type PrivilegeOps,
} from "../types";
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

const OP_LABELS: Record<string, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
};

interface PrivilegesSectionProps {
  value: Record<string, PrivilegeOps>;
  onChange: (value: Record<string, PrivilegeOps>) => void;
}

function getResourceState(
  value: Record<string, PrivilegeOps>,
  key: string,
): "all" | "some" | "none" {
  const ops = value[key] ?? {};
  const checked = PRIV_OPS.filter((op) => ops[op] === true).length;
  if (checked === PRIV_OPS.length) return "all";
  return checked > 0 ? "some" : "none";
}

function getAllState(
  value: Record<string, PrivilegeOps>,
): "all" | "some" | "none" {
  const total = PRIVILEGE_RESOURCES.length * PRIV_OPS.length;
  const checked = PRIVILEGE_RESOURCES.reduce(
    (acc, res) =>
      acc + PRIV_OPS.filter((op) => value[res.key]?.[op] === true).length,
    0,
  );
  if (checked === total) return "all";
  return checked > 0 ? "some" : "none";
}

export function PrivilegesSection({ value, onChange }: PrivilegesSectionProps) {
  const setOp = (key: string, op: string, checked: boolean) => {
    onChange({
      ...value,
      [key]: { ...(value[key] ?? {}), [op]: checked },
    });
  };

  const setResource = (key: string, checked: boolean) => {
    onChange({
      ...value,
      [key]: { view: checked, create: checked, edit: checked, delete: checked },
    });
  };

  const setAll = (checked: boolean) => {
    const next: Record<string, PrivilegeOps> = {};
    for (const res of PRIVILEGE_RESOURCES) {
      next[res.key] = {
        view: checked,
        create: checked,
        edit: checked,
        delete: checked,
      };
    }
    onChange(next);
  };

  const allState = getAllState(value);

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
          checked={allState === "all" || (allState === "some" && "indeterminate")}
          onCheckedChange={(checked) => setAll(checked === true)}
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
          const state = getResourceState(value, resource.key);

          return (
            <div
              key={resource.key}
              className="border border-border/50 rounded-lg p-3 bg-card hover:border-primary/50 transition-colors"
            >
              {/* Resource header */}
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border/40">
                <Checkbox
                  id={`all_${resource.key}`}
                  checked={
                    state === "all" || (state === "some" && "indeterminate")
                  }
                  onCheckedChange={(checked) =>
                    setResource(resource.key, checked === true)
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
                  const isChecked = value[resource.key]?.[op] === true;

                  return (
                    <label
                      key={fieldKey}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Checkbox
                        id={fieldKey}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          setOp(resource.key, op, checked === true)
                        }
                        className="cursor-pointer"
                      />
                      <span>{OP_LABELS[op]}</span>
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
