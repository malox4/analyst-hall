import { useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PageMotion";
import { INTERVIEW } from "@/content/interview";
import { useProgress } from "@/stores/progressStore";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";

export function InterviewPage() {
  const [topic, setTopic] = useState("Все");
  const [open, setOpen] = useState<string | null>(INTERVIEW[0]?.id ?? null);
  const seen = useProgress((s) => s.interviewSeen);
  const mark = useProgress((s) => s.markInterview);
  const topics = useMemo(() => ["Все", ...Array.from(new Set(INTERVIEW.map((i) => i.topic)))], []);
  const list = topic === "Все" ? INTERVIEW : INTERVIEW.filter((i) => i.topic === topic);
  const active = INTERVIEW.find((i) => i.id === open) ?? list[0];

  return (
    <PageMotion>
      <Pill>Подготовка к собеседованию</Pill>
      <h1 className="font-display mt-3 text-4xl md:text-5xl">Голос, а не шпаргалка</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Короткий ответ — чтобы не молчать. Сильный — чтобы звучать как человек, который делал работу. Ловушки — чтобы не
        провалиться в клише.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              topic === t ? "border-gold/40 bg-gold/15 text-gold-2" : "border-white/10 text-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="glass max-h-[70vh] space-y-1 overflow-auto rounded-3xl p-3 scroll-thin">
          {list.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => {
                setOpen(i.id);
                mark(i.id);
              }}
              className={cn(
                "w-full rounded-2xl px-3 py-3 text-left text-sm",
                active?.id === i.id ? "bg-white/8 text-paper" : "text-muted hover:bg-white/4",
              )}
            >
              <div className="text-[10px] uppercase tracking-widest text-gold">{i.topic}</div>
              <div className="mt-1">{i.question}</div>
              {seen.includes(i.id) && <div className="mt-1 text-[10px] text-mint">разобран</div>}
            </button>
          ))}
        </div>
        {active && (
          <div className="space-y-4">
            <div className="glass rounded-3xl p-6 md:p-8">
              <Pill tone="gold">{active.topic}</Pill>
              <h2 className="font-display mt-3 text-3xl">{active.question}</h2>
              <div className="mt-6 text-[11px] uppercase tracking-widest text-muted">Коротко на собесе</div>
              <p className="mt-2 text-[15px] leading-7">{active.short}</p>
              <div className="mt-6 text-[11px] uppercase tracking-widest text-gold">Сильный ответ</div>
              <p className="mt-2 text-[15px] leading-7 text-paper/90">{active.strong}</p>
            </div>
            <div className="rounded-3xl border border-rose/20 bg-rose/8 p-6">
              <div className="text-[11px] uppercase tracking-widest text-rose">Ловушки</div>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {active.traps.map((t) => (
                  <li key={t}>— {t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </PageMotion>
  );
}
