"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  QrCode,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Edit2,
  CheckCircle2,
  X,
  ScanBarcode,
  BookOpen,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import BarcodeRenderer from "@/components/BarcodeRenderer";

function CopiesContent() {
  const searchParams = useSearchParams();
  const bookIdParam = searchParams.get("bookId");
  const statusParam = searchParams.get("status");

  const [copies, setCopies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [barcodeSearch, setBarcodeSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusParam || "ALL");
  const [conditionFilter, setConditionFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Print Barcode Sheet Modal
  const [selectedForPrint, setSelectedForPrint] = useState<any | null>(null);

  // Edit Copy Modal
  const [editModalCopy, setEditModalCopy] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchCopies = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "25",
    });
    if (barcodeSearch.trim()) params.append("barcode", barcodeSearch.trim());
    if (bookIdParam) params.append("bookId", bookIdParam);
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (conditionFilter !== "ALL") params.append("condition", conditionFilter);

    fetch(`/api/copies?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.copies) {
          setCopies(data.copies);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCopies();
  }, [page, statusFilter, conditionFilter]);

  const handleUpdateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalCopy) return;

    setEditLoading(true);
    try {
      const res = await fetch(`/api/copies/${editModalCopy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          condition: editCondition,
          notes: editNotes,
        }),
      });
      if (res.ok) {
        setEditModalCopy(null);
        fetchCopies();
      } else {
        const json = await res.json();
        alert(json.error || "Failed to update copy.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <QrCode className="w-4 h-4 text-blue-700" />
            Physical Inventory & Barcode Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Physical Book Copies Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Domain Principle: Book Title ≠ Physical Copy. Every physical copy is uniquely barcoded and located.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Printer className="w-4 h-4" />
          Print Barcode Sheet
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:flex-1 sm:min-w-[280px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  fetchCopies();
                }
              }}
              placeholder="Scan or type barcode (e.g. LIB-CS-00001)..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg pl-9 pr-4 py-2 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <ScanBarcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={() => {
              setPage(1);
              fetchCopies();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold shrink-0"
          >
            Find
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BORROWED">Borrowed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="UNDER_REPAIR">Under Repair</option>
            <option value="DAMAGED">Damaged</option>
            <option value="LOST">Lost</option>
            <option value="MISSING">Missing</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => {
              setConditionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Conditions</option>
            <option value="NEW">New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
            <option value="DAMAGED">Damaged</option>
          </select>

          <button
            onClick={fetchCopies}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Copies Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[750px]">
            <thead className="bg-slate-50/80 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Barcode & Label</th>
                <th className="py-3 px-4">Catalog Title & ISBN</th>
                <th className="py-3 px-4">Shelf Location</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Borrower / Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading physical copies...
                  </td>
                </tr>
              ) : copies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No physical copies found matching criteria.
                  </td>
                </tr>
              ) : (
                copies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Barcode Sticker Preview */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <BarcodeRenderer
                          value={c.barcode}
                          height={28}
                          width={1.2}
                          fontSize={10}
                        />
                        <span className="text-[10px] text-slate-400 font-mono">
                          Copy #{c.copyNumber}
                        </span>
                      </div>
                    </td>

                    {/* Book Title */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {c.book?.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ISBN: {c.book?.isbn} • Call: {c.book?.classificationNumber || "N/A"}
                      </div>
                    </td>

                    {/* Shelf Location */}
                    <td className="py-3 px-4">
                      {c.shelf ? (
                        <div>
                          <div className="font-semibold text-slate-800">
                            Shelf {c.shelf.code} ({c.rack || "Bay A"})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {c.shelf.section?.name} • Floor {c.shelf.section?.floor}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned Shelf</span>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-medium text-[11px] bg-slate-100 text-slate-700">
                        {c.condition}
                      </span>
                      {c.notes && (
                        <div className="text-[10px] text-amber-700 mt-1 max-w-xs line-clamp-1 italic">
                          {c.notes}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Borrower / Loan */}
                    <td className="py-3 px-4">
                      {c.loans && c.loans.length > 0 ? (
                        <div>
                          <div className="font-semibold text-blue-900">
                            {c.loans[0].user?.fullName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {c.loans[0].user?.memberId}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">On Shelf</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedForPrint(c)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Print Barcode Label"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditModalCopy(c);
                            setEditStatus(c.status);
                            setEditCondition(c.condition);
                            setEditNotes(c.notes || "");
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-blue-600 transition-colors"
                          title="Edit Copy Status / Condition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Copy Modal */}
      {editModalCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Update Physical Copy {editModalCopy.barcode}
              </h2>
              <button
                onClick={() => setEditModalCopy(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCopy} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Copy Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="BORROWED">BORROWED</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="LOST">LOST</option>
                  <option value="MISSING">MISSING</option>
                  <option value="WITHDRAWN">WITHDRAWN</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Condition</label>
                <select
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NEW">NEW</option>
                  <option value="GOOD">GOOD</option>
                  <option value="FAIR">FAIR</option>
                  <option value="POOR">POOR</option>
                  <option value="DAMAGED">DAMAGED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspection Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record binding condition, conservation steps, or audit updates..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalCopy(null)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center"
                >
                  {editLoading ? "Saving..." : "Update Copy Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Label Print Modal */}
      {selectedForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Physical Barcode Label Generator
              </span>
              <button
                onClick={() => setSelectedForPrint(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Sticker Preview */}
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-2 print-area overflow-hidden">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-700">
                UNIVERSITY LIBRARY SYSTEM
              </div>
              <div className="font-bold text-slate-900 text-xs line-clamp-1">
                {selectedForPrint.book?.title}
              </div>
              <div className="py-2 flex justify-center overflow-hidden">
                <BarcodeRenderer
                  value={selectedForPrint.barcode}
                  height={50}
                  width={1.6}
                  fontSize={12}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                Call: {selectedForPrint.book?.classificationNumber || "N/A"} • Shelf:{" "}
                {selectedForPrint.shelf?.code || "Main"}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
              <button
                onClick={() => setSelectedForPrint(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-50 text-center"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm text-center"
              >
                <Printer className="w-4 h-4" />
                Print Label Sticker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCopiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs">
          Loading physical copies registry...
        </div>
      }
    >
      <CopiesContent />
    </Suspense>
  );
}
