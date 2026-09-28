"use client";

import React, { useState, useEffect } from "react";
import { Users, RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchReservations = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.append("status", statusFilter);

    fetch(`/api/reservations?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reservations) setReservations(data.reservations);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you wish to cancel this reservation?")) return;

    try {
      const res = await fetch(`/api/reservations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchReservations();
      } else {
        const json = await res.json();
        alert(json.error || "Failed to cancel reservation.");
      }
    } catch (err) {
      alert("Error cancelling reservation.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <Users className="w-4 h-4 text-blue-700" />
            Hold Queues & Item Allocations
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Reservations & Hold Queue Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Automatic queue sequencing. When physical copies are returned, the system auto-assigns and holds them for the next member.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="ALL">All Reservations</option>
            <option value="PENDING">Pending in Queue</option>
            <option value="ON_HOLD">Ready on Hold (Shelf)</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={fetchReservations}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
            <thead className="bg-slate-50/80 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Catalog Book Title</th>
                <th className="py-3 px-4">Member Name & ID</th>
                <th className="py-3 px-4 text-center">Queue Position</th>
                <th className="py-3 px-4">Status & Assigned Copy</th>
                <th className="py-3 px-4">Pickup Hold Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading reservation queues...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No active reservations matching criteria.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.book?.title}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        ISBN: {r.book?.isbn}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.user?.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {r.user?.memberId} • {r.user?.memberType}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-bold font-mono inline-flex items-center justify-center text-xs">
                        #{r.queuePosition}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={r.status} size="sm" />
                        {r.assignedCopy && (
                          <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {r.assignedCopy.barcode}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {r.expiresAt ? (
                        <div className="text-amber-800 font-semibold">
                          Expires: {new Date(r.expiresAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Waiting for return</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {r.status === "PENDING" || r.status === "ON_HOLD" ? (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition-colors"
                        >
                          Cancel Hold
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Archived</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
