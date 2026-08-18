import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE_FILE = path.join(ROOT, "data", "malo-wallet.json");

function seed() {
  return {
    contract: {
      transferIdempotencyRequired: false,
      transferDuplicateHttp: 200,
      errorInBody: true,
      kycIsMaster: false,
      acsTimeoutStatus: "SUCCESS",
      orderIdempotencyRequired: false,
    },
    wallets: [
      { id: "wal_anna", customer: "anna", name: "Анна", balance: 150000, currency: "UZS", status: "ACTIVE" },
      { id: "wal_boris", customer: "boris", name: "Борис", balance: 80000, currency: "UZS", status: "ACTIVE" },
    ],
    kyc: [
      { id: "kyc_anna", customer: "anna", status: "PENDING", reason: "ожидание документов" },
      { id: "kyc_boris", customer: "boris", status: "APPROVED", reason: null },
    ],
    transfers: [],
    ledger: [],
    cards: [],
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
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
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
    path: req.url.split("?")[0],
    status,
    note,
    key: header(req, "idempotency-key") || null,
  });
  state.audit = state.audit.slice(0, 80);
}

function walletView(w) {
  const kyc = state.kyc.find((k) => k.customer === w.customer);
  if (state.contract.kycIsMaster && kyc && kyc.status !== "APPROVED") {
    return { ...w, status: "PENDING_KYC", kyc: kyc.status };
  }
  return { ...w, kyc: kyc?.status ?? null };
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

export const OPENAPI = {
  openapi: "3.0.3",
  info: {
    title: "Malo Wallet + ShopLine (живой пет-контур)",
    version: "0.1.0",
    description:
      "Реальный HTTP на том же хосте, что академия. Контракт по умолчанию сломан: без ключа P2P плодит проводки, ACS тишина = SUCCESS, KYC не master. PUT /api/v1/contract меняет поведение продукта. Postman: http://localhost:8080/api/v1",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/wallets": { get: { summary: "Список кошельков", operationId: "listWallets" } },
    "/wallets/{id}": { get: { summary: "Кошелёк", operationId: "getWallet" } },
    "/ledger": { get: { summary: "Проводки ledger", operationId: "listLedger" } },
    "/transfers": {
      post: {
        summary: "P2P перевод",
        operationId: "createTransfer",
        parameters: [{ name: "Idempotency-Key", in: "header", required: false, schema: { type: "string" } }],
      },
    },
    "/kyc": { get: { summary: "Заявки KYC", operationId: "listKyc" } },
    "/kyc/start": { post: { summary: "Старт KYC", operationId: "startKyc" } },
    "/kyc/{id}/decide": { post: { summary: "Решение KYC (APPROVED/REJECTED)", operationId: "decideKyc" } },
    "/cards/authorize": { post: { summary: "Авторизация карты / 3DS", operationId: "authorizeCard" } },
    "/contract": {
      get: { summary: "Текущий контракт продукта", operationId: "getContract" },
      put: { summary: "Выкатить контракт — меняет живое поведение API", operationId: "putContract" },
    },
    "/shopline/orders": { post: { summary: "Guest ShopLine: создать заказ", operationId: "createOrder" } },
    "/shopline/stock": { get: { summary: "Guest ShopLine: остатки", operationId: "listStock" } },
    "/state": { get: { summary: "Снимок контура", operationId: "getState" } },
    "/reset": { post: { summary: "Сбросить пет к заводским багам", operationId: "reset" } },
  },
};

export const CATALOG = [
  {
    id: "get-wallets",
    method: "GET",
    path: "/api/v1/wallets",
    title: "Кошельки",
    hint: "Анна ACTIVE при KYC PENDING — баг, пока kycIsMaster=false.",
    headers: {},
    body: "",
  },
  {
    id: "post-p2p",
    method: "POST",
    path: "/api/v1/transfers",
    title: "P2P без ключа",
    hint: "Повторите дважды — в ledger станет две SUCCESS.",
    headers: {},
    body: JSON.stringify({ fromWalletId: "wal_anna", toWalletId: "wal_boris", amount: 5000, currency: "UZS" }, null, 2),
  },
  {
    id: "post-p2p-key",
    method: "POST",
    path: "/api/v1/transfers",
    title: "P2P с Idempotency-Key",
    hint: "Один ключ, два вызова. Пока контракт не починен — всё равно две проводки.",
    headers: { "Idempotency-Key": "tap-441" },
    body: JSON.stringify({ fromWalletId: "wal_anna", toWalletId: "wal_boris", amount: 5000, currency: "UZS" }, null, 2),
  },
  {
    id: "put-contract",
    method: "PUT",
    path: "/api/v1/contract",
    title: "Выкатить контракт",
    hint: "Это и есть влияние на пет: после PUT поведение API меняется.",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      {
        transferIdempotencyRequired: true,
        transferDuplicateHttp: 409,
        errorInBody: false,
        kycIsMaster: true,
        acsTimeoutStatus: "UNKNOWN",
        orderIdempotencyRequired: true,
      },
      null,
      2,
    ),
  },
  {
    id: "kyc-start",
    method: "POST",
    path: "/api/v1/kyc/start",
    title: "Старт KYC",
    hint: "Два POST без ключа = две заявки.",
    headers: {},
    body: JSON.stringify({ customer: "anna" }, null, 2),
  },
  {
    id: "kyc-ok",
    method: "POST",
    path: "/api/v1/kyc/kyc_anna/decide",
    title: "Одобрить KYC Анны",
    hint: "После kycIsMaster кошелёк перестанет врать ACTIVE.",
    headers: {},
    body: JSON.stringify({ status: "APPROVED" }, null, 2),
  },
  {
    id: "acs",
    method: "POST",
    path: "/api/v1/cards/authorize",
    title: "3DS, ACS молчит",
    hint: "X-ACS-Timeout: 1. Контракт решает SUCCESS vs UNKNOWN.",
    headers: { "X-ACS-Timeout": "1" },
    body: JSON.stringify({ walletId: "wal_boris", amount: 12000, currency: "UZS" }, null, 2),
  },
  {
    id: "order",
    method: "POST",
    path: "/api/v1/shopline/orders",
    title: "ShopLine заказ",
    hint: "Гость. Два POST без ключа режут склад дважды.",
    headers: {},
    body: JSON.stringify({ sku: "SKU-200", qty: 1, sellerId: "sel_42" }, null, 2),
  },
  {
    id: "stock",
    method: "GET",
    path: "/api/v1/shopline/stock",
    title: "Остатки ShopLine",
    headers: {},
    body: "",
  },
  {
    id: "ledger",
    method: "GET",
    path: "/api/v1/ledger",
    title: "Ledger",
    headers: {},
    body: "",
  },
  {
    id: "reset",
    method: "POST",
    path: "/api/v1/reset",
    title: "Сброс пета",
    hint: "Вернуть заводские баги.",
    headers: {},
    body: "{}",
  },
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

  if (p === "/api/openapi.json" || p === "/api/v1/openapi.json") {
    send(res, 200, OPENAPI);
    return;
  }
  if (p === "/api/v1/catalog" && m === "GET") {
    send(res, 200, { catalog: CATALOG, contract: state.contract });
    return;
  }
  if (p === "/api/health") {
    send(res, 200, { ok: true, product: "malo-wallet", brokenByDefault: true });
    return;
  }
  if (p === "/api/v1/state" && m === "GET") {
    send(res, 200, snapshot());
    return;
  }
  if (p === "/api/v1/reset" && m === "POST") {
    state = seed();
    save(state);
    audit(req, 200, "reset");
    send(res, 200, { ok: true, state: snapshot() });
    return;
  }
  if (p === "/api/v1/contract" && m === "GET") {
    send(res, 200, state.contract);
    return;
  }
  if (p === "/api/v1/contract" && (m === "PUT" || m === "PATCH")) {
    const body = await readBody(req);
    if (!body || body.__parseError) return fail(res, 400, "BAD_JSON", "Тело не JSON");
    const allowed = [
      "transferIdempotencyRequired",
      "transferDuplicateHttp",
      "errorInBody",
      "kycIsMaster",
      "acsTimeoutStatus",
      "orderIdempotencyRequired",
    ];
    for (const k of allowed) {
      if (body[k] !== undefined) state.contract[k] = body[k];
    }
    if (![200, 409].includes(Number(state.contract.transferDuplicateHttp))) {
      state.contract.transferDuplicateHttp = 200;
    }
    if (!["SUCCESS", "UNKNOWN"].includes(state.contract.acsTimeoutStatus)) {
      state.contract.acsTimeoutStatus = "SUCCESS";
    }
    save(state);
    audit(req, 200, "contract shipped");
    send(res, 200, { ok: true, contract: state.contract });
    return;
  }
  if (p === "/api/v1/wallets" && m === "GET") {
    send(res, 200, { items: state.wallets.map(walletView) });
    return;
  }
  const wal = p.match(/^\/api\/v1\/wallets\/([^/]+)$/);
  if (wal && m === "GET") {
    const w = state.wallets.find((x) => x.id === wal[1]);
    if (!w) return fail(res, 404, "NOT_FOUND", "Кошелёк не найден");
    send(res, 200, walletView(w));
    return;
  }
  if (p === "/api/v1/ledger" && m === "GET") {
    send(res, 200, { items: state.ledger });
    return;
  }
  if (p === "/api/v1/transfers" && m === "POST") {
    return createTransfer(req, res, await readBody(req));
  }
  if (p === "/api/v1/kyc" && m === "GET") {
    send(res, 200, { items: state.kyc });
    return;
  }
  if (p === "/api/v1/kyc/start" && m === "POST") {
    return startKyc(req, res, await readBody(req));
  }
  const dec = p.match(/^\/api\/v1\/kyc\/([^/]+)\/decide$/);
  if (dec && m === "POST") {
    return decideKyc(req, res, dec[1], await readBody(req));
  }
  if (p === "/api/v1/cards/authorize" && m === "POST") {
    return authorizeCard(req, res, await readBody(req));
  }
  if (p === "/api/v1/shopline/stock" && m === "GET") {
    send(res, 200, { items: state.stock });
    return;
  }
  if (p === "/api/v1/shopline/orders" && m === "POST") {
    return createOrder(req, res, await readBody(req));
  }

  fail(res, 404, "NO_ROUTE", `Нет ${m} ${p}`);
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
      if (code === 409) {
        return send(res, 409, {
          error: { code: "DUPLICATE", message: "Перевод с этим ключом уже есть" },
          existingId: prev.id,
        });
      }
      return send(res, 200, prev);
    }
  }
  const from = state.wallets.find((w) => w.id === body.fromWalletId);
  const to = state.wallets.find((w) => w.id === body.toWalletId);
  if (!from || !to) return fail(res, 404, "WALLET", "from/to кошелёк не найден");
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return fail(res, 400, "AMOUNT", "amount > 0");
  if (from.balance < amount) return fail(res, 409, "INSUFFICIENT", "Недостаточно средств", { balance: from.balance });

  from.balance -= amount;
  to.balance += amount;
  const id = nextId("tr");
  const tx = {
    id,
    fromWalletId: from.id,
    toWalletId: to.id,
    amount,
    currency: body.currency || "UZS",
    status: "SUCCESS",
    idempotencyKey: key || null,
    createdAt: now(),
  };
  state.transfers.push(tx);
  state.ledger.push(
    { id: nextId("ld"), txId: id, walletId: from.id, delta: -amount, currency: tx.currency, at: tx.createdAt },
    { id: nextId("ld"), txId: id, walletId: to.id, delta: amount, currency: tx.currency, at: tx.createdAt },
  );
  save(state);
  audit(req, 201, "transfer created");
  send(res, 201, tx);
}

