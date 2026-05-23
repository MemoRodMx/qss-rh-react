import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";

type Props = Pick<
  EmployeeFormShellProps,
  | "register"
  | "setValue"
  | "watch"
  | "errors"
  | "states"
  | "municipalities"
  | "colonies"
>;

export function AddressTab({
  register,
  setValue,
  watch,
  states,
  municipalities,
  colonies,
}: Props) {
  const watchedState = watch("address_state");
  const watchedZipcode = watch("address_zipcode");

  return (
    <div className="space-y-6">
      {/* Row 1: Street + Exterior Number + Interior Number */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="address_street">Calle</Label>
          <Input id="address_street" {...register("address_street")} />
        </div>
        <div>
          <Label htmlFor="address_exterior_number">Núm. exterior</Label>
          <Input
            id="address_exterior_number"
            {...register("address_exterior_number")}
          />
        </div>
        <div>
          <Label htmlFor="address_internal_number">Núm. interior</Label>
          <Input
            id="address_internal_number"
            {...register("address_internal_number")}
          />
        </div>
      </div>

      {/* Row 2: State + Municipality + City */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="address_state">Estado</Label>
          <Select
            value={watchedState}
            onValueChange={(val) => {
              setValue("address_state", val ?? "");
              setValue("address_city", "");
            }}
          >
            <SelectTrigger id="address_state">
              <SelectValue placeholder="Seleccionar estado">
                {(value: string | null) => {
                  if (!value) return "Seleccionar estado";
                  const state = states.find((s) => s.code === value);
                  return state?.name ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="address_city">Ciudad / Municipio</Label>
          <Select
            value={watch("address_city")}
            onValueChange={(val) => setValue("address_city", val ?? "")}
            disabled={!watchedState || municipalities.length === 0}
          >
            <SelectTrigger id="address_city">
              <SelectValue
                placeholder={
                  !watchedState
                    ? "Primero selecciona un estado"
                    : municipalities.length === 0
                      ? "Sin municipios"
                      : "Seleccionar municipio"
                }
              >
                {(value: string | null) => {
                  if (!value) return null;
                  const mun = municipalities.find((m) => m.code === value);
                  return mun?.name ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {municipalities.map((m) => (
                <SelectItem key={m.code} value={m.code}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="address_zipcode">Código Postal</Label>
          <Input
            id="address_zipcode"
            {...register("address_zipcode")}
            maxLength={5}
          />
        </div>
      </div>

      {/* Row 3: Colony + Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address_colony">Colonia</Label>
          <Select
            value={watch("address_colony")}
            onValueChange={(val) => setValue("address_colony", val ?? "")}
            disabled={
              !watchedZipcode ||
              watchedZipcode.length < 5 ||
              colonies.length === 0
            }
          >
            <SelectTrigger id="address_colony">
              <SelectValue
                placeholder={
                  !watchedZipcode || watchedZipcode.length < 5
                    ? "Primero ingresa un CP de 5 dígitos"
                    : colonies.length === 0
                      ? "Sin colonias"
                      : "Seleccionar colonia"
                }
              >
                {(value: string | null) => {
                  if (!value) return null;
                  const colony = colonies.find((c) => c.code === value);
                  return colony?.name ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {colonies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="address_country">País</Label>
          <Input
            id="address_country"
            {...register("address_country")}
            placeholder="México"
          />
        </div>
      </div>
    </div>
  );
}
