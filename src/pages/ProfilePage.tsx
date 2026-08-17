import { PageMotion } from "@/components/ui/PageMotion";
import { useProgress, gradeProgress, learnerRank } from "@/stores/progressStore";
import { CURRICULUM, allModules } from "@/content/curriculum";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { loadAllPractice } from "@/lib/idb";
import { useEffect, useState } from "react";

export function ProfilePage() {
  const name = useProgress((s) => s.learnerName);
  const setName = useProgress((s) => s.setName);
  const xp = useProgress((s) => s.xp);
  const track = useProgress((s) => s.track);
  const setTrack = useProgress((s) => s.setTrack);
  const modules = useProgress((s) => s.modules);
  const badges = useProgress((s) => s.badges);
  const examBest = useProgress((s) => s.examBest);
  const streak = useProgress((s) => s.streak) ?? 0;
  const labs = useProgress((s) => s.labs) ?? {};
  const rank = learnerRank(xp);
  const [works, setWorks] = useState(0);

  useEffect(() => {
    loadAllPractice().then((rows) => setWorks(rows.length));
  }, [modules]);

  const done = Object.values(modules).filter((m) => m.completed).length;
  const total = allModules().length;

  return (
    <PageMotion>
      <h1 className="font-display text-4xl md:text-5xl">Профиль путника</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <label className="text-[11px] uppercase tracking-widest text-muted">Имя</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full border-b border-white/10 bg-transparent py-2 text-xl outline-none"
            placeholder="Как подписывать работы"
          />
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setTrack("linear")}
              className={`rounded-full px-4 py-2 text-sm ${track === "linear" ? "bg-gold text-ink" : "border border-white/10"}`}
            >
              Линейный
            </button>
            <button
              type="button"
              onClick={() => setTrack("free")}
              className={`rounded-full px-4 py-2 text-sm ${track === "free" ? "bg-mint text-ink" : "border border-white/10"}`}
            >
              Свободный
            </button>
          </div>
        </div>
        <div className="glass grid grid-cols-2 gap-4 rounded-3xl p-6">
          <Stat label="Ранг" value={rank.title} />
          <Stat label="XP" value={String(xp)} />
          <Stat label="Модули" value={`${done}/${total}`} />
          <Stat label="Печати" value={String(badges.length)} />
          <Stat label="Экзамен" value={examBest != null ? `${examBest}%` : "—"} />
          <Stat label="Практики" value={String(works)} />
          <Stat label="Серия" value={`${streak} дн.`} />
          <Stat label="Миссии зала" value={String(Object.keys(labs).length)} />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {CURRICULUM.map((g, i) => (
          <div key={g.id} className="glass rounded-3xl p-5">
            <div className="mb-2 flex justify-between text-sm">
              <span style={{ color: g.color }}>{g.title}</span>
              <span className="text-muted">{gradeProgress(i)}%</span>
            </div>
            <ProgressBar value={gradeProgress(i)} />
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">
        Прогресс — в LocalStorage. Тексты практики — в IndexedDB. Бэкенда нет: можно выключить интернет.
      </p>
    </PageMotion>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-display mt-1 text-2xl">{value}</div>
    </div>
  );
}
