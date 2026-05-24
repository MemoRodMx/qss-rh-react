import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FloatLabelInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

function FloatLabelInput({
  label,
  error,
  id,
  type,
  className,
  ...props
}: FloatLabelInputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isDateType = type === "date";

  return (
    <div className="relative">
      <Input
        id={inputId}
        type={type}
        placeholder={isDateType ? undefined : " "}
        aria-invalid={!!error}
        className={cn(
          "peer h-12 pt-5 pb-1 placeholder:text-transparent",
          className,
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          // Default state = floated: small label at top
          "pointer-events-none absolute left-3 top-1.5 text-xs leading-none transition-all duration-150",
          error ? "text-destructive" : "text-muted-foreground",
          // Text/number: animate back to center when empty + unfocused
          !isDateType && [
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

export { FloatLabelInput };
