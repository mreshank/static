"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import useSWR from "swr";
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  Settings,
  Database,
  LogOut,
} from "lucide-react";
import { formatBytes, cn, getCDNDomain } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  
  const { data: stats } = useSWR("/api/stats", fetcher, {
    refreshInterval: 10000, // Refresh every 10s
  });

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Files", href: "/admin/files", icon: FolderOpen },
    { label: "Upload", href: "/admin/upload", icon: UploadCloud },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Storage Limit (e.g., 5GB for free tier)
  const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB
  const totalSize = stats?.totalSize || 0;
  const usagePercentage = Math.min((totalSize / maxStorage) * 100, 100);

  return (
    <aside className="fixed top-0 left-0 h-screen w-sidebar bg-bg-surface border-r border-border flex flex-col justify-between select-none z-30">
      {/* Brand Header */}
      <div className="p-5 flex flex-col gap-1 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-[#8b5cf6] flex items-center justify-center text-white font-bold text-xs">
            S
          </div>
          <span className="font-semibold text-sm tracking-wide text-text-primary">
            {getCDNDomain()}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-text-tertiary font-semibold ml-8">
          CDN Admin
        </span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all",
                isActive
                  ? "bg-accent-muted text-accent border-l-2 border-accent pl-2.5"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom widgets & logout */}
      <div className="p-4 border-t border-border flex flex-col gap-4">
        {/* Storage usage */}
        <div className="bg-bg-base/50 p-3 rounded-lg border border-border flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-accent" />
              Storage
            </span>
            <span className="font-mono-nums">{formatBytes(totalSize, 1)} / 5 GB</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ redirectUrl: "/admin/sign-in" })}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary hover:text-error hover:bg-error-muted/10 rounded-md transition-all w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
