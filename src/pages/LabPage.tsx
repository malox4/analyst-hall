import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Swords } from "lucide-react";
import { LABS } from "@/content/play/labs";
import { WORLD } from "@/content/play/world";
import { PageMotion } from "@/components/ui/PageMotion";
import { Pill } from "@/components/ui/Pill";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";
import type { GradeId, ModuleContent } from "@/types/content";

const tones: Record<GradeId, "mint" | "gold" | "violet" | "rose"> = {
  intern: "mint",
  junior: "gold",
  middle: "violet",
  senior: "rose",
};

export function LabListPage() {
  const labsDone = useProgress((s) => s.labs) ?? {};
  const done = Object.keys(labsDone).length;
  return (
    <PageMotion>
      <Pill tone="rose">Зал практики</Pill>
      <h1 className="font-display mt-3 text-4xl md:text-5xl">Играть как на смене</h1>
      <p className="mt-3 max-w-2xl text-muted">
        {WORLD.line} Гости: ShopLine, MedQueue, CityPark, Orient, HR Pulse. BA-ход и SA-ход в одной смене. Закрыто {done}/{LABS.length}.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {WORLD.systems.map((s) => (
          <span key={s.id} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted">
            {s.name}
          </span>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {LABS.map((lab) => {
          const closed = Boolean(labsDone[lab.id]);
          return (
            <Link
              key={lab.id}
              to={`/lab/${lab.id}`}
              className={cn("glass rounded-3xl p-6 transition hover:border-gold/30", closed && "border-mint/25")}
            >
              <div className="flex items-start justify-between gap-3">
                <Pill tone={tones[lab.gradeId]}>{lab.gradeId}</Pill>
                {closed && <CheckCircle2 className="text-mint" size={18} />}
              </div>
              <h2 className="font-display mt-3 text-2xl">{lab.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{lab.teaser}</p>
              <div className="mt-4 text-xs text-gold">
                {lab.minutes} мин · {lab.xp} XP · только игры
              </div>
            </Link>
          );
        })}
      </div>
    </PageMotion>
  );
}

export function LabMissionPage() {
  const { labId } = useParams();
  const lab = LABS.find((l) => l.id === labId);
  const complete = useProgress((s) => s.completeLab);
  const drills = useProgress((s) => (labId ? s.modules[labId]?.drills : undefined)) ?? {};
  const done = useProgress((s) => (labId ? Boolean(s.labs?.[labId]) : false));
  if (!lab) return <PageMotion>Миссия не найдена.</PageMotion>;

  const drillBlocks = lab.blocks.filter((b) =>
    ["sort", "match", "scene", "order", "spot", "case"].includes(b.kind),
  );
  const drillsDone = drillBlocks.filter((b) => drills[b.title]).length;
  const canClose = drillsDone >= Math.ceil(drillBlocks.length * 0.7);

  const fakeModule: ModuleContent = {
    id: lab.id,
    levelId: "lab",
    gradeId: lab.gradeId,
    order: 0,
    title: lab.title,
    teaser: lab.teaser,
    minutes: lab.minutes,
    skill: "hard",
    xp: lab.xp,
    tags: ["lab"],
    goals: [],
    blocks: lab.blocks,
  };

  return (
    <PageMotion>
      <Link to="/lab" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
        <ArrowLeft size={14} /> К залу
      </Link>
      <div className="mt-6 flex flex-wrap gap-2">
        <Pill tone={tones[lab.gradeId]}>{lab.gradeId}</Pill>
        <Pill tone="gold">{lab.minutes} мин · {lab.xp} XP</Pill>
        <Pill tone="mint">
          Игры {drillsDone}/{drillBlocks.length}
        </Pill>
      </div>
      <h1 className="font-display mt-3 text-4xl">{lab.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{lab.setting}</p>
      <div className="mt-8 space-y-6">
        {lab.blocks.map((block, i) => (
          <BlockRenderer key={`${block.kind}-${i}`} block={block} module={fakeModule} />
        ))}
      </div>
      <div className="glass mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div>
          <div className="font-display text-xl">Сдать смену</div>
          <p className="mt-1 text-sm text-muted">
            Закройте примерно 70% игр (сейчас {drillsDone}/{drillBlocks.length}) — и заберите XP.
          </p>
        </div>
        <button
          type="button"
          disabled={done || !canClose}
          onClick={() => complete(lab.id, lab.xp)}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
        >
          {done ? (
            <>
              <CheckCircle2 size={14} /> Смена закрыта
            </>
          ) : (
            <>
              <Swords size={14} /> Закрыть миссию
            </>
          )}
        </button>
      </div>
    </PageMotion>
  );
}
