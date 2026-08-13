import type { CalloutBlock } from "@/types/content";
import { cn } from "@/lib/cn";

export function CalloutView({ block }: { block: CalloutBlock }) {
  const tone = {
    gold: "border-gold/30 bg-gold/8",
    mint: "border-mint/30 bg-mint/8",
    violet: "border-violet/30 bg-violet/8",
    rose: "border-rose/30 bg-rose/8",
  }[block.tone];
  const title = {
    gold: "text-gold-2",
    mint: "text-mint",
    violet: "text-violet",
    rose: "text-rose",
  }[block.tone];
  return (
    <aside className={cn("rounded-3xl border px-6 py-5", tone)}>
      <div className={cn("text-[11px] uppercase tracking-[0.18em]", title)}>{block.title}</div>
      <p className="mt-2 text-[15px] leading-7 text-paper/90">{block.text}</p>
    </aside>
  );
}
