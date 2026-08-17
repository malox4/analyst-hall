import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TrackMode } from "@/types/content";
import { ACHIEVEMENTS } from "@/content/achievements";
import { allModules, CURRICULUM } from "@/content/curriculum";

export type ModuleProgress = {
  started: boolean;
  theoryDone: boolean;
  quizScore: number | null;
  quizPassed: boolean;
  practiceDone: boolean;
  checklist: Record<string, boolean>;
  drills: Record<string, boolean>;
  completed: boolean;
  completedAt?: number;
  attempts: number;
};

export type DailyQuests = {
  day: string;
  quiz: boolean;
  practice: boolean;
  drill: boolean;
  lab: boolean;
};

export type ProgressState = {
  learnerName: string;
  track: TrackMode;
  xp: number;
  combo: number;
  streak: number;
  lastActiveDay: string;
  labs: Record<string, boolean>;
  daily: DailyQuests;
  modules: Record<string, ModuleProgress>;
  badges: string[];
  interviewSeen: string[];
  examBest: number | null;
  examAttempts: number;
  lastXpGain: { amount: number; at: number } | null;
  setName: (name: string) => void;
  setTrack: (track: TrackMode) => void;
  startModule: (id: string) => void;
  markTheory: (id: string) => void;
  saveQuiz: (id: string, score: number, passed: boolean) => void;
  markPractice: (id: string) => void;
  toggleCheck: (id: string, item: string) => void;
  completeDrill: (moduleId: string, drillId: string, xp: number) => void;
  completeLab: (labId: string, xp: number) => void;
  completeModule: (id: string) => void;
  resetModule: (id: string) => void;
  markInterview: (id: string) => void;
  saveExam: (score: number) => void;
  unlockBadge: (id: string) => void;
  evaluateBadges: () => void;
  touchStreak: () => void;
};

const emptyModule = (): ModuleProgress => ({
  started: false,
  theoryDone: false,
  quizScore: null,
  quizPassed: false,
  practiceDone: false,
  checklist: {},
  drills: {},
  completed: false,
  attempts: 0,
});

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function emptyDaily(day = todayKey()): DailyQuests {
  return { day, quiz: false, practice: false, drill: false, lab: false };
}

function bumpCombo(combo: number, ok: boolean) {
  return ok ? combo + 1 : 0;
}

function comboBonus(combo: number) {
  if (combo >= 5) return 15;
  if (combo >= 3) return 8;
  return 0;
}

