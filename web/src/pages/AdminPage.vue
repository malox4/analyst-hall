<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { getJSON } from "../lib/http";
import { useAuth } from "../stores/auth";

const auth = useAuth();
const tab = ref("users");
const q = ref("");
const err = ref("");
const busy = ref("");
const storeMode = ref("");
const users = ref([]);
const practice = ref([]);
const notes = reactive({});
const scores = reactive({});

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase();
  return users.value.filter((u) => {
    if (!needle) return true;
    return [u.name, u.email, u.plan, u.role, accessLabel(u)]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
});

const stats = computed(() => {
  const items = users.value;
  return {
    all: items.length,
    pro: items.filter((u) => u.plan === "pro" || u.role === "admin").length,
    trial: items.filter((u) => u.trialActive).length,
    intern: items.filter((u) => !u.isPro).length,
  };
});

const practiceView = computed(() => {
  const items = [...practice.value];
  items.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  if (q.value.trim()) {
    const needle = q.value.trim().toLowerCase();
    return items.filter((p) =>
      [p.title, p.email, p.author, p.kind, p.status, p.body].join(" ").toLowerCase().includes(needle),
    );
  }
  return items;
});

function accessLabel(u) {
  if (u.role === "admin") return "хозяин";
  if (u.plan === "pro") return "PRO";
  if (u.trialActive) return "триал";
  return "intern";
}

function trialLeft(u) {
  const sec = Number(u.trialRemaining || 0);
  if (!u.trialActive || sec <= 0) return "";
  const days = Math.floor(sec / 86400);
  if (days >= 1) return `${days}д`;
  const hours = Math.max(1, Math.ceil(sec / 3600));
  return `${hours}ч`;
}

function fail(data, fallback) {
  return data?.error?.message || fallback;
}

async function loadUsers() {
  const { ok, data } = await getJSON("/api/admin/users");
  if (!ok) {
    err.value = fail(data, "Не удалось открыть кассу.");
    return;
  }
  users.value = data.items || [];
  storeMode.value = data.store || "";
}

async function loadPractice() {
  const { ok, data } = await getJSON("/api/admin/practice");
  if (!ok) {
    err.value = fail(data, "Не удалось открыть очередь практики.");
    return;
  }
  practice.value = data.items || [];
  for (const item of practice.value) {
    if (notes[item.id] == null) notes[item.id] = item.reviewer_note || "";
    if (scores[item.id] == null) scores[item.id] = item.score ?? "";
  }
}

async function load() {
  err.value = "";
  await Promise.all([loadUsers(), loadPractice()]);
}

