"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, DollarSign, Plus, CheckCircle2, RefreshCw, X, Building } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function AdminAcquisitionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState("");
  const [reqAuthor, setReqAuthor] = useState("");
  const [reqIsbn, setReqIsbn] = useState("");
  const [reqQty, setReqQty] = useState("5");
  const [reqCost, setReqCost] = useState("65.00");
  const [reqReason, setReqReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAcquisitions = () => {
    setLoading(true);
    fetch("/api/acquisitions")
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
    fetchAcquisitions();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/acquisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_REQUEST",
          title: reqTitle,
          author: reqAuthor,
          isbn: reqIsbn,
          quantity: reqQty,
          estimatedCost: reqCost,
          reason: reqReason,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setReqTitle("");
        setReqAuthor("");
        setReqIsbn("");
        fetchAcquisitions();
      } else {
        alert("Failed to submit purchase request.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="text-center py-16 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading acquisitions and institutional budgets...
      </div>
    );
  }

  const { budgets, requests, orders, vendors } = data;

  const totalAllocated = budgets.reduce((acc: number, b: any) => acc + b.allocated, 0);
  const totalSpent = budgets.reduce((acc: number, b: any) => acc + b.spent, 0);
  const totalCommitted = budgets.reduce((acc: number, b: any) => acc + b.committed, 0);
  const totalRemaining = totalAllocated - totalSpent - totalCommitted;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <ShoppingBag className="w-4 h-4 text-blue-700" />
            Acquisitions & Financial Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Acquisitions & Budget Visibility
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Procurement pipeline, purchase requests, vendor contracts, and Director budget oversight (FY 2026-2027).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Submit Purchase Request
        </button>
      </div>

      {/* Director Budget Category Visibility (Section 27) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Institutional Budget Allocation Ledger
          </h2>
          <span className="text-xs font-mono font-semibold text-slate-500">
            Fiscal Year: 2026-2027
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500">Total Allocated Budget</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              ${totalAllocated.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500">Committed (In Orders)</div>
            <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
              ${totalCommitted.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500">Disbursed / Spent</div>
            <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
              ${totalSpent.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500">Remaining Balance</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
              ${totalRemaining.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Budget Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[550px]">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Budget Category</th>
                  <th className="py-3 px-4 font-mono">Allocated</th>
                  <th className="py-3 px-4 font-mono">Committed</th>
                  <th className="py-3 px-4 font-mono">Spent</th>
                  <th className="py-3 px-4 font-mono">Remaining</th>
                  <th className="py-3 px-4">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgets.map((b: any) => {
                  const rem = b.allocated - b.spent - b.committed;
                  const util = Math.round(((b.spent + b.committed) / b.allocated) * 100);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-800">{b.category}</td>
                      <td className="py-3 px-4 font-mono">${b.allocated.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-amber-600">${b.committed.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-blue-600">${b.spent.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        ${rem.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                util > 85 ? "bg-rose-500" : "bg-blue-600"
                              }`}
                              style={{ width: `${Math.min(100, util)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">{util}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Purchase Requests & Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Faculty & Department Purchase Requests
          </h2>
          <div className="divide-y divide-slate-100">
            {requests.map((r: any) => (
              <div key={r.id} className="py-3 text-xs space-y-1">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-slate-900">{r.title}</div>
                  <StatusBadge status={r.status} size="sm" />
                </div>
                <div className="text-slate-500">
                  Qty: {r.quantity} • Est: ${(r.estimatedCost * r.quantity).toFixed(2)} • Requester:{" "}
                  {r.requester?.fullName}
                </div>
                {r.reason && <div className="text-[11px] text-slate-600 italic">"{r.reason}"</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Vendors */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Authorized University Book Vendors
          </h2>
          <div className="divide-y divide-slate-100">
            {vendors.map((v: any) => (
              <div key={v.id} className="py-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{v.name}</div>
                  <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {v.code}
                  </span>
                </div>
                <div className="text-slate-500">{v.email} • {v.phone}</div>
                <div className="text-[11px] text-slate-400">{v.address}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Submit Book Purchase Request
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning with PyTorch"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author</label>
                <input
                  type="text"
                  placeholder="e.g. Eli Stevens"
                  value={reqAuthor}
                  onChange={(e) => setReqAuthor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={reqQty}
                    onChange={(e) => setReqQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={reqCost}
                    onChange={(e) => setReqCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Curriculum Reason</label>
                <textarea
                  rows={2}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="e.g. Recommended course reference text for CS 482..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center"
                >
                  {submitting ? "Submitting..." : "Submit to Director"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