function ensure(modules: Record<string, ModuleProgress>, id: string) {
  if (!modules[id]) modules[id] = emptyModule();
  if (!modules[id].drills) modules[id].drills = {};
  if (!modules[id].checklist) modules[id].checklist = {};
  return modules[id];
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      learnerName: "",
      track: "linear",
      xp: 0,
      combo: 0,
      streak: 0,
      lastActiveDay: "",
      labs: {},
      daily: emptyDaily(""),
      modules: {},
      badges: [],
      interviewSeen: [],
      examBest: null,
      examAttempts: 0,
      lastXpGain: null,
      setName: (learnerName) => set({ learnerName }),
      setTrack: (track) => set({ track }),
      touchStreak: () =>
        set((s) => {
          const day = todayKey();
          if (s.lastActiveDay === day) return s;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const y = yesterday.toISOString().slice(0, 10);
          const streak = s.lastActiveDay === y ? s.streak + 1 : 1;
          const daily = s.daily?.day === day ? s.daily : emptyDaily(day);
          return { lastActiveDay: day, streak, daily };
        }),
      startModule: (id) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, id);
          m.started = true;
          return { modules };
        }),
      markTheory: (id) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, id);
          if (!m.theoryDone) {
            m.theoryDone = true;
            return { modules, xp: s.xp + 15, lastXpGain: { amount: 15, at: Date.now() } };
          }
          return { modules };
        }),
      saveQuiz: (id, score, passed) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, id);
          m.quizScore = Math.max(m.quizScore ?? 0, score);
          m.quizPassed = m.quizPassed || passed;
          m.attempts += 1;
          const combo = bumpCombo(s.combo, passed);
          const bonus = passed ? 40 + Math.round(score / 5) + comboBonus(combo) : 10;
          const day = todayKey();
          const daily = { ...(s.daily?.day === day ? s.daily : emptyDaily(day)), quiz: true };
          return {
            modules,
            xp: s.xp + bonus,
            combo,
            daily,
            lastXpGain: { amount: bonus, at: Date.now() },
          };
        }),
      markPractice: (id) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, id);
          if (!m.practiceDone) {
            m.practiceDone = true;
            const day = todayKey();
            const daily = { ...(s.daily?.day === day ? s.daily : emptyDaily(day)), practice: true };
            return {
              modules,
              xp: s.xp + 35,
              daily,
              lastXpGain: { amount: 35, at: Date.now() },
            };
          }
          return { modules };
        }),
      toggleCheck: (id, item) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, id);
          m.checklist = { ...m.checklist, [item]: !m.checklist[item] };
          return { modules };
        }),
      completeDrill: (moduleId, drillId, xp) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, moduleId);
          if (m.drills[drillId]) return s;
          m.drills = { ...m.drills, [drillId]: true };
          const combo = bumpCombo(s.combo, true);
          const gain = xp + comboBonus(combo);
          const day = todayKey();
          const daily = { ...(s.daily?.day === day ? s.daily : emptyDaily(day)), drill: true };
          return {
            modules,
            xp: s.xp + gain,
            combo,
            daily,
            lastXpGain: { amount: gain, at: Date.now() },
          };
        }),
      completeLab: (labId, xp) =>
        set((s) => {
          const labs = s.labs ?? {};
          if (labs[labId]) return s;
          const day = todayKey();
          const daily = { ...(s.daily?.day === day ? s.daily : emptyDaily(day)), lab: true };
          return {
            labs: { ...labs, [labId]: true },
            xp: s.xp + xp,
            daily,
            lastXpGain: { amount: xp, at: Date.now() },
          };
        }),
      completeModule: (id) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, id);
          if (!m.completed) {
            m.completed = true;
            m.completedAt = Date.now();
            const meta = allModules().find((x) => x.id === id);
            const gain = meta?.xp ?? 80;
            return { modules, xp: s.xp + gain, lastXpGain: { amount: gain, at: Date.now() } };
          }
          return { modules };
        }),
      resetModule: (id) =>
        set((s) => {
          const modules = { ...s.modules };
          modules[id] = { ...emptyModule(), started: true, attempts: (s.modules[id]?.attempts ?? 0) + 1 };
          return { modules };
        }),
      markInterview: (id) =>
        set((s) => ({
          interviewSeen: s.interviewSeen.includes(id) ? s.interviewSeen : [...s.interviewSeen, id],
        })),
      saveExam: (score) =>
        set((s) => ({
          examAttempts: s.examAttempts + 1,
          examBest: Math.max(s.examBest ?? 0, score),
          xp: s.xp + (score >= 70 ? 200 : 40),
          lastXpGain: { amount: score >= 70 ? 200 : 40, at: Date.now() },
        })),
      unlockBadge: (id) =>
        set((s) => (s.badges.includes(id) ? s : { badges: [...s.badges, id], xp: s.xp + 25 })),
      evaluateBadges: () => {
        const s = get();
        const completed = Object.entries(s.modules).filter(([, m]) => m.completed).map(([id]) => id);
        const toUnlock: string[] = [];
        for (const a of ACHIEVEMENTS) {
          if (s.badges.includes(a.id)) continue;
          if (a.id === "first-step" && completed.length >= 1) toUnlock.push(a.id);
          if (a.id === "intern-seal" && CURRICULUM[0].levels.every((l) => l.moduleIds.every((id) => completed.includes(id))))
            toUnlock.push(a.id);
          if (a.id === "junior-seal" && CURRICULUM[1].levels.every((l) => l.moduleIds.every((id) => completed.includes(id))))
            toUnlock.push(a.id);
          if (a.id === "middle-seal" && CURRICULUM[2].levels.every((l) => l.moduleIds.every((id) => completed.includes(id))))
            toUnlock.push(a.id);
          if (a.id === "senior-seal" && CURRICULUM[3].levels.every((l) => l.moduleIds.every((id) => completed.includes(id))))
            toUnlock.push(a.id);
          if (a.id === "quiz-ace" && Object.values(s.modules).some((m) => (m.quizScore ?? 0) === 100)) toUnlock.push(a.id);
          if (a.id === "practice-hand" && Object.values(s.modules).filter((m) => m.practiceDone).length >= 8)
            toUnlock.push(a.id);
          if (a.id === "drill-12" && Object.values(s.modules).reduce((n, m) => n + Object.keys(m.drills ?? {}).length, 0) >= 12)
            toUnlock.push(a.id);
          if (a.id === "lab-first" && Object.keys(s.labs ?? {}).length >= 1) toUnlock.push(a.id);
          if (a.id === "lab-master" && Object.keys(s.labs ?? {}).length >= 8) toUnlock.push(a.id);
          if (a.id === "streak-3" && (s.streak ?? 0) >= 3) toUnlock.push(a.id);
          if (a.id === "streak-7" && (s.streak ?? 0) >= 7) toUnlock.push(a.id);
          if (a.id === "combo-5" && (s.combo ?? 0) >= 5) toUnlock.push(a.id);
          if (a.id === "interview-ready" && s.interviewSeen.length >= 20) toUnlock.push(a.id);
          if (a.id === "exam-pass" && (s.examBest ?? 0) >= 70) toUnlock.push(a.id);
          if (a.id === "exam-master" && (s.examBest ?? 0) >= 90) toUnlock.push(a.id);
          if (a.id === "xp-500" && s.xp >= 500) toUnlock.push(a.id);
          if (a.id === "xp-1500" && s.xp >= 1500) toUnlock.push(a.id);
          if (a.id === "path-complete" && completed.length >= allModules().length) toUnlock.push(a.id);
        }
        toUnlock.forEach((id) => get().unlockBadge(id));
      },
    }),
    {
      name: "malo-academy-progress",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressState>;
        const modules: ProgressState["modules"] = {};
        for (const [id, m] of Object.entries(p.modules ?? current.modules ?? {})) {
          modules[id] = { ...emptyModule(), ...m, drills: m.drills ?? {}, checklist: m.checklist ?? {} };
        }
        return {
          ...current,
          ...p,
          modules,
          labs: p.labs ?? {},
          daily: p.daily ?? emptyDaily(""),
          combo: p.combo ?? 0,
          streak: p.streak ?? 0,
          lastActiveDay: p.lastActiveDay ?? "",
          lastXpGain: null,
        };
      },
    },
  ),
);

