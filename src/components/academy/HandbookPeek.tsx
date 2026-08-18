import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { HANDBOOK, handbookById, type HandbookEntry } from "@/content/play/handbook";

function EntryBody({ e }: { e: HandbookEntry }) {
  return (
    <>
      <p className="mt-2 text-sm leading-6">{e.short}</p>
      <p className="mt-2 text-xs leading-5 text-muted">{e.why}</p>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/8 bg-ink-2/70 p-3 text-xs leading-5 text-gold-2">{e.example}</pre>
      {e.write && <p className="mt-2 text-xs text-mint">В квест можно написать: {e.write}</p>}
      {e.api && <p className="mt-1 font-mono text-[11px] text-muted">{e.api}</p>}
    </>
  );
}

export function HandbookPeek({ ids, compact }: { ids?: string[]; compact?: boolean }) {
  const entries = (ids?.map(handbookById).filter(Boolean) as HandbookEntry[] | undefined) ?? (compact ? HANDBOOK.slice(0, 4) : []);
  if (!entries.length) return null;
  return (
    <section className="glass mt-6 rounded-3xl p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold">
          <BookOpen size={12} /> Справочник к этому ходу
        </div>
        <Link to="/book" className="text-xs text-mint hover:text-gold">
          Весь словарь →
        </Link>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {entries.map((e) => (
          <article key={e.id} className="rounded-2xl border border-white/8 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted">{e.group}</div>
            <h3 className="mt-1 font-display text-lg">{e.term}</h3>
            <EntryBody e={e} />
          </article>
        ))}
      </div>
    </section>
  );
}
