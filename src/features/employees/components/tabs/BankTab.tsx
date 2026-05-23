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
  return (
    <div className="space-y-8">
      {/* ── Datos bancarios ──────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Datos bancarios</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="bank_bank_id">Banco</Label>
            <Select
              value={watch("bank_bank_id")}
              onValueChange={(val) => setValue("bank_bank_id", val ?? "")}
            >
              <SelectTrigger id="bank_bank_id">
                <SelectValue placeholder="Seleccionar banco">
                  {(value: string | null) => {
                    if (!value) return "Seleccionar banco";
                    const bank = banks.find((b) => b._id === value);
                    return bank?.name ?? value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="bank_account_number">Núm. de cuenta</Label>
            <Input
              id="bank_account_number"
              {...register("bank_account_number")}
            />
          </div>
          <div>
            <Label htmlFor="bank_card_number">Núm. de tarjeta</Label>
            <Input id="bank_card_number" {...register("bank_card_number")} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bank_clabe">CLABE</Label>
            <Input id="bank_clabe" {...register("bank_clabe")} maxLength={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
