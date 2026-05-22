import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CATEGORY_MAP, FILE_CATEGORIES, FileCategory } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: string | number | Date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sanitizePath(path: string): string {
  // Remove leading/trailing slashes and resolve relative segments
  let clean = path
    .replace(/\\/g, "/") // Convert backslashes
    .replace(/^\/+/, "") // Trim leading slashes
    .replace(/\/+$/, "") // Trim trailing slashes
    .replace(/\/\.(\.)?(\/|$)/g, "/"); // Remove traversal segments like /../ and /./

  // Remove any remaining dangerous characters or multiple adjacent slashes
  clean = clean.replace(/\/+/g, "/");

  // Prevent parent directory traversal
  if (clean.startsWith("..") || clean.includes("../") || clean.includes("..\\")) {
    throw new Error("Invalid path traversal attempt detected");
  }

  return clean;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function getFileCategory(filename: string): FileCategory {
  const ext = getFileExtension(filename);
  return CATEGORY_MAP[ext] || FILE_CATEGORIES.OTHER;
}

export function generateETag(size: number, lastModified: string | number | Date): string {
  const time = new Date(lastModified).getTime();
  // Simple but robust ETag generator based on file size and last modified timestamp
  return `W/"${size.toString(16)}-${time.toString(16)}"`;
}

export function getFolderFromPath(path: string): string {
  const sanitized = sanitizePath(path);
  const lastSlash = sanitized.lastIndexOf("/");
  return lastSlash === -1 ? "" : sanitized.substring(0, lastSlash);
}

export function getFilenameFromPath(path: string): string {
  const sanitized = sanitizePath(path);
  const lastSlash = sanitized.lastIndexOf("/");
  return lastSlash === -1 ? sanitized : sanitized.substring(lastSlash + 1);
}

/**
 * Gets the configured CDN base URL, falling back to window.location.origin on the client
 * or a sensible default on the server.
 */
export function getCDNBaseUrl(): string {
  const envVal = process.env.NEXT_PUBLIC_CDN_BASE;
  if (envVal) return envVal.endsWith("/") ? envVal.slice(0, -1) : envVal;
  
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "https://static.mreshank.com";
}

/**
 * Gets the hostname/domain of the CDN for clean branding displays.
 */
export function getCDNDomain(): string {
  const cdnBase = getCDNBaseUrl();
  try {
    return new URL(cdnBase).hostname;
  } catch {
    return cdnBase.replace(/^https?:\/\//, "");
  }
}

