"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  QrCode,
  Users,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  RotateCw,
  Undo2,
  Bookmark,
  Building,
  Layers,
  FileText,
  History,
  Barcode,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import IssueBookModal from "@/components/circulation/IssueBookModal";

export default function AdminBookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id as string;

  const [book, setBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "COPIES" | "LOANS" | "RESERVATIONS" | "HISTORY"
  >("COPIES");

  // Issue Modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueModalPreselectedCopyId, setIssueModalPreselectedCopyId] = useState<string | null>(null);

  // Return / Renew loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchBookDetails = () => {
    setLoading(true);
    setError(null);

    fetch(`/api/books/${bookId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load book record.");
        return res.json();
      })
      .then((data) => {
        if (data.book) {
          setBook(data.book);
        } else {
          setError("Book not found.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Network error loading book.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (bookId) fetchBookDetails();
  }, [bookId]);

  const handleOpenIssueModal = (copyId?: string) => {
    setIssueModalPreselectedCopyId(copyId || null);
    setIsIssueModalOpen(true);
  };

  const handleReturnCopy = async (barcode: string) => {
    if (!confirm(`Confirm return of copy ${barcode}?`)) return;
    setActionLoadingId(barcode);
    setActionMessage(null);

    try {
      const res = await fetch("/api/circulation/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyBarcode: barcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: data.error || "Failed to return copy." });
      } else {
        setActionMessage({ type: "success", text: `Copy ${barcode} successfully returned and marked AVAILABLE.` });
        fetchBookDetails();
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: "Network error processing return." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    setActionLoadingId(loanId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/circulation/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: data.error || "Failed to renew loan." });
      } else {
        setActionMessage({ type: "success", text: "Loan successfully renewed for borrower." });
        fetchBookDetails();
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: "Network error renewing loan." });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
        <p className="text-sm font-semibold">Loading book record & circulation state...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-rose-900">Book Not Found</h2>
        <p className="text-xs text-rose-700">{error || "The requested book record does not exist or was archived."}</p>
        <Link
          href="/admin/books"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Books Catalog
        </Link>
      </div>
    );
  }

  const { summary } = book;
  const hasAvailableCopies = summary.availableCopies > 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/books" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Library Books
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold truncate max-w-xs">{book.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasAvailableCopies ? (
            <button
              onClick={() => handleOpenIssueModal()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              Issue This Book
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("RESERVATIONS")}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all shrink-0"
            >
              <Bookmark className="w-4 h-4" />
              View Reservations ({book.pendingReservationsCount})
            </button>
          )}

          <button
            onClick={fetchBookDetails}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600"
            title="Refresh Holdings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            {actionMessage.text}
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-700">
            &times;
          </button>
        </div>
      )}

      {/* Main Bibliographic Master Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Book Cover */}
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-32 h-44 object-cover rounded-xl shadow-md border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-32 h-44 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 shrink-0">
              <BookOpen className="w-10 h-10 mb-2 text-slate-300" />
              <span className="text-[10px] uppercase font-mono">No Cover</span>
            </div>
          )}

          {/* Book Information Details */}
          <div className="flex-1 space-y-3 min-w-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-200">
                  {book.category?.name || "General Collection"}
                </span>
                {book.subject && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                    {book.subject}
                  </span>
                )}
                {book.isArchived && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                    Archived
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                {book.title}
              </h1>
              {book.subtitle && (
                <div className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                  {book.subtitle}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Author(s)</span>
                <span className="font-semibold text-slate-800">
                  {book.authors?.map((a: any) => a.author.name).join(", ") || "Unknown Author"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">ISBN</span>
                <span className="font-mono font-bold text-slate-800">{book.isbn}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Call Number</span>
                <span className="font-mono font-semibold text-blue-700">
                  {book.classificationNumber || "Unclassified"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Section & Location</span>
                <span className="text-slate-800 font-medium">
                  {book.section?.name || book.department?.name || "Main Library Stack"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Edition: <strong className="text-slate-700">{book.edition || "Standard"}</strong></span>
              <span>•</span>
              <span>Year: <strong className="text-slate-700">{book.publicationYear}</strong></span>
              <span>•</span>
              <span>Language: <strong className="text-slate-700">{book.language || "English"}</strong></span>
              {book.publisher?.name && (
                <>
                  <span>•</span>
                  <span>Publisher: <strong className="text-slate-700">{book.publisher.name}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copy Summary Dashboard KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Copies</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{summary.totalCopies}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cataloged physical assets</div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Available</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">{summary.availableCopies}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Ready on shelf for loan</div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-blue-200 shadow-xs bg-blue-50/20">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Borrowed</div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{summary.borrowedCopies}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Currently with members</div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Reserved</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">{summary.reservedCopies}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Held or queued</div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lost</div>
          <div className="text-2xl font-bold font-mono text-slate-700 mt-1">{summary.lostCopies}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Declared missing/lost</div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-rose-200 shadow-xs bg-rose-50/20">
          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Damaged</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1">{summary.damagedCopies}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Under repair/unusable</div>
        </div>
      </div>

      {/* Unavailability Alert Banner if 0 available */}
      {!hasAvailableCopies && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">All copies are currently unavailable.</div>
              <div className="text-amber-700 mt-0.5">
                Available Copies: 0. Members may place a hold reservation or await return of an active loan.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("RESERVATIONS")}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            View Reservations ({book.pendingReservationsCount})
          </button>
        </div>
      )}

      {/* Circulation Tabs Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab("COPIES")}
            className={`px-5 py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "COPIES"
                ? "border-blue-600 text-blue-700 bg-white font-bold"
                : "border-transparent hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            Physical Copies ({book.copies?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("LOANS")}
            className={`px-5 py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "LOANS"
                ? "border-blue-600 text-blue-700 bg-white font-bold"
                : "border-transparent hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            Current Loans ({book.activeLoans?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("RESERVATIONS")}
            className={`px-5 py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "RESERVATIONS"
                ? "border-blue-600 text-blue-700 bg-white font-bold"
                : "border-transparent hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            Reservations ({book.reservations?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-5 py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "HISTORY"
                ? "border-blue-600 text-blue-700 bg-white font-bold"
                : "border-transparent hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <History className="w-4 h-4 text-slate-600" />
            Borrowing History ({book.historicalLoans?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`px-5 py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "OVERVIEW"
                ? "border-blue-600 text-blue-700 bg-white font-bold"
                : "border-transparent hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            Catalog Details
          </button>
        </div>

        {/* Tab 1: PHYSICAL COPIES TABLE */}
        {activeTab === "COPIES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[750px]">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Copy ID & Barcode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location (Shelf / Rack)</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Current Borrower</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {book.copies?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No physical copies registered for this title.
                    </td>
                  </tr>
                ) : (
                  book.copies.map((copy: any) => {
                    const isAvailable = copy.status === "AVAILABLE";
                    const isBorrowed = copy.status === "BORROWED" || copy.status === "OVERDUE";
                    const borrower = copy.currentBorrower;

                    return (
                      <tr key={copy.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Copy ID & Barcode */}
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                            {copy.barcode}
                          </div>
                          <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                            Copy #{copy.copyNumber} (ID: {copy.id.substring(0, 8)})
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <StatusBadge status={copy.status} size="sm" />
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-slate-800 font-medium">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {copy.location}
                          </div>
                        </td>

                        {/* Condition */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {copy.condition || "GOOD"}
                          </span>
                        </td>

                        {/* Current Borrower */}
                        <td className="py-3 px-4">
                          {isBorrowed && borrower ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <Users className="w-3 h-3 text-blue-600" />
                                {borrower.name}
                                <span className="font-mono text-[10px] font-normal text-slate-500">
                                  ({borrower.memberId})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {borrower.memberType} • Due:{" "}
                                <strong className="text-blue-800">
                                  {new Date(borrower.dueDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </strong>
                              </div>
                            </div>
                          ) : isBorrowed ? (
                            <span className="text-slate-400 italic">Borrower info protected</span>
                          ) : (
                            <span className="text-emerald-700 text-[11px] font-semibold">— Available on Shelf —</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAvailable && (
                              <button
                                onClick={() => handleOpenIssueModal(copy.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Issue
                              </button>
                            )}
                            {isBorrowed && borrower && (
                              <>
                                <button
                                  onClick={() => handleReturnCopy(copy.barcode)}
                                  disabled={actionLoadingId === copy.barcode}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
                                  title="Return Book Copy"
                                >
                                  <Undo2 className="w-3 h-3" /> Return
                                </button>
                                <button
                                  onClick={() => handleRenewLoan(borrower.loanId)}
                                  disabled={actionLoadingId === borrower.loanId}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
                                  title="Renew Loan"
                                >
                                  <RotateCw className="w-3 h-3" /> Renew
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: CURRENT LOANS TABLE */}
        {activeTab === "LOANS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Physical Copy</th>
                  <th className="py-3 px-4">Borrower Details</th>
                  <th className="py-3 px-4">Member Type</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {book.activeLoans?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No active loans for this title currently. All physical copies are on shelf or in maintenance.
                    </td>
                  </tr>
                ) : (
                  book.activeLoans.map((loan: any) => (
                    <tr key={loan.loanId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {loan.barcode}
                        <div className="text-[10px] text-slate-500 font-sans">Copy #{loan.copyNumber}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{loan.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{loan.memberId}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {loan.memberType}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {new Date(loan.issuedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 font-bold text-blue-800">
                        {new Date(loan.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={loan.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReturnCopy(loan.barcode)}
                            disabled={actionLoadingId === loan.barcode}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition-colors"
                          >
                            <Undo2 className="w-3 h-3" /> Return
                          </button>
                          <button
                            onClick={() => handleRenewLoan(loan.loanId)}
                            disabled={actionLoadingId === loan.loanId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 transition-colors"
                          >
                            <RotateCw className="w-3 h-3" /> Renew ({loan.renewCount})
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: RESERVATIONS / HOLDS */}
        {activeTab === "RESERVATIONS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center">Queue Position</th>
                  <th className="py-3 px-4">Reserving Member</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Hold Status</th>
                  <th className="py-3 px-4">Request Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {book.reservations?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No hold reservations currently in queue for this title.
                    </td>
                  </tr>
                ) : (
                  book.reservations.map((res: any) => (
                    <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold inline-flex items-center justify-center text-xs">
                          {res.queuePosition}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{res.user?.fullName || "Member"}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{res.user?.memberId}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {res.user?.memberType || "STUDENT"}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={res.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {new Date(res.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: HISTORICAL BORROWING LEDGER */}
        {activeTab === "HISTORY" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Copy Barcode</th>
                  <th className="py-3 px-4">Historical Borrower</th>
                  <th className="py-3 px-4">Member Tier</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Resolution Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {book.historicalLoans?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No historical circulation records recorded yet for this title.
                    </td>
                  </tr>
                ) : (
                  book.historicalLoans.map((hl: any) => (
                    <tr key={hl.loanId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {hl.copyBarcode}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{hl.borrowerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{hl.memberId}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {hl.memberType}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {new Date(hl.issuedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {hl.returnedAt
                          ? new Date(hl.returnedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={hl.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: CATALOG METADATA */}
        {activeTab === "OVERVIEW" && (
          <div className="p-5 sm:p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Classification & System</span>
                <div className="font-mono text-sm font-bold text-slate-900">{book.classificationNumber || "Unclassified"}</div>
                <div className="text-[11px] text-slate-500">Dewey / Library of Congress index</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Department / Division</span>
                <div className="font-semibold text-sm text-slate-900">{book.department?.name || "General Collection"}</div>
                <div className="text-[11px] text-slate-500">Code: {book.department?.code || "GEN"} • {book.department?.building || "Main Campus"}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Library Section</span>
                <div className="font-semibold text-sm text-slate-900">{book.section?.name || "General Stack"}</div>
                <div className="text-[11px] text-slate-500">Building: {book.section?.building || "Main"} • Floor {book.section?.floor || 1}</div>
              </div>
            </div>

            {book.description && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Abstract / Summary</span>
                <p className="text-slate-700 leading-relaxed">{book.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Issue Book Modal */}
      {isIssueModalOpen && (
        <IssueBookModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          book={book}
          preSelectedCopyId={issueModalPreselectedCopyId}
          onIssueSuccess={() => {
            fetchBookDetails();
          }}
        />
      )}
    </div>
  );
}
