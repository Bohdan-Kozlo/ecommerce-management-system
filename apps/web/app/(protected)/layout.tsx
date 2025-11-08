import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ProtectedHeader } from "@/components/layout/protected-header";
import { getCurrentUserServer } from "@/services/user/user-server.service";

export const metadata: Metadata = {
  title: "Profile | Ecommerce",
  description: "Manage your profile and orders",
};

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user;
  try {
    user = await getCurrentUserServer();
  } catch {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/profile";
    redirect(`/auth/login?from=${encodeURIComponent(pathname)}`);
  }

  return (
    <>
      <ProtectedHeader user={user} />
      {children}
    </>
  );
}
