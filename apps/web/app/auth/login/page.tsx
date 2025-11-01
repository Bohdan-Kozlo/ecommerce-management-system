"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGoogleAuthUrl, login } from "@/services/auth/auth.service";
import type { IAuthLoginForm } from "@/shared/types/auth.interface";

type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialState: FormState = {
  status: "idle",
};

export default function Login() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const payload: IAuthLoginForm = {
        email: (formData.get("email") ?? "").toString().trim(),
        password: (formData.get("password") ?? "").toString(),
      };

      if (!payload.email || !payload.password) {
        return {
          status: "error",
          message: "Please fill in your email and password.",
        } satisfies FormState;
      }

      try {
        await login(payload);
        router.push("/");
        router.refresh();
        return {
          status: "success",
          message: "Signed in successfully.",
        } satisfies FormState;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to sign in. Please try again.";
        return {
          status: "error",
          message,
        } satisfies FormState;
      }
    },
    initialState
  );

  return (
    <AuthShell
      title="Sign in"
      description="Access your e-commerce dashboard and manage your store."
      footerText="Don't have an account?"
      footerLink={{ href: "/auth/register", label: "Create one" }}
    >
      <form className="space-y-6" noValidate action={formAction}>
        <div className="space-y-4">
          <GoogleButton
            label="Sign in with Google"
            onClick={(event) => {
              event.preventDefault();
              window.location.href = getGoogleAuthUrl("/");
            }}
          />
          <AuthDivider label="or use your email" />
        </div>

        <div className="space-y-4 text-left">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              minLength={8}
              required
              disabled={pending}
            />
          </div>
        </div>

        {state.status !== "idle" ? (
          <p
            role="status"
            className={
              state.status === "error"
                ? "text-sm text-destructive"
                : "text-sm text-emerald-600"
            }
          >
            {state.message}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
