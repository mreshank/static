"use client";

import React, { useState } from "react";
import { Folder, ChevronRight, ChevronDown, FolderOpen } from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FileTreeProps {
  currentFolder: string;
  onNavigate: (folderPath: string) => void;
  className?: string;
}

export function FileTree({ currentFolder, onNavigate, className }: FileTreeProps) {
  return (
    <div className={cn("flex flex-col gap-1 select-none text-sm", className)}>
      <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary px-2 mb-2">
        Folders Tree
      </div>
      
      {/* Root Node */}
      <TreeItem
        name="Root"
        path=""
        currentFolder={currentFolder}
        onNavigate={onNavigate}
        level={0}
      />
    </div>
  );
}

interface TreeItemProps {
  name: string;
  path: string;
  currentFolder: string;
  onNavigate: (folderPath: string) => void;
  level: number;
}

function TreeItem({ name, path, currentFolder, onNavigate, level }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch contents of this folder path
  const { data, isLoading } = useSWR(
    isOpen ? `/api/files?folder=${encodeURIComponent(path)}` : null,
    fetcher
  );

  const subfolders = data?.folders || [];
  const isActive = currentFolder === path;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate(path);
  };

  return (
    <div className="flex flex-col">
      <div
        onClick={handleSelect}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-bg-hover group transition-colors",
          isActive ? "bg-accent-muted text-accent font-medium" : "text-text-secondary hover:text-text-primary"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <button
          onClick={handleToggle}
          className="p-0.5 rounded hover:bg-bg-active text-text-tertiary hover:text-text-secondary"
          aria-label={isOpen ? "Collapse folder" : "Expand folder"}
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
        {isActive ? (
          <FolderOpen className="w-4 h-4 text-accent" />
        ) : (
          <Folder className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary" />
        )}
        <span className="truncate flex-1">{name}</span>
      </div>

      {isOpen && (
        <div className="flex flex-col">
          {isLoading && (
            <div
              className="text-[11px] text-text-tertiary italic py-1"
              style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
            >
              Loading folders...
            </div>
          )}
          
          {!isLoading && subfolders.length === 0 && (
            <div
              className="text-[11px] text-text-tertiary italic py-1"
              style={{ paddingLeft: `${(level + 1) * 12 + 24}px` }}
            >
              No subfolders
            </div>
          )}

          {!isLoading &&
            subfolders.map((folder: string) => {
              const subPath = path ? `${path}/${folder}` : folder;
              return (
                <TreeItem
                  key={subPath}
                  name={folder}
                  path={subPath}
                  currentFolder={currentFolder}
                  onNavigate={onNavigate}
                  level={level + 1}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
