import type { Metadata } from "next";
import "./globals.css";
import RoleSwitcher from "@/components/RoleSwitcher";

export const metadata: Metadata = {
  title: "University Library Management System (ULMS)",
  description: "Enterprise University Library System for Catalog, Physical Copies, Rapid Circulation & Auditing",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <RoleSwitcher />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
