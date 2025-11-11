import Link from "next/link";
import { BarChart3, TrendingUp, Package } from "lucide-react";
import AdminHeader from "@/components/layout/adminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
