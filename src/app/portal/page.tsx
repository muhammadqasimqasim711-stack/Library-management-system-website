"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Clock,
  AlertTriangle,
  Bookmark,
  CircleDollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building,
  GraduationCap,
  Layers,
  Code,
  Brain,
  Calculator,
  HeartPulse,
  Scale,
  Atom,
  Database,
} from "lucide-react";

export default function StudentHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [summary, setSummary] = useState({
    myBooks: 0,
    dueSoon: 0,
    overdue: 0,
    reservations: 0,
    outstandingFine: 0,
    loading: true,
  });
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [popularBooks, setPopularBooks] = useState<any[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch current user
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          // 2. Fetch user's summary metrics
          Promise.all([
            fetch("/api/circulation/loans").then((r) => (r.ok ? r.json() : { loans: [] })),
            fetch("/api/reservations").then((r) => (r.ok ? r.json() : { reservations: [] })),
            fetch("/api/fines").then((r) => (r.ok ? r.json() : { fines: [], metrics: { totalOutstanding: 0 } })),
          ])
            .then(([loansData, resData, finesData]) => {
              const loans = loansData.loans || [];
              const now = new Date();
              const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

              const activeLoans = loans.filter((l: any) => l.status === "ACTIVE" || l.status === "OVERDUE");
              const overdueCount = activeLoans.filter((l: any) => {
                return l.status === "OVERDUE" || new Date(l.dueDate) < now;
              }).length;

              const dueSoonCount = activeLoans.filter((l: any) => {
                const due = new Date(l.dueDate);
                return due >= now && due <= threeDaysFromNow;
              }).length;

              const activeReservations = (resData.reservations || []).filter(
                (r: any) => r.status === "PENDING" || r.status === "ON_HOLD"
              ).length;

              const fineTotal = finesData?.metrics?.totalOutstanding || 0;

              setSummary({
                myBooks: activeLoans.length,
                dueSoon: dueSoonCount,
                overdue: overdueCount,
                reservations: activeReservations,
                outstandingFine: fineTotal,
                loading: false,
              });
            })
            .catch(() => {
              setSummary((prev) => ({ ...prev, loading: false }));
            });
        } else {
          setSummary((prev) => ({ ...prev, loading: false }));
        }
      })
      .catch(() => {
        setSummary((prev) => ({ ...prev, loading: false }));
      });

    // 3. Fetch books for Available & Popular sections
    fetch("/api/books?limit=12")
      .then((res) => (res.ok ? res.json() : { books: [] }))
      .then((data) => {
        const all = data.books || [];
        // Available books right now
        const available = all.filter((b: any) => b.availableCopies > 0).slice(0, 4);
        setAvailableBooks(available);
        // Popular books
        setPopularBooks(all.slice(0, 4));
        setBooksLoading(false);
      })
      .catch(() => {
        setBooksLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/portal/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/portal/catalog");
    }
  };

  const subjectCategories = [
    { name: "Computer Science", icon: Code, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { name: "Artificial Intelligence", icon: Brain, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { name: "Mathematics", icon: Calculator, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "Medicine & Health", icon: HeartPulse, color: "text-rose-600 bg-rose-50 border-rose-200" },
    { name: "Software Engineering", icon: Layers, color: "text-sky-600 bg-sky-50 border-sky-200" },
    { name: "Database Systems", icon: Database, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
    { name: "Physics", icon: Atom, color: "text-purple-600 bg-purple-50 border-purple-200" },
    { name: "Law & Jurisprudence", icon: Scale, color: "text-amber-600 bg-amber-50 border-amber-200" },
  ];

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Large Search Hero Area */}
      <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-200 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            University Library & Member Catalog
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Find books, reserve copies, and manage your loans
          </h1>

          <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto">
            Search physical books in the campus library, check shelf availability in real-time, and renew borrowed books with one click.
          </p>

          {/* Primary Focus: Large Search Area */}
          <form onSubmit={handleSearchSubmit} className="pt-3 sm:pt-4">
            <div className="bg-white p-1.5 sm:p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-slate-200/20">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors, ISBN, subjects..."
                  className="w-full bg-transparent text-slate-900 pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <span>Search Books</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2 text-xs text-slate-300">
            <span className="text-slate-400 mr-1">Popular searches:</span>
            {["Algorithms", "Clean Code", "Artificial Intelligence", "Calculus", "Physics", "Medicine"].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => router.push(`/portal/catalog?q=${encodeURIComponent(term)}`)}
                  className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg transition-colors border border-white/10 text-xs"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* 2. My Library Summary */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
              My Library Summary
            </h2>
            <p className="text-xs text-slate-500">
              {currentUser
                ? `Account: ${currentUser.fullName} (${currentUser.memberId})`
                : "Sign in to view your borrowed books, holds, and account balance"}
            </p>
          </div>
          {currentUser && (
            <Link
              href="/portal/my-loans"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>View all loans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: My Books */}
          <Link
            href="/portal/my-loans"
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                My Books
              </span>
              <BookOpen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {summary.loading ? "..." : summary.myBooks}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Currently borrowed</div>
            </div>
          </Link>

          {/* Card 2: Due Soon */}
          <Link
            href="/portal/my-loans"
            className={`rounded-2xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between ${
              summary.dueSoon > 0
                ? "bg-amber-50/70 border-amber-300 hover:border-amber-400"
                : "bg-white border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  summary.dueSoon > 0 ? "text-amber-800" : "text-slate-500"
                }`}
              >
                Due Soon
              </span>
              <Clock
                className={`w-4 h-4 ${
                  summary.dueSoon > 0 ? "text-amber-600" : "text-slate-400"
                } group-hover:scale-110 transition-transform`}
              />
            </div>
            <div>
              <div
                className={`text-2xl sm:text-3xl font-bold font-mono ${
                  summary.dueSoon > 0 ? "text-amber-900" : "text-slate-900"
                }`}
              >
                {summary.loading ? "..." : summary.dueSoon}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Within next 3 days</div>
            </div>
          </Link>

          {/* Card 3: Overdue */}
          <Link
            href="/portal/my-loans"
            className={`rounded-2xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between ${
              summary.overdue > 0
                ? "bg-rose-50/70 border-rose-300 hover:border-rose-400"
                : "bg-white border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  summary.overdue > 0 ? "text-rose-800" : "text-slate-500"
                }`}
              >
                Overdue
              </span>
              <AlertTriangle
                className={`w-4 h-4 ${
                  summary.overdue > 0 ? "text-rose-600" : "text-slate-400"
                } group-hover:scale-110 transition-transform`}
              />
            </div>
            <div>
              <div
                className={`text-2xl sm:text-3xl font-bold font-mono ${
                  summary.overdue > 0 ? "text-rose-700" : "text-slate-900"
                }`}
              >
                {summary.loading ? "..." : summary.overdue}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {summary.overdue > 0 ? "Please return soon" : "None overdue"}
              </div>
            </div>
          </Link>

          {/* Card 4: Reservations */}
          <Link
            href="/portal/my-reservations"
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Reservations
              </span>
              <Bookmark className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                {summary.loading ? "..." : summary.reservations}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Saved holds in queue</div>
            </div>
          </Link>

          {/* Card 5: Outstanding Fine */}
          <Link
            href="/portal/my-fines"
            className={`col-span-2 sm:col-span-1 rounded-2xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between ${
              summary.outstandingFine > 0
                ? "bg-rose-50/70 border-rose-300 hover:border-rose-400"
                : "bg-white border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  summary.outstandingFine > 0 ? "text-rose-800" : "text-slate-500"
                }`}
              >
                Outstanding Fine
              </span>
              <CircleDollarSign
                className={`w-4 h-4 ${
                  summary.outstandingFine > 0 ? "text-rose-600" : "text-emerald-600"
                } group-hover:scale-110 transition-transform`}
              />
            </div>
            <div>
              <div
                className={`text-2xl sm:text-3xl font-bold font-mono ${
                  summary.outstandingFine > 0 ? "text-rose-700" : "text-emerald-700"
                }`}
              >
                ${summary.loading ? "0.00" : summary.outstandingFine.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {summary.outstandingFine > 0 ? "Account balance due" : "Good standing"}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Browse by Subject */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
              Browse by Subject
            </h2>
            <p className="text-xs text-slate-500">
              Explore catalog holdings organized by academic department
            </p>
          </div>
          <Link
            href="/portal/catalog"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>All subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {subjectCategories.map((sub) => {
            const Icon = sub.icon;
            return (
              <Link
                key={sub.name}
                href={`/portal/catalog?subject=${encodeURIComponent(sub.name)}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-md transition-all group flex items-center gap-3.5"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${sub.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                    {sub.name}
                  </div>
                  <div className="text-[10px] text-slate-400">View catalog →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Available Books Right Now */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                Available on Shelf Right Now
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Copies ready for immediate pickup from library stacks
            </p>
          </div>
          <Link
            href="/portal/catalog?availability=available"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>See all available</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {booksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {availableBooks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {b.coverUrl ? (
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-16 h-24 object-cover rounded-lg shadow-xs border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block truncate">
                        {b.category?.name || "General"}
                      </span>
                      <Link
                        href={`/portal/catalog/${b.id}`}
                        className="font-bold text-slate-900 text-xs sm:text-sm hover:text-blue-600 transition-colors line-clamp-2 mt-0.5 leading-snug"
                      >
                        {b.title}
                      </Link>
                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {b.authors?.map((a: any) => a.author.name).join(", ")}
                      </div>
                    </div>
                  </div>

                  {/* Shelf Location */}
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                    <span className="font-semibold text-slate-800">Find on shelf: </span>
                    {b.section?.name || "Main Library"} •{" "}
                    {b.copies?.[0]?.shelf?.code ? `Shelf ${b.copies[0].shelf.code}` : "Reserve Desk"}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {b.availableCopies} available
                  </span>
                  <Link
                    href={`/portal/catalog/${b.id}`}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    View Book →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Popular Books / Recommended */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
              Popular Academic Books
            </h2>
            <p className="text-xs text-slate-500">
              Frequently requested textbooks and research literature
            </p>
          </div>
          <Link
            href="/portal/catalog"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>Explore catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {popularBooks.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="flex gap-3">
                  {b.coverUrl ? (
                    <img
                      src={b.coverUrl}
                      alt={b.title}
                      className="w-16 h-24 object-cover rounded-lg shadow-xs border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                      {b.category?.name || "Textbook"}
                    </span>
                    <Link
                      href={`/portal/catalog/${b.id}`}
                      className="font-bold text-slate-900 text-xs sm:text-sm hover:text-blue-600 transition-colors line-clamp-2 mt-0.5 leading-snug"
                    >
                      {b.title}
                    </Link>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                      {b.authors?.map((a: any) => a.author.name).join(", ")}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 line-clamp-2">
                  {b.description || "Comprehensive academic reference text for university coursework and research."}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {b.availableCopies > 0 ? (
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {b.availableCopies} Copies Available
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700">
                      Hold queue active
                    </span>
                  )}
                </div>
                <Link
                  href={`/portal/catalog/${b.id}`}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Helpful Library Services */}
      <section className="bg-slate-100/80 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900">
            Student & Faculty Library Services
          </h2>
          <p className="text-xs text-slate-500">
            Everything you need for productive study and academic success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <Building className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Quiet & Group Study Rooms</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Book individual study cubicles or collaborative study rooms with smart screens for your team projects.
            </p>
            <div className="pt-1">
              <Link
                href="/portal/facilities"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                Reserve a study space →
              </Link>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Borrowing Periods</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Undergraduate students can borrow up to 5 books for 14 days. Faculty and graduate researchers receive 30-day loans.
            </p>
            <div className="pt-1">
              <Link
                href="/portal/profile"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
              >
                View borrowing policies →
              </Link>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Hold Pickup Location</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a reserved book is ready, collect it from the Main Circulation Desk on Ground Level within 48 hours.
            </p>
            <div className="pt-1">
              <Link
                href="/portal/my-reservations"
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
              >
                Check your holds →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
