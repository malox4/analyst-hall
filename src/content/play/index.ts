import type { ContentBlock } from "@/types/content";
import { INTERN_EXTRAS } from "./intern";
import { JUNIOR_EXTRAS } from "./junior";
import { MIDDLE_EXTRAS } from "./middle";
import { SENIOR_EXTRAS } from "./senior";

export const MODULE_EXTRAS: Record<string, ContentBlock[]> = {
  ...INTERN_EXTRAS,
  ...JUNIOR_EXTRAS,
  ...MIDDLE_EXTRAS,
  ...SENIOR_EXTRAS,
};
