import { useMemo, useState } from "react";
import type { MatchBlock } from "@/types/content";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MatchView({ block, moduleId }: { block: MatchBlock; moduleId: string }) {
  const rights = useMemo(() => shuffle(block.pairs.map((p) => p.right)), [block.pairs]);
  const [left, setLeft] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const complete = useProgress((s) => s.completeDrill);
  const map = useMemo(() => Object.fromEntries(block.pairs.map((p) => [p.left, p.right])), [block.pairs]);
  const ready = Object.keys(links).length === block.pairs.length;

  function pickRight(r: string) {
    if (!left || checked) return;
    setLinks((l) => ({ ...l, [left]: r }));
    setLeft(null);
  }

  function submit() {
    setChecked(true);
    const ok = block.pairs.every((p) => links[p.left] === p.right);
    if (ok) complete(moduleId, block.title, 28);
  }

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-violet">Игра · пары</div>
      <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{block.prompt}</p>
      <p className="mt-1 text-xs text-gold">Сначала левая колонка, потом правая.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          {block.pairs.map((p) => (
            <button
              key={p.left}
              type="button"
              disabled={checked}
              onClick={() => setLeft(p.left)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm",
                left === p.left && "border-gold/50 bg-gold/10",
                links[p.left] && !checked && "border-white/20",
                checked && links[p.left] === map[p.left] && "border-mint/40 bg-mint/10",
                checked && links[p.left] !== map[p.left] && "border-rose/40 bg-rose/10",
                !links[p.left] && left !== p.left && "border-white/10 hover:border-gold/30",
              )}
            >
              {p.left}
              {links[p.left] && (
                <span className="mt-1 block text-xs text-gold-2">→ {links[p.left]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          {rights.map((r) => {
            const used = Object.values(links).includes(r);
            return (
              <button
                key={r}
                type="button"
                disabled={checked || used || !left}
                onClick={() => pickRight(r)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left text-sm",
                  used ? "border-white/8 text-muted" : "border-white/10 hover:border-violet/40",
                  !left && "opacity-60",
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            disabled={!ready}
            onClick={submit}
            className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            Сверить пары
          </button>
        ) : (
          <>
            <div
              className={
                block.pairs.every((p) => links[p.left] === p.right) ? "text-mint" : "text-rose"
              }
            >
              {block.pairs.filter((p) => links[p.left] === p.right).length}/{block.pairs.length}
            </div>
            {!block.pairs.every((p) => links[p.left] === p.right) && (
              <button
                type="button"
                onClick={() => {
                  setChecked(false);
                  setLinks({});
                  setLeft(null);
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
