import * as React from "react";

import { cn } from "@/lib/utils";

interface AuthDividerProps {
  label?: string;
  className?: string;
}

function AuthDivider({
  label = "or continue with",
  className,
}: AuthDividerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground",
        className
      )}
    >
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}

export { AuthDivider };
