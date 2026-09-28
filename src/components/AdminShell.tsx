"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-100 flex-col md:flex-row">
      {/* Mobile Top Header (<= 768px) */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              U
            </div>
            <div>
              <span className="font-bold text-xs tracking-wide block">UNIVERSITY LMS</span>
              <span className="text-[9px] text-blue-400 font-medium block -mt-0.5">STAFF SUITE</span>
            </div>
          </div>
        </div>

        <Link
          href="/portal/catalog"
          className="text-[11px] font-medium text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1 rounded-md flex items-center gap-1 hover:bg-amber-900/50 transition-colors"
        >
          <span>OPAC</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Mobile Off-Canvas Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Mobile Off-Canvas Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          isMobileDrawer={true}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Permanent Sidebar */}
      <AdminSidebar isMobileDrawer={false} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
