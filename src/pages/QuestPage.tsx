import { useEffect, useState } from "react";
import { Radio, RotateCcw } from "lucide-react";
import { PageMotion } from "@/components/ui/PageMotion";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SortView } from "@/components/blocks/SortView";
import { SpotView } from "@/components/blocks/SpotView";
import { WORLD } from "@/content/play/world";
import {
  QUEST_BEATS,
  QUEST_ENDINGS,
  QUEST_METRICS,
  type QuestMetricId,
} from "@/content/play/quest";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

function meterTone(id: QuestMetricId, value: number) {
  const spec = QUEST_METRICS.find((m) => m.id === id)!;
  const good = spec.good === "high" ? value : 100 - value;
  if (good >= 62) return "mint" as const;
  if (good >= 42) return "gold" as const;
  return "rose" as const;
}

function MetricHud() {
  const metrics = useProgress((s) => s.quest?.metrics);
  const log = useProgress((s) => s.quest?.log) ?? [];
  const last = log[log.length - 1];
  if (!metrics) return null;

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Живой контур · {WORLD.product}</div>
        <Radio size={14} className="text-mint" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUEST_METRICS.map((m) => {
          const now = metrics[m.id];
          const before = last?.before[m.id];
          const delta = last ? now - (before ?? now) : 0;
          return (
            <div key={m.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted">{m.label}</span>
                <span className={cn("tabular-nums", meterTone(m.id, now) === "rose" ? "text-rose" : "text-paper")}>
                  {before != null && delta !== 0 ? (
                    <>
                      <span className="text-muted">{before}</span>
                      <span className="mx-1 text-gold">→</span>
                      {now}
                    </>
                  ) : (
                    now
                  )}
                </span>
              </div>
              <ProgressBar value={now} tone={meterTone(m.id, now)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuestPage() {
  const quest = useProgress((s) => s.quest);
  const startQuest = useProgress((s) => s.startQuest);
  const resetQuest = useProgress((s) => s.resetQuest);
  const resolveQuest = useProgress((s) => s.resolveQuest);
  const [drillOk, setDrillOk] = useState<boolean | null>(null);

  const beat = quest?.beatId ? QUEST_BEATS[quest.beatId] : undefined;
  const ending = quest?.ending ? QUEST_ENDINGS[quest.ending] : undefined;

  useEffect(() => {
    setDrillOk(null);
  }, [quest?.beatId]);

  const lastWhy = quest?.log[quest.log.length - 1]?.why;

  const workReady = beat && beat.kind !== "choice" && drillOk !== null;

  function commitWork() {
    if (!beat || beat.kind === "choice" || drillOk === null) return;
    resolveQuest(drillOk ? beat.pass : beat.fail);
  }

  if (!quest?.beatId) {
    return (
      <PageMotion>
        <Pill tone="rose">Квест · живой продукт</Pill>
        <h1 className="font-display mt-3 text-4xl md:text-5xl">Смена на Malo Wallet</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Это не квиз в конце. Контур живой: ledger, KYC, 3DS, сверка Orient, нагрузка команды. Каждое решение двигает
          метрики. Исход — из того, что вы реально оставили в продукте.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {WORLD.systems.map((s) => (
            <span key={s.id} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted">
              {s.name}
            </span>
          ))}
        </div>
        <div className="mt-6">
          <MetricHud />
        </div>
        <div className="mt-8 glass max-w-xl rounded-3xl p-6">
          <p className="text-sm leading-6 text-muted">
            Восемь дней, один контур. Sort и spot — настоящая работа: пока не зафиксируете в Wallet, метрики не
            трогаются. Можно переиграть разбор до фиксации.
          </p>
          <button
            type="button"
            onClick={() => startQuest()}
            className="mt-5 rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink"
          >
            Выйти на смену
          </button>
          {(quest?.endings?.length ?? 0) > 0 && (
            <p className="mt-3 text-xs text-gold">Уже видели исходов: {quest.endings.length}/8</p>
          )}
        </div>
      </PageMotion>
    );
  }

  if (ending) {
    return (
      <PageMotion>
        <Pill tone={ending.tone}>Исход контура</Pill>
        <h1 className="font-display mt-3 text-4xl md:text-5xl">{ending.title}</h1>
        <p className="mt-3 max-w-2xl text-muted">{ending.summary}</p>
        <div className="mt-6">
          <MetricHud />
        </div>
        <ul className="mt-6 max-w-2xl space-y-2 text-sm leading-6 text-muted">
          {ending.debrief.map((line) => (
            <li key={line}>— {line}</li>
          ))}
        </ul>
        {lastWhy && <p className="mt-4 text-sm text-gold">Последний ход: {lastWhy}</p>}
        <p className="mt-4 text-xs text-muted">+{ending.xp} XP за этот исход. Другой финал — другие решения.</p>
        <button
          type="button"
          onClick={() => resetQuest()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink"
        >
          <RotateCcw size={14} /> Ещё раз, другой контур
        </button>
      </PageMotion>
    );
  }

  if (!beat) {
    return (
      <PageMotion>
        <p className="text-muted">Сцена не найдена.</p>
        <button type="button" onClick={() => resetQuest()} className="mt-4 text-sm text-gold">
          Сбросить квест
        </button>
      </PageMotion>
    );
  }

  return (
    <PageMotion>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="gold">{beat.day}</Pill>
          <h1 className="font-display mt-3 text-3xl md:text-4xl">{beat.title}</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{beat.from}</p>
        </div>
        <div className="text-xs text-muted">Ход {quest.log.length + 1} · метрики уже от предыдущих решений</div>
      </div>

      <div className="mt-6">
        <MetricHud />
      </div>

      <section className="glass mt-6 rounded-3xl p-6 md:p-8">
        <div className="text-[11px] uppercase tracking-[0.18em] text-rose">Инцидент</div>
        <p className="mt-2 text-sm leading-7 text-paper md:text-base">{beat.incident}</p>
        <p className="mt-3 text-xs text-gold">{beat.hint}</p>
        {lastWhy && (
          <p className="mt-4 border-t border-white/8 pt-4 text-xs leading-5 text-muted">
            После прошлого хода: {lastWhy}
          </p>
        )}
      </section>

      {beat.kind === "choice" && (
        <div className="mt-6 grid gap-3">
          {beat.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => resolveQuest(opt)}
              className="glass rounded-3xl p-5 text-left transition hover:border-gold/35"
            >
              <div className="text-sm leading-6 text-paper">{opt.text}</div>
            </button>
          ))}
        </div>
      )}

      {beat.kind === "spot" && (
        <div className="mt-6">
          <SpotView
            key={beat.id}
            block={beat.block}
            silent
            onResolved={setDrillOk}
            onReset={() => setDrillOk(null)}
          />
          <CommitBar ready={Boolean(workReady)} ok={drillOk} onCommit={commitWork} />
        </div>
      )}

      {beat.kind === "sort" && (
        <div className="mt-6">
          <SortView
            key={beat.id}
            block={beat.block}
            silent
            onResolved={setDrillOk}
            onReset={() => setDrillOk(null)}
          />
          <CommitBar ready={Boolean(workReady)} ok={drillOk} onCommit={commitWork} />
        </div>
      )}
    </PageMotion>
  );
}

function CommitBar({
  ready,
  ok,
  onCommit,
}: {
  ready: boolean;
  ok: boolean | null;
  onCommit: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={!ready}
        onClick={onCommit}
        className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
      >
        Зафиксировать в Malo Wallet
      </button>
      <span className="text-xs text-muted">
        {!ready
          ? "Сначала сдайте разбор. До фиксации контур не меняется."
          : ok
            ? "Разбор чистый — метрики пойдут вверх."
            : "Можно править ещё раз или зафиксировать брак как есть."}
      </span>
    </div>
  );
}
