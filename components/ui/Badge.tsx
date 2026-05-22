import React from "react";
import { getFileCategory, getFileExtension } from "@/lib/utils";
import { CATEGORY_STYLES, FileCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category?: FileCategory;
  filename?: string;
  ext?: string;
}

export function Badge({ category, filename, ext, className, ...props }: BadgeProps) {
  let fileCategory: FileCategory = "other";
  let displayLabel = "";

  if (category) {
    fileCategory = category;
    displayLabel = category.toUpperCase();
  } else if (filename) {
    const fileExt = getFileExtension(filename);
    fileCategory = getFileCategory(filename);
    displayLabel = fileExt ? `.${fileExt}` : "FILE";
  } else if (ext) {
    fileCategory = getFileCategory(`file.${ext}`);
    displayLabel = `.${ext.toLowerCase()}`;
  }

  const styles = CATEGORY_STYLES[fileCategory];

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded border select-none font-mono",
        className
      )}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderColor: styles.border,
      }}
      {...props}
    >
      {displayLabel}
    </span>
  );
}

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "pending" | "uploading" | "done" | "error";
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const styles = {
    pending: "bg-bg-hover text-text-secondary border-border",
    uploading: "bg-accent/10 text-accent border-accent-border animate-pulse-border",
    done: "bg-success/10 text-success border-success/30",
    error: "bg-error/10 text-error border-error/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase rounded border select-none font-mono",
        styles[status],
        className
      )}
      {...props}
    >
      {status}
    </span>
  );
}
