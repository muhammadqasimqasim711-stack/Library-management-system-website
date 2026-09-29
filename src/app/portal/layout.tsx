import React from "react";
import Link from "next/link";
import MemberNavbar from "@/components/MemberNavbar";
import { BookOpen, Clock, MapPin, Phone, HelpCircle } from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 min-w-0 overflow-x-hidden text-slate-900 font-sans">
      <MemberNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white text-xs text-slate-500 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            {/* Column 1: About */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-900 flex items-center justify-center text-white font-serif font-bold text-sm">
                  Ψ
                </div>
                <span className="font-serif font-bold text-slate-900 text-sm">
                  University Library
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed text-xs">
                Empowering students, researchers, and faculty with seamless access to academic holdings, physical collections, and collaborative study spaces.
              </p>
            </div>

            {/* Column 2: Hours */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-700" />
                Library Hours
              </div>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex justify-between">
                  <span>Mon – Fri:</span>
                  <span className="font-medium text-slate-800">8:00 AM – 10:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-medium text-slate-800">10:00 AM – 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-medium text-slate-800">12:00 PM – 8:00 PM</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                Quick Services
              </div>
              <ul className="space-y-1.5 text-slate-600">
                <li>
                  <Link href="/portal/catalog" className="hover:text-blue-700 transition-colors">
                    Search Books & Resources
                  </Link>
                </li>
                <li>
                  <Link href="/portal/my-loans" className="hover:text-blue-700 transition-colors">
                    Renew Borrowed Books
                  </Link>
                </li>
                <li>
                  <Link href="/portal/my-reservations" className="hover:text-blue-700 transition-colors">
                    Check Hold Pickups
                  </Link>
                </li>
                <li>
                  <Link href="/portal/facilities" className="hover:text-blue-700 transition-colors">
                    Reserve a Study Room
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Help & Location */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                Desk Location & Help
              </div>
              <div className="space-y-1.5 text-slate-600">
                <p>Main Campus Library, Level 1</p>
                <p>Circulation & Assistance Desk</p>
                <p className="text-slate-700 font-medium">circulation@university.edu</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>© 2026 University Library Management System. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link href="/portal/catalog" className="hover:text-slate-600 transition-colors">
                Public Catalog
              </Link>
              <span>•</span>
              <Link href="/portal/profile" className="hover:text-slate-600 transition-colors">
                Borrowing Policy
              </Link>
              <span>•</span>
              <Link href="/login" className="hover:text-slate-600 transition-colors">
                Switch User
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
