import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import AdminShell from "@/components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Unauthenticated visitors are redirected to login
  if (!user) {
    redirect("/login");
  }

  // Regular authenticated users (non-admins) are redirected to the member portal catalog/dashboard
  if (!isAdmin(user)) {
    redirect("/portal/catalog");
  }

  return <AdminShell>{children}</AdminShell>;
}
