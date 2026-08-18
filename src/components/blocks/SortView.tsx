import { useMemo, useState } from "react";
import type { SortBlock } from "@/types/content";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

export function SortView({
  block,
  moduleId,
  silent,
  onResolved,
  onReset,
}: {
  block: SortBlock;
  moduleId?: string;
  silent?: boolean;
  onResolved?: (ok: boolean) => void;
  onReset?: () => void;
}) {
  const [place, setPlace] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const complete = useProgress((s) => s.completeDrill);
  const done = useProgress((s) => (moduleId ? s.modules[moduleId]?.drills?.[block.title] : undefined));

  const allIn = block.items.every((i) => place[i.id]);
  const score = useMemo(() => {
    if (!checked) return 0;
    return block.items.filter((i) => place[i.id] === i.bucket).length;
  }, [checked, place, block.items]);

  function cycle(id: string) {
    if (checked && score === block.items.length) return;
    setChecked(false);
    setPlace((p) => {
      const idx = block.buckets.findIndex((b) => b.id === p[id]);
      const next = block.buckets[(idx + 1) % block.buckets.length];
      return { ...p, [id]: next.id };
    });
  }

  function submit() {
    setChecked(true);
    const ok = block.items.every((i) => place[i.id] === i.bucket);
    onResolved?.(ok);
    if (ok && !silent && moduleId) complete(moduleId, block.title, 30);
  }

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-mint">Игра · сортировка</div>
      <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{block.prompt}</p>
      <p className="mt-1 text-xs text-gold">Тап по карточке — следующая корзина. Как живой бэклог.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {block.buckets.map((b) => (
          <span key={b.id} className="rounded-full border border-white/12 px-3 py-1 text-xs text-gold-2">
            {b.title}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-2">
        {block.items.map((item) => {
          const bucket = block.buckets.find((b) => b.id === place[item.id]);
          const correct = place[item.id] === item.bucket;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => cycle(item.id)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                !place[item.id] && "border-white/10 hover:border-gold/30",
                place[item.id] && !checked && "border-gold/30 bg-gold/8",
                checked && correct && "border-mint/40 bg-mint/10",
                checked && !correct && "border-rose/40 bg-rose/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm leading-6">{item.text}</span>
                <span className="shrink-0 text-[11px] uppercase tracking-widest text-gold">
                  {bucket?.title ?? "—"}
                </span>
              </div>
              {checked && <p className="mt-2 text-xs leading-5 text-muted">{item.why}</p>}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            disabled={!allIn}
            onClick={submit}
            className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            Проверить расклад
          </button>
        ) : (
          <>
            <div className={score === block.items.length ? "text-mint" : "text-rose"}>
              {score}/{block.items.length}
              {score === block.items.length || done ? (silent ? " · чисто" : " · +XP") : " · поправьте карты"}
            </div>
            {score < block.items.length && (
              <button
                type="button"
                onClick={() => {
                  setChecked(false);
                  setPlace({});
                  onReset?.();
                }}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted"
              >
                Заново
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
