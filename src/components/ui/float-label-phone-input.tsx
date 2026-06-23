import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FloatLabelPhoneInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function unformatPhone(formatted: string): string {
  return formatted.replace(/\D/g, "").slice(0, 10);
}

function FloatLabelPhoneInput({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  readOnly,
  className,
}: FloatLabelPhoneInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const display = isFocused ? value : formatPhone(value);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = unformatPhone(e.target.value);
    onChange(raw);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder=" "
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={!!error}
        className={cn(
          "peer h-12 pt-5 pb-1 placeholder:text-transparent",
          className,
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 top-1.5 text-xs leading-none transition-all duration-150",
          error ? "text-destructive" : "text-muted-foreground",
          [
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm",
            "peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-xs",
            !error && "peer-focus:text-primary",
          ],
        )}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { FloatLabelPhoneInput };
