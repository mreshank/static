"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Database, 
  FileText, 
  Cpu, 
  ExternalLink, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  Globe2,
  Copy,
  Check
} from "lucide-react";
import { formatBytes, getCDNBaseUrl, getCDNDomain } from "@/lib/utils";

interface Stats {
  totalSize: number;
  totalFiles: number;
  uploadCount: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/public-stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch public stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${getCDNBaseUrl()}/example/styles.css`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB
  const totalSize = stats?.totalSize || 0;
  const usagePercentage = Math.min((totalSize / maxStorage) * 100, 100);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#8b5cf6]/5 blur-[150px] pointer-events-none" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f24_1px,transparent_1px),linear-gradient(to_bottom,#1f1f24_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-12 md:py-24 flex flex-col gap-12 md:gap-16 z-10 relative">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-6 animate-slide-up">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-muted border border-success/20 text-xs font-semibold text-success shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Edge Network Operational
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-text-primary via-text-primary to-accent bg-clip-text text-transparent">
              {getCDNDomain()}
            </h1>
            <p className="text-sm md:text-base text-text-secondary max-w-[600px] leading-relaxed">
              High-performance, globally distributed static asset CDN. Engineered for sub-millisecond edge delivery with strict HTTP validation.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-accent text-white font-medium hover:bg-accent-hover hover:scale-102 transition-all shadow-md active:scale-98"
            >
              Access Admin Panel
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up [animation-delay:100ms]">
          {/* Files Metric Card */}
          <div className="bg-bg-surface/60 border border-border/80 rounded-xl p-6 flex flex-col justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Files Indexed</span>
              <FileText className="w-5 h-5 text-accent" />
            </div>
            {loading ? (
              <div className="h-9 w-24 skeleton" />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold font-mono-nums text-text-primary">
                  {stats?.totalFiles ?? 0}
                </span>
                <span className="text-[10px] text-text-secondary">Live assets ready on Edge</span>
              </div>
            )}
          </div>

          {/* Storage Metric Card */}
          <div className="bg-bg-surface/60 border border-border/80 rounded-xl p-6 flex flex-col justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Storage Consumed</span>
              <Database className="w-5 h-5 text-success" />
            </div>
            {loading ? (
              <div className="h-9 w-32 skeleton" />
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-2xl font-bold font-mono-nums text-text-primary">
                  {formatBytes(totalSize, 2)}
                </span>
                <div className="flex flex-col gap-1 w-full">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${usagePercentage}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-text-secondary flex justify-between">
                    <span>{usagePercentage.toFixed(2)}% of cap</span>
                    <span>5.0 GB limit</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Uptime Metric Card */}
          <div className="bg-bg-surface/60 border border-border/80 rounded-xl p-6 flex flex-col justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Edge Cache Delivery</span>
              <Globe2 className="w-5 h-5 text-info" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-text-primary">100.0%</span>
              <span className="text-[10px] text-text-secondary">Distributed via Vercel Edge Cache</span>
            </div>
          </div>
        </div>

        {/* Integration / Code Example */}
        <div className="bg-bg-surface/40 border border-border/60 rounded-xl p-6 md:p-8 flex flex-col gap-4 animate-slide-up [animation-delay:200ms] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Request Integration</h2>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Assets are served publicly with highly-optimized HTTP headers. Query static assets from any website, stylesheet, or source code globally:
          </p>

          <div className="flex items-center justify-between bg-bg-base border border-border/80 rounded-lg p-3.5 font-mono text-xs text-text-primary overflow-x-auto gap-4 mt-2">
            <span className="whitespace-nowrap text-accent">{getCDNBaseUrl()}/example/styles.css</span>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center p-1.5 rounded bg-bg-surface hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors border border-border flex-shrink-0"
              aria-label="Copy request link example"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up [animation-delay:300ms]">
          {/* Policy 1 */}
          <div className="flex flex-col gap-2 p-4 border border-border-subtle/50 rounded-lg bg-bg-surface/20">
            <div className="flex items-center gap-2 text-text-primary">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Edge Caching</h3>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Served with <code className="bg-bg-surface px-1 py-0.5 rounded font-mono text-[10px]">max-age=31536000, immutable</code>. Browser requests are cached globally for ultra-low latency response.
            </p>
          </div>

          {/* Policy 2 */}
          <div className="flex flex-col gap-2 p-4 border border-border-subtle/50 rounded-lg bg-bg-surface/20">
            <div className="flex items-center gap-2 text-text-primary">
              <ShieldCheck className="w-4 h-4 text-success" />
              <h3 className="text-xs font-bold uppercase tracking-wider">CORS & Security</h3>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Provides open CORS access (<code className="bg-bg-surface px-1 py-0.5 rounded font-mono text-[10px]">*</code>) enabling hotlinking across apps while enforcing path sanitization to block directory traversal.
            </p>
          </div>

          {/* Policy 3 */}
          <div className="flex flex-col gap-2 p-4 border border-border-subtle/50 rounded-lg bg-bg-surface/20">
            <div className="flex items-center gap-2 text-text-primary">
              <CheckCircle className="w-4 h-4 text-info" />
              <h3 className="text-xs font-bold uppercase tracking-wider">304 Validation</h3>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Supports cryptographic content <code className="bg-bg-surface px-1 py-0.5 rounded font-mono text-[10px]">ETag</code> validation, executing 304 conditional checks instantly on the Edge nodes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-[10px] text-text-tertiary select-none">
        <div className="max-w-[1000px] w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <span>&copy; 2026 {getCDNDomain()}. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-text-secondary transition-colors">Admin Dashboard</Link>
            <span>&bull;</span>
            <span>Powered by Next.js & Vercel Edge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
