"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, ScrollText, Settings } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/workspace", label: "Workspace", icon: FileUp },
  { href: "/audit", label: "Audit", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

/** Horizontal nav strip shown below `lg`, replacing the desktop sidebar. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border-subtle bg-nav px-3 py-2 lg:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[14px]",
              active
                ? "bg-green-bg font-semibold text-green-text"
                : "text-ink-secondary",
            )}
          >
            <Icon size={18} className={active ? "text-green" : "text-ink-muted"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
