import * as React from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FloatLabelSelectProps {
  label: string;
  hasValue: boolean;
  error?: string;
  id?: string;
  disabled?: boolean;
  value?: string;
  onValueChange?: (value: string | null) => void;
  /** Render function for the selected value display */
  valueRenderer?: (value: string | null) => React.ReactNode;
  className?: string;
  /** SelectItem elements */
  children: React.ReactNode;
}

function FloatLabelSelect({
  label,
  hasValue,
  error,
  id,
  disabled,
  value,
  onValueChange,
  valueRenderer,
  className,
  children,
}: FloatLabelSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isFloated = hasValue || isOpen;

  return (
    <div className={cn("relative", className)}>
      <Select
        value={value}
        onValueChange={onValueChange}
        onOpenChange={setIsOpen}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          className="!h-12 pt-5 pb-1"
        >
          <SelectValue>{valueRenderer?.(value ?? null)}</SelectValue>
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 z-10 transition-all duration-150",
          isFloated
            ? "top-1.5 text-xs leading-none"
            : "top-1/2 -translate-y-1/2 text-sm",
          error
            ? "text-destructive"
            : isOpen
              ? "text-primary"
              : "text-muted-foreground",
        )}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { FloatLabelSelect };
