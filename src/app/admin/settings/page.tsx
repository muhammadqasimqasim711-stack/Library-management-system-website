"use client";

import React, { useState } from "react";
import { Sliders, Save, CheckCircle2, Shield, ScanBarcode, Building, Database } from "lucide-react";

export default function AdminSettingsPage() {
  const [institutionName, setInstitutionName] = useState("University Library System");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [semester, setSemester] = useState("Fall Semester 2026");
  const [scannerMode, setScannerMode] = useState("KEYBOARD_WEDGE");
  const [scannerPrefix, setScannerPrefix] = useState("");
  const [scannerSuffix, setScannerSuffix] = useState("Enter (\\n)");
  const [auditRetentionDays, setAuditRetentionDays] = useState("365");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <Sliders className="w-4 h-4 text-blue-700" />
            Institutional Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Global System Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure institutional parameters, hardware scanner integration, academic terms, and audit retention.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            System parameters updated & cached
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Academic Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Institution & Academic Calendar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Institution / Library Name
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Term / Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Branches (Future Multi-Branch)</label>
              <input
                type="text"
                disabled
                value="Main Library, Engineering Complex, Medical Library"
                className="w-full bg-slate-100 border border-slate-300 text-slate-500 rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Hardware Barcode Scanner Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ScanBarcode className="w-4 h-4 text-blue-600" />
            Hardware Barcode Scanner Configuration
          </h2>
          <p className="text-slate-500 text-xs">
            The circulation desk supports standard USB, Bluetooth, and 2.4GHz handheld laser/imager barcode scanners.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scanner Input Interface</label>
              <select
                value={scannerMode}
                onChange={(e) => setScannerMode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="KEYBOARD_WEDGE">USB Keyboard Wedge (Auto-detect buffer)</option>
                <option value="SERIAL_COM">Virtual Serial / COM Port</option>
                <option value="HID_POS">HID POS Direct Interface</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scanner Post-Fix Character</label>
              <input
                type="text"
                value={scannerSuffix}
                onChange={(e) => setScannerSuffix(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Barcode Symbology Standard</label>
              <input
                type="text"
                disabled
                value="Code128 / Code39 / EAN-13"
                className="w-full bg-slate-100 border border-slate-300 text-slate-500 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Audit & Compliance Data Retention */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            Governance, Audits & Concurrency Control
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Audit Trail Retention Policy (Days)
              </label>
              <input
                type="number"
                value={auditRetentionDays}
                onChange={(e) => setAuditRetentionDays(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Database Transaction Isolation</label>
              <input
                type="text"
                disabled
                value="ACID Serialized with Write-Ahead Logging (WAL)"
                className="w-full bg-slate-100 border border-slate-300 text-slate-500 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration Parameters
          </button>
        </div>
      </form>
    </div>
  );
}
