import React from "react";

export type EntityStatus =
  | "AVAILABLE"
  | "BORROWED"
  | "OVERDUE"
  | "RESERVED"
  | "ON_HOLD"
  | "LOST"
  | "DAMAGED"
  | "UNDER_REPAIR"
  | "MISSING"
  | "WITHDRAWN"
  | "ACTIVE"
  | "INACTIVE"
  | "RESTRICTED"
  | "LOCKED"
  | "PAID"
  | "PARTIAL"
  | "PENDING"
  | "WAIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CONFIRMED";

interface StatusBadgeProps {
  status: string | EntityStatus;
  className?: string;
  size?: "sm" | "md";
}

const statusStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  AVAILABLE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Ready to Borrow" },
  BORROWED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Taken Out" },
  OVERDUE: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-300", label: "Late" },
  RESERVED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Saved for Someone" },
  ON_HOLD: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", label: "Ready to Pick Up" },
  LOST: { bg: "bg-slate-900", text: "text-white", border: "border-slate-800", label: "Lost" },
  DAMAGED: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300", label: "Damaged / Broken" },
  UNDER_REPAIR: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Being Fixed" },
  MISSING: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", label: "Can't Find" },
  WITHDRAWN: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", label: "Removed" },
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Good Standing" },
  INACTIVE: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", label: "Not Active" },
  RESTRICTED: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300", label: "Blocked" },
  LOCKED: { bg: "bg-red-100", text: "text-red-800", border: "border-red-400", label: "Locked" },
  PAID: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Paid" },
  PARTIAL: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Partly Paid" },
  PENDING: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Waiting" },
  WAIVED: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Forgiven (No Fee)" },
  IN_PROGRESS: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Working on It" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Finished" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Confirmed" },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "", size = "md" }) => {
  const upper = String(status || "").toUpperCase();
  const config = statusStyles[upper] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    label: status,
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
