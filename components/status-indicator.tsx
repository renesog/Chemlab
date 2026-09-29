import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function StatusIndicator({ tone = "neutral", className, ...props }: ComponentProps<"span"> & {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return <span className={cn("status-indicator", className)} data-tone={tone} {...props}/>;
}
