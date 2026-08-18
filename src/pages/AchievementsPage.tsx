import { PageMotion } from "@/components/ui/PageMotion";
import { ACHIEVEMENTS } from "@/content/achievements";
import { useProgress } from "@/stores/progressStore";
import { Award, BookOpen, Briefcase, Cable, Calendar, Compass, Crown, Flame, Footprints, Gem, Globe, Hexagon, Landmark, Mic, Moon, Orbit, PenLine, Radio, Scroll, Shield, Sparkles, Sprout, Swords, Trophy, Unplug, Zap } from "lucide-react";
import { cn } from "@/lib/cn";

const icons = {
  footprints: Footprints,
  sprout: Sprout,
  compass: Compass,
  hexagon: Hexagon,
  crown: Crown,
  sparkles: Sparkles,
  "pen-line": PenLine,
  mic: Mic,
  scroll: Scroll,
  gem: Gem,
  flame: Flame,
  trophy: Trophy,
  orbit: Orbit,
  swords: Swords,
  briefcase: Briefcase,
  moon: Moon,
  calendar: Calendar,
  zap: Zap,
  radio: Radio,
  shield: Shield,
  globe: Globe,
  cable: Cable,
  unplug: Unplug,
  landmark: Landmark,
  "book-open": BookOpen,
};

export function AchievementsPage() {
  const badges = useProgress((s) => s.badges);
  const xp = useProgress((s) => s.xp);
  return (
    <PageMotion>
      <h1 className="font-display text-4xl md:text-5xl">Печати зала</h1>
      <p className="mt-3 max-w-xl text-muted">
        Бейджи открываются сами, когда вы закрываете путь, квизы и симуляцию. Сейчас у вас {xp} XP и {badges.length} печатей.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const Icon = icons[a.icon as keyof typeof icons] ?? Award;
          const on = badges.includes(a.id);
          return (
            <div
              key={a.id}
              className={cn(
                "glass rounded-3xl p-6 transition",
                on ? "border-gold/35 shadow-[0_0_32px_rgba(212,165,116,0.12)]" : "opacity-50 grayscale",
              )}
            >
              <Icon className={on ? "text-gold" : "text-muted"} size={22} />
              <h2 className="font-display mt-3 text-2xl">{a.title}</h2>
              <p className="mt-2 text-sm text-muted">{a.description}</p>
            </div>
          );
        })}
      </div>
    </PageMotion>
  );
}
