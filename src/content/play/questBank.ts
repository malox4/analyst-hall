import { o, type QuestBeat, type QuestCampaign, type QuestEnding } from "@/content/play/questCore";

const beats: Record<string, QuestBeat> = {
  q1: {
    id: "q1",
    day: "День 1 · журнал",
    title: "Две ноги P2P",
    from: "ledger",
    incident:
      "Анна отправила Борису 5 000 UZS. Mobile рисует «успех». Главбух спрашивает: какие счета, какой DC. Без вашего текста ночная смена проведёт «как получится».",
    hint: "Клиентский счёт — пассив. Кто отдаёт — дебет. Кто получает — кредит. Суммы ног равны.",
    lesson:
      "Проводка — не «минус баланс Анны». Это журнал из двух ног с одним journalId. Счёт клиента — пассив банка: когда Анна отдаёт деньги, пассив уменьшается → это дебет. Когда Борис получает, пассив растёт → кредит. В справочнике: Дебет, Кредит, Пассив клиента.",
    handbook: ["debit", "credit", "journal", "liability"],
    kind: "fill",
    prompt: "Заполните три поля своими словами или вставьте пример. Система ищет опорные слова вроде «Анна», «Борис», «равны».",
    worked:
      "Готовая проводка этого инцидента:\n\nDR  Анна (пассив, отправитель)     5 000 UZS\nCR  Борис (пассив, получатель)     5 000 UZS\n\nОдин journalId. Не валюта, не кнопка в UI, не SMS.",
    slots: [
      {
        id: "dr",
        label: "Дебет",
        accept: ["анна", "acc_anna", "клиент отправител", "from", "пассив анн"],
        hint: "Кто отдаёт 5000",
        explain:
          "Дебет — левая нога. Анна отдаёт деньги, её пассив падает. Пишите счёт отправителя, не «списание с кошелька».",
        example: "Дебет Анна (отправитель, пассив уменьшается)",
      },
      {
        id: "cr",
        label: "Кредит",
        accept: ["борис", "acc_boris", "получател", "to"],
        hint: "Кто получает 5000",
        explain: "Кредит — правая нога. Борис получает, его пассив растёт. Это не nostro и не комиссия банка.",
        example: "Кредит Борис (получатель, пассив увеличивается)",
      },
      {
        id: "eq",
        label: "Суммы ног",
        accept: ["равн", "5000", "одна сумма", "баланс"],
        hint: "DR должен равняться CR",
        explain: "В одной валюте сумма всех дебетов ордера = сумма кредитов. Здесь обе ноги по 5000. Иначе пробный баланс не сойдётся.",
        example: "Суммы равны: обе ноги 5000",
      },
    ],
    passNeed: 3,
    pass: o("pass", "Журнал сходится", "P2P — две ноги, не «минус баланс».", { books: 14, money: 10, flagsAdd: ["p2p_legs"] }, "q2"),
    fail: o("fail", "Минус в Excel", "Смену научили UPDATE balance. Trial разъедется на первом refund.", { books: -12, money: -8, flagsAdd: ["excel_books"] }, "q2"),
  },
  q2: {
    id: "q2",
    day: "День 2 · холд",
    title: "Available ≠ ledger",
    from: "card-processor + ledger",
    incident:
      "Auth Cafe Orient 12 000. PO: «списали». Клиент видит 12к меньше. В главкниге ещё ноль. Напишите, что такое холд.",
    hint: "Холд режет available. Проводка рождается на capture.",
    lesson:
      "Три числа на кошельке: ledger (ноги журнала), hold (OPEN резерв), available = ledger − hold. Auth кафе 12 000 ставит холд. Capture делает DR клиента CR мерчанта. Если ACS молчит — статус UNKNOWN, не SUCCESS.",
    handbook: ["hold", "available", "capture", "acs"],
    kind: "write",
    prompt:
      "Три строки: что такое холд; что такое capture; что видит клиент, если ACS молчит. Не пишите «как у банка».",
    placeholder:
      "Холд: OPEN резерв, режет available, журнала нет.\nCapture: DR клиент CR мерчант, hold CAPTURED — вот тогда проводка.\nACS timeout: статус UNKNOWN, не SUCCESS — иначе ложное списание.",
    minChars: 90,
    passNeed: 2,
    checks: [
      { id: "hold", any: ["hold", "холд", "available", "доступн", "не провод"], why: "Холд ≠ ledger.", flagsAdd: ["hold_ok"] },
      { id: "cap", any: ["capture", "каптур", "провод", "journal", "дебет"], why: "Capture порождает ноги." },
      { id: "acs", any: ["unknown", "таймаут", "молч", "не success", "не успех"], why: "Честный ACS." },
    ],
    pass: o("pass", "Словарь кассы", "Клиент и главкнига больше не спорят об одном числе.", { cards: 12, books: 8 }, "q3"),
    fail: o("fail", "«Списали на auth»", "Chargeback придёт в capture, а вы уже отчитались SUCCESS.", { cards: -12, trust: -8, flagsAdd: ["auth_is_capture"] }, "q3"),
  },
  q3: {
    id: "q3",
    day: "День 3 · возврат",
    title: "Дыра refund",
    from: "ops + 1C",
    incident: "Вернули 12к клиенту одной ногой CR. Trial: DR 230000 CR 242000. Найдите мины.",
    hint: "Возврат — реверс capture. Не «накинуть на кошелёк».",
    lesson:
      "Refund после capture = зеркальные ноги: DR Cafe, CR клиент. Одна нога «плюс клиенту» рвёт пробный баланс. Void — это снятие холда до capture, без журнала.",
    handbook: ["refund", "trial", "void", "capture"],
    kind: "spot",
    block: {
      kind: "spot",
      title: "Refund в проде",
      prompt: "Что ломает пробный баланс.",
      lines: [
        { id: "1", text: "CR клиента без DR мерчанта", bad: true, why: "Дыра." },
        { id: "2", text: "Две ноги: DR Cafe CR клиент на сумму capture", bad: false, why: "Реверс." },
        { id: "3", text: "UPDATE wallets SET balance = balance + amount", bad: true, why: "Вне журнала." },
        { id: "4", text: "Частичный refund ≤ capturedAmount", bad: false, why: "Потолок." },
        { id: "5", text: "Refund из AUTHORIZED — «ну клиенту же вернули»", bad: true, why: "Холд снимают void, не refund." },
      ],
    },
    pass: o("pass", "Реверс в журнале", "Trial снова 0. Ops может спать.", { books: 12, money: 10, flagsAdd: ["refund_ok"] }, "q4"),
    fail: o("fail", "Дыра в UZS", "1С не закроет день. CFO увидит diff.", { books: -14, money: -10, flagsAdd: ["refund_hole"] }, "q4"),
  },
  q4: {
    id: "q4",
    day: "День 4 · банк",
    title: "Nostro и невыясненные",
    from: "Orient correspondent",
    incident: "Пришла пачка: зарплата на IBAN Анны, платёж на IBAN, которого нет, исходящая аренда. Разложите проводки.",
    hint: "Nostro — наш счёт в чужом банке. Невыясненные — не «пропало».",
    lesson:
      "Nostro — актив. Входящий на наш IBAN: DR nostro CR клиент. Исходящий сначала холд, журнал только после ack posted, потом можно отдать MT103. IBAN не из плана счетов → suspense, не Анна «чтобы закрыть пачку».",
    handbook: ["nostro", "iban-in", "iban-out", "suspense", "mt103"],
    kind: "sort",
    block: {
      kind: "sort",
      title: "Куда ноги",
      prompt: "Входящий / исходящий / suspense.",
      buckets: [
        { id: "in", title: "Входящий на нашего клиента" },
        { id: "out", title: "Исходящий" },
        { id: "sus", title: "Невыясненные" },
      ],
      items: [
        { id: "a", text: "DR nostro CR Анна, IBAN наш", bucket: "in", why: "Кредит клиента." },
        { id: "b", text: "IBAN не в плане счетов", bucket: "sus", why: "Не 404 в проде платежа." },
        { id: "c", text: "Холд на Анне, пока Orient не ack", bucket: "out", why: "Деньги ещё у нас." },
        { id: "d", text: "Ack posted: DR Анна CR nostro", bucket: "out", why: "Ушли с нашего nostro." },
        { id: "e", text: "Ack rejected: холд RELEASED, журнала нет", bucket: "out", why: "Банк отказал." },
      ],
    },
    pass: o("pass", "Корсчёт живой", "MT103 можно отдать ops как следствие posted.", { nostro: 14, books: 8, flagsAdd: ["iban_ok"] }, "q5"),
    fail: o("fail", "Всё в кошелёк", "Чужой IBAN зачислили Анне «чтобы не висело».", { nostro: -12, books: -10, flagsAdd: ["iban_mess"] }, "q5"),
  },
  q5: {
    id: "q5",
    day: "День 5 · FX и клиринг",
    title: "Две валюты, два журнала",
    from: "treasury",
    incident:
      "Анна покупает 10 USD. Dev хочет одну проводку «−126 500 UZS +10 USD». Trial смешает яблоки с ящиками. Напишите контракт.",
    hint: "Пробный баланс — по валюте. Спред — отдельная нога fee.",
    lesson:
      "Нельзя смешать UZS и USD в одном ордере. Два журнала: UZS сходится, USD сходится. Спред в bps — CR на доход комиссии. Settle мерчанта — это T+1 с nostro, не момент capture.",
    handbook: ["fx", "trial", "clearing", "journal"],
    kind: "write",
    prompt: "Ноги UZS, ноги USD, что делать со спредом, зачем T+1 settle мерчанта.",
    placeholder:
      "UZS: DR Анна (пассив) / CR FX-позиция UZS. Плюс спред — CR комиссия.\nUSD: DR FX-позиция USD / CR Анна USD.\nСпред не прячем в mid-курсе.\nSettle мерчанта T+1: DR Cafe CR nostro — это не capture.",
    minChars: 100,
    passNeed: 3,
    checks: [
      { id: "uzs", any: ["uzs", "сум", "дебет анн", "fx позиция"], why: "UZS журнал.", flagsAdd: ["fx_ok"] },
      { id: "usd", any: ["usd", "доллар", "кредит анн"], why: "USD журнал." },
      { id: "spr", any: ["спред", "комисс", "fee", "bps"], why: "Спред не прячем в курсе молча." },
      { id: "set", any: ["settle", "сейл", "nostro", "t+1", "клиринг", "мерчант"], why: "Capture ≠ выплата мерчанту." },
    ],
    pass: o("pass", "Казначейство слышит", "USD и UZS сходятся по отдельности.", { fx: 14, books: 8 }, "q6"),
    fail: o("fail", "Один journal на две валюты", "Пробный баланс врёт всю неделю.", { fx: -12, books: -10, flagsAdd: ["fx_mix"] }, "q6"),
  },
  q6: {
    id: "q6",
    day: "День 6 · файл",
    title: "Trailer зарплаты",
    from: "HR + nostro",
    incident: "salary_20260818.csv: строки 35 000, trailer 999 999. HR: «грузите, завтра поправим». Заполните правило.",
    hint: "Повтор имени файла — не вторая зарплата.",
    lesson:
      "Зарплатный файл — пачка входящих IBAN. Trailer в конце файла должен равняться сумме строк. Иначе пачку не проводим. Повтор того же fileName — 409. Строка с неизвестным IBAN — reject или suspense, не зачисление Анне.",
    handbook: ["salary", "iban-in", "suspense", "idempotency"],
    kind: "fill",
    prompt: "Напишите правило файла. Можно вставить примеры — это учебный контракт, не экзамен на память.",
    worked:
      "Контракт, который ops может проверить:\n• сумма строк ≠ trailer → не грузим весь файл (reject)\n• тот же fileName повторно → 409, проводки не дублируем\n• чужой IBAN в строке → suspense или reject строки, не кредит Анне",
    slots: [
      {
        id: "tr",
        label: "Trailer",
        accept: ["не груз", "reject", "отказ", "≠", "не равен", "must"],
        hint: "Если сумма строк ≠ trailer",
        explain: "Trailer — контрольная сумма в конце файла. 35 000 в строках и 999 999 в trailer = мусор. HR «завтра поправим» не основание проводить.",
        example: "Если сумма строк не равна trailer — не грузить, reject",
      },
      {
        id: "dup",
        label: "Тот же fileName",
        accept: ["409", "дубл", "один раз", "idempot", "не второй"],
        hint: "Повтор файла",
        explain: "Как Idempotency-Key у P2P: один файл — одна пачка проводок. Второй POST с тем же именем не должен начислить зарплату ещё раз.",
        example: "Повтор fileName → 409, не вторая зарплата",
      },
      {
        id: "iban",
        label: "Строка с чужим IBAN",
        accept: ["reject", "suspense", "невыясн", "остальн"],
        hint: "Не валить весь файл молча в Анну",
        explain: "IBAN не из плана счетов — невыясненные или отказ строки. Остальные строки по политике: либо грузим, либо валим весь файл, но это надо назвать.",
        example: "Чужой IBAN → suspense или reject строки",
      },
    ],
    passNeed: 2,
    pass: o("pass", "Файл как платёж", "HR больше не кормит ledger мусором.", { salary: 14, trust: 8, flagsAdd: ["file_ok"] }, "end"),
    fail: o("fail", "Загрузили как просили", "Двойная зарплата в понедельник. HR «это же тот же файл».", { salary: -14, money: -10, flagsAdd: ["file_chaos"] }, "end"),
  },
};

