"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ScanBarcode,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Printer,
  Undo2,
  Calendar,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import BarcodeRenderer from "@/components/BarcodeRenderer";

export default function RapidCirculationPage() {
  const [activeTab, setActiveTab] = useState<"ISSUE" | "RETURN">("ISSUE");

  // Issue Workflow State
  const [memberQuery, setMemberQuery] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);

  const [copyBarcode, setCopyBarcode] = useState("");
  const [copyLoading, setCopyLoading] = useState(false);
  const [copyData, setCopyData] = useState<any>(null);

  const [issueLoading, setIssueLoading] = useState(false);
  const [lastIssuedReceipt, setLastIssuedReceipt] = useState<any>(null);

  // Return Workflow State
  const [returnBarcode, setReturnBarcode] = useState("");
  const [returnCopyLoading, setReturnCopyLoading] = useState(false);
  const [returnCopyData, setReturnCopyData] = useState<any>(null);
  const [returnCondition, setReturnCondition] = useState("GOOD");
  const [isDamaged, setIsDamaged] = useState(false);
  const [damageSeverity, setDamageSeverity] = useState<"MINOR" | "MODERATE" | "SEVERE" | "UNUSABLE">("MINOR");
  const [damageDescription, setDamageDescription] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [lastReturnReceipt, setLastReturnReceipt] = useState<any>(null);

  // Generic feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Refs for auto-focusing
  const memberInputRef = useRef<HTMLInputElement | null>(null);
  const copyInputRef = useRef<HTMLInputElement | null>(null);
  const returnInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut listener for high-speed operation (F2 = Issue, F3 = Return)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        setActiveTab("ISSUE");
        memberInputRef.current?.focus();
      } else if (e.key === "F3") {
        e.preventDefault();
        setActiveTab("RETURN");
        returnInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clear messages on tab change
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (activeTab === "ISSUE") {
      setTimeout(() => memberInputRef.current?.focus(), 100);
    } else {
      setTimeout(() => returnInputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  // Step 1: Scan Member
  const handleScanMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!memberQuery.trim()) return;

    setErrorMessage(null);
    setMemberLoading(true);
    setMemberData(null);
    setCopyData(null);

    try {
      const res = await fetch(`/api/circulation/search-member?query=${encodeURIComponent(memberQuery.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Member lookup failed.");
      } else {
        setMemberData(json.member);
        // Auto focus book copy input for rapid checkout sequence
        setTimeout(() => copyInputRef.current?.focus(), 100);
      }
    } catch (err: any) {
      setErrorMessage("Network error during member lookup.");
    } finally {
      setMemberLoading(false);
    }
  };

  // Step 2: Scan Book Copy for Issue
  const handleScanCopy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copyBarcode.trim()) return;

    setErrorMessage(null);
    setCopyLoading(true);
    setCopyData(null);

    try {
      const res = await fetch(`/api/circulation/search-copy?barcode=${encodeURIComponent(copyBarcode.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Copy lookup failed.");
      } else {
        setCopyData(json.copy);
      }
    } catch (err: any) {
      setErrorMessage("Network error during copy lookup.");
    } finally {
      setCopyLoading(false);
    }
  };

  // Step 3: Complete Issue Transaction
  const handleExecuteIssue = async () => {
    if (!memberData || !copyData) return;

    setIssueLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/circulation/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: memberData.memberId,
          copyBarcode: copyData.barcode,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error || "Failed to issue book copy.");
      } else {
        setLastIssuedReceipt(json);
        setSuccessMessage(`SUCCESS: Issued "${json.bookTitle}" (${json.copyBarcode}) to ${json.memberName}.`);
        setCopyBarcode("");
        setCopyData(null);
        // Refresh member details to update active loan count
        handleScanMember();
      }
    } catch (err: any) {
      setErrorMessage("Network error during issue execution.");
    } finally {
      setIssueLoading(false);
    }
  };

  // Return Workflow: Scan Copy
  const handleScanReturnCopy = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!returnBarcode.trim()) return;

    setErrorMessage(null);
    setReturnCopyLoading(true);
    setReturnCopyData(null);

    try {
      const res = await fetch(`/api/circulation/search-copy?barcode=${encodeURIComponent(returnBarcode.trim())}`);
      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Copy lookup failed.");
      } else {
        setReturnCopyData(json.copy);
      }
    } catch (err: any) {
      setErrorMessage("Network error during copy lookup.");
    } finally {
      setReturnCopyLoading(false);
    }
  };

  // Complete Return Transaction
  const handleExecuteReturn = async () => {
    if (!returnCopyData) return;

    setReturnLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/circulation/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          copyBarcode: returnCopyData.barcode,
          condition: returnCondition,
          isDamaged,
          damageSeverity: isDamaged ? damageSeverity : undefined,
          damageDescription: isDamaged ? damageDescription : undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error || "Failed to process return.");
      } else {
        setLastReturnReceipt(json);
        setSuccessMessage(
          `RETURN COMPLETE: "${json.bookTitle}" (${json.copyBarcode}) successfully returned.` +
            (json.overdueFineAmount > 0 ? ` Overdue fine: $${json.overdueFineAmount.toFixed(2)}.` : "") +
            (json.damagePenalty > 0 ? ` Damage penalty: $${json.damagePenalty.toFixed(2)}.` : "") +
            (json.heldForMember ? ` Assigned to reservation for ${json.heldForMember}!` : "")
        );
        setReturnBarcode("");
        setReturnCopyData(null);
        setIsDamaged(false);
        setDamageDescription("");
        setTimeout(() => returnInputRef.current?.focus(), 100);
      }
    } catch (err: any) {
      setErrorMessage("Network error during return execution.");
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Station Title & Quick Keys */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <ScanBarcode className="w-4 h-4 text-blue-700" />
            Rapid Circulation Station
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Barcode Circulation Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Optimized for continuous hardware barcode scanning and keyboard-only processing.
          </p>
        </div>

        {/* Mode Switcher Tabs with Keyboard Badges */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl shadow-inner w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("ISSUE")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "ISSUE"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/60"
            }`}
          >
            <ScanBarcode className="w-4 h-4 shrink-0" />
            <span>Issue (Check-Out)</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-blue-800/40 text-[10px] text-blue-100 font-mono">
              F2
            </kbd>
          </button>
          <button
            onClick={() => setActiveTab("RETURN")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "RETURN"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/60"
            }`}
          >
            <Undo2 className="w-4 h-4 shrink-0" />
            <span>Return (Check-In)</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-emerald-800/40 text-[10px] text-emerald-100 font-mono">
              F3
            </kbd>
          </button>
        </div>
      </div>

      {/* Quick Test Barcodes Bar (Helpful for instant testing) */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Quick Barcodes for Instant Testing:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <button
            onClick={() => {
              if (activeTab === "ISSUE") {
                setMemberQuery("STU-2026-001");
              } else {
                setReturnBarcode("LIB-CS-00003");
              }
            }}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-900 text-blue-300 border border-slate-700 transition-colors"
          >
            Student: STU-2026-001
          </button>
          <button
            onClick={() => {
              if (activeTab === "ISSUE") {
                setMemberQuery("FAC-2026-001");
              }
            }}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-900 text-purple-300 border border-slate-700 transition-colors"
          >
            Faculty: FAC-2026-001
          </button>
          <button
            onClick={() => {
              if (activeTab === "ISSUE") {
                setMemberQuery("STU-2026-003");
              }
            }}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900 text-rose-300 border border-slate-700 transition-colors"
          >
            Restricted: STU-2026-003
          </button>
          <button
            onClick={() => {
              if (activeTab === "ISSUE") {
                setCopyBarcode("LIB-CS-00001");
              } else {
                setReturnBarcode("LIB-CS-00003");
              }
            }}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-900 text-emerald-300 border border-slate-700 transition-colors"
          >
            Copy: LIB-CS-00001 (Available)
          </button>
          <button
            onClick={() => {
              if (activeTab === "RETURN") {
                setReturnBarcode("LIB-CS-00011"); // Overdue copy!
              }
            }}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900 text-rose-300 border border-slate-700 transition-colors"
          >
            Copy: LIB-CS-00011 (Overdue)
          </button>
        </div>
      </div>

      {/* Operational Feedback Banners */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm p-4 rounded-xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Transaction Blocked</div>
            <div>{errorMessage}</div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-950 font-bold px-2"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm p-4 rounded-xl flex items-start gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Circulation Receipt Generated</div>
            <div>{successMessage}</div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-950 font-bold px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ISSUE WORKFLOW INTERFACE (Section 10 & 36)                                */}
      {/* ========================================================================= */}
      {activeTab === "ISSUE" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Step 1: Member Verification Column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="font-bold text-slate-800 text-sm">Scan / Verify University Member</h2>
              </div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Step 1 of 2</span>
            </div>

            {/* Member Barcode Scanner Input */}
            <form onSubmit={handleScanMember} className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Scan Member ID Barcode or Type Student/Faculty ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <input
                    ref={memberInputRef}
                    type="text"
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="e.g. STU-2026-001 or ali.khan@student.university.edu"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg pl-9 pr-4 py-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    autoFocus
                  />
                  <ScanBarcode className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <button
                  type="submit"
                  disabled={memberLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-5 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
                >
                  {memberLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify ID"}
                </button>
              </div>
            </form>

            {/* Member Profile Display Card */}
            {memberData ? (
              <div
                className={`p-4 rounded-xl border ${
                  !memberData.isEligible
                    ? "bg-rose-50/50 border-rose-200"
                    : "bg-slate-50 border-slate-200"
                } space-y-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-700 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                      {memberData.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{memberData.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono">{memberData.memberId}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{memberData.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={memberData.status} size="sm" />
                    <div className="text-[10px] text-slate-500 font-semibold mt-1">
                      {memberData.memberType}
                    </div>
                  </div>
                </div>

                {/* Quota & Fines Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/80">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <div className="text-xs text-slate-500">Active Borrowed Books</div>
                    <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
                      {memberData.activeLoansCount}{" "}
                      <span className="text-xs font-normal text-slate-400">/ {memberData.maxLoans} max</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <div className="text-xs text-slate-500">Outstanding Balance</div>
                    <div
                      className={`text-lg font-bold font-mono mt-0.5 ${
                        memberData.totalPendingFines > 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      ${memberData.totalPendingFines.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Eligibility Result Banner */}
                {memberData.isEligible ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Member is eligible to borrow. Ready for copy scan.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-100/60 p-2.5 rounded-lg border border-rose-200">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>
                      Borrowing Restricted:{" "}
                      {memberData.status !== "ACTIVE"
                        ? `Account status is ${memberData.status}`
                        : "Borrowing quota limit reached"}
                      .
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Scan student or faculty university ID card to load account privileges.
              </div>
            )}
          </div>

          {/* Step 2: Book Barcode Scan & Issue Execution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="font-bold text-slate-800 text-sm">Scan Physical Book Copy Barcode</h2>
              </div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Step 2 of 2</span>
            </div>

            {/* Book Copy Barcode Scanner Input */}
            <form onSubmit={handleScanCopy} className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Scan Book Barcode Sticker
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <input
                    ref={copyInputRef}
                    type="text"
                    value={copyBarcode}
                    onChange={(e) => setCopyBarcode(e.target.value)}
                    placeholder="e.g. LIB-CS-00001"
                    disabled={!memberData?.isEligible}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg pl-9 pr-4 py-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all disabled:opacity-50"
                  />
                  <ScanBarcode className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <button
                  type="submit"
                  disabled={copyLoading || !memberData?.isEligible}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 sm:px-5 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {copyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Identify Copy"}
                </button>
              </div>
            </form>

            {/* Book Copy Identified Card */}
            {copyData ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex flex-col xs:flex-row gap-3">
                  {copyData.book.coverUrl && (
                    <img
                      src={copyData.book.coverUrl}
                      alt={copyData.book.title}
                      className="w-16 h-22 object-cover rounded-lg shadow-xs border border-slate-200 shrink-0 self-start"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm leading-tight">
                      {copyData.book.title}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{copyData.book.authors}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 break-words">
                      ISBN: {copyData.book.isbn} • Call: {copyData.book.classificationNumber}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {copyData.barcode}
                      </span>
                      <StatusBadge status={copyData.status} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Location Coordinates */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    Physical Shelf Coordinate
                  </div>
                  <div className="text-slate-800 font-medium">
                    {copyData.shelf
                      ? `${copyData.shelf.building} → Floor ${copyData.shelf.floor} → Shelf ${copyData.shelf.code} (${copyData.rack || "Standard Rack"})`
                      : "Main Circulation Reserve Desk"}
                  </div>
                </div>

                {/* Ready to Issue Confirmation Button */}
                <button
                  onClick={handleExecuteIssue}
                  disabled={issueLoading || copyData.status !== "AVAILABLE"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-center"
                >
                  {issueLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Issue Transaction & Print Receipt
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Scan physical copy barcode to verify availability and confirm issue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RETURN WORKFLOW INTERFACE (Section 11)                                    */}
      {/* ========================================================================= */}
      {activeTab === "RETURN" && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-xs space-y-5 sm:space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Undo2 className="w-5 h-5 text-emerald-600" />
              Scan Book Barcode to Check-In / Return
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies borrower, evaluates overdue days, calculates fines, and updates hold queues automatically.
            </p>
          </div>

          {/* Scanner Input */}
          <form onSubmit={handleScanReturnCopy} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Scan Book Barcode Sticker
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  ref={returnInputRef}
                  type="text"
                  value={returnBarcode}
                  onChange={(e) => setReturnBarcode(e.target.value)}
                  placeholder="e.g. LIB-CS-00003 or LIB-CS-00011"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg pl-9 pr-4 py-2.5 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  autoFocus
                />
                <ScanBarcode className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
              <button
                type="submit"
                disabled={returnCopyLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
              >
                {returnCopyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Inspect Loan"}
              </button>
            </div>
          </form>

          {/* Inspected Return Card */}
          {returnCopyData && (
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {returnCopyData.book.coverUrl && (
                  <img
                    src={returnCopyData.book.coverUrl}
                    alt={returnCopyData.book.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-xs border border-slate-200 shrink-0 self-start"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-base">{returnCopyData.book.title}</div>
                  <div className="text-xs text-slate-600 mt-1 font-mono break-words">
                    Barcode: <span className="font-bold text-blue-700">{returnCopyData.barcode}</span> • Shelf:{" "}
                    {returnCopyData.shelf?.code || "Unassigned"}
                  </div>

                  {returnCopyData.currentLoan ? (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Borrower Account Information
                      </div>
                      <div className="font-semibold text-slate-800">
                        {returnCopyData.currentLoan.borrowerName} ({returnCopyData.currentLoan.borrowerId})
                      </div>
                      <div className="text-slate-500 flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                        <span>Issued: {new Date(returnCopyData.currentLoan.issuedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-semibold text-rose-700">
                          Due: {new Date(returnCopyData.currentLoan.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                      Note: This copy is not marked as currently borrowed. Returning will reset its shelf status.
                    </div>
                  )}
                </div>
              </div>

              {/* Physical Condition & Damage Inspection (Section 11 & 18) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Physical Condition Inspection</span>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDamaged}
                      onChange={(e) => setIsDamaged(e.target.checked)}
                      className="h-4 w-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-700">Report Damage / Penalty</span>
                  </label>
                </div>

                {!isDamaged ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["NEW", "GOOD", "FAIR", "POOR"].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setReturnCondition(cond)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          returnCondition === cond
                            ? "bg-blue-50 border-blue-500 text-blue-800 shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200 space-y-3">
                    <div className="text-xs font-semibold text-rose-900">
                      Damage Severity Classification
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["MINOR", "MODERATE", "SEVERE", "UNUSABLE"] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setDamageSeverity(sev)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            damageSeverity === sev
                              ? "bg-rose-600 border-rose-600 text-white shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-rose-50"
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Damage Inspection Notes
                      </label>
                      <input
                        type="text"
                        value={damageDescription}
                        onChange={(e) => setDamageDescription(e.target.value)}
                        placeholder="e.g. Torn pages 45-50, liquid stain on binding"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Complete Return Button */}
              <button
                onClick={handleExecuteReturn}
                disabled={returnLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {returnLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Process Check-In & Finalize Return
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
