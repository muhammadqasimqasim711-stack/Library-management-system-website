"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  QrCode,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building,
  BookmarkCheck,
  ShieldCheck,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import BarcodeRenderer from "@/components/BarcodeRenderer";

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
            ? "A physical copy is immediately ready on hold for you at the Main Desk!"
            : `Hold confirmed! You are position #${json.reservation.queuePosition} in the priority queue.`
        );
        fetchBookDetails();
      }
    } catch (err) {
      setReserveError("Network error.");
    } finally {
      setReserveLoading(false);
    }
  };

  if (loading || !book) {
    return (
      <div className="text-center py-24 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Loading bibliographic records and shelf locations...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/portal/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Catalog
        </Link>
      </div>

      {/* Book Primary Header & Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Cover image */}
          <div className="shrink-0 flex flex-col items-center">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-44 h-64 object-cover rounded-xl shadow-md border border-slate-200"
              />
            ) : (
              <div className="w-44 h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <BookOpen className="w-12 h-12" />
              </div>
            )}

            <div className="mt-4 text-center">
              {book.availableCopies > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {book.availableCopies} Copies on Shelf
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 px-3 py-1.5 rounded-full text-xs font-bold border border-rose-200">
                  <Clock className="w-4 h-4 text-rose-600" />
                  All Copies Checked Out
                </span>
              )}
            </div>
          </div>

          {/* Bibliographic Info */}
          <div className="flex-1 space-y-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-blue-700 uppercase">
                {book.category?.name || "General Academic"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-sm font-medium text-slate-500 mt-0.5">{book.subtitle}</p>
              )}
            </div>

            <div className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Authors: </span>
              {book.authors?.map((a: any) => a.author.name).join(", ")}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">ISBN-13:</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{book.isbn}</div>
              </div>
              <div>
                <span className="text-slate-400">Call / Classification:</span>
                <div className="font-mono font-bold text-blue-800 mt-0.5">
                  {book.classificationNumber || "N/A"}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Edition / Year:</span>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {book.edition || "1st"} ({book.publicationYear})
                </div>
              </div>
            </div>

            {book.description && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Synopsis & Subject Scope
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">{book.description}</p>
              </div>
            )}

            {book.subject && (
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Subject Headings: </span>
                {book.subject}
              </div>
            )}

            {/* Place Reservation / Hold Action */}
            <div className="pt-2">
              <button
                onClick={handlePlaceHold}
                disabled={reserveLoading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                <BookmarkCheck className="w-4 h-4" />
                {reserveLoading ? "Processing Hold..." : "Place Reservation / Hold Request"}
              </button>
            </div>

            {reserveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xl">
                {reserveSuccess}
              </div>
            )}

            {reserveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-900 rounded-xl">
                {reserveError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Physical Copies & Shelf Coordinate Matrix (Section 2 & 8 & 23) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-700" />
            Physical Copies & Shelf Navigator ({book.copies.length} Copies)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Locate copies in the library stacks by Building, Floor, Section, Shelf Code, and Rack.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Copy Barcode</th>
                <th className="py-3 px-4">Location Coordinate</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Shelf Status</th>
                <th className="py-3 px-4 text-right">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {book.copies.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-bold text-blue-800">
                    {c.barcode}
                  </td>

                  <td className="py-3 px-4">
                    {c.shelf ? (
                      <div>
                        <div className="font-semibold text-slate-800">
                          {c.shelf.section?.building} • Floor {c.shelf.section?.floor}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Shelf {c.shelf.code} • {c.rack || "Bay A"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Circulation Reserve Desk</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {c.condition}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right font-medium">
                    {c.status === "AVAILABLE" ? (
                      <span className="text-emerald-700 font-bold">Ready on Shelf</span>
                    ) : c.status === "ON_HOLD" ? (
                      <span className="text-amber-700 font-bold">Held for Member</span>
                    ) : (
                      <span className="text-slate-400">Currently Checked Out</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
