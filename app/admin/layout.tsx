"use client";

import React from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/Toast";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignInPage = pathname.startsWith("/admin/sign-in");

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_ZW52LW1pc3NpbmctcGxhY2Vob2xkZXItMDAuY2xlcmsuYWNjb3VudHMuZGV2JA=="}>
      <ToastProvider>
        {isSignInPage ? (
          <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4">
            {children}
          </div>
        ) : (
          <div className="min-h-screen bg-bg-base text-text-primary flex">
            {/* Admin Navigation Sidebar */}
            <Sidebar />

            {/* Main Dashboard Panel */}
            <main className="flex-1 min-w-0 pl-sidebar flex flex-col min-h-screen">
              <div className="flex-1 p-6 md:p-8 max-w-content w-full mx-auto animate-fade-in">
                {children}
              </div>
            </main>
          </div>
        )}
      </ToastProvider>
    </ClerkProvider>
  );
}
