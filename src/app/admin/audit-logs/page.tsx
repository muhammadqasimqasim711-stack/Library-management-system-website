"use client";

import React, { useState, useEffect } from "react";
import { FileText, Search, RefreshCw, Eye, X } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (actionFilter !== "ALL") params.append("action", actionFilter);
    if (search.trim()) params.append("search", search.trim());

    fetch(`/api/audit-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <FileText className="w-4 h-4 text-blue-700" />
            Governance & Compliance Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Immutable Activity Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tamper-evident system activity log capturing actor credentials, state transitions, IP addresses, and outcomes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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
              onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
              placeholder="Search by Actor, Action, Entity, or ID..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg pl-9 pr-4 py-2 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={fetchLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold shrink-0"
          >
            Filter
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="ALL">All Actions</option>
            <option value="LOAN_ISSUE">LOAN_ISSUE</option>
            <option value="LOAN_RETURN">LOAN_RETURN</option>
            <option value="LOAN_RENEW">LOAN_RENEW</option>
            <option value="FINE_WAIVE">FINE_WAIVE</option>
            <option value="FINE_PAYMENT">FINE_PAYMENT</option>
            <option value="COPY_STATUS_CHANGE">COPY_STATUS_CHANGE</option>
            <option value="POLICY_UPDATE">POLICY_UPDATE</option>
            <option value="BOOK_CREATE">BOOK_CREATE</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
            <thead className="bg-slate-50/80 text-slate-700 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4 text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors font-mono">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                      {log.actorName}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {log.entity} {log.entityId ? `[${log.entityId.slice(0, 8)}...]` : ""}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold">{log.result}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Audit Transaction Inspection
                </span>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {selectedLog.id} • IP: {selectedLog.ipAddress}
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400">Actor:</span>
                  <div className="font-semibold text-slate-800">{selectedLog.actorName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Action:</span>
                  <div className="font-semibold text-blue-700 font-mono">{selectedLog.action}</div>
                </div>
              </div>

              {selectedLog.oldValue && (
                <div>
                  <span className="font-bold text-slate-700">Previous State:</span>
                  <pre className="mt-1 p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-w-full">
                    {JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700">New / Committed State:</span>
                <pre className="mt-1 p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto max-w-full">
                  {selectedLog.newValue
                    ? JSON.stringify(JSON.parse(selectedLog.newValue), null, 2)
                    : "No state payload"}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
