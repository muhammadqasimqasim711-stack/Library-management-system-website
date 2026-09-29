"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Building,
  Info,
  ArrowRight,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberFinesPage() {
  const [fines, setFines] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ totalOutstanding: 0, totalCollected: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchMyFines = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/fines").then((res) => (res.ok ? res.json() : { fines: [], metrics: { totalOutstanding: 0 } })),
      fetch("/api/auth/me").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([finesData, authData]) => {
        if (finesData.fines) setFines(finesData.fines);
        if (finesData.metrics) setMetrics(finesData.metrics);
        if (authData?.user) setCurrentUser(authData.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMyFines();
  }, []);

  const isStaffOrAdmin =
    currentUser?.memberType === "ADMIN" ||
    currentUser?.memberType === "STAFF" ||
    currentUser?.roles?.includes("SUPER_ADMIN") ||
    currentUser?.roles?.includes("ADMIN");

  const handlePay = async (fine: any) => {
    const remaining = fine.amount - fine.paidAmount;
    setPayingId(fine.id);

    try {
      const res = await fetch("/api/fines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fineId: fine.id,
          paymentAmount: remaining,
        }),
      });

      if (res.ok) {
        alert("Payment settled successfully!");
        fetchMyFines();
      } else {
        const json = await res.json();
        alert(json.error || "Payment failed.");
      }
    } catch (err) {
      alert("Error submitting payment.");
    } finally {
      setPayingId(null);
    }
  };

  const hasOutstanding = (metrics.totalOutstanding || 0) > 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-blue-700 uppercase">
            Account Balances
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
            My Fines & Fees
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review overdue return fees, damaged book assessments, and fee payment details.
          </p>
        </div>

        <button
          onClick={fetchMyFines}
          className="self-start sm:self-auto hover:text-blue-700 flex items-center gap-1.5 font-semibold text-xs text-slate-600 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Balance Summary Card */}
      <div
        className={`rounded-3xl border p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
          hasOutstanding
            ? "bg-rose-50/40 border-rose-200"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Current Outstanding Balance
          </span>
          <div
            className={`text-3xl sm:text-4xl font-bold font-mono ${
              hasOutstanding ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            ${(metrics.totalOutstanding || 0).toFixed(2)}
          </div>
          <p className="text-xs text-slate-500">
            {hasOutstanding
              ? "Payment is requested to maintain regular library borrowing privileges."
              : "No outstanding fines or penalties recorded on your university account."}
          </p>
        </div>

        <div>
          {hasOutstanding ? (
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs bg-rose-100/70 px-4 py-2 rounded-xl border border-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Balance Due</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account in Good Standing</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Information Card (Simple English) */}
      <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-3">
        <h2 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-700" />
          How to Pay Library Fines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-800 block">1. In Person at Circulation Desk</span>
            <p className="leading-relaxed">
              Visit the Main Circulation Desk (Level 1) during open library hours. Payments are accepted via cash, debit card, or student campus ID card.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-800 block">2. Student Bursar Bill</span>
            <p className="leading-relaxed">
              Unpaid library charges can also be consolidated onto your end-of-semester University Bursar tuition statement.
            </p>
          </div>
        </div>
      </div>

      {/* Fines Breakdown List */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-800 text-sm">Fine & Fee History</h2>

        {loading ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-200">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            Loading financial records...
          </div>
        ) : fines.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-bold text-slate-800 text-sm">No Fine Records Found</div>
            <p className="text-xs text-slate-400">
              You have no active or historical fines on your library account.
            </p>
          </div>
        ) : (
          fines.map((f) => {
            const isUnpaid = f.status === "PENDING" || f.status === "PARTIAL";
            const remaining = f.amount - (f.paidAmount || 0);

            return (
              <div
                key={f.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isUnpaid ? "border-rose-200" : "border-slate-200"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      {f.type === "OVERDUE" ? "Overdue Book Fee" : f.type || "Fine Assessment"}
                    </span>
                    <StatusBadge status={f.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-600">{f.reason}</div>
                  <div className="text-[11px] text-slate-400">
                    Recorded: {new Date(f.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isUnpaid ? "Amount Due" : "Settled Amount"}
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-slate-900">
                      ${remaining.toFixed(2)}
                    </span>
                    {f.paidAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-mono block">
                        Paid: ${f.paidAmount.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Staff Settle Button if Staff/Admin */}
                  {isStaffOrAdmin && isUnpaid && (
                    <button
                      onClick={() => handlePay(f)}
                      disabled={payingId === f.id}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{payingId === f.id ? "Settling..." : "Settle Balance"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
