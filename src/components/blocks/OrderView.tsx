import { useMemo, useState } from "react";
import type { OrderBlock } from "@/types/content";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function OrderView({ block, moduleId }: { block: OrderBlock; moduleId: string }) {
  const deck = useMemo(() => shuffle(block.items), [block.items]);
  const [seq, setSeq] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const complete = useProgress((s) => s.completeDrill);
  const left = deck.filter((i) => !seq.includes(i.id));
  const map = useMemo(() => Object.fromEntries(block.items.map((i) => [i.id, i])), [block.items]);

  function submit() {
    setChecked(true);
    const ok = seq.every((id, idx) => map[id].pos === idx + 1) && seq.length === block.items.length;
    if (ok) complete(moduleId, block.title, 32);
  }

  const perfect = checked && seq.every((id, idx) => map[id].pos === idx + 1);

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Игра · порядок</div>
      <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{block.prompt}</p>
      <p className="mt-1 text-xs text-gold">Собирайте цепочку сверху вниз — как на настоящей смене.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-widest text-muted">Ещё не взяли</div>
          <div className="grid gap-2">
            {left.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={checked}
                onClick={() => setSeq((s) => [...s, item.id])}
                className="rounded-2xl border border-white/10 px-4 py-3 text-left text-sm hover:border-gold/30"
              >
                {item.text}
              </button>
            ))}
            {!left.length && <p className="text-xs text-muted">Все шаги в цепочке.</p>}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-widest text-muted">Ваш порядок</div>
          <div className="grid gap-2">
            {seq.map((id, idx) => {
              const ok = map[id].pos === idx + 1;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={checked}
                  onClick={() => setSeq((s) => s.filter((x) => x !== id))}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left text-sm",
                    !checked && "border-gold/25 bg-gold/8",
                    checked && ok && "border-mint/40 bg-mint/10",
                    checked && !ok && "border-rose/40 bg-rose/10",
                  )}
                >
                  <span className="mr-2 text-gold">{idx + 1}.</span>
                  {map[id].text}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            disabled={seq.length !== block.items.length}
            onClick={submit}
            className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            Проверить порядок
          </button>
        ) : (
          <>
            <div className={perfect ? "text-mint" : "text-rose"}>
              {seq.filter((id, idx) => map[id].pos === idx + 1).length}/{block.items.length}
              {perfect ? " · +XP" : " · снимите шаг и переставьте"}
            </div>
            {!perfect && (
              <button
                type="button"
                onClick={() => {
                  setChecked(false);
                  setSeq([]);
                }}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted"
              >
                Сбросить
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
