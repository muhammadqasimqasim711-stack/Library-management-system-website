"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  BookOpen,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  QrCode,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface BookData {
  id: string;
  title: string;
  isbn: string;
  availableCopies: number;
  totalCopies: number;
  copies: any[];
}

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookData;
  preSelectedCopyId?: string | null;
  onIssueSuccess: () => void;
}

export default function IssueBookModal({
  isOpen,
  onClose,
  book,
  preSelectedCopyId,
  onIssueSuccess,
}: IssueBookModalProps) {
  // Step state: 1 = Member Search & Select, 2 = Eligibility & Copy Selection, 3 = Confirmation, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Search state
  const [memberQuery, setMemberQuery] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("ALL");
  const [memberStatusFilter, setMemberStatusFilter] = useState("ACTIVE");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Selected member & eligibility
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityData, setEligibilityData] = useState<any | null>(null);

  // Selected copy
  const [selectedCopyId, setSelectedCopyId] = useState<string>("");

  // Issue submission
  const [submitting, setSubmitting] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issuedReceipt, setIssuedReceipt] = useState<any | null>(null);

  // Available copies for this book
  const availableCopies = (book.copies || []).filter((c) => c.status === "AVAILABLE");

  // Initialize selected copy
  useEffect(() => {
    if (preSelectedCopyId && availableCopies.some((c) => c.id === preSelectedCopyId)) {
      setSelectedCopyId(preSelectedCopyId);
    } else if (availableCopies.length > 0) {
      setSelectedCopyId(availableCopies[0].id);
    }
  }, [book, preSelectedCopyId]);

  // Reset modal on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMemberQuery("");
      setSearchResults([]);
      setSelectedMember(null);
      setEligibilityData(null);
      setIssueError(null);
      setIssuedReceipt(null);
      // Auto-load some active members for fast selection
      fetchInitialMembers();
    }
  }, [isOpen]);

  const fetchInitialMembers = async () => {
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/members?status=ACTIVE`);
      const json = await res.json();
      if (json.members) {
        setSearchResults(json.members.slice(0, 8));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchMembers = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams();
      if (memberQuery.trim()) params.append("q", memberQuery.trim());
      if (memberTypeFilter !== "ALL") params.append("memberType", memberTypeFilter);
      if (memberStatusFilter !== "ALL") params.append("status", memberStatusFilter);

      const res = await fetch(`/api/members?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.members) {
        setSearchResults(json.members);
        if (json.members.length === 0) {
          setSearchError("No members found matching the specified search criteria.");
        }
      } else {
        setSearchError(json.error || "Failed to search members.");
      }
    } catch (err: any) {
      setSearchError("Network error occurred while querying member directory.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMember = async (member: any) => {
    setSelectedMember(member);
    setEligibilityLoading(true);
    setEligibilityData(null);
    setIssueError(null);

    try {
      const res = await fetch(
        `/api/circulation/eligibility?memberId=${encodeURIComponent(member.memberId)}&bookId=${book.id}`
      );
      const data = await res.json();
      if (res.ok) {
        setEligibilityData(data);
        setStep(2);
      } else {
        setIssueError(data.error || "Failed to calculate borrowing eligibility.");
      }
    } catch (err) {
      setIssueError("Failed to check borrowing policy eligibility.");
    } finally {
      setEligibilityLoading(false);
    }
  };

  const handleProceedToSummary = () => {
    if (!selectedCopyId) {
      setIssueError("Please select a physical copy to issue.");
      return;
    }
    setStep(3);
  };

  const handleConfirmIssue = async () => {
    const copy = availableCopies.find((c) => c.id === selectedCopyId);
    if (!copy || !selectedMember) return;

    setSubmitting(true);
    setIssueError(null);

    try {
      const res = await fetch("/api/circulation/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.memberId,
          copyId: copy.id,
          copyBarcode: copy.barcode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIssueError(data.error || "Failed to issue book copy.");
      } else {
        setIssuedReceipt({
          ...data,
          bookTitle: book.title,
          copyBarcode: copy.barcode,
          copyNumber: copy.copyNumber,
          memberName: selectedMember.fullName,
          memberId: selectedMember.memberId,
          issueDate: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          dueDate: new Date(data.dueDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        });
        setStep(4);
        onIssueSuccess();
      }
    } catch (err: any) {
      setIssueError("Network error occurred during issue transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setStep(1);
    setSelectedMember(null);
    setEligibilityData(null);
    setIssueError(null);
    setIssuedReceipt(null);
    fetchInitialMembers();
  };

  if (!isOpen) return null;

  const chosenCopy = availableCopies.find((c) => c.id === selectedCopyId) || availableCopies[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-400">
              <BookOpen className="w-4 h-4" />
              Give Book Desk
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif mt-1 line-clamp-1">
              Give Book: {book.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
              <span>ISBN: <strong className="text-white font-mono">{book.isbn}</strong></span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {book.availableCopies} Copies Ready on Shelf
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Progress Breadcrumb */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-600 shrink-0">
          <div className={`flex items-center gap-1.5 ${step === 1 ? "text-blue-700 font-bold" : ""}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-700"}`}>1</span>
            Choose Person
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-1.5 ${step === 2 ? "text-blue-700 font-bold" : ""}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-700"}`}>2</span>
            Check & Choose Copy
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-1.5 ${step === 3 ? "text-blue-700 font-bold" : ""}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-700"}`}>3</span>
            Check Details
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-1.5 ${step === 4 ? "text-emerald-700 font-bold" : ""}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"}`}>4</span>
            All Done
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: Search and Select Member */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 1: Find and Choose Person</h3>
                <p className="text-xs text-slate-500">
                  Search for students, teachers, or staff to see if they can take books.
                </p>
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearchMembers} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="Type ID card number, name, or email..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-24 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="submit"
                    disabled={searching}
                    className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    {searching ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Search"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Show:</span>
                  <select
                    value={memberTypeFilter}
                    onChange={(e) => setMemberTypeFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-slate-700 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none"
                  >
                    <option value="ALL">All People (Students & Teachers)</option>
                    <option value="STUDENT">Students</option>
                    <option value="FACULTY">Teachers</option>
                    <option value="RESEARCHER">Researchers</option>
                    <option value="STAFF">Library Staff</option>
                  </select>

                  <select
                    value={memberStatusFilter}
                    onChange={(e) => setMemberStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 text-slate-700 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none"
                  >
                    <option value="ACTIVE">Allowed to Borrow Only</option>
                    <option value="ALL">All Statuses</option>
                  </select>
                </div>
              </form>

              {searchError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {searchError}
                </div>
              )}

              {/* Members Results List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Choose Person to Check
                </div>

                {searching ? (
                  <div className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Looking up people...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    Type a name, ID number, or email above to find people.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-64 overflow-y-auto bg-slate-50/50">
                    {searchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMember(m)}
                        className="p-3 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {m.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 text-xs flex items-center gap-2">
                              {m.fullName}
                              <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.2 rounded text-slate-700">
                                {m.memberId}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {m.memberType} • {m.department?.name || "General"} • {m.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={m.status} size="sm" />
                          <button
                            type="button"
                            className="bg-blue-600 group-hover:bg-blue-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            Choose <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Eligibility Check & Physical Copy Selection */}
          {step === 2 && selectedMember && eligibilityData && (
            <div className="space-y-5">
              {/* Member Eligibility Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-xs text-slate-900">Can This Person Take Books?</span>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Change Person
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Person</div>
                    <div className="font-bold text-slate-900 line-clamp-1">{selectedMember.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{selectedMember.memberId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Role</div>
                    <div className="font-semibold text-slate-800">{selectedMember.memberType}</div>
                    <div className="text-[10px] text-slate-500">{selectedMember.department?.name || "General"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Books with Them Now</div>
                    <div className="font-bold text-slate-900">
                      {eligibilityData.activeLoansCount} / {eligibilityData.maxLoans}
                    </div>
                    <div className="text-[10px] text-slate-500">Late: {eligibilityData.overdueCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Can Borrow?</div>
                    <div>
                      {eligibilityData.eligible ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> ALLOWED TO BORROW
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold text-[11px] border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> CANNOT BORROW NOW
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* If Ineligible, display clear policy rejection reasons */}
                {!eligibilityData.eligible && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-rose-900">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Cannot give this book to {selectedMember.fullName}:
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                      {eligibilityData.reasons.map((r: string, idx: number) => (
                        <li key={idx} className="font-medium">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Physical Copy Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900">
                    Choose Book Copy to Give
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {availableCopies.length} copy/copies ready on shelf
                  </span>
                </div>

                {availableCopies.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    No book copies are ready on shelf right now.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableCopies.map((copy) => {
                      const isSelected = selectedCopyId === copy.id;
                      return (
                        <div
                          key={copy.id}
                          onClick={() => setSelectedCopyId(copy.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="copySelection"
                              checked={isSelected}
                              onChange={() => setSelectedCopyId(copy.id)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                                <span className="font-mono">{copy.barcode}</span>
                                <span className="text-[10px] text-slate-500 font-sans">
                                  (Copy #{copy.copyNumber})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {copy.location}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                              READY ON SHELF
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Condition: {copy.condition || "Good"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {issueError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {issueError}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Issue Summary & Pre-Confirmation */}
          {step === 3 && selectedMember && chosenCopy && eligibilityData && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 3: Check Details Before Giving Book</h3>
                <p className="text-xs text-slate-500">
                  Please check that everything is correct before giving the book.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200 text-xs">
                {/* Book Details */}
                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Book Details</div>
                  <div className="font-bold text-slate-900 text-sm">{book.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono">ISBN: {book.isbn}</div>
                </div>

                {/* Physical Copy Details */}
                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Book Copy</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-slate-900">{chosenCopy.barcode}</div>
                      <div className="text-[11px] text-slate-500">Copy #{chosenCopy.copyNumber} • Condition: {chosenCopy.condition}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-600">
                      <div>{chosenCopy.location}</div>
                    </div>
                  </div>
                </div>

                {/* Borrower Information */}
                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Person Taking Book</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{selectedMember.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{selectedMember.memberId} • {selectedMember.memberType}</div>
                    </div>
                    <div className="text-right text-[11px] text-slate-600">
                      <div>Books with them now: {eligibilityData.activeLoansCount} / {eligibilityData.maxLoans}</div>
                      <div>Unpaid Late Fees: ${eligibilityData.pendingFinesTotal?.toFixed(2) || "0.00"}</div>
                    </div>
                  </div>
                </div>

                {/* Calculated Loan Dates */}
                <div className="p-3.5 space-y-2 bg-blue-50/50">
                  <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Borrowing Details</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] text-slate-500">Date Given</div>
                      <div className="font-semibold text-slate-800">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Allowed Days</div>
                      <div className="font-semibold text-slate-800">
                        {eligibilityData.policy?.loanDurationDays || 14} Days
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Last Date to Return</div>
                      <div className="font-bold text-blue-800">
                        {new Date(eligibilityData.calculatedDueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {issueError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {issueError}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Success Confirmation Screen */}
          {step === 4 && issuedReceipt && (
            <div className="py-4 space-y-5 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  Book Given Out Successfully!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  The book is now marked as taken out by this person.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-left space-y-2 max-w-md mx-auto">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Book Title:</span>
                  <span className="font-bold text-slate-900 text-right">{issuedReceipt.bookTitle}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Book Copy Barcode:</span>
                  <span className="font-mono font-bold text-blue-700">{issuedReceipt.copyBarcode}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Person with Book:</span>
                  <span className="font-semibold text-slate-900">{issuedReceipt.memberName} ({issuedReceipt.memberId})</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Date Given:</span>
                  <span className="text-slate-800">{issuedReceipt.issueDate}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Last Date to Return:</span>
                  <span className="font-bold text-blue-800">{issuedReceipt.dueDate}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Given By:</span>
                  <span className="text-slate-700">Library Staff</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link
                  href={`/admin/loans?search=${issuedReceipt.copyBarcode}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  <Clock className="w-3.5 h-3.5" /> See Books Out
                </Link>
                <Link
                  href={`/admin/members?q=${issuedReceipt.memberId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  <User className="w-3.5 h-3.5" /> See Person Details
                </Link>
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Give Another Book
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Back to Book
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step !== 4 && (
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Back
              </button>
            )}

            <div className="flex items-center gap-2">
              {step === 2 && (
                <button
                  type="button"
                  disabled={!eligibilityData?.eligible || !selectedCopyId}
                  onClick={handleProceedToSummary}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  Next: Check Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmIssue}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Giving Book...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Yes, Give This Book
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
