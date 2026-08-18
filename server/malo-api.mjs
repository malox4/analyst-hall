import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE_FILE = path.join(ROOT, "data", "malo-wallet.json");
const VERSION = 3;

function seed() {
  return {
    version: VERSION,
    contract: {
      transferIdempotencyRequired: false,
      transferDuplicateHttp: 200,
      errorInBody: true,
      kycIsMaster: false,
      acsTimeoutStatus: "SUCCESS",
      orderIdempotencyRequired: false,
      holdThenCapture: false,
      refundPostsReversal: false,
      requireBalancedJournal: false,
      feeOnCaptureBps: 0,
      dailyP2pLimit: 1000000,
      allowPartialCapture: false,
      fxSpreadBps: 0,
      salaryTrailerMustMatch: false,
      salaryFileOnce: false,
      unknownIbanToSuspense: false,
      blockedCardCannotAuth: false,
    },
    accounts: [
      { id: "acc_anna", walletId: "wal_anna", iban: "UZ12MALO000000000001", name: "Анна · текущий UZS", type: "LIAB_CUSTOMER", normal: "credit", currency: "UZS", ledger: 150000 },
      { id: "acc_boris", walletId: "wal_boris", iban: "UZ12MALO000000000002", name: "Борис · текущий UZS", type: "LIAB_CUSTOMER", normal: "credit", currency: "UZS", ledger: 80000 },
      { id: "acc_usd_anna", walletId: "wal_anna_usd", iban: "UZ12MALO000000USD001", name: "Анна · текущий USD", type: "LIAB_CUSTOMER", normal: "credit", currency: "USD", ledger: 200 },
      { id: "acc_merchant", walletId: null, iban: "UZ12CAFE000000000009", name: "Cafe Orient · MCC 5812", type: "LIAB_MERCHANT", normal: "credit", currency: "UZS", ledger: 0 },
      { id: "acc_nostro", walletId: null, iban: "UZ12ORNT000000NOSTRO", name: "Nostro Orient Bank UZS", type: "ASSET_NOSTRO", normal: "debit", currency: "UZS", ledger: 230000 },
      { id: "acc_nostro_usd", walletId: null, iban: "UZ12ORNT000000NOSTUSD", name: "Nostro Orient Bank USD", type: "ASSET_NOSTRO", normal: "debit", currency: "USD", ledger: 500 },
      { id: "acc_fee", walletId: null, iban: null, name: "Доход комиссия Malo", type: "INC_FEE", normal: "credit", currency: "UZS", ledger: 0 },
      { id: "acc_cb", walletId: null, iban: null, name: "Расход chargeback", type: "EXP_CHARGEBACK", normal: "debit", currency: "UZS", ledger: 0 },
      { id: "acc_suspense", walletId: null, iban: null, name: "Невыясненные суммы", type: "LIAB_SUSPENSE", normal: "credit", currency: "UZS", ledger: 0 },
      { id: "acc_clearing", walletId: null, iban: null, name: "Клиринг карт T+1", type: "LIAB_CLEARING", normal: "credit", currency: "UZS", ledger: 0 },
      { id: "acc_fx_uzs", walletId: null, iban: null, name: "FX позиция UZS", type: "POS_FX", normal: "credit", currency: "UZS", ledger: 0 },
      { id: "acc_fx_usd", walletId: null, iban: null, name: "FX позиция USD", type: "POS_FX", normal: "debit", currency: "USD", ledger: 0 },
    ],
    wallets: [
      { id: "wal_anna", customer: "anna", name: "Анна UZS", accountId: "acc_anna", currency: "UZS", status: "ACTIVE" },
      { id: "wal_anna_usd", customer: "anna", name: "Анна USD", accountId: "acc_usd_anna", currency: "USD", status: "ACTIVE" },
      { id: "wal_boris", customer: "boris", name: "Борис UZS", accountId: "acc_boris", currency: "UZS", status: "ACTIVE" },
    ],
    kyc: [
      { id: "kyc_anna", customer: "anna", status: "PENDING", reason: "ожидание документов" },
      { id: "kyc_boris", customer: "boris", status: "APPROVED", reason: null },
    ],
    plastic: [
      { id: "crd_anna", walletId: "wal_anna", last4: "4412", scheme: "MIR", status: "ACTIVE", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "crd_boris", walletId: "wal_boris", last4: "8821", scheme: "VISA", status: "ACTIVE", createdAt: "2026-01-01T00:00:00.000Z" },
    ],
    transfers: [],
    payments: [],
    holds: [],
    journals: [],
    ledger: [],
    cards: [],
    incoming: [],
    outgoing: [],
    recon: [],
    fx: [{ pair: "USD/UZS", rate: 12650, asOf: "2026-08-18" }],
    fxDeals: [],
    salary: [],
    suspense: [],
    clearing: [],
    orders: [],
    stock: [
      { sku: "SKU-100", title: "Чайник", qty: 12 },
      { sku: "SKU-200", title: "Кофемолка", qty: 3 },
    ],
    audit: [],
    seq: 1,
  };
}

function load() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    if (!s.version || s.version < VERSION || !s.accounts) return seed();
    return s;
  } catch {
    return seed();
  }
}

