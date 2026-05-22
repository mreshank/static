import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 select-none active:scale-98";
    
    const variants = {
      primary: "bg-accent text-white shadow-glow hover:bg-accent-hover hover:scale-101 border border-transparent",
      secondary: "bg-bg-surface border border-border text-text-primary hover:bg-bg-hover hover:border-border-strong",
      ghost: "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
      danger: "border border-border text-text-secondary hover:border-error hover:text-error hover:bg-error-muted focus-visible:ring-error",
    };

    const sizes = {
      sm: "h-[28px] px-3 text-xs rounded-sm gap-1.5",
      md: "h-[34px] px-4 text-sm rounded-md gap-2",
      lg: "h-[40px] px-5 text-base rounded-lg gap-2.5",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="border-current" />}
        {!isLoading && children}
      </button>
    );
  }
);

Button.displayName = "Button";
