"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserCheck, Shield, BookOpen, User, RefreshCw, Sparkles } from "lucide-react";

interface RoleOption {
  memberId: string;
  name: string;
  role: string;
  type: string;
  badgeColor: string;
  description: string;
}

const DEMO_PERSONAS: RoleOption[] = [
  {
    memberId: "DIR-001",
    name: "Dr. Eleanor Vance",
    role: "Library Director",
    type: "STAFF",
    badgeColor: "bg-indigo-600 text-white",
    description: "Executive policies, budgets, staff, fine waivers, and comprehensive KPIs",
  },
  {
    memberId: "CIRC-001",
    name: "Sarah Jenkins",
    role: "Circulation Staff",
    type: "STAFF",
    badgeColor: "bg-emerald-600 text-white",
    description: "Rapid barcode scanning, instant issue/return, condition inspection",
  },
  {
    memberId: "LIB-001",
    name: "Marcus Chen, MLIS",
    role: "Librarian & Cataloger",
    type: "STAFF",
    badgeColor: "bg-sky-600 text-white",
    description: "Catalog titles, editions, barcode generation, shelf management",
  },
  {
    memberId: "INV-001",
    name: "David Miller",
    role: "Inventory Auditor",
    type: "STAFF",
    badgeColor: "bg-amber-600 text-white",
    description: "Shelf inventory audit, misplaced and missing book reconciliation",
  },
  {
    memberId: "STU-2026-001",
    name: "Muhammad Ali",
    role: "Student (Active)",
    type: "STUDENT",
    badgeColor: "bg-blue-600 text-white",
    description: "Standard borrowing policy (14 days, 5 max), OPAC search, holds",
  },
  {
    memberId: "STU-2026-003",
    name: "James Chen",
    role: "Student (Restricted)",
    type: "STUDENT",
    badgeColor: "bg-rose-600 text-white",
    description: "Overdue books & unpaid fines trigger system checkout restriction",
  },
  {
    memberId: "FAC-2026-001",
    name: "Prof. Alan Turing",
    role: "Faculty Member",
    type: "FACULTY",
    badgeColor: "bg-purple-600 text-white",
    description: "Extended borrowing (45 days, 15 max), course reserves",
  },
  {
    memberId: "ADMIN-001",
    name: "Dr. Alexander Wright",
    role: "Super Administrator",
    type: "ADMIN",
    badgeColor: "bg-slate-900 text-white",
    description: "Global system configuration, RBAC matrix, and audit monitoring",
  },
];

export const RoleSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSwitch = async (memberId: string) => {
    setIsSwitching(true);
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch persona", err);
    } finally {
      setIsSwitching(false);
    }
  };

  const activePersona =
    DEMO_PERSONAS.find((p) => p.memberId === currentUser?.memberId) || DEMO_PERSONAS[0];

  return (
    <div className="relative z-50 bg-slate-900 text-slate-100 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-semibold tracking-wide text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          UNIVERSITY RBAC ENGINE:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-300">Active Persona:</span>
          <span className={`px-2 py-0.5 rounded font-medium ${activePersona.badgeColor}`}>
            {activePersona.role}
          </span>
          <span className="font-semibold text-slate-100">{activePersona.name}</span>
          <span className="text-slate-400 font-mono">({activePersona.memberId})</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isSwitching ? "animate-spin" : ""}`} />
          Switch Role / Persona
        </button>

        {isOpen && (
          <div className="absolute right-4 top-9 w-96 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 p-3 z-50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-800 text-sm">Select Institutional Persona</span>
              <span className="text-xs text-slate-500">Live RBAC Simulation</span>
            </div>
            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.memberId}
                  onClick={() => handleSwitch(p.memberId)}
                  className={`w-full text-left p-2 rounded-md transition-all border ${
                    activePersona.memberId === p.memberId
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : "hover:bg-slate-50 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">{p.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.badgeColor}`}>
                      {p.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{p.memberId}</div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">{p.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSwitcher;
