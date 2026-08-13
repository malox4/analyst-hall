import type { SoftBlock } from "@/types/content";

export function SoftView({ block }: { block: SoftBlock }) {
  return (
    <section className="rounded-3xl border border-rose/20 bg-gradient-to-br from-rose/10 to-transparent p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-rose">Soft skill</div>
      <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-muted">{block.scene}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-mint/20 bg-mint/8 p-4">
          <div className="text-[11px] uppercase tracking-widest text-mint">Делайте</div>
          <ul className="mt-2 space-y-2 text-sm leading-6">
            {block.doThis.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-rose/20 bg-rose/8 p-4">
          <div className="text-[11px] uppercase tracking-widest text-rose">Не делайте</div>
          <ul className="mt-2 space-y-2 text-sm leading-6">
            {block.dont.map((x) => (
              <li key={x}>· {x}</li>
            ))}
          </ul>
        </div>
      </div>
      <blockquote className="mt-5 border-l-2 border-gold/50 pl-4 text-[15px] leading-7 text-gold-2">
        «{block.phrase}»
      </blockquote>
    </section>
  );
}
