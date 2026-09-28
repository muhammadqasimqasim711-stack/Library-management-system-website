"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Download, Printer, RefreshCw, FileSpreadsheet } from "lucide-react";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState("CIRCULATION");

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Catalog Books", data.kpis.totalBooks],
      ["Total Physical Copies", data.kpis.totalCopies],
      ["Available Physical Copies", data.kpis.availableCopies],
      ["Borrowed Copies", data.kpis.borrowedCopies],
      ["Overdue Copies", data.kpis.overdueCopies],
      ["Total Members", data.kpis.totalMembers],
      ["Outstanding Fines ($)", data.kpis.outstandingFines],
      ["Collected Fines ($)", data.kpis.collectedFines],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ULMS_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div className="text-center py-16 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        Generating institutional reports...
      </div>
    );
  }

  const { kpis, categoryDistribution, circulationTrends } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <BarChart3 className="w-4 h-4 text-blue-700" />
            Institutional Business Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Library Operations & Collection Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Generate and export institutional statistics across collection holdings, circulation velocity, and finance.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>

          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: "CIRCULATION", label: "Circulation & Lending Velocity" },
          { id: "COLLECTION", label: "Collection & Discipline Holdings" },
          { id: "FINES", label: "Fines, Penalties & Waivers" },
          { id: "MEMBERSHIP", label: "Member Enrollment & Standing" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              selectedReport === tab.id
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selected Report Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-xs space-y-6">
        {selectedReport === "CIRCULATION" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">
              Circulation Volume & Daily Activity
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-500">Active Borrowed Copies</div>
                <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
                  {kpis.borrowedCopies}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-500">Overdue Returns Pending</div>
                <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                  {kpis.overdueCopies}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-500">Copies on Hold</div>
                <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
                  {kpis.reservedCopies}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs text-slate-500">Pending Reservations</div>
                <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                  {kpis.pendingReservationsCount}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daily Throughput Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border border-slate-200 rounded-lg min-w-[450px]">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Day</th>
                      <th className="py-2.5 px-4 font-mono">Copies Issued</th>
                      <th className="py-2.5 px-4 font-mono">Copies Returned</th>
                      <th className="py-2.5 px-4 font-mono">Net Flow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {circulationTrends.map((t: any) => (
                      <tr key={t.day}>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{t.day}</td>
                        <td className="py-2.5 px-4 font-mono text-blue-700">{t.issues}</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-700">{t.returns}</td>
                        <td className="py-2.5 px-4 font-mono font-semibold">
                          {t.issues - t.returns > 0 ? `+${t.issues - t.returns}` : t.issues - t.returns}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReport === "COLLECTION" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">
              Holdings Breakdown by Department & Discipline
            </h2>
            <div className="divide-y divide-slate-100">
              {categoryDistribution.map((cat: any) => (
                <div key={cat.name} className="py-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <span className="font-mono text-slate-600 font-bold">{cat.count} Titles</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedReport === "FINES" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">
              Financial Recovery & Penalties Audit
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-xs text-slate-500">Outstanding Balance</div>
                <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                  ${kpis.outstandingFines.toFixed(2)}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-xs text-slate-500">Collected at Desk</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                  ${kpis.collectedFines.toFixed(2)}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-xs text-slate-500">Lost Copies Penalty Pool</div>
                <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
                  {kpis.lostCopies} Items
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === "MEMBERSHIP" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">
              University Member Demographics & Standing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-xs text-slate-500">Undergraduate & Postgrad</div>
                <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
                  {kpis.studentsCount} Students
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-xs text-slate-500">Academic Faculty</div>
                <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
                  {kpis.facultyCount} Faculty
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="text-xs text-slate-500">Total Enrolled Accounts</div>
                <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
                  {kpis.totalMembers} Members
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
