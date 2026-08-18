export { WALLET_QUEST } from "@/content/play/questWallet";
export { SHOPLINE_QUEST } from "@/content/play/questShopline";
export { MEDQUEUE_QUEST } from "@/content/play/questMedqueue";
export { CITYPARK_QUEST } from "@/content/play/questCitypark";
export {
  applyDelta,
  gradeFill,
  gradeWrite,
  mergeChoiceFlags,
  resolveNext,
  type QuestBeat,
  type QuestCampaign,
  type QuestChoice,
  type QuestEnding,
  type QuestMetricDef,
} from "@/content/play/questCore";

import { WALLET_QUEST } from "@/content/play/questWallet";
import { SHOPLINE_QUEST } from "@/content/play/questShopline";
import { MEDQUEUE_QUEST } from "@/content/play/questMedqueue";
import { CITYPARK_QUEST } from "@/content/play/questCitypark";
import type { QuestCampaign } from "@/content/play/questCore";

export const QUESTS: QuestCampaign[] = [WALLET_QUEST, SHOPLINE_QUEST, MEDQUEUE_QUEST, CITYPARK_QUEST];

export function getQuest(id: string | null | undefined) {
  if (!id) return undefined;
  return QUESTS.find((q) => q.id === id);
}

export function endingKey(campaignId: string, endingId: string) {
  return `${campaignId}:${endingId}`;
}