function save(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

let state = load();

function nextId(prefix) {
  state.seq = (state.seq ?? 1) + 1;
  return `${prefix}_${state.seq.toString(36)}`;
}

function now() {
  return new Date().toISOString();
}

function header(req, name) {
  const key = Object.keys(req.headers || {}).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? String(req.headers[key]) : "";
}

function send(res, status, body) {
  const json = JSON.stringify(body, null, 2);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.end(json);
}

function fail(res, status, code, message, extra = {}) {
  if (state.contract.errorInBody && status >= 400 && status < 500) {
    return send(res, 200, { ok: false, error: { code, message }, ...extra });
  }
  return send(res, status, { error: { code, message }, ...extra });
}

function audit(req, status, note) {
  state.audit.unshift({
    at: now(),
    method: req.method,
    path: (req.url || "").split("?")[0],
    status,
    note,
    key: header(req, "idempotency-key") || null,
  });
  state.audit = state.audit.slice(0, 120);
}

function account(id) {
  return state.accounts.find((a) => a.id === id);
}

function liveLeg(l) {
  return l.status !== "REVERSED";
}

function openHoldSum(accountId) {
  return (state.holds ?? []).filter((h) => h.accountId === accountId && h.status === "OPEN").reduce((s, h) => s + h.amount, 0);
}

function signedDelta(acc, dc, amount) {
  if (acc.normal === "credit") return dc === "C" ? amount : -amount;
  return dc === "D" ? amount : -amount;
}

function syncWallets() {
  for (const w of state.wallets) {
    const acc = account(w.accountId);
    if (acc) w.ledger = acc.ledger;
  }
}

function walletView(w) {
  const acc = account(w.accountId);
  const kyc = state.kyc.find((k) => k.customer === w.customer);
  const hold = acc ? openHoldSum(acc.id) : 0;
  const ledger = acc?.ledger ?? 0;
  let status = w.status;
  if (state.contract.kycIsMaster && kyc && kyc.status !== "APPROVED") status = "PENDING_KYC";
  return {
    ...w,
    iban: acc?.iban,
    accountId: acc?.id,
    ledger,
    hold,
    available: ledger - hold,
    balance: ledger - hold,
    currency: acc?.currency ?? w.currency,
    status,
    kyc: kyc?.status ?? null,
  };
}

function ccyTrial(ccy) {
  const accs = state.accounts.filter((a) => a.currency === ccy);
  const legs = state.ledger.filter((l) => l.currency === ccy && liveLeg(l));
  const debit = legs.filter((l) => l.dc === "D").reduce((s, l) => s + l.amount, 0);
  const credit = legs.filter((l) => l.dc === "C").reduce((s, l) => s + l.amount, 0);
  return {
    currency: ccy,
    rows: accs.map((a) => {
      const hold = openHoldSum(a.id);
      return { id: a.id, name: a.name, type: a.type, normal: a.normal, currency: a.currency, iban: a.iban, ledger: a.ledger, hold, available: a.ledger - hold };
    }),
    debit,
    credit,
    balanced: debit === credit,
    diff: debit - credit,
  };
}

function trialBalance() {
  const currencies = [...new Set(state.accounts.map((a) => a.currency))];
  const byCurrency = Object.fromEntries(currencies.map((c) => [c, ccyTrial(c)]));
  const uzs = byCurrency.UZS || { debit: 0, credit: 0, balanced: true, diff: 0, rows: [] };
  return {
    rows: currencies.flatMap((c) => byCurrency[c].rows),
    debit: uzs.debit,
    credit: uzs.credit,
    diff: uzs.diff,
    byCurrency,
    balanced: currencies.every((c) => byCurrency[c].balanced),
  };
}

function postJournal({ kind, ref, legs, note }) {
  const byCcy = {};
  for (const leg of legs) {
    const acc = account(leg.accountId);
    if (!acc) {
      const err = new Error("NO_ACCOUNT");
      err.code = "NO_ACCOUNT";
      throw err;
    }
    const ccy = leg.currency || acc.currency;
    byCcy[ccy] ??= { D: 0, C: 0 };
    byCcy[ccy][leg.dc] += Number(leg.amount);
  }
  const holes = Object.entries(byCcy).filter(([, v]) => v.D !== v.C);
  if (holes.length && state.contract.requireBalancedJournal) {
    const err = new Error("UNBALANCED");
    err.code = "UNBALANCED";
    err.byCurrency = byCcy;
    throw err;
  }
  const debit = legs.filter((l) => l.dc === "D").reduce((s, l) => s + l.amount, 0);
  const credit = legs.filter((l) => l.dc === "C").reduce((s, l) => s + l.amount, 0);
  const journalId = nextId("jrn");
  const at = now();
  for (const leg of legs) {
    const acc = account(leg.accountId);
    const delta = signedDelta(acc, leg.dc, leg.amount);
    acc.ledger += delta;
    state.ledger.push({
      id: nextId("ld"),
      journalId,
      accountId: acc.id,
      walletId: acc.walletId,
      dc: leg.dc,
      amount: leg.amount,
      delta,
      currency: acc.currency,
      kind,
      ref,
      note: note || leg.note || null,
      status: "POSTED",
      at,
    });
  }
  state.journals.push({
    id: journalId,
    kind,
    ref,
    debit,
    credit,
    byCurrency: byCcy,
    balanced: holes.length === 0,
    at,
    note: note ?? null,
  });
  syncWallets();
  return journalId;
}

function statement(accountId) {
  const acc = account(accountId);
  if (!acc) return null;
  const items = state.ledger.filter((l) => l.accountId === accountId).slice().sort((a, b) => String(a.at).localeCompare(String(b.at)));
  const posted = items.filter(liveLeg).reduce((s, l) => s + l.delta, 0);
  const opening = acc.ledger - posted;
  let run = opening;
  const rows = items.map((l) => {
    if (liveLeg(l)) run += l.delta;
    return { ...l, balanceAfter: run };
  });
  return { accountId, name: acc.name, currency: acc.currency, iban: acc.iban, opening, closing: acc.ledger, hold: openHoldSum(acc.id), items: rows };
}

function tAccount(accountId) {
  const acc = account(accountId);
  if (!acc) return null;
  const items = state.ledger.filter((l) => l.accountId === accountId && liveLeg(l));
  const debit = items.filter((l) => l.dc === "D");
  const credit = items.filter((l) => l.dc === "C");
  return {
    account: { id: acc.id, name: acc.name, type: acc.type, normal: acc.normal, currency: acc.currency, ledger: acc.ledger, iban: acc.iban },
    debit,
    credit,
    debitSum: debit.reduce((s, l) => s + l.amount, 0),
    creditSum: credit.reduce((s, l) => s + l.amount, 0),
    hold: openHoldSum(acc.id),
  };
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({ __parseError: true, raw });
      }
    });
  });
}

const CONTRACT_KEYS = [
  "transferIdempotencyRequired",
  "transferDuplicateHttp",
  "errorInBody",
  "kycIsMaster",
  "acsTimeoutStatus",
  "orderIdempotencyRequired",
  "holdThenCapture",
  "refundPostsReversal",
  "requireBalancedJournal",
  "feeOnCaptureBps",
  "dailyP2pLimit",
  "allowPartialCapture",
  "fxSpreadBps",
  "salaryTrailerMustMatch",
  "salaryFileOnce",
  "unknownIbanToSuspense",
  "blockedCardCannotAuth",
];

export const OPENAPI = {
  openapi: "3.0.3",
  info: {
    title: "Malo Core Banking / Wallet API",
    version: "3.0.0",
    description:
      "Живой пет двойной записи: P2P, холд→capture→refund, IBAN/nostro, FX, зарплатный файл, клиринг, сверка, MT103. Postman: http://localhost:8080/api/v1",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/accounts": { get: { summary: "План счетов + остатки по валютам" } },
    "/accounts/{id}/statement": { get: { summary: "Выписка с running balance" } },
    "/ledger/t-accounts/{id}": { get: { summary: "T-счёт: колонки DR/CR" } },
    "/wallets": { get: { summary: "Кошельки: available / hold / ledger" } },
    "/ledger": { get: { summary: "Проводки (ноги журнала)" } },
    "/ledger/journals": { get: { summary: "Журнальные ордера" } },
    "/ledger/journals/{id}/reverse": { post: { summary: "Сторно: зеркальные ноги" } },
    "/ledger/trial-balance": { get: { summary: "Пробный баланс по валютам" } },
    "/holds": { get: { summary: "Холды авторизаций и исходящих" } },
    "/payments": { get: { summary: "Платёжные интенты" } },
    "/transfers": { post: { summary: "P2P: две ноги journal" } },
    "/payments/{id}/capture": { post: { summary: "Capture холда; body.amount — частичный, если контракт" } },
    "/payments/{id}/cancel": { post: { summary: "Void: снять холд без проводки" } },
    "/payments/{id}/refund": { post: { summary: "Возврат: реверс или дыра в балансе" } },
    "/payments/{id}/chargeback": { post: { summary: "Chargeback + штраф на nostro" } },
    "/cards": { get: { summary: "Выпущенный пластик" } },
    "/cards/issue": { post: { summary: "Выпуск карты на кошелёк" } },
    "/cards/{id}/block": { post: { summary: "Блок карты" } },
    "/cards/authorize": { post: { summary: "Auth: холд или сразу SUCCESS" } },
    "/bank/incoming": { get: { summary: "Входящие IBAN" }, post: { summary: "Кредит клиента, дебет nostro" } },
    "/bank/outgoing": { get: { summary: "Исходящие" }, post: { summary: "Холд до ack банка" } },
    "/bank/outgoing/{id}/ack": { post: { summary: "posted | rejected" } },
    "/bank/outgoing/{id}/mt103": { get: { summary: "SWIFT MT103 исходящего" } },
    "/bank/salary": { post: { summary: "Зарплатный файл + trailer" } },
    "/bank/suspense": { get: { summary: "Невыясненные" } },
    "/bank/suspense/{id}/allocate": { post: { summary: "Разнести suspense на IBAN" } },
    "/fx": { get: { summary: "Курсы" } },
    "/fx/convert": { post: { summary: "Покупка USD за UZS, две валюты — два журнала" } },
    "/clearing/settle": { post: { summary: "T+1: DR мерчант CR nostro" } },
    "/recon/export": { get: { summary: "Наш реестр capture + RRN" } },
    "/recon/ingest": { post: { summary: "Файл партнёра MATCH/MISMATCH" } },
    "/kyc": { get: { summary: "KYC" } },
    "/contract": { get: { summary: "Контракт" }, put: { summary: "Выкатить контракт" } },
  },
};

function op(group, id, method, path, title, hint, body, headers = {}) {
  return { group, id, method, path, title, hint, headers, body: body ? JSON.stringify(body, null, 2) : "" };
}

