"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <label
        className={cn(
          "relative inline-flex items-center justify-center",
          className
        )}
      >
        <input
          {...props}
          ref={ref}
          type="checkbox"
          onChange={handleChange}
          className="sr-only"
        />
        <div
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded border border-primary text-primary shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            props.checked
              ? "bg-primary text-primary-foreground"
              : "bg-background",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {props.checked && <Check className="h-3 w-3" />}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
