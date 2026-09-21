"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  RotateCw,
  Undo2,
  ScanBarcode,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

function LoansContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "ACTIVE";

  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const fetchLoans = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (searchQuery.trim()) params.append("search", searchQuery.trim());

    fetch(`/api/circulation/loans?${params.toString()}`)
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
    fetchLoans();
  }, [statusFilter]);

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
        alert(json.error || "Renewal blocked.");
      } else {
        fetchLoans();
      }
    } catch (err) {
      alert("Error renewing loan.");
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <Clock className="w-4 h-4 text-blue-700" />
            Active Circulation & Lending Monitor
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Circulation Loans Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor real-time due dates, overdue items, renewals, and borrower holdings.
          </p>
        </div>

        <Link
          href="/admin/circulation"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <ScanBarcode className="w-4 h-4" />
          Rapid Circulation Desk
        </Link>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLoans()}
              placeholder="Search by Title, Barcode, Member Name, or Member ID..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg pl-9 pr-4 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={fetchLoans}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ACTIVE">Active Loans</option>
            <option value="OVERDUE">Overdue Only</option>
            <option value="RETURNED">Returned History</option>
            <option value="ALL">All Records</option>
          </select>

          <button
            onClick={fetchLoans}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Book Title & Barcode</th>
                <th className="py-3 px-4">Borrower Details</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4">Due Date / Status</th>
                <th className="py-3 px-4 text-center">Renewals</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading circulation loans...
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No loans found matching criteria.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const isOverdue =
                    loan.status === "OVERDUE" ||
                    (loan.status === "ACTIVE" && new Date(loan.dueDate) < new Date());

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {loan.copy?.book?.title}
                        </div>
                        <div className="text-[11px] font-mono text-blue-700 font-semibold mt-0.5">
                          {loan.copy?.barcode}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{loan.user?.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {loan.user?.memberId} • {loan.user?.memberType}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {new Date(loan.issuedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-semibold ${
                              isOverdue ? "text-rose-600" : "text-slate-800"
                            }`}
                          >
                            {new Date(loan.dueDate).toLocaleDateString()}
                          </span>
                          <StatusBadge status={isOverdue ? "OVERDUE" : loan.status} size="sm" />
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {loan.renewCount}x
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {loan.status === "ACTIVE" && (
                            <button
                              onClick={() => handleRenew(loan.id)}
                              disabled={renewingId === loan.id}
                              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                            >
                              <RotateCw className={`w-3 h-3 ${renewingId === loan.id ? "animate-spin" : ""}`} />
                              Renew
                            </button>
                          )}
                          <Link
                            href={`/admin/circulation`}
                            className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                          >
                            <Undo2 className="w-3 h-3" />
                            Return
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoansPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs">
          Loading loans ledger...
        </div>
      }
    >
      <LoansContent />
    </Suspense>
  );
}
