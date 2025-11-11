"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShoppingCart, Package, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IUser } from "@/shared/types/user.interface";
import { getCurrentUser } from "@/services/user/user.service";
import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  async function handleLogout() {
    try {
      await apiFetch(API_URL.auth("logout"), {
        method: "POST",
      });
      setUser(null);
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      router.push("/auth/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-6">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
          >
            Products
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <>
              <div className="h-9 w-9 bg-muted animate-pulse rounded" />
              <div className="h-9 w-9 bg-muted animate-pulse rounded" />
              <div className="h-9 w-24 bg-muted animate-pulse rounded" />
            </>
          ) : user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost" size="icon" className="relative">
                  <Package className="h-5 w-5" />
                  <span className="sr-only">Orders</span>
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
