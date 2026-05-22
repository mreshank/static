"use client";

import React, { useEffect, useRef } from "react";
import { Copy, Edit2, Move, Trash, RefreshCw } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRename: () => void;
  onCopyUrl?: () => void; // Optional for folders
  onMove: () => void;
  onPurge?: () => void; // Optional for folders
  onDelete: () => void;
  isFolder: boolean;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onRename,
  onCopyUrl,
  onMove,
  onPurge,
  onDelete,
  isFolder,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Adjust positioning if it overflows the window boundaries
  const style: React.CSSProperties = {
    top: `${y}px`,
    left: `${x}px`,
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="context-menu"
      role="menu"
    >
      {!isFolder && onCopyUrl && (
        <div
          onClick={() => {
            onCopyUrl();
            onClose();
          }}
          className="context-menu-item"
          role="menuitem"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy CDN URL</span>
        </div>
      )}

      <div
        onClick={() => {
          onRename();
          onClose();
        }}
        className="context-menu-item"
        role="menuitem"
      >
        <Edit2 className="w-3.5 h-3.5" />
        <span>Rename</span>
      </div>

      <div
        onClick={() => {
          onMove();
          onClose();
        }}
        className="context-menu-item"
        role="menuitem"
      >
        <Move className="w-3.5 h-3.5" />
        <span>Move to...</span>
      </div>

      {!isFolder && onPurge && (
        <div
          onClick={() => {
            onPurge();
            onClose();
          }}
          className="context-menu-item"
          role="menuitem"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Purge Edge Cache</span>
        </div>
      )}

      <div className="context-menu-separator" />

      <div
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="context-menu-item danger"
        role="menuitem"
      >
        <Trash className="w-3.5 h-3.5" />
        <span>Delete {isFolder ? "Folder" : "File"}</span>
      </div>
    </div>
  );
}
