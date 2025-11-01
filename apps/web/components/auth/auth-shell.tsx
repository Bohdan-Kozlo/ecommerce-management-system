import * as React from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: {
    href: string;
    label: string;
  };
}

function AuthShell({
  title,
  description,
  children,
  footerText,
  footerLink,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
        <CardFooter className="flex items-center justify-center border-t border-border/60 bg-muted/30 text-sm text-muted-foreground">
          <span>
            {footerText}{" "}
            <Link
              href={footerLink.href}
              className="font-medium text-foreground hover:underline"
            >
              {footerLink.label}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </main>
  );
}

export { AuthShell };
