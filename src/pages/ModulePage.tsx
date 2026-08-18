import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, RotateCcw, Swords, BookOpen } from "lucide-react";
import { getModule, nextModule, prevModule } from "@/content/curriculum";
import { PageMotion } from "@/components/ui/PageMotion";
import { Pill } from "@/components/ui/Pill";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { isPlayBlock, type ContentBlock } from "@/types/content";
import { isModuleUnlocked, useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

const DRILL_KINDS = new Set(["sort", "match", "scene", "order", "spot", "case"]);

function inPlayTab(block: ContentBlock) {
  if (block.kind === "case") {
    return /^(SA|BA\+|BA ·|Guest)/.test(block.title);
  }
  return isPlayBlock(block.kind);
}

export function ModulePage() {
  const { moduleId } = useParams();
  const nav = useNavigate();
  const module = getModule(moduleId ?? "");
  const start = useProgress((s) => s.startModule);
  const markTheory = useProgress((s) => s.markTheory);
  const complete = useProgress((s) => s.completeModule);
  const reset = useProgress((s) => s.resetModule);
  const st = useProgress((s) => (moduleId ? s.modules[moduleId] : undefined));
  const track = useProgress((s) => s.track);
  const [tab, setTab] = useState<"play" | "read">("play");

  useEffect(() => {
    if (module) start(module.id);
    setTab("play");
  }, [module, start]);

  const playBlocks = useMemo(
    () => (module ? module.blocks.filter((b) => inPlayTab(b)) : []),
    [module],
  );
  const readBlocks = useMemo(
    () => (module ? module.blocks.filter((b) => !inPlayTab(b)) : []),
    [module],
  );
  const drillBlocks = useMemo(
    () => playBlocks.filter((b) => DRILL_KINDS.has(b.kind)),
    [playBlocks],
  );
  const drillsDone = drillBlocks.filter((b) => st?.drills?.[b.title]).length;
  const drillsNeed = drillBlocks.length ? Math.ceil(drillBlocks.length * 0.7) : 0;

  const canComplete = useMemo(() => {
    if (!module || !st) return false;
    const hasQuiz = module.blocks.some((b) => b.kind === "quiz");
    const hasPractice = module.blocks.some((b) => b.kind === "practice");
    if (hasQuiz && !st.quizPassed) return false;
    if (hasPractice && !st.practiceDone) return false;
    if (drillsNeed && drillsDone < drillsNeed) return false;
    return true;
  }, [module, st, drillsNeed, drillsDone]);

  if (!module) return <PageMotion>Модуль не найден.</PageMotion>;
  if (track === "linear" && !isModuleUnlocked(module.id)) {
    return (
      <PageMotion>
        <div className="glass mx-auto max-w-lg rounded-3xl p-8 text-center">
          <Lock className="mx-auto text-gold" />
          <h1 className="font-display mt-4 text-3xl">Модуль ещё закрыт</h1>
          <p className="mt-3 text-muted">В линейном пути сначала закройте предыдущий. Или включите свободный режим на главной.</p>
          <Link to="/" className="mt-6 inline-block text-gold">
            На путь
          </Link>
        </div>
      </PageMotion>
    );
  }

  const prev = prevModule(module.id);
  const next = nextModule(module.id);
  const shown = tab === "play" ? playBlocks : readBlocks;

  return (
    <PageMotion>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`/level/${module.levelId}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
          <ArrowLeft size={14} /> К уровню
        </Link>
        <div className="flex gap-2">
          {prev && (
            <Link to={`/module/${prev.id}`} className="text-xs text-muted hover:text-paper">
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link to={`/module/${next.id}`} className="text-xs text-muted hover:text-paper">
              {next.title} →
            </Link>
          )}
        </div>
      </div>

      <header className="mt-6 max-w-3xl">
        <div className="flex flex-wrap gap-2">
          <Pill>{module.gradeId}</Pill>
          <Pill tone={module.skill === "soft" ? "rose" : "muted"}>{module.skill}</Pill>
          <Pill tone="gold">{module.minutes} мин · {module.xp} XP</Pill>
          <Pill tone="mint">
            Игры {drillsDone}/{drillBlocks.length}
          </Pill>
        </div>
        <h1 className="font-display mt-4 text-4xl md:text-5xl">{module.title}</h1>
        <p className="mt-3 text-lg text-muted">{module.teaser}</p>
      </header>

      <div className="sticky top-0 z-20 mt-6 -mx-1 flex gap-2 bg-[#0b0f19]/80 px-1 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setTab("play")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm",
            tab === "play" ? "bg-gold text-ink" : "border border-white/12 text-muted",
          )}
        >
          <Swords size={14} /> Играть
        </button>
        <button
          type="button"
          onClick={() => setTab("read")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm",
            tab === "read" ? "bg-white/10 text-paper" : "border border-white/12 text-muted",
          )}
        >
          <BookOpen size={14} /> Разбор
        </button>
        <span className="self-center text-xs text-muted">
          {tab === "play"
            ? "Сначала контракт и ход. Текст — если застряли."
            : "Теория и схемы. На смене их читают после кейса."}
        </span>
      </div>

      <div className="mt-4 space-y-6">
        {shown.map((block, i) => (
          <BlockRenderer key={`${tab}-${block.kind}-${i}`} block={block} module={module} />
        ))}
      </div>

      <div className="glass mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div>
          <div className="font-display text-xl">Закрепление</div>
          <p className="mt-1 text-sm text-muted">
            Чтобы закрыть: ~70% игр{drillsNeed ? ` (${drillsDone}/${drillsNeed})` : ""}, квиз ≥ 70% и сохранённая практика.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => markTheory(module.id)}
            className="rounded-full border border-white/15 px-4 py-2 text-sm"
          >
            Разбор отмечен
          </button>
          <button
            type="button"
            onClick={() => reset(module.id)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-muted"
          >
            <RotateCcw size={14} /> Перепройти
          </button>
          <button
            type="button"
            disabled={!canComplete || st?.completed}
            onClick={() => {
              complete(module.id);
              if (next) nav(`/module/${next.id}`);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            {st?.completed ? (
              <>
                <CheckCircle2 size={14} /> Закрыт
              </>
            ) : (
              <>
                Закрыть модуль <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </PageMotion>
  );
}
