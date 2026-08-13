import { motion } from "framer-motion";
import type { TheoryBlock } from "@/types/content";

export function TheoryView({ block }: { block: TheoryBlock }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="glass rounded-3xl p-6 md:p-8"
    >
      <h3 className="font-display text-2xl md:text-3xl">{block.title}</h3>
      {block.lead && <p className="mt-3 text-base leading-relaxed text-gold-2/90">{block.lead}</p>}
      <div className="mt-4 space-y-3 text-[15px] leading-7 text-paper/90">
        {block.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      {block.bullets && (
        <ul className="mt-4 space-y-2">
          {block.bullets.map((b) => (
            <li key={b} className="flex gap-3 text-[15px] leading-7">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
