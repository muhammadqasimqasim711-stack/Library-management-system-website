"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  BookOpen,
  Bookmark,
  CircleDollarSign,
  Bell,
  User,
  Shield,
  Menu,
  X,
  Building,
} from "lucide-react";

export const MemberNavbar: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch authenticated user
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
      .catch(() => setCurrentUser(null));

    // Fetch unread notifications
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.unreadCount !== undefined) {
          setUnreadNotifications(data.unreadCount);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const isUserAdmin =
    currentUser?.memberType === "ADMIN" ||
    currentUser?.roles?.includes("SUPER_ADMIN") ||
    currentUser?.roles?.includes("ADMIN");

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/portal", icon: Home },
    { label: "Search Books", href: "/portal/catalog", icon: Search },
    { label: "My Loans", href: "/portal/my-loans", icon: BookOpen },
    { label: "My Reservations", href: "/portal/my-reservations", icon: Bookmark },
    { label: "My Fines", href: "/portal/my-fines", icon: CircleDollarSign },
    { label: "Study Rooms", href: "/portal/facilities", icon: Building },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Title */}
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-blue-900 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm group-hover:bg-blue-800 transition-colors shrink-0">
                Ψ
              </div>
              <div className="min-w-0">
                <span className="font-serif font-bold text-blue-950 text-sm sm:text-base tracking-tight block leading-tight">
                  UNIVERSITY LIBRARY
                </span>
                <span className="text-[10px] text-blue-700 font-semibold block uppercase tracking-wider">
                  Student & Faculty Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-900 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Bell */}
            <Link
              href="/portal/notifications"
              className={`relative p-2 rounded-lg transition-colors ${
                pathname === "/portal/notifications"
                  ? "bg-blue-50 text-blue-900"
                  : "text-slate-600 hover:text-blue-900 hover:bg-slate-100"
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>

            {/* Profile Link (desktop) */}
            <Link
              href="/portal/profile"
              className={`hidden sm:flex items-center gap-2 pl-2.5 pr-3 py-1 rounded-xl border transition-all ${
                pathname === "/portal/profile"
                  ? "bg-blue-50 border-blue-200 text-blue-900"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
              }`}
              title="View Profile"
            >
              <div className="h-7 w-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-900 shrink-0">
                {currentUser?.fullName?.charAt(0) || "U"}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[110px]">
                  {currentUser?.fullName || "Member"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono -mt-0.5">
                  {currentUser?.memberId || "STU-2026-001"}
                </div>
              </div>
            </Link>

            {/* Admin Desk Link if admin */}
            {isUserAdmin && (
              <Link
                href="/admin/dashboard"
                className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-300 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                <span>Admin Suite</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(link.href);

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
                  <Icon className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Profile Link in Mobile */}
            <Link
              href="/portal/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                pathname === "/portal/profile"
                  ? "bg-blue-50 text-blue-900 font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <User className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Profile</span>
            </Link>

            {/* Notifications Link in Mobile */}
            <Link
              href="/portal/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                pathname === "/portal/notifications"
                  ? "bg-blue-50 text-blue-900 font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Notifications</span>
              </div>
              {unreadNotifications > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  {unreadNotifications} new
                </span>
              )}
            </Link>

            <div className="pt-2 border-t border-slate-100 mt-2 space-y-2">
              {isUserAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Shield className="w-4 h-4 text-blue-700" />
                  <span>Admin Suite</span>
                </Link>
              )}

              <div className="px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    {currentUser?.fullName || "University Member"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {currentUser?.memberId || "STU-2026-001"}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {currentUser?.memberType || "STUDENT"}
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
