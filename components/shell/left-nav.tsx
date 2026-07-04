"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, Lock, ScrollText, Settings } from "lucide-react";
import { Wordmark } from "./wordmark";
import { useRegion } from "./region-provider";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/workspace", label: "Workspace", icon: FileUp },
  { href: "/audit", label: "Audit Trail", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function LeftNav() {
  const pathname = usePathname();
  const { region } = useRegion();

  return (
    <nav className="flex w-60 shrink-0 flex-col border-r border-border-subtle bg-nav p-3.5">
      <div className="px-2.5 pb-5 pt-1">
        <Wordmark />
      </div>

      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] transition",
                  active
                    ? "bg-green-bg font-semibold text-green-text"
                    : "text-ink-secondary hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  className={active ? "text-green" : "text-ink-muted"}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <div className="flex items-center gap-2 rounded-md bg-surface-2 px-3 py-2.5 text-[13px] text-ink-muted">
          <Lock size={14} className="shrink-0" />
          Region-locked · {region.id}
        </div>
      </div>
    </nav>
  );
}
