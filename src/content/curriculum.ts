import type { Grade, ModuleContent } from "@/types/content";
import { MODULES } from "@/content/modules";

export const CURRICULUM: Grade[] = [
  {
    id: "intern",
    title: "Intern",
    roman: "I",
    tagline: "Понять мир и не потеряться в созвонах",
    color: "#7dd3c0",
    glow: "rgba(125, 211, 192, 0.28)",
    levels: [
      {
        id: "intern-1",
        gradeId: "intern",
        rank: 1,
        title: "Карта мира",
        subtitle: "Кто вы, кто команда, как устроен проект",
        hours: "3–4 ч",
        moduleIds: ["intern-1-profession", "intern-1-sdlc", "intern-1-team", "intern-1-questions"],
      },
      {
        id: "intern-2",
        gradeId: "intern",
        rank: 2,
        title: "Требования и люди",
        subtitle: "Need, уровни требований, стейкхолдеры",
        hours: "4 ч",
        moduleIds: ["intern-2-requirement", "intern-2-levels", "intern-2-stakeholders", "intern-2-quality"],
      },
      {
        id: "intern-3",
        gradeId: "intern",
        rank: 3,
        title: "Первые артефакты",
        subtitle: "Выявление, заметки, первая история",
        hours: "4 ч",
        moduleIds: ["intern-3-elicitation", "intern-3-notes", "intern-3-story", "intern-3-meeting"],
      },
    ],
  },
  {
    id: "junior",
    title: "Junior",
    roman: "II",
    tagline: "Писать так, чтобы можно было строить и тестировать",
    color: "#d4a574",
    glow: "rgba(212, 165, 116, 0.28)",
    levels: [
      {
        id: "junior-1",
        gradeId: "junior",
        rank: 1,
        title: "Истории и сценарии",
        subtitle: "User Story, INVEST, Use Case, AC",
        hours: "5 ч",
        moduleIds: ["junior-1-stories", "junior-1-ac", "junior-1-usecase", "junior-1-clarify"],
      },
      {
        id: "junior-2",
        gradeId: "junior",
        rank: 2,
        title: "Документы",
        subtitle: "BRD, SRS, трассировка, ясный текст",
        hours: "5 ч",
        moduleIds: ["junior-2-brd", "junior-2-srs", "junior-2-trace", "junior-2-write"],
      },
      {
        id: "junior-3",
        gradeId: "junior",
        rank: 3,
        title: "Модели",
        subtitle: "UML, BPMN, As-Is / To-Be",
        hours: "5 ч",
        moduleIds: ["junior-3-uml", "junior-3-bpmn", "junior-3-gap", "junior-3-explain"],
      },
    ],
  },
  {
    id: "middle",
    title: "Middle",
    roman: "III",
    tagline: "Самостоятельно вести фичу от need до релиза",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.28)",
    levels: [
      {
        id: "middle-1",
        gradeId: "middle",
        rank: 1,
        title: "Ценность и приоритеты",
        subtitle: "MoSCoW, Kano, RICE, USM, CJM",
        hours: "5 ч",
        moduleIds: ["middle-1-prio", "middle-1-usm", "middle-1-cjm", "middle-1-no"],
      },
      {
        id: "middle-2",
        gradeId: "middle",
        rank: 2,
        title: "Системы и данные",
        subtitle: "API, SQL, интеграции, контракты",
        hours: "6 ч",
        moduleIds: ["middle-2-api", "middle-2-sql", "middle-2-integration", "middle-2-devtalk"],
      },
      {
        id: "middle-3",
        gradeId: "middle",
        rank: 3,
        title: "Качество системы",
        subtitle: "NFR, архитектура, ошибки, воркшоп",
        hours: "6 ч",
        moduleIds: ["middle-3-nfr", "middle-3-arch", "middle-3-errors", "middle-3-workshop"],
      },
    ],
  },
  {
    id: "senior",
    title: "Senior",
    roman: "IV",
    tagline: "Вести сложное изменение и людей вокруг него",
    color: "#f0a7b4",
    glow: "rgba(240, 167, 180, 0.28)",
    levels: [
      {
        id: "senior-1",
        gradeId: "senior",
        rank: 1,
        title: "Стратегия",
        subtitle: "Need, опции, оценка решения, impact",
        hours: "5 ч",
        moduleIds: ["senior-1-strategy", "senior-1-options", "senior-1-eval", "senior-1-change"],
      },
      {
        id: "senior-2",
        gradeId: "senior",
        rank: 2,
        title: "Сложные люди",
        subtitle: "Конфликт, политика, C-level, мышление",
        hours: "5 ч",
        moduleIds: ["senior-2-conflict", "senior-2-politics", "senior-2-exec", "senior-2-think"],
      },
      {
        id: "senior-3",
        gradeId: "senior",
        rank: 3,
        title: "Мастерство",
        subtitle: "Менторство, discovery, ownership, студия",
        hours: "6 ч",
        moduleIds: ["senior-3-mentor", "senior-3-discovery", "senior-3-lead", "senior-3-studio"],
      },
    ],
  },
];

export function allModules(): ModuleContent[] {
  return CURRICULUM.flatMap((g) => g.levels.flatMap((l) => l.moduleIds.map((id) => MODULES[id]))).filter(Boolean);
}

export function getGrade(id: string) {
  return CURRICULUM.find((g) => g.id === id);
}

export function getLevel(id: string) {
  for (const g of CURRICULUM) {
    const level = g.levels.find((l) => l.id === id);
    if (level) return { grade: g, level };
  }
  return undefined;
}

export function getModule(id: string) {
  return MODULES[id];
}

export function nextModule(id: string) {
  const list = allModules();
  const i = list.findIndex((m) => m.id === id);
  return i >= 0 ? list[i + 1] : undefined;
}

export function prevModule(id: string) {
  const list = allModules();
  const i = list.findIndex((m) => m.id === id);
  return i > 0 ? list[i - 1] : undefined;
}
