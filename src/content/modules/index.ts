import type { ModuleContent } from "@/types/content";
import { INTERN_MODULES } from "./intern";
import { JUNIOR_MODULES } from "./junior";
import { MIDDLE_MODULES } from "./middle";
import { SENIOR_MODULES } from "./senior";
import { MODULE_EXTRAS } from "@/content/play";

function withExtras(m: ModuleContent): ModuleContent {
  const extra = MODULE_EXTRAS[m.id];
  if (!extra?.length) return m;
  return {
    ...m,
    minutes: m.minutes + 12,
    xp: m.xp + 30,
    blocks: [...extra, ...m.blocks],
  };
}

export const MODULES: Record<string, ModuleContent> = Object.fromEntries(
  [...INTERN_MODULES, ...JUNIOR_MODULES, ...MIDDLE_MODULES, ...SENIOR_MODULES].map((m) => {
    const enriched = withExtras(m);
    return [enriched.id, enriched];
  }),
);
