"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  Building,
  Mail,
  Shield,
  BookOpen,
  Bookmark,
  CircleDollarSign,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  ArrowRight,
  Info,
} from "lucide-react";

export default function MemberProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    activeLoans: 0,
    activeReservations: 0,
    finesDue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/circulation/loans").then((res) => (res.ok ? res.json() : { loans: [] })),
      fetch("/api/reservations").then((res) => (res.ok ? res.json() : { reservations: [] })),
      fetch("/api/fines").then((res) => (res.ok ? res.json() : { metrics: { totalOutstanding: 0 } })),
    ])
      .then(([authData, loansData, resData, finesData]) => {
        if (authData?.user) setUser(authData.user);
        const activeLoans = (loansData.loans || []).filter(
          (l: any) => l.status === "ACTIVE" || l.status === "OVERDUE"
        ).length;
        const activeReservations = (resData.reservations || []).filter(
          (r: any) => r.status === "PENDING" || r.status === "ON_HOLD"
        ).length;
        const fines = finesData?.metrics?.totalOutstanding || 0;

        setMetrics({
          activeLoans,
          activeReservations,
          finesDue: fines,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading your library profile...
      </div>
    );
  }

  const isFaculty = user?.memberType === "FACULTY";

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[10px] sm:text-xs font-bold tracking-widest text-blue-700 uppercase">
          Member Account
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
          My Library Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your institutional membership details, borrowing privileges, and active library stats.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-2xl text-blue-900 shadow-xs shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900">{user?.fullName || "University Member"}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {user?.memberId || "STU-2026-001"}
                </span>
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {user?.memberType || "STUDENT"}
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Account Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              Switch User
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Member Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Email Address</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{user?.email || "student@university.edu"}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Department</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
              <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{user?.department?.name || "General Academic"}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 block text-[11px] font-medium">Primary Campus</span>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Main University Campus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Library Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/portal/my-loans"
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Books Currently Borrowed
            </span>
            <div className="text-3xl font-bold font-mono text-slate-900 mt-1">
              {metrics.activeLoans}
            </div>
            <div className="text-xs text-blue-700 font-medium mt-1 group-hover:underline">
              View borrowed books →
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </Link>

        <Link
          href="/portal/my-reservations"
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Saved Holds
            </span>
            <div className="text-3xl font-bold font-mono text-slate-900 mt-1">
              {metrics.activeReservations}
            </div>
            <div className="text-xs text-purple-700 font-medium mt-1 group-hover:underline">
              View reservations →
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
        </Link>

        <Link
          href="/portal/my-fines"
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Outstanding Fines
            </span>
            <div
              className={`text-3xl font-bold font-mono mt-1 ${
                metrics.finesDue > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              ${metrics.finesDue.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-1 group-hover:underline">
              View fees balance →
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Borrowing Rules & Privileges Guide */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-700" />
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">
            Your Borrowing Privileges & Rules
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Loan Duration</span>
            <span className="text-sm font-bold text-slate-900 block">
              {isFaculty ? "30 Days" : "14 Days"}
            </span>
            <span className="text-slate-500 block">Standard checkout period per book</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Borrowing Quota</span>
            <span className="text-sm font-bold text-slate-900 block">
              {isFaculty ? "10 Books" : "5 Books"}
            </span>
            <span className="text-slate-500 block">Maximum simultaneous active checkouts</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">1-Click Renewals</span>
            <span className="text-sm font-bold text-slate-900 block">Up to 2 Times</span>
            <span className="text-slate-500 block">Allowed if no other student has placed a hold</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Overdue Fee Rate</span>
            <span className="text-sm font-bold text-slate-900 block">$1.00 / Day</span>
            <span className="text-slate-500 block">Accrues daily after loan due date passes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
