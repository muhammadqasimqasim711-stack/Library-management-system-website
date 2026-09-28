"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, RotateCw, RefreshCw, BookOpen, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const fetchMyLoans = () => {
    setLoading(true);
    fetch("/api/circulation/loans")
      .then((res) => res.json())
      .then((data) => {
        if (data.loans) setLoans(data.loans);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const handleRenew = async (loanId: string) => {
    setRenewingId(loanId);
    try {
      const res = await fetch("/api/circulation/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to renew.");
      } else {
        alert(`Loan renewed! New Due Date: ${new Date(json.newDueDate).toLocaleDateString()}`);
        fetchMyLoans();
      }
    } catch (err) {
      alert("Error processing renewal.");
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          My Borrowed Books & Active Loans
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your current checkout terms, upcoming return due dates, and request 1-click renewals.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading your active loans...
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="font-bold text-slate-800 text-sm">No Active Loans</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You do not currently have any physical book copies checked out from the library.
          </p>
          <Link
            href="/portal/catalog"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            Explore Public Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const isOverdue =
              loan.status === "OVERDUE" ||
              (loan.status === "ACTIVE" && new Date(loan.dueDate) < new Date());

            const diffDays = Math.ceil(
              (new Date(loan.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={loan.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {loan.copy?.barcode}
                    </span>
                    <StatusBadge status={isOverdue ? "OVERDUE" : loan.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
                    {loan.copy?.book?.title}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    Issued: {new Date(loan.issuedAt).toLocaleDateString()} • Renewals: {loan.renewCount}x
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Due Date</div>
                    <div
                      className={`font-mono text-sm font-bold ${
                        isOverdue ? "text-rose-600" : "text-slate-800"
                      }`}
                    >
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {isOverdue ? (
                        <span className="text-rose-600 font-bold">Overdue</span>
                      ) : diffDays === 0 ? (
                        <span className="text-amber-600 font-bold">Due Today!</span>
                      ) : (
                        <span>{diffDays} days left</span>
                      )}
                    </div>
                  </div>

                  {loan.status === "ACTIVE" && (
                    <button
                      onClick={() => handleRenew(loan.id)}
                      disabled={renewingId === loan.id}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-4 py-2 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <RotateCw
                        className={`w-3.5 h-3.5 ${renewingId === loan.id ? "animate-spin" : ""}`}
                      />
                      Renew (1-Click)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
