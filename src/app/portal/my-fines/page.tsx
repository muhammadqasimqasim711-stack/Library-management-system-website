"use client";

import React, { useState, useEffect } from "react";
import { Coins, CheckCircle2, RefreshCw, CreditCard } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberFinesPage() {
  const [fines, setFines] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ totalOutstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchMyFines = () => {
    setLoading(true);
    fetch("/api/fines")
      .then((res) => res.json())
      .then((data) => {
        if (data.fines) setFines(data.fines);
        if (data.metrics) setMetrics(data.metrics);
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
        alert("Payment settled successfully via Student Bursar Gateway!");
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          My Fines & Account Balances
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review overdue daily charges, damage assessments, and settle outstanding balances.
        </p>
      </div>

      {/* Balance Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Current Outstanding Balance
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${
              metrics.totalOutstanding > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            ${metrics.totalOutstanding.toFixed(2)}
          </div>
        </div>

        {metrics.totalOutstanding > 0 ? (
          <div className="text-left sm:text-right">
            <span className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 font-semibold inline-block">
              Payment required to restore checkout quota
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Account in Good Financial Standing
          </div>
        )}
      </div>

      {/* Fines Breakdown List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            Loading financial records...
          </div>
        ) : fines.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No fines or penalties recorded on your university account.
          </div>
        ) : (
          fines.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{f.type}</span>
                  <StatusBadge status={f.status} size="sm" />
                </div>
                <div className="text-xs text-slate-600">{f.reason}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Recorded: {new Date(f.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Amount Due</div>
                  <div className="font-mono text-sm sm:text-base font-bold text-slate-900">
                    ${(f.amount - f.paidAmount).toFixed(2)}
                  </div>
                  {f.paidAmount > 0 && (
                    <div className="text-[10px] text-emerald-600 font-mono">
                      Paid: ${f.paidAmount.toFixed(2)}
                    </div>
                  )}
                </div>

                {f.status === "PENDING" || f.status === "PARTIAL" ? (
                  <button
                    onClick={() => handlePay(f)}
                    disabled={payingId === f.id}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {payingId === f.id ? "Settling..." : "Pay Balance"}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">Settled</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
