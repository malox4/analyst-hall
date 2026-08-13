import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import type { QuizBlock } from "@/types/content";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

export function QuizView({ block, moduleId }: { block: QuizBlock; moduleId: string }) {
  const saveQuiz = useProgress((s) => s.saveQuiz);
  const stored = useProgress((s) => s.modules[moduleId]);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return 0;
    const ok = block.questions.filter((q) => picked[q.id] === q.answer).length;
    return Math.round((ok / block.questions.length) * 100);
  }, [submitted, picked, block.questions]);

  function submit() {
    const ok = block.questions.filter((q) => picked[q.id] === q.answer).length;
    const s = Math.round((ok / block.questions.length) * 100);
    setSubmitted(true);
    saveQuiz(moduleId, s, s >= block.passScore);
  }

  function retry() {
    setPicked({});
    setSubmitted(false);
  }

  const ready = block.questions.every((q) => picked[q.id] !== undefined);

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-violet">Проверка</div>
          <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
        </div>
        {stored?.quizScore != null && (
          <div className="text-sm text-muted">
            Лучший результат: <span className="text-gold">{stored.quizScore}%</span>
          </div>
        )}
      </div>
      <div className="mt-6 space-y-6">
        {block.questions.map((q, qi) => (
          <div key={q.id}>
            <p className="text-[15px] leading-7">
              <span className="mr-2 text-gold">{qi + 1}.</span>
              {q.q}
            </p>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, oi) => {
                const selected = picked[q.id] === oi;
                const correct = submitted && oi === q.answer;
                const wrong = submitted && selected && oi !== q.answer;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={submitted}
                    onClick={() => setPicked((p) => ({ ...p, [q.id]: oi }))}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left text-sm transition",
                      selected && !submitted && "border-gold/40 bg-gold/10",
                      !selected && !submitted && "border-white/8 hover:border-white/16",
                      correct && "border-mint/40 bg-mint/10",
                      wrong && "border-rose/40 bg-rose/10",
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      {correct && <Check size={14} className="text-mint" />}
                      {wrong && <X size={14} className="text-rose" />}
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            {submitted && <p className="mt-2 text-sm leading-6 text-muted">{q.why}</p>}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            disabled={!ready}
            onClick={submit}
            className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            Проверить
          </button>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm",
                score >= block.passScore ? "border-mint/40 text-mint" : "border-rose/40 text-rose",
              )}
            >
              {score}% · порог {block.passScore}%
            </motion.div>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-muted hover:text-paper"
            >
              <RotateCcw size={14} /> Перепройти
            </button>
          </>
        )}
      </div>
    </section>
  );
}
