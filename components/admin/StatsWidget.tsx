import React from "react";
import { cn } from "@/lib/utils";

interface StatsWidgetProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsWidget({
  label,
  value,
  icon,
  trend,
  trendType = "neutral",
  className,
}: StatsWidgetProps) {
  const trendColor = {
    up: "text-success",
    down: "text-error",
    neutral: "text-text-secondary",
  };

  return (
    <div
      className={cn(
        "bg-bg-surface border border-border border-t-2 border-t-accent rounded-lg p-5 flex items-center justify-between shadow-md relative overflow-hidden select-none",
        className
      )}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        <span className="text-2xl font-bold text-text-primary font-mono-nums">
          {value}
        </span>
        {trend && (
          <span className={cn("text-[11px] font-medium", trendColor[trendType])}>
            {trend}
          </span>
        )}
      </div>
      <div className="w-10 h-10 rounded bg-bg-base flex items-center justify-center text-text-secondary border border-border-subtle">
        {icon}
      </div>
    </div>
  );
}
