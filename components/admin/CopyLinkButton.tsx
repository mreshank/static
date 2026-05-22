"use client";

import React from "react";
import { Copy, Check } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn, getCDNBaseUrl } from "@/lib/utils";

interface CopyLinkButtonProps {
  filePath: string;
  className?: string;
}

export function CopyLinkButton({ filePath, className }: CopyLinkButtonProps) {
  const cdnBase = getCDNBaseUrl();
  const fullUrl = `${cdnBase}/${filePath}`;
  const { hasCopied, copy } = useClipboard();

  return (
    <Tooltip content={hasCopied ? "Copied!" : "Copy CDN URL"}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          copy(fullUrl);
        }}
        className={cn(
          "h-8 w-8 p-0 text-text-secondary hover:text-text-primary hover:bg-bg-hover",
          hasCopied && "text-success hover:text-success",
          className
        )}
        aria-label="Copy public CDN URL to clipboard"
      >
        {hasCopied ? (
          <Check className="w-4 h-4 animate-fade-in text-success" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </Tooltip>
  );
}
