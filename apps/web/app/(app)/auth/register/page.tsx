"use client";

import { useActionState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGoogleAuthUrl, register } from "@/services/auth.service";
import type { IAuthRegisterForm } from "@/shared/types/auth.interface";

type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialState: FormState = {
  status: "idle",
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const payload: IAuthRegisterForm = {
        firstName: (formData.get("firstName") ?? "").toString().trim(),
        lastName: (formData.get("lastName") ?? "").toString().trim(),
        email: (formData.get("email") ?? "").toString().trim(),
        password: (formData.get("password") ?? "").toString(),
      };

      try {
        await register(payload);
        router.push(from);
        router.refresh();
        return {
          status: "success",
          message: "Account created successfully.",
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create account. Please try again.";
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
      title="Create an account"
      description="Set up your store profile in a few quick steps."
      footerText="Already have an account?"
      footerLink={{ href: "/auth/login", label: "Sign in" }}
    >
      <form className="space-y-6" noValidate action={formAction}>
        <div className="space-y-4">
          <GoogleButton
            label="Sign up with Google"
            onClick={(event) => {
              event.preventDefault();
              window.location.href = getGoogleAuthUrl(from);
            }}
          />
          <AuthDivider label="or sign up with email" />
        </div>

        <div className="space-y-4 text-left">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                placeholder="John"
                required
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                placeholder="Doe"
                required
                disabled={pending}
              />
            </div>
          </div>
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
            <Label htmlFor="password" hint="Minimum 8 characters">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
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
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
