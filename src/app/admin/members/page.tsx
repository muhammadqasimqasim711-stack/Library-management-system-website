"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  Plus,
  X,
  BookOpen,
  Clock,
  RotateCw,
  Undo2,
  ExternalLink,
  Eye,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Coins,
  QrCode,
  MapPin,
  Calendar,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMemberId, setFormMemberId] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formType, setFormType] = useState("STUDENT");
  const [formLoading, setFormLoading] = useState(false);

  // Member Details / Loans Drawer state (Workflow 68.17)
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"LOANS" | "RESERVATIONS" | "FINES" | "HISTORY">("LOANS");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchMembers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append("q", search.trim());
    if (typeFilter !== "ALL") params.append("memberType", typeFilter);

    fetch(`/api/members?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.members) setMembers(data.members);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, [typeFilter]);

  const handleOpenMemberDetails = async (memberId: string) => {
    setDetailLoading(true);
    setActionMessage(null);
    setDetailTab("LOANS");

    try {
      const res = await fetch(`/api/circulation/search-member?query=${encodeURIComponent(memberId)}`);
      const data = await res.json();
      if (res.ok && data.member) {
        setSelectedMember(data.member);
      } else {
        alert(data.error || "Failed to load member profile.");
      }
    } catch (err) {
      alert("Error loading member details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReturnCopy = async (barcode: string) => {
    if (!confirm(`Confirm return of copy ${barcode}?`)) return;
    setActionLoadingId(barcode);
    setActionMessage(null);

    try {
      const res = await fetch("/api/circulation/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyBarcode: barcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: data.error || "Failed to return copy." });
      } else {
        setActionMessage({ type: "success", text: `Copy ${barcode} successfully returned.` });
        if (selectedMember) handleOpenMemberDetails(selectedMember.memberId);
        fetchMembers();
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Network error processing return." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    setActionLoadingId(loanId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/circulation/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ type: "error", text: data.error || "Failed to renew loan." });
      } else {
        setActionMessage({ type: "success", text: "Loan successfully renewed." });
        if (selectedMember) handleOpenMemberDetails(selectedMember.memberId);
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Network error renewing loan." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: formMemberId,
          fullName: formName,
          email: formEmail,
          phone: formPhone,
          memberType: formType,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormMemberId("");
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        fetchMembers();
      } else {
        const json = await res.json();
        alert(json.error || "Failed to create member.");
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
            <Users className="w-4 h-4 text-blue-700" />
            University Member Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Student & Faculty Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage institutional borrowing quotas, active standing, and account restriction overrides.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Enroll New Member
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:flex-1 sm:min-w-[280px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchMembers()}
              placeholder="Search by Member Name, ID, or Email..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg pl-9 pr-4 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={fetchMembers}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold shrink-0"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="ALL">All Member Types</option>
            <option value="STUDENT">Students</option>
            <option value="FACULTY">Faculty</option>
            <option value="RESEARCHER">Researchers</option>
            <option value="STAFF">Library Staff</option>
          </select>

          <button
            onClick={fetchMembers}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50/80 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Member Name & Email</th>
                <th className="py-3 px-4">University ID</th>
                <th className="py-3 px-4">Member Tier</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Active Loans</th>
                <th className="py-3 px-4">Standing / Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading university directory...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No members found matching criteria.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => handleOpenMemberDetails(m.memberId)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {m.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500">{m.email}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-blue-800">
                      {m.memberId}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {m.memberType}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {m.department?.name || "General Studies"}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                        {m.loans?.length || 0}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={m.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMemberDetails(m.memberId);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Loans
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details & Loans Modal (Workflow 68.17: Member -> Loans) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden transition-all flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-400">
                  <UserCheck className="w-4 h-4" />
                  Member Circulation Profile
                </div>
                <h2 className="text-xl font-bold font-serif mt-1 flex items-center gap-2">
                  {selectedMember.fullName}
                  <span className="font-mono text-xs bg-slate-800 text-blue-300 px-2 py-0.5 rounded">
                    {selectedMember.memberId}
                  </span>
                </h2>
                <div className="text-xs text-slate-300 mt-1">
                  {selectedMember.memberType} • {selectedMember.department || "General"} • {selectedMember.email}
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Standing KPI strip */}
            <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Standing</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <StatusBadge status={selectedMember.status} size="sm" />
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Active Loans</span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedMember.activeLoansCount} / {selectedMember.maxLoans}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Pending Fines</span>
                <span className="font-bold text-rose-700 font-mono">
                  ${selectedMember.totalPendingFines?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Reservations</span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedMember.reservations?.length || 0}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 px-4 shrink-0">
              <button
                onClick={() => setDetailTab("LOANS")}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  detailTab === "LOANS"
                    ? "border-blue-600 text-blue-700 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Active Loans ({selectedMember.loans?.length || 0})
              </button>
              <button
                onClick={() => setDetailTab("RESERVATIONS")}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  detailTab === "RESERVATIONS"
                    ? "border-blue-600 text-blue-700 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Hold Reservations ({selectedMember.reservations?.length || 0})
              </button>
              <button
                onClick={() => setDetailTab("FINES")}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  detailTab === "FINES"
                    ? "border-blue-600 text-blue-700 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                Fines ({selectedMember.fines?.length || 0})
              </button>
              <button
                onClick={() => setDetailTab("HISTORY")}
                className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  detailTab === "HISTORY"
                    ? "border-blue-600 text-blue-700 font-bold"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Borrowing History ({selectedMember.borrowingHistory?.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-xs">
              {actionMessage && (
                <div
                  className={`mb-4 p-3 rounded-xl border flex items-center justify-between ${
                    actionMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {actionMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    {actionMessage.text}
                  </div>
                  <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-700">
                    &times;
                  </button>
                </div>
              )}

              {/* ACTIVE LOANS TAB */}
              {detailTab === "LOANS" && (
                <div className="space-y-3">
                  {selectedMember.loans?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Member currently has no active loans.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedMember.loans.map((loan: any) => (
                        <div key={loan.id} className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {loan.copy?.book?.title}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono font-semibold text-blue-700">
                                {loan.copy?.barcode}
                              </span>
                              <span>•</span>
                              <span>Copy #{loan.copy?.copyNumber}</span>
                              <span>•</span>
                              <span>Issued: {new Date(loan.issuedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="font-bold text-slate-800">
                                Due: {new Date(loan.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={`/admin/books/${loan.copy?.bookId}`}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center gap-1"
                              title="Navigate to Book Details Page"
                            >
                              <BookOpen className="w-3.5 h-3.5" /> View Book
                            </Link>

                            <button
                              onClick={() => handleReturnCopy(loan.copy?.barcode)}
                              disabled={actionLoadingId === loan.copy?.barcode}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 flex items-center gap-1"
                            >
                              <Undo2 className="w-3.5 h-3.5" /> Return
                            </button>

                            <button
                              onClick={() => handleRenewLoan(loan.id)}
                              disabled={actionLoadingId === loan.id}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 flex items-center gap-1"
                            >
                              <RotateCw className="w-3.5 h-3.5" /> Renew ({loan.renewCount})
                            </button>

                            <Link
                              href={`/admin/loans?search=${loan.copy?.barcode}`}
                              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500"
                              title="Circulation registry entry"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RESERVATIONS TAB */}
              {detailTab === "RESERVATIONS" && (
                <div className="space-y-3">
                  {selectedMember.reservations?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      No active hold reservations for this member.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedMember.reservations.map((res: any) => (
                        <div key={res.id} className="p-3.5 bg-white flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900">{res.book?.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Queue Position: #{res.queuePosition} • Requested on {new Date(res.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={res.status} size="sm" />
                            <Link
                              href={`/admin/books/${res.bookId}`}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px]"
                            >
                              View Book
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FINES TAB */}
              {detailTab === "FINES" && (
                <div className="space-y-3">
                  {selectedMember.fines?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      No pending fines recorded for this member.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedMember.fines.map((fine: any) => (
                        <div key={fine.id} className="p-3.5 bg-white flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">{fine.reason}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Type: {fine.type} • Incurred: {new Date(fine.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-rose-700">${fine.amount?.toFixed(2)}</div>
                            <StatusBadge status={fine.status} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* BORROWING HISTORY TAB */}
              {detailTab === "HISTORY" && (
                <div className="space-y-3">
                  {selectedMember.borrowingHistory?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      No past borrowing records for this account.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedMember.borrowingHistory.map((hl: any) => (
                        <div key={hl.id} className="p-3.5 bg-white flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900">{hl.copy?.book?.title}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {hl.copy?.barcode} • Issued: {new Date(hl.issuedAt).toLocaleDateString()} • Returned:{" "}
                              {hl.returnedAt ? new Date(hl.returnedAt).toLocaleDateString() : "—"}
                            </div>
                          </div>
                          <StatusBadge status={hl.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Enroll University Member
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  University Member ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU-2026-099 or FAC-2026-099"
                  value={formMemberId}
                  onChange={(e) => setFormMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. e.rostova@student.university.edu"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Member Type *</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty Member</option>
                  <option value="RESEARCHER">Researcher</option>
                  <option value="STAFF">Library Staff</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center"
                >
                  {formLoading ? "Enrolling..." : "Enroll Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