function startKyc(req, res, body) {
  if (!body?.customer) return fail(res, 400, "CUSTOMER", "customer обязателен");
  const key = header(req, "idempotency-key");
  if (key) {
    const prev = state.kyc.find((k) => k.idempotencyKey === key);
    if (prev) {
      audit(req, 200, "kyc dup key");
      return send(res, 200, prev);
    }
  }
  const row = {
    id: nextId("kyc"),
    customer: body.customer,
    status: "PENDING",
    reason: "новая заявка",
    idempotencyKey: key || null,
    createdAt: now(),
  };
  state.kyc.push(row);
  save(state);
  audit(req, 201, "kyc start");
  send(res, 201, row);
}

function decideKyc(req, res, id, body) {
  const row = state.kyc.find((k) => k.id === id);
  if (!row) return fail(res, 404, "NOT_FOUND", "KYC не найден");
  const status = body?.status;
  if (!["APPROVED", "REJECTED"].includes(status)) return fail(res, 400, "STATUS", "APPROVED или REJECTED");
  row.status = status;
  row.reason = body?.reason ?? null;
  row.decidedAt = now();
  save(state);
  audit(req, 200, `kyc ${status}`);
  send(res, 200, row);
}

function authorizeCard(req, res, body) {
  const timeout = header(req, "x-acs-timeout") === "1" || body?.acsTimeout === true;
  const status = timeout ? state.contract.acsTimeoutStatus : "SUCCESS";
  const row = {
    id: nextId("auth"),
    walletId: body?.walletId,
    amount: Number(body?.amount) || 0,
    currency: body?.currency || "UZS",
    acs: timeout ? "TIMEOUT" : "OK",
    status,
    createdAt: now(),
  };
  state.cards.push(row);
  if (status === "SUCCESS") {
    const w = state.wallets.find((x) => x.id === row.walletId);
    if (w && row.amount > 0) {
      w.balance -= row.amount;
      state.ledger.push({
        id: nextId("ld"),
        txId: row.id,
        walletId: w.id,
        delta: -row.amount,
        currency: row.currency,
        at: row.createdAt,
        note: timeout ? "ACS timeout but SUCCESS" : "card auth",
      });
    }
  }
  save(state);
  audit(req, 200, `card ${status}`);
  send(res, 200, row);
}

