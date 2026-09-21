import React from "react";
import MemberNavbar from "@/components/MemberNavbar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <MemberNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          © 2026 University Library Resources System. All rights reserved. Academic Holdings & Circulation Network.
        </div>
      </footer>
    </div>
  );
}
