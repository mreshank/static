"use client";

import React, { useState } from "react";
import { RefreshCw, Database, Shield, Radio, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { getCDNBaseUrl } from "@/lib/utils";

export default function SettingsPage() {
  const [purgeInput, setPurgeInput] = useState("");
  const [isPurging, setIsPurging] = useState(false);
  const { showToast } = useToast();

  const handlePurgeCache = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purgeInput.trim()) {
      showToast("Purge path is required", "warning");
      return;
    }

    setIsPurging(true);
    try {
      const res = await fetch("/api/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: purgeInput.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to purge cache");
      }

      showToast(`Successfully purged Edge cache for "/${purgeInput.trim()}"`, "success");
      setPurgeInput("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to purge cache";
      showToast(message, "error");
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-6 bg-gradient-to-r from-bg-surface to-transparent p-6 rounded-lg border">
        <h1 className="text-xl font-bold text-text-primary">CDN Settings</h1>
        <p className="text-sm text-text-secondary">
          Configure CDN cache policies, purge files from the edge, and inspect storage details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Settings Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Cache Invalidation Card */}
          <div className="bg-bg-surface border border-border rounded-lg shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-text-primary border-b border-border/40 pb-3">
              <RefreshCw className="w-5 h-5 text-accent" />
              <h2 className="font-semibold text-sm">Purge Edge Cache</h2>
            </div>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              Invalidate edge node caches instantly. Use this when a file has been overwritten on the storage backend but users are still receiving the old cached version.
            </p>

            <form onSubmit={handlePurgeCache} className="flex flex-col md:flex-row items-end gap-4 mt-2">
              <div className="flex-1 w-full">
                <Input
                  label="Target File Path to Invalidate"
                  placeholder="e.g. gamepad/styles.css"
                  value={purgeInput}
                  onChange={(e) => setPurgeInput(e.target.value)}
                  disabled={isPurging}
                  required
                />
              </div>
              <Button type="submit" variant="primary" isLoading={isPurging} className="w-full md:w-auto">
                Purge Path
              </Button>
            </form>
          </div>

          {/* Cache-Control & Headers details */}
          <div className="bg-bg-surface border border-border rounded-lg shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-text-primary border-b border-border/40 pb-3">
              <Shield className="w-5 h-5 text-success" />
              <h2 className="font-semibold text-sm">Cache Control Policies</h2>
            </div>
            
            <div className="flex flex-col gap-4 text-xs text-text-secondary leading-relaxed">
              <p>
                The static CDN utilizes strict immutable caching policies for optimized delivery speed.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-bg-base/40 border border-border-subtle rounded flex flex-col gap-1">
                  <span className="font-semibold text-text-primary">All CDN assets</span>
                  <span className="font-mono text-[10px] text-accent">
                    Cache-Control: public, max-age=31536000, immutable
                  </span>
                  <p className="mt-1 text-[10px]">
                    Files are cached globally on edge locations for up to 1 year. Changes require updating files or purging paths.
                  </p>
                </div>

                <div className="p-3 bg-bg-base/40 border border-border-subtle rounded flex flex-col gap-1">
                  <span className="font-semibold text-text-primary">Conditional Requests</span>
                  <span className="font-mono text-[10px] text-success">
                    ETag + Last-Modified validation
                  </span>
                  <p className="mt-1 text-[10px]">
                    Supports 304 Not Modified responses. Speeds up local caching validation and saves bandwidth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Backend Specs */}
        <div className="bg-bg-surface border border-border rounded-lg shadow-sm p-5 h-fit flex flex-col gap-5">
          <div className="flex items-center gap-2 text-text-primary border-b border-border/40 pb-3">
            <Database className="w-4 h-4 text-info" />
            <h2 className="font-semibold text-xs uppercase tracking-wider">Storage Configuration</h2>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-text-secondary font-medium flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-accent" />
                Edge CDN Host
              </span>
              <span className="font-mono text-text-primary bg-bg-base/60 p-2 border border-border-subtle rounded">
                {getCDNBaseUrl()}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-text-secondary font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-success" />
                Vercel Blob Storage Integration
              </span>
              <span className="text-text-primary font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Connected
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-text-secondary font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-info" />
                Vercel KV Store Integration
              </span>
              <span className="text-text-primary font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Connected
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-text-secondary font-semibold">Max File Upload Limit</span>
              <span className="text-text-primary font-semibold font-mono-nums">500 MB</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-text-secondary font-semibold">Allowed CORS Origins</span>
              <span className="text-text-primary font-semibold font-mono-nums">* (Public Wildcard)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
