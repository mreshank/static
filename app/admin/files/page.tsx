"use client";

import React, { useState } from "react";
import {
  List,
  Grid,
  Search,
  FolderPlus,
  Trash2,
  Folder,
  File,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { useFiles } from "@/hooks/useFiles";
import { BreadcrumbNav } from "@/components/admin/BreadcrumbNav";
import { FileTree } from "@/components/admin/FileTree";
import { FileCard } from "@/components/admin/FileCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ContextMenu } from "@/components/admin/ContextMenu";
import { useToast } from "@/components/ui/Toast";
import { formatBytes, formatDate, getCDNBaseUrl } from "@/lib/utils";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";

export default function FilesPage() {
  const [currentFolder, setCurrentFolder] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Hooks
  const {
    files,
    folders,
    isLoading,
    createFolder,
    deleteItem,
    renameFile,
    moveFile,
    purgeCache,
    refresh,
  } = useFiles(currentFolder);
  const { showToast } = useToast();

  // Multi Selection
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); // paths

  // Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState("");

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [activeItem, setActiveItem] = useState<{ name: string; isFolder: boolean } | null>(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveDestInput, setMoveDestInput] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    name: string;
    isFolder: boolean;
  } | null>(null);

  // Filter files/folders based on search
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFolders = folders.filter((folder) =>
    folder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    setCurrentFolder(path);
    setSelectedFiles([]); // Clear selection
    setSearchQuery("");
  };

  const handleContextMenu = (e: React.MouseEvent, name: string, isFolder: boolean) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      name,
      isFolder,
    });
  };

  // Multi select handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFiles(filteredFiles.map((f) => f.path));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (path: string) => {
    setSelectedFiles((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  // Create Folder action
  const handleCreateFolder = async () => {
    if (!folderNameInput.trim()) {
      showToast("Folder name is required", "warning");
      return;
    }
    try {
      await createFolder(folderNameInput.trim());
      showToast(`Folder "${folderNameInput}" created successfully`, "success");
      setIsFolderModalOpen(false);
      setFolderNameInput("");
    } catch (err) {
      showToast((err as Error).message || "Failed to create folder", "error");
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!activeItem) return;
    try {
      await deleteItem(activeItem.name, activeItem.isFolder);
      showToast(
        `Deleted ${activeItem.isFolder ? "folder" : "file"} "${activeItem.name}"`,
        "success"
      );
      setIsDeleteModalOpen(false);
      setActiveItem(null);
    } catch (err) {
      showToast((err as Error).message || "Failed to delete item", "error");
    }
  };

  // Bulk Delete Action
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the ${selectedFiles.length} selected files?`
    );
    if (!confirmDelete) return;

    let successCount = 0;
    for (const filePath of selectedFiles) {
      try {
        const filename = filePath.split("/").pop() || filePath;
        await deleteItem(filename, false);
        successCount++;
      } catch (err) {
        console.error("Bulk delete item error:", filePath, err);
      }
    }

    showToast(`Bulk deleted ${successCount} files`, "success");
    setSelectedFiles([]);
    refresh();
  };

  // Rename Action
  const handleRename = async () => {
    if (!activeItem || !renameInput.trim()) return;
    try {
      if (activeItem.isFolder) {
        showToast("Folders cannot be renamed in this version", "warning");
        return;
      }
      await renameFile(activeItem.name, renameInput.trim());
      showToast(`Renamed to "${renameInput}"`, "success");
      setIsRenameModalOpen(false);
      setActiveItem(null);
    } catch (err) {
      showToast((err as Error).message || "Failed to rename file", "error");
    }
  };

  // Move Action
  const handleMove = async () => {
    if (!activeItem) return;
    try {
      if (activeItem.isFolder) {
        showToast("Folders cannot be moved in this version", "warning");
        return;
      }
      await moveFile(activeItem.name, moveDestInput.trim());
      showToast(`Moved "${activeItem.name}" to "${moveDestInput || "Root"}"`, "success");
      setIsMoveModalOpen(false);
      setActiveItem(null);
    } catch (err) {
      showToast((err as Error).message || "Failed to move file", "error");
    }
  };

  // Purge Cache Action
  const handlePurge = async (filename: string) => {
    const itemPath = currentFolder ? `${currentFolder}/${filename}` : filename;
    try {
      await purgeCache(itemPath);
      showToast(`Edge cache purged for /${itemPath}`, "success");
    } catch (err) {
      showToast((err as Error).message || "Failed to purge cache", "error");
    }
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-80px)] select-none">
      {/* Left panel: Directory folders tree navigation */}
      <div className="w-64 shrink-0 bg-bg-surface border border-border rounded-lg p-4 h-fit hidden md:flex flex-col gap-4 shadow-sm">
        <FileTree currentFolder={currentFolder} onNavigate={handleNavigate} />
      </div>

      {/* Right panel: Directory browser */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Browser Top Controls */}
        <div className="bg-bg-surface border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex-1 min-w-0">
            <BreadcrumbNav currentFolder={currentFolder} onNavigate={handleNavigate} />
          </div>

          <div className="flex items-center gap-3.5 shrink-0 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search folder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[34px] pl-9 pr-3 bg-bg-base border border-border rounded-md text-xs placeholder:text-text-tertiary focus:border-border-strong transition-all focus:bg-bg-hover focus:ring-1 focus:ring-border-strong"
              />
            </div>

            {/* Grid/List toggles */}
            <div className="flex items-center bg-bg-base border border-border rounded-md p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-sm transition-colors ${
                  viewMode === "list"
                    ? "bg-bg-surface text-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-sm transition-colors ${
                  viewMode === "grid"
                    ? "bg-bg-surface text-accent font-semibold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Create Folder button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFolderModalOpen(true)}
              className="h-[34px]"
            >
              <FolderPlus className="w-4 h-4 mr-1.5" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedFiles.length > 0 && (
          <div className="bg-bg-surface border border-accent/40 rounded-lg p-3 px-4 flex items-center justify-between shadow-sm animate-slide-down">
            <span className="text-xs font-semibold text-accent font-mono-nums">
              {selectedFiles.length} files selected
            </span>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Selected
            </Button>
          </div>
        )}

        {/* Directory Content List */}
        <div className="bg-bg-surface border border-border rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex-1 flex flex-col justify-center items-center gap-2 p-12">
              <div className="animate-spin rounded-full border-2 border-accent border-t-transparent w-8 h-8" />
              <span className="text-xs text-text-secondary italic">Fetching repository directories...</span>
            </div>
          ) : filteredFiles.length === 0 && filteredFolders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-text-secondary gap-2">
              <Folder className="w-10 h-10 text-text-tertiary" />
              <p className="text-sm font-semibold">Directory is empty</p>
              <p className="text-xs">Drag and drop or upload files to add them to this folder.</p>
            </div>
          ) : viewMode === "list" ? (
            /* Dense Table / List View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-base/30 text-xs font-semibold text-text-secondary uppercase tracking-wider select-none">
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredFiles.length > 0 &&
                          selectedFiles.length === filteredFiles.length
                        }
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 cursor-pointer accent-accent bg-bg-elevated border-border rounded"
                      />
                    </th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Modified</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Render Folders First */}
                  {filteredFolders.map((folder) => (
                    <tr
                      key={folder}
                      onDoubleClick={() => handleNavigate(currentFolder ? `${currentFolder}/${folder}` : folder)}
                      onContextMenu={(e) => handleContextMenu(e, folder, true)}
                      className="hover:bg-bg-hover/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-2.5 text-center">
                        {/* Folders don't support selection checkbox in this spec */}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-text-primary flex items-center gap-2">
                        <Folder className="w-4 h-4 text-text-tertiary shrink-0" />
                        <span className="truncate">{folder}</span>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary font-mono-nums">—</td>
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-bg-hover text-text-secondary border border-border rounded">
                          FOLDER
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary">—</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={(e) => handleContextMenu(e, folder, true)}
                          className="w-7 h-7 bg-transparent hover:bg-bg-hover rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Render Files */}
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.path}
                      onContextMenu={(e) => handleContextMenu(e, file.name, false)}
                      className={`hover:bg-bg-hover/30 transition-colors group cursor-pointer ${
                        selectedFiles.includes(file.path) ? "bg-accent-muted/5" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.path)}
                          onChange={() => handleSelectFile(file.path)}
                          className="w-3.5 h-3.5 cursor-pointer accent-accent bg-bg-elevated border-border rounded"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-medium text-text-primary flex items-center gap-2">
                        <File className="w-4 h-4 text-text-tertiary shrink-0" />
                        <span className="truncate" title={file.name}>{file.name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary font-mono-nums">
                        {formatBytes(file.size, 1)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge filename={file.name} />
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary">
                        {formatDate(file.lastModified)}
                      </td>
                      <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <CopyLinkButton filePath={file.path} className="h-7 w-7" />
                          <button
                            onClick={(e) => handleContextMenu(e, file.name, false)}
                            className="w-7 h-7 bg-transparent hover:bg-bg-hover rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View (Media Focused cards) */
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[calc(100vh-220px)]">
              {/* Folder cards */}
              {filteredFolders.map((folder) => (
                <div
                  key={folder}
                  onDoubleClick={() => handleNavigate(currentFolder ? `${currentFolder}/${folder}` : folder)}
                  onContextMenu={(e) => handleContextMenu(e, folder, true)}
                  className="bg-bg-surface border border-border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-border-strong hover:bg-bg-hover/30 transition-all select-none group h-14"
                >
                  <Folder className="w-5 h-5 text-text-tertiary" />
                  <span className="text-xs font-semibold text-text-primary truncate flex-1">{folder}</span>
                  <button
                    onClick={(e) => handleContextMenu(e, folder, true)}
                    className="w-6 h-6 bg-transparent hover:bg-bg-hover rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* File cards */}
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.path}
                  file={file}
                  onContextMenu={(e) => handleContextMenu(e, file.name, false)}
                  onSelect={() => handleSelectFile(file.path)}
                  isSelected={selectedFiles.includes(file.path)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isFolder={contextMenu.isFolder}
          onClose={() => setContextMenu(null)}
          onCopyUrl={
            !contextMenu.isFolder
              ? () => {
                  const path = currentFolder ? `${currentFolder}/${contextMenu.name}` : contextMenu.name;
                  const cdnBase = getCDNBaseUrl();
                  navigator.clipboard.writeText(`${cdnBase}/${path}`);
                  showToast("CDN Link copied to clipboard", "success");
                }
              : undefined
          }
          onRename={() => {
            setActiveItem(contextMenu);
            setRenameInput(contextMenu.name);
            setIsRenameModalOpen(true);
          }}
          onMove={() => {
            setActiveItem(contextMenu);
            setMoveDestInput(currentFolder);
            setIsMoveModalOpen(true);
          }}
          onPurge={
            !contextMenu.isFolder
              ? () => handlePurge(contextMenu.name)
              : undefined
          }
          onDelete={() => {
            setActiveItem(contextMenu);
            setIsDeleteModalOpen(true);
          }}
        />
      )}

      {/* Create Folder Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setFolderNameInput("");
        }}
        title="Create New Directory"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </>
        }
      >
        <Input
          label="Directory Name"
          placeholder="e.g. scripts or images"
          value={folderNameInput}
          onChange={(e) => setFolderNameInput(e.target.value)}
          required
        />
      </Modal>

      {/* Rename File Modal */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setActiveItem(null);
        }}
        title="Rename File"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRename}>
              Rename
            </Button>
          </>
        }
      >
        <Input
          label="New File Name"
          placeholder="filename.ext"
          value={renameInput}
          onChange={(e) => setRenameInput(e.target.value)}
          required
        />
      </Modal>

      {/* Move File Modal */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setActiveItem(null);
        }}
        title="Move File"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleMove}>
              Move File
            </Button>
          </>
        }
      >
        <Input
          label="Destination Folder"
          placeholder="e.g. assets/style (leave blank for root)"
          value={moveDestInput}
          onChange={(e) => setMoveDestInput(e.target.value)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActiveItem(null);
        }}
        title={`Confirm Deletion`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">Warning: Permanent Deletion</span>
          </div>
          <p className="text-text-secondary leading-relaxed">
            Are you sure you want to delete the {activeItem?.isFolder ? "folder" : "file"}{" "}
            <span className="font-semibold text-text-primary">&quot;{activeItem?.name}&quot;</span>?
            {activeItem?.isFolder && (
              <span className="block mt-2 text-xs font-semibold text-error/90">
                Warning: This will recursively delete all nested subfolders and files inside this directory from CDN storage. This action is irreversible.
              </span>
            )}
          </p>
        </div>
      </Modal>
    </div>
  );
}
