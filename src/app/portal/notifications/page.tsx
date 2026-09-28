"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Clock, AlertTriangle, Coins, BookmarkCheck, RefreshCw } from "lucide-react";

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
        if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "OVERDUE":
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case "DUE_SOON":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "FINE":
        return <Coins className="w-5 h-5 text-rose-600" />;
      case "RESERVATION_AVAILABLE":
        return <BookmarkCheck className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Library Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated alerts for loan due dates, hold queue pickups, fines, and institutional announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-blue-200 transition-colors shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <Bell className="w-10 h-10 mx-auto text-slate-300" />
          <div className="font-bold text-slate-700 text-sm">No Notifications</div>
          <div className="text-xs text-slate-500">You are all caught up on all library alerts.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 sm:gap-4 ${
                !n.read
                  ? "bg-white border-blue-200 shadow-xs ring-1 ring-blue-100"
                  : "bg-slate-50/70 border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{n.title}</h3>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">{n.message}</p>
                  <span className="text-[11px] font-mono text-slate-400 mt-2 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkSingleRead(n.id)}
                  className="text-slate-400 hover:text-blue-600 text-xs font-semibold shrink-0 p-1"
                  title="Mark as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
