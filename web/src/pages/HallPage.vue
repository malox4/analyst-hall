<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useAuth } from "../stores/auth";
import { useProgress } from "../stores/progress";
import PlanCompare from "../components/PlanCompare.vue";
import { extrasForLevel } from "../content/path";

const auth = useAuth();
const progress = useProgress();

onMounted(() => progress.load());

const grades = computed(() => progress.catalog?.grades || []);
const lessons = computed(() => progress.catalog?.lessons || []);
const internOpen = computed(() => lessons.value.find((l) => l.id === "intern-1-profession"));

function doneOn(level) {
  const ids = level.moduleIds || [];
  if (!ids.length) return 0;
  return Math.round((ids.filter((id) => progress.isDone(id)).length / ids.length) * 100);
}

const ticker = [
  "Intern открыт",
  "пет · SQL · запросы",
  "холд ≠ проводка",
  "журнал = откуда / куда",
  "учебный банк /api/v1",
  "триал 3 дня",
];
</script>

<template>
  <div>
    <section class="card relative px-6 py-10 md:px-10 md:py-14">
      <p class="kicker">intern → senior</p>
      <h1 class="font-display mt-4 max-w-3xl text-5xl leading-[0.92] md:text-7xl">
        Зал аналитика.<br />Доска и стол.
      </h1>
      <span class="section-rule" aria-hidden="true" />
      <p class="mt-5 max-w-xl text-[17px] leading-7 text-mute">
        48 уроков с доской и столом. На каждом этаже — материалы пути, не отдельная витрина сбоку.
        Рядом пет, практика по трекам и собеседование. Учебный банк на
        <span class="font-mono text-ink">/api/v1</span> можно читать всегда; писать — на PRO и в триале.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <RouterLink
          :to="internOpen ? `/lesson/${internOpen.id}` : '/level/intern-1'"
          class="btn btn-accent"
        >
          Открыть первый урок
        </RouterLink>
        <RouterLink to="/materials" class="btn btn-ghost">Материалы</RouterLink>
        <RouterLink to="/pet" class="btn btn-ghost">Пет</RouterLink>
        <RouterLink to="/interview" class="btn btn-ghost">Собес</RouterLink>
      </div>
      <div class="mt-10 overflow-hidden border-t border-line pt-4">
        <div class="ticker-track flex w-max gap-10 font-mono text-[12px] text-mute">
          <span v-for="(t, i) in [...ticker, ...ticker]" :key="i">{{ t }}</span>
        </div>
      </div>
    </section>

    <div class="mt-10 space-y-12">
      <section v-for="g in grades" :key="g.id">
        <div class="flex items-end justify-between gap-4">
          <div>
            <div class="stamp stamp-ink">{{ g.roman }}</div>
            <h2 class="font-display mt-2 text-3xl md:text-4xl">{{ g.title }}</h2>
            <span class="section-rule" aria-hidden="true" />
            <p class="mt-2 max-w-xl text-sm text-mute">{{ g.tagline }}</p>
          </div>
          <span v-if="!auth.canGrade(g.id)" class="stamp stamp-solid">PRO</span>
        </div>
        <div class="catalog-grid mt-6 md:grid-cols-3">
          <RouterLink
            v-for="lv in g.levels"
            :key="lv.id"
            :to="`/level/${lv.id}`"
            class="card card-hover p-5"
          >
            <div class="flex items-center justify-between">
              <span class="stamp stamp-ink">{{ lv.hours }}</span>
              <span class="plate-n">{{ doneOn(lv) }}%</span>
            </div>
            <div class="mt-3 h-1 overflow-hidden bg-line">
              <div class="h-full bg-accent" :style="{ width: doneOn(lv) + '%' }" />
            </div>
            <div class="mt-4 font-display text-2xl leading-none">{{ lv.title }}</div>
            <p class="mt-2 text-sm leading-6 text-mute">{{ lv.subtitle }}</p>
            <p class="mt-3 font-mono text-[11px] text-accent">
              {{ (lv.moduleIds || []).length }} уроков
              <span v-if="(lv.materialIds || extrasForLevel(lv.id)).length">
                · {{ (lv.materialIds || extrasForLevel(lv.id)).length }} материалов пути
              </span>
            </p>
          </RouterLink>
        </div>
        <div v-if="g.id === 'intern'" class="catalog-grid mt-6 md:grid-cols-2 lg:grid-cols-3">
          <RouterLink to="/pet" class="card card-hover p-5">
            <span class="stamp stamp-case">пет</span>
            <div class="font-display mt-3 text-2xl">Учебный банк зала</div>
            <p class="mt-2 text-sm leading-6 text-mute">Консоль, SQL-лаба и журнал запросов. Intern читает. Запись — в PRO.</p>
          </RouterLink>
          <RouterLink to="/practice" class="card card-hover p-5">
            <span class="stamp">практика</span>
            <div class="font-display mt-3 text-2xl">Лабы и удары по банку</div>
            <p class="mt-2 text-sm leading-6 text-mute">Ночная смена, квесты, лабы по трекам: YAML, SQL, RACI, сага. Не только стол в уроке.</p>
          </RouterLink>
          <RouterLink to="/interview" class="card card-hover p-5">
            <span class="stamp stamp-case">собес</span>
            <div class="font-display mt-3 text-2xl">Вопрос со стола</div>
            <p class="mt-2 text-sm leading-6 text-mute">Ответ двигает доску. Intern открыт. Расширенный банк — в PRO.</p>
          </RouterLink>
          <RouterLink to="/live" class="card card-hover p-5">
            <span class="stamp">live</span>
            <div class="font-display mt-3 text-2xl">Сессия на оценку</div>
            <p class="mt-2 text-sm leading-6 text-mute">Витрина блоков и спокойный запуск. Уровень — в профиле.</p>
          </RouterLink>
          <RouterLink to="/materials" class="card card-hover p-5">
            <span class="stamp stamp-ink">материалы</span>
            <div class="font-display mt-3 text-2xl">Треки с нуля</div>
            <p class="mt-2 text-sm leading-6 text-mute">Требования, REST, SQL, OpenAPI, сага, SLO. Карточки стоят на этажах intern→senior.</p>
          </RouterLink>
        </div>
      </section>
    </div>

    <PlanCompare class="mt-16" :cta="false" />
  </div>
</template>
