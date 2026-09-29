"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RefreshCw,
  BookmarkCheck,
  MapPin,
  Calendar,
  Building,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberBookDetailsPage({ params }: { params: { id: string } }) {
  const [book, setBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);
  const [reserveError, setReserveError] = useState<string | null>(null);

  const fetchBookDetails = () => {
    setLoading(true);
    fetch(`/api/books/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.book) setBook(data.book);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookDetails();
  }, [params.id]);

  const handlePlaceHold = async () => {
    setReserveLoading(true);
    setReserveSuccess(null);
    setReserveError(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: params.id }),
      });
      const json = await res.json();

      if (!res.ok) {
        setReserveError(json.error || "Failed to place reservation.");
      } else {
        setReserveSuccess(
          json.reservation.status === "ON_HOLD"
            ? "A physical copy is immediately ready on hold for you at the Main Circulation Desk! Please pick it up within 48 hours."
            : `Reservation confirmed! You are position #${json.reservation.queuePosition} in line. We will notify you when a copy becomes available.`
        );
        fetchBookDetails();
      }
    } catch (err) {
      setReserveError("Network error. Please try again.");
    } finally {
      setReserveLoading(false);
    }
  };

  if (loading || !book) {
    return (
      <div className="text-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading book details and shelf location...
      </div>
    );
  }

  const hasAvailableCopies = book.availableCopies > 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/portal" className="hover:text-blue-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/portal/catalog" className="hover:text-blue-700 transition-colors">
          Search Books
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Book Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 md:p-10 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* Cover & Quick Availability status */}
          <div className="shrink-0 flex flex-col items-center w-full md:w-auto">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-40 h-56 sm:w-48 sm:h-68 object-cover rounded-2xl shadow-md border border-slate-200"
              />
            ) : (
              <div className="w-40 h-56 sm:w-48 sm:h-68 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
                <BookOpen className="w-14 h-14" />
              </div>
            )}

            <div className="mt-4 text-center w-full">
              {hasAvailableCopies ? (
                <div className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {book.availableCopies} of {book.totalCopies} Available Now
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200">
                  <Clock className="w-4 h-4 text-rose-600" />
                  All {book.totalCopies} Copies Checked Out
                </div>
              )}
            </div>
          </div>

          {/* Book Information */}
          <div className="flex-1 space-y-5 w-full">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-blue-700 uppercase bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {book.category?.name || "Academic"}
                </span>
                {book.subject && (
                  <span className="text-[10px] sm:text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {book.subject}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-sm font-medium text-slate-500 mt-1">{book.subtitle}</p>
              )}
            </div>

            <div className="text-xs sm:text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Author(s): </span>
              <span className="text-blue-900 font-medium">
                {book.authors?.map((a: any) => a.author.name).join(", ") || "University Library"}
              </span>
            </div>

            {/* Bibliographic Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">ISBN-13</span>
                <span className="font-mono font-bold text-slate-800">{book.isbn}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Call / Classification</span>
                <span className="font-mono font-bold text-blue-800">
                  {book.classificationNumber || "General Stacks"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Edition & Year</span>
                <span className="font-semibold text-slate-800">
                  {book.edition || "Standard"} ({book.publicationYear})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Publisher</span>
                <span className="font-medium text-slate-800">
                  {book.publisher?.name || "University Press"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Library Section</span>
                <span className="font-medium text-slate-800">
                  {book.section?.name || "Main Campus Library"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Language</span>
                <span className="font-medium text-slate-800">{book.language || "English"}</span>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Book Description
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {/* Reservation / Borrow Guidance Action Card */}
            <div className="pt-2">
              <div className="p-4 rounded-2xl border bg-slate-50/80 border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {hasAvailableCopies ? "Ready to Borrow" : "Reserve this Book"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {hasAvailableCopies
                        ? "Copies are waiting on the shelf. You can also place a hold request to have staff set a copy aside at the Main Desk."
                        : `All copies are currently checked out. ${
                            book.pendingReservationsCount > 0
                              ? `${book.pendingReservationsCount} student(s) currently in the reservation queue.`
                              : "Be the first in line by reserving now."
                          }`}
                    </p>
                  </div>

                  <button
                    onClick={handlePlaceHold}
                    disabled={reserveLoading}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>{reserveLoading ? "Saving hold..." : "Reserve / Hold Book"}</span>
                  </button>
                </div>

                {reserveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xl flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reserveSuccess}</span>
                  </div>
                )}

                {reserveError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-900 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{reserveError}</span>
                  </div>
                )}

                {/* Helpful Borrowing Instruction */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    How to borrow in person: Locate an available copy on the shelf below and bring it to the Main Circulation Desk with your Student or Faculty ID.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Find on Shelf: Available Copies & Locations */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-700" />
            Find on Shelf — Physical Copies ({book.copies?.length || 0})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Locate a copy in the library stacks by building, floor, section, shelf code, and rack.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[580px]">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Copy Barcode</th>
                <th className="py-3 px-4">Shelf Location</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Action / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {book.copies?.map((c: any) => {
                const isAvailable = c.status === "AVAILABLE";
                const isOnHold = c.status === "ON_HOLD";

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-blue-800">
                      {c.barcode}
                    </td>

                    <td className="py-3 px-4">
                      {c.shelf ? (
                        <div>
                          <div className="font-semibold text-slate-800">
                            {c.shelf.section?.building || "Main Library"} • Floor{" "}
                            {c.shelf.section?.floor ?? 1}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Shelf {c.shelf.code} {c.rack ? `• ${c.rack}` : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Circulation Reserve Desk</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      {c.condition || "Good"}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isAvailable ? (
                        <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ready on Shelf
                        </span>
                      ) : isOnHold ? (
                        <span className="text-amber-700 font-semibold">Held for Member</span>
                      ) : (
                        <span className="text-slate-400">Currently Borrowed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
