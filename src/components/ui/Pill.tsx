import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Pill({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "mint" | "violet" | "rose" | "muted";
}) {
  const map = {
    gold: "border-gold/25 bg-gold/10 text-gold-2",
    mint: "border-mint/25 bg-mint/10 text-mint",
    violet: "border-violet/25 bg-violet/10 text-violet",
    rose: "border-rose/25 bg-rose/10 text-rose",
    muted: "border-white/10 bg-white/5 text-muted",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide", map[tone])}>
      {children}
    </span>
  );
}
