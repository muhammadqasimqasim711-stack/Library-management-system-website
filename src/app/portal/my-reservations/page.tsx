"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Clock, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReservations = () => {
    setLoading(true);
    fetch("/api/reservations")
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
    fetchMyReservations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you wish to cancel this reservation hold?")) return;

    try {
      const res = await fetch(`/api/reservations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMyReservations();
      } else {
        alert("Failed to cancel reservation.");
      }
    } catch (err) {
      alert("Error cancelling reservation.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          My Reservations & Hold Queue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track your queue priority on high-demand academic books and monitor ready-for-pickup notifications.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading your reservations...
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="font-bold text-slate-800 text-sm">No Active Reservations</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You do not currently have any pending hold requests in the library queue.
          </p>
          <Link
            href="/portal/catalog"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            Browse Public Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                r.status === "ON_HOLD"
                  ? "bg-amber-50/60 border-amber-300"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-bold font-mono text-xs flex items-center justify-center">
                    #{r.queuePosition}
                  </span>
                  <StatusBadge status={r.status} size="sm" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">{r.book?.title}</h3>
                <div className="text-xs text-slate-500 font-mono">ISBN: {r.book?.isbn}</div>

                {r.status === "ON_HOLD" && (
                  <div className="text-xs font-bold text-amber-900 bg-amber-100 p-2 rounded-lg mt-2 inline-block">
                    READY FOR PICKUP: Collect copy {r.assignedCopy?.barcode} at Main Circulation
                    Desk before {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : "48h"}.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end sm:justify-start gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                {r.status === "PENDING" || r.status === "ON_HOLD" ? (
                  <button
                    onClick={() => handleCancel(r.id)}
                    className="w-full sm:w-auto text-rose-600 hover:text-rose-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors text-center"
                  >
                    Cancel Hold
                  </button>
                ) : (
                  <span className="text-slate-400 text-xs italic">Archived</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
