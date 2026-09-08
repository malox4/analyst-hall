/** Primer: термин → о чём это → для чего → как → пример. */

export const H = {
  term: "Термин",
  about: "О чём это",
  purpose: "Для чего это нужно",
  how: "Как пользоваться",
  example: "Пример",
  mistakes: "Ошибки",
  practice: "Закрепление",
};

function paras(v) {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [String(v)];
}

export function arc(s) {
  const what = paras(s.what);
  const term = paras(s.term).length ? paras(s.term) : what.slice(0, 1);
  const about = paras(s.about).length ? paras(s.about) : what.slice(1);
  return {
    term: { title: H.term, paragraphs: term },
    about: { title: H.about, paragraphs: about, infographic: s.aboutFig || s.whatFig || null },
    purpose: { title: H.purpose, paragraphs: paras(s.purpose), infographic: s.purposeFig || null },
    how: { title: H.how, intro: s.howIntro, steps: s.howSteps, infographic: s.howFig || null },
    example: {
      title: H.example,
      heading: s.exampleHeading,
      paragraphs: paras(s.example),
      note: s.exampleNote || "",
      infographic: s.exampleFig || null,
    },
    mistakes: { title: H.mistakes, intro: s.mistakesIntro, items: s.mistakes, cases: s.cases },
    practice: { title: H.practice, paragraphs: paras(s.practice), to: s.to, cta: s.cta },
  };
}

/** Definition first, story last. */
export function teach(s) {
  const term = paras(s.term);
  if (s.not) term.push(s.not);
  return arc({
    term,
    about: s.about,
    whatFig: s.fig,
    purpose: s.purpose,
    purposeFig: s.purposeFig,
    howIntro: s.howIntro,
    howSteps: s.how,
    howFig: s.howFig,
    exampleHeading: s.exampleTitle,
    example: s.example,
    exampleNote: s.exampleNote,
    exampleFig: s.exampleFig,
    mistakesIntro: s.mistakesIntro,
    mistakes: s.mistakes,
    cases: s.cases,
    practice: s.practice,
    to: s.to,
    cta: s.cta,
  });
}
