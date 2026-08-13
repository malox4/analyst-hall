import { Sparkles } from "lucide-react";

export function BootScreen() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 animate-pulse place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
          <Sparkles size={22} />
        </div>
        <div className="font-display mt-5 text-3xl text-gold-2">Malo</div>
        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted">Открываем зал</p>
      </div>
    </div>
  );
}
