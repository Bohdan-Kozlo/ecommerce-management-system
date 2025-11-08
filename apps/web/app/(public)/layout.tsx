import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { ProtectedHeader } from "@/components/layout/protected-header";
import { getCurrentUserServer } from "@/services/user/user-server.service";

export const metadata: Metadata = {
  title: "Ecommerce Store",
  description: "Browse products and manage your orders",
};

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user;
  try {
    user = await getCurrentUserServer();
  } catch {
    user = null;
  }

  return (
    <>
      {user ? <ProtectedHeader user={user} /> : <PublicHeader />}
      {children}
    </>
  );
}
