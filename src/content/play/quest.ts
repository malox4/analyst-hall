import type { MatchBlock, SortBlock, SpotBlock } from "@/types/content";

export type QuestMetricId = "money" | "kyc" | "cards" | "recon" | "trust" | "load";

export type QuestMetrics = Record<QuestMetricId, number>;

export type QuestDelta = Partial<QuestMetrics> & {
  flagsAdd?: string[];
  flagsRemove?: string[];
};

export type QuestNext =
  | string
  | { ifFlag: string; then: string; else: string };

export type QuestChoice = {
  id: string;
  text: string;
  why: string;
  delta: QuestDelta;
  next: QuestNext;
};

export type QuestBeat = {
  id: string;
  day: string;
  title: string;
  from: string;
  incident: string;
  hint: string;
} & (
  | { kind: "choice"; options: QuestChoice[] }
  | { kind: "spot"; block: SpotBlock; pass: QuestChoice; fail: QuestChoice }
  | { kind: "sort"; block: SortBlock; pass: QuestChoice; fail: QuestChoice }
  | { kind: "match"; block: MatchBlock; pass: QuestChoice; fail: QuestChoice }
);

export type QuestEnding = {
  id: string;
  title: string;
  tone: "mint" | "gold" | "violet" | "rose";
  xp: number;
  summary: string;
  debrief: string[];
};

export const QUEST_METRICS: { id: QuestMetricId; label: string; good: "high" | "low" }[] = [
  { id: "money", label: "Целостность ledger", good: "high" },
  { id: "kyc", label: "KYC / онбординг", good: "high" },
  { id: "cards", label: "Авторизации 3DS", good: "high" },
  { id: "recon", label: "Сверка эквайера", good: "high" },
  { id: "trust", label: "Доверие совета", good: "high" },
  { id: "load", label: "Нагрузка команды", good: "low" },
];

export const emptyQuestMetrics = (): QuestMetrics => ({
  money: 48,
  kyc: 52,
  cards: 50,
  recon: 44,
  trust: 58,
  load: 38,
});

const o = (id: string, text: string, why: string, delta: QuestDelta, next: QuestNext): QuestChoice => ({
  id,
  text,
  why,
  delta,
  next,
});

