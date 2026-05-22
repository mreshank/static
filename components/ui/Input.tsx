import React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  isSearch?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, description, isSearch, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-text-secondary select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {isSearch && (
            <div className="absolute left-2.5 text-text-tertiary pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full h-[34px] px-3 bg-bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary transition-all focus:border-border-strong focus:bg-bg-hover focus:ring-1 focus:ring-border-strong",
              isSearch && "pl-9",
              error && "border-error focus:border-error focus:ring-error focus:bg-error-muted/5",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-[11px] font-medium text-error select-none">
            {error}
          </span>
        ) : description ? (
          <span className="text-[11px] text-text-tertiary select-none">
            {description}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
