import { o, type QuestBeat, type QuestCampaign, type QuestEnding } from "@/content/play/questCore";

const beats: Record<string, QuestBeat> = {
  q1: {
    id: "q1",
    day: "День 1 · въезд",
    title: "Что такое сессия",
    from: "CityPark · концессия",
    incident:
      "Камера видит номер. Эквайер видит оплату. Иногда сессия висит OPEN после выезда. Юрист: «напишите, когда сессия закрыта». Без вашего текста биллинг врёт.",
    hint: "Источник правды — не «как у парковки мечты».",
    kind: "write",
    prompt:
      "Определение закрытой сессии: событие выезда, таймаут, оплата. Что если камера молчит, а оплата прошла.",
    placeholder: "Сессия CLOSED, когда …\nЕсли камера молчит: …\nЕсли оплата есть, выезда нет: …",
    minChars: 80,
    passNeed: 2,
    checks: [
      { id: "close", any: ["выезд", "closed", "закрыт", "exit", "камера"], why: "Назвали событие закрытия.", flagsAdd: ["def_ok"] },
      { id: "pay", any: ["оплат", "эквай", "hold", "списан"], why: "Связь с деньгами." },
      { id: "gap", any: ["молчит", "таймаут", "ttl", "нет события", "unknown"], why: "Дырка камеры." },
    ],
    pass: o("pass", "Определение есть", "Биллинг можно спорить с юристом.", { sessions: 12, trust: 8, money: 6 }, "q2"),
    fail: o("fail", "Сессия «как получится»", "OPEN висит неделями. Споры вручную.", { sessions: -12, dispute: -10, flagsAdd: ["no_def"] }, "q2"),
  },
  q2: {
    id: "q2",
    day: "День 2 · события",
    title: "Камера vs оплата",
    from: "event-bus + acquiring",
    incident: "В логе: ENTER, PAY_OK, нет EXIT. Админка рисует OPEN и повторно холдит. Найдите мины в цепочке.",
    hint: "Оплата не закрывает сессию сама. Нет EXIT ≠ новый ENTER.",
    kind: "spot",
    block: {
      kind: "spot",
      title: "Цепочка сессии",
      prompt: "Что ломает деньги и спор.",
      lines: [
        { id: "1", text: "PAY_OK автоматически делает CLOSED", bad: true, why: "Гость ещё на парковке." },
        { id: "2", text: "Нет EXIT 24ч → UNKNOWN, не новый ENTER", bad: false, why: "Честный разрыв." },
        { id: "3", text: "Повтор ENTER того же GRZ = новая сессия всегда", bad: true, why: "Двойной биллинг." },
        { id: "4", text: "Idempotency на создание сессии: site+GRZ+окно", bad: false, why: "Ключ." },
        { id: "5", text: "Камера 5xx: клиент ретраит ENTER без ключа", bad: true, why: "Две OPEN." },
      ],
    },
    pass: o("pass", "Цепочка честная", "Нет второго холда на ту же машину.", { money: 14, cameras: 8, flagsAdd: ["chain_ok"] }, "q3"),
    fail: o("fail", "Двойной OPEN", "Камера моргнула — две сессии.", { money: -14, cameras: -8, flagsAdd: ["chain_bad"] }, "q3"),
  },
  q3: {
    id: "q3",
    day: "День 3 · правда",
    title: "Кто master",
    from: "Спор гостя",
    incident: "Гость: «я выехал, списали дважды». Камера, эквайер и админка показывают разное. Разложите.",
    hint: "Не всё — REST. Не всё — камера.",
    kind: "sort",
    block: {
      kind: "sort",
      title: "Источник правды",
      prompt: "Master / сверка / не правда.",
      buckets: [
        { id: "master", title: "Master сессии" },
        { id: "recon", title: "Сверка" },
        { id: "no", title: "Не правда" },
      ],
      items: [
        { id: "a", text: "session-api: статус OPEN/CLOSED/UNKNOWN", bucket: "master", why: "Один enum." },
        { id: "b", text: "Файл эквайера T+1", bucket: "recon", why: "Деньги, не выезд." },
        { id: "c", text: "Кадр камеры в Slack", bucket: "no", why: "Не контракт." },
        { id: "d", text: "Событие EXIT с site_id+GRZ+ts", bucket: "master", why: "Факт выезда." },
        { id: "e", text: "«Оператор видел глазами»", bucket: "no", why: "Не воспроизвести." },
      ],
    },
    pass: o("pass", "Один enum", "Спор можно разобрать.", { sessions: 10, dispute: 12, flagsAdd: ["master_ok"] }, "q4"),
    fail: o("fail", "Правда в Slack", "Каждый спор — созвон.", { dispute: -12, load: 10, flagsAdd: ["slack_truth"] }, "q4"),
  },
  q4: {
    id: "q4",
    day: "День 4 · спор",
    title: "Напишите AC диспута",
    from: "Поддержка CityPark",
    incident: "Гость жмёт «оспорить». Сейчас тикет в WhatsApp концессии. Напишите AC: что система делает, что видит гость, когда деньги не трогаем.",
    hint: "Given OPEN/CLOSED/UNKNOWN. Не «разберём вручную» как единственный путь.",
    echoFrom: "q1",
    kind: "write",
    prompt: "AC диспута: позитив (камера ошиблась), негатив (сессия CLOSED штатно), край (нет EXIT).",
    placeholder: "Given …\nWhen гость оспаривает\nThen …",
    minChars: 90,
    passNeed: 3,
    checks: [
      { id: "gherkin", any: ["given", "when", "then", "если", "когда", "тогда"], why: "Наблюдаемые шаги." },
      { id: "status", any: ["unknown", "open", "closed", "статус"], why: "Ветки статуса." },
      { id: "money", any: ["холд", "возврат", "не спис", "эквай", "деньги"], why: "Что с деньгами." },
      { id: "guest", any: ["гость видит", "показыва", "админк", "номер спор"], why: "Ответ человеку." },
    ],
    pass: o("pass", "Диспут в продукте", "WhatsApp не единственный канал.", { dispute: 14, trust: 8, flagsAdd: ["dispute_ac"] }, "q5"),
    fail: o("fail", "Спор в чате", "Концессия тонет. Метрика диспута серая.", { dispute: -12, load: 10, flagsAdd: ["dispute_chat"] }, "q5"),
  },
  q5: {
    id: "q5",
    day: "День 5 · камера",
    title: "Ещё ML на въезде, в этом релизе",
    from: "Спонсор",
    incident: "«Команда гибкая. Новый детектор номеров и свой Kafka кадров — в том же окне, что определение сессии».",
    hint: "Нет без обмена — тоже решение.",
    kind: "choice",
    options: [
      o("a", "Нет новым швам. Дожимаем CLOSED/UNKNOWN и диспут. Письмо с CoD.", "Спонсор злится, биллинг жив.", { trust: -6, load: -8, sessions: 6, flagsAdd: ["said_no"] }, "end"),
      o("b", "Впишем ML и шину, народ не любит ждать.", "Два шва. Определение сессии не протестируют.", { load: 18, money: -8, cameras: 6, flagsAdd: ["scope_lie"] }, "end"),
      o("c", "Кивнуть и вырезать ML в четверг.", "В пятницу всплывёт.", { trust: -10, load: 8, flagsAdd: ["hidden_cut"] }, "end"),
    ],
  },
};

