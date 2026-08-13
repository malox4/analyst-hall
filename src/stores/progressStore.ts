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
  completed: boolean;
  completedAt?: number;
  attempts: number;
};

export type ProgressState = {
  learnerName: string;
  track: TrackMode;
  xp: number;
  modules: Record<string, ModuleProgress>;
  badges: string[];
  interviewSeen: string[];
  examBest: number | null;
  examAttempts: number;
  setName: (name: string) => void;
  setTrack: (track: TrackMode) => void;
  startModule: (id: string) => void;
  markTheory: (id: string) => void;
  saveQuiz: (id: string, score: number, passed: boolean) => void;
  markPractice: (id: string) => void;
  toggleCheck: (id: string, item: string) => void;
  completeModule: (id: string) => void;
  resetModule: (id: string) => void;
  markInterview: (id: string) => void;
  saveExam: (score: number) => void;
  unlockBadge: (id: string) => void;
  evaluateBadges: () => void;
};

const emptyModule = (): ModuleProgress => ({
  started: false,
  theoryDone: false,
  quizScore: null,
  quizPassed: false,
  practiceDone: false,
  checklist: {},
  completed: false,
  attempts: 0,
});

function ensure(modules: Record<string, ModuleProgress>, id: string) {
  if (!modules[id]) modules[id] = emptyModule();
  return modules[id];
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      learnerName: "",
      track: "linear",
      xp: 0,
      modules: {},
      badges: [],
      interviewSeen: [],
      examBest: null,
      examAttempts: 0,
      setName: (learnerName) => set({ learnerName }),
      setTrack: (track) => set({ track }),
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
            return { modules, xp: s.xp + 15 };
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
          const bonus = passed ? 40 + Math.round(score / 5) : 10;
          return { modules, xp: s.xp + bonus };
        }),
      markPractice: (id) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, id);
          if (!m.practiceDone) {
            m.practiceDone = true;
            return { modules, xp: s.xp + 35 };
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
      completeModule: (id) =>
        set((s) => {
          const modules = { ...s.modules };
          const m = ensure(modules, id);
          if (!m.completed) {
            m.completed = true;
            m.completedAt = Date.now();
            const meta = allModules().find((x) => x.id === id);
            return { modules, xp: s.xp + (meta?.xp ?? 80) };
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
    { name: "malo-academy-progress" },
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

export function isModuleUnlocked(moduleId: string) {
  const { track, modules } = useProgress.getState();
  if (track === "free") return true;
  const list = allModules();
  const idx = list.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return true;
  return Boolean(modules[list[idx - 1].id]?.completed);
}