function createOrder(req, res, body) {
  const key = header(req, "idempotency-key");
  if (state.contract.orderIdempotencyRequired && !key) {
    return fail(res, 400, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key обязателен");
  }
  if (key) {
    const prev = state.orders.find((o) => o.idempotencyKey === key);
    if (prev) {
      if (state.contract.transferDuplicateHttp === 409) {
        return send(res, 409, { error: { code: "DUPLICATE" }, existingId: prev.id });
      }
      return send(res, 200, prev);
    }
  }
  const sku = state.stock.find((s) => s.sku === body?.sku);
  if (!sku) return fail(res, 404, "SKU", "Нет SKU");
  const qty = Number(body?.qty) || 1;
  if (sku.qty < qty) return fail(res, 409, "STOCK", "Нет остатка", { qty: sku.qty });
  sku.qty -= qty;
  const order = {
    id: nextId("ord"),
    sku: sku.sku,
    qty,
    sellerId: body?.sellerId ?? null,
    status: "CREATED",
    idempotencyKey: key || null,
    createdAt: now(),
  };
  state.orders.push(order);
  save(state);
  audit(req, 201, "order");
  send(res, 201, order);
}

function snapshot() {
  const successTransfers = state.transfers.filter((t) => t.status === "SUCCESS").length;
  const doubleP2p = state.ledger.filter((l) => l.delta === -5000 && l.walletId === "wal_anna").length;
  return {
    contract: state.contract,
    wallets: state.wallets.map(walletView),
    kyc: state.kyc,
    transfers: state.transfers,
    ledger: state.ledger,
    cards: state.cards,
    orders: state.orders,
    stock: state.stock,
    audit: state.audit,
    missions: {
      reproducedDouble: doubleP2p >= 2,
      contractShipped:
        state.contract.transferIdempotencyRequired === true &&
        Number(state.contract.transferDuplicateHttp) === 409 &&
        state.contract.errorInBody === false,
      kycHonest: state.contract.kycIsMaster === true,
      acsHonest: state.contract.acsTimeoutStatus === "UNKNOWN",
      orderSafe: state.contract.orderIdempotencyRequired === true,
      successTransfers,
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
