import { useEffect, useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import type { PracticeBlock } from "@/types/content";
import { loadPractice, savePractice } from "@/lib/idb";
import { useProgress } from "@/stores/progressStore";

export function PracticeView({ block, moduleId }: { block: PracticeBlock; moduleId: string }) {
  const [text, setText] = useState("");
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const mark = useProgress((s) => s.markPractice);
  const done = useProgress((s) => s.modules[moduleId]?.practiceDone);

  useEffect(() => {
    loadPractice(moduleId, block.title).then((row) => {
      if (row?.text) setText(row.text);
    });
  }, [moduleId, block.title]);

  async function persist() {
    await savePractice({ moduleId, blockTitle: block.title, text, updatedAt: Date.now() });
    if (text.trim().length >= block.minChars) mark(moduleId);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-mint">Практика</div>
      <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-muted">{block.brief}</p>
      <p className="mt-3 text-[15px] leading-7">{block.prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={block.placeholder}
        rows={8}
        className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-ink-2/70 p-4 text-sm leading-6 outline-none focus:border-gold/40"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          {text.trim().length} / {block.minChars} символов
          {done && <span className="ml-2 text-mint">сохранено в IndexedDB</span>}
        </span>
        <button
          type="button"
          onClick={persist}
          className="rounded-full bg-mint px-4 py-1.5 font-medium text-ink"
        >
          {saved ? "Записано" : "Сохранить работу"}
        </button>
      </div>
      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-widest text-muted">Рубрика</div>
        <ul className="mt-2 space-y-1">
          {block.rubric.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-muted">
              <Check size={14} className="mt-0.5 text-gold" /> {r}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="mt-4 inline-flex items-center gap-2 text-sm text-gold hover:text-gold-2"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
        {show ? "Скрыть образец" : "Показать сильный образец"}
      </button>
      {show && (
        <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/8 bg-ink-2/80 p-4 text-sm leading-6 text-paper/90">
          {block.sample}
        </pre>
      )}
    </section>
  );
}
