<script setup>
import { computed } from "vue";
import Infographic from "./Infographic.vue";

const props = defineProps({
  primer: { type: Object, required: true },
  /** all | head (term+about) | rest (purpose→practice) */
  part: { type: String, default: "all" },
});

function hasText(block) {
  if (!block) return false;
  if (block.paragraphs?.length) return true;
  if (block.intro || block.heading || block.body) return true;
  if (block.steps?.length) return true;
  if (block.items?.length || block.cases?.length) return true;
  if (block.infographic) return true;
  return false;
}

const beats = computed(() => {
  const p = props.primer || {};
  const list = [];
  if (termParas.value.length) list.push({ id: "primer-term", n: "01", label: "термин" });
  if (aboutParas.value.length || aboutFig.value) list.push({ id: "primer-about", n: "02", label: "о чём это" });
  if (hasText(p.purpose)) list.push({ id: "primer-purpose", n: "03", label: "для чего" });
  if (hasText(p.how)) list.push({ id: "primer-how", n: "04", label: "как" });
  if (hasText(p.example)) list.push({ id: "primer-example", n: "05", label: "пример" });
  if (hasText(p.mistakes)) list.push({ id: "primer-mistakes", n: "06", label: "ошибки" });
  if (hasText(p.practice)) list.push({ id: "primer-practice", n: "07", label: "закрепление" });
  return list;
});

const termParas = computed(() => {
  const p = props.primer || {};
  if (p.term?.paragraphs?.length) return p.term.paragraphs;
  const w = p.what?.paragraphs || [];
  return w.slice(0, 1);
});

const aboutParas = computed(() => {
  const p = props.primer || {};
  if (p.about?.paragraphs?.length) return p.about.paragraphs;
  if (p.term?.paragraphs?.length) return [];
  const w = p.what?.paragraphs || [];
  return w.slice(1);
});

const aboutFig = computed(() => props.primer?.about?.infographic || props.primer?.what?.infographic || null);
const termTitle = computed(() => props.primer?.term?.title || "Термин");
const aboutTitle = computed(() => props.primer?.about?.title || "О чём это");

const showHead = computed(() => props.part === "all" || props.part === "head");
const showRest = computed(() => props.part === "all" || props.part === "rest");
const showRail = computed(() => props.part === "all" || props.part === "head");
</script>

<template>
  <article v-if="primer" class="primer-article">
    <nav v-if="showRail && beats.length" class="article-rail" aria-label="Содержание статьи">
      <a v-for="b in beats" :key="b.id" :href="'#' + b.id">
        <span class="block">{{ b.n }}</span>
        {{ b.label }}
      </a>
    </nav>
    <div class="primer-col">
      <section v-if="showHead && termParas.length" id="primer-term" class="primer-block">
        <span class="stamp">термин</span>
        <h2>{{ termTitle }}</h2>
        <p v-for="(p, i) in termParas" :key="'t' + i">{{ p }}</p>
      </section>

      <section v-if="showHead && (aboutParas.length || aboutFig)" id="primer-about" class="primer-block">
        <span class="stamp">о чём это</span>
        <h2>{{ aboutTitle }}</h2>
        <p v-for="(p, i) in aboutParas" :key="'a' + i">{{ p }}</p>
        <Infographic v-if="aboutFig" :fig="aboutFig" />
      </section>

      <section v-if="showRest && primer.purpose" id="primer-purpose" class="primer-block">
        <span class="stamp">для чего</span>
        <h2>{{ primer.purpose.title }}</h2>
        <p v-for="(p, i) in primer.purpose.paragraphs" :key="'p' + i">{{ p }}</p>
        <Infographic v-if="primer.purpose.infographic" :fig="primer.purpose.infographic" />
      </section>

      <section v-if="showRest && primer.how" id="primer-how" class="primer-block">
        <span class="stamp">как</span>
        <h2>{{ primer.how.title }}</h2>
        <p v-if="primer.how.intro">{{ primer.how.intro }}</p>
        <ol v-if="primer.how.steps?.length">
          <li v-for="(s, i) in primer.how.steps" :key="'h' + i">{{ s }}</li>
        </ol>
        <Infographic v-if="primer.how.infographic" :fig="primer.how.infographic" />
      </section>

      <section v-if="showRest && primer.example" id="primer-example" class="primer-block">
        <span class="stamp">пример</span>
        <h2>{{ primer.example.title }}</h2>
        <h3 v-if="primer.example.heading">{{ primer.example.heading }}</h3>
        <p
          v-for="(p, i) in primer.example.paragraphs || (primer.example.body ? [primer.example.body] : [])"
          :key="'e' + i"
        >
          {{ p }}
        </p>
        <Infographic v-if="primer.example.infographic" :fig="primer.example.infographic" />
        <p v-if="primer.example.note" class="primer-note">{{ primer.example.note }}</p>
      </section>

      <section v-if="showRest && primer.mistakes" id="primer-mistakes" class="primer-block">
        <span class="stamp stamp-case">ошибки</span>
        <h2>{{ primer.mistakes.title }}</h2>
        <p v-if="primer.mistakes.intro">{{ primer.mistakes.intro }}</p>
        <div v-for="(m, i) in primer.mistakes.items || []" :key="'m' + i" class="primer-item">
          <h3>{{ m.title }}</h3>
          <p>{{ m.body }}</p>
        </div>
        <div v-for="(c, i) in primer.mistakes.cases || []" :key="'c' + i" class="primer-case">
          <span class="stamp stamp-case">кейс</span>
          <h3>{{ c.title }}</h3>
          <p><strong>Что сломалось.</strong> {{ c.broke }}</p>
          <p><strong>Почему.</strong> {{ c.why }}</p>
          <p><strong>Что сделать.</strong> {{ c.should }}</p>
        </div>
      </section>

      <section v-if="showRest && primer.practice" id="primer-practice" class="primer-block primer-drill">
        <span class="stamp stamp-solid">закрепление</span>
        <h2>{{ primer.practice.title }}</h2>
        <p
          v-for="(p, i) in primer.practice.paragraphs || (primer.practice.body ? [primer.practice.body] : [])"
          :key="'d' + i"
        >
          {{ p }}
        </p>
        <slot name="drill" />
      </section>
    </div>
  </article>
</template>
