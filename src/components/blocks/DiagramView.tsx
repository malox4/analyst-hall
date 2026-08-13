import { useState } from "react";
import { motion } from "framer-motion";
import type { DiagramBlock } from "@/types/content";
import { cn } from "@/lib/cn";

export function DiagramView({ block }: { block: DiagramBlock }) {
  const [id, setId] = useState(block.nodes[0]?.id);
  const active = block.nodes.find((n) => n.id === id) ?? block.nodes[0];
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h3 className="font-display text-2xl">{block.title}</h3>
      <p className="mt-2 text-sm text-muted">{block.hint}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {block.nodes.map((n, i) => (
          <div key={n.id} className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => setId(n.id)}
              whileHover={{ scale: 1.04 }}
              className={cn(
                "min-w-[140px] rounded-2xl border px-4 py-3 text-left",
                id === n.id ? "border-mint/40 bg-mint/10" : "border-white/10 bg-white/4",
              )}
            >
              <div className="text-sm font-medium">{n.label}</div>
              {n.sub && <div className="text-[11px] text-muted">{n.sub}</div>}
            </motion.button>
            {i < block.nodes.length - 1 && <div className="hidden h-px w-6 bg-gold/40 sm:block" />}
          </div>
        ))}
      </div>
      {active && (
        <div className="mt-5 rounded-2xl border border-mint/15 bg-mint/5 p-5 text-[15px] leading-7">{active.detail}</div>
      )}
    </section>
  );
}
