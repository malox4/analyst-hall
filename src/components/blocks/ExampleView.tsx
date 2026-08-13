import type { ExampleBlock } from "@/types/content";

export function ExampleView({ block }: { block: ExampleBlock }) {
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Живой пример</div>
      <h3 className="font-display mt-2 text-2xl">{block.title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-muted">{block.context}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {block.bad && (
          <div className="rounded-2xl border border-rose/20 bg-rose/8 p-4">
            <div className="text-[11px] uppercase tracking-widest text-rose">Слабо</div>
            <p className="mt-2 text-sm leading-6">{block.bad}</p>
          </div>
        )}
        {block.good && (
          <div className="rounded-2xl border border-mint/20 bg-mint/8 p-4">
            <div className="text-[11px] uppercase tracking-widest text-mint">Сильно</div>
            <p className="mt-2 text-sm leading-6">{block.good}</p>
          </div>
        )}
      </div>
      {block.note && <p className="mt-4 text-sm italic text-muted">{block.note}</p>}
    </section>
  );
}
