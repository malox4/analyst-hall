import { useState } from "react";
import type { CaseBlock } from "@/types/content";
import { cn } from "@/lib/cn";

export function CaseView({ block }: { block: CaseBlock }) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-rose">Кейс с разбором</div>
      <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-muted">{block.situation}</p>
      <p className="mt-3 font-medium">{block.question}</p>
      <div className="mt-4 grid gap-2">
        {block.options.map((o, i) => {
          const shown = pick !== null;
          return (
            <button
              key={o.text}
              type="button"
              onClick={() => setPick(i)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm",
                pick === i && o.good && "border-mint/40 bg-mint/10",
                pick === i && !o.good && "border-rose/40 bg-rose/10",
                shown && o.good && pick !== i && "border-mint/20",
                !shown && "border-white/8 hover:border-white/16",
              )}
            >
              {o.text}
              {shown && <p className="mt-2 text-xs leading-5 text-muted">{o.why}</p>}
            </button>
          );
        })}
      </div>
      {pick !== null && <p className="mt-4 text-sm leading-6 text-gold-2/90">{block.debrief}</p>}
    </section>
  );
}
