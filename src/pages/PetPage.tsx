import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cable, Copy, RotateCcw, Send } from "lucide-react";
import { HandbookPeek } from "@/components/academy/HandbookPeek";
import { PageMotion } from "@/components/ui/PageMotion";
import { Pill } from "@/components/ui/Pill";
import { useProgress } from "@/stores/progressStore";
import { cn } from "@/lib/cn";

type CatalogItem = {
  id: string;
  group?: string;
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
  accounts?: Array<Record<string, unknown>>;
  trial?: {
    debit: number;
    credit: number;
    balanced: boolean;
    diff: number;
    byCurrency?: Record<string, { debit: number; credit: number; balanced: boolean; diff: number }>;
  };
  kyc: Array<Record<string, unknown>>;
  ledger: Array<Record<string, unknown>>;
  journals?: Array<Record<string, unknown>>;
  payments?: Array<Record<string, unknown>>;
  holds?: Array<Record<string, unknown>>;
  incoming?: Array<Record<string, unknown>>;
  outgoing?: Array<Record<string, unknown>>;
  recon?: Array<Record<string, unknown>>;
  fxDeals?: Array<Record<string, unknown>>;
  salary?: Array<Record<string, unknown>>;
  suspense?: Array<Record<string, unknown>>;
  clearing?: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
  stock: Array<Record<string, unknown>>;
  audit: Array<Record<string, unknown>>;
  missions: Record<string, boolean>;
};

const MISSIONS: { id: string; title: string; how: string; xp: number }[] = [
  { id: "reproducedDouble", title: "Двойной P2P", how: "Два POST /transfers на 5000. Две DR-ноги Анны.", xp: 40 },
  { id: "contractShipped", title: "Ключ + 409", how: "PUT contract: ключ, 409, не errorInBody.", xp: 50 },
  { id: "kycHonest", title: "KYC master", how: "Анна не ACTIVE, пока PENDING.", xp: 30 },
  { id: "acsHonest", title: "ACS UNKNOWN", how: "Тишина ACS не списывает.", xp: 30 },
  { id: "capturedHold", title: "Hold → capture", how: "holdThenCapture, auth, потом capture. Держится после refund.", xp: 50 },
  { id: "refundHole", title: "Дыра возврата", how: "Refund без реверса. Trial ≠ 0.", xp: 40 },
  { id: "refundClean", title: "Честный refund", how: "refundPostsReversal и журнал.", xp: 45 },
  { id: "incomingPosted", title: "Входящий IBAN", how: "POST /bank/incoming на IBAN Анны. DR nostro.", xp: 35 },
  { id: "mt103Issued", title: "MT103 исходящего", how: "outgoing + ack posted. GET .../mt103.", xp: 40 },
  { id: "suspensePosted", title: "Невыясненные", how: "unknownIbanToSuspense, чужой IBAN.", xp: 40 },
  { id: "fxPosted", title: "Покупка USD", how: "POST /fx/convert 10 USD. Два журнала.", xp: 45 },
  { id: "salaryPosted", title: "Зарплатный файл", how: "POST /bank/salary. Смотрите trailer.", xp: 40 },
  { id: "clearingSettled", title: "Клиринг T+1", how: "После capture POST /clearing/settle.", xp: 40 },
  { id: "partialCaptured", title: "Частичный capture", how: "allowPartialCapture и amount < auth.", xp: 40 },
  { id: "reconMismatch", title: "MISMATCH сверки", how: "ingest с чужой суммой/RRN.", xp: 40 },
  { id: "orderSafe", title: "ShopLine ключ", how: "orderIdempotencyRequired.", xp: 25 },
];

