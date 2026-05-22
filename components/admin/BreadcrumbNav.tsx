import React from "react";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbNavProps {
  currentFolder: string;
  onNavigate: (folderPath: string) => void;
}

export function BreadcrumbNav({ currentFolder, onNavigate }: BreadcrumbNavProps) {
  const segments = currentFolder ? currentFolder.split("/") : [];

  return (
    <div className="flex items-center gap-1.5 py-2 px-1 text-sm select-none">
      {/* Root Item */}
      <button
        onClick={() => onNavigate("")}
        className="flex items-center gap-1.5 font-medium text-text-secondary hover:text-text-primary transition-colors py-0.5 px-1 rounded hover:bg-bg-hover"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Root</span>
      </button>

      {segments.map((segment, index) => {
        const path = segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
            <button
              onClick={() => !isLast && onNavigate(path)}
              disabled={isLast}
              className={`font-medium py-0.5 px-1 rounded transition-colors ${
                isLast
                  ? "text-text-primary pointer-events-none"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              {segment}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
