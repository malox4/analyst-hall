<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import BoardView from "../components/BoardView.vue";
import { applyPlay } from "../lib/playFx";
import { getJSON } from "../lib/http";
import { useAuth } from "../stores/auth";
import { useProgress } from "../stores/progress";

const auth = useAuth();
const progress = useProgress();
const route = useRoute();
const router = useRouter();

const tab = computed(() => {
  const t = String(route.query.tab || "console");
  if (t === "requests" || t === "api") return "api";
  if (t === "sql") return "sql";
  return "console";
});

function setTab(id) {
  router.replace({ path: "/pet", query: { tab: id } });
}

const trial = ref(null);
const wallets = ref([]);
const holds = ref([]);
const journals = ref([]);
const last = ref(null);
const err = ref("");
const fx = ref({});

const board = {
  kind: "flow",
  title: "Учебный банк зала",
  caption: "Учебное ядро: витрина, холд, журнал, перевод. SQL и запросы — соседние вкладки.",
  nodes: [
    { id: "wallet", label: "Кошелёк", sub: "available", detail: "То, что клиент может потратить: ledger минус открытые холды." },
    { id: "hold", label: "Холд", sub: "OPEN", mood: "hold", detail: "Резерв на кассе. Денег в журнале ещё нет." },
    { id: "journal", label: "Журнал", sub: "DR / CR", detail: "Книга: откуда ушли, куда пришли. Один journalId на операцию." },
    { id: "p2p", label: "P2P", sub: "перевод", detail: "Анна → Борис. Без ключа повтор может пройти дважды — учебный баг." },
  ],
  edges: [
    { from: "wallet", to: "hold", note: "auth" },
    { from: "hold", to: "journal", note: "capture" },
    { from: "journal", to: "p2p", note: "книга" },
  ],
};

async function refresh() {
  const [t, w, h, j] = await Promise.all([
    getJSON("/api/v1/ledger/trial-balance"),
    getJSON("/api/v1/wallets"),
    getJSON("/api/v1/holds"),
    getJSON("/api/v1/ledger/journals"),
  ]);
  trial.value = t.data;
  wallets.value = w.data.items || [];
  holds.value = h.data.items || [];
  journals.value = (j.data.items || []).slice(-8).reverse();
}

async function call(label, path, body, hit, method = "POST", headers = {}) {
  err.value = "";
  const { ok, status, data } = await getJSON(path, {
    method,
    headers,
    body: method === "GET" ? undefined : JSON.stringify(body || {}),
  });
  last.value = { label, status, data, path, method };
  if (!ok && data.error) err.value = data.error.message;
  fx.value = applyPlay(board, {
    good: ok,
    why: ok ? label + " · " + status : err.value || String(status),
    hit: hit || (ok ? "journal" : "wallet"),
    lights: ok ? { [hit || "journal"]: hit === "hold" ? "hold" : "ok" } : undefined,
    broken: ok ? [] : [hit || "wallet"],
  });
  await refresh();
}

function p2p() {
  return call("P2P 5000", "/api/v1/transfers", { fromWalletId: "wal_anna", toWalletId: "wal_boris", amount: 5000, currency: "UZS" }, "p2p");
}
function hold() {
  return call("Auth 12000", "/api/v1/cards/authorize", { walletId: "wal_boris", cardId: "crd_boris", amount: 12000, currency: "UZS" }, "hold");
}
function iban() {
  return call("IBAN in 25000", "/api/v1/bank/incoming", { iban: "UZ12MALO000000000001", amount: 25000, currency: "UZS" }, "journal");
}

const sqlTasks = ref([]);
const sqlSchema = ref([]);
const sqlText = ref("SELECT id, name, currency, available FROM intern_wallets");
const sqlOut = ref(null);
const sqlErr = ref("");
const activeTask = ref(null);
const internSql = ref(true);

const explorer = ref([]);
const group = ref("Счета");
const openRoute = ref(null);
const bodyText = ref("");
const headerKey = ref("");
const runOut = ref(null);

const groups = computed(() => {
  const g = [];
  for (const row of explorer.value) {
    if (!g.includes(row.group)) g.push(row.group);
  }
  return g;
});

const grouped = computed(() => explorer.value.filter((r) => r.group === group.value));
const activeDoc = computed(() => explorer.value.find((r) => r.path === openRoute.value && r.method === (activeMethod.value || r.method)) || grouped.value[0]);
const activeMethod = ref("");

watch(grouped, (rows) => {
  if (rows[0] && !rows.some((r) => r.path === openRoute.value)) {
    pickDoc(rows[0]);
  }
});

