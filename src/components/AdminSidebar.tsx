"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanBarcode,
  BookOpen,
  QrCode,
  Users,
  Clock,
  Coins,
  Warehouse,
  ClipboardCheck,
  ShoppingBag,
  Building,
  Sliders,
  ShieldCheck,
  FileText,
  BarChart3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  permission?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "EXECUTIVE",
    items: [
      { title: "Director Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "CIRCULATION DESK",
    items: [
      { title: "Rapid Circulation", href: "/admin/circulation", icon: ScanBarcode, badge: "F2/F3" },
      { title: "Active Loans", href: "/admin/loans", icon: Clock },
      { title: "Hold Reservations", href: "/admin/reservations", icon: Users },
      { title: "Fines & Penalties", href: "/admin/fines", icon: Coins },
    ],
  },
  {
    label: "CATALOG & HOLDINGS",
    items: [
      { title: "Master Books Catalog", href: "/admin/books", icon: BookOpen },
      { title: "Physical Copies & Barcodes", href: "/admin/copies", icon: QrCode },
      { title: "Member Directory", href: "/admin/members", icon: Users },
    ],
  },
  {
    label: "INVENTORY & LOGISTICS",
    items: [
      { title: "Inventory & Shelves", href: "/admin/inventory", icon: Warehouse },
      { title: "Shelf Audit Station", href: "/admin/inventory/audit", icon: ClipboardCheck },
      { title: "Acquisitions & Budget", href: "/admin/acquisitions", icon: ShoppingBag },
      { title: "Facilities & Rooms", href: "/admin/facilities", icon: Building },
    ],
  },
  {
    label: "SYSTEM & GOVERNANCE",
    items: [
      { title: "Borrowing Policies", href: "/admin/policies", icon: Sliders },
      { title: "Security & RBAC", href: "/admin/security", icon: ShieldCheck },
      { title: "Immutable Audit Logs", href: "/admin/audit-logs", icon: FileText },
    ],
  },
];

interface AdminSidebarProps {
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // In mobile drawer mode, never collapse
  const isCollapsed = isMobileDrawer ? false : collapsed;

  return (
    <aside
      className={
        isMobileDrawer
          ? "flex flex-col bg-slate-900 text-slate-300 w-72 max-w-[85vw] h-full shadow-2xl overflow-y-auto"
          : `hidden md:flex relative flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 ease-in-out ${
              collapsed ? "w-20" : "w-64"
            } min-h-screen shrink-0`
      }
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 h-16 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
            U
          </div>
          {!isCollapsed && (
            <div>
              <div className="font-bold text-slate-100 text-sm leading-tight tracking-wide">
                UNIVERSITY LMS
              </div>
              <div className="text-[10px] text-blue-400 font-medium">ENTERPRISE EDITION</div>
            </div>
          )}
        </div>
        {isMobileDrawer ? (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobileDrawer && onCloseMobile) {
                      onCloseMobile();
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Public Catalog OPAC Switcher */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 shrink-0">
        <Link
          href="/portal/catalog"
          onClick={() => {
            if (isMobileDrawer && onCloseMobile) {
              onCloseMobile();
            }
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/30 border border-amber-900/40 hover:bg-amber-900/40 transition-colors ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
          title={isCollapsed ? "Go to Student/Faculty Portal" : undefined}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Go to Member OPAC</span>}
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
