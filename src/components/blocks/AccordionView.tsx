import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { AccordionBlock } from "@/types/content";

export function AccordionView({ block }: { block: AccordionBlock }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h3 className="font-display text-2xl">{block.title}</h3>
      <div className="mt-4 divide-y divide-white/8">
        {block.items.map((item, i) => (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="font-medium">{item.q}</span>
              <ChevronDown size={16} className={`shrink-0 text-gold transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pb-4 text-[15px] leading-7 text-muted"
                >
                  {item.a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
