<script setup>
import { computed } from "vue";
import Infographic from "./Infographic.vue";

const props = defineProps({
  primer: { type: Object, required: true },
});

const beats = computed(() => {
  const p = props.primer || {};
  const list = [];
  if (p.what) list.push({ id: "primer-what", n: "01", label: "что это" });
  if (p.purpose) list.push({ id: "primer-purpose", n: "02", label: "для чего" });
  if (p.how) list.push({ id: "primer-how", n: "03", label: "как" });
  if (p.example) list.push({ id: "primer-example", n: "04", label: "пример" });
  if (p.mistakes) list.push({ id: "primer-mistakes", n: "05", label: "ошибки" });
  if (p.practice) list.push({ id: "primer-practice", n: "06", label: "закрепление" });
  return list;
});
</script>

<template>
  <article v-if="primer" class="primer-article">
    <nav v-if="beats.length" class="article-rail" aria-label="Содержание статьи">
      <a v-for="b in beats" :key="b.id" :href="'#' + b.id">
        <span class="block">{{ b.n }}</span>
        {{ b.label }}
      </a>
    </nav>
    <div class="primer-col">
      <section v-if="primer.what" id="primer-what" class="primer-block">
        <span class="stamp">что это</span>
        <h2>{{ primer.what.title }}</h2>
        <p v-for="(p, i) in (primer.what.paragraphs || []).slice(0, 2)" :key="'w' + i">{{ p }}</p>
        <Infographic v-if="primer.what.infographic" :fig="primer.what.infographic" />
        <p v-for="(p, i) in (primer.what.paragraphs || []).slice(2)" :key="'w2' + i">{{ p }}</p>
      </section>
      <section v-if="primer.purpose" id="primer-purpose" class="primer-block">
        <span class="stamp">для чего</span>
        <h2>{{ primer.purpose.title }}</h2>
        <p v-for="(p, i) in primer.purpose.paragraphs" :key="'p' + i">{{ p }}</p>
        <Infographic v-if="primer.purpose.infographic" :fig="primer.purpose.infographic" />
      </section>
      <section v-if="primer.how" id="primer-how" class="primer-block">
        <span class="stamp">как</span>
        <h2>{{ primer.how.title }}</h2>
        <p v-if="primer.how.intro">{{ primer.how.intro }}</p>
        <Infographic v-if="primer.how.infographic" :fig="primer.how.infographic" />
        <ol v-if="primer.how.steps?.length">
          <li v-for="(s, i) in primer.how.steps" :key="'h' + i">{{ s }}</li>
        </ol>
      </section>
      <section v-if="primer.example" id="primer-example" class="primer-block">
        <span class="stamp">пример</span>
        <h2>{{ primer.example.title }}</h2>
        <h3 v-if="primer.example.heading">{{ primer.example.heading }}</h3>
        <p v-for="(p, i) in (primer.example.paragraphs || (primer.example.body ? [primer.example.body] : [])).slice(0, 1)" :key="'e' + i">{{ p }}</p>
        <Infographic v-if="primer.example.infographic" :fig="primer.example.infographic" />
        <p v-for="(p, i) in (primer.example.paragraphs || (primer.example.body ? [primer.example.body] : [])).slice(1)" :key="'e2' + i">{{ p }}</p>
        <p v-if="primer.example.note" class="primer-note">{{ primer.example.note }}</p>
      </section>
      <section v-if="primer.mistakes" id="primer-mistakes" class="primer-block">
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
      <section v-if="primer.practice" id="primer-practice" class="primer-block primer-drill">
        <span class="stamp stamp-solid">закрепление</span>
        <h2>{{ primer.practice.title }}</h2>
        <p v-for="(p, i) in (primer.practice.paragraphs || (primer.practice.body ? [primer.practice.body] : []))" :key="'d' + i">{{ p }}</p>
        <slot name="drill" />
      </section>
    </div>
  </article>
</template>
