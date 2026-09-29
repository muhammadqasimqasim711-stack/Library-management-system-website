"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  AlertTriangle,
  CircleDollarSign,
  BookmarkCheck,
  RefreshCw,
  Megaphone,
  Check,
} from "lucide-react";

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

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

  const getNotificationVisual = (type: string) => {
    switch (type) {
      case "OVERDUE":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
          bg: "bg-rose-50 border-rose-200",
          label: "Overdue Book",
        };
      case "DUE_SOON":
        return {
          icon: <Clock className="w-5 h-5 text-amber-600" />,
          bg: "bg-amber-50 border-amber-200",
          label: "Due Soon",
        };
      case "FINE":
        return {
          icon: <CircleDollarSign className="w-5 h-5 text-rose-600" />,
          bg: "bg-rose-50 border-rose-200",
          label: "Library Fee",
        };
      case "RESERVATION_AVAILABLE":
        return {
          icon: <BookmarkCheck className="w-5 h-5 text-emerald-600" />,
          bg: "bg-emerald-50 border-emerald-200",
          label: "Reservation Ready",
        };
      case "ANNOUNCEMENT":
        return {
          icon: <Megaphone className="w-5 h-5 text-blue-600" />,
          bg: "bg-blue-50 border-blue-200",
          label: "Announcement",
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-blue-600" />,
          bg: "bg-blue-50 border-blue-200",
          label: "Notice",
        };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-blue-700 uppercase">
            Alerts & Messages
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Important updates about your loans, ready hold pickups, return reminders, and library notices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-blue-200 transition-colors shadow-2xs"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            className="hover:text-blue-700 p-2 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            filter === "ALL"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            filter === "UNREAD"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <Bell className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="font-bold text-slate-700 text-base">
            {filter === "UNREAD" ? "No Unread Notifications" : "No Notifications"}
          </h2>
          <p className="text-xs text-slate-500">
            {filter === "UNREAD"
              ? "You are caught up on all recent library alerts."
              : "You have no notification history at this time."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const visual = getNotificationVisual(n.type);

            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !n.read
                    ? "bg-white border-blue-200 shadow-xs ring-1 ring-blue-100"
                    : "bg-slate-50/70 border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${visual.bg}`}>
                    {visual.icon}
                  </div>

                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {visual.label}
                      </span>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">{n.message}</p>

                    <div className="text-[11px] text-slate-400 pt-1">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkSingleRead(n.id)}
                    className="text-slate-400 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