const BANK_CONTRACT = {
  transferIdempotencyRequired: true,
  transferDuplicateHttp: 409,
  errorInBody: false,
  kycIsMaster: true,
  acsTimeoutStatus: "UNKNOWN",
  orderIdempotencyRequired: true,
  holdThenCapture: true,
  refundPostsReversal: true,
  requireBalancedJournal: true,
  feeOnCaptureBps: 150,
  dailyP2pLimit: 200000,
  allowPartialCapture: true,
  fxSpreadBps: 80,
  salaryTrailerMustMatch: true,
  salaryFileOnce: true,
  unknownIbanToSuspense: true,
  blockedCardCannotAuth: true,
};

export const CATALOG = [
  op("Счета", "accounts", "GET", "/api/v1/accounts", "План счетов", "LIAB, nostro, FX, suspense, клиринг."),
  op("Счета", "wallets", "GET", "/api/v1/wallets", "Кошельки available/hold", "Анна UZS+USD. ACTIVE при PENDING KYC — баг."),
  op("Счета", "tb", "GET", "/api/v1/ledger/trial-balance", "Пробный баланс", "Сходится отдельно UZS и USD."),
  op("Счета", "journals", "GET", "/api/v1/ledger/journals", "Журналы", "Ордер = набор ног, byCurrency."),
  op("Счета", "ledger", "GET", "/api/v1/ledger", "Все проводки", "dc D/C, journalId, kind."),
  op("Счета", "stmt", "GET", "/api/v1/accounts/acc_anna/statement", "Выписка Анны", "opening → running balance."),
  op("Счета", "tacc", "GET", "/api/v1/ledger/t-accounts/acc_anna", "T-счёт Анны", "Колонки дебет / кредит."),
  op("Счета", "storno", "POST", "/api/v1/ledger/journals/jrn_replace/reverse", "Сторно журнала", "Подставьте id ордера. Зеркальные ноги.", {}),
  op("P2P", "p2p", "POST", "/api/v1/transfers", "P2P без ключа", "Дважды = две пары проводок.", { fromWalletId: "wal_anna", toWalletId: "wal_boris", amount: 5000, currency: "UZS" }),
  op("P2P", "p2p-key", "POST", "/api/v1/transfers", "P2P с ключом", "Пока контракт дырявый — дубль.", { fromWalletId: "wal_anna", toWalletId: "wal_boris", amount: 5000, currency: "UZS" }, { "Idempotency-Key": "tap-441" }),
  op("Карты", "plastic", "GET", "/api/v1/cards", "Пластик", "ACTIVE / BLOCKED."),
  op("Карты", "issue", "POST", "/api/v1/cards/issue", "Выпустить карту", "", { walletId: "wal_boris", scheme: "UZCARD" }),
  op("Карты", "block", "POST", "/api/v1/cards/crd_boris/block", "Блок Бориса", "Пока blockedCardCannotAuth=false — auth пройдёт.", {}),
  op("Карты", "auth", "POST", "/api/v1/cards/authorize", "Auth 3DS", "holdThenCapture=false сразу пилит ledger.", { walletId: "wal_boris", cardId: "crd_boris", amount: 12000, currency: "UZS", merchantAccountId: "acc_merchant" }),
  op("Карты", "acs", "POST", "/api/v1/cards/authorize", "ACS молчит", "SUCCESS vs UNKNOWN.", { walletId: "wal_boris", amount: 12000, currency: "UZS", merchantAccountId: "acc_merchant" }, { "X-ACS-Timeout": "1" }),
  op("Карты", "holds", "GET", "/api/v1/holds", "Холды", "OPEN режет available, не ledger."),
  op("Карты", "pay", "GET", "/api/v1/payments", "Платежи", "AUTHORIZED → CAPTURED → REFUNDED."),
  op("Карты", "cap", "POST", "/api/v1/payments/pay_replace/capture", "Capture полный", "Подставьте id. DR клиента CR мерчанта (+fee).", {}),
  op("Карты", "capp", "POST", "/api/v1/payments/pay_replace/capture", "Capture частичный", "Без allowPartialCapture тело проигнорируют — спишут всё.", { amount: 4000 }),
  op("Карты", "cnl", "POST", "/api/v1/payments/pay_replace/cancel", "Void / снять холд", "Без проводки.", {}),
  op("Карты", "rf", "POST", "/api/v1/payments/pay_replace/refund", "Refund", "Без refundPostsReversal — дыра в trial.", { amount: 12000 }),
  op("Карты", "cb", "POST", "/api/v1/payments/pay_replace/chargeback", "Chargeback", "DR мерчанта + EXP + CR nostro.", { amount: 12000 }),
  op("Банк", "in-list", "GET", "/api/v1/bank/incoming", "Входящие", "Кредиты IBAN."),
  op("Банк", "in", "POST", "/api/v1/bank/incoming", "Входящий IBAN", "DR nostro CR клиента.", { iban: "UZ12MALO000000000001", amount: 25000, currency: "UZS", paymentRef: "SALARY-SEP" }),
  op("Банк", "in-unk", "POST", "/api/v1/bank/incoming", "Чужой IBAN", "404 или suspense, если флаг.", { iban: "UZ00GHOST0000000001", amount: 9000, currency: "UZS", paymentRef: "UNKNOWN-PAY" }),
  op("Банк", "sus", "GET", "/api/v1/bank/suspense", "Невыясненные", "Ждут allocate."),
  op("Банк", "alloc", "POST", "/api/v1/bank/suspense/sus_replace/allocate", "Разнести suspense", "Подставьте id. DR suspense CR IBAN.", { iban: "UZ12MALO000000000001" }),
  op("Банк", "out", "POST", "/api/v1/bank/outgoing", "Исходящий на IBAN", "Холд, пока банк не ack.", { fromWalletId: "wal_anna", iban: "UZ99OTHER0000000001", amount: 7000, currency: "UZS", purpose: "rent" }),
  op("Банк", "ack", "POST", "/api/v1/bank/outgoing/out_replace/ack", "Ack исходящего", "posted | rejected.", { result: "posted" }),
  op("Банк", "mt", "GET", "/api/v1/bank/outgoing/out_replace/mt103", "MT103", "После posted. Подставьте id."),
  op("FX", "rates", "GET", "/api/v1/fx", "Курс USD/UZS", "12650 + спред из контракта."),
  op("FX", "buy", "POST", "/api/v1/fx/convert", "Купить 10 USD", "DR Анна UZS / CR FX UZS; DR FX USD / CR Анна USD.", { fromWalletId: "wal_anna", toWalletId: "wal_anna_usd", amountTo: 10 }),
  op("Зарплата", "sal-bad", "POST", "/api/v1/bank/salary", "Файл с кривым trailer", "Пока salaryTrailerMustMatch=false — разнесут.", {
    fileName: "salary_20260818.csv",
    trailerSum: 999999,
    rows: [
      { iban: "UZ12MALO000000000001", amount: 20000 },
      { iban: "UZ12MALO000000000002", amount: 15000 },
    ],
  }),
  op("Зарплата", "sal-ok", "POST", "/api/v1/bank/salary", "Файл с верным trailer", "35 000 = 20k+15k. Повтор имени — дубль, пока salaryFileOnce=false.", {
    fileName: "salary_20260819.csv",
    trailerSum: 35000,
    rows: [
      { iban: "UZ12MALO000000000001", amount: 20000 },
      { iban: "UZ12MALO000000000002", amount: 15000 },
    ],
  }),
  op("Клиринг", "set", "POST", "/api/v1/clearing/settle", "Settle мерчанта T+1", "После capture: DR Cafe CR nostro.", {}),
  op("Сверка", "exp", "GET", "/api/v1/recon/export", "Экспорт реестра", "Наши capture с RRN."),
  op("Сверка", "ing", "POST", "/api/v1/recon/ingest", "Файл Orient", "Чужая сумма — MISMATCH.", { source: "orient", rows: [{ rrn: "rrn_fake", amount: 1 }] }),
  op("KYC", "kyc", "GET", "/api/v1/kyc", "Заявки KYC"),
  op("KYC", "kyc-start", "POST", "/api/v1/kyc/start", "Старт KYC", "Два POST = две заявки.", { customer: "anna" }),
  op("KYC", "kyc-ok", "POST", "/api/v1/kyc/kyc_anna/decide", "Одобрить Анну", "", { status: "APPROVED" }),
  op("ShopLine", "ord", "POST", "/api/v1/shopline/orders", "Заказ", "Режет склад.", { sku: "SKU-200", qty: 1, sellerId: "sel_42" }),
  op("ShopLine", "st", "GET", "/api/v1/shopline/stock", "Остатки"),
  op("Контракт", "get-c", "GET", "/api/v1/contract", "Читать контракт"),
  op("Контракт", "put-c", "PUT", "/api/v1/contract", "Выкатить банк-контракт", "Ключ, холд, реверс, trailer, FX-спред, suspense.", BANK_CONTRACT),
  op("Контракт", "reset", "POST", "/api/v1/reset", "Сброс пета", "Заводские баги.", {}),
];