const endings: Record<string, QuestEnding> = {
  "books-clean": {
    id: "books-clean",
    title: "Главкнига закрылась",
    tone: "mint",
    xp: 210,
    summary: "Ноги P2P, холд≠ledger, реверс refund, IBAN/suspense, FX по валютам, trailer файла. Ops может сдать день.",
    debrief: [
      "Двойная запись — не метафора, а две ноги с journalId.",
      "Capture и settle — разные дни и разные счета.",
      "Файл без trailer — это не «интеграция с банком».",
    ],
  },
  "books-messy": {
    id: "books-messy",
    title: "День сдали Excel-ом",
    tone: "gold",
    xp: 130,
    summary: "Часть швов вы назвали. Trial ещё дырявый или FX смешали. Вас не уволили — закрытие уедет на ручные корректировки.",
    debrief: [
      "Сторно дешевле, чем «поправим баланс».",
      "Повторите ночь: один файл и один refund важнее слайда «core banking».",
    ],
  },
  "trial-hole": {
    id: "trial-hole",
    title: "Пробный баланс не 0",
    tone: "rose",
    xp: 70,
    summary: "Refund дырой или журнал в Excel. 1С не примет день. CFO увидит diff раньше, чем ваш демо-стенд.",
    debrief: [
      "CR без DR — не «возврат клиенту», а дыра.",
      "Available и ledger — разные колонки.",
    ],
  },
  "nostro-blind": {
    id: "nostro-blind",
    title: "Nostro никто не смотрит",
    tone: "rose",
    xp: 75,
    summary: "Входящие и исходящие свалили в кошелёк. MT103 нет. Невыясненные потерялись.",
    debrief: [
      "Корсчёт — актив банка, не «магия IBAN».",
      "Чужой IBAN → suspense, не соседний клиент.",
    ],
  },
};