function pickDoc(row) {
  openRoute.value = row.path;
  activeMethod.value = row.method;
  bodyText.value = row.example ? JSON.stringify(row.example, null, 2) : "";
  headerKey.value = row.headers?.["Idempotency-Key"] || "";
  runOut.value = null;
}

async function loadSql() {
  const [t, sch] = await Promise.all([getJSON("/api/sql/tasks"), getJSON("/api/sql/schema")]);
  sqlTasks.value = t.data.items || [];
  internSql.value = Boolean(t.data.intern);
  sqlSchema.value = sch.data.tables || [];
}

async function loadExplorer() {
  const { data } = await getJSON("/api/explorer");
  explorer.value = data.items || [];
  if (explorer.value[0]) pickDoc(explorer.value[0]);
}

async function runSql(check) {
  sqlErr.value = "";
  sqlOut.value = null;
  const path = check ? "/api/sql/check" : "/api/sql/run";
  const payload = { sql: sqlText.value };
  if (check && activeTask.value) payload.taskId = activeTask.value;
  const { ok, data } = await getJSON(path, { method: "POST", body: JSON.stringify(payload) });
  sqlOut.value = data;
  if (!ok) sqlErr.value = data.error || data.error?.message || "Запрос не прошёл.";
  if (check && data.ok) await loadSql();
}

function useTask(t) {
  activeTask.value = t.id;
  sqlText.value = t.hint?.includes("SELECT") ? t.hint : sqlText.value;
}

async function runDoc() {
  const doc = activeDoc.value;
  if (!doc) return;
  let path = doc.path;
  let body;
  try {
    body = bodyText.value.trim() ? JSON.parse(bodyText.value) : {};
  } catch {
    runOut.value = { error: "Тело не JSON." };
    return;
  }
  const headers = {};
  if (headerKey.value) headers["Idempotency-Key"] = headerKey.value;
  const { status, data } = await getJSON(path, {
    method: doc.method,
    headers,
    body: doc.method === "GET" ? undefined : JSON.stringify(body),
  });
  runOut.value = { status, data };
  await refresh();
}

onMounted(async () => {
  await progress.load();
  await refresh();
  await loadSql();
  await loadExplorer();
});

const anna = computed(() => wallets.value.find((w) => w.id === "wal_anna"));
const boris = computed(() => wallets.value.find((w) => w.id === "wal_boris"));
</script>

