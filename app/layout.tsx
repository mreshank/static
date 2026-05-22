import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const getCDNDomain = () => {
  const envVal = process.env.NEXT_PUBLIC_CDN_BASE;
  if (!envVal) return "mreshank.com";
  try {
    return new URL(envVal).hostname;
  } catch {
    return envVal.replace(/^https?:\/\//, "");
  }
};

export const metadata: Metadata = {
  title: `Static CDN | ${getCDNDomain()}`,
  description: "Production-grade, blazing-fast static file CDN and management panel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
