import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FloatLabelTextareaProps extends React.ComponentProps<"textarea"> {
  label: string;
  error?: string;
}

function FloatLabelTextarea({
  label,
  error,
  id,
  className,
  ...props
}: FloatLabelTextareaProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="relative">
      <Textarea
        id={inputId}
        placeholder=" "
        aria-invalid={!!error}
        className={cn(
          "peer pt-6 pb-2 placeholder:text-transparent min-h-[80px]",
          className,
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute left-3 top-1.5 text-xs leading-none transition-all duration-150",
          "peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0",
          "peer-focus:top-1.5 peer-focus:text-xs peer-focus:translate-y-0",
          error ? "text-destructive" : "text-muted-foreground",
          !error && "peer-focus:text-primary",
        )}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { FloatLabelTextarea };
