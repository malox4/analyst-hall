import { useCallback, useEffect, useMemo, useState } from "react";
import { Cable, Copy, RotateCcw, Send } from "lucide-react";
import { PageMotion } from "@/components/ui/PageMotion";
import { Pill } from "@/components/ui/Pill";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

type CatalogItem = {
  id: string;
  method: string;
  path: string;
  title: string;
  hint?: string;
  headers?: Record<string, string>;
  body?: string;
};

type Snapshot = {
  contract: Record<string, unknown>;
  wallets: Array<Record<string, unknown>>;
  kyc: Array<Record<string, unknown>>;
  ledger: Array<Record<string, unknown>>;
  transfers: Array<Record<string, unknown>>;
  cards: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
  stock: Array<Record<string, unknown>>;
  audit: Array<Record<string, unknown>>;
  missions: {
    reproducedDouble: boolean;
    contractShipped: boolean;
    kycHonest: boolean;
    acsHonest: boolean;
    orderSafe: boolean;
  };
};

const MISSIONS: { id: keyof Snapshot["missions"]; title: string; how: string; xp: number }[] = [
  { id: "reproducedDouble", title: "Воспроизвести двойной P2P", how: "Два POST /transfers на 5000 без ключа. В ledger у Анны две проводки −5000.", xp: 40 },
  { id: "contractShipped", title: "Выкатить контракт", how: "PUT /contract: ключ обязателен, дубль 409, errorInBody false.", xp: 50 },
  { id: "kycHonest", title: "KYC = master", how: "kycIsMaster true. Анна больше не ACTIVE, пока PENDING.", xp: 35 },
  { id: "acsHonest", title: "ACS → UNKNOWN", how: "acsTimeoutStatus UNKNOWN. Тишина ACS не списывает.", xp: 35 },
  { id: "orderSafe", title: "ShopLine с ключом", how: "orderIdempotencyRequired true. Склад не режется повторным POST.", xp: 35 },
];

