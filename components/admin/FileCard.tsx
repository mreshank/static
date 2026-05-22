"use client";

import React from "react";
import {
  FileText,
  FileCode,
  FileAudio,
  FileVideo,
  File,
  MoreVertical,
} from "lucide-react";
import { FileMetadata } from "@/lib/cache";
import { formatBytes, getFileCategory } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { CopyLinkButton } from "./CopyLinkButton";

interface FileCardProps {
  file: FileMetadata;
  onContextMenu: (e: React.MouseEvent, file: FileMetadata) => void;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>, file: FileMetadata) => void;
  isSelected: boolean;
}

export function FileCard({ file, onContextMenu, onSelect, isSelected }: FileCardProps) {
  const isImage = file.mimeType.startsWith("image/");
  const category = getFileCategory(file.name);

  // Return appropriate thumbnail/icon based on category
  const renderThumbnail = () => {
    if (isImage) {
      return (
        <div className="w-full h-full relative group/img overflow-hidden flex items-center justify-center bg-bg-base">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={file.blobUrl}
            alt={file.name}
            className="object-contain w-full h-full transition-transform duration-300 group-hover/img:scale-105"
            loading="lazy"
          />
        </div>
      );
    }

    const icons = {
      code: <FileCode className="w-10 h-10 text-success/70" />,
      media: file.mimeType.startsWith("audio/") ? (
        <FileAudio className="w-10 h-10 text-[#a78bfa]" />
      ) : (
        <FileVideo className="w-10 h-10 text-[#a78bfa]" />
      ),
      data: <FileText className="w-10 h-10 text-info/70" />,
      other: <File className="w-10 h-10 text-text-tertiary" />,
    };

    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-base/40">
        {icons[category]}
      </div>
    );
  };

  return (
    <div
      onContextMenu={(e) => onContextMenu(e, file)}
      className={`group relative bg-bg-surface border rounded-lg overflow-hidden shadow hover:border-border-strong transition-all select-none flex flex-col h-48 ${
        isSelected ? "border-accent ring-1 ring-accent" : "border-border"
      }`}
    >
      {/* Top action row */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e, file)}
          className="w-4 h-4 cursor-pointer accent-accent bg-bg-elevated border-border rounded focus:ring-accent"
        />
        <button
          onClick={(e) => onContextMenu(e, file)}
          className="w-7 h-7 bg-bg-elevated/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-bg-hover hover:border-border-strong text-text-secondary hover:text-text-primary"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Media / Icon preview area */}
      <div className="flex-1 w-full border-b border-border overflow-hidden bg-bg-base/20">
        {renderThumbnail()}
      </div>

      {/* Meta description area */}
      <div className="p-3 flex flex-col gap-1.5 bg-bg-surface">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-semibold text-text-primary truncate flex-1"
            title={file.name}
          >
            {file.name}
          </span>
          <CopyLinkButton filePath={file.path} className="h-6 w-6" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-secondary font-mono-nums">
            {formatBytes(file.size, 1)}
          </span>
          <Badge filename={file.name} />
        </div>
      </div>
    </div>
  );
}
