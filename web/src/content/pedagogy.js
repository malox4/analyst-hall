/** Six-section primer helper. Infographic lives on what / how (sometimes purpose). */

export const H = {
  what: "Что это",
  purpose: "Для чего",
  how: "Как",
  example: "Пример",
  mistakes: "Ошибки",
  practice: "Закрепление",
};

export function arc(s) {
  return {
    what: { title: H.what, paragraphs: s.what, infographic: s.whatFig || null },
    purpose: { title: H.purpose, paragraphs: s.purpose, infographic: s.purposeFig || null },
    how: { title: H.how, intro: s.howIntro, steps: s.howSteps, infographic: s.howFig || null },
    example: {
      title: H.example,
      heading: s.exampleHeading,
      paragraphs: s.example,
      note: s.exampleNote || "",
      infographic: s.exampleFig || null,
    },
    mistakes: { title: H.mistakes, intro: s.mistakesIntro, items: s.mistakes, cases: s.cases },
    practice: { title: H.practice, paragraphs: s.practice, to: s.to, cta: s.cta },
  };
}
