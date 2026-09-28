"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  FileText,
  X,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function AdminFinesPage() {
  const [fines, setFines] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ totalOutstanding: 0, totalCollected: 0, totalWaived: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  // Payment modal
  const [payModalFine, setPayModalFine] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // Waiver modal
  const [waiveModalFine, setWaiveModalFine] = useState<any | null>(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [waiveLoading, setWaiveLoading] = useState(false);

  const fetchFines = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.append("status", statusFilter);

    fetch(`/api/fines?${params.toString()}`)
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
    fetchFines();
  }, [statusFilter]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalFine) return;

    setPayLoading(true);
    try {
      const res = await fetch("/api/fines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fineId: payModalFine.id,
          paymentAmount: parseFloat(paymentAmount),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Payment failed.");
      } else {
        setPayModalFine(null);
        fetchFines();
      }
    } catch (err) {
      alert("Error submitting payment.");
    } finally {
      setPayLoading(false);
    }
  };

  const handleWaive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiveModalFine) return;

    setWaiveLoading(true);
    try {
      const res = await fetch("/api/fines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fineId: waiveModalFine.id,
          waiveReason,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Waiver failed.");
      } else {
        setWaiveModalFine(null);
        fetchFines();
      }
    } catch (err) {
      alert("Error submitting waiver.");
    } finally {
      setWaiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <Coins className="w-4 h-4 text-blue-700" />
            Financial Obligations & Penalties
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Fines, Penalties & Settlements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage overdue charges, damage assessments, lost book replacements, and authorized administrative waivers.
          </p>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Outstanding Balance
          </div>
          <div className="text-3xl font-bold font-mono text-rose-600 mt-2">
            ${metrics.totalOutstanding.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Unpaid overdue fines & damage penalties</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Collected Fines
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-600 mt-2">
            ${metrics.totalCollected.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Settled at Circulation Cashier Desk</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Authorized Waivers
          </div>
          <div className="text-3xl font-bold font-mono text-indigo-600 mt-2">
            ${metrics.totalWaived.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Audited exemptions approved by Director</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="PENDING">Pending / Outstanding</option>
              <option value="PAID">Settled (Paid)</option>
              <option value="WAIVED">Waived (Exempt)</option>
              <option value="ALL">All Records</option>
            </select>
          </div>

          <button
            onClick={fetchFines}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
            <thead className="bg-slate-50/80 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member Name & ID</th>
                <th className="py-3 px-4">Fine Type & Reason</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Recorded</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading fines ledger...
                  </td>
                </tr>
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No fines recorded matching criteria.
                  </td>
                </tr>
              ) : (
                fines.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{f.user?.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {f.user?.memberId} ({f.user?.memberType})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{f.type}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{f.reason}</div>
                      {f.waiveReason && (
                        <div className="text-[10px] text-indigo-700 mt-1 italic">
                          Waiver Reason: {f.waiveReason} (Approved by {f.waivedBy?.fullName || "Director"})
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      ${f.amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 font-mono text-emerald-700">
                      ${f.paidAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={f.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {f.status === "PENDING" || f.status === "PARTIAL" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPayModalFine(f);
                              setPaymentAmount((f.amount - f.paidAmount).toFixed(2));
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
                          >
                            Collect Payment
                          </button>
                          <button
                            onClick={() => {
                              setWaiveModalFine(f);
                              setWaiveReason("");
                            }}
                            className="bg-slate-100 hover:bg-indigo-50 text-indigo-700 border border-slate-300 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
                          >
                            Waive (Director)
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {payModalFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Collect Fine Settlement
              </span>
              <button onClick={() => setPayModalFine(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500">Member:</div>
              <div className="font-bold text-slate-900">
                {payModalFine.user?.fullName} ({payModalFine.user?.memberId})
              </div>
              <div className="text-slate-500 pt-1">Remaining Balance:</div>
              <div className="font-mono font-bold text-rose-600 text-base">
                ${(payModalFine.amount - payModalFine.paidAmount).toFixed(2)}
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Amount Received ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalFine(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-center"
                >
                  {payLoading ? "Processing..." : "Confirm Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waive Fine Modal (Director Audited) */}
      {waiveModalFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-indigo-900 uppercase tracking-wider">
                Authorized Executive Fine Waiver
              </span>
              <button onClick={() => setWaiveModalFine(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200 text-xs text-indigo-950 space-y-1">
              <div className="font-semibold">Institutional Compliance Notice:</div>
              <div>
                Fine waivers are permanent, immutable, and logged into the university security audit ledger with your administrator credentials.
              </div>
            </div>

            <form onSubmit={handleWaive} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Waiver Reason / Policy Exemption Clause *
                </label>
                <textarea
                  rows={3}
                  required
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  placeholder="e.g. Approved medical hardship exemption under Dean of Students Memo #412..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWaiveModalFine(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={waiveLoading}
                  className="px-4 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-center"
                >
                  {waiveLoading ? "Authorizing..." : "Authorize Waiver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
