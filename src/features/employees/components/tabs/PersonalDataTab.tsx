import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { FloatLabelPhoneInput } from "@/components/ui/float-label-phone-input";
import { SectionTitle } from "../shared/SectionTitle";
import { SCHOOLING_OPTIONS } from "../../types";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";

type Props = Pick<
  EmployeeFormShellProps,
  "register" | "setValue" | "watch"
>;

export function PersonalDataTab({ register, setValue, watch }: Props) {
  const watchedSchooling = watch("personal_data_schooling");
  const watchedLandline = watch("personal_data_landline_phone_number");
  const watchedMobile = watch("personal_data_mobile_phone_number");
  const watchedEmergency = watch("personal_data_emergency_phone_number");

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Teléfonos de contacto</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FloatLabelPhoneInput
              id="personal_data_landline_phone_number"
              label="Teléfono fijo"
              value={watchedLandline}
              onChange={(val) =>
                setValue("personal_data_landline_phone_number", val)
              }
            />
          </div>
          <div>
            <FloatLabelPhoneInput
              id="personal_data_mobile_phone_number"
              label="Teléfono móvil"
              value={watchedMobile}
              onChange={(val) =>
                setValue("personal_data_mobile_phone_number", val)
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatLabelPhoneInput
              id="personal_data_emergency_phone_number"
              label="Teléfono de emergencia"
              value={watchedEmergency}
              onChange={(val) =>
                setValue("personal_data_emergency_phone_number", val)
              }
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
