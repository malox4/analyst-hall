<script setup>
import { onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import SiteNav from "../components/SiteNav.vue";
import HeroFloor from "../components/HeroFloor.vue";
import Infographic from "../components/Infographic.vue";
import PlanCompare from "../components/PlanCompare.vue";
import { LANDING_PATH } from "../content/path";

const route = useRoute();

onMounted(() => {
  const id = route.hash === "#compare" ? "compare" : route.hash === "#pay" ? "pay" : "";
  if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
});

const path = LANDING_PATH;

const holdFig = {
  kind: "hold",
  ledger: 100000,
  holdAmt: 20000,
  ledgerLabel: "сумма ног журнала",
  holdLabel: "auth на кассе, проводок нет",
  availNote: "то, что клиент может потратить",
};

const openapiFig = {
  kind: "http",
  client: "Касса / Postman",
  clientSub: "ключ идемпотентности, amount",
  req: "POST /api/v1/holds",
  reqNote: "Idempotency-Key · 20000 UZS",
  res: "201  { status: OPEN }",
  resNote: "available − 20000, журнал молчит",
  server: "учебный банк зала",
  serverSub: "живой процесс, не YAML в Notion",
};

const sqlFig = {
  kind: "code",
  lead: "Окно SQL смотрит в те же кошельки, что POST.",
  body: "SELECT name, ledger, hold, available\nFROM wallets\nWHERE hold > 0;",
};

const scene = [
  { t: "до кассы", ledger: "100 000", hold: "0", avail: "100 000", n: "клиент может потратить всё" },
  { t: "auth / холд", ledger: "100 000", hold: "20 000", avail: "80 000", n: "отложено. проводок нет" },
  { t: "capture", ledger: "80 000", hold: "0", avail: "80 000", n: "журнал: DR клиент / CR мерчант" },
];

const faq = [
  {
    q: "Это GetAnalyst?",
    a: "Нет. Там поток и вебинары. Здесь зал самообучения: урок, стол, учебный банк. Нет куратора, Zoom и сертификата.",
  },
  {
    q: "Зачем платить, если Intern открыт?",
    a: "Intern — вход: уроки, чтение пета, intern-лабы, intern-собес. Платите, когда нужно писать в банк (POST /api/v1), открыть полный SQL, junior+ уроки, все 78 лаб и middle-собес.",
  },
  {
    q: "Что будет после 3 дней PRO?",
    a: "Через 72 часа снова Intern. Прогресс не стирается. Junior+, запись в пет и полный SQL закрываются, пока не возьмёте платный PRO.",
  },
];
</script>

<template>
  <div class="landing min-h-screen">
    <SiteNav />

    <main class="mx-auto max-w-6xl px-4 pb-16 md:px-6">
      <section class="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:mt-12">
        <div>
          <p class="kicker">зал аналитика · самообучение</p>
          <h1 class="font-display mt-4 text-4xl leading-[0.95] md:text-6xl">
            Платите за запись в учебный банк, не за видео.
          </h1>
          <span class="section-rule" aria-hidden="true" />
          <p class="mt-5 max-w-xl text-[17px] leading-7 text-mute">
            Intern бесплатно: уроки входа, чтение кошелька, intern-лабы.
            PRO — когда нужно самому нажать холд в
            <span class="font-mono text-[13px] text-ink">/api/v1</span>,
            открыть junior+ и полный SQL. Новым — 3 дня как PRO, потом решаете.
          </p>
          <ul class="mt-5 max-w-xl space-y-2 text-[15px] leading-6">
            <li><span class="stamp">intern</span> читаете банк. Срок не кончается.</li>
            <li><span class="stamp stamp-solid">pro</span> пишете холд / P2P / IBAN, все 78 лаб, middle-собес.</li>
            <li><span class="stamp">триал</span> 72 часа правого столбца с регистрации. Без Zoom и куратора.</li>
          </ul>
          <div class="mt-7 flex flex-wrap gap-3">
            <RouterLink to="/register" class="btn btn-accent">Начать бесплатно</RouterLink>
            <RouterLink to="/register?trial=1" class="btn btn-ghost">3 дня PRO — зачем платить</RouterLink>
            <RouterLink to="/pricing" class="btn btn-ghost">Таблица Intern / PRO</RouterLink>
          </div>
        </div>
        <HeroFloor />
      </section>

      <section class="mt-20">
        <p class="kicker">артефакты</p>
        <h2 class="font-display mt-3 text-3xl md:text-5xl">Холд, OpenAPI, SQL, собес</h2>
        <span class="section-rule" aria-hidden="true" />
        <p class="mt-3 max-w-2xl text-[16px] leading-7 text-mute">
          Это экраны зала. DBeaver и Zoom дают чужую базу и слайд — запись в /api/v1 там нет.
        </p>
        <div class="catalog-grid mt-8 lg:grid-cols-2">
          <Infographic
            kicker="холд"
            plate="01"
            title="Три числа после auth"
            :fig="holdFig"
            caption="Intern это видит. PRO жмёт POST и сам двигает available."
          />
          <Infographic
            kicker="контракт"
            plate="02"
            title="Запись в банк"
            :fig="openapiFig"
            caption="Intern читает. PRO (и триал) бьёт POST. 409 на повтор ключа — учебный ответ, не картинка Swagger."
          />
          <Infographic
            kicker="sql"
            plate="03"
            title="Окно к журналу"
            :fig="sqlFig"
            caption="Intern: витрины intern_*. PRO: полная лаба, эталон, те же холды, что вы сами открыли."
          />
          <article class="card p-5">
            <div class="flex items-center gap-2">
              <span class="stamp">собес</span>
              <span class="plate-n">04</span>
            </div>
            <h3 class="font-display mt-3 text-2xl leading-none">Вопрос со стола, не тест</h3>
            <p class="mt-3 text-[16px] leading-7">
              Назовите три числа на кошельке. Что сломается, если ночью сделать
              <span class="font-mono text-[13px]">UPDATE wallets.balance</span>?
            </p>
            <p class="mt-2 text-sm leading-6 text-mute">
              Intern отвечает на входные. PRO открывает middle+ (57 вопросов) и отдельный /live.
            </p>
          </article>
        </div>
      </section>

      <section class="mt-20">
        <p class="kicker">с нуля</p>
        <h2 class="font-display mt-3 text-3xl md:text-5xl">Шесть шагов. Что вы делаете</h2>
        <span class="section-rule" aria-hidden="true" />
        <div class="catalog-grid mt-8 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="s in path" :key="s.n" class="card p-5">
            <div class="plate-n">{{ s.n }}</div>
            <h3 class="font-display mt-3 text-2xl leading-none">{{ s.t }}</h3>
            <p class="mt-2 text-sm leading-6 text-mute">{{ s.d }}</p>
          </article>
        </div>
      </section>

      <PlanCompare class="mt-20" />

      <section class="mt-20">
        <p class="kicker">сцена смены</p>
        <h2 class="font-display mt-3 text-3xl md:text-5xl">Касса 20 000. Три числа</h2>
        <span class="section-rule" aria-hidden="true" />
        <p class="mt-3 max-w-2xl text-[16px] leading-7 text-mute">
          Анна платит 20 000. На кошельке было 100 000. Школа на Zoom рисует это на доске.
          Здесь вы жмёте холд в учебном банке и видите, что именно изменилось.
        </p>
        <div class="catalog-grid mt-8 md:grid-cols-3">
          <article v-for="(row, i) in scene" :key="row.t" class="card p-5">
            <div class="plate-n">0{{ i + 1 }}</div>
            <h3 class="font-display mt-3 text-2xl">{{ row.t }}</h3>
            <dl class="mt-3 space-y-1 font-mono text-[13px]">
              <div class="flex justify-between gap-3 border-b border-line py-1">
                <dt class="text-mute">ledger</dt>
                <dd>{{ row.ledger }}</dd>
              </div>
              <div class="flex justify-between gap-3 border-b border-line py-1">
                <dt class="text-mute">hold</dt>
                <dd>{{ row.hold }}</dd>
              </div>
              <div class="flex justify-between gap-3 py-1">
                <dt class="text-mute">available</dt>
                <dd class="text-accent">{{ row.avail }}</dd>
              </div>
            </dl>
            <p class="mt-3 text-sm leading-6 text-mute">{{ row.n }}</p>
          </article>
        </div>
        <p class="mt-5 max-w-2xl text-[15px] leading-7 text-mute">
          Холд не списывает: журнал ещё 100 000, клиент уже видит 80 000.
          Capture пишет ноги. Void снимает холд без проводки. Это и есть работа SA — и это PRO: запись в пет.
        </p>
      </section>

      <section class="mt-20">
        <p class="kicker">вопросы</p>
        <h2 class="font-display mt-3 text-3xl md:text-5xl">Чем не GetAnalyst. Зачем деньги</h2>
        <span class="section-rule" aria-hidden="true" />
        <div class="catalog-grid mt-8 md:grid-cols-3">
          <article v-for="item in faq" :key="item.q" class="card p-5">
            <h3 class="font-display text-2xl leading-none">{{ item.q }}</h3>
            <p class="mt-3 text-sm leading-6 text-mute">{{ item.a }}</p>
          </article>
        </div>
      </section>

      <section class="cta-plate mt-20 px-6 py-10 md:px-10">
        <p class="stamp-solid stamp">вход</p>
        <h2 class="font-display mt-3 text-3xl md:text-5xl">Intern сразу. PRO — 3 дня проверить</h2>
        <p class="mt-3 max-w-xl text-[16px] leading-7 text-white/75">
          Регистрация открывает Intern. Тем же аккаунтом 72 часа пишете в учебный банк, как в PRO.
          Потом решаете, платить ли.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink to="/register" class="btn btn-on-ink">Начать бесплатно</RouterLink>
          <RouterLink to="/register?trial=1" class="btn btn-on-ink-ghost">3 дня PRO</RouterLink>
        </div>
        <p class="mt-8 font-mono text-[11px] text-white/50">
          Analyst Hall · intern — регистрация · сид PRO — pro@malo.academy / ChangeMe_Pro1!
        </p>
      </section>
    </main>

    <div class="landing-dock">
      <p class="landing-dock-copy">Intern бесплатно · новым 3 дня PRO</p>
      <div class="flex flex-wrap gap-2">
        <RouterLink to="/register" class="btn btn-on-ink btn-sm">Начать бесплатно</RouterLink>
        <RouterLink to="/register?trial=1" class="btn btn-on-ink-ghost btn-sm">3 дня PRO</RouterLink>
      </div>
    </div>

    <footer class="border-t-2 border-ink bg-white">
      <div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-mute md:flex-row md:items-center md:justify-between md:px-6">
        <p class="font-display text-ink">Analyst Hall</p>
        <p>зал аналитика · самообучение BA / SA</p>
        <nav class="flex flex-wrap gap-4">
          <RouterLink to="/pricing">Сравнение</RouterLink>
          <RouterLink to="/pet">Пет</RouterLink>
          <RouterLink to="/interview">Собес</RouterLink>
        </nav>
      </div>
    </footer>
  </div>
</template>
