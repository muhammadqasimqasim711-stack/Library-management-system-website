import React from "react";
import { Building, Users, Clock, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage() {
  const facilities = await prisma.facility.findMany({
    include: {
      bookings: {
        include: { user: true },
        orderBy: { startTime: "asc" },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <Building className="w-4 h-4 text-blue-700" />
            Library Physical Infrastructure
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Study Spaces & Research Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage study carrels, group collaboration rooms, computer labs, and academic defense halls.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {facilities.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {f.code}
                </span>
                <h2 className="font-bold text-slate-900 text-base mt-1.5">{f.name}</h2>
                <div className="text-xs text-slate-500">{f.location}</div>
              </div>
              <StatusBadge status={f.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400">Space Type:</span>
                <div className="font-semibold text-slate-800 mt-0.5">{f.type}</div>
              </div>
              <div>
                <span className="text-slate-400">Capacity:</span>
                <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  {f.capacity} persons
                </div>
              </div>
            </div>

            {f.amenities && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Equipped With: </span>
                {f.amenities}
              </div>
            )}

            {/* Bookings */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Confirmed Reservations ({f.bookings.length})
              </span>
              {f.bookings.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No bookings scheduled.</div>
              ) : (
                <div className="space-y-1.5">
                  {f.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{b.user.fullName}</span>
                        <div className="text-[11px] text-slate-500">{b.purpose}</div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-slate-600">
                        {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" - "}
                        {new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
