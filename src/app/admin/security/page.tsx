import React from "react";
import { ShieldCheck, Lock, Key, UserCheck, ShieldAlert, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { code: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            Security Administration & RBAC
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Granular authorization matrix: User $\to$ Role $\to$ Permissions. Strict server-side validation.
          </p>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Session Security Status
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">Active & Protected</div>
          <div className="text-xs text-slate-500 mt-1">
            HTTP-Only cookies, atomic transactions, and CSRF protection active
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Key className="w-4 h-4" />
            Configured Roles
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{roles.length} Distinct Roles</div>
          <div className="text-xs text-slate-500 mt-1">
            Covering Super Admin, Director, Librarians, Staff, Faculty & Students
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            Enforced Permissions
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {permissions.length} Granular Gates
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Guarding circulation, book archives, and financial waivers
          </div>
        </div>
      </div>

      {/* RBAC Permission Matrix Table (Section 4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Enterprise RBAC Authorization Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Displays active mapping between granular permission keys and institutional roles.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 sticky left-0 bg-slate-50 z-10">Permission Code</th>
                <th className="py-3 px-4">Domain</th>
                {roles.map((r) => (
                  <th key={r.id} className="py-3 px-3 text-center whitespace-nowrap">
                    {r.name.replace("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 sticky left-0 bg-white z-10">
                    {p.code}
                    <div className="text-[10px] text-slate-400 font-sans">{p.displayName}</div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {p.module}
                    </span>
                  </td>
                  {roles.map((r) => {
                    const hasPerm =
                      r.name === "SUPER_ADMIN" ||
                      r.permissions.some((rp) => rp.permissionId === p.id);

                    return (
                      <td key={r.id} className="py-2.5 px-3 text-center">
                        {hasPerm ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
