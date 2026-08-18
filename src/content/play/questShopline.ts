import { o, type QuestBeat, type QuestCampaign, type QuestEnding } from "@/content/play/questCore";

const beats: Record<string, QuestBeat> = {
  q1: {
    id: "q1",
    day: "День 1 · мерчант",
    title: "Сделайте как у WB",
    from: "ShopLine · PO категории",
    incident:
      "Крупный селлер: «заказы должны синхронизироваться как у Wildberries». Склад уже режет остатки по Excel. Вы гостевой аналитик, Wallet здесь ни при чём.",
    hint: "Need чужого UI — не контракт заказа.",
    kind: "choice",
    options: [
      o("a", "Спросим ключ заказа, статусы и что происходит при 409. WB — вне скоупа.", "Рамка без чужого UI.", { trust: 8, orders: 6, load: 4, flagsAdd: ["frame"] }, "q2"),
      o("b", "Ок, копируем ленту WB, потом разберёмся.", "Чужой продукт в бэклоге. Склад не спасён.", { trust: 4, stock: -8, load: 8, flagsAdd: ["copy_wb"] }, "q2"),
      o("c", "Сразу Kafka «чтобы заказы не терялись».", "Шина без ключа заказа.", { orders: -6, load: 12, flagsAdd: ["kafka"] }, "q2"),
    ],
  },
  q2: {
    id: "q2",
    day: "День 1 · контракт",
    title: "Напишите AC на POST /orders",
    from: "order-api",
    incident:
      "Dev просит AC. Двойной тап селлера на 3G уже случался. Пока вы не напишете — в спеке дыра, склад уедет дважды.",
    hint: "Идемпотентность, 409, остатки не двигаем повторно.",
    kind: "write",
    prompt:
      "Given/When/Then: повтор POST с тем же ключом. Что видит селлер. Что со складом. Код ответа.",
    placeholder: "Given …\nWhen …\nThen …",
    minChars: 80,
    passNeed: 3,
    checks: [
      { id: "key", any: ["idempotency", "идемпотен", "ключ", "key"], why: "Ключ запроса.", flagsAdd: ["order_key"] },
      { id: "code", any: ["409", "duplicate", "дубл"], why: "Код повтора." },
      { id: "stock", any: ["остат", "склад", "не двига", "не спис"], why: "Склад не второй раз." },
      { id: "then", any: ["then", "тогда", "селлер видит", "показывает"], why: "Наблюдаемый Then." },
    ],
    pass: o("pass", "AC на ключе", "Склад защищён текстом, который уйдёт в тикет.", { stock: 14, orders: 10, trust: 6 }, "q3"),
    fail: o("fail", "AC «синхронизировать»", "Спека как была. Остатки ещё уедут.", { stock: -12, orders: -8, load: 6, flagsAdd: ["weak_ac"] }, "q3"),
  },
  q3: {
    id: "q3",
    day: "День 2 · тикет",
    title: "Тикет интеграции врёт",
    from: "Jira SHOP-441",
    incident: "В тикет уже вписали «как у WB» и «заказы синхронизируются». Вычистите мины до груминга.",
    hint: "Нет ключа — нет интеграции.",
    kind: "spot",
    block: {
      kind: "spot",
      title: "Что выкинуть из SHOP-441",
      prompt: "Отметьте строки, из-за которых склад взорвётся.",
      lines: [
        { id: "1", text: "Заказы должны синхронизироваться", bad: true, why: "Нет ключа и статуса." },
        { id: "2", text: "POST /orders, Idempotency-Key required", bad: false, why: "Контракт." },
        { id: "3", text: "Как лента Wildberries", bad: true, why: "Чужой UI." },
        { id: "4", text: "409: остатки не двигаем, отдаём order_id", bad: false, why: "Fail явный." },
        { id: "5", text: "Всегда HTTP 200, ошибка в body.ok", bad: true, why: "Клиент ретраит." },
      ],
    },
    pass: o("pass", "Тикет почищен", "Груминг не утащит WB.", { sla: 8, trust: 6, flagsAdd: ["ticket_ok"] }, "q4"),
    fail: o("fail", "Мины остались", "В спринт уйдёт «синхронизировать».", { sla: -8, stock: -6, flagsAdd: ["ticket_bad"] }, "q4"),
  },
  q4: {
    id: "q4",
    day: "День 3 · пайп",
    title: "Впишите поля 409",
    from: "OpenAPI черновик",
    incident: "Спека почти пустая. Допишите, что именно возвращает 409 — иначе мобила селлера нарисует новый заказ.",
    hint: "Не «ошибка в JSON». Код, существующий id, причина.",
    kind: "fill",
    prompt: "Закройте три дыры в ответе на повтор.",
    slots: [
      {
        id: "code",
        label: "HTTP код повтора",
        accept: ["409"],
        hint: "Не 200.",
        explain: "Повтор POST с тем же ключом — конфликт, не успех. 200 заставляет клиента думать, что создали новый заказ.",
        example: "409",
      },
      {
        id: "id",
        label: "Поле существующего заказа",
        accept: ["order_id", "orderid", "existing_id", "existingid", "id заказа"],
        hint: "Как клиент найдёт первый.",
        explain: "В теле 409 верните id уже созданного заказа, чтобы ретрай не плодил склад.",
        example: "existing_id / order_id первого заказа",
      },
      {
        id: "reason",
        label: "Поле причины",
        accept: ["reason", "причин", "duplicate", "дубл"],
        hint: "Почему не создали второй.",
        explain: "Машине нужен код, человеку — слово. Duplicate без второго списания остатка.",
        example: "reason: duplicate",
      },
    ],
    passNeed: 2,
    pass: o("pass", "409 описан", "Клиент не плодит склад.", { stock: 10, orders: 8, flagsAdd: ["body_ok"] }, "q5"),
    fail: o("fail", "200 + ok:false", "Ретраи как сеть. Склад плывёт.", { stock: -12, orders: -8, flagsAdd: ["body_lie"] }, "q5"),
  },
  q5: {
    id: "q5",
    day: "День 4 · выплата",
    title: "Реестр выплат «как получится»",
    from: "Финансы ShopLine",
    incident: "Выплаты селлерам по файлу. Колонки плывут. PO: «подстроимся, не терять окно».",
    hint: "Ключ строки до трафика.",
    kind: "sort",
    block: {
      kind: "sort",
      title: "Файл выплат",
      prompt: "До трафика / после пилота / не делать.",
      buckets: [
        { id: "now", title: "До трафика" },
        { id: "later", title: "После пилота" },
        { id: "no", title: "Не делать" },
      ],
      items: [
        { id: "a", text: "Ключ seller_id+payout_id и кодировка", bucket: "now", why: "Контракт файла." },
        { id: "b", text: "Код MISMATCH в админке", bucket: "now", why: "Иначе руками ledger выплат." },
        { id: "c", text: "Красивый дашборд «как у маркетплейса мечты»", bucket: "later", why: "Не шов." },
        { id: "d", text: "Молча подстроиться под плывущие колонки", bucket: "no", why: "Прод." },
        { id: "e", text: "Ops-канал, когда пайп лёг", bucket: "now", why: "Runbook." },
      ],
    },
    pass: o("pass", "Файл закрыт", "Выплаты можно пилотить.", { payout: 16, trust: 6, flagsAdd: ["file_ok"] }, "q6"),
    fail: o("fail", "Плывущие колонки", "Селлеры не получат деньги в пятницу.", { payout: -14, load: 10, flagsAdd: ["file_chaos"] }, "q6"),
  },
  q6: {
    id: "q6",
    day: "День 5 · выкат",
    title: "Письмо селлеру",
    from: "Коммуникации",
    incident:
      "Катим POST /orders. Юрист просит текст в ЛК селлера, если заказ уже был. Напишите. Если сольёте PII или пообещаете WB — trust.",
    hint: "Без телефона, без «как у WB». Есть order_id и что со складом.",
    echoFrom: "q2",
    kind: "write",
    prompt: "Текст в ЛК: повтор не создал второй заказ. Что видит селлер.",
    placeholder: "Этот заказ уже принят: …\nСклад: …\nЕсли это другой заказ: …",
    minChars: 50,
    passNeed: 2,
    checks: [
      { id: "id", any: ["order_id", "номер", "id заказа", "уже принят", "уже есть"], why: "Указали существующий заказ." },
      { id: "stock", any: ["остат", "склад", "не списа", "не второй"], why: "Склад честно." },
      { id: "pii", any: ["телефон", "паспорт", "фио", "карта"], why: "PII не место в этом тексте.", forbid: true },
    ],
    pass: o("pass", "Честный текст", "Селлер не жмёт ещё раз.", { sla: 8, trust: 8, flagsAdd: ["copy_ok"] }, "q7"),
    fail: o("fail", "Туман или PII", "Либо жмут снова, либо юрист орёт.", { trust: -10, sla: -6, flagsAdd: ["copy_bad"] }, "q7"),
  },
  q7: {
    id: "q7",
    day: "День 6 · go",
    title: "100% в Чёрную пятницу",
    from: "PO",
    incident: "Пилот на стейдже зелёный. FP антифрода не смотрели. PO: катим 100%, окно до пятницы.",
    hint: "Стоп-кран — фича витрины.",
    kind: "choice",
    options: [
      o("a", "Go 5% селлеров. Нет порога дублей — нет 100%.", "Медленнее, склад жив.", { trust: 4, stock: 6, orders: 4, flagsAdd: ["pilot"] }, "end"),
      o("b", "100% сразу, Чёрная пятница ждёт.", "Если ключа нет — взорвёте склад.", { trust: 8, load: -4, flagsAdd: ["full_rollout"] }, "end"),
      o("c", "Кивнуть и тихо вырезать в четверг.", "Политический долг.", { trust: -10, load: 8, flagsAdd: ["hidden_cut"] }, "end"),
    ],
  },
};

