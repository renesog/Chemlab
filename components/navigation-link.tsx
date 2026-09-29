import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function NavigationLink({ active, className, ...props }: ComponentProps<typeof Link> & { active?: boolean }) {
  return <Link className={cn("shell-nav-link", className)} aria-current={active ? "page" : undefined} {...props}/>;
}
