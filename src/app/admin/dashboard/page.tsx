"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  QrCode,
  Users,
  Clock,
  Coins,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ScanBarcode,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Warehouse,
  FileText,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function DirectorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("CURRENT_SEMESTER");

  const fetchStats = () => {
    setLoading(true);
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading Institutional Analytics...</span>
        </div>
      </div>
    );
  }

  const { kpis, circulationTrends, categoryDistribution, recentLoans, recentAuditLogs } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            Executive Administration Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Library Director Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time KPIs for university catalog holdings, circulation volume, physical copy inventory, and fines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="TODAY">Today (Live Stream)</option>
            <option value="CURRENT_WEEK">Current Week</option>
            <option value="CURRENT_MONTH">September 2026</option>
            <option value="CURRENT_SEMESTER">Fall Semester 2026</option>
            <option value="ACADEMIC_YEAR">Academic Year 2026-2027</option>
          </select>

          <Link
            href="/admin/circulation"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <ScanBarcode className="w-4 h-4" />
            Circulation Station
          </Link>
        </div>
      </div>

      {/* Critical Alerts Banner (If any overdue loans or damaged books) */}
      {(kpis.overdueCopies > 0 || kpis.damagedCopies > 0 || kpis.missingCopies > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-900">
                Actionable Operations Attention Required
              </div>
              <div className="text-xs text-amber-800 mt-0.5">
                There are <span className="font-semibold">{kpis.overdueCopies} overdue loan(s)</span>,{" "}
                <span className="font-semibold">{kpis.damagedCopies} damaged copy/copies</span> undergoing assessment, and{" "}
                <span className="font-semibold">{kpis.missingCopies} copy flagged as missing</span>.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/loans?status=OVERDUE"
              className="text-xs font-semibold bg-white text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Review Overdue
            </Link>
            <Link
              href="/admin/copies?status=DAMAGED"
              className="text-xs font-semibold bg-amber-700 text-white px-3 py-1.5 rounded-lg hover:bg-amber-800 transition-colors"
            >
              Review Damaged
            </Link>
          </div>
        </div>
      )}

      {/* Primary KPI Grid (Section 6 Requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Catalog Books */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Catalog Titles
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            {kpis.totalBooks}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Across all academic departments</span>
          </div>
        </div>

        {/* Physical Copies (Critical Domain Distinction: Book != Copy) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Physical Copies
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            {kpis.totalCopies}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{kpis.availableCopies} Copies Available on Shelves</span>
          </div>
        </div>

        {/* Active Circulation & Overdue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Loans
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            {kpis.activeLoansCount}
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
            <span>{kpis.overdueCopies} Overdue Loans Pending</span>
          </div>
        </div>

        {/* Outstanding vs Collected Fines */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Outstanding Fines
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            ${kpis.outstandingFines.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span>${kpis.collectedFines.toFixed(2)} Collected This Fiscal Year</span>
          </div>
        </div>
      </div>

      {/* Secondary Status Breakdown Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
        <div>
          <div className="text-xs text-slate-500">Borrowed</div>
          <div className="text-lg font-bold font-mono text-blue-700">{kpis.borrowedCopies}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Reserved / Holds</div>
          <div className="text-lg font-bold font-mono text-purple-700">{kpis.reservedCopies}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Overdue</div>
          <div className="text-lg font-bold font-mono text-rose-700">{kpis.overdueCopies}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Under Repair</div>
          <div className="text-lg font-bold font-mono text-amber-700">{kpis.repairCopies}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Missing</div>
          <div className="text-lg font-bold font-mono text-red-700">{kpis.missingCopies}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Lost Total</div>
          <div className="text-lg font-bold font-mono text-slate-800">{kpis.lostCopies}</div>
        </div>
      </div>

      {/* Middle Section: Circulation Trends & Collection Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Circulation Bar Chart Simulation */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Daily Circulation Velocity (Issues vs. Returns)
              </h2>
              <p className="text-xs text-slate-500">Transactions processed by Circulation Staff</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
              Avg: 58/day
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2">
            {circulationTrends.map((t: any) => (
              <div key={t.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1.5 h-36">
                  {/* Issues bar */}
                  <div
                    style={{ height: `${(t.issues / 80) * 100}%` }}
                    className="w-4 bg-blue-600 rounded-t hover:bg-blue-700 transition-all relative group"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {t.issues}
                    </span>
                  </div>
                  {/* Returns bar */}
                  <div
                    style={{ height: `${(t.returns / 80) * 100}%` }}
                    className="w-4 bg-emerald-500 rounded-t hover:bg-emerald-600 transition-all relative group"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {t.returns}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600">{t.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-blue-600" />
              <span>Book Copies Issued</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-emerald-500" />
              <span>Book Copies Returned</span>
            </div>
          </div>
        </div>

        {/* Collection Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Collection Holdings by Discipline</h2>
            <p className="text-xs text-slate-500">Distribution across university categories</p>
          </div>

          <div className="space-y-3">
            {categoryDistribution.map((cat: any) => {
              const pct = Math.round((cat.count / Math.max(1, kpis.totalBooks)) * 100);
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="font-mono text-slate-500">
                      {cat.count} titles ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/books"
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition-colors"
            >
              Browse Complete Catalog Holdings
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Circulation Feed & Immutable Audit Log Feed */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Circulation Transactions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Recent Circulation Transactions
            </h2>
            <Link
              href="/admin/loans"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLoans.map((loan: any) => (
              <div key={loan.id} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {loan.copy?.book?.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-blue-700">{loan.copy?.barcode}</span>
                    <span>•</span>
                    <span>{loan.user?.fullName} ({loan.user?.memberId})</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={loan.status} size="sm" />
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Due: {new Date(loan.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Audit Event Stream */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              Immutable Activity Audit Stream
            </h2>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Full Audit Trail
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAuditLogs.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                      {log.action}
                    </span>
                    <span className="text-slate-500 text-[11px] truncate">{log.actorName}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">
                    {log.entity} {log.entityId ? `[${log.entityId.slice(0, 14)}]` : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
