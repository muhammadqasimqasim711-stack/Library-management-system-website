"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Clock, Users, Coins, Building, Bell, Shield, Search, Menu, X } from "lucide-react";

export const MemberNavbar: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          setCurrentUser(null);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
        else setCurrentUser(null);
      })
      .catch((err) => {
        console.error(err);
        setCurrentUser(null);
      });
  }, []);

  const isUserAdmin =
    currentUser?.memberType === "ADMIN" ||
    currentUser?.roles?.includes("SUPER_ADMIN") ||
    currentUser?.roles?.includes("ADMIN");

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Find Books", href: "/portal/catalog", icon: Search },
    { label: "Books You Have Now", href: "/portal/my-loans", icon: Clock },
    { label: "Books You Saved", href: "/portal/my-reservations", icon: Users },
    { label: "Your Late Fees", href: "/portal/my-fines", icon: Coins },
    { label: "Book a Study Room", href: "/portal/facilities", icon: Building },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/portal/catalog" className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-blue-900 flex items-center justify-center text-white font-serif font-bold text-base sm:text-lg shadow-sm shrink-0">
                Ψ
              </div>
              <div className="min-w-0">
                <span className="font-serif font-bold text-blue-950 text-sm sm:text-base tracking-tight block truncate">
                  UNIVERSITY LIBRARY
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-semibold block truncate">
                  Find & Borrow Books
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/portal/notifications"
              className="relative p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </Link>

            {isUserAdmin && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md border border-slate-300 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                <span>Staff & Admin Desk</span>
              </Link>
            )}

            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800">
                  {currentUser?.fullName || "University Member"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentUser?.memberId || "STU-2026-001"}
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-800 shrink-0">
                {currentUser?.fullName?.charAt(0) || "U"}
              </div>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-700" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 mt-2 space-y-2">
              {isUserAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Shield className="w-4 h-4 text-blue-700" />
                  <span>Enter Admin Portal</span>
                </Link>
              )}

              <div className="px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{currentUser?.fullName || "University Member"}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{currentUser?.memberId || "STU-2026-001"}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {currentUser?.role || "STUDENT"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MemberNavbar;
