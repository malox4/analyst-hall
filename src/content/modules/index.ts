import type { ModuleContent } from "@/types/content";
import { INTERN_MODULES } from "./intern";
import { JUNIOR_MODULES } from "./junior";
import { MIDDLE_MODULES } from "./middle";
import { SENIOR_MODULES } from "./senior";

export const MODULES: Record<string, ModuleContent> = Object.fromEntries(
  [...INTERN_MODULES, ...JUNIOR_MODULES, ...MIDDLE_MODULES, ...SENIOR_MODULES].map((m) => [m.id, m]),
);
