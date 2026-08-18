import { useEffect, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Ambient } from "./Ambient";
import { MobileBar } from "./MobileBar";
import { XpToast } from "@/components/ui/XpToast";
import { useProgress } from "@/stores/progressStore";

export function AppShell({ children }: { children: ReactNode }) {
  const touch = useProgress((s) => s.touchStreak);
  useEffect(() => {
    touch();
  }, [touch]);

  return (
    <div className="relative min-h-screen text-paper">
      <Ambient />
      <Sidebar />
      <main className="relative ml-0 min-h-screen pb-20 md:ml-[260px] md:pb-0">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">{children}</div>
      </main>
      <MobileBar />
      <XpToast />
    </div>
  );
}
