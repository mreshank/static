import useSWR from "swr";
import { FileMetadata } from "@/lib/cache";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch folder contents");
  return res.json();
});

interface FolderContents {
  files: FileMetadata[];
  folders: string[];
}

export function useFiles(currentFolder = "") {
  const { data, error, isLoading, mutate } = useSWR<FolderContents>(
    `/api/files?folder=${encodeURIComponent(currentFolder)}`,
    fetcher
  );

  const createNewFolder = async (folderName: string) => {
    const fullPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    
    // Optimistic UI update
    const optimisticData = data
      ? {
          ...data,
          folders: [...data.folders, folderName].sort(),
        }
      : undefined;

    await mutate(
      async () => {
        const res = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "folder", path: fullPath }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to create folder");
        }
        return res.json().then(() => optimisticData || { files: [], folders: [folderName] });
      },
      {
        optimisticData,
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      }
    );
  };

  const deleteItem = async (name: string, isFolder: boolean) => {
    const itemPath = currentFolder ? `${currentFolder}/${name}` : name;
    
    // Optimistic UI update
    const optimisticData = data
      ? {
          files: isFolder ? data.files : data.files.filter((f) => f.name !== name),
          folders: isFolder ? data.folders.filter((f) => f !== name) : data.folders,
        }
      : undefined;

    await mutate(
      async () => {
        const res = await fetch(`/api/files/${encodeURIComponent(itemPath)}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to delete item");
        }
        return optimisticData || { files: [], folders: [] };
      },
      {
        optimisticData,
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      }
    );
  };

  const renameFile = async (oldName: string, newName: string) => {
    const oldPath = currentFolder ? `${currentFolder}/${oldName}` : oldName;

    await mutate(
      async () => {
        const res = await fetch(`/api/files/${encodeURIComponent(oldPath)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to rename file");
        }
        return data; // Revalidate naturally
      },
      {
        rollbackOnError: true,
        revalidate: true,
      }
    );
  };

  const moveFile = async (filename: string, destinationFolder: string) => {
    const oldPath = currentFolder ? `${currentFolder}/${filename}` : filename;

    // Optimistic UI update - remove from current folder
    const optimisticData = data
      ? {
          ...data,
          files: data.files.filter((f) => f.name !== filename),
        }
      : undefined;

    await mutate(
      async () => {
        const res = await fetch(`/api/files/${encodeURIComponent(oldPath)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: destinationFolder }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to move file");
        }
        return optimisticData || { files: [], folders: [] };
      },
      {
        optimisticData,
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      }
    );
  };

  const purgeCache = async (filePath: string) => {
    const res = await fetch("/api/purge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to purge cache");
    }
    return res.json();
  };

  return {
    files: data?.files || [],
    folders: data?.folders || [],
    isLoading,
    error,
    createFolder: createNewFolder,
    deleteItem,
    renameFile,
    moveFile,
    purgeCache,
    refresh: mutate,
  };
}
