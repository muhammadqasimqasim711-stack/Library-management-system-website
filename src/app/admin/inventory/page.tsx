import React from "react";
import Link from "next/link";
import { Warehouse, ClipboardCheck, ArrowRight, BookOpen, QrCode } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [sections, shelves, copiesGrouped] = await Promise.all([
    prisma.librarySection.findMany({
      include: {
        shelves: {
          include: {
            _count: { select: { copies: true } },
          },
        },
      },
      orderBy: { floor: "asc" },
    }),
    prisma.shelf.findMany({
      include: {
        section: true,
        _count: { select: { copies: true } },
      },
      orderBy: { code: "asc" },
    }),
    prisma.bookCopy.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const statusCounts = copiesGrouped.reduce((acc: any, curr) => {
    acc[curr.status] = curr._count.id;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <Warehouse className="w-4 h-4 text-blue-700" />
            Physical Space & Stacks Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Library Sections & Shelf Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Hierarchical coordinate management: Building → Floor → Section → Shelf → Rack.
          </p>
        </div>

        <Link
          href="/admin/inventory/audit"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <ClipboardCheck className="w-4 h-4" />
          Launch Live Shelf Audit
        </Link>
      </div>

      {/* Inventory Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-[11px] text-slate-500">Available on Shelves</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {statusCounts["AVAILABLE"] || 0}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-[11px] text-slate-500">Currently Borrowed</div>
          <div className="text-xl font-bold font-mono text-blue-600 mt-1">
            {statusCounts["BORROWED"] || 0}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-[11px] text-slate-500">On Hold / Reserved</div>
          <div className="text-xl font-bold font-mono text-purple-600 mt-1">
            {statusCounts["ON_HOLD"] || 0}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-[11px] text-slate-500">Under Repair</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">
            {statusCounts["UNDER_REPAIR"] || 0}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-[11px] text-slate-500">Flagged Missing</div>
          <div className="text-xl font-bold font-mono text-red-600 mt-1">
            {statusCounts["MISSING"] || 0}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="text-[11px] text-slate-500">Declared Lost</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {statusCounts["LOST"] || 0}
          </div>
        </div>
      </div>

      {/* Sections and Stacks */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Library Buildings, Floors & Stacks
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((sec) => (
            <div key={sec.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                      {sec.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      {sec.building} • Floor {sec.floor}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{sec.name}</h3>
                  {sec.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{sec.description}</p>
                  )}
                </div>
              </div>

              {/* Shelves list */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Registered Shelves & Capacity
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sec.shelves.map((sh) => {
                    const pct = Math.round((sh._count.copies / sh.capacity) * 100);
                    return (
                      <div key={sh.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold font-mono text-slate-800">{sh.code}</span>
                          <span className="text-[11px] text-slate-500">
                            {sh._count.copies} / {sh.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">{sh.name}</div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              pct > 90 ? "bg-rose-500" : pct > 70 ? "bg-amber-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
