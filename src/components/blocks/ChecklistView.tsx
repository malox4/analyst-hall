import type { ChecklistBlock } from "@/types/content";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

export function ChecklistView({ block, moduleId }: { block: ChecklistBlock; moduleId: string }) {
  const checks = useProgress((s) => s.modules[moduleId]?.checklist ?? {});
  const toggle = useProgress((s) => s.toggleCheck);
  const done = block.items.filter((i) => checks[i]).length;
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="flex items-end justify-between">
        <h3 className="font-display text-2xl">{block.title}</h3>
        <span className="text-xs text-muted">
          {done}/{block.items.length}
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {block.items.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => toggle(moduleId, item)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                checks[item] ? "border-mint/30 bg-mint/8 text-paper" : "border-white/8 hover:border-white/16",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border",
                  checks[item] ? "border-mint bg-mint text-[10px] text-ink" : "border-white/20",
                )}
              >
                {checks[item] ? "✓" : ""}
              </span>
              {item}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
