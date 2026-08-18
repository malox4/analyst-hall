import { NavLink } from "react-router-dom";
import { Cable, Map, Mic2, Radio, BookOpen, Swords, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { to: "/", label: "Путь", icon: Map, end: true },
  { to: "/pet", label: "API", icon: Cable },
  { to: "/book", label: "Словарь", icon: BookOpen },
  { to: "/lab", label: "Зал", icon: Swords },
  { to: "/quest", label: "Квест", icon: Radio },
  { to: "/interview", label: "Собес", icon: Mic2 },
  { to: "/profile", label: "Я", icon: UserRound },
];

export function MobileBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#0d1322]/90 px-1 py-2 backdrop-blur-xl md:hidden">
      <div className="flex justify-around">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px]",
                isActive ? "text-gold" : "text-muted",
              )
            }
          >
            <l.icon size={16} />
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
