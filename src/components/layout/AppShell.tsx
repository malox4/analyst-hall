import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Ambient } from "./Ambient";
import { MobileBar } from "./MobileBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-paper">
      <Ambient />
      <Sidebar />
      <main className="relative ml-0 min-h-screen pb-20 md:ml-[260px] md:pb-0">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">{children}</div>
      </main>
      <MobileBar />
    </div>
  );
}
