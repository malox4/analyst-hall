import { useState } from "react";
import { motion } from "framer-motion";
import type { SceneBlock } from "@/types/content";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

export function SceneView({ block, moduleId }: { block: SceneBlock; moduleId: string }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const complete = useProgress((s) => s.completeDrill);
  const step = block.steps[i];
  const last = i === block.steps.length - 1;

  function choose(oi: number) {
    if (pick !== null) return;
    setPick(oi);
    const good = step.options[oi].good;
    const nextScore = score + (good ? 1 : 0);
    setScore(nextScore);
    if (last && nextScore >= Math.ceil(block.steps.length * 0.7)) {
      complete(moduleId, block.title, 40);
    }
  }

  function next() {
    if (!last) {
      setI((x) => x + 1);
      setPick(null);
    }
  }

  function restart() {
    setI(0);
    setPick(null);
    setScore(0);
  }

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-rose">Игра · диалог</div>
      <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{block.setting}</p>
      <div className="mt-3 text-xs text-gold">
        Реплика {i + 1}/{block.steps.length}
      </div>

      <motion.div
        key={i}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4"
      >
        <div className="text-[11px] uppercase tracking-widest text-gold-2">{step.from}</div>
        <p className="mt-2 text-[15px] leading-7">{step.line}</p>
      </motion.div>

      <div className="mt-4 grid gap-2">
        {step.options.map((o, oi) => {
          const shown = pick !== null;
          return (
            <button
              key={o.text}
              type="button"
              onClick={() => choose(oi)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm",
                !shown && "border-white/10 hover:border-gold/30",
                shown && pick === oi && o.good && "border-mint/40 bg-mint/10",
                shown && pick === oi && !o.good && "border-rose/40 bg-rose/10",
                shown && o.good && pick !== oi && "border-mint/20",
              )}
            >
              {o.text}
              {shown && <p className="mt-2 text-xs leading-5 text-muted">{o.why}</p>}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {pick !== null && !last && (
          <button type="button" onClick={next} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink">
            Дальше в чате
          </button>
        )}
        {pick !== null && last && (
          <>
            <div className={score >= Math.ceil(block.steps.length * 0.7) ? "text-mint" : "text-rose"}>
              {score}/{block.steps.length} сильных ответов
              {score >= Math.ceil(block.steps.length * 0.7) ? " · +XP" : ""}
            </div>
            {score < Math.ceil(block.steps.length * 0.7) && (
              <button
                type="button"
                onClick={restart}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted"
              >
                Переиграть диалог
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