<template>
  <div>
    <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">Analyst Hall · учебный банк</p>
    <h1 class="font-display mt-2 text-4xl md:text-6xl">Пет-проект ядра</h1>
    <p class="mt-3 max-w-2xl text-[17px] leading-7 text-mute">
      Живая база клиентов, холдов, журнала, IBAN и FX — как на столе BA/SA. Консоль бьёт по ядру.
      SQL — задачки с линии. Запросы — объяснение каждого метода, не сырой swagger.
    </p>

    <div class="mt-6 flex flex-wrap gap-2">
      <button type="button" class="tab-plate" :class="tab === 'console' ? 'is-on' : ''" @click="setTab('console')">Консоль</button>
      <button type="button" class="tab-plate" :class="tab === 'sql' ? 'is-on' : ''" @click="setTab('sql')">SQL</button>
      <button type="button" class="tab-plate" :class="tab === 'api' ? 'is-on' : ''" @click="setTab('api')">Запросы</button>
      <RouterLink to="/practice?drill=p2p" class="btn btn-ghost btn-sm">Практика P2P</RouterLink>
    </div>

    <div v-if="tab === 'console'" class="mt-8">
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="card rounded-[24px] p-5">
          <div class="font-mono text-[11px] text-mute">Анна available</div>
          <div class="font-display mt-2 text-4xl">{{ anna?.available ?? "—" }}</div>
          <div class="mt-1 font-mono text-[11px] text-mute">{{ anna?.currency }} · hold {{ anna?.hold ?? 0 }}</div>
        </div>
        <div class="card rounded-[24px] p-5">
          <div class="font-mono text-[11px] text-mute">Борис available</div>
          <div class="font-display mt-2 text-4xl">{{ boris?.available ?? "—" }}</div>
          <div class="mt-1 font-mono text-[11px] text-mute">{{ boris?.currency }} · hold {{ boris?.hold ?? 0 }}</div>
        </div>
        <div class="card rounded-[24px] p-5">
          <div class="font-mono text-[11px] text-mute">Пробный баланс UZS</div>
          <div class="font-display mt-2 text-4xl" :class="trial?.balanced ? 'text-ok' : 'text-bad'">
            {{ trial?.balanced ? "0" : trial?.diff ?? "—" }}
          </div>
          <div class="mt-1 font-mono text-[11px] text-mute">DR {{ trial?.debit }} / CR {{ trial?.credit }}</div>
        </div>
      </div>

      <div class="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.9fr)]">
        <BoardView :board="board" :fx="fx" />
        <section class="card rounded-[28px] p-5">
          <h2 class="font-display text-2xl">Ударить по банку</h2>
          <p class="mt-2 text-sm leading-6 text-mute">Кнопки живые. На Intern запись вернёт PLAN — это граница, не серая кнопка.</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" class="btn btn-accent btn-sm" @click="p2p">P2P 5000</button>
            <button type="button" class="btn btn-sm" @click="hold">Холд / auth</button>
            <button type="button" class="btn btn-ghost btn-sm" @click="iban">IBAN входящий</button>
            <button type="button" class="btn btn-ghost btn-sm" @click="refresh">Обновить</button>
          </div>
          <p v-if="!auth.isPro" class="mt-3 text-sm text-mute">Сейчас чтение. PRO или триал откроет POST.</p>
          <p v-if="err" class="mt-2 text-sm text-bad">{{ err }}</p>
          <p v-if="last" class="mt-2 font-mono text-[12px] text-mute">{{ last.label }} · HTTP {{ last.status }}</p>
        </section>
      </div>

      <div class="mt-8 grid gap-4 md:grid-cols-2">
        <section class="card rounded-[24px] p-5">
          <h2 class="font-medium">Кошельки</h2>
          <ul class="mt-3 space-y-2 text-sm">
            <li v-for="w in wallets" :key="w.id" class="flex justify-between border-b border-line py-2">
              <span>{{ w.name }}</span>
              <span class="font-mono">{{ w.available }} {{ w.currency }}</span>
            </li>
          </ul>
        </section>
        <section class="card rounded-[24px] p-5">
          <h2 class="font-medium">Открытые холды</h2>
          <p v-if="!holds.length" class="mt-3 text-sm text-mute">Пока пусто — или сид ещё грузится.</p>
          <ul v-else class="mt-3 space-y-2 text-sm">
            <li v-for="h in holds" :key="h.id" class="flex justify-between border-b border-line py-2 font-mono text-[12px]">
              <span>{{ h.id }} · {{ h.status }}</span>
              <span>{{ h.amount }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div v-else-if="tab === 'sql'" class="mt-8 grid gap-5 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.2fr)]">
      <aside class="card max-h-[74vh] space-y-2 overflow-auto rounded-[28px] p-3">
        <p class="px-2 pt-2 font-mono text-[10px] uppercase tracking-widest text-mute">Задачи с линии</p>
        <button
          v-for="t in sqlTasks"
          :key="t.id"
          type="button"
          class="w-full rounded-2xl px-3 py-3 text-left text-sm"
          :class="activeTask === t.id ? 'bg-ink text-white' : 'text-mute hover:bg-paper'"
          @click="useTask(t)"
        >
          <div class="font-mono text-[10px] uppercase tracking-widest" :class="activeTask === t.id ? 'text-white/50' : 'text-accent'">
            {{ t.grade }} <span v-if="t.locked">· PRO</span> <span v-if="t.gold">· эталон открыт</span>
          </div>
          <div class="mt-1 leading-5">{{ t.title }}</div>
        </button>
      </aside>
      <div class="space-y-4">
        <section v-if="sqlTasks.find((t) => t.id === activeTask)" class="card rounded-[28px] p-5">
          <p class="font-mono text-[10px] uppercase tracking-widest text-accent">Как пришло с линии</p>
          <p class="mt-2 text-[16px] leading-7">{{ sqlTasks.find((t) => t.id === activeTask).story }}</p>
          <p class="mt-4 font-medium">{{ sqlTasks.find((t) => t.id === activeTask).question }}</p>
          <p class="mt-3 text-sm text-mute">Подсказка: {{ sqlTasks.find((t) => t.id === activeTask).hint }}</p>
          <p class="mt-2 text-sm leading-6">{{ sqlTasks.find((t) => t.id === activeTask).why }}</p>
        </section>
        <section class="card rounded-[28px] p-5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-display text-2xl">Запрос</h2>
            <span class="font-mono text-[11px] text-mute">{{ internSql ? "Intern: витрины intern_*" : "PRO: полная лаба" }}</span>
          </div>
          <textarea v-model="sqlText" rows="8" class="mt-3 w-full rounded-2xl border border-line bg-white/90 px-3 py-2 font-mono text-[13px] leading-6 outline-none focus:border-accent" />
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="btn btn-accent btn-sm" @click="runSql(false)">Выполнить</button>
            <button type="button" class="btn btn-sm" :disabled="!activeTask" @click="runSql(true)">Проверить задачу</button>
          </div>
          <p class="mt-2 text-[12px] text-mute">DROP / TRUNCATE / ALTER отрежутся. DML в PRO остаётся в песочнице запроса.</p>
          <p v-if="sqlErr" class="mt-2 text-sm text-bad">{{ sqlErr }}</p>
          <p v-if="sqlOut?.why" class="mt-2 text-[15px] leading-7">{{ sqlOut.why }}</p>
          <p v-if="sqlOut?.gold" class="mt-2 font-mono text-[12px] leading-5 text-mute">Эталон: {{ sqlOut.gold }}</p>
          <div v-if="sqlOut?.rows || sqlOut?.result?.rows" class="mt-4 overflow-auto">
            <table class="w-full text-left font-mono text-[12px]">
              <thead>
                <tr>
                  <th v-for="c in (sqlOut.columns || sqlOut.result?.columns || Object.keys((sqlOut.rows || sqlOut.result?.rows || [])[0] || {}))" :key="c" class="border-b border-line py-1 pr-3">{{ c }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in (sqlOut.rows || sqlOut.result?.rows || [])" :key="i">
                  <td v-for="c in (sqlOut.columns || sqlOut.result?.columns || Object.keys(row))" :key="c" class="border-b border-line py-1 pr-3">{{ row[c] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="card rounded-[24px] p-5">
          <h3 class="font-medium">Таблицы лабы</h3>
          <ul class="mt-3 space-y-2 text-sm text-mute">
            <li v-for="t in sqlSchema" :key="t.name"><span class="font-mono text-ink">{{ t.name }}</span> · {{ t.cols }}</li>
          </ul>
        </section>
      </div>
    </div>

    <div v-else class="mt-8 grid gap-5 lg:grid-cols-[minmax(240px,0.85fr)_minmax(0,1.25fr)]">
      <aside class="space-y-3">
        <div class="flex flex-wrap gap-1">
          <button v-for="g in groups" :key="g" type="button" class="tab-plate" :class="group === g ? 'is-on' : ''" @click="group = g">{{ g }}</button>
        </div>
        <div class="card max-h-[68vh] space-y-1 overflow-auto rounded-[28px] p-3">
          <button
            v-for="row in grouped"
            :key="row.method + row.path"
            type="button"
            class="w-full rounded-2xl px-3 py-3 text-left text-sm"
            :class="activeDoc?.path === row.path && activeDoc?.method === row.method ? 'bg-ink text-white' : 'hover:bg-paper'"
            @click="pickDoc(row)"
          >
            <div class="font-mono text-[10px] uppercase tracking-widest opacity-60">{{ row.method }}</div>
            <div class="mt-1 leading-5">{{ row.title }}</div>
          </button>
        </div>
      </aside>
      <div v-if="activeDoc" class="space-y-4">
        <section class="card rounded-[28px] p-5 md:p-6">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{{ activeDoc.group }} · {{ activeDoc.method }} {{ activeDoc.path }}</p>
          <h2 class="font-display mt-2 text-3xl">{{ activeDoc.title }}</h2>
          <p class="mt-3 text-[16px] leading-7">{{ activeDoc.when }}</p>
          <p class="mt-4 text-sm leading-6 text-mute"><span class="font-medium text-ink">Доступ. </span>{{ activeDoc.auth }}</p>
          <p class="mt-3 text-sm leading-6"><span class="font-medium">Что в базе. </span>{{ activeDoc.db }}</p>
          <p v-if="activeDoc.errors" class="mt-3 text-sm leading-6"><span class="font-medium">Типичные 4xx. </span>{{ activeDoc.errors }}</p>
          <p v-if="activeDoc.bug" class="mt-3 rounded-2xl bg-bad/8 px-4 py-3 text-sm leading-6">{{ activeDoc.bug }}</p>
          <label class="mt-5 block text-sm font-medium">
            Тело
            <textarea v-model="bodyText" rows="7" class="mt-2 w-full rounded-2xl border border-line bg-white px-3 py-2 font-mono text-[12px] leading-5 outline-none focus:border-accent" />
          </label>
          <label class="mt-3 block text-sm font-medium">
            Idempotency-Key
            <input v-model="headerKey" class="mt-2 w-full rounded-2xl border border-line bg-white px-3 py-2 font-mono text-[13px] outline-none focus:border-accent" />
          </label>
          <button type="button" class="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white" @click="runDoc">Выполнить</button>
          <pre v-if="runOut" class="mt-4 max-h-64 overflow-auto font-mono text-[12px] leading-5 text-mute">{{ JSON.stringify(runOut, null, 2) }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>