export const QUEST_BEATS: Record<string, QuestBeat> = {
  q1: {
    id: "q1",
    day: "День 1 · 09:14",
    title: "PENDING 40 минут",
    from: "Slack · PO + mobile + kyc-gateway",
    incident:
      "Клиент висит в PENDING. PO: «кнопку обновить». Mobile рисует ACTIVE, потому что кошелёк уже создан. Dev просит поля JSON. Вы аналитик Malo Wallet на живом контуре.",
    hint: "Master данных решит метрики онбординга на всю смену.",
    kind: "choice",
    options: [
      o("a", "Экран читает kyc-gateway как master. ACTIVE запрещён до APPROVED. Поля — из enum статусов.", "Шов личности починен.", { kyc: 14, trust: 6, load: 4, flagsAdd: ["kyc_master"] }, "q2"),
      o("b", "Дадим кнопку «обновить» и красивый скелетон. JSON — как получится.", "UI без контракта. PENDING останется врать.", { kyc: -12, trust: 4, load: -6, flagsAdd: ["pretty_ui"] }, "q2"),
      o("c", "Сразу Kafka «чтобы статусы не терялись».", "Шина без master. Ops не будет знать, куда смотреть.", { kyc: -6, money: -4, load: 10, flagsAdd: ["kafka"] }, "q2"),
    ],
  },
  q2: {
    id: "q2",
    day: "День 1 · 16:40",
    title: "Двойной тап P2P",
    from: "Инцидент #441 · ledger",
    incident:
      "Клиент тапнул «отправить» дважды на плохой сети. Два SUCCESS, две проводки. Mobile говорит: «мы просто повторяем POST». Откройте контракт — от вашей разметки зависит, потечёт ли ledger дальше.",
    hint: "Это работа, не мнение. Найдите мины в спецификации.",
    kind: "spot",
    block: {
      kind: "spot",
      title: "OpenAPI POST /transfers",
      prompt: "Отметьте строки, из-за которых деньги удваиваются.",
      lines: [
        { id: "1", text: "Idempotency-Key не required", bad: true, why: "Ретрай = новая проводка." },
        { id: "2", text: "amount integer в минорах, currency ISO-4217", bad: false, why: "Нормально." },
        { id: "3", text: "Всегда HTTP 200, ошибка в body.ok=false", bad: true, why: "Клиент ретраит как сеть." },
        { id: "4", text: "409 DUPLICATE описан", bad: false, why: "Нужный код." },
        { id: "5", text: "5xx: клиент ретраит без ключа", bad: true, why: "Нет контракта, кто ретраит." },
      ],
    },
    pass: o("pass", "Контракт починен", "Ключ и 409 в спеке. Mobile больше не стреляет вслепую.", { money: 18, trust: 8, flagsAdd: ["has_key"] }, { ifFlag: "has_key", then: "q3-auth", else: "q3-bleed" }),
    fail: o("fail", "Мины остались", "Спеку выкатили как было. Ledger ещё потечёт.", { money: -16, trust: -8, load: 8, flagsAdd: ["no_key"] }, { ifFlag: "has_key", then: "q3-auth", else: "q3-bleed" }),
  },
  "q3-bleed": {
    id: "q3-bleed",
    day: "День 2 · 08:05",
    title: "Ledger кровоточит",
    from: "Ops ночная смена",
    incident:
      "За ночь ещё 11 двойных SUCCESS. CFO уже в чате. Kafka-ветка (если вы её завели) предлагает «exactly-once на шине». Часы идут.",
    hint: "Поздний ключ ещё можно спасти. Шина без ключа — нет.",
    kind: "choice",
    options: [
      o("a", "Стоп трафик P2P. Патч: ключ + дедуп по request hash. Потом разбор 11 кейсов.", "Режете кровь. Load прыгнет — вы живы.", { money: 12, load: 14, trust: 4, flagsAdd: ["has_key"], flagsRemove: ["no_key"] }, "q4"),
      o("b", "Не стопаем, «клиенты не любят простой». Дедуп потом.", "Проводки копятся. Trust совета падает вечером.", { money: -14, trust: -12, load: 6, flagsAdd: ["bleed"] }, "q4"),
      o("c", "Включаем Kafka exactly-once и надеемся.", "Транспорт не лечит отсутствие ключа на POST.", { money: -10, load: 16, flagsAdd: ["kafka", "bleed"] }, "q4"),
    ],
  },
  "q3-auth": {
    id: "q3-auth",
    day: "День 2 · 11:20",
    title: "3DS врёт SUCCESS",
    from: "card-processor · саппорт",
    incident:
      "ACS молчит 4 секунды. wallet-api рисует SUCCESS. Клиент думает, что оплатил. Мерчант — нет. Через 5 дней прилетит chargeback. P2P-ключ у вас уже есть — этот шов другой.",
    hint: "UNKNOWN дороже красивого успеха.",
    kind: "choice",
    options: [
      o("a", "Тишина ACS → UNKNOWN, не SUCCESS. Админка показывает raw code. Пилот 5%.", "Честный статус.", { cards: 16, trust: 6, load: 6, flagsAdd: ["unknown"] }, "q4"),
      o("b", "Оставим SUCCESS, «не пугать клиента».", "Chargeback-машина заведена.", { cards: -18, trust: 2, flagsAdd: ["false_success"] }, "q4"),
      o("c", "Новый микросервис статусов карт.", "Ещё шов. Ops не знает, куда смотреть.", { cards: -6, load: 14, flagsAdd: ["status_svc"] }, "q4"),
    ],
  },
  q4: {
    id: "q4",
    day: "День 3 · сверка",
    title: "Файл Orient «как получится»",
    from: "Guest · Orient Bank",
    incident:
      "Юристы уже подписали. Партнёр: колонки иногда плывут. 1C-bridge ждёт реестр T+1. От вашей сортировки зависит, включите ли вы трафик.",
    hint: "Не всё — REST. Не всё — «подстроимся».",
    kind: "sort",
    block: {
      kind: "sort",
      title: "Как закрывать интеграцию",
      prompt: "Разложите ходы.",
      buckets: [
        { id: "now", title: "До трафика" },
        { id: "later", title: "После пилота" },
        { id: "no", title: "Не делать" },
      ],
      items: [
        { id: "a", text: "Ключ строки merchant_id+rrn и кодировка", bucket: "now", why: "Контракт файла." },
        { id: "b", text: "Коды отклонения MISMATCH", bucket: "now", why: "Иначе руками ledger." },
        { id: "c", text: "Красивый дашборд «как у банка мечты»", bucket: "later", why: "Не шов." },
        { id: "d", text: "Подстроиться под плывущие колонки молча", bucket: "no", why: "Прод взорвётся." },
        { id: "e", text: "Ops-канал, когда пайп лёг", bucket: "now", why: "Runbook." },
        { id: "f", text: "Свой Kafka «на всякий» между файлом и 1С", bucket: "no", why: "Лишний шов." },
      ],
    },
    pass: o("pass", "Контракт файла", "Трафик можно пилотить.", { recon: 16, trust: 6, flagsAdd: ["file_ok"] }, "q5"),
    fail: o("fail", "Плывущие колонки", "Включили как есть. MISMATCH руками.", { recon: -14, load: 10, flagsAdd: ["file_chaos"] }, "q5"),
  },
  q5: {
    id: "q5",
    day: "День 4 · спонсор",
    title: "Ещё BFF, ещё шина, в этом релизе",
    from: "Спонсор в Zoom",
    incident:
      "«Команда гибкая. Третий BFF и брокер — в том же окне, что ключ P2P». Velocity кончилась. От вашего нет зависит load и ledger.",
    hint: "Нет без обмена — тоже решение в продукте.",
    kind: "choice",
    options: [
      o("a", "Нет швам. Да — дожать ключ и UNKNOWN. Письмо с CoD.", "Спонсор злится, контур жив.", { trust: -6, load: -8, money: 6, flagsAdd: ["said_no"] }, "q6"),
      o("b", "Впишем всё, народ не любит ждать.", "Три шва. Тесты контракта не влезут.", { load: 18, money: -8, cards: -6, trust: 6, flagsAdd: ["scope_lie"] }, "q6"),
      o("c", "Кивнуть и тихо вырезать в четверг.", "Политический долг. В пятницу всплывёт.", { trust: -10, load: 8, flagsAdd: ["hidden_cut"] }, "q6"),
    ],
  },
  q6: {
    id: "q6",
    day: "День 5 · цифры",
    title: "BI говорит 3, логи — 14",
    from: "PO орёт в канале",
    incident:
      "Вы нашли дубли P2P по Idempotency-Key. BI считает «похожие переводы» по ФИО. Пока словарь разный, продукт принимает неверные решения. Разберите запрос.",
    hint: "SQL без словаря контракта врёт совету.",
    kind: "spot",
    block: {
      kind: "spot",
      title: "Почему цифра врёт",
      prompt: "Отметьте ложь в выводе «дублей нет».",
      lines: [
        { id: "1", text: "Фильтр только SUCCESS, ERROR выкинули", bad: true, why: "Скрыли ретраи." },
        { id: "2", text: "Окно 24ч как в AC", bad: false, why: "Совпадает с контрактом." },
        { id: "3", text: "Склейка по ФИО получателя", bad: true, why: "Не ключ." },
        { id: "4", text: "Знаменатель не указан", bad: true, why: "14 из чего." },
        { id: "5", text: "Exclude тестовых мерчантов явный", bad: false, why: "Честный scope." },
      ],
    },
    pass: o("pass", "Словарь сверен", "Совет видит одну цифру по ключу.", { trust: 10, money: 4, flagsAdd: ["dictionary"] }, "q7"),
    fail: o("fail", "Война метрик", "PO принимает решение по ФИО.", { trust: -10, money: -6, flagsAdd: ["metric_war"] }, "q7"),
  },
  q7: {
    id: "q7",
    day: "День 6 · NFR",
    title: "99.99 как у взрослых",
    from: "Архитектор · слайд мерчанту",
    incident:
      "В договор эквайера хотят вписать 99.99. Знаменателя нет. Исключения на ACS нет. Если подпишете — это станет правдой продукта, не слоганом.",
    hint: "NFR = договор, который можно сломать.",
    kind: "choice",
    options: [
      o("a", "Чей простой: wallet-api или ACS? Окно? Пишем измеримый p95 ack и исключение процессора.", "Честный договор.", { cards: 8, recon: 6, trust: 8, load: 4, flagsAdd: ["nfr_real"] }, "q8"),
      o("b", "Пишем 99.99, QA потом.", "Ложь в договоре. Первый инцидент — штраф.", { trust: 6, cards: -8, recon: -6, flagsAdd: ["nfr_lie"] }, "q8"),
    ],
  },
  q8: {
    id: "q8",
    day: "День 7 · выкат",
    title: "5% или 100% в пятницу",
    from: "PO · окно релиза",
    incident:
      "Пилот зелёный на стейдже. Antifraud ещё не смотрел FP. Юрист молчит по текстам UNKNOWN. PO: катим 100%, окно до пятницы.",
    hint: "Стоп-кран — тоже фича продукта.",
    kind: "choice",
    options: [
      o("a", "Go на 5% с отзывом за час. Нет порога FP — нет 100%.", "Медленнее, живее.", { trust: 4, load: 6, cards: 6, money: 4, flagsAdd: ["pilot"] }, "q9"),
      o("b", "100% сразу, «потом разберёмся».", "Если лгали статусом — взорвёте всех.", { trust: 8, load: -4, flagsAdd: ["full_rollout"] }, "q9"),
      o("c", "Снимаете с себя, пусть PO жмёт кнопку.", "Контур без owner. Метрики всё равно ваши.", { trust: -8, load: -6, flagsAdd: ["no_owner"] }, "q9"),
    ],
  },
  q9: {
    id: "q9",
    day: "День 8 · совет",
    title: "CFO в лифте, потом 6 минут",
    from: "Этаж 19",
    incident:
      "«Ну?» 40 секунд. Потом совет хочет yes/no на контур. Здесь уже не выбрать красивую фразу — совет смотрит на то, что вы реально оставили в продукте.",
    hint: "Текст должен совпасть с метриками. Иначе trust рухнет на месте.",
    kind: "choice",
    options: [
      o("a", "Одна фраза: что ломается в ledger/ACS, какой пилот, какой стоп-кран. Просьба yes на 5%.", "Совет любит ясный шов.", { trust: 12, flagsAdd: ["brief_ok"] }, "end"),
      o("b", "C4, bounded context, 18 определений.", "Потеряли CFO. Решение уйдёт без вас.", { trust: -14, load: 4, flagsAdd: ["brief_fog"] }, "end"),
      o("c", "Обещаем платформу статусов всем продуктам сразу.", "Ставка без ёмкости.", { trust: 4, load: 12, money: -6, flagsAdd: ["platform_lie"] }, "end"),
    ],
  },
};

