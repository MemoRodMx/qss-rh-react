import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FloatLabelDateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

function toDisplay(internal: string): string {
  if (!internal || internal.length !== 10) return "";
  const [y, m, d] = internal.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

function toInternal(display: string): string {
  const cleaned = display.replace(/\//g, "").replace(/-/g, "");
  if (cleaned.length < 8) return display;
  const d = cleaned.slice(0, 2);
  const m = cleaned.slice(2, 4);
  const y = cleaned.slice(4, 8);
  if (!y || !m || !d) return display;
  return `${y}-${m}-${d}`;
}

function isValidParts(parts: number[]): boolean {
  const [d, m, y] = parts;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  if (y < 1900 || y > 2100) return false;
  return true;
}

function tryParseDate(display: string): string | null {
  const cleaned = display.replace(/\//g, "").replace(/-/g, "");
  if (cleaned.length < 8) return null;
  const d = cleaned.slice(0, 2);
  const m = cleaned.slice(2, 4);
  const y = cleaned.slice(4, 8);
  if (!y || !m || !d) return null;
  const parts = [Number(d), Number(m), Number(y)];
  if (!isValidParts(parts)) return null;
  return `${y}-${m}-${d}`;
}

function FloatLabelDateInput({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  readOnly,
  className,
}: FloatLabelDateInputProps) {
  const [display, setDisplay] = React.useState(toDisplay(value));
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setDisplay(toDisplay(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow typing: digits, slashes, dashes
    const cleaned = raw.replace(/[^0-9/\\-]/g, "");
    setDisplay(cleaned);

    // If enough digits, try to parse
    const digits = cleaned.replace(/[/-]/g, "");
    if (digits.length >= 8) {
      const internal = toInternal(cleaned);
      const parts = internal.split("-").map(Number);
      // toInternal returns YYYY-MM-DD, isValidParts expects [day, month, year]
      if (parts.length === 3 && isValidParts([parts[2], parts[1], parts[0]])) {
        onChange(internal);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = tryParseDate(display);
    if (!parsed && display.trim()) {
      onChange("");
      setDisplay("");
      return;
    }
    // Use parsed (from current display) to avoid flash from stale value prop
    if (parsed) {
      setDisplay(toDisplay(parsed));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplay(toDisplay(value));
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
      <p className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/60 tabular-nums select-none">
        dd/mm/aaaa
      </p>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { FloatLabelDateInput };