export function moduleProgress(id: string) {
  return useProgress.getState().modules[id];
}

export function levelProgress(moduleIds: string[]) {
  const mods = useProgress.getState().modules;
  if (!moduleIds.length) return 0;
  const done = moduleIds.filter((id) => mods[id]?.completed).length;
  return Math.round((done / moduleIds.length) * 100);
}

export function gradeProgress(gradeIndex: number) {
  const ids = CURRICULUM[gradeIndex].levels.flatMap((l) => l.moduleIds);
  return levelProgress(ids);
}

export function overallProgress() {
  const ids = allModules().map((m) => m.id);
  return levelProgress(ids);
}

export function learnerRank(xp: number) {
  if (xp >= 4000) return { title: "Архитектор зала", tone: "rose" as const };
  if (xp >= 2500) return { title: "Senior зала", tone: "rose" as const };
  if (xp >= 1500) return { title: "Middle зала", tone: "violet" as const };
  if (xp >= 700) return { title: "Junior зала", tone: "gold" as const };
  if (xp >= 200) return { title: "Intern зала", tone: "mint" as const };
  return { title: "Новичок", tone: "muted" as const };
}

export function isModuleUnlocked(moduleId: string) {
  const { track, modules } = useProgress.getState();
  if (track === "free") return true;
  const list = allModules();
  const idx = list.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return true;
  return Boolean(modules[list[idx - 1].id]?.completed);
}