const endings: Record<string, QuestEnding> = {
  clean: {
    id: "clean",
    title: "Витрина держит склад",
    tone: "mint",
    xp: 180,
    summary: "ShopLine выкатили заказ с ключом и 409. Выплаты не плывут. Селлер видит один order_id.",
    debrief: ["AC, который вы написали, стал контрактом.", "«Как у WB» не попало в прод."],
  },
  stock: {
    id: "stock",
    title: "Склад уехал дважды",
    tone: "rose",
    xp: 70,
    summary: "Двойные POST доехали до остатков. Селлеры орут. Это не Wallet — это ваш гостевой контур.",
    debrief: ["Без ключа «синхронизация» = две отгрузки.", "409 нужно было написать, не выбрать из списка."],
  },
  payout: {
    id: "payout",
    title: "Выплаты поплыли",
    tone: "rose",
    xp: 75,
    summary: "Файл без ключа строки. Финансы руками. Крупный селлер приостановил витрину.",
    debrief: ["Подстроиться под колонки — не контракт."],
  },
  theater: {
    id: "theater",
    title: "Kafka и лента WB",
    tone: "violet",
    xp: 80,
    summary: "Шина есть, master заказа нет. PO доволен слайдом. Склад нет.",
    debrief: ["Транспорт не заменяет order_id."],
  },
  messy: {
    id: "messy",
    title: "Выкатили, склад нервный",
    tone: "gold",
    xp: 120,
    summary: "Релиз есть. Ops ещё ловит MISMATCH и ретраи. Витрина жива.",
    debrief: ["Часть швов закрыли текстом, часть оставили."],
  },
  silent: {
    id: "silent",
    title: "Тихий долг витрины",
    tone: "gold",
    xp: 55,
    summary: "Вроде работает. Никто не скажет, какой ключ заказа. Через месяц — инцидент в пятницу.",
    debrief: ["Нет катастрофы — и нет контракта."],
  },
};

