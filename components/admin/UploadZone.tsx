"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, File, AlertCircle, CheckCircle } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  currentFolder: string;
  onUploadComplete?: () => void;
}

export function UploadZone({ currentFolder, onUploadComplete }: UploadZoneProps) {
  const [folderInput, setFolderInput] = useState(currentFolder);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { queue, isUploading, uploadFiles, clearQueue } = useUpload();

  // Keep folder input in sync when currentFolder changes
  useEffect(() => {
    setFolderInput(currentFolder);
  }, [currentFolder]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files, folderInput);
      if (onUploadComplete) onUploadComplete();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files, folderInput);
      if (onUploadComplete) onUploadComplete();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-content mx-auto p-4 select-none">
      {/* Target Directory Selector */}
      <div className="bg-bg-surface border border-border p-4 rounded-lg flex flex-col md:flex-row items-end gap-4 shadow-sm">
        <div className="flex-1 w-full">
          <Input
            label="Upload Destination Directory"
            placeholder="e.g. gamepad or asset/images (leave blank for Root)"
            value={folderInput}
            onChange={(e) => setFolderInput(e.target.value)}
            disabled={isUploading}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setFolderInput(currentFolder)}
          disabled={isUploading || folderInput === currentFolder}
          className="w-full md:w-auto"
        >
          Reset to current directory
        </Button>
      </div>

      {/* Drop Zone Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={cn(
          "h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer transition-all bg-bg-surface/50 hover:bg-bg-hover",
          isDragActive
            ? "border-accent bg-accent-muted/20 scale-[1.01]"
            : "border-border hover:border-border-strong",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className={cn(
          "w-12 h-12 rounded-full bg-bg-base flex items-center justify-center border border-border text-text-secondary transition-all",
          isDragActive && "border-accent text-accent scale-110"
        )}>
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-text-primary">
            Drag and drop files here, or <span className="text-accent hover:text-accent-hover font-medium">browse local files</span>
          </p>
          <p className="text-xs text-text-secondary">
            Maximum file size: 500 MB. Up to 50 files per concurrent upload batch.
          </p>
        </div>
      </div>

      {/* Upload Queue list */}
      {queue.length > 0 && (
        <div className="bg-bg-surface border border-border rounded-lg shadow-sm overflow-hidden animate-slide-up flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-base/20">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Upload Queue ({queue.filter(q => q.status === "done").length} / {queue.length} completed)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQueue}
              disabled={isUploading}
              className="h-7 text-xs text-text-secondary hover:text-text-primary"
            >
              Clear Queue
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {queue.map((item) => (
              <div key={item.id} className="p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <File className="w-4 h-4 text-text-secondary shrink-0" />
                    <span className="text-sm font-medium text-text-primary truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-xs text-text-secondary font-mono-nums shrink-0">
                      ({formatBytes(item.size, 1)})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === "uploading" && (
                      <span className="text-xs font-semibold text-accent font-mono-nums">
                        {Math.round(item.progress)}%
                      </span>
                    )}
                    {item.status === "done" && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    {item.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-error" />
                    )}
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                {/* Progress bar */}
                {item.status === "uploading" && (
                  <div className="progress-bar w-full">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {/* Error detail */}
                {item.status === "error" && item.error && (
                  <p className="text-xs text-error font-medium pl-6">
                    {item.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