async function route(req, res) {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname.replace(/\/$/, "") || "/";
  const m = req.method.toUpperCase();

  if (m === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.end();
    return;
  }

  if (p === "/api/openapi.json" || p === "/api/v1/openapi.json") return send(res, 200, OPENAPI);
  if (p === "/api/v1/catalog" && m === "GET") return send(res, 200, { catalog: CATALOG, contract: state.contract });
  if (p === "/api/health") return send(res, 200, { ok: true, product: "malo-core-banking", version: VERSION });
  if (p === "/api/v1/state" && m === "GET") return send(res, 200, snapshot());
  if (p === "/api/v1/reset" && m === "POST") {
    state = seed();
    save(state);
    audit(req, 200, "reset");
    return send(res, 200, { ok: true, state: snapshot() });
  }
  if (p === "/api/v1/contract" && m === "GET") return send(res, 200, state.contract);
  if (p === "/api/v1/contract" && (m === "PUT" || m === "PATCH")) {
    const body = await readBody(req);
    if (!body || body.__parseError) return fail(res, 400, "BAD_JSON", "Тело не JSON");
    for (const k of CONTRACT_KEYS) if (body[k] !== undefined) state.contract[k] = body[k];
    if (![200, 409].includes(Number(state.contract.transferDuplicateHttp))) state.contract.transferDuplicateHttp = 200;
    if (!["SUCCESS", "UNKNOWN"].includes(state.contract.acsTimeoutStatus)) state.contract.acsTimeoutStatus = "SUCCESS";
    save(state);
    audit(req, 200, "contract shipped");
    return send(res, 200, { ok: true, contract: state.contract });
  }

  if (p === "/api/v1/accounts" && m === "GET") {
    return send(res, 200, { items: trialBalance().rows, trial: trialBalance() });
  }
  const stmt = p.match(/^\/api\/v1\/accounts\/([^/]+)\/statement$/);
  if (stmt && m === "GET") {
    const row = statement(stmt[1]);
    if (!row) return fail(res, 404, "NOT_FOUND", "Счёт не найден");
    return send(res, 200, row);
  }
  if (p === "/api/v1/wallets" && m === "GET") return send(res, 200, { items: state.wallets.map(walletView) });
  const wal = p.match(/^\/api\/v1\/wallets\/([^/]+)$/);
  if (wal && m === "GET") {
    const w = state.wallets.find((x) => x.id === wal[1]);
    if (!w) return fail(res, 404, "NOT_FOUND", "Кошелёк не найден");
    return send(res, 200, walletView(w));
  }
  if (p === "/api/v1/ledger" && m === "GET") {
    const acc = url.searchParams.get("accountId");
    const items = acc ? state.ledger.filter((l) => l.accountId === acc) : state.ledger;
    return send(res, 200, { items, trial: trialBalance() });
  }
  if (p === "/api/v1/ledger/journals" && m === "GET") return send(res, 200, { items: state.journals, trial: trialBalance() });
  const storno = p.match(/^\/api\/v1\/ledger\/journals\/([^/]+)\/reverse$/);
  if (storno && m === "POST") return reverseJournal(req, res, storno[1]);
  const tacc = p.match(/^\/api\/v1\/ledger\/t-accounts\/([^/]+)$/);
  if (tacc && m === "GET") {
    const row = tAccount(tacc[1]);
    if (!row) return fail(res, 404, "NOT_FOUND", "Счёт не найден");
    return send(res, 200, row);
  }
  if (p === "/api/v1/ledger/trial-balance" && m === "GET") return send(res, 200, trialBalance());
  if (p === "/api/v1/holds" && m === "GET") return send(res, 200, { items: state.holds });
  if (p === "/api/v1/payments" && m === "GET") return send(res, 200, { items: state.payments });
  const onePay = p.match(/^\/api\/v1\/payments\/([^/]+)$/);
  if (onePay && m === "GET") {
    const pay = state.payments.find((x) => x.id === onePay[1]);
    if (!pay) return fail(res, 404, "NOT_FOUND", "Платёж не найден");
    return send(res, 200, pay);
  }
  if (p === "/api/v1/transfers" && m === "POST") return createTransfer(req, res, await readBody(req));
  const cap = p.match(/^\/api\/v1\/payments\/([^/]+)\/capture$/);
  if (cap && m === "POST") return capturePayment(req, res, cap[1], await readBody(req));
  const cnl = p.match(/^\/api\/v1\/payments\/([^/]+)\/cancel$/);
  if (cnl && m === "POST") return cancelPayment(req, res, cnl[1]);
  const rf = p.match(/^\/api\/v1\/payments\/([^/]+)\/refund$/);
  if (rf && m === "POST") return refundPayment(req, res, rf[1], await readBody(req));
  const cbk = p.match(/^\/api\/v1\/payments\/([^/]+)\/chargeback$/);
  if (cbk && m === "POST") return chargebackPayment(req, res, cbk[1], await readBody(req));
  if (p === "/api/v1/kyc" && m === "GET") return send(res, 200, { items: state.kyc });
  if (p === "/api/v1/kyc/start" && m === "POST") return startKyc(req, res, await readBody(req));
  const dec = p.match(/^\/api\/v1\/kyc\/([^/]+)\/decide$/);
  if (dec && m === "POST") return decideKyc(req, res, dec[1], await readBody(req));
  if (p === "/api/v1/cards" && m === "GET") return send(res, 200, { items: state.plastic ?? [] });
  if (p === "/api/v1/cards/issue" && m === "POST") return issueCard(req, res, await readBody(req));
  const blk = p.match(/^\/api\/v1\/cards\/([^/]+)\/block$/);
  if (blk && m === "POST") return blockCard(req, res, blk[1]);
  if (p === "/api/v1/auths" && m === "GET") return send(res, 200, { items: state.cards });
  if (p === "/api/v1/cards/authorize" && m === "POST") return authorizeCard(req, res, await readBody(req));
  if (p === "/api/v1/bank/incoming" && m === "GET") return send(res, 200, { items: state.incoming });
  if (p === "/api/v1/bank/incoming" && m === "POST") return bankIncoming(req, res, await readBody(req));
  if (p === "/api/v1/bank/outgoing" && m === "GET") return send(res, 200, { items: state.outgoing });
  if (p === "/api/v1/bank/outgoing" && m === "POST") return bankOutgoing(req, res, await readBody(req));
  const ack = p.match(/^\/api\/v1\/bank\/outgoing\/([^/]+)\/ack$/);
  if (ack && m === "POST") return bankAck(req, res, ack[1], await readBody(req));
  const mt = p.match(/^\/api\/v1\/bank\/outgoing\/([^/]+)\/mt103$/);
  if (mt && m === "GET") {
    const row = state.outgoing.find((o) => o.id === mt[1]);
    if (!row) return fail(res, 404, "NOT_FOUND", "Исходящий не найден");
    if (!row.mt103) return fail(res, 409, "STATE", "MT103 после posted");
    return send(res, 200, { id: row.id, mt103: row.mt103, status: row.status });
  }
  if (p === "/api/v1/bank/salary" && m === "GET") return send(res, 200, { items: state.salary });
  if (p === "/api/v1/bank/salary" && m === "POST") return salaryIngest(req, res, await readBody(req));
  if (p === "/api/v1/bank/suspense" && m === "GET") return send(res, 200, { items: state.suspense });
  const alloc = p.match(/^\/api\/v1\/bank\/suspense\/([^/]+)\/allocate$/);
  if (alloc && m === "POST") return allocateSuspense(req, res, alloc[1], await readBody(req));
  if (p === "/api/v1/fx" && m === "GET") return send(res, 200, { items: state.fx, spreadBps: state.contract.fxSpreadBps });
  if (p === "/api/v1/fx/convert" && m === "POST") return fxConvert(req, res, await readBody(req));
  if (p === "/api/v1/fx/deals" && m === "GET") return send(res, 200, { items: state.fxDeals });
  if (p === "/api/v1/clearing" && m === "GET") return send(res, 200, { items: state.clearing });
  if (p === "/api/v1/clearing/settle" && m === "POST") return clearingSettle(req, res);
  if (p === "/api/v1/recon/export" && m === "GET") return send(res, 200, exportRecon());
  if (p === "/api/v1/recon/ingest" && m === "POST") return ingestRecon(req, res, await readBody(req));
  if (p === "/api/v1/shopline/stock" && m === "GET") return send(res, 200, { items: state.stock });
  if (p === "/api/v1/shopline/orders" && m === "POST") return createOrder(req, res, await readBody(req));

  fail(res, 404, "NO_ROUTE", `Нет ${m} ${p}`);
}

