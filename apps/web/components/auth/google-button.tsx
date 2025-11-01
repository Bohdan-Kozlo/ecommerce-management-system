/* eslint-disable react/prop-types */
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GoogleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

function GoogleButton({
  label = "Continue with Google",
  className,
  ...props
}: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full gap-2", className)}
      {...props}
    >
      <GoogleIcon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  );
}

function GoogleIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("fill-none", className)}
      {...props}
    >
      <path
        d="M17.64 9.2045C17.64 8.56636 17.5827 7.95272 17.4763 7.36364H9V10.8454H13.8436C13.635 11.9681 13.005 12.9236 12.0495 13.5618V15.8195H14.9563C16.6581 14.2527 17.64 11.9454 17.64 9.2045Z"
        fill="#4285F4"
      />
      <path
        d="M8.9999 18C11.4309 18 13.4672 17.1945 14.9562 15.8196L12.0494 13.5619C11.2449 14.1019 10.2108 14.4205 8.9999 14.4205C6.65618 14.4205 4.67172 12.8373 3.96486 10.71H0.957031V13.0418C2.43794 15.9836 5.48163 18 8.9999 18Z"
        fill="#34A853"
      />
      <path
        d="M3.96499 10.71C3.78499 10.17 3.68181 9.59317 3.68181 9C3.68181 8.40682 3.78499 7.83 3.96499 7.29V4.95818H0.957167C0.347167 6.17364 0 7.54773 0 9C0 10.4523 0.347167 11.8264 0.957167 13.0418L3.96499 10.71Z"
        fill="#FBBC05"
      />
      <path
        d="M8.9999 3.57955C10.3217 3.57955 11.5017 4.0341 12.4245 4.91091L15.0209 2.31455C13.4636 0.864546 11.4272 0 8.9999 0C5.48163 0 2.43794 2.01682 0.957031 4.95818L3.96486 7.29C4.67172 5.16273 6.65618 3.57955 8.9999 3.57955Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export { GoogleButton };