const endings: Record<string, QuestEnding> = {
  clean: {
    id: "clean",
    title: "Парковка с одним enum",
    tone: "mint",
    xp: 170,
    summary: "Сессия определена текстом. UNKNOWN вместо второго OPEN. Диспут не в WhatsApp.",
    debrief: ["Вы написали, когда CLOSED — биллинг перестал быть магией.", "Камера не master денег."],
  },
  money: {
    id: "money",
    title: "Двойной холд на GRZ",
    tone: "rose",
    xp: 70,
    summary: "Ретрай камеры без ключа. Гости видят два списания. Концессия в чате.",
    debrief: ["ENTER без идемпотентности = две OPEN."],
  },
  theater: {
    id: "theater",
    title: "ML и кадры в Slack",
    tone: "violet",
    xp: 85,
    summary: "Детектор номеров есть. Определения сессии нет. Спор смотрят глазами.",
    debrief: ["Кадр не контракт. Scope сожрал lock статуса."],
  },
  messy: {
    id: "messy",
    title: "Паркуют, спорят руками",
    tone: "gold",
    xp: 110,
    summary: "Выезд в целом закрывается. Диспут ещё полуручной. Релиз есть.",
    debrief: ["Определение вы написали, AC диспута — нет или слабо."],
  },
  silent: {
    id: "silent",
    title: "OPEN на неделю",
    tone: "gold",
    xp: 50,
    summary: "Метрики серые. Никто не подпишет, когда сессия кончилась.",
    debrief: ["Без текста CLOSED продукт врёт тихо."],
  },
};

export const CITYPARK_QUEST: QuestCampaign = {
  id: "citypark",
  title: "Guest · сессия CityPark",
  product: "CityPark",
  teaser: "Парковка. Пишете, когда сессия CLOSED, и AC диспута. Камера и эквайер спорят — решает ваш текст.",
  minutes: 16,
  systems: [
    { id: "session-api", name: "session-api" },
    { id: "camera", name: "anpr-camera" },
    { id: "acq", name: "acquiring" },
    { id: "guest-app", name: "guest-app" },
  ],
  metrics: [
    { id: "sessions", label: "Статус сессии", good: "high" },
    { id: "money", label: "Биллинг / холд", good: "high" },
    { id: "cameras", label: "События камеры", good: "high" },
    { id: "dispute", label: "Разбор спора", good: "high" },
    { id: "trust", label: "Доверие концессии", good: "high" },
    { id: "load", label: "Нагрузка команды", good: "low" },
  ],
  emptyMetrics: () => ({ sessions: 50, money: 48, cameras: 44, dispute: 46, trust: 52, load: 38 }),
  startBeat: "q1",
  beats,
  endings,
  pickEnding: (m, f) => {
    if ((m.load ?? 0) >= 76 || f.includes("scope_lie")) return "theater";
    if ((m.money ?? 0) < 40 || f.includes("chain_bad")) return "money";
    if ((m.sessions ?? 0) >= 66 && (m.dispute ?? 0) >= 56 && f.includes("def_ok") && (f.includes("dispute_ac") || f.includes("chain_ok")))
      return "clean";
    if ((m.sessions ?? 0) >= 52 && (m.trust ?? 0) >= 44) return "messy";
    return "silent";
  },
};
