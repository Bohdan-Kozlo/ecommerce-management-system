/* eslint-disable react/prop-types */
import * as React from "react";

import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  hint?: string;
};

function Label({ hint, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      <span className="flex items-start justify-between gap-4">
        <span>{children}</span>
        {hint ? (
          <span className="text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export { Label };
