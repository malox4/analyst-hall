import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageMotion } from "@/components/ui/PageMotion";
import { EXAM } from "@/content/exam";
import { useProgress } from "@/stores/progressStore";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";

export function ExamPage() {
  const [step, setStep] = useState<"intro" | "run" | "done">("intro");
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const save = useProgress((s) => s.saveExam);
  const best = useProgress((s) => s.examBest);
  const attempts = useProgress((s) => s.examAttempts);

  const result = useMemo(() => {
    if (step !== "done") return null;
    let got = 0;
    let max = 0;
    for (const q of EXAM) {
      max += q.weight;
      if (picked[q.id] === q.answer) got += q.weight;
    }
    return Math.round((got / max) * 100);
  }, [step, picked]);

  const q = EXAM[i];

  function finish() {
    let got = 0;
    let max = 0;
    for (const item of EXAM) {
      max += item.weight;
      if (picked[item.id] === item.answer) got += item.weight;
    }
    const score = Math.round((got / max) * 100);
    save(score);
    setStep("done");
  }

  return (
    <PageMotion>
      <Pill tone="violet">Финальная симуляция</Pill>
      <h1 className="font-display mt-3 text-4xl md:text-5xl">Экзамен аналитика</h1>
      <p className="mt-3 max-w-2xl text-muted">
        {EXAM.length} ситуационных задач. Порог 70%. Можно пересдавать — лучший результат сохранится.
      </p>

      {step === "intro" && (
        <div className="glass mt-8 max-w-xl rounded-3xl p-8">
          <p className="leading-7 text-paper/90">
            Это не тест на термины. Комната: сломанное списание, дыра в trial, чужое «давайте Kafka». Ход аналитика, не слайд.
          </p>
          <div className="mt-4 text-sm text-muted">
            Лучший результат: {best ?? "—"}% · попыток: {attempts}
          </div>
          <button
            type="button"
            onClick={() => {
              setPicked({});
              setI(0);
              setStep("run");
            }}
            className="mt-6 rounded-full bg-gold px-6 py-2 text-sm font-medium text-ink"
          >
            Начать симуляцию
          </button>
        </div>
      )}

      {step === "run" && q && (
        <motion.div key={q.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="mt-8">
          <div className="mb-3 text-xs text-muted">
            Вопрос {i + 1} / {EXAM.length} · вес {q.weight}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/8">
            <div className="h-full bg-violet" style={{ width: `${((i + 1) / EXAM.length) * 100}%` }} />
          </div>
          <div className="glass mt-5 rounded-3xl p-6 md:p-8">
            <p className="text-sm leading-7 text-muted">{q.scene}</p>
            <h2 className="mt-4 text-xl font-medium">{q.q}</h2>
            <div className="mt-5 grid gap-2">
              {q.options.map((opt, oi) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPicked((p) => ({ ...p, [q.id]: oi }))}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left text-sm",
                    picked[q.id] === oi ? "border-violet/40 bg-violet/15" : "border-white/8 hover:border-white/16",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => setI((x) => x - 1)}
                className="text-sm text-muted disabled:opacity-30"
              >
                Назад
              </button>
              {i < EXAM.length - 1 ? (
                <button
                  type="button"
                  disabled={picked[q.id] === undefined}
                  onClick={() => setI((x) => x + 1)}
                  className="rounded-full bg-gold px-5 py-2 text-sm text-ink disabled:opacity-40"
                >
                  Дальше
                </button>
              ) : (
                <button
                  type="button"
                  disabled={picked[q.id] === undefined}
                  onClick={finish}
                  className="rounded-full bg-mint px-5 py-2 text-sm text-ink disabled:opacity-40"
                >
                  Завершить
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {step === "done" && result != null && (
        <div className="mt-8 space-y-4">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="text-sm text-muted">Результат</div>
            <div className="font-display mt-2 text-6xl text-gold">{result}%</div>
            <p className="mt-3 text-muted">
              {result >= 90 ? "Мастерская работа." : result >= 70 ? "Симуляция сдана." : "Ещё рано. Разберите ошибки ниже."}
            </p>
            <button
              type="button"
              onClick={() => setStep("intro")}
              className="mt-6 rounded-full border border-white/15 px-5 py-2 text-sm"
            >
              К началу
            </button>
          </div>
          {EXAM.map((item) => {
            const ok = picked[item.id] === item.answer;
            return (
              <div key={item.id} className="rounded-3xl border border-white/8 p-5">
                <div className={cn("text-xs", ok ? "text-mint" : "text-rose")}>{ok ? "верно" : "ошибка"}</div>
                <p className="mt-2 text-sm">{item.q}</p>
                <p className="mt-2 text-sm text-muted">{item.why}</p>
              </div>
            );
          })}
        </div>
      )}
    </PageMotion>
  );
}
