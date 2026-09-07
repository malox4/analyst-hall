<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import BoardView from "../components/BoardView.vue";
import BriefingPanel from "../components/BriefingPanel.vue";

const route = useRoute();
const boards = ref([]);
const current = ref(null);
const err = ref("");

const id = computed(() => route.params.id);

async function loadList() {
  const cat = await fetch("/api/catalog", { credentials: "include" }).then((r) => r.json());
  boards.value = cat.boards || [];
}

async function loadBoard(bid) {
  err.value = "";
  const res = await fetch(`/api/boards/${bid}`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) {
    err.value = data.error?.message || "Закрыто";
    current.value = null;
    return;
  }
  current.value = data;
}

onMounted(async () => {
  await loadList();
  const first = id.value || boards.value.find((b) => b.id === "hold-capture")?.id || boards.value[0]?.id;
  if (first) await loadBoard(first);
});

watch(id, (v) => {
  if (v) loadBoard(v);
});
</script>

<template>
  <div>
    <p class="font-mono text-[11px] uppercase tracking-[0.22em] text-mute">Схемы · без video</p>
    <h1 class="font-display mt-2 text-4xl md:text-6xl">Доски</h1>
    <p class="mt-3 max-w-xl text-[17px] leading-7 text-mute">
      Клик по узлу. Стрелка — действие. Hold не проводка. Картинка без цифр нам не нужна.
    </p>
    <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="b in boards"
        :key="b.id"
        :to="`/boards/${b.id}`"
        class="card card-hover rounded-[24px] p-4"
        :class="(id || current?.id) === b.id ? 'border-accent' : ''"
      >
        <div class="font-mono text-[11px] text-mute">{{ b.minutes }} мин · {{ b.grade }}</div>
        <div class="mt-1 font-medium">{{ b.title }}</div>
        <p class="mt-1 text-sm leading-6 text-mute">{{ b.teaser }}</p>
      </RouterLink>
    </div>
    <p v-if="err" class="mt-6 text-bad">{{ err }}</p>
    <div v-else-if="current?.board" class="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.9fr)]">
      <BoardView :board="current.board" />
      <BriefingPanel :why="current.why" :facts="current.facts" :scene="current.scene" :trap="current.trap" />
    </div>
  </div>
</template>
