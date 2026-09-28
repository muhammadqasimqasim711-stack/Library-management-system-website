"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, BookOpen, QrCode, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberCatalogPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");

  const fetchCatalog = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "24" });
    if (search.trim()) params.append("q", search.trim());
    if (availability === "available") params.append("availability", "available");

    fetch(`/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.books) setBooks(data.books);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
  }, [availability]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
  };

  return (
    <div className="space-y-8">
      {/* Search Hero */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-xl space-y-5 sm:space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-amber-400 uppercase">
            Online Public Access Catalog (OPAC)
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Discover Academic Resources & Textbooks
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Search hundreds of thousands of institutional holdings across engineering, natural sciences, medicine, law, and the humanities.
          </p>
        </div>

        {/* Big Search Bar */}
        <form onSubmit={handleSearch} className="max-w-3xl flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Title, ISBN, Author, Topic, or Call Number..."
              className="w-full bg-white text-slate-900 rounded-xl pl-10 pr-3 sm:pl-11 sm:pr-4 py-3 sm:py-3.5 text-xs sm:text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shrink-0"
          >
            Search Catalog
          </button>
        </form>

        {/* Availability Toggle */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <span className="text-slate-300 font-medium">Filter by:</span>
          <button
            onClick={() => setAvailability("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              availability === "all"
                ? "bg-white text-blue-950 font-bold"
                : "bg-blue-950/60 text-slate-300 hover:text-white"
            }`}
          >
            All Academic Holdings
          </button>
          <button
            onClick={() => setAvailability("available")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              availability === "available"
                ? "bg-white text-blue-950 font-bold"
                : "bg-blue-950/60 text-slate-300 hover:text-white"
            }`}
          >
            Available on Shelf Right Now
          </button>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Found {books.length} Catalog Titles</span>
          <button
            onClick={fetchCatalog}
            className="hover:text-blue-700 flex items-center gap-1 font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            Loading catalog holdings...
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No catalog books found matching your query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {b.coverUrl ? (
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-20 h-28 object-cover rounded-lg shadow-xs border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        {b.category?.name || "General"}
                      </span>
                      <Link
                        href={`/portal/catalog/${b.id}`}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-2 mt-0.5 leading-snug"
                      >
                        {b.title}
                      </Link>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-1">
                        {b.authors?.map((a: any) => a.author.name).join(", ")}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Call: {b.classificationNumber || "N/A"}
                      </div>
                    </div>
                  </div>

                  {b.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  )}

                  {/* Physical Location Snippet */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-slate-800">Shelf Coordinate: </span>
                    {b.section?.name || "Main Library"} •{" "}
                    {b.copies?.[0]?.shelf?.code ? `Shelf ${b.copies[0].shelf.code}` : "Reserve Desk"}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    {b.availableCopies > 0 ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        {b.availableCopies} of {b.totalCopies} Available
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                        All {b.totalCopies} Borrowed
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/portal/catalog/${b.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