async function patchUser(id, body) {
  busy.value = id;
  err.value = "";
  const { ok, data } = await getJSON(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  busy.value = "";
  if (!ok) {
    err.value = fail(data, "Доступ не выдан.");
    return;
  }
  const next = data.user;
  users.value = users.value.map((u) => (u.id === next.id ? next : u));
}

function grantPro(u) {
  return patchUser(u.id, { plan: "pro" });
}

function grantFree(u) {
  return patchUser(u.id, { plan: "free", trialDays: 0 });
}

function grantTrial(u) {
  return patchUser(u.id, { trialDays: 3 });
}

function setRole(u, role) {
  return patchUser(u.id, { role });
}

async function review(item, status) {
  busy.value = item.id;
  err.value = "";
  const scoreRaw = scores[item.id];
  const payload = { status, note: notes[item.id] || "" };
  if (scoreRaw !== "" && scoreRaw != null) payload.score = Number(scoreRaw);
  const { ok, data } = await getJSON(`/api/admin/practice/${item.id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  busy.value = "";
  if (!ok) {
    err.value = fail(data, "Разбор не сохранился.");
    return;
  }
  const next = data.item || item;
  practice.value = practice.value.map((p) => (p.id === item.id ? { ...p, ...next } : p));
}

onMounted(load);
</script>

<template>
  <div>
    <p class="kicker">касса</p>
    <h1 class="font-display mt-3 text-4xl leading-[0.95] md:text-6xl">Доступы зала</h1>
    <span class="section-rule" aria-hidden="true" />
    <p class="mt-4 max-w-2xl text-[17px] leading-7 text-mute">
      Хозяин выдаёт PRO, снимает его и открывает 3 дня триала. Intern остаётся на чтении. Очередь практики — здесь же.
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <span class="stamp stamp-ink">всего {{ stats.all }}</span>
      <span class="stamp stamp-solid">PRO {{ stats.pro }}</span>
      <span class="stamp">триал {{ stats.trial }}</span>
      <span class="stamp stamp-case">intern {{ stats.intern }}</span>
    </div>

    <div class="mt-8 flex flex-wrap gap-2">
      <button type="button" class="tab-plate" :class="{ 'is-on': tab === 'users' }" @click="tab = 'users'">
        Ученики
      </button>
      <button type="button" class="tab-plate" :class="{ 'is-on': tab === 'practice' }" @click="tab = 'practice'">
        Практика
      </button>
    </div>

    <label class="mt-6 block max-w-md text-sm font-medium">
      Поиск
      <input
        v-model="q"
        class="mt-1 w-full border-b-2 border-ink bg-transparent py-2 outline-none"
        :placeholder="tab === 'users' ? 'имя, почта, тариф' : 'работа, автор, статус'"
      />
    </label>

    <p v-if="err" class="mt-4 text-sm text-bad">{{ err }}</p>
    <p v-if="storeMode === 'file'" class="mt-4 max-w-2xl text-sm text-bad">
      Сейчас учётки в файле контейнера. На Railway они пропадают при рестарте. Подключите Postgres и DATABASE_URL — иначе касса пустая после каждого деплоя.
    </p>

    <ul v-if="tab === 'users'" class="mt-8 space-y-4">
      <li v-for="u in filtered" :key="u.id" class="card px-5 py-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-display text-2xl leading-none">{{ u.name }}</h2>
              <span class="stamp" :class="u.role === 'admin' ? 'stamp-solid' : u.isPro ? 'stamp-ok' : 'stamp-ink'">
                {{ accessLabel(u) }}
              </span>
              <span v-if="u.trialActive" class="stamp">осталось {{ trialLeft(u) }}</span>
            </div>
            <p class="mt-2 text-sm text-mute">{{ u.email }} · {{ u.plan }} · {{ u.role }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="btn btn-accent btn-sm"
              :disabled="busy === u.id || u.plan === 'pro'"
              @click="grantPro(u)"
            >
              Выдать PRO
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="busy === u.id || u.role === 'admin'"
              @click="grantTrial(u)"
            >
              Триал 3 дня
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="busy === u.id || u.role === 'admin' || (u.plan === 'free' && !u.trialActive)"
              @click="grantFree(u)"
            >
              Intern
            </button>
            <button
              v-if="u.role !== 'admin'"
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="busy === u.id"
              @click="setRole(u, 'admin')"
            >
              Хозяин
            </button>
            <button
              v-else-if="u.id !== auth.user?.id"
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="busy === u.id"
              @click="setRole(u, 'student')"
            >
              Снять хозяина
            </button>
          </div>
        </div>
      </li>
      <li v-if="!filtered.length" class="text-sm text-mute">Никого не нашли.</li>
    </ul>

    <ul v-else class="mt-8 space-y-4">
      <li v-for="item in practiceView" :key="item.id" class="card px-5 py-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="stamp" :class="item.status === 'reviewed' ? 'stamp-ok' : 'stamp-ink'">{{ item.status }}</span>
          <span class="stamp stamp-ink">{{ item.kind }}</span>
        </div>
        <h2 class="font-display mt-3 text-2xl">{{ item.title || "Без названия" }}</h2>
        <p class="mt-1 text-sm text-mute">{{ item.author }} · {{ item.email }}</p>
        <p class="mt-3 whitespace-pre-wrap text-[15px] leading-7">{{ item.body }}</p>
        <div class="mt-4 flex flex-wrap items-end gap-3">
          <label class="text-sm font-medium">
            Балл
            <input v-model="scores[item.id]" type="number" min="0" max="100" class="mt-1 w-20 border-b-2 border-ink bg-transparent py-1 outline-none" />
          </label>
          <label class="min-w-[12rem] flex-1 text-sm font-medium">
            Заметка
            <input v-model="notes[item.id]" class="mt-1 w-full border-b-2 border-ink bg-transparent py-1 outline-none" />
          </label>
          <button type="button" class="btn btn-accent btn-sm" :disabled="busy === item.id" @click="review(item, 'reviewed')">
            Принять
          </button>
          <button type="button" class="btn btn-ghost btn-sm" :disabled="busy === item.id" @click="review(item, 'submitted')">
            Вернуть
          </button>
        </div>
      </li>
      <li v-if="!practiceView.length" class="text-sm text-mute">Очередь пуста.</li>
    </ul>
  </div>
</template>
