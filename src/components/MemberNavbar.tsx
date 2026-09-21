"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Clock, Users, Coins, Building, Bell, Shield, Search } from "lucide-react";

export const MemberNavbar: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch((err) => console.error(err));
  }, []);

  const navLinks = [
    { label: "Search Catalog", href: "/portal/catalog", icon: Search },
    { label: "My Loans", href: "/portal/my-loans", icon: Clock },
    { label: "My Reservations", href: "/portal/my-reservations", icon: Users },
    { label: "My Fines", href: "/portal/my-fines", icon: Coins },
    { label: "Study Rooms", href: "/portal/facilities", icon: Building },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Title */}
          <div className="flex items-center gap-3">
            <Link href="/portal/catalog" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-blue-900 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                Ψ
              </div>
              <div>
                <span className="font-serif font-bold text-blue-950 text-base tracking-tight block">
                  UNIVERSITY LIBRARY
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block">
                  Online Public Access Catalog (OPAC)
                </span>
              </div>
            </Link>
          </div>

          {/* Nav items */}
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

          {/* Right actions: Notifications & User profile & Staff Switcher */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md border border-slate-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              Staff / Admin Suite
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800">
                  {currentUser?.fullName || "University Member"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentUser?.memberId || "STU-2026-001"}
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-800">
                {currentUser?.fullName?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MemberNavbar;