function dailyP2pOut(accountId) {
  const day = now().slice(0, 10);
  return state.transfers
    .filter((t) => t.fromAccountId === accountId && t.createdAt?.slice(0, 10) === day && t.status === "SUCCESS")
    .reduce((s, t) => s + t.amount, 0);
}

function createTransfer(req, res, body) {
  if (!body || body.__parseError) return fail(res, 400, "BAD_JSON", "Тело не JSON");
  const key = header(req, "idempotency-key");
  if (state.contract.transferIdempotencyRequired && !key) {
    audit(req, 400, "missing key");
    return fail(res, 400, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key обязателен");
  }
  if (key) {
    const prev = state.transfers.find((t) => t.idempotencyKey === key);
    if (prev) {
      const code = Number(state.contract.transferDuplicateHttp) || 200;
      audit(req, code, "duplicate key");
      if (code === 409) return send(res, 409, { error: { code: "DUPLICATE", message: "Перевод с этим ключом уже есть" }, existingId: prev.id });
      return send(res, 200, prev);
    }
  }
  const fromW = state.wallets.find((w) => w.id === body.fromWalletId);
  const toW = state.wallets.find((w) => w.id === body.toWalletId);
  if (!fromW || !toW) return fail(res, 404, "WALLET", "from/to кошелёк не найден");
  const from = account(fromW.accountId);
  const to = account(toW.accountId);
  if (from.currency !== to.currency) return fail(res, 409, "CCY", "P2P только в одной валюте — иначе FX");
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return fail(res, 400, "AMOUNT", "amount > 0");
  const avail = from.ledger - openHoldSum(from.id);
  if (avail < amount) return fail(res, 409, "INSUFFICIENT", "Недостаточно available", { available: avail, hold: openHoldSum(from.id) });
  const used = dailyP2pOut(from.id);
  if (used + amount > Number(state.contract.dailyP2pLimit || 1e12)) {
    return fail(res, 409, "LIMIT", "Дневной лимит P2P", { used, limit: state.contract.dailyP2pLimit });
  }
  const id = nextId("tr");
  let journalId = null;
  try {
    journalId = postJournal({
      kind: "P2P",
      ref: id,
      note: "p2p transfer",
      legs: [
        { accountId: from.id, dc: "D", amount },
        { accountId: to.id, dc: "C", amount },
      ],
    });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
  const tx = {
    id,
    fromWalletId: fromW.id,
    toWalletId: toW.id,
    fromAccountId: from.id,
    toAccountId: to.id,
    amount,
    currency: from.currency,
    status: "SUCCESS",
    journalId,
    idempotencyKey: key || null,
    createdAt: now(),
  };
  state.transfers.push(tx);
  save(state);
  audit(req, 201, "transfer");
  send(res, 201, tx);
}

function issueCard(req, res, body) {
  const w = state.wallets.find((x) => x.id === body?.walletId);
  if (!w) return fail(res, 404, "WALLET", "Кошелёк не найден");
  const row = {
    id: nextId("crd"),
    walletId: w.id,
    last4: String(Math.floor(1000 + Math.random() * 9000)),
    scheme: body?.scheme || "MIR",
    status: "ACTIVE",
    createdAt: now(),
  };
  state.plastic.push(row);
  save(state);
  audit(req, 201, "card issue");
  send(res, 201, row);
}

function blockCard(req, res, id) {
  const row = (state.plastic ?? []).find((c) => c.id === id);
  if (!row) return fail(res, 404, "NOT_FOUND", "Карта не найдена");
  row.status = "BLOCKED";
  row.blockedAt = now();
  save(state);
  audit(req, 200, "card block");
  send(res, 200, row);
}

function authorizeCard(req, res, body) {
  const timeout = header(req, "x-acs-timeout") === "1" || body?.acsTimeout === true;
  const w = state.wallets.find((x) => x.id === body?.walletId);
  if (!w) return fail(res, 404, "WALLET", "Кошелёк не найден");
  if (body?.cardId) {
    const card = (state.plastic ?? []).find((c) => c.id === body.cardId);
    if (!card) return fail(res, 404, "CARD", "Карта не найдена");
    if (card.walletId !== w.id) return fail(res, 409, "CARD_WALLET", "Карта другого кошелька");
    if (card.status === "BLOCKED" && state.contract.blockedCardCannotAuth) {
      return fail(res, 409, "CARD_BLOCKED", "Карта в блоке");
    }
  }
  const acc = account(w.accountId);
  const merchantId = body?.merchantAccountId || "acc_merchant";
  const amount = Number(body?.amount) || 0;
  if (amount <= 0) return fail(res, 400, "AMOUNT", "amount > 0");
  const rrn = nextId("rrn");
  const payId = nextId("pay");
  if (timeout) {
    const status = state.contract.acsTimeoutStatus;
    const row = { id: nextId("auth"), paymentId: payId, walletId: w.id, amount, rrn, acs: "TIMEOUT", status, createdAt: now() };
    state.cards.push(row);
    const pay = {
      id: payId,
      kind: "CARD",
      status,
      amount,
      currency: acc.currency,
      fromAccountId: acc.id,
      toAccountId: merchantId,
      rrn,
      holdId: null,
      createdAt: now(),
    };
    if (status === "SUCCESS") {
      try {
        pay.journalId = postJournal({
          kind: "CARD_FALSE_SUCCESS",
          ref: payId,
          note: "ACS timeout but SUCCESS — баг контракта",
          legs: [
            { accountId: acc.id, dc: "D", amount },
            { accountId: merchantId, dc: "C", amount },
          ],
        });
        pay.status = "CAPTURED";
        pay.capturedAmount = amount;
      } catch (e) {
        return fail(res, 409, e.code || "JOURNAL", e.message);
      }
    }
    state.payments.push(pay);
    save(state);
    audit(req, 200, `card ${status}`);
    return send(res, 200, { ...row, payment: pay });
  }

  const avail = acc.ledger - openHoldSum(acc.id);
  if (avail < amount) return fail(res, 409, "INSUFFICIENT", "Недостаточно available", { available: avail });

  if (state.contract.holdThenCapture) {
    const hold = { id: nextId("hld"), accountId: acc.id, paymentId: payId, amount, status: "OPEN", createdAt: now() };
    state.holds.push(hold);
    const pay = {
      id: payId,
      kind: "CARD",
      status: "AUTHORIZED",
      amount,
      currency: acc.currency,
      fromAccountId: acc.id,
      toAccountId: merchantId,
      rrn,
      holdId: hold.id,
      cardId: body?.cardId || null,
      authCode: nextId("apv"),
      createdAt: now(),
    };
    state.payments.push(pay);
    state.cards.push({ id: nextId("auth"), paymentId: payId, walletId: w.id, amount, rrn, acs: "OK", status: "AUTHORIZED", createdAt: now() });
    save(state);
    audit(req, 201, "auth hold");
    return send(res, 201, { payment: pay, hold, available: walletView(w).available });
  }

  let journalId;
  try {
    journalId = postJournal({
      kind: "CARD_CAPTURE_DIRECT",
      ref: payId,
      note: "нет холда — сразу capture",
      legs: [
        { accountId: acc.id, dc: "D", amount },
        { accountId: merchantId, dc: "C", amount },
      ],
    });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
  const pay = {
    id: payId,
    kind: "CARD",
    status: "CAPTURED",
    amount,
    capturedAmount: amount,
    currency: acc.currency,
    fromAccountId: acc.id,
    toAccountId: merchantId,
    rrn,
    journalId,
    holdId: null,
    createdAt: now(),
  };
  state.payments.push(pay);
  state.cards.push({ id: nextId("auth"), paymentId: payId, walletId: w.id, amount, rrn, acs: "OK", status: "CAPTURED", createdAt: now() });
  save(state);
  audit(req, 201, "direct capture");
  send(res, 201, { payment: pay });
}

function capturePayment(req, res, id, body) {
  const pay = state.payments.find((p) => p.id === id);
  if (!pay) return fail(res, 404, "NOT_FOUND", "Платёж не найден");
  if (pay.status !== "AUTHORIZED") return fail(res, 409, "STATE", `Нельзя capture из ${pay.status}`);
  const hold = state.holds.find((h) => h.id === pay.holdId);
  let amount = pay.amount;
  const requested = Number(body?.amount);
  if (Number.isFinite(requested) && requested > 0 && requested !== pay.amount) {
    if (state.contract.allowPartialCapture) {
      if (requested > pay.amount) return fail(res, 409, "AMOUNT", "partial > auth");
      amount = requested;
    }
  }
  const bps = Number(state.contract.feeOnCaptureBps || 0);
  const fee = Math.round((amount * bps) / 10000);
  const merchantNet = amount - fee;
  const legs = [
    { accountId: pay.fromAccountId, dc: "D", amount },
    { accountId: pay.toAccountId, dc: "C", amount: merchantNet },
  ];
  if (fee > 0) legs.push({ accountId: "acc_fee", dc: "C", amount: fee, note: "merchant discount" });
  else legs[1].amount = amount;
  try {
    pay.journalId = postJournal({ kind: "CARD_CAPTURE", ref: pay.id, note: `RRN ${pay.rrn}`, legs });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
  if (hold) {
    hold.status = "CAPTURED";
    hold.capturedAmount = amount;
    if (amount < pay.amount) {
      hold.releasedAmount = pay.amount - amount;
    }
  }
  pay.status = "CAPTURED";
  pay.capturedAt = now();
  pay.capturedAmount = amount;
  pay.fee = fee;
  save(state);
  audit(req, 200, "capture");
  send(res, 200, { payment: pay, trial: trialBalance() });
}

function cancelPayment(req, res, id) {
  const pay = state.payments.find((p) => p.id === id);
  if (!pay) return fail(res, 404, "NOT_FOUND", "Платёж не найден");
  if (pay.status !== "AUTHORIZED") return fail(res, 409, "STATE", `Нельзя void из ${pay.status}`);
  const hold = state.holds.find((h) => h.id === pay.holdId);
  if (hold) hold.status = "RELEASED";
  pay.status = "CANCELLED";
  save(state);
  audit(req, 200, "void");
  send(res, 200, { payment: pay, available: account(pay.fromAccountId).ledger - openHoldSum(pay.fromAccountId) });
}

function refundPayment(req, res, id, body) {
  const pay = state.payments.find((p) => p.id === id);
  if (!pay) return fail(res, 404, "NOT_FOUND", "Платёж не найден");
  if (pay.status !== "CAPTURED") return fail(res, 409, "STATE", "Refund только после capture");
  const amount = Number(body?.amount ?? pay.capturedAmount ?? pay.amount);
  if (state.contract.refundPostsReversal) {
    try {
      pay.refundJournalId = postJournal({
        kind: "REFUND",
        ref: pay.id,
        note: "реверс capture",
        legs: [
          { accountId: pay.toAccountId, dc: "D", amount },
          { accountId: pay.fromAccountId, dc: "C", amount },
        ],
      });
    } catch (e) {
      return fail(res, 409, e.code || "JOURNAL", e.message);
    }
  } else {
    const acc = account(pay.fromAccountId);
    acc.ledger += amount;
    state.ledger.push({
      id: nextId("ld"),
      journalId: null,
      accountId: acc.id,
      walletId: acc.walletId,
      dc: "C",
      amount,
      delta: amount,
      currency: acc.currency,
      kind: "REFUND_HOLE",
      ref: pay.id,
      note: "возврат без DR мерчанта — дыра",
      status: "POSTED",
      at: now(),
    });
    syncWallets();
  }
  pay.status = "REFUNDED";
  pay.refundedAt = now();
  save(state);
  audit(req, 200, "refund");
  send(res, 200, { payment: pay, trial: trialBalance() });
}

function chargebackPayment(req, res, id, body) {
  const pay = state.payments.find((p) => p.id === id);
  if (!pay) return fail(res, 404, "NOT_FOUND", "Платёж не найден");
  if (!["CAPTURED", "REFUNDED"].includes(pay.status)) return fail(res, 409, "STATE", "Chargeback после capture");
  const amount = Number(body?.amount ?? pay.capturedAmount ?? pay.amount);
  try {
    pay.cbJournalId = postJournal({
      kind: "CHARGEBACK",
      ref: pay.id,
      note: "спор",
      legs: [
        { accountId: pay.toAccountId, dc: "D", amount },
        { accountId: pay.fromAccountId, dc: "C", amount },
      ],
    });
    postJournal({
      kind: "CHARGEBACK_FEE",
      ref: pay.id,
      note: "штраф эквайера",
      legs: [
        { accountId: "acc_cb", dc: "D", amount: 15000 },
        { accountId: "acc_nostro", dc: "C", amount: 15000 },
      ],
    });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
  pay.status = "CHARGEBACK";
  save(state);
  audit(req, 200, "chargeback");
  send(res, 200, { payment: pay, trial: trialBalance() });
}

function creditIncoming(acc, amount, ref, note, kind = "IBAN_IN") {
  return postJournal({
    kind,
    ref,
    note,
    legs: [
      { accountId: "acc_nostro", dc: "D", amount },
      { accountId: acc.id, dc: "C", amount },
    ],
  });
}

function bankIncoming(req, res, body) {
  if (!body?.iban || !body?.amount) return fail(res, 400, "FIELDS", "iban и amount");
  const amount = Number(body.amount);
  const id = nextId("in");
  const acc = state.accounts.find((a) => a.iban === body.iban);
  if (!acc) {
    if (!state.contract.unknownIbanToSuspense) return fail(res, 404, "IBAN", "IBAN не наш");
    try {
      const journalId = postJournal({
        kind: "SUSPENSE_IN",
        ref: id,
        note: body.paymentRef || "unknown iban",
        legs: [
          { accountId: "acc_nostro", dc: "D", amount },
          { accountId: "acc_suspense", dc: "C", amount },
        ],
      });
      const row = {
        id,
        iban: body.iban,
        amount,
        currency: "UZS",
        paymentRef: body.paymentRef,
        journalId,
        status: "SUSPENSE",
        createdAt: now(),
      };
      state.incoming.push(row);
      state.suspense.push({ ...row, allocated: false });
      save(state);
      audit(req, 201, "iban suspense");
      return send(res, 201, row);
    } catch (e) {
      return fail(res, 409, e.code || "JOURNAL", e.message);
    }
  }
  try {
    const journalId = creditIncoming(acc, amount, id, body.paymentRef || "incoming");
    const row = { id, iban: acc.iban, amount, currency: acc.currency, paymentRef: body.paymentRef, journalId, status: "POSTED", createdAt: now() };
    state.incoming.push(row);
    save(state);
    audit(req, 201, "iban in");
    return send(res, 201, row);
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
}

function allocateSuspense(req, res, id, body) {
  const row = (state.suspense ?? []).find((s) => s.id === id);
  if (!row) return fail(res, 404, "NOT_FOUND", "Suspence не найден");
  if (row.allocated) return fail(res, 409, "STATE", "Уже разнесён");
  const acc = state.accounts.find((a) => a.iban === body?.iban);
  if (!acc) return fail(res, 404, "IBAN", "IBAN не наш");
  try {
    row.allocJournalId = postJournal({
      kind: "SUSPENSE_ALLOC",
      ref: row.id,
      note: acc.iban,
      legs: [
        { accountId: "acc_suspense", dc: "D", amount: row.amount },
        { accountId: acc.id, dc: "C", amount: row.amount },
      ],
    });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
  row.allocated = true;
  row.allocatedIban = acc.iban;
  row.status = "ALLOCATED";
  const inc = state.incoming.find((i) => i.id === row.id);
  if (inc) inc.status = "ALLOCATED";
  save(state);
  audit(req, 200, "suspense alloc");
  send(res, 200, row);
}

function bankOutgoing(req, res, body) {
  const w = state.wallets.find((x) => x.id === body?.fromWalletId);
  if (!w) return fail(res, 404, "WALLET", "Кошелёк не найден");
  const acc = account(w.accountId);
  const amount = Number(body?.amount);
  if (!body?.iban || !(amount > 0)) return fail(res, 400, "FIELDS", "iban, amount");
  const avail = acc.ledger - openHoldSum(acc.id);
  if (avail < amount) return fail(res, 409, "INSUFFICIENT", "available", { available: avail });
  const id = nextId("out");
  const hold = { id: nextId("hld"), accountId: acc.id, paymentId: id, amount, status: "OPEN", createdAt: now() };
  state.holds.push(hold);
  const row = {
    id,
    fromAccountId: acc.id,
    iban: body.iban,
    amount,
    currency: acc.currency,
    purpose: body.purpose || null,
    holdId: hold.id,
    status: "PENDING_BANK",
    createdAt: now(),
  };
  state.outgoing.push(row);
  save(state);
  audit(req, 201, "iban out hold");
  send(res, 201, { ...row, available: avail - amount });
}

function buildMt103(row, acc) {
  const d = now().slice(2, 10).replace(/-/g, "");
  return [
    "{1:F01MALOUZ22AXXX0000000000}",
    "{2:I103ORNTUZ22XXXXN}",
    "{4:",
    `:20:${row.id}`,
    `:32A:${d}${row.currency}${row.amount},`,
    `:50K:/${acc?.iban || ""}`,
    `${acc?.name || "MALO CUSTOMER"}`,
    `:59:/${row.iban}`,
    `:70:${row.purpose || "TRANSFER"}`,
    "-}",
  ].join("\n");
}

function bankAck(req, res, id, body) {
  const row = state.outgoing.find((o) => o.id === id);
  if (!row) return fail(res, 404, "NOT_FOUND", "Исходящий не найден");
  if (row.status !== "PENDING_BANK") return fail(res, 409, "STATE", row.status);
  const hold = state.holds.find((h) => h.id === row.holdId);
  const result = body?.result === "rejected" ? "rejected" : "posted";
  if (result === "rejected") {
    if (hold) hold.status = "RELEASED";
    row.status = "REJECTED";
    save(state);
    audit(req, 200, "iban out reject");
    return send(res, 200, row);
  }
  try {
    row.journalId = postJournal({
      kind: "IBAN_OUT",
      ref: row.id,
      note: row.iban,
      legs: [
        { accountId: row.fromAccountId, dc: "D", amount: row.amount },
        { accountId: "acc_nostro", dc: "C", amount: row.amount },
      ],
    });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
  if (hold) hold.status = "CAPTURED";
  row.status = "POSTED";
  row.mt103 = buildMt103(row, account(row.fromAccountId));
  save(state);
  audit(req, 200, "iban out posted");
  send(res, 200, row);
}

function salaryIngest(req, res, body) {
  if (!body || body.__parseError) return fail(res, 400, "BAD_JSON", "Тело не JSON");
  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (!rows.length) return fail(res, 400, "ROWS", "rows[]");
  const fileName = body.fileName || nextId("salfile");
  if (state.contract.salaryFileOnce) {
    const prev = (state.salary ?? []).find((s) => s.fileName === fileName);
    if (prev) return fail(res, 409, "DUPLICATE_FILE", "Этот файл уже грузили", { existingId: prev.id });
  }
  const sum = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const trailer = Number(body.trailerSum);
  if (state.contract.salaryTrailerMustMatch && sum !== trailer) {
    return fail(res, 400, "TRAILER", "сумма строк ≠ trailer", { sum, trailer });
  }
  const id = nextId("sal");
  const posted = [];
  try {
    for (const row of rows) {
      const amount = Number(row.amount);
      const acc = state.accounts.find((a) => a.iban === row.iban);
      if (!acc) {
        posted.push({ iban: row.iban, amount, status: "REJECTED", reason: "IBAN" });
        continue;
      }
      const journalId = creditIncoming(acc, amount, id, fileName, "SALARY");
      posted.push({ iban: acc.iban, amount, status: "POSTED", journalId });
    }
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
  const file = {
    id,
    fileName,
    trailerSum: trailer,
    rowSum: sum,
    trailerOk: sum === trailer,
    status: "POSTED",
    rows: posted,
    createdAt: now(),
  };
  state.salary.push(file);
  save(state);
  audit(req, 201, "salary");
  send(res, 201, file);
}

function fxConvert(req, res, body) {
  const fromW = state.wallets.find((w) => w.id === body?.fromWalletId);
  const toW = state.wallets.find((w) => w.id === body?.toWalletId);
  if (!fromW || !toW) return fail(res, 404, "WALLET", "from/to кошелёк");
  const from = account(fromW.accountId);
  const to = account(toW.accountId);
  if (from.currency === to.currency) return fail(res, 409, "CCY", "Нужны разные валюты");
  if (!(from.currency === "UZS" && to.currency === "USD")) {
    return fail(res, 409, "PAIR", "Сейчас пет меняет только UZS → USD");
  }
  const amountTo = Number(body?.amountTo);
  if (!(amountTo > 0)) return fail(res, 400, "AMOUNT", "amountTo > 0 (USD)");
  const pair = state.fx.find((f) => f.pair === "USD/UZS");
  const rate = Number(pair?.rate || 12650);
  const spreadBps = Number(state.contract.fxSpreadBps || 0);
  const mid = Math.round(amountTo * rate);
  const spread = Math.round((mid * spreadBps) / 10000);
  const uzsDebit = mid + spread;
  const avail = from.ledger - openHoldSum(from.id);
  if (avail < uzsDebit) return fail(res, 409, "INSUFFICIENT", "available UZS", { available: avail, need: uzsDebit });
  const id = nextId("fx");
  try {
    const uzsJ = postJournal({
      kind: "FX_UZS",
      ref: id,
      note: `USD ${amountTo} @ ${rate}`,
      legs: spread
        ? [
            { accountId: from.id, dc: "D", amount: uzsDebit },
            { accountId: "acc_fx_uzs", dc: "C", amount: mid },
            { accountId: "acc_fee", dc: "C", amount: spread, note: "fx spread" },
          ]
        : [
            { accountId: from.id, dc: "D", amount: mid },
            { accountId: "acc_fx_uzs", dc: "C", amount: mid },
          ],
    });
    const usdJ = postJournal({
      kind: "FX_USD",
      ref: id,
      note: `buy ${amountTo} USD`,
      legs: [
        { accountId: "acc_fx_usd", dc: "D", amount: amountTo },
        { accountId: to.id, dc: "C", amount: amountTo },
      ],
    });
    const deal = {
      id,
      pair: "USD/UZS",
      rate,
      spreadBps,
      amountUsd: amountTo,
      amountUzs: uzsDebit,
      spread,
      uzsJournalId: uzsJ,
      usdJournalId: usdJ,
      status: "POSTED",
      createdAt: now(),
    };
    state.fxDeals.push(deal);
    save(state);
    audit(req, 201, "fx");
    return send(res, 201, { deal, trial: trialBalance() });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message, { byCurrency: e.byCurrency });
  }
}

function clearingSettle(req, res) {
  const merch = account("acc_merchant");
  const amount = merch.ledger;
  if (!(amount > 0)) return fail(res, 409, "NOTHING", "Мерчанту нечего селить — сначала capture", { ledger: amount });
  const id = nextId("clr");
  try {
    const journalId = postJournal({
      kind: "CLEARING_SETTLE",
      ref: id,
      note: "T+1 merchant payout",
      legs: [
        { accountId: "acc_merchant", dc: "D", amount },
        { accountId: "acc_nostro", dc: "C", amount },
      ],
    });
    const row = { id, amount, journalId, status: "SETTLED", createdAt: now() };
    state.clearing.push(row);
    save(state);
    audit(req, 201, "clearing");
    return send(res, 201, { ...row, trial: trialBalance() });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
}

function reverseJournal(req, res, id) {
  const j = state.journals.find((x) => x.id === id);
  if (!j) return fail(res, 404, "NOT_FOUND", "Журнал не найден");
  if (j.reversedBy) return fail(res, 409, "STATE", "Уже сторнирован");
  const legs = state.ledger.filter((l) => l.journalId === id && liveLeg(l));
  if (!legs.length) return fail(res, 409, "EMPTY", "Нет ног");
  try {
    const rid = postJournal({
      kind: `${j.kind}_REV`,
      ref: j.ref,
      note: `storno ${j.id}`,
      legs: legs.map((l) => ({ accountId: l.accountId, dc: l.dc === "D" ? "C" : "D", amount: l.amount })),
    });
    j.reversedBy = rid;
    save(state);
    audit(req, 200, "storno");
    return send(res, 200, { original: j, reverseId: rid, trial: trialBalance() });
  } catch (e) {
    return fail(res, 409, e.code || "JOURNAL", e.message);
  }
}

function exportRecon() {
  const rows = state.payments
    .filter((p) => p.kind === "CARD" && ["CAPTURED", "REFUNDED", "CHARGEBACK"].includes(p.status) && p.rrn)
    .map((p) => ({
      rrn: p.rrn,
      amount: p.capturedAmount ?? p.amount,
      merchant: p.toAccountId,
      status: p.status,
      capturedAt: p.capturedAt || p.createdAt,
    }));
  return { source: "malo", generatedAt: now(), rows };
}

function ingestRecon(req, res, body) {
  const ours = exportRecon().rows;
  const incoming = body?.rows ?? [];
  const byRrn = Object.fromEntries(ours.map((r) => [r.rrn, r]));
  const items = incoming.map((row) => {
    const mine = byRrn[row.rrn];
    if (!mine) return { ...row, result: "UNKNOWN_RRN" };
    if (Number(row.amount) !== Number(mine.amount)) return { ...row, result: "MISMATCH", ours: mine.amount };
    return { ...row, result: "MATCH" };
  });
  for (const o of ours) {
    if (!incoming.some((r) => r.rrn === o.rrn)) items.push({ rrn: o.rrn, amount: o.amount, result: "MISSING_IN_FILE" });
  }
  const run = { id: nextId("rcn"), source: body?.source || "partner", at: now(), items };
  state.recon.unshift(run);
  save(state);
  audit(req, 200, "recon");
  send(res, 200, run);
}

function startKyc(req, res, body) {
  if (!body?.customer) return fail(res, 400, "CUSTOMER", "customer обязателен");
  const key = header(req, "idempotency-key");
  if (key) {
    const prev = state.kyc.find((k) => k.idempotencyKey === key);
    if (prev) return send(res, 200, prev);
  }
  const row = { id: nextId("kyc"), customer: body.customer, status: "PENDING", reason: "новая заявка", idempotencyKey: key || null, createdAt: now() };
  state.kyc.push(row);
  save(state);
  audit(req, 201, "kyc start");
  send(res, 201, row);
}

function decideKyc(req, res, id, body) {
  const row = state.kyc.find((k) => k.id === id);
  if (!row) return fail(res, 404, "NOT_FOUND", "KYC не найден");
  if (!["APPROVED", "REJECTED"].includes(body?.status)) return fail(res, 400, "STATUS", "APPROVED или REJECTED");
  row.status = body.status;
  row.reason = body?.reason ?? null;
  row.decidedAt = now();
  save(state);
  audit(req, 200, `kyc ${row.status}`);
  send(res, 200, row);
}

function createOrder(req, res, body) {
  const key = header(req, "idempotency-key");
  if (state.contract.orderIdempotencyRequired && !key) return fail(res, 400, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key обязателен");
  if (key) {
    const prev = state.orders.find((o) => o.idempotencyKey === key);
    if (prev) {
      if (state.contract.transferDuplicateHttp === 409) return send(res, 409, { error: { code: "DUPLICATE" }, existingId: prev.id });
      return send(res, 200, prev);
    }
  }
  const sku = state.stock.find((s) => s.sku === body?.sku);
  if (!sku) return fail(res, 404, "SKU", "Нет SKU");
  const qty = Number(body?.qty) || 1;
  if (sku.qty < qty) return fail(res, 409, "STOCK", "Нет остатка", { qty: sku.qty });
  sku.qty -= qty;
  const order = { id: nextId("ord"), sku: sku.sku, qty, sellerId: body?.sellerId ?? null, status: "CREATED", idempotencyKey: key || null, createdAt: now() };
  state.orders.push(order);
  save(state);
  audit(req, 201, "order");
  send(res, 201, order);
}

function snapshot() {
  const tb = trialBalance();
  const annaDebits5k = state.ledger.filter((l) => l.accountId === "acc_anna" && l.kind === "P2P" && l.dc === "D" && l.amount === 5000).length;
  return {
    contract: state.contract,
    wallets: state.wallets.map(walletView),
    accounts: tb.rows,
    trial: tb,
    kyc: state.kyc,
    plastic: state.plastic,
    transfers: state.transfers,
    payments: state.payments,
    holds: state.holds,
    journals: state.journals,
    ledger: state.ledger,
    cards: state.cards,
    incoming: state.incoming,
    outgoing: state.outgoing,
    recon: state.recon,
    fx: state.fx,
    fxDeals: state.fxDeals,
    salary: state.salary,
    suspense: state.suspense,
    clearing: state.clearing,
    orders: state.orders,
    stock: state.stock,
    audit: state.audit,
    missions: {
      reproducedDouble: annaDebits5k >= 2,
      contractShipped:
        state.contract.transferIdempotencyRequired === true &&
        Number(state.contract.transferDuplicateHttp) === 409 &&
        state.contract.errorInBody === false,
      kycHonest: state.contract.kycIsMaster === true,
      acsHonest: state.contract.acsTimeoutStatus === "UNKNOWN",
      orderSafe: state.contract.orderIdempotencyRequired === true,
      capturedHold:
        state.contract.holdThenCapture === true &&
        state.payments.some((p) => p.holdId && ["CAPTURED", "REFUNDED", "CHARGEBACK"].includes(p.status)),
      refundHole: state.ledger.some((l) => l.kind === "REFUND_HOLE") && tb.balanced === false,
      refundClean: state.payments.some((p) => p.status === "REFUNDED" && p.refundJournalId) && tb.balanced === true,
      incomingPosted: state.incoming.some((i) => i.status === "POSTED"),
      reconMismatch: state.recon.some((r) => r.items?.some((i) => i.result === "MISMATCH" || i.result === "UNKNOWN_RRN")),
      fxPosted: (state.fxDeals ?? []).some((d) => d.status === "POSTED"),
      salaryPosted: (state.salary ?? []).some((s) => s.status === "POSTED"),
      clearingSettled: (state.clearing ?? []).some((c) => c.status === "SETTLED"),
      partialCaptured: state.payments.some((p) => p.status === "CAPTURED" && p.capturedAmount && p.capturedAmount < p.amount),
      suspensePosted: (state.suspense ?? []).some((s) => s.status === "SUSPENSE" || s.status === "ALLOCATED"),
      mt103Issued: (state.outgoing ?? []).some((o) => o.status === "POSTED" && o.mt103),
    },
  };
}

export function handleApi(req, res, next) {
  const url = req.url || "";
  if (!url.startsWith("/api")) return next();
  route(req, res).catch((err) => {
    send(res, 500, { error: { code: "CRASH", message: String(err?.message || err) } });
  });
}

export function maloApiPlugin() {
  return {
    name: "malo-api",
    configureServer(server) {
      server.middlewares.use(handleApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApi);
    },
  };
}
