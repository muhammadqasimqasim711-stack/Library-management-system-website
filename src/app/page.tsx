import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ScanBarcode,
  ShieldCheck,
  Building,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  Users,
  Warehouse,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [totalBooks, totalCopies, availableCopies, totalMembers] = await Promise.all([
    prisma.book.count({ where: { isArchived: false } }),
    prisma.bookCopy.count(),
    prisma.bookCopy.count({ where: { status: "AVAILABLE" } }),
    prisma.user.count(),
  ]);

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-serif text-2xl font-bold shadow-lg shadow-blue-500/20">
              Ψ
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white tracking-tight">
                UNIVERSITY LIBRARY MANAGEMENT SYSTEM
              </span>
              <span className="text-[10px] text-blue-400 font-mono block -mt-1">
                ENTERPRISE SYSTEM ARCHITECTURE • VERIFIED COMPLIANT
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/portal/catalog"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Member OPAC
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Centralized Academic Holdings & Circulation Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
            Institutional Library Resource & Circulation Platform
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Engineered for high-volume academic operations: physical copy tracking, hardware barcode scanning, automated borrowing policies, dynamic reservation queues, and tamper-evident audit logging.
          </p>
        </div>

        {/* Live Holdings Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-10">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">{totalBooks}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Catalog Titles</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono">{totalCopies}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Physical Copies</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">{availableCopies}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Available Now</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">{totalMembers}</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Active Members</div>
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          {/* Admin / Staff Suite */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 hover:border-blue-500/80 transition-all shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ScanBarcode className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">Staff & Administration Suite</h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Mission-critical command center for Library Directors, Circulation Staff, Catalogers, and Inventory Auditors.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>High-Speed Barcode Circulation (Issue/Return under 2s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Physical Copy Decoupling with Shelf Coordinate Hierarchy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Configurable Borrowing Policies, Fines & Formal Waivers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-Time Shelf Auditing & Discrepancy Reconciliation</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-700/60">
              <Link
                href="/admin/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md"
              >
                Enter Staff & Director Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Member Portal OPAC */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 hover:border-amber-500/80 transition-all shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white">Student & Faculty OPAC</h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Public search catalog, instant physical copy availability checks, loan renewals, reservations, and study room bookings.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Faceted Catalog Search with Department & Section Filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Physical Copy Shelf Navigator (Building, Floor, Shelf, Rack)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Automated Loan Extension / 1-Click Renewals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hold Queue Management with Ready-for-Pickup Alerts</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-700/60">
              <Link
                href="/portal/catalog"
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md"
              >
                Search Public Catalog (OPAC)
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
