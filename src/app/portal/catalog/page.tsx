"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowRight,
  X,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

function CatalogSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL query params
  const initialQ = searchParams.get("q") || "";
  const initialSubject = searchParams.get("subject") || "";
  const initialAvailability = searchParams.get("availability") || "all";

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQ);
  const [availability, setAvailability] = useState(initialAvailability);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  // Keep search input synced with URL
  useEffect(() => {
    if (searchParams.get("q") !== null) {
      setSearch(searchParams.get("q") || "");
    }
    if (searchParams.get("subject") !== null) {
      setSelectedSubject(searchParams.get("subject") || "");
    }
    if (searchParams.get("availability") !== null) {
      setAvailability(searchParams.get("availability") || "all");
    }
  }, [searchParams]);

  const fetchCatalog = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "40" });

    if (search.trim()) params.append("q", search.trim());
    if (availability === "available") params.append("availability", "available");
    if (selectedSubject && selectedSubject !== "all") params.append("subject", selectedSubject);
    if (selectedCategory && selectedCategory !== "all") params.append("categoryId", selectedCategory);
    if (selectedSection && selectedSection !== "all") params.append("sectionId", selectedSection);

    fetch(`/api/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let resultBooks = data.books || [];

        // Client-side year filter if specified
        if (selectedYear !== "all") {
          const currentYear = new Date().getFullYear();
          if (selectedYear === "recent") {
            resultBooks = resultBooks.filter((b: any) => b.publicationYear >= currentYear - 3);
          } else if (selectedYear === "2015_2020") {
            resultBooks = resultBooks.filter(
              (b: any) => b.publicationYear >= 2015 && b.publicationYear <= 2020
            );
          } else if (selectedYear === "older") {
            resultBooks = resultBooks.filter((b: any) => b.publicationYear < 2015);
          }
        }

        setBooks(resultBooks);

        // Extract distinct categories & sections from books for filter dropdowns if not yet set
        if (categories.length === 0) {
          const catMap = new Map();
          const secMap = new Map();
          resultBooks.forEach((b: any) => {
            if (b.category?.id && !catMap.has(b.category.id)) {
              catMap.set(b.category.id, b.category);
            }
            if (b.section?.id && !secMap.has(b.section.id)) {
              secMap.set(b.section.id, b.section);
            }
          });
          setCategories(Array.from(catMap.values()));
          setSections(Array.from(secMap.values()));
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
  }, [availability, selectedSubject, selectedCategory, selectedSection, selectedYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCatalog();
  };

  const clearAllFilters = () => {
    setSearch("");
    setAvailability("all");
    setSelectedSubject("");
    setSelectedCategory("all");
    setSelectedSection("all");
    setSelectedYear("all");
    router.push("/portal/catalog");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    availability !== "all" ||
    (selectedSubject !== "" && selectedSubject !== "all") ||
    selectedCategory !== "all" ||
    selectedSection !== "all" ||
    selectedYear !== "all";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Main Search Area */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-blue-700 uppercase">
            Search & Find Books
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Library Catalog & Book Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Search physical books, check real-time shelf copies, and place reservations.
          </p>
        </div>

        {/* Primary Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Title, Author, ISBN, Subject, or Keyword..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 rounded-2xl pl-11 pr-10 py-3.5 text-xs sm:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
          >
            <span>Search Books</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Simple Filters Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-700" />
            <span>Filters:</span>
          </div>

          {/* Filter 1: Available Now Toggle */}
          <button
            type="button"
            onClick={() => setAvailability(availability === "available" ? "all" : "available")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              availability === "available"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                availability === "available" ? "text-emerald-600" : "text-slate-400"
              }`}
            />
            Available on Shelf Now
          </button>

          {/* Filter 2: Subject Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="">All Subjects</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Database Systems">Database Systems</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Medicine">Medicine & Health</option>
            <option value="Physics">Physics</option>
            <option value="Law">Law & Jurisprudence</option>
          </select>

          {/* Filter 3: Category Selector */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Filter 4: Campus Location / Section */}
          {sections.length > 0 && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">All Library Locations</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.building})
                </option>
              ))}
            </select>
          )}

          {/* Filter 5: Publication Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="all">Any Publication Year</option>
            <option value="recent">Recent (Last 3 Years)</option>
            <option value="2015_2020">2015 – 2020</option>
            <option value="older">Before 2015</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">
            Showing {books.length} {books.length === 1 ? "book" : "books"}
          </span>
          {availability === "available" && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Available Only
            </span>
          )}
          {selectedSubject && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Subject: {selectedSubject}
            </span>
          )}
        </div>

        <button
          onClick={fetchCatalog}
          className="hover:text-blue-700 flex items-center gap-1.5 font-semibold text-slate-600"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Finding books in library catalog...
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="font-bold text-slate-800 text-base">No Books Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            We couldn't find any books matching your search query or active filters. Try searching for a broader term or reset your filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            Show All Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {books.map((b) => {
            const hasAvailable = b.availableCopies > 0;
            const primaryAuthor = b.authors?.[0]?.author?.name;
            const otherAuthorsCount = (b.authors?.length || 1) - 1;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Top info with cover */}
                  <div className="flex gap-4 items-start">
                    {b.coverUrl ? (
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-20 h-28 object-cover rounded-xl shadow-xs border border-slate-200 shrink-0 group-hover:shadow-md transition-shadow"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block truncate">
                        {b.category?.name || b.subject || "Academic"}
                      </span>
                      <Link
                        href={`/portal/catalog/${b.id}`}
                        className="font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors line-clamp-2 mt-0.5 leading-snug"
                      >
                        {b.title}
                      </Link>

                      <div className="text-xs text-slate-600 mt-1 line-clamp-1">
                        {primaryAuthor}
                        {otherAuthorsCount > 0 ? ` +${otherAuthorsCount}` : ""}
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono mt-1">
                        Year: {b.publicationYear} {b.edition ? `• ${b.edition}` : ""}
                      </div>
                    </div>
                  </div>

                  {/* Synopsis snippet */}
                  {b.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  )}

                  {/* Shelf Location */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800">Find on shelf: </span>
                      <span>{b.section?.name || "Main Library"}</span>
                      <span className="text-slate-400 font-mono">
                        {" "}
                        • {b.copies?.[0]?.shelf?.code ? `Shelf ${b.copies[0].shelf.code}` : "Reserve Desk"}
                        {b.copies?.[0]?.rack ? ` (${b.copies[0].rack})` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action & Availability */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    {hasAvailable ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {b.availableCopies} {b.availableCopies === 1 ? "Copy" : "Copies"} Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        All Borrowed (Reserve)
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/portal/catalog/${b.id}`}
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                  >
                    <span>View Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MemberCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading library catalog...
        </div>
      }
    >
      <CatalogSearchContent />
    </Suspense>
  );
}
