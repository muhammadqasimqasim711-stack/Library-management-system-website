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
    role: "Library Boss / Director",
    type: "STAFF",
    badgeColor: "bg-indigo-600 text-white",
    description: "Can see all reports, change rules, and forgive late fees",
  },
  {
    memberId: "CIRC-001",
    name: "Sarah Jenkins",
    role: "Book Desk Worker",
    type: "STAFF",
    badgeColor: "bg-emerald-600 text-white",
    description: "Gives books to members, takes them back, and scans barcodes",
  },
  {
    memberId: "LIB-001",
    name: "Marcus Chen, MLIS",
    role: "Librarian & Book Maker",
    type: "STAFF",
    badgeColor: "bg-sky-600 text-white",
    description: "Adds new books, makes barcodes, and puts books on shelves",
  },
  {
    memberId: "INV-001",
    name: "David Miller",
    role: "Shelf Checker",
    type: "STAFF",
    badgeColor: "bg-amber-600 text-white",
    description: "Checks books on shelves to see if any are lost or in the wrong place",
  },
  {
    memberId: "STU-2026-001",
    name: "Muhammad Ali",
    role: "Student (Good Standing)",
    type: "STUDENT",
    badgeColor: "bg-blue-600 text-white",
    description: "Can borrow up to 5 books for 14 days and save books",
  },
  {
    memberId: "STU-2026-003",
    name: "James Chen",
    role: "Student (Blocked / Has Late Fee)",
    type: "STUDENT",
    badgeColor: "bg-rose-600 text-white",
    description: "Has late books or late fees and cannot borrow more right now",
  },
  {
    memberId: "FAC-2026-001",
    name: "Prof. Alan Turing",
    role: "Teacher / Faculty",
    type: "FACULTY",
    badgeColor: "bg-purple-600 text-white",
    description: "Can borrow up to 15 books for 45 days",
  },
  {
    memberId: "ADMIN-001",
    name: "Dr. Alexander Wright",
    role: "Main Library Manager",
    type: "ADMIN",
    badgeColor: "bg-slate-900 text-white",
    description: "Full control over all parts of the library system",
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

  const handleLogout = async () => {
    setIsSwitching(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setIsSwitching(false);
    }
  };

  const activePersona = currentUser
    ? DEMO_PERSONAS.find((p) => p.memberId === currentUser?.memberId) || {
        memberId: currentUser.memberId,
        name: currentUser.fullName,
        role: currentUser.roles?.[0] || currentUser.memberType,
        type: currentUser.memberType,
        badgeColor: currentUser.memberType === "ADMIN" ? "bg-slate-900 text-white" : "bg-blue-600 text-white",
        description: "",
      }
    : null;

  return (
    <div className="relative z-50 bg-slate-900 text-slate-100 text-xs px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="hidden sm:flex items-center gap-1.5 font-semibold tracking-wide text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          TEST AS ANY USER:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-slate-300 hidden xs:inline">Current User:</span>
          {activePersona ? (
            <>
              <span className={`px-2 py-0.5 rounded font-medium text-[11px] sm:text-xs ${activePersona.badgeColor}`}>
                {activePersona.role}
              </span>
              <span className="font-semibold text-slate-100 text-[11px] sm:text-xs truncate max-w-[90px] xs:max-w-[160px] sm:max-w-none">{activePersona.name}</span>
              <span className="text-slate-400 font-mono text-[10px] sm:text-xs hidden md:inline">({activePersona.memberId})</span>
            </>
          ) : (
            <span className="px-2 py-0.5 rounded font-medium text-[11px] sm:text-xs bg-slate-800 text-slate-400 border border-slate-700">
              Not Logged In
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {currentUser && (
          <button
            onClick={handleLogout}
            disabled={isSwitching}
            className="text-[11px] text-slate-400 hover:text-rose-300 px-2 py-1 transition-colors"
          >
            Log Out
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 sm:px-2.5 py-1 rounded text-xs transition-colors shrink-0"
        >
          <RefreshCw className={`w-3 h-3 ${isSwitching ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Switch User Account</span>
          <span className="sm:hidden">Switch User</span>
        </button>

        {isOpen && (
          <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-4 top-10 sm:top-9 sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 p-3 z-50">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-bold text-slate-800 text-xs sm:text-sm">Choose User to Test As</span>
              <span className="text-[10px] sm:text-xs text-slate-500">Quick Test Switcher</span>
            </div>
            <div className="space-y-1.5 max-h-[75vh] sm:max-h-96 overflow-y-auto pr-1">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.memberId}
                  onClick={() => handleSwitch(p.memberId)}
                  className={`w-full text-left p-2 rounded-md transition-all border ${
                    activePersona?.memberId === p.memberId
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
