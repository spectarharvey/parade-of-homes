"use client";

import { useStore } from "@/lib/store";
import AdminShell from "@/components/AdminShell";
import AdminLogin from "@/components/AdminLogin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, isAdmin } = useStore();

  // Avoid a flash of the wrong screen before session storage is read.
  if (!ready) return null;
  if (!isAdmin) return <AdminLogin />;
  return <AdminShell>{children}</AdminShell>;
}
