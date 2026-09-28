"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, BookOpen, UserCheck, AlertCircle, ArrowRight, Lock } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    memberId: "ADMIN-001",
    name: "Dr. Alexander Wright",
    role: "Super Administrator",
    type: "ADMIN",
    badge: "bg-slate-900 text-white",
  },
  {
    memberId: "STU-2026-001",
    name: "Muhammad Ali",
    role: "Active Student",
    type: "STUDENT",
    badge: "bg-blue-600 text-white",
  },
  {
    memberId: "FAC-2026-001",
    name: "Prof. Alan Turing",
    role: "Faculty Member",
    type: "FACULTY",
    badge: "bg-purple-600 text-white",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";

  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          const isUserAdmin =
            data.user.memberType === "ADMIN" ||
            data.user.roles?.includes("SUPER_ADMIN") ||
            data.user.roles?.includes("ADMIN");

          if (isUserAdmin) {
            router.push(redirectPath.startsWith("/admin") ? redirectPath : "/admin/dashboard");
          } else {
            router.push("/portal/catalog");
          }
        }
      })
      .catch(() => {});
  }, [redirectPath, router]);

  const handleLogin = async (targetId: string) => {
    if (!targetId.trim()) {
      setError("Please enter a valid Member ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: targetId.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      const isUserAdmin =
        data.user.memberType === "ADMIN" ||
        data.user.roles?.includes("SUPER_ADMIN") ||
        data.user.roles?.includes("ADMIN");

      if (isUserAdmin) {
        router.push(redirectPath.startsWith("/admin") ? redirectPath : "/admin/dashboard");
      } else {
        router.push("/portal/catalog");
      }
      router.refresh();
    } catch (err: any) {
      setError("Failed to connect to authentication server");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center font-serif text-2xl font-bold shadow-lg shadow-blue-500/20 mb-4">
          Ψ
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
          University Authentication
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Academic Holdings & Centralized Circulation Gateway
        </p>

        {redirectPath && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Authentication required to access requested resource</span>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/90 border border-slate-700 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(memberId);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Institutional Member ID
              </label>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="e.g. ADMIN-001 or STU-2026-001"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Institutional Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Institutional Sign In:
            </div>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.memberId}
                  type="button"
                  onClick={() => {
                    setMemberId(acc.memberId);
                    handleLogin(acc.memberId);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-white">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{acc.memberId}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${acc.badge}`}>
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/portal/catalog"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              ← Return to Public Catalog (OPAC)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
