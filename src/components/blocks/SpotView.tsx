import { useMemo, useState } from "react";
import type { SpotBlock } from "@/types/content";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

export function SpotView({
  block,
  moduleId,
  silent,
  onResolved,
  onReset,
}: {
  block: SpotBlock;
  moduleId?: string;
  silent?: boolean;
  onResolved?: (ok: boolean) => void;
  onReset?: () => void;
}) {
  const [mark, setMark] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const complete = useProgress((s) => s.completeDrill);
  const badIds = useMemo(() => block.lines.filter((l) => l.bad).map((l) => l.id), [block.lines]);

  const perfect = useMemo(() => {
    if (!checked) return false;
    return block.lines.every((l) => Boolean(mark[l.id]) === l.bad);
  }, [checked, mark, block.lines]);

  const hits = checked
    ? block.lines.filter((l) => Boolean(mark[l.id]) === l.bad).length
    : 0;

  function submit() {
    setChecked(true);
    const ok = block.lines.every((l) => Boolean(mark[l.id]) === l.bad);
    onResolved?.(ok);
    if (ok && !silent && moduleId) complete(moduleId, block.title, 34);
  }

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-rose">Игра · найди брак</div>
      <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{block.prompt}</p>
      <p className="mt-1 text-xs text-gold">
        Тапните строки-ловушки. В тикете {badIds.length} бракованных мест.
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        {block.lines.map((line, i) => {
          const on = Boolean(mark[line.id]);
          return (
            <button
              key={line.id}
              type="button"
              onClick={() => {
                if (checked && perfect) return;
                setChecked(false);
                setMark((m) => ({ ...m, [line.id]: !m[line.id] }));
              }}
              className={cn(
                "flex w-full items-start gap-3 border-b border-white/6 px-4 py-3 text-left text-sm last:border-0",
                on && !checked && "bg-gold/10",
                checked && line.bad && on && "bg-mint/10",
                checked && line.bad && !on && "bg-rose/10",
                checked && !line.bad && on && "bg-rose/10",
              )}
            >
              <span className="w-6 shrink-0 font-mono text-xs text-muted">{i + 1}</span>
              <span className="flex-1 leading-6">{line.text}</span>
              {on && <span className="text-xs text-gold">⚑</span>}
            </button>
          );
        })}
      </div>

      {checked && (
        <div className="mt-4 grid gap-2">
          {block.lines
            .filter((l) => l.bad || mark[l.id])
            .map((l) => (
              <p key={l.id} className="text-xs leading-5 text-muted">
                <span className={l.bad ? "text-mint" : "text-rose"}>{l.bad ? "Брак" : "Ложный флаг"}.</span> {l.why}
              </p>
            ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            onClick={submit}
            className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink"
          >
            Сдать разбор
          </button>
        ) : (
          <>
            <div className={perfect ? "text-mint" : "text-rose"}>
              {hits}/{block.lines.length}
              {perfect ? (silent ? " · чисто" : " · чисто · +XP") : " · ещё не чисто"}
            </div>
            {!perfect && (
              <button
                type="button"
                onClick={() => {
                  setChecked(false);
                  setMark({});
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