export const BANK_QUEST: QuestCampaign = {
  id: "bank",
  title: "Ночь на ledger",
  product: "Malo Core",
  teaser: "Проводки, холд, IBAN, FX, зарплатный файл. Пишете ноги журнала — не выбираете «как у банка».",
  minutes: 20,
  systems: [
    { id: "ledger", name: "ledger" },
    { id: "cards", name: "card-processor" },
    { id: "nostro", name: "nostro / IBAN" },
    { id: "fx", name: "treasury FX" },
    { id: "salary", name: "salary file" },
    { id: "clearing", name: "clearing T+1" },
  ],
  metrics: [
    { id: "books", label: "Сходимость книг", good: "high" },
    { id: "money", label: "Целостность денег", good: "high" },
    { id: "cards", label: "Касса / холд", good: "high" },
    { id: "nostro", label: "Корсчёт", good: "high" },
    { id: "fx", label: "FX по валютам", good: "high" },
    { id: "salary", label: "Зарплатный файл", good: "high" },
    { id: "trust", label: "Доверие ops", good: "high" },
  ],
  emptyMetrics: () => ({ books: 46, money: 50, cards: 48, nostro: 44, fx: 42, salary: 40, trust: 55 }),
  startBeat: "q1",
  beats,
  endings,
  pickEnding: (metrics, flags) => {
    if ((metrics.books ?? 0) < 40 || flags.includes("refund_hole") || flags.includes("excel_books")) return "trial-hole";
    if ((metrics.nostro ?? 0) < 40 || flags.includes("iban_mess")) return "nostro-blind";
    const clean =
      (metrics.books ?? 0) >= 68 &&
      (metrics.money ?? 0) >= 60 &&
      flags.includes("p2p_legs") &&
      flags.includes("hold_ok") &&
      flags.includes("refund_ok") &&
      flags.includes("iban_ok") &&
      flags.includes("fx_ok") &&
      flags.includes("file_ok");
    if (clean) return "books-clean";
    return "books-messy";
  },
};
