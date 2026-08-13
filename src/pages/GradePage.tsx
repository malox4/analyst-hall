import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getGrade } from "@/content/curriculum";
import { PageMotion } from "@/components/ui/PageMotion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { gradeProgress, levelProgress } from "@/stores/progressStore";
import { CURRICULUM } from "@/content/curriculum";
import { Pill } from "@/components/ui/Pill";

export function GradePage() {
  const { gradeId } = useParams();
  const grade = getGrade(gradeId ?? "");
  if (!grade) return <PageMotion>Грейд не найден.</PageMotion>;
  const idx = CURRICULUM.findIndex((g) => g.id === grade.id);
  const p = gradeProgress(idx);

  return (
    <PageMotion>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
        <ArrowLeft size={14} /> На путь
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone={idx === 0 ? "mint" : idx === 1 ? "gold" : idx === 2 ? "violet" : "rose"}>Грейд {grade.roman}</Pill>
          <h1 className="font-display mt-3 text-5xl" style={{ color: grade.color }}>
            {grade.title}
          </h1>
          <p className="mt-3 max-w-xl text-muted">{grade.tagline}</p>
        </div>
        <div className="w-56">
          <div className="mb-2 flex justify-between text-xs text-muted">
            <span>Прогресс грейда</span>
            <span>{p}%</span>
          </div>
          <ProgressBar value={p} />
        </div>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {grade.levels.map((l) => {
          const lp = levelProgress(l.moduleIds);
          return (
            <Link key={l.id} to={`/level/${l.id}`} className="glass group rounded-3xl p-6 hover:border-gold/30">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Уровень {l.rank}
              </div>
              <h2 className="font-display mt-2 text-2xl">{l.title}</h2>
              <p className="mt-2 text-sm text-muted">{l.subtitle}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-muted">
                <span>
                  {l.moduleIds.length} модулей · {l.hours}
                </span>
                <span className="inline-flex items-center gap-1 text-gold">
                  {lp}% <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
              <ProgressBar value={lp} className="mt-2" />
            </Link>
          );
        })}
      </div>
    </PageMotion>
  );
}