export const QUEST_ORDER_HINT = ["q1", "q2", "q3-auth", "q3-bleed", "q4", "q5", "q6", "q7", "q8", "q9"];

export const QUEST_ENDINGS: Record<string, QuestEnding> = {
  "clean-ship": {
    id: "clean-ship",
    title: "Чистый контур",
    tone: "mint",
    xp: 220,
    summary: "Malo Wallet выкатили с ключом, честным UNKNOWN и сверкой. Совет понимает, чем вы владеете.",
    debrief: [
      "Master KYC и идемпотентность P2P закрыли деньги.",
      "Пилот и NFR с знаменателем оставили стоп-кран.",
      "Это редкий исход: его не получить кнопкой «как у банка».",
    ],
  },
  "shipped-messy": {
    id: "shipped-messy",
    title: "Выкатили, но швы живут",
    tone: "gold",
    xp: 140,
    summary: "Релиз есть. Ops ещё тушит MISMATCH и ложные статусы. Вас не уволили — контур не стал платформой.",
    debrief: [
      "Часть контрактов вы закрыли, часть оставили «потом».",
      "Следующий квартал уйдёт на долг, который вы видели в дни 2–4.",
    ],
  },
  "ledger-bleed": {
    id: "ledger-bleed",
    title: "Ledger потёк",
    tone: "rose",
    xp: 70,
    summary: "Двойные проводки доехали до CFO. P2P без ключа (или с поздним ключом без стопа) стоит реальных денег.",
    debrief: [
      "Идемпотентность — не слово на груминге, а поле в OpenAPI.",
      "200 + ok:false и ретрай без ключа = две SUCCESS.",
    ],
  },
  "auth-outage": {
    id: "auth-outage",
    title: "Ложный SUCCESS на 100%",
    tone: "rose",
    xp: 80,
    summary: "Катили полно, ACS молчал, клиенты видели успех. Chargeback и ор мерчантов — продукт так и решил.",
    debrief: [
      "UNKNOWN неудобен на слайде и честен в проде.",
      "Полный выкат без пилота умножает ложь статуса.",
    ],
  },
  theater: {
    id: "theater",
    title: "Театр Kafka",
    tone: "violet",
    xp: 90,
    summary: "Шина есть. Master данных нет. Ops не знает, где статус. Совет слышал «архитектура», клиент — PENDING.",
    debrief: [
      "Транспорт не заменяет enum и ключ.",
      "Вы выбрали option до вопроса.",
    ],
  },
  "partner-cut": {
    id: "partner-cut",
    title: "Orient отключил файл",
    tone: "rose",
    xp: 75,
    summary: "Плывущие колонки доехали до 1С. Партнёр стопнул реестр. Эквайринг руками.",
    debrief: [
      "«Подстроимся» — не контракт.",
      "Ключ merchant_id+rrn был дешевле инцидента.",
    ],
  },
  burnout: {
    id: "burnout",
    title: "Команда легла",
    tone: "violet",
    xp: 85,
    summary: "Слишком много швов в одном окне. Контракты не тестировали. Люди ещё в Slack, продукта уже нет.",
    debrief: [
      "Load — такая же метрика, как ledger.",
      "«Впишем всё» = скрытый отказ от fail-тестов.",
    ],
  },
  "silent-fail": {
    id: "silent-fail",
    title: "Тихий провал",
    tone: "gold",
    xp: 60,
    summary: "Вроде выкатили. Метрики серые. Никто не может сказать, кто master статуса. Через месяц это назовут «техдолг».",
    debrief: [
      "Нет катастрофы — и нет контура.",
      "Повторите квест: один шов за неделю важнее платформы в слайде.",
    ],
  },
};

