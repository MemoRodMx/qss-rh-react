import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
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
  const watchedSchooling = watch("personal_data_schooling");

  return (
    <div className="space-y-8">
      {/* ── Teléfonos de contacto ────────────────────────────────────────── */}
      <div>
        <SectionTitle>Teléfonos de contacto</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FloatLabelInput
              id="personal_data_landline_phone_number"
              label="Teléfono fijo"
              {...register("personal_data_landline_phone_number")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="personal_data_mobile_phone_number"
              label="Teléfono móvil"
              {...register("personal_data_mobile_phone_number")}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatLabelInput
              id="personal_data_emergency_phone_number"
              label="Teléfono de emergencia"
              {...register("personal_data_emergency_phone_number")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="personal_data_relationship"
              label="Parentesco (emergencia)"
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
            <FloatLabelSelect
              id="personal_data_schooling"
              label="Escolaridad"
              value={watchedSchooling}
              hasValue={!!watchedSchooling}
              onValueChange={(val) =>
                setValue("personal_data_schooling", val ?? "")
              }
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  SCHOOLING_OPTIONS.find((s) => s.value === value)?.label ??
                  value
                );
              }}
            >
              {SCHOOLING_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
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
