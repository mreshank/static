"use client";

import React from "react";
import { UploadZone } from "@/components/admin/UploadZone";

export default function UploadPage() {
  const currentFolder = "";

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-6 bg-gradient-to-r from-bg-surface to-transparent p-6 rounded-lg border">
        <h1 className="text-xl font-bold text-text-primary">CDN File Uploader</h1>
        <p className="text-sm text-text-secondary">
          Upload assets directly to Vercel Blob storage and register CDN indexes.
        </p>
      </div>

      {/* Main Upload Area */}
      <div className="w-full">
        <UploadZone
          currentFolder={currentFolder}
          onUploadComplete={() => {
            console.log("Upload batch processed successfully.");
          }}
        />
      </div>
    </div>
  );
}
