import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Radio, RotateCcw } from "lucide-react";
import { PageMotion } from "@/components/ui/PageMotion";
import { Pill } from "@/components/ui/Pill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SortView } from "@/components/blocks/SortView";
import { SpotView } from "@/components/blocks/SpotView";
import { MatchView } from "@/components/blocks/MatchView";
import {
  QUESTS,
  getQuest,
  gradeFill,
  gradeWrite,
  mergeChoiceFlags,
  type QuestBeat,
  type QuestCampaign,
  type QuestChoice,
  type QuestMetricDef,
} from "@/content/play/quest";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

function meterTone(def: QuestMetricDef, value: number) {
  const good = def.good === "high" ? value : 100 - value;
  if (good >= 62) return "mint" as const;
  if (good >= 42) return "gold" as const;
  return "rose" as const;
}

function MetricHud({ campaign }: { campaign: QuestCampaign }) {
  const metrics = useProgress((s) => s.quest?.metrics) ?? {};
  const log = useProgress((s) => s.quest?.log) ?? [];
  const last = log[log.length - 1];

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Живой контур · {campaign.product}</div>
        <Radio size={14} className="text-mint" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {campaign.metrics.map((m) => {
          const now = metrics[m.id] ?? 0;
          const before = last?.before[m.id];
          const delta = last && before != null ? now - before : 0;
          return (
            <div key={m.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted">{m.label}</span>
                <span className={cn("tabular-nums", meterTone(m, now) === "rose" ? "text-rose" : "text-paper")}>
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
              <ProgressBar value={now} tone={meterTone(m, now)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuestPage() {
  const { questId } = useParams();
  if (questId) return <QuestPlay questId={questId} />;
  return <QuestList />;
}

function QuestList() {
  const quest = useProgress((s) => s.quest);
  const done = quest?.done ?? {};
  const inPlay = quest?.campaignId && quest.beatId && !quest.ending;

  return (
    <PageMotion>
      <Pill tone="rose">Квесты · живые продукты</Pill>
      <h1 className="font-display mt-3 text-4xl md:text-5xl">Смены на контурах</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Не один Wallet и не только кнопки. Четыре мок-продукта. На сменах нужно писать AC, NFR, SMS, поля 409 — текст
        уходит в контур и двигает исход.
      </p>

      {inPlay && (
        <Link
          to={`/quest/${quest.campaignId}`}
          className="glass mt-6 block rounded-3xl p-5 transition hover:border-gold/30"
        >
          <div className="text-[11px] uppercase tracking-[0.16em] text-gold">Смена не закрыта</div>
          <div className="font-display mt-1 text-2xl">{getQuest(quest.campaignId)?.title}</div>
          <p className="mt-1 text-sm text-muted">Продолжить с того хода, где остановились.</p>
        </Link>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {QUESTS.map((c) => {
          const closed = Boolean(done[c.id]);
          const ending = closed ? c.endings[done[c.id]] : undefined;
          return (
            <Link
              key={c.id}
              to={`/quest/${c.id}`}
              className={cn("glass rounded-3xl p-6 transition hover:border-gold/30", closed && "border-mint/25")}
            >
              <div className="flex items-start justify-between gap-3">
                <Pill tone={c.id === "wallet" ? "rose" : "gold"}>{c.product}</Pill>
                {closed && <span className="text-xs text-mint">исход был</span>}
              </div>
              <h2 className="font-display mt-3 text-2xl">{c.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{c.teaser}</p>
              {ending && <p className="mt-2 text-xs text-gold">Последний исход: {ending.title}</p>}
              <div className="mt-4 text-xs text-gold">
                {c.minutes} мин · писать + решать · {c.systems.length} систем
              </div>
            </Link>
          );
        })}
      </div>
    </PageMotion>
  );
}

function QuestPlay({ questId }: { questId: string }) {
  const navigate = useNavigate();
  const campaign = getQuest(questId);
  const quest = useProgress((s) => s.quest);
  const startQuest = useProgress((s) => s.startQuest);
  const resetQuest = useProgress((s) => s.resetQuest);
  const leaveQuest = useProgress((s) => s.leaveQuest);
  const resolveQuest = useProgress((s) => s.resolveQuest);
  const [drillOk, setDrillOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (campaign) startQuest(campaign.id);
  }, [campaign, startQuest]);

  useEffect(() => {
    setDrillOk(null);
  }, [quest?.beatId]);

  if (!campaign) {
    return (
      <PageMotion>
        <p className="text-muted">Квест не найден.</p>
        <Link to="/quest" className="mt-4 inline-block text-sm text-gold">
          К списку
        </Link>
      </PageMotion>
    );
  }

  const active = quest?.campaignId === campaign.id;
  const beat = active && quest?.beatId ? campaign.beats[quest.beatId] : undefined;
  const ending = active && quest?.ending ? campaign.endings[quest.ending] : undefined;
  const lastWhy = quest?.log[quest.log.length - 1]?.why;
  const echo =
    beat?.echoFrom && quest?.writings?.[beat.echoFrom]
      ? quest.writings[beat.echoFrom]
      : undefined;

  const workReady = beat && (beat.kind === "spot" || beat.kind === "sort" || beat.kind === "match") && drillOk !== null;

  function commitWork() {
    if (!beat || (beat.kind !== "spot" && beat.kind !== "sort" && beat.kind !== "match") || drillOk === null) return;
    resolveQuest(drillOk ? beat.pass : beat.fail);
  }

  function commitChoice(choice: QuestChoice, writing?: string) {
    resolveQuest(choice, writing);
  }

  if (ending) {
    return (
      <PageMotion>
        <Link to="/quest" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
          <ArrowLeft size={14} /> Все квесты
        </Link>
        <Pill tone={ending.tone}>Исход · {campaign.product}</Pill>
        <h1 className="font-display mt-3 text-4xl md:text-5xl">{ending.title}</h1>
        <p className="mt-3 max-w-2xl text-muted">{ending.summary}</p>
        <div className="mt-6">
          <MetricHud campaign={campaign} />
        </div>
        <ul className="mt-6 max-w-2xl space-y-2 text-sm leading-6 text-muted">
          {ending.debrief.map((line) => (
            <li key={line}>— {line}</li>
          ))}
        </ul>
        {lastWhy && <p className="mt-4 text-sm text-gold">Последний ход: {lastWhy}</p>}
        {Object.keys(quest?.writings ?? {}).length > 0 && (
          <div className="glass mt-6 max-w-2xl rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-gold">Что вы оставили в продукте</div>
            {Object.entries(quest?.writings ?? {}).map(([id, text]) => (
              <pre key={id} className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">
                {text}
              </pre>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted">+{ending.xp} XP. Другой финал — другой текст и другие решения.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => resetQuest()}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink"
          >
            <RotateCcw size={14} /> Ещё раз этот контур
          </button>
          <button
            type="button"
            onClick={() => {
              leaveQuest();
              navigate("/quest");
            }}
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-muted"
          >
            К списку квестов
          </button>
        </div>
      </PageMotion>
    );
  }

  if (!beat) {
    return (
      <PageMotion>
        <p className="text-muted">Открываем смену…</p>
      </PageMotion>
    );
  }

  return (
    <PageMotion>
      <Link to="/quest" className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold">
        <ArrowLeft size={14} /> Все квесты
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Pill tone="gold">{beat.day}</Pill>
          <h1 className="font-display mt-3 text-3xl md:text-4xl">{beat.title}</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{beat.from}</p>
        </div>
        <div className="text-xs text-muted">
          {campaign.product} · ход {(quest?.log.length ?? 0) + 1}
        </div>
      </div>

      <div className="mt-6">
        <MetricHud campaign={campaign} />
      </div>

      <section className="glass mt-6 rounded-3xl p-6 md:p-8">
        <div className="text-[11px] uppercase tracking-[0.18em] text-rose">Инцидент</div>
        <p className="mt-2 text-sm leading-7 text-paper md:text-base">{beat.incident}</p>
        <p className="mt-3 text-xs text-gold">{beat.hint}</p>
        {echo && (
          <div className="mt-4 border-t border-white/8 pt-4">
            <div className="text-[11px] uppercase tracking-widest text-muted">Контур помнит ваш текст</div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gold-2">{echo}</p>
          </div>
        )}
        {lastWhy && !echo && (
          <p className="mt-4 border-t border-white/8 pt-4 text-xs leading-5 text-muted">После прошлого хода: {lastWhy}</p>
        )}
      </section>

      {beat.kind === "choice" && (
        <div className="mt-6 grid gap-3">
          {beat.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => commitChoice(opt)}
              className="glass rounded-3xl p-5 text-left transition hover:border-gold/35"
            >
              <div className="text-sm leading-6 text-paper">{opt.text}</div>
            </button>
          ))}
        </div>
      )}

      {beat.kind === "write" && <WritePanel key={beat.id} beat={beat} product={campaign.product} onCommit={commitChoice} />}
      {beat.kind === "fill" && <FillPanel key={beat.id} beat={beat} product={campaign.product} onCommit={commitChoice} />}

      {beat.kind === "spot" && (
        <div className="mt-6">
          <SpotView key={beat.id} block={beat.block} silent onResolved={setDrillOk} onReset={() => setDrillOk(null)} />
          <CommitBar ready={Boolean(workReady)} ok={drillOk} product={campaign.product} onCommit={commitWork} />
        </div>
      )}
      {beat.kind === "sort" && (
        <div className="mt-6">
          <SortView key={beat.id} block={beat.block} silent onResolved={setDrillOk} onReset={() => setDrillOk(null)} />
          <CommitBar ready={Boolean(workReady)} ok={drillOk} product={campaign.product} onCommit={commitWork} />
        </div>
      )}
      {beat.kind === "match" && (
        <div className="mt-6">
          <MatchView key={beat.id} block={beat.block} silent onResolved={setDrillOk} onReset={() => setDrillOk(null)} />
          <CommitBar ready={Boolean(workReady)} ok={drillOk} product={campaign.product} onCommit={commitWork} />
        </div>
      )}
    </PageMotion>
  );
}

function WritePanel({
  beat,
  product,
  onCommit,
}: {
  beat: Extract<QuestBeat, { kind: "write" }>;
  product: string;
  onCommit: (choice: QuestChoice, writing: string) => void;
}) {
  const [text, setText] = useState("");
  const grade = gradeWrite(text, beat.checks, beat.minChars, beat.passNeed);

  return (
    <section className="glass mt-6 rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-mint">Напишите в продукт</div>
      <p className="mt-2 text-sm leading-6">{beat.prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={beat.placeholder}
        rows={8}
        className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-ink-2/70 p-4 text-sm leading-6 outline-none focus:border-gold/40"
      />
      <div className="mt-2 text-xs text-muted">
        {text.trim().length} / {beat.minChars} · нужно {beat.passNeed} опорных куска из рубрики
      </div>
      <ul className="mt-4 space-y-1">
        {beat.checks.map((c) => {
          const on = c.forbid
            ? grade.forbiddenHits.some((h) => h.id === c.id)
            : grade.hits.some((h) => h.id === c.id);
          return (
            <li key={c.id} className={cn("text-xs", c.forbid ? (on ? "text-rose" : "text-muted") : on ? "text-mint" : "text-muted")}>
              {c.forbid ? (on ? "× нельзя" : "○ нельзя") : on ? "✓" : "○"} {c.why}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={text.trim().length < beat.minChars}
        onClick={() => onCommit(mergeChoiceFlags(grade.ok ? beat.pass : beat.fail, grade.flagsAdd), text)}
        className="mt-5 rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
      >
        Зафиксировать в {product}
      </button>
      <p className="mt-2 text-xs text-muted">
        Можно отправить сырой текст — контур примет его как есть. Рубрика зелёная = швы закроются сильнее.
      </p>
    </section>
  );
}

function FillPanel({
  beat,
  product,
  onCommit,
}: {
  beat: Extract<QuestBeat, { kind: "fill" }>;
  product: string;
  onCommit: (choice: QuestChoice, writing: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const grade = gradeFill(values, beat.slots, beat.passNeed);
  const filled = beat.slots.every((s) => (values[s.id] ?? "").trim());

  return (
    <section className="glass mt-6 rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-mint">Допишите контракт</div>
      <p className="mt-2 text-sm leading-6">{beat.prompt}</p>
      <div className="mt-4 grid gap-4">
        {beat.slots.map((s) => (
          <label key={s.id} className="block">
            <span className="text-xs text-muted">{s.label}</span>
            <input
              value={values[s.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [s.id]: e.target.value }))}
              placeholder={s.hint ?? ""}
              className="mt-1 w-full border-b border-white/10 bg-transparent py-2 text-sm outline-none focus:border-gold/40"
            />
            <span className={cn("text-[11px]", grade.hits.some((h) => h.id === s.id) ? "text-mint" : "text-muted")}>
              {grade.hits.some((h) => h.id === s.id) ? "похоже на контракт" : "пока не бьётся"}
            </span>
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={!filled}
        onClick={() => {
          const blob = beat.slots.map((s) => `${s.label}: ${values[s.id] ?? ""}`).join("\n");
          onCommit(grade.ok ? beat.pass : beat.fail, blob);
        }}
        className="mt-5 rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
      >
        Зафиксировать в {product}
      </button>
    </section>
  );
}

function CommitBar({
  ready,
  ok,
  product,
  onCommit,
}: {
  ready: boolean;
  ok: boolean | null;
  product: string;
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
        Зафиксировать в {product}
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
