import type { StepsBlock } from "@/types/content";

export function StepsView({ block }: { block: StepsBlock }) {
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h3 className="font-display text-2xl">{block.title}</h3>
      <ol className="mt-5 space-y-4">
        {block.items.map((s) => (
          <li key={s.n} className="flex gap-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-xs text-gold">
              {s.n}
            </div>
            <div>
              <div className="font-medium">{s.title}</div>
              <p className="mt-1 text-sm leading-6 text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
