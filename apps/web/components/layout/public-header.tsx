import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicHeader() {
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
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
          <Link href="/auth/register">
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Sign up</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
