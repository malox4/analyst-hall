import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { CURRICULUM } from "@/content/curriculum";
import { isModuleUnlocked, levelProgress, useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

export function PathMap() {
  const modules = useProgress((s) => s.modules);
  const track = useProgress((s) => s.track);

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Визуальный путь</div>
          <h2 className="font-display mt-1 text-3xl">Intern → Senior</h2>
        </div>
      </div>
      <div className="relative grid gap-4 lg:grid-cols-4">
        <div className="pointer-events-none absolute top-[72px] right-8 left-8 hidden h-px bg-gradient-to-r from-mint via-gold via-60% to-rose lg:block" />
        {CURRICULUM.map((g, gi) => (
          <div key={g.id} className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="grid h-12 w-12 place-items-center rounded-full border text-sm font-medium"
                style={{ borderColor: g.color, color: g.color, boxShadow: `0 0 24px ${g.glow}` }}
              >
                {g.roman}
              </div>
              <div>
                <div className="font-display text-xl" style={{ color: g.color }}>
                  {g.title}
                </div>
                <div className="text-[11px] text-muted">3 уровня</div>
              </div>
            </div>
            <div className="space-y-3">
              {g.levels.map((l, li) => {
                const p = levelProgress(l.moduleIds);
                const first = l.moduleIds[0];
                const open = track === "free" || isModuleUnlocked(first) || p > 0 || (gi === 0 && li === 0);
                const done = p === 100;
                return (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.08 + li * 0.05 }}
                  >
                    <Link
                      to={open ? `/level/${l.id}` : "#"}
                      className={cn(
                        "glass block rounded-2xl p-4 transition",
                        open ? "hover:border-gold/35" : "opacity-55",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] text-muted">
                            {g.title} {l.rank}
                          </div>
                          <div className="mt-0.5 font-medium">{l.title}</div>
                          <div className="mt-1 text-xs leading-snug text-muted">{l.subtitle}</div>
                        </div>
                        <div
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-full border",
                            done && "border-mint/40 bg-mint/15 text-mint",
                            !done && open && "border-gold/30 text-gold",
                            !open && "border-white/10 text-muted",
                          )}
                        >
                          {done ? <Check size={14} /> : open ? <span className="text-[11px]">{p}%</span> : <Lock size={12} />}
                        </div>
                      </div>
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full" style={{ width: `${p}%`, background: g.color }} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only">{Object.keys(modules).length} модулей в прогрессе</p>
    </section>
  );
}