export function resolveNext(next: QuestNext, flags: string[]): string {
  if (typeof next === "string") return next;
  return flags.includes(next.ifFlag) ? next.then : next.else;
}

export function pickEnding(metrics: QuestMetrics, flags: string[]): string {
  if (metrics.load >= 78) return "burnout";
  if (flags.includes("kafka") && metrics.kyc < 55 && metrics.money < 60) return "theater";
  if (metrics.money < 38 || flags.includes("bleed")) return "ledger-bleed";
  if (flags.includes("full_rollout") && (flags.includes("false_success") || metrics.cards < 42)) return "auth-outage";
  if (flags.includes("file_chaos") && metrics.recon < 45) return "partner-cut";
  const healthy =
    metrics.money >= 70 &&
    metrics.kyc >= 62 &&
    metrics.cards >= 58 &&
    metrics.recon >= 52 &&
    metrics.load < 68 &&
    flags.includes("has_key");
  if (healthy && (flags.includes("pilot") || flags.includes("unknown") || flags.includes("nfr_real"))) return "clean-ship";
  if (metrics.money >= 55 && metrics.trust >= 45) return "shipped-messy";
  return "silent-fail";
}

export function clampMetric(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyDelta(metrics: QuestMetrics, flags: string[], delta: QuestDelta) {
  const nextM = { ...metrics };
  (Object.keys(nextM) as QuestMetricId[]).forEach((k) => {
    const d = delta[k];
    if (typeof d === "number") nextM[k] = clampMetric(nextM[k] + d);
  });
  let nextF = [...flags];
  for (const f of delta.flagsAdd ?? []) if (!nextF.includes(f)) nextF.push(f);
  if (delta.flagsRemove?.length) nextF = nextF.filter((f) => !delta.flagsRemove!.includes(f));
  return { metrics: nextM, flags: nextF };
}
