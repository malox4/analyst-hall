import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { HANDBOOK, HANDBOOK_GROUPS, handbookSearch } from "@/content/play/handbook";
import { PageMotion } from "@/components/ui/PageMotion";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";

export function HandbookPage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("Все");
  const found = useMemo(() => {
    const rows = handbookSearch(q);
    return group === "Все" ? rows : rows.filter((e) => e.group === group);
  }, [q, group]);

  return (
    <PageMotion>
      <Pill>Словарь контура</Pill>
      <h1 className="font-display mt-3 text-4xl md:text-5xl">Справочник</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Дебет, кредит, холд, nostro, FX, trailer. С примером и API, чтобы в квесте не гадать, «что писать в поле».
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найти: дебет, холд, IBAN…"
          className="min-w-[16rem] flex-1 border-b border-white/10 bg-transparent py-2 outline-none focus:border-gold/40"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {["Все", ...HANDBOOK_GROUPS].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={cn("rounded-full border px-3 py-1 text-[11px]", group === g ? "border-gold/40 text-gold" : "border-white/10 text-muted")}
          >
            {g}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        {found.length} из {HANDBOOK.length}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {found.map((e) => (
          <article key={e.id} id={e.id} className="glass rounded-3xl p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-gold">
              <BookOpen size={12} /> {e.group}
            </div>
            <h2 className="font-display mt-2 text-2xl">{e.term}</h2>
            {e.also && <p className="mt-1 text-xs text-muted">также: {e.also.join(", ")}</p>}
            <p className="mt-3 text-sm leading-6">{e.short}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{e.why}</p>
            <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-mint">Пример</div>
            <pre className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/8 bg-ink-2/70 p-3 text-xs leading-5">{e.example}</pre>
            {e.write && (
              <>
                <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-gold">Что писать в квесте</div>
                <p className="mt-1 text-sm leading-6 text-gold-2">{e.write}</p>
              </>
            )}
            {e.api && <p className="mt-3 font-mono text-[11px] leading-5 text-muted">{e.api}</p>}
          </article>
        ))}
      </div>
    </PageMotion>
  );
}
