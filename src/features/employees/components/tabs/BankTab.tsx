import { SelectItem } from "@/components/ui/select";
import { FloatLabelInput } from "@/components/ui/float-label-input";
import { FloatLabelSelect } from "@/components/ui/float-label-select";
import type { EmployeeFormShellProps } from "../EmployeeFormShell";

type Props = Pick<
  EmployeeFormShellProps,
  "register" | "setValue" | "watch" | "errors" | "banks"
>;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3 pb-1.5 border-b border-border/30">
      {children}
    </h3>
  );
}

export function BankTab({ register, setValue, watch, banks }: Props) {
  const watchedBankId = watch("bank_bank_id");

  return (
    <div className="space-y-8">
      {/* ── Datos bancarios ──────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Datos bancarios</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FloatLabelSelect
              id="bank_bank_id"
              label="Banco"
              value={watchedBankId}
              hasValue={!!watchedBankId}
              onValueChange={(val) => setValue("bank_bank_id", val ?? "")}
              valueRenderer={(value) => {
                if (!value) return "";
                const bank = banks.find((b) => b._id === value);
                return bank?.name ?? value;
              }}
            >
              {banks.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </FloatLabelSelect>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FloatLabelInput
              id="bank_account_number"
              label="Núm. de cuenta"
              {...register("bank_account_number")}
            />
          </div>
          <div>
            <FloatLabelInput
              id="bank_card_number"
              label="Núm. de tarjeta"
              {...register("bank_card_number")}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FloatLabelInput
              id="bank_clabe"
              label="CLABE"
              {...register("bank_clabe")}
              maxLength={18}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
