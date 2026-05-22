import { useState, useCallback } from "react";
import { upload } from "@vercel/blob/client";

export interface UploadQueueItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function useUpload() {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const uploadFiles = useCallback(async (files: FileList | File[], folderPath = "") => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    // Create unique IDs for tracking
    const newItems: UploadQueueItem[] = fileList.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending",
    }));

    setQueue((prev) => [...prev, ...newItems]);
    setIsUploading(true);

    const uploadPromises = fileList.map(async (file, index) => {
      const queueItem = newItems[index];

      // Update status to uploading
      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueItem.id ? { ...item, status: "uploading" } : item
        )
      );

      try {
        const fullPath = folderPath ? `${folderPath}/${file.name}` : file.name;

        // 1. Upload directly to Vercel Blob via presigned client upload
        const blob = await upload(fullPath, file, {
          access: "public",
          handleUploadUrl: "/api/upload/presign",
          onUploadProgress: (progressEvent) => {
            setQueue((prev) =>
              prev.map((item) =>
                item.id === queueItem.id
                  ? { ...item, progress: progressEvent.percentage }
                  : item
              )
            );
          },
        });

        // 2. Register file metadata in KV database
        const mimeType = file.type || "application/octet-stream";
        const meta = {
          id: blob.url,
          path: fullPath,
          name: file.name,
          folder: folderPath,
          blobUrl: blob.url,
          mimeType: mimeType,
          size: file.size,
          etag: `W/"${file.size.toString(16)}-${Date.now().toString(16)}"`,
        };

        const registerRes = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "file", metadata: meta }),
        });

        if (!registerRes.ok) {
          const errData = await registerRes.json();
          throw new Error(errData.error || "Failed to register file index");
        }

        // Update status to done
        setQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id ? { ...item, status: "done", progress: 100 } : item
          )
        );
      } catch (err: any) {
        console.error(`Upload error for ${file.name}:`, err);
        setQueue((prev) =>
          prev.map((item) =>
            item.id === queueItem.id
              ? { ...item, status: "error", error: err.message || "Upload failed" }
              : item
          )
        );
      }
    });

    await Promise.allSettled(uploadPromises);
    setIsUploading(false);
  }, []);

  return {
    queue,
    isUploading,
    uploadFiles,
    clearQueue,
  };
}
