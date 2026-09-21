"use client";

import React, { useState, useEffect } from "react";
import { Sliders, CheckCircle2, RefreshCw, Save, ShieldCheck } from "lucide-react";

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPolicies = () => {
    setLoading(true);
    fetch("/api/policies")
      .then((res) => res.json())
      .then((data) => {
        if (data.policies) setPolicies(data.policies);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleFieldChange = (memberType: string, field: string, value: any) => {
    setPolicies((prev) =>
      prev.map((p) => (p.memberType === memberType ? { ...p, [field]: value } : p))
    );
  };

  const handleSavePolicy = async (policy: any) => {
    setSavingKey(policy.memberType);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });

      if (res.ok) {
        setSuccessMsg(`Policy for ${policy.memberType} updated and recorded into institutional audit log.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const json = await res.json();
        alert(json.error || "Failed to update policy.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <Sliders className="w-4 h-4 text-blue-700" />
            Institutional Rules & Lending Policies
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Configurable Borrowing Policies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Rule engine: Configure borrowing limits, checkout durations, fine rates, and grace periods by member tier.
          </p>
        </div>

        <button
          onClick={fetchPolicies}
          className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading university lending rules...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {policies.map((p) => (
            <div
              key={p.memberType}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-600" />
                  <h2 className="font-bold text-slate-900 text-base">{p.memberType} Policy</h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Tier: {p.memberType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Active Loans
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={p.maxActiveLoans}
                    onChange={(e) => handleFieldChange(p.memberType, "maxActiveLoans", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Loan Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={p.loanDurationDays}
                    onChange={(e) => handleFieldChange(p.memberType, "loanDurationDays", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Allowed Renewals
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={p.maxRenewals}
                    onChange={(e) => handleFieldChange(p.memberType, "maxRenewals", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Active Holds / Reservations
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={p.reservationLimit}
                    onChange={(e) => handleFieldChange(p.memberType, "reservationLimit", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Daily Overdue Fine ($/day)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={p.dailyFineRate}
                    onChange={(e) => handleFieldChange(p.memberType, "dailyFineRate", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    value={p.gracePeriodDays}
                    onChange={(e) => handleFieldChange(p.memberType, "gracePeriodDays", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Changes audited under Institutional Directive
                </span>
                <button
                  onClick={() => handleSavePolicy(p)}
                  disabled={savingKey === p.memberType}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingKey === p.memberType ? "Saving..." : "Save Policy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
