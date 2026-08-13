import type { ContentBlock, ModuleContent } from "@/types/content";
import { TheoryView } from "./TheoryView";
import { CalloutView } from "./CalloutView";
import { ExampleView } from "./ExampleView";
import { InfographicView } from "./InfographicView";
import { DiagramView } from "./DiagramView";
import { AccordionView } from "./AccordionView";
import { CompareView } from "./CompareView";
import { StepsView } from "./StepsView";
import { QuizView } from "./QuizView";
import { PracticeView } from "./PracticeView";
import { ChecklistView } from "./ChecklistView";
import { TemplateView } from "./TemplateView";
import { CaseView } from "./CaseView";
import { SoftView } from "./SoftView";

export function BlockRenderer({
  block,
  module,
}: {
  block: ContentBlock;
  module: ModuleContent;
}) {
  switch (block.kind) {
    case "theory":
      return <TheoryView block={block} />;
    case "callout":
      return <CalloutView block={block} />;
    case "example":
      return <ExampleView block={block} />;
    case "infographic":
      return <InfographicView block={block} />;
    case "diagram":
      return <DiagramView block={block} />;
    case "accordion":
      return <AccordionView block={block} />;
    case "compare":
      return <CompareView block={block} />;
    case "steps":
      return <StepsView block={block} />;
    case "quiz":
      return <QuizView block={block} moduleId={module.id} />;
    case "practice":
      return <PracticeView block={block} moduleId={module.id} />;
    case "checklist":
      return <ChecklistView block={block} moduleId={module.id} />;
    case "template":
      return <TemplateView block={block} />;
    case "case":
      return <CaseView block={block} />;
    case "soft":
      return <SoftView block={block} />;
    default:
      return null;
  }
}
