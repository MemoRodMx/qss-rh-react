import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 pb-1.5 border-b border-border/30">
      {children}
    </h3>
  );
}

export function AddressTab({
  register,
  setValue,
  watch,
  states,
  municipalities,
  colonies,
}: Props) {
  const watchedState = watch("address_state");
  const watchedCity = watch("address_city");
  const watchedZipcode = watch("address_zipcode");
  const watchedColony = watch("address_colony");

  return (
    <div className="space-y-8">
      {/* ── Calle y número ───────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Calle y número</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FloatLabelInput
              id="address_street"
              label="Calle"
              {...register("address_street")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="address_exterior_number"
              label="Núm. exterior"
              {...register("address_exterior_number")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="address_internal_number"
              label="Núm. interior"
              {...register("address_internal_number")}
            />
          </div>
        </div>
      </div>

      {/* ── Estado, ciudad y colonia ─────────────────────────────────────── */}
      <div>
        <SectionTitle>Estado, ciudad y colonia</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <FloatLabelSelect
              id="address_state"
              label="Estado"
              value={watchedState}
              hasValue={!!watchedState}
              onValueChange={(val) => {
                setValue("address_state", val ?? "");
                setValue("address_city", "");
              }}
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
              id="address_city"
              label="Ciudad / Municipio"
              value={watchedCity}
              hasValue={!!watchedCity}
              disabled={!watchedState || municipalities.length === 0}
              onValueChange={(val) => setValue("address_city", val ?? "")}
              valueRenderer={(value) => {
                if (!value) return "";
                const mun = municipalities.find((m) => m.code === value);
                return mun?.name ?? value;
              }}
            >
              {municipalities.map((m) => (
                <SelectItem key={m.code} value={m.code}>
                  {m.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelInput
              id="address_zipcode"
              label="Código Postal"
              {...register("address_zipcode")}
              maxLength={5}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatLabelSelect
              id="address_colony"
              label="Colonia"
              value={watchedColony}
              hasValue={!!watchedColony}
              disabled={
                !watchedZipcode ||
                watchedZipcode.length < 5 ||
                colonies.length === 0
              }
              onValueChange={(val) => setValue("address_colony", val ?? "")}
              valueRenderer={(value) => {
                if (!value) return "";
                const colony = colonies.find((c) => c.code === value);
                return colony?.name ?? value;
              }}
            >
              {colonies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
          <div>
            <FloatLabelInput
              id="address_country"
              label="País"
              {...register("address_country")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
