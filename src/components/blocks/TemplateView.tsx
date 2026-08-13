import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { TemplateBlock } from "@/types/content";

export function TemplateView({ block }: { block: TemplateBlock }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(block.body);
    setOk(true);
    setTimeout(() => setOk(false), 1400);
  }
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Шаблон</div>
          <h3 className="font-display mt-1 text-2xl">{block.title}</h3>
          <p className="mt-2 text-sm text-muted">{block.description}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-xs text-gold hover:bg-gold/10"
        >
          {ok ? <Check size={14} /> : <Copy size={14} />}
          {ok ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/8 bg-ink-2/80 p-4 text-sm leading-6">
        {block.body}
      </pre>
    </section>
  );
}
