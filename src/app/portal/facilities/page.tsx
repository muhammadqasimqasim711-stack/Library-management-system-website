"use client";

import React, { useState, useEffect } from "react";
import { Building, Users, Calendar, Clock, CheckCircle2, RefreshCw, X } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function MemberFacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking modal
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const fetchFacilities = () => {
    setLoading(true);
    fetch("/api/facilities")
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities) setFacilities(data.facilities);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFacilities();
    // Default times (today 2 hours from now)
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    setStartTime(start.toISOString().slice(0, 16));
    setEndTime(end.toISOString().slice(0, 16));
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const res = await fetch("/api/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: selectedFacility.id,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          purpose: purpose || "Academic Study Group",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setBookingError(json.error || "Reservation failed.");
      } else {
        setBookingSuccess("Study room reserved successfully! Confirmation sent to your profile.");
        setTimeout(() => {
          setSelectedFacility(null);
          setBookingSuccess(null);
          fetchFacilities();
        }, 1200);
      }
    } catch (err) {
      setBookingError("Network error.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          Library Study Rooms & Research Spaces
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Reserve high-performance computing workstations, quiet individual research carrels, and collaborative group study suites.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading available facilities...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {facilities.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
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

                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Capacity: {f.capacity}
                  </div>
                  <span>•</span>
                  <div>{f.type.replace("_", " ")}</div>
                </div>

                {f.amenities && (
                  <p className="text-xs text-slate-500 italic">
                    Amenities: {f.amenities}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">
                  {f.bookings.length} reservations today
                </span>

                <button
                  onClick={() => {
                    setSelectedFacility(f);
                    setBookingError(null);
                    setBookingSuccess(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
                >
                  Reserve Space
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Book {selectedFacility.name}
              </span>
              <button
                onClick={() => setSelectedFacility(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-lg">
                {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg">
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Study Purpose / Course</label>
                <input
                  type="text"
                  placeholder="e.g. CS 402 Final Project Group Study"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFacility(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {bookingLoading ? "Confirming..." : "Confirm Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
