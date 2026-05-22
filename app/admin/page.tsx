"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Database,
  FileText,
  UploadCloud,
  FilePlus,
  ArrowRight,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { StatsWidget } from "@/components/admin/StatsWidget";
import { Button } from "@/components/ui/Button";
import { formatBytes, formatDate, getCDNDomain } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { Skeleton } from "@/components/ui/Spinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FileItem {
  id: string;
  path: string;
  name: string;
  folder: string;
  blobUrl: string;
  mimeType: string;
  size: number;
  etag: string;
  uploadedAt: string;
  lastModified: string;
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSWR("/api/stats", fetcher, {
    refreshInterval: 5000,
  });

  const { data: fileData, isLoading: filesLoading } = useSWR("/api/files", fetcher);

  const totalSize = stats?.totalSize || 0;
  const totalFiles = stats?.totalFiles || 0;
  const uploadCount = stats?.uploadCount || 0;

  // Take the first 5 files as recent files
  const recentFiles: FileItem[] = fileData?.files ? fileData.files.slice(0, 5) : [];

  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 bg-gradient-to-r from-bg-surface to-transparent p-6 rounded-lg border">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-text-primary">CDN Dashboard</h1>
          <p className="text-sm text-text-secondary">
            Operational status and storage metrics for {getCDNDomain()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/upload">
            <Button variant="primary">
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </Link>
          <Link href="/admin/files">
            <Button variant="secondary">
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsWidget
            label="Total Space Used"
            value={formatBytes(totalSize, 2)}
            icon={<Database className="w-5 h-5 text-accent" />}
            trend={`${((totalSize / (5 * 1024 * 1024 * 1024)) * 100).toFixed(1)}% of 5GB limit`}
            trendType="neutral"
          />
          <StatsWidget
            label="Total Indexed Files"
            value={totalFiles}
            icon={<FileText className="w-5 h-5 text-success" />}
            trend="Active files serving on CDN"
            trendType="up"
          />
          <StatsWidget
            label="Lifetime Uploads"
            value={uploadCount}
            icon={<TrendingUp className="w-5 h-5 text-info" />}
            trend="Total files cataloged all-time"
            trendType="up"
          />
        </div>
      )}

      {/* Grid: Recent Files & Quick Stats details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Files Table */}
        <div className="lg:col-span-2 bg-bg-surface border border-border rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Recently Uploaded Files
            </h2>
            <Link
              href="/admin/files"
              className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filesLoading ? (
            <div className="p-5 flex flex-col gap-4">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : recentFiles.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm flex flex-col items-center justify-center gap-3">
              <FilePlus className="w-8 h-8 text-text-tertiary" />
              <p>No files uploaded yet. Start by uploading files to your CDN.</p>
              <Link href="/admin/upload" className="mt-2">
                <Button variant="secondary" size="sm">
                  Upload file
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-base/30 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <th className="px-5 py-3">File Name</th>
                    <th className="px-5 py-3">Size</th>
                    <th className="px-5 py-3">Uploaded</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentFiles.map((file: FileItem) => (
                    <tr key={file.path} className="hover:bg-bg-hover/30 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3 min-w-0">
                        <Badge filename={file.name} />
                        <span className="font-semibold text-text-primary truncate max-w-[200px]" title={file.name}>
                          {file.name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary font-mono-nums">
                        {formatBytes(file.size, 1)}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {formatDate(file.uploadedAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <CopyLinkButton filePath={file.path} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CDN System Health Card */}
        <div className="bg-bg-surface border border-border rounded-lg shadow-sm p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-text-primary">System Information</h2>
          
          <div className="flex flex-col gap-3.5 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-text-secondary font-medium">Edge Proxy serving</span>
              <span className="text-success font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-text-secondary font-medium">Target Hostname</span>
              <span className="font-mono text-xs text-text-primary">{getCDNDomain()}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-text-secondary font-medium">Storage Engine</span>
              <span className="text-text-primary font-semibold">Vercel Blob</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-text-secondary font-medium">Database cache</span>
              <span className="text-text-primary font-semibold">Vercel KV / Redis</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-semibold text-text-tertiary uppercase">Admin Session</span>
              <div className="p-3 bg-bg-base/40 border border-border-subtle rounded text-xs text-text-secondary font-mono leading-relaxed">
                Auth Strategy: JWT Edge-Safe
                <br />
                Token Lifetime: 30 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
