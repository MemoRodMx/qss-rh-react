import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCHOOLING_OPTIONS } from "../../types";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";

type Props = Pick<
  EmployeeFormShellProps,
  "register" | "setValue" | "watch" | "errors"
>;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 pb-1.5 border-b border-border/30">
      {children}
    </h3>
  );
}

export function PersonalDataTab({ register, setValue, watch }: Props) {
  return (
    <div className="space-y-8">
      {/* ── Teléfonos de contacto ────────────────────────────────────────── */}
      <div>
        <SectionTitle>Teléfonos de contacto</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="personal_data_landline_phone_number">
              Teléfono fijo
            </Label>
            <Input
              id="personal_data_landline_phone_number"
              {...register("personal_data_landline_phone_number")}
            />
          </div>
          <div>
            <Label htmlFor="personal_data_mobile_phone_number">
              Teléfono móvil
            </Label>
            <Input
              id="personal_data_mobile_phone_number"
              {...register("personal_data_mobile_phone_number")}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="personal_data_emergency_phone_number">
              Teléfono de emergencia
            </Label>
            <Input
              id="personal_data_emergency_phone_number"
              {...register("personal_data_emergency_phone_number")}
            />
          </div>
          <div>
            <Label htmlFor="personal_data_relationship">
              Parentesco (emergencia)
            </Label>
            <Input
              id="personal_data_relationship"
              {...register("personal_data_relationship")}
            />
          </div>
        </div>
      </div>

      {/* ── Información adicional ────────────────────────────────────────── */}
      <div>
        <SectionTitle>Información adicional</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="personal_data_schooling">Escolaridad</Label>
            <Select
              value={watch("personal_data_schooling")}
              onValueChange={(val) =>
                setValue("personal_data_schooling", val ?? "")
              }
            >
              <SelectTrigger id="personal_data_schooling">
                <SelectValue placeholder="Seleccionar">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar";
                    const opt = SCHOOLING_OPTIONS.find(
                      (s) => s.value === value,
                    );
                    return opt?.label ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SCHOOLING_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={watch("personal_data_house_owner")}
                onCheckedChange={(checked) =>
                  setValue("personal_data_house_owner", checked === true)
                }
              />
              <span className="text-sm text-muted-foreground">
                Propietario de vivienda
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
