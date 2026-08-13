import { NavLink } from "react-router-dom";
import { Award, Map, Mic2, ScrollText, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { to: "/", label: "Путь", icon: Map, end: true },
  { to: "/interview", label: "Собес", icon: Mic2 },
  { to: "/exam", label: "Экзамен", icon: ScrollText },
  { to: "/achievements", label: "Печати", icon: Award },
  { to: "/profile", label: "Я", icon: UserRound },
];

export function MobileBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[#0d1322]/90 px-2 py-2 backdrop-blur-xl md:hidden">
      <div className="flex justify-around">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[10px]",
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
