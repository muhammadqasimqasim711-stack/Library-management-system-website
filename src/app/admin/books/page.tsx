"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  QrCode,
  Archive,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // New Book Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formIsbn, setFormIsbn] = useState("");
  const [formAuthors, setFormAuthors] = useState("");
  const [formYear, setFormYear] = useState("2026");
  const [formEdition, setFormEdition] = useState("1st Edition");
  const [formCallNumber, setFormCallNumber] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formInitialCopies, setFormInitialCopies] = useState("3");
  const [formCost, setFormCost] = useState("75.00");

  const fetchBooks = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "15",
    });
    if (searchQuery.trim()) params.append("q", searchQuery.trim());
    if (availabilityFilter !== "all") params.append("availability", availabilityFilter);

    fetch(`/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.books) {
          setBooks(data.books);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks();
  }, [page, availabilityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          subtitle: formSubtitle,
          isbn: formIsbn,
          publicationYear: parseInt(formYear, 10),
          edition: formEdition,
          classificationNumber: formCallNumber,
          description: formDescription,
          subject: formSubject,
          authorNames: formAuthors.split(",").map((a) => a.trim()),
          initialCopiesCount: parseInt(formInitialCopies, 10),
          purchaseCost: parseFloat(formCost),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setModalError(json.error || "Failed to create book record.");
      } else {
        setModalSuccess(`Successfully cataloged "${json.book.title}" with physical copies!`);
        setTimeout(() => {
          setIsModalOpen(false);
          setModalSuccess(null);
          fetchBooks();
        }, 1200);
      }
    } catch (err: any) {
      setModalError("Network error occurred.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleArchiveBook = async (bookId: string, title: string) => {
    if (!confirm(`Are you sure you wish to archive "${title}"? This preserves historical loans while removing it from public catalog.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to archive book.");
      } else {
        fetchBooks();
      }
    } catch (err) {
      alert("Error archiving book.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <BookOpen className="w-4 h-4 text-blue-700" />
            Bibliographic Catalog Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Master Books Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Institutional titles index ({totalCount} active academic titles registered)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Catalog New Book Title
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:w-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Title, ISBN, Author, Call Number, or Barcode..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg pl-9 pr-24 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1 top-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded text-xs font-medium transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="all">All Catalog Titles</option>
            <option value="available">Available on Shelf Now</option>
          </select>

          <button
            onClick={fetchBooks}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50/80 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Title & Bibliographic Details</th>
                <th className="py-3 px-4">ISBN & Classification</th>
                <th className="py-3 px-4">Discipline / Section</th>
                <th className="py-3 px-4 text-center">Physical Copies</th>
                <th className="py-3 px-4 text-center">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading bibliographic catalog...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No books found matching criteria.
                  </td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        {b.coverUrl ? (
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="w-10 h-14 object-cover rounded shadow-2xs border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-slate-100 rounded flex items-center justify-center text-slate-400 shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/portal/catalog/${b.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {b.title}
                          </Link>
                          {b.subtitle && (
                            <div className="text-[11px] text-slate-500 line-clamp-1">{b.subtitle}</div>
                          )}
                          <div className="text-[11px] text-slate-600 mt-1">
                            {b.authors?.map((a: any) => a.author.name).join(", ") || "Unknown Author"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ISBN & Call Number */}
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-800">{b.isbn}</div>
                      <div className="text-[11px] text-blue-700 mt-0.5 font-semibold">
                        Call: {b.classificationNumber || "Unclassified"}
                      </div>
                    </td>

                    {/* Category & Section */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {b.category?.name || "General"}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {b.section?.name || b.department?.name || "Main Library"}
                      </div>
                    </td>

                    {/* Physical Copies Breakdown */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        <QrCode className="w-3.5 h-3.5 text-blue-700" />
                        {b.totalCopies} copies
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {b.availableCopies > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {b.availableCopies} Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-medium text-[11px] border border-rose-200">
                          All Borrowed ({b.borrowedCopies})
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/copies?bookId=${b.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Manage Physical Copies & Barcodes"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/portal/catalog/${b.id}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-blue-600 transition-colors"
                          title="View OPAC Listing"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleArchiveBook(b.id, b.title)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Soft Archive Title"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
          <div>
            Showing Page <span className="font-bold text-slate-900">{page}</span> of{" "}
            <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount} titles)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded-md border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded-md border border-slate-300 hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog New Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 my-4 sm:my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Catalog New University Book Title
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleCreateBook} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Distributed Operating Systems"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. Concepts and Design"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ISBN-10 / ISBN-13 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formIsbn}
                    onChange={(e) => setFormIsbn(e.target.value)}
                    placeholder="e.g. 978-0133806106"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Authors (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAuthors}
                    onChange={(e) => setFormAuthors(e.target.value)}
                    placeholder="e.g. Andrew S. Tanenbaum, Maarten van Steen"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classification / Call Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCallNumber}
                    onChange={(e) => setFormCallNumber(e.target.value)}
                    placeholder="e.g. QA76.76.O63 T35"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Physical Copies to Generate
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formInitialCopies}
                    onChange={(e) => setFormInitialCopies(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Cost per Copy ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Abstract / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Academic synopsis and target curriculum..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save & Generate Barcodes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
