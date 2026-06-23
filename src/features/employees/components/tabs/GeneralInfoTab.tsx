import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import { FloatLabelDateInput } from "@/components/ui/float-label-date-input";
import { SectionTitle } from "../shared/SectionTitle";
import { getNestedError } from "../../hooks/useEmployeeForm";
import { formatEmployeeNumber } from "@/lib/utils";
import { GENRE_OPTIONS } from "../../types";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";

type Props = Pick<
  EmployeeFormShellProps,
  "register" | "setValue" | "watch" | "errors" | "states" | "birthMunicipalities"
>;

export function GeneralInfoTab({
  register,
  setValue,
  watch,
  errors,
  states,
  birthMunicipalities,
}: Props) {
  const errorsRecord = errors as unknown as Record<string, unknown>;

  const watchedGenre = watch("genre");
  const watchedBirthPlace = watch("birth_place");
  const watchedCityOfBirth = watch("city_of_birth");
  const watchedBirthDate = watch("birth_date");
  const watchedEmployeeNumber = watch("employee_number");

  const getError = (fieldName: string) =>
    getNestedError(errorsRecord, fieldName)?.message;

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Número de empleado</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              id="employee_number"
              value={formatEmployeeNumber(watchedEmployeeNumber)}
              placeholder="Auto-asignado"
              readOnly
              className="bg-muted/30 tabular-nums"
            />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Nombre completo</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FloatLabelInput
              id="name"
              label="Nombre(s)"
              {...register("name")}
              error={getError("name")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="surname"
              label="Apellido paterno"
              {...register("surname")}
              error={getError("surname")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="lastname"
              label="Apellido materno"
              {...register("lastname")}
            />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Datos de nacimiento y género</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatLabelSelect
              id="genre"
              label="Género"
              value={watchedGenre}
              hasValue={!!watchedGenre}
              onValueChange={(val) =>
                setValue("genre", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                return (
                  GENRE_OPTIONS.find((g) => g.value === value)?.label ?? value
                );
              }}
              error={getError("genre")}
            >
              {GENRE_OPTIONS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelDateInput
              id="birth_date"
              label="Fecha de nacimiento"
              value={watchedBirthDate}
              onChange={(val) =>
                setValue("birth_date", val, { shouldValidate: true })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <FloatLabelSelect
              id="birth_place"
              label="Lugar de nacimiento"
              value={watchedBirthPlace}
              hasValue={!!watchedBirthPlace}
              onValueChange={(val) =>
                setValue("birth_place", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                const state = states.find((s) => s.code === value);
                return state?.name ?? value;
              }}
            >
              {states.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelSelect
              id="city_of_birth"
              label="Ciudad de nacimiento"
              value={watchedCityOfBirth}
              hasValue={!!watchedCityOfBirth}
              disabled={!watchedBirthPlace || birthMunicipalities.length === 0}
              onValueChange={(val) =>
                setValue("city_of_birth", val ?? "", { shouldValidate: true })
              }
              valueRenderer={(value) => {
                if (!value) return "";
                const mun = birthMunicipalities.find((m) => m.code === value);
                return mun?.name ?? value;
              }}
            >
              {birthMunicipalities.map((m) => (
                <SelectItem key={m.code} value={m.code}>
                  {m.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Identificación fiscal y seguridad social</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FloatLabelInput
              id="rfc"
              label="RFC"
              {...register("rfc")}
              className="uppercase"
              error={getError("rfc")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="curp"
              label="CURP"
              {...register("curp")}
              className="uppercase"
              error={getError("curp")}
            />
          </div>
          <div>
            <FloatLabelInput id="nss" label="NSS" {...register("nss")} />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Otros</SectionTitle>
        <div className="flex items-center gap-2">
          <Checkbox
            id="resident"
            checked={watch("resident")}
            onCheckedChange={(checked) =>
              setValue("resident", checked === true)
            }
          />
          <label
            htmlFor="resident"
            className="cursor-pointer text-sm font-normal"
          >
            Residente en México
          </label>
        </div>
      </div>
    </div>
  );
}
