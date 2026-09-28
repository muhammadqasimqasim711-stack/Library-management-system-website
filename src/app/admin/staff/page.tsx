"use client";

import React, { useState, useEffect } from "react";
import { Users, Shield, Plus, RefreshCw, X, CheckCircle2, ShieldCheck, Mail, Phone } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("LIBRARIAN");
  const [formLoading, setFormLoading] = useState(false);

  const fetchStaff = () => {
    setLoading(true);
    fetch("/api/members?memberType=STAFF")
      .then((res) => res.json())
      .then((data) => {
        if (data.members) setStaffList(data.members);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: formId,
          fullName: formName,
          email: formEmail,
          phone: formPhone,
          memberType: "STAFF",
          roleName: formRole,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormId("");
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        fetchStaff();
      } else {
        const json = await res.json();
        alert(json.error || "Failed to register staff member.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            Human Resources & Institutional Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Library Professional Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage professional librarians, circulation desk personnel, catalogers, inventory auditors, and acquisition specialists.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Onboard Staff Member
        </button>
      </div>

      {/* Staff Grid Cards */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading professional library personnel...
        </div>
      ) : staffList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No staff records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {staffList.map((st) => {
            const roleName = st.roles?.[0]?.role?.displayName || "Library Specialist";
            return (
              <div
                key={st.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {st.fullName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900 text-sm leading-tight">
                          {st.fullName}
                        </h2>
                        <div className="text-[11px] font-mono font-semibold text-blue-700 mt-0.5">
                          {st.memberId}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={st.status} size="sm" />
                  </div>

                  <div className="inline-block px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-xs">
                    {roleName}
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{st.email}</span>
                    </div>
                    {st.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{st.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Enrolled: {new Date(st.createdAt).toLocaleDateString()}</span>
                  <span className="text-emerald-700 font-semibold">Active Staff</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboard Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Onboard Professional Library Staff
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STF-105 or CIRC-002"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name & Credentials *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams, MLIS"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official University Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. r.adams@university.edu"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Operational Role *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LIBRARIAN">Librarian (Catalog & Curation)</option>
                  <option value="CIRCULATION_STAFF">Circulation Staff (Check-out/in Desk)</option>
                  <option value="CATALOGER">Cataloging Staff (ISBN & Barcodes)</option>
                  <option value="INVENTORY_STAFF">Inventory Auditor (Shelf Audits)</option>
                  <option value="ACQUISITION_STAFF">Acquisition Specialist (Purchasing & Vendors)</option>
                  <option value="DIRECTOR">Deputy / Assistant Director</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 sm:py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-center font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center"
                >
                  {formLoading ? "Onboarding..." : "Confirm Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
