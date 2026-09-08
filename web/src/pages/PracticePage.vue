<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import BoardView from "../components/BoardView.vue";
import DeskView from "../components/DeskView.vue";
import PaywallCard from "../components/PaywallCard.vue";
import { LABS, QUESTS, DRILLS, deskFromBlock, boardForLab, labsByCluster, drillKind, PRACTICE_CLUSTERS } from "../content/practice";
import { applyPlay } from "../lib/playFx";
import { getJSON } from "../lib/http";
import { useAuth } from "../stores/auth";
import { useProgress } from "../stores/progress";
import PrimerArticle from "../components/PrimerArticle.vue";
import { topicForLab } from "../content/topics";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const progress = useProgress();

const fx = ref({});
const last = ref(null);
const blockIdx = ref(0);
const drillLog = ref([]);
const drillErr = ref("");
const paymentId = ref("");
const wallets = ref([]);
const trial = ref(null);

onMounted(() => progress.load());
onMounted(() => {
  const id = String(route.hash || "").replace("#", "");
  if (id) document.getElementById("cluster-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
});

const labId = computed(() => String(route.query.lab || ""));
const questId = computed(() => String(route.query.quest || ""));
const drillId = computed(() => String(route.query.drill || ""));

const lab = computed(() => LABS.find((l) => l.id === labId.value));
const quest = computed(() => QUESTS.find((q) => q.id === questId.value));
const drill = computed(() => DRILLS.find((d) => d.id === drillId.value));

const labLocked = computed(() => lab.value && !auth.canLab(lab.value.gradeId));
const questLocked = computed(() => quest.value && !auth.canGrade(quest.value.gradeId));

const desk = computed(() => {
  if (quest.value) return quest.value.desk;
  if (!lab.value) return null;
  return deskFromBlock(lab.value.blocks[blockIdx.value]);
});

const board = computed(() => {
  if (drill.value) return drill.value.board;
  if (quest.value) return quest.value.board;
  if (lab.value) return boardForLab(lab.value);
  return null;
});

watch([labId, questId, drillId], () => {
  blockIdx.value = 0;
  fx.value = {};
  last.value = null;
  drillLog.value = [];
  drillErr.value = "";
});

watch(
  () => route.hash,
  (h) => {
    const id = String(h || "").replace("#", "");
    if (id) document.getElementById("cluster-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  },
);

function onPlay(ev) {
  last.value = ev;
  if (board.value) fx.value = applyPlay(board.value, ev);
}

function openHub() {
  router.push({ path: "/practice" });
}

function go(q) {
  router.push({ path: "/practice", query: q });
}

async function refreshBank() {
  const [w, t] = await Promise.all([getJSON("/api/v1/wallets"), getJSON("/api/v1/ledger/trial-balance")]);
  wallets.value = w.data.items || [];
  trial.value = t.data;
}

onMounted(refreshBank);

async function runCall(step) {
  drillErr.value = "";
  let path = step.path;
  if (step.pathFrom === "payment") {
    if (!paymentId.value) {
      drillErr.value = "Сначала сделайте списание — нужен id платежа.";
      return;
    }
    path = `/api/v1/payments/${paymentId.value}/refund`;
  }
  const opts = { method: step.method };
  if (step.body) opts.body = JSON.stringify(step.body);
  const { ok, status, data } = await getJSON(path, opts);
  drillLog.value = [{ status, ok, step: step.label, data }, ...drillLog.value].slice(0, 6);
  const pay = data.payment || data;
  if (pay?.id && String(pay.id).startsWith("pay")) paymentId.value = pay.id;
  if (data.payment?.id) paymentId.value = data.payment.id;
  if (!ok) drillErr.value = data.error?.message || "Отказ API";
  const good = ok;
  if (board.value) {
    fx.value = applyPlay(board.value, {
      good,
      why: good ? step.label + " — банк ответил " + status : drillErr.value,
      hit: good ? board.value.nodes?.[1]?.id || board.value.debit?.[0]?.id : board.value.nodes?.[0]?.id,
    });
  }
  await refreshBank();
}

const internQuests = computed(() => QUESTS.filter((q) => q.gradeId === "intern"));
const seniorQuests = computed(() => QUESTS.filter((q) => q.gradeId !== "intern"));
const clusters = computed(() => labsByCluster());
const labTopic = computed(() => topicForLab(lab.value?.id));
const labPrimer = computed(() => labTopic.value?.sections || null);
const listedLabs = computed(() => LABS.length);

function scrollCluster(id) {
  router.replace({ path: "/practice", hash: "#" + id });
  document.getElementById("cluster-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>

<template>
  <div>
    <div v-if="lab || quest || drill" class="mb-6">
      <button type="button" class="text-sm text-mute hover:text-accent" @click="openHub">← Практика</button>
    </div>

    <template v-if="!lab && !quest && !drill">
      <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">Лабы · квесты · живой пет</p>
      <h1 class="font-display mt-2 text-4xl md:text-6xl">Практика</h1>
      <p class="mt-3 max-w-2xl text-[17px] leading-7 text-mute">
        {{ listedLabs }} лабораторий по трекам: требования, данные, API, архитектура, процессы, качество, банк, софты, карьера.
        На карточке — грейд, статья и тип стола. Intern открыт. Junior+ — в PRO.
      </p>

      <section class="mt-10">
        <div class="flex items-end justify-between gap-3">
          <h2 class="font-display text-3xl">Живой пет</h2>
          <RouterLink to="/pet" class="text-sm font-medium text-accent">Консоль банка →</RouterLink>
        </div>
        <p class="mt-2 max-w-xl text-sm leading-6 text-mute">
          Читать счета можно всегда. Запись — в PRO и в трёхдневном триале. Кнопки не серые: банк сам ответит 403.
        </p>
        <div class="mt-5 grid gap-3 md:grid-cols-2">
          <button
            v-for="d in DRILLS"
            :key="d.id"
            type="button"
            class="card card-hover p-5 text-left"
            @click="go({ drill: d.id })"
          >
            <div class="font-mono text-[11px] text-accent2">{{ d.write ? "POST /api/v1" : "GET" }}</div>
            <div class="font-display mt-1 text-2xl">{{ d.title }}</div>
            <p class="mt-2 text-sm leading-6 text-mute">{{ d.teaser }}</p>
          </button>
        </div>
      </section>

      <section class="mt-12">
        <h2 class="font-display text-3xl">Лаборатории</h2>
        <p class="mt-2 text-sm text-mute">{{ listedLabs }} лаб. Intern — без PRO. Junior+ закрыты страницей тарифа, не серой кнопкой.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <a
            v-for="c in PRACTICE_CLUSTERS"
            :key="c.id"
            class="stamp stamp-ink"
            :href="'#' + c.id"
            @click.prevent="scrollCluster(c.id)"
          >{{ c.title }}</a>
        </div>
        <div v-for="c in clusters" :id="'cluster-' + c.id" :key="c.id" class="mt-10 scroll-mt-24">
          <h3 class="font-display text-2xl">{{ c.title }}</h3>
          <p class="mt-1 font-mono text-[11px] text-mute">{{ c.labs.length }} лаб</p>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <article
              v-for="l in c.labs"
              :key="l.id"
              class="card card-hover p-5 text-left"
            >
              <div class="flex flex-wrap items-center gap-2 font-mono text-[11px] text-mute">
                <span>{{ l.gradeId }}</span>
                <span>{{ drillKind(l) }}</span>
                <span>{{ l.minutes }} мин</span>
                <span v-if="!auth.canLab(l.gradeId)" class="stamp stamp-solid">PRO</span>
              </div>
              <button type="button" class="mt-1 font-display text-2xl text-left" @click="go({ lab: l.id })">{{ l.title }}</button>
              <p class="mt-2 text-sm leading-6 text-mute">{{ l.teaser }}</p>
              <div class="mt-3 flex flex-wrap gap-3 text-sm">
                <button type="button" class="font-medium text-accent" @click="go({ lab: l.id })">Стол →</button>
                <RouterLink
                  v-if="topicForLab(l.id)"
                  :to="'/materials/' + topicForLab(l.id).id"
                  class="text-mute hover:text-accent"
                >{{ topicForLab(l.id).title }}</RouterLink>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="mt-12">
        <h2 class="font-display text-3xl">Квесты</h2>
        <div class="mt-5 grid gap-3 md:grid-cols-2">
          <button
            v-for="q in internQuests"
            :key="q.id"
            type="button"
            class="card card-hover p-5 text-left"
            @click="go({ quest: q.id })"
          >
            <div class="font-mono text-[11px] text-accent">{{ q.minutes }} мин</div>
            <div class="font-display mt-1 text-2xl">{{ q.title }}</div>
            <p class="mt-2 text-sm leading-6 text-mute">{{ q.teaser }}</p>
          </button>
          <button
            v-for="q in seniorQuests"
            :key="q.id"
            type="button"
            class="card card-hover p-5 text-left"
            @click="go({ quest: q.id })"
          >
            <div class="font-mono text-[11px] text-mute">
              senior
              <span v-if="!auth.isPro" class="ml-2 stamp stamp-solid">PRO</span>
            </div>
            <div class="font-display mt-1 text-2xl">{{ q.title }}</div>
            <p class="mt-2 text-sm leading-6 text-mute">{{ q.teaser }}</p>
          </button>
        </div>
      </section>
    </template>

    <PaywallCard v-else-if="labLocked" :title="lab.title + ' — этот грейд в PRO'" />
    <PaywallCard v-else-if="questLocked" :title="quest.title + ' — в PRO'" />

    <div v-else-if="drill" class="space-y-5">
      <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{{ drill.write ? "запись /api/v1" : "чтение" }}</p>
      <h1 class="font-display text-4xl md:text-5xl">{{ drill.title }}</h1>
      <p class="max-w-xl text-[17px] leading-7 text-mute">{{ drill.explain }}</p>
      <BoardView v-if="board" :board="board" :fx="fx" />
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="card rounded-[24px] p-4">
          <div class="font-mono text-[11px] text-mute">Trial UZS</div>
          <div class="font-display mt-1 text-3xl" :class="trial?.balanced ? 'text-ok' : 'text-bad'">
            {{ trial?.balanced ? "сходится" : trial?.diff ?? "—" }}
          </div>
        </div>
        <div v-for="w in wallets.slice(0, 2)" :key="w.id" class="card rounded-[24px] p-4">
          <div class="font-mono text-[11px] text-mute">{{ w.name }}</div>
          <div class="font-display mt-1 text-3xl">{{ w.available }}</div>
          <div class="font-mono text-[11px] text-mute">hold {{ w.hold ?? 0 }}</div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in drill.read"
          :key="s.label"
          type="button"
          class="btn btn-ghost btn-sm"
          @click="runCall(s)"
        >
          {{ s.label }}
        </button>
        <button
          v-for="s in drill.writes"
          :key="s.label"
          type="button"
          class="btn btn-accent btn-sm"
          @click="runCall(s)"
        >
          {{ s.label }}
        </button>
      </div>
      <p v-if="!auth.isPro" class="text-sm text-mute">
        На Intern запись закроет API кодом PLAN. Кнопка живая — так видно границу тарифа. Полный удар — в PRO.
      </p>
      <p v-if="drillErr" class="text-sm text-bad">{{ drillErr }}</p>
      <pre v-if="drillLog[0]" class="card max-h-56 overflow-auto rounded-[24px] p-4 font-mono text-[12px] leading-5 text-mute">{{
        JSON.stringify(drillLog[0], null, 2)
      }}</pre>
    </div>

    <div v-else class="space-y-5">
      <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
        {{ lab ? lab.gradeId + " · " + lab.minutes + " мин · " + drillKind(lab) : quest.minutes + " мин" }}
      </p>
      <h1 class="font-display text-4xl md:text-5xl">{{ lab?.title || quest.title }}</h1>
      <p class="max-w-xl text-[17px] leading-7 text-mute">{{ lab?.setting || quest.teaser }}</p>
      <div v-if="labTopic" class="mt-4 flex flex-wrap gap-3 text-sm">
        <RouterLink :to="'/materials/' + labTopic.id" class="font-medium text-accent">Статья: {{ labTopic.title }} →</RouterLink>
      </div>
      <PrimerArticle v-if="labPrimer" class="mt-6" :primer="labPrimer" part="head" />
      <div v-if="lab" class="flex flex-wrap gap-2">
        <button
          v-for="(b, i) in lab.blocks"
          :key="b.title"
          type="button"
          class="tab-plate"
          :class="blockIdx === i ? 'is-on' : ''"
          @click="blockIdx = i"
        >
          {{ i + 1 }}. {{ b.title }}
        </button>
      </div>
      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,1fr)]">
        <BoardView v-if="board" :board="board" :fx="fx" />
        <DeskView v-if="desk" :desk="desk" @play="onPlay" />
      </div>
      <PrimerArticle v-if="labPrimer" class="mt-10" :primer="labPrimer" part="rest">
        <template #drill>
          <p class="text-sm text-mute">Стол выше. Неверный ход показывает почему. Переход не запирается.</p>
          <RouterLink v-if="labTopic" :to="'/materials/' + labTopic.id" class="mt-3 inline-block text-sm text-accent">← К статье</RouterLink>
        </template>
      </PrimerArticle>
    </div>
  </div>
</template>
