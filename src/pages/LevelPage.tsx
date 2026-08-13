import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Lock, Sparkles } from "lucide-react";
import { getLevel, getModule } from "@/content/curriculum";
import { PageMotion } from "@/components/ui/PageMotion";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { isModuleUnlocked, levelProgress, useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

export function LevelPage() {
  const { levelId } = useParams();
  const found = getLevel(levelId ?? "");
  const modsState = useProgress((s) => s.modules);
  if (!found) return <PageMotion>Уровень не найден.</PageMotion>;
  const { grade, level } = found;
  const p = levelProgress(level.moduleIds);

  return (
    <PageMotion>
      <Link to={`/grade/${grade.id}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
        <ArrowLeft size={14} /> {grade.title}
      </Link>
      <div className="mt-6">
        <Pill>
          {grade.title} · уровень {level.rank}
        </Pill>
        <h1 className="font-display mt-3 text-4xl md:text-5xl">{level.title}</h1>
        <p className="mt-3 max-w-2xl text-muted">{level.subtitle}</p>
        <div className="mt-5 max-w-md">
          <div className="mb-2 flex justify-between text-xs text-muted">
            <span>{level.hours}</span>
            <span>{p}%</span>
          </div>
          <ProgressBar value={p} />
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {level.moduleIds.map((id, i) => {
          const m = getModule(id);
          if (!m) return null;
          const st = modsState[id];
          const open = isModuleUnlocked(id);
          return (
            <Link
              key={id}
              to={open ? `/module/${id}` : "#"}
              className={cn(
                "glass flex items-center gap-4 rounded-2xl p-4 transition",
                open ? "hover:border-gold/35" : "pointer-events-none opacity-50",
              )}
            >
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-sm",
                  st?.completed ? "border-mint/40 bg-mint/10 text-mint" : "border-white/10 text-gold",
                )}
              >
                {open ? i + 1 : <Lock size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{m.title}</h3>
                  <Pill tone={m.skill === "soft" ? "rose" : "muted"}>{m.skill === "soft" ? "soft" : "hard"}</Pill>
                  {st?.completed && <Pill tone="mint">закрыт</Pill>}
                </div>
                <p className="mt-1 truncate text-sm text-muted">{m.teaser}</p>
              </div>
              <div className="hidden items-center gap-3 text-xs text-muted sm:flex">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} /> {m.minutes} мин
                </span>
                <span className="inline-flex items-center gap-1 text-gold">
                  <Sparkles size={12} /> {m.xp} XP
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </PageMotion>
  );
}