export function PetPage() {
  const complete = useProgress((s) => s.completeDrill);
  const drills = useProgress((s) => s.modules["pet-wallet"]?.drills) ?? {};
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [group, setGroup] = useState("Все");
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/api/v1/accounts");
  const [headers, setHeaders] = useState("Content-Type: application/json");
  const [body, setBody] = useState("");
  const [resp, setResp] = useState("");
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

  const groups = useMemo(() => ["Все", ...Array.from(new Set(catalog.map((c) => c.group).filter(Boolean) as string[]))], [catalog]);
  const shown = catalog.filter((c) => group === "Все" || c.group === group);

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

  const tb = snap?.trial;
  const lastPay = snap?.payments?.[snap.payments.length - 1];

  return (
    <PageMotion>
      <Pill tone="rose">Core banking · живой пет</Pill>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Core banking · пет</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Журнал, T-счета, холд→capture→refund, IBAN/nostro, FX, зарплатный файл, клиринг, MT103. Postman:{" "}
            <code className="text-gold">{origin}/api/v1</code>. В путях{" "}
            <code className="text-gold">pay_replace</code> / <code className="text-gold">out_replace</code> подставьте живой id. Словарь ног:{" "}
            <Link to="/book" className="text-gold">
              справочник
            </Link>
            .
          </p>
        </div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-muted">
          <RotateCcw size={14} /> Сброс к заводским багам
        </button>
      </div>

      {tb && (
        <div className={cn("glass mt-6 rounded-3xl p-4 text-sm", tb.balanced ? "border-mint/25" : "border-rose/40")}>
          Trial · {tb.balanced ? <span className="text-mint">сходится по валютам</span> : <span className="text-rose">дыра</span>}
          {tb.byCurrency &&
            Object.entries(tb.byCurrency).map(([ccy, row]) => (
              <span key={ccy} className="ml-3 font-mono text-xs text-muted">
                {ccy} DR {row.debit} CR {row.credit}
                {!row.balanced && <span className="text-rose"> Δ{row.diff}</span>}
              </span>
            ))}
          {lastPay && (
            <span className="ml-3 text-xs text-muted">
              платёж {String(lastPay.id)} · {String(lastPay.status)}
            </span>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {MISSIONS.map((m) => {
          const on = Boolean(snap?.missions[m.id]);
          return (
            <div key={m.id} className={cn("glass rounded-2xl p-4 text-sm", on && "border-mint/30")}>
              <div className={on ? "text-mint" : "text-muted"}>
                {on ? "✓" : "○"} {m.title}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">{m.how}</p>
              <div className="mt-2 text-[11px] text-gold">
                +{m.xp} XP{drills[m.id] ? " · зачтено" : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[300px_1fr_340px]">
        <div>
          <div className="mb-2 flex flex-wrap gap-1">
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                className={cn("rounded-full border px-2 py-0.5 text-[11px]", group === g ? "border-gold/40 text-gold" : "border-white/10 text-muted")}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="grid max-h-[70vh] gap-2 overflow-auto pr-1">
            {shown.map((c) => (
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
                {c.hint && <p className="mt-1 text-[11px] leading-4 text-muted">{c.hint}</p>}
              </button>
            ))}
          </div>
        </div>

        <section className="glass rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-mint">
            <Cable size={12} /> Запрос · Postman
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-full border border-white/15 bg-transparent px-3 py-2 text-sm">
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
            <button type="button" disabled={busy} onClick={send} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink disabled:opacity-40">
              <Send size={14} /> Стрельнуть
            </button>
          </div>
          <label className="mt-4 block text-xs text-muted">Заголовки</label>
          <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} rows={3} className="mt-1 w-full resize-y rounded-2xl border border-white/10 bg-ink-2/70 p-3 font-mono text-xs outline-none focus:border-gold/40" />
          <label className="mt-3 block text-xs text-muted">Тело JSON</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="mt-1 w-full resize-y rounded-2xl border border-white/10 bg-ink-2/70 p-3 font-mono text-xs outline-none focus:border-gold/40" />
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-muted">curl</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(curl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="inline-flex items-center gap-1 text-xs text-gold"
            >
              <Copy size={12} /> {copied ? "скопировано" : "копировать"}
            </button>
          </div>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/8 bg-ink-2/80 p-3 text-[11px] leading-5 text-muted">{curl}</pre>
          <div className="mt-4 text-xs">
            Ответ {status != null && <span className={status < 400 && status > 0 ? "text-mint" : "text-rose"}>{status}</span>}
          </div>
          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/8 bg-ink-2/80 p-3 text-xs leading-5">{resp || "ещё не стреляли"}</pre>
        </section>

        <div className="grid gap-4 content-start">
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Кошельки · available</div>
            {(snap?.wallets ?? []).map((w) => (
              <div key={String(w.id)} className="mt-2 rounded-2xl border border-white/8 px-3 py-2 text-xs">
                <div>
                  {String(w.name)} · {String(w.status)} · KYC {String(w.kyc)}
                </div>
                <div className="font-mono text-muted">
                  avail {String(w.available)} · hold {String(w.hold ?? 0)} · ledger {String(w.ledger)}
                </div>
                <div className="text-[11px] text-muted">{String(w.iban ?? "")}</div>
              </div>
            ))}
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Холды</div>
            {(snap?.holds ?? []).length === 0 && <p className="mt-2 text-xs text-muted">Нет. Auth при holdThenCapture создаст OPEN.</p>}
            {(snap?.holds ?? []).map((h) => (
              <div key={String(h.id)} className="mt-1 font-mono text-[11px]">
                {String(h.id)} {String(h.status)} {String(h.amount)}
              </div>
            ))}
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Платежи</div>
            {(snap?.payments ?? []).map((p) => (
              <div key={String(p.id)} className="mt-1 font-mono text-[11px]">
                {String(p.id)} {String(p.kind)} {String(p.status)} {String(p.amount)}
              </div>
            ))}
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Проводки</div>
            <div className="mt-2 max-h-56 overflow-auto">
              {(snap?.ledger ?? []).length === 0 && <p className="text-xs text-muted">Пусто.</p>}
              {(snap?.ledger ?? []).slice().reverse().map((l) => (
                <div key={String(l.id)} className="border-b border-white/6 py-1 font-mono text-[11px]">
                  {String(l.dc)} {String(l.accountId)} {String(l.amount)} · {String(l.kind)}
                </div>
              ))}
            </div>
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Банк · IBAN</div>
            {(snap?.incoming ?? []).slice(-3).map((r) => (
              <div key={String(r.id)} className="mt-1 font-mono text-[11px]">
                IN {String(r.id)} {String(r.status)} {String(r.amount)}
              </div>
            ))}
            {(snap?.outgoing ?? []).slice(-3).map((r) => (
              <div key={String(r.id)} className="mt-1 font-mono text-[11px]">
                OUT {String(r.id)} {String(r.status)} {String(r.amount)}
              </div>
            ))}
            {(snap?.suspense ?? []).map((r) => (
              <div key={String(r.id)} className="mt-1 font-mono text-[11px] text-rose">
                SUS {String(r.id)} {String(r.status)} {String(r.amount)}
              </div>
            ))}
            {(snap?.incoming ?? []).length === 0 && (snap?.outgoing ?? []).length === 0 && (
              <p className="mt-2 text-xs text-muted">Входящий кредит, исходящий холд до ack.</p>
            )}
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">FX · зарплата · клиринг</div>
            {(snap?.fxDeals ?? []).map((d) => (
              <div key={String(d.id)} className="mt-1 font-mono text-[11px]">
                FX {String(d.amountUsd)} USD · {String(d.amountUzs)} UZS
              </div>
            ))}
            {(snap?.salary ?? []).map((s) => (
              <div key={String(s.id)} className="mt-1 font-mono text-[11px]">
                SAL {String(s.fileName)} trailer {String(s.trailerOk)}
              </div>
            ))}
            {(snap?.clearing ?? []).map((c) => (
              <div key={String(c.id)} className="mt-1 font-mono text-[11px]">
                CLR {String(c.id)} {String(c.amount)}
              </div>
            ))}
            {(snap?.fxDeals ?? []).length === 0 && (snap?.salary ?? []).length === 0 && (
              <p className="mt-2 text-xs text-muted">10 USD, salary CSV, settle после capture.</p>
            )}
          </section>
          <section className="glass rounded-3xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold">Сверка</div>
            {(snap?.recon ?? []).slice(0, 3).map((r) => (
              <div key={String(r.id)} className="mt-2 text-xs text-muted">
                {String(r.id)} · {(r.items as { result: string }[] | undefined)?.map((i) => i.result).join(", ") || "—"}
              </div>
            ))}
            {(snap?.recon ?? []).length === 0 && <p className="mt-2 text-xs text-muted">Сначала capture, потом ingest.</p>}
          </section>
        </div>
      </div>
      <HandbookPeek ids={["debit", "credit", "hold", "nostro", "fx", "salary"]} />
    </PageMotion>
  );
}
