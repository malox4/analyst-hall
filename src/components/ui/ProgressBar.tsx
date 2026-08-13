import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  className,
  tone = "gold",
}: {
  value: number;
  className?: string;
  tone?: "gold" | "mint" | "violet" | "rose";
}) {
  const map = {
    gold: "from-gold to-gold-2",
    mint: "from-mint to-teal-200",
    violet: "from-violet to-indigo-300",
    rose: "from-rose to-pink-200",
  };
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-white/8", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", map[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
