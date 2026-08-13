import { useState } from "react";
import { motion } from "framer-motion";
import type { InfographicBlock } from "@/types/content";
import { cn } from "@/lib/cn";

export function InfographicView({ block }: { block: InfographicBlock }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h3 className="font-display text-2xl">{block.title}</h3>
      {block.caption && <p className="mt-2 text-sm text-muted">{block.caption}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {block.items.map((item, i) => (
          <motion.button
            key={item.label}
            type="button"
            onClick={() => setOpen(i)}
            whileHover={{ y: -3 }}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              open === i ? "border-gold/40 bg-gold/10" : "border-white/8 bg-white/3 hover:border-white/15",
            )}
          >
            <div className="font-display text-xl text-gold-2">{item.label}</div>
            <div className="mt-1 text-xs text-muted">{item.hint}</div>
          </motion.button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-white/8 bg-ink-2/60 p-5 text-[15px] leading-7">
        {block.items[open]?.detail}
      </div>
    </section>
  );
}