export const SHOPLINE_QUEST: QuestCampaign = {
  id: "shopline",
  title: "Guest · заказ ShopLine",
  product: "ShopLine",
  teaser: "Чужой маркетплейс. Пишете AC и поля 409. Склад зависит от текста, не от кнопки «как у WB».",
  minutes: 18,
  systems: [
    { id: "order-api", name: "order-api" },
    { id: "stock", name: "stock-service" },
    { id: "payout", name: "payout-file" },
    { id: "seller-lk", name: "seller-lk" },
  ],
  metrics: [
    { id: "stock", label: "Остатки", good: "high" },
    { id: "orders", label: "Контракт заказа", good: "high" },
    { id: "sla", label: "SLA селлера", good: "high" },
    { id: "payout", label: "Выплаты", good: "high" },
    { id: "trust", label: "Доверие PO", good: "high" },
    { id: "load", label: "Нагрузка команды", good: "low" },
  ],
  emptyMetrics: () => ({ stock: 50, orders: 48, sla: 52, payout: 46, trust: 50, load: 40 }),
  startBeat: "q1",
  beats,
  endings,
  pickEnding: (m, f) => {
    if ((m.load ?? 0) >= 78) return "theater";
    if (f.includes("kafka") && (m.orders ?? 0) < 55) return "theater";
    if ((m.stock ?? 0) < 40 || f.includes("body_lie") || (f.includes("full_rollout") && !f.includes("order_key")))
      return "stock";
    if (f.includes("file_chaos") && (m.payout ?? 0) < 45) return "payout";
    if ((m.stock ?? 0) >= 68 && (m.orders ?? 0) >= 60 && f.includes("order_key") && (f.includes("pilot") || f.includes("body_ok")))
      return "clean";
    if ((m.stock ?? 0) >= 52 && (m.trust ?? 0) >= 45) return "messy";
    return "silent";
  },
};
