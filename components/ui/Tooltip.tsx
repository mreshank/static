import React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top", className, ...props }: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-border border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-border border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-border border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-border border-y-transparent border-l-transparent",
  };

  return (
    <div className="relative group inline-block" {...props}>
      {children}
      <div
        className={cn(
          "absolute hidden group-hover:block group-focus-within:block z-50 px-2 py-1 text-[11px] font-medium text-text-primary bg-bg-elevated border border-border rounded shadow-md whitespace-nowrap pointer-events-none select-none animate-slide-up",
          positionClasses[position],
          className
        )}
        role="tooltip"
      >
        {content}
        <div
          className={cn(
            "absolute border-[4px]",
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  );
}
