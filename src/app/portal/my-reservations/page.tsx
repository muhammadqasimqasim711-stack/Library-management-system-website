"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Clock,
  CheckCircle2,
  RefreshCw,
  XCircle,
  BookOpen,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const handleCancel = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to cancel your reservation for "${title}"?`)) return;

    setCancellingId(id);
    try {
      const res = await fetch(`/api/reservations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback("Reservation cancelled successfully.");
        fetchMyReservations();
      } else {
        alert("Failed to cancel reservation.");
      }
    } catch (err) {
      alert("Error cancelling reservation.");
    } finally {
      setCancellingId(null);
    }
  };

  const readyReservations = reservations.filter((r) => r.status === "ON_HOLD");
  const waitingReservations = reservations.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-blue-700 uppercase">
            Saved Holds
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
            My Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your place in line for checked-out books and get notified when your copy is ready for pickup.
          </p>
        </div>

        <button
          onClick={fetchMyReservations}
          className="self-start sm:self-auto hover:text-blue-700 flex items-center gap-1.5 font-semibold text-xs text-slate-600 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-blue-700 font-semibold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Ready for Pickup Alert Banner if any */}
      {readyReservations.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-xs flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-bold text-emerald-950 text-sm">
              You Have {readyReservations.length} {readyReservations.length === 1 ? "Book" : "Books"} Ready for Pickup!
            </h2>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your reserved copy is waiting on the hold shelf at the Main Circulation Desk (Level 1). Please bring your Student/Faculty ID and collect it before the expiration deadline.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading your reservations...
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Bookmark className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="font-bold text-slate-800 text-base">No Active Reservations</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You don't have any books on hold right now. When all copies of a book are borrowed, you can reserve it from the catalog to save your spot in line.
          </p>
          <div className="pt-2">
            <Link
              href="/portal/catalog"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Explore Book Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => {
            const isReady = r.status === "ON_HOLD";
            const isWaiting = r.status === "PENDING";
            const book = r.book;

            return (
              <div
                key={r.id}
                className={`bg-white rounded-3xl border p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
                  isReady ? "border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-200" : "border-slate-200"
                }`}
              >
                {/* Book & Hold details */}
                <div className="flex gap-4 items-start min-w-0 flex-1">
                  {book?.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-xl shadow-xs border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 sm:w-20 sm:h-28 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1.5 flex-1">
                    {/* Status badge in simple English: Ready for Pickup vs Waiting (#X in line) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Ready for Pickup
                        </span>
                      ) : isWaiting ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          Waiting (#{r.queuePosition} in line)
                        </span>
                      ) : (
                        <StatusBadge status={r.status} size="sm" />
                      )}

                      <span className="text-[11px] font-mono text-slate-400">
                        ISBN: {book?.isbn}
                      </span>
                    </div>

                    <Link
                      href={book?.id ? `/portal/catalog/${book.id}` : "#"}
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors line-clamp-1 block"
                    >
                      {book?.title || "Book Title"}
                    </Link>

                    {/* Ready Instructions vs Waiting explanation */}
                    {isReady ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          Pick up at Main Circulation Desk (Level 1)
                        </div>
                        <div className="text-[11px] text-emerald-800">
                          Assigned Copy: <span className="font-mono font-bold">{r.assignedCopy?.barcode}</span>
                          {r.expiresAt && (
                            <span className="ml-2 font-medium">
                              • Hold expires: {new Date(r.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        You will be notified by email and in-portal alert as soon as the current borrower returns this title.
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancel Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  {isReady || isWaiting ? (
                    <button
                      onClick={() => handleCancel(r.id, book?.title || "this book")}
                      disabled={cancellingId === r.id}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === r.id ? "Cancelling..." : "Cancel Reservation"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Archived</span>
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
