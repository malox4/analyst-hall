import type { MatchBlock, SortBlock, SpotBlock } from "@/types/content";

export type QuestDelta = Record<string, number | string[] | undefined> & {
  flagsAdd?: string[];
  flagsRemove?: string[];
};

export type QuestNext = string | { ifFlag: string; then: string; else: string };

export type QuestChoice = {
  id: string;
  text: string;
  why: string;
  delta: QuestDelta;
  next: QuestNext;
};

export type QuestWriteCheck = {
  id: string;
  any: string[];
  why: string;
  flagsAdd?: string[];
  forbid?: boolean;
};

export type QuestFillSlot = {
  id: string;
  label: string;
  accept: string[];
  hint?: string;
  explain?: string;
  example?: string;
};

export type QuestBeatBase = {
  id: string;
  day: string;
  title: string;
  from: string;
  incident: string;
  hint: string;
  echoFrom?: string;
  lesson?: string;
  handbook?: string[];
};

export type QuestBeat = QuestBeatBase &
  (
    | { kind: "choice"; options: QuestChoice[] }
    | { kind: "spot"; block: SpotBlock; pass: QuestChoice; fail: QuestChoice }
    | { kind: "sort"; block: SortBlock; pass: QuestChoice; fail: QuestChoice }
    | { kind: "match"; block: MatchBlock; pass: QuestChoice; fail: QuestChoice }
    | {
        kind: "write";
        prompt: string;
        placeholder: string;
        minChars: number;
        passNeed: number;
        checks: QuestWriteCheck[];
        pass: QuestChoice;
        fail: QuestChoice;
      }
    | {
        kind: "fill";
        prompt: string;
        worked?: string;
        slots: QuestFillSlot[];
        passNeed: number;
        pass: QuestChoice;
        fail: QuestChoice;
      }
  );

export type QuestEnding = {
  id: string;
  title: string;
  tone: "mint" | "gold" | "violet" | "rose";
  xp: number;
  summary: string;
  debrief: string[];
};

export type QuestMetricDef = { id: string; label: string; good: "high" | "low" };

export type QuestCampaign = {
  id: string;
  title: string;
  product: string;
  teaser: string;
  minutes: number;
  systems: { id: string; name: string }[];
  metrics: QuestMetricDef[];
  emptyMetrics: () => Record<string, number>;
  startBeat: string;
  beats: Record<string, QuestBeat>;
  endings: Record<string, QuestEnding>;
  pickEnding: (metrics: Record<string, number>, flags: string[]) => string;
};

export const o = (id: string, text: string, why: string, delta: QuestDelta, next: QuestNext): QuestChoice => ({
  id,
  text,
  why,
  delta,
  next,
});

export function resolveNext(next: QuestNext, flags: string[]): string {
  if (typeof next === "string") return next;
  return flags.includes(next.ifFlag) ? next.then : next.else;
}

export function clampMetric(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyDelta(metrics: Record<string, number>, flags: string[], delta: QuestDelta) {
  const nextM = { ...metrics };
  for (const [k, v] of Object.entries(delta)) {
    if (k === "flagsAdd" || k === "flagsRemove") continue;
    if (typeof v === "number" && k in nextM) nextM[k] = clampMetric(nextM[k] + v);
  }
  let nextF = [...flags];
  for (const f of delta.flagsAdd ?? []) if (!nextF.includes(f)) nextF.push(f);
  if (delta.flagsRemove?.length) nextF = nextF.filter((f) => !delta.flagsRemove!.includes(f));
  return { metrics: nextM, flags: nextF };
}

export function normalizeWrite(s: string) {
  return s.toLowerCase().replace(/ё/g, "е");
}

export function matchAny(hay: string, needles: string[]) {
  const h = normalizeWrite(hay);
  return needles.some((n) => h.includes(normalizeWrite(n)));
}

export function gradeWrite(text: string, checks: QuestWriteCheck[], minChars: number, passNeed: number) {
  const forbiddenHits = checks.filter((c) => c.forbid && matchAny(text, c.any));
  const required = checks.filter((c) => !c.forbid);
  const hits = required.filter((c) => matchAny(text, c.any));
  const longEnough = text.trim().length >= minChars;
  return {
    ok: longEnough && forbiddenHits.length === 0 && hits.length >= passNeed,
    hits,
    missed: required.filter((c) => !hits.some((h) => h.id === c.id)),
    forbiddenHits,
    flagsAdd: hits.flatMap((h) => h.flagsAdd ?? []),
  };
}

export function gradeFill(values: Record<string, string>, slots: QuestFillSlot[], passNeed: number) {
  const hits = slots.filter((s) => matchAny(values[s.id] ?? "", s.accept));
  return {
    ok: hits.length >= passNeed,
    hits,
    missed: slots.filter((s) => !hits.some((h) => h.id === s.id)),
  };
}

export function mergeChoiceFlags(choice: QuestChoice, extraFlags: string[]): QuestChoice {
  if (!extraFlags.length) return choice;
  const flagsAdd = [...(choice.delta.flagsAdd ?? [])];
  for (const f of extraFlags) if (!flagsAdd.includes(f)) flagsAdd.push(f);
  return { ...choice, delta: { ...choice.delta, flagsAdd } };
}