export function PetPage() {
  const complete = useProgress((s) => s.completeDrill);
  const drills = useProgress((s) => s.modules["pet-wallet"]?.drills) ?? {};
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/api/v1/wallets");
  const [headers, setHeaders] = useState("Content-Type: application/json");
  const [body, setBody] = useState("");
  const [resp, setResp] = useState<string>("");
  const [status, setStatus] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";

  const loadState = useCallback(async () => {
    const r = await fetch("/api/v1/state");
    if (r.ok) setSnap(await r.json());
  }, []);

  useEffect(() => {
    fetch("/api/v1/catalog")
      .then((r) => r.json())
      .then((d) => setCatalog(d.catalog ?? []))
      .catch(() => setCatalog([]));
    loadState();
    const t = setInterval(loadState, 2500);
    return () => clearInterval(t);
  }, [loadState]);

  useEffect(() => {
    if (!snap) return;
    for (const m of MISSIONS) {
      if (snap.missions[m.id] && !drills[m.id]) complete("pet-wallet", m.id, m.xp);
    }
  }, [snap, drills, complete]);

  function applyExample(item: CatalogItem) {
    setMethod(item.method);
    setPath(item.path);
    const h = { "Content-Type": "application/json", ...(item.headers ?? {}) };
    setHeaders(Object.entries(h).map(([k, v]) => `${k}: ${v}`).join("\n"));
    setBody(item.body ?? "");
  }

  function parseHeaders() {
    const out: Record<string, string> = {};
    for (const line of headers.split("\n")) {
      const i = line.indexOf(":");
      if (i < 0) continue;
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();
      if (k) out[k] = v;
    }
    return out;
  }

  const curl = useMemo(() => {
    const hs = parseHeaders();
    const h = Object.entries(hs)
      .map(([k, v]) => `  -H '${k}: ${v}'`)
      .join(" \\\n");
    const d = method !== "GET" && body.trim() ? ` \\\n  -d '${body.replace(/'/g, "'\\''")}'` : "";
    return `curl -sS -X ${method} ${origin}${path} \\\n${h}${d}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, path, headers, body, origin]);

  async function send() {
    setBusy(true);
    try {
      const r = await fetch(path, {
        method,
        headers: parseHeaders(),
        body: method === "GET" ? undefined : body || undefined,
      });
      setStatus(r.status);
      const text = await r.text();
      try {
        setResp(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResp(text);
      }
      await loadState();
    } catch (e) {
      setStatus(0);
      setResp(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    await fetch("/api/v1/reset", { method: "POST" });
    await loadState();
    setResp("");
    setStatus(null);
  }

  return (
    <PageMotion>
      <Pill tone="rose">Живой пет · HTTP</Pill>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Контур Malo Wallet</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Это не слайд. API слушает{" "}
            <code className="text-gold">{origin}/api/v1</code>. Postman, curl, этот экран — один контур. Двойной POST
            без ключа пишет две проводки. PUT /contract меняет поведение пета.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-muted"
        >
          <RotateCcw size={14} /> Сброс к заводским багам
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {MISSIONS.map((m) => {
          const on = Boolean(snap?.missions[m.id]);
          return (
            <div key={m.id} className={cn("glass rounded-2xl p-4 text-sm", on && "border-mint/30")}>
              <div className={on ? "text-mint" : "text-muted"}>{on ? "✓" : "○"} {m.title}</div>
              <p className="mt-2 text-xs leading-5 text-muted">{m.how}</p>
              <div className="mt-2 text-[11px] text-gold">+{m.xp} XP{drills[m.id] ? " · зачтено" : ""}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[280px_1fr_340px]">
        <div className="grid gap-2 content-start">
          <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Операции · как Swagger</div>
          {catalog.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => applyExample(c)}
              className={cn(
                "glass rounded-2xl p-3 text-left transition hover:border-gold/30",
                path === c.path && method === c.method && "border-gold/35",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-gold">{c.method}</span>
                <span className="truncate text-xs text-muted">{c.path.replace("/api/v1", "")}</span>
              </div>
              <div className="mt-1 text-sm">{c.title}</div>
            </button>
          ))}
        </div>

        <section className="glass rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-mint">
            <Cable size={12} /> Запрос · как Postman
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="rounded-full border border-white/15 bg-transparent px-3 py-2 text-sm"
            >
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((x) => (
                <option key={x} value={x} className="bg-ink">
                  {x}
                </option>
              ))}
            </select>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="min-w-[12rem] flex-1 border-b border-white/10 bg-transparent py-2 font-mono text-sm outline-none"
            />
            <button
              type="button"
              disabled={busy}
              onClick={send}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink disabled:opacity-40"
            >
              <Send size={14} /> Стрельнуть
            </button>
          </div>
          <label className="mt-4 block text-xs text-muted">Заголовки</label>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-y rounded-2xl border border-white/10 bg-ink-2/70 p-3 font-mono text-xs outline-none focus:border-gold/40"
          />
          <label className="mt-3 block text-xs text-muted">Тело JSON</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="mt-1 w-full resize-y rounded-2xl border border-white/10 bg-ink-2/70 p-3 font-mono text-xs outline-none focus:border-gold/40"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-muted">curl для внешнего Postman</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(curl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="inline-flex items-center gap-1 text-xs text-gold"
            >
              <Copy size={12} /> {copied ? "скопировано" : "копировать curl"}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/8 bg-ink-2/80 p-3 text-[11px] leading-5 text-muted">
            {curl}
          </pre>
          <div className="mt-4 text-xs">
            Ответ {status != null && <span className={status < 400 && status > 0 ? "text-mint" : "text-rose"}>{status}</span>}
          </div>
          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/8 bg-ink-2/80 p-3 text-xs leading-5">
            {resp || "ещё не стреляли"}
          </pre>
        </section>

        <div className="grid gap-4 content-start">
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Контракт сейчас</div>
            <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-muted">
              {snap ? JSON.stringify(snap.contract, null, 2) : "грузим…"}
            </pre>
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Кошельки</div>
            <div className="mt-3 grid gap-2">
              {(snap?.wallets ?? []).map((w) => (
                <div key={String(w.id)} className="rounded-2xl border border-white/8 px-3 py-2 text-xs">
                  <div>
                    {String(w.name)} · {String(w.id)}
                  </div>
                  <div className="text-muted">
                    {String(w.balance)} {String(w.currency)} · {String(w.status)} · KYC {String(w.kyc)}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Ledger · живой</div>
            <div className="mt-3 max-h-52 overflow-auto">
              {(snap?.ledger ?? []).length === 0 && <p className="text-xs text-muted">Пусто. Стрельните P2P.</p>}
              {(snap?.ledger ?? []).map((l) => (
                <div key={String(l.id)} className="border-b border-white/6 py-1 font-mono text-[11px]">
                  {String(l.walletId)} {Number(l.delta) > 0 ? "+" : ""}
                  {String(l.delta)}
                </div>
              ))}
            </div>
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">ShopLine остатки</div>
            {(snap?.stock ?? []).map((s) => (
              <div key={String(s.sku)} className="mt-2 text-xs text-muted">
                {String(s.sku)} {String(s.title)} · qty {String(s.qty)}
              </div>
            ))}
          </section>
        </div>
      </div>
    </PageMotion>
  );
}
