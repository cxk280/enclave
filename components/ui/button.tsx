import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-green text-white hover:brightness-110",
  secondary: "bg-surface text-ink border border-border-strong hover:bg-surface-2",
  ghost: "text-ink-secondary hover:bg-surface-2 hover:text-ink",
};

/**
 * Shared button classes. Uses a focus-visible OUTLINE (not a ring) with an
 * offset so the focus indicator is visible on any background — including on the
 * green primary button, where a same-color ring would be invisible.
 */
export function buttonClasses(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-[18px] py-3 text-[15px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className,
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}
