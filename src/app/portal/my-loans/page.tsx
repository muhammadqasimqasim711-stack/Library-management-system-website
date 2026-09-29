"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  RotateCw,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  Info,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DUE_SOON" | "OVERDUE" | "RETURNED">("ALL");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
    setFeedback(null);
    try {
      const res = await fetch("/api/circulation/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: json.error || "Could not renew this book." });
      } else {
        const formattedDate = new Date(json.newDueDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        setFeedback({
          type: "success",
          message: `Book loan extended! Your new return due date is ${formattedDate}.`,
        });
        fetchMyLoans();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error processing renewal." });
    } finally {
      setRenewingId(null);
    }
  };

  // Metrics
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const activeLoans = loans.filter((l) => l.status === "ACTIVE" || l.status === "OVERDUE");
  const overdueCount = activeLoans.filter((l) => {
    return l.status === "OVERDUE" || new Date(l.dueDate) < now;
  }).length;
  const dueSoonCount = activeLoans.filter((l) => {
    const due = new Date(l.dueDate);
    return due >= now && due <= threeDaysFromNow;
  }).length;
  const returnedCount = loans.filter((l) => l.status === "RETURNED").length;

  // Filtered list
  const filteredLoans = loans.filter((loan) => {
    const isOverdue =
      loan.status === "OVERDUE" ||
      (loan.status === "ACTIVE" && new Date(loan.dueDate) < now);

    const isDueSoon =
      loan.status === "ACTIVE" &&
      !isOverdue &&
      new Date(loan.dueDate) >= now &&
      new Date(loan.dueDate) <= threeDaysFromNow;

    if (filter === "ACTIVE") return loan.status === "ACTIVE" && !isOverdue;
    if (filter === "DUE_SOON") return isDueSoon;
    if (filter === "OVERDUE") return isOverdue;
    if (filter === "RETURNED") return loan.status === "RETURNED";
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-blue-700 uppercase">
            Current Borrowings
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
            My Borrowed Books
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check your return due dates, avoid late fees, and extend loans with 1-click renewal.
          </p>
        </div>

        <button
          onClick={fetchMyLoans}
          className="self-start sm:self-auto hover:text-blue-700 flex items-center gap-1.5 font-semibold text-xs text-slate-600 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Loans</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilter("ALL")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === "ALL"
              ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            All Borrowed
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {activeLoans.length}
          </span>
        </button>

        <button
          onClick={() => setFilter("DUE_SOON")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === "DUE_SOON"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Due Soon (3 Days)
          </span>
          <span className="text-2xl font-bold font-mono text-amber-900 mt-1 block">
            {dueSoonCount}
          </span>
        </button>

        <button
          onClick={() => setFilter("OVERDUE")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === "OVERDUE"
              ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
            Overdue
          </span>
          <span className="text-2xl font-bold font-mono text-rose-700 mt-1 block">
            {overdueCount}
          </span>
        </button>

        <button
          onClick={() => setFilter("RETURNED")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === "RETURNED"
              ? "bg-slate-100 border-slate-300 ring-2 ring-slate-400/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Returned History
          </span>
          <span className="text-2xl font-bold font-mono text-slate-700 mt-1 block">
            {returnedCount}
          </span>
        </button>
      </div>

      {/* Action feedback toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Loans List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading your borrowed books...
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="font-bold text-slate-800 text-base">
            {filter === "ALL" ? "No Active Loans" : `No ${filter.replace("_", " ")} books`}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filter === "ALL"
              ? "You do not currently have any books checked out from the library."
              : `You have no books matching the "${filter.toLowerCase()}" filter.`}
          </p>
          <div className="pt-2">
            <Link
              href="/portal/catalog"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <span>Search Books to Borrow</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => {
            const isOverdue =
              loan.status === "OVERDUE" ||
              (loan.status === "ACTIVE" && new Date(loan.dueDate) < now);

            const isDueSoon =
              loan.status === "ACTIVE" &&
              !isOverdue &&
              new Date(loan.dueDate) >= now &&
              new Date(loan.dueDate) <= threeDaysFromNow;

            const diffDays = Math.ceil(
              (new Date(loan.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            const book = loan.copy?.book;

            return (
              <div
                key={loan.id}
                className={`bg-white rounded-3xl border p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
                  isOverdue
                    ? "border-rose-300 bg-rose-50/20"
                    : isDueSoon
                    ? "border-amber-300 bg-amber-50/20"
                    : "border-slate-200"
                }`}
              >
                {/* Book Info with Cover */}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] sm:text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {loan.copy?.barcode}
                      </span>

                      {/* Status distinction: Active, Due Soon, Overdue, Returned */}
                      {loan.status === "RETURNED" ? (
                        <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          Returned
                        </span>
                      ) : isOverdue ? (
                        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Overdue ({Math.abs(diffDays)}d)
                        </span>
                      ) : isDueSoon ? (
                        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700" />
                          Due Soon
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active Loan
                        </span>
                      )}
                    </div>

                    <Link
                      href={book?.id ? `/portal/catalog/${book.id}` : "#"}
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors line-clamp-1 block"
                    >
                      {book?.title || "Book Title"}
                    </Link>

                    <div className="text-xs text-slate-500">
                      Borrowed:{" "}
                      <span className="font-medium text-slate-700">
                        {new Date(loan.issuedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {loan.renewCount > 0 && (
                        <span className="text-blue-700 ml-2 font-medium">
                          • Renewed {loan.renewCount}x
                        </span>
                      )}
                    </div>

                    {/* Shelf Coordinate / Section info */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>
                        Location: {loan.copy?.shelf?.section?.name || "Main Library"} • Shelf{" "}
                        {loan.copy?.shelf?.code || "Standard"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action & Due Date Badge */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Return Due Date
                    </span>
                    <div
                      className={`font-mono text-sm sm:text-base font-bold ${
                        isOverdue
                          ? "text-rose-600"
                          : isDueSoon
                          ? "text-amber-800"
                          : "text-slate-900"
                      }`}
                    >
                      {new Date(loan.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-[11px] font-semibold mt-0.5">
                      {loan.status === "RETURNED" ? (
                        <span className="text-slate-400">Completed</span>
                      ) : isOverdue ? (
                        <span className="text-rose-600 font-bold">
                          {Math.abs(diffDays)} days overdue
                        </span>
                      ) : diffDays === 0 ? (
                        <span className="text-amber-700 font-bold">Due today by 10:00 PM</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">{diffDays} days remaining</span>
                      )}
                    </div>
                  </div>

                  {loan.status === "ACTIVE" && (
                    <button
                      onClick={() => handleRenew(loan.id)}
                      disabled={renewingId === loan.id}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-4 py-2 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                    >
                      <RotateCw
                        className={`w-3.5 h-3.5 ${renewingId === loan.id ? "animate-spin" : ""}`}
                      />
                      <span>{renewingId === loan.id ? "Renewing..." : "Renew Book"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful Return Information */}
      <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-800 block">Returning Your Books:</span>
          <p className="leading-relaxed">
            Books can be returned at the Main Circulation Desk (Level 1) or in the automated exterior book drop box available 24 hours a day outside the library main entrance.
          </p>
        </div>
      </div>
    </div>
  );
}
