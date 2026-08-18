import { o, type QuestBeat, type QuestCampaign, type QuestEnding } from "@/content/play/questCore";

const beats: Record<string, QuestBeat> = {
  q1: {
    id: "q1",
    day: "День 1 · регистратура",
    title: "Две записи на 10:00",
    from: "MedQueue · главврач",
    incident:
      "Пациент записался с двух телефонов. Два CONFIRMED на один слот. Регистратура орёт. PO: «кнопку обновить». Слоты — не кошелёк.",
    hint: "Master слота, не UI.",
    kind: "choice",
    options: [
      o("a", "Слот — master. Второй POST с тем же slot_id+окно → конфликт, не второй CONFIRMED.", "Шов записи.", { slots: 12, trust: 6, load: 4, flagsAdd: ["slot_master"] }, "q2"),
      o("b", "Покажем красивый календарь и кнопку обновить.", "Два пациента в кабинете.", { slots: -12, wait: -8, flagsAdd: ["pretty"] }, "q2"),
      o("c", "Kafka слотов «чтобы не терялись».", "Шина без lock.", { slots: -6, load: 12, flagsAdd: ["kafka"] }, "q2"),
    ],
  },
  q2: {
    id: "q2",
    day: "День 1 · правило",
    title: "Напишите lock слота",
    from: "schedule-api",
    incident: "Dev: «напишите правило, иначе я придумаю SELECT FOR UPDATE как получится». Это ваш текст уйдёт в SRS.",
    hint: "Кто держит слот, TTL, что видит второй пациент.",
    kind: "write",
    prompt: "Правило: создание записи на слот. Lock, TTL, ответ второму, что с no-show.",
    placeholder: "Слот считается занятым, если …\nTTL lock: …\nВторой пациент видит: …\nNo-show: …",
    minChars: 80,
    passNeed: 3,
    checks: [
      { id: "lock", any: ["lock", "лок", "занят", "hold", "бронь"], why: "Есть захват.", flagsAdd: ["has_lock"] },
      { id: "ttl", any: ["ttl", "минут", "истекает", "таймаут", "секунд"], why: "Lock не вечный." },
      { id: "second", any: ["409", "занят", "второй", "конфликт", "не confirmed"], why: "Второй не CONFIRMED." },
      { id: "noshow", any: ["no-show", "не яви", "освобожд", "слот снова"], why: "Слот возвращается." },
    ],
    pass: o("pass", "Lock в SRS", "Двойной CONFIRMED закрыт текстом.", { slots: 14, noshow: 8, trust: 6 }, "q3"),
    fail: o("fail", "Правила нет", "Dev зальёт SELECT без TTL. Слоты повиснут.", { slots: -10, wait: -8, load: 8, flagsAdd: ["no_lock"] }, "q3"),
  },
  q3: {
    id: "q3",
    day: "День 2 · кто чем владеет",
    title: "Не путать врача и SMS",
    from: "Архитектор поликлиники",
    incident: "Все тянут статус записи к себе. Сопоставьте master.",
    hint: "sms-gw не владеет слотом.",
    kind: "match",
    block: {
      kind: "match",
      title: "Master записи",
      prompt: "Кто чем владеет.",
      pairs: [
        { left: "schedule-api", right: "Слот и lock" },
        { left: "ehr-bridge", right: "Медкарта, не календарь" },
        { left: "sms-gw", right: "OTP, не CONFIRMED" },
        { left: "kiosk", right: "Очередь в холле, не слот врача" },
      ],
    },
    pass: o("pass", "Швы ясны", "Ops знает, куда смотреть.", { trust: 8, wait: 6, flagsAdd: ["owners"] }, "q4"),
    fail: o("fail", "Все владеют всем", "Статус в трёх местах.", { trust: -8, wait: -6, flagsAdd: ["owners_bad"] }, "q4"),
  },
  q4: {
    id: "q4",
    day: "День 3 · логи",
    title: "В логах ФИО и диагноз",
    from: "ИБ · поликлиника",
    incident: "BI выгрузил «дубли записей» по ФИО. В логах sms-gw — диагноз в query. Разберите запрос и логи.",
    hint: "Ключ — slot_id, не ФИО. PII не в URL.",
    kind: "spot",
    block: {
      kind: "spot",
      title: "Почему цифра и ИБ врут",
      prompt: "Отметьте ложь и утечку.",
      lines: [
        { id: "1", text: "Дубли клеим по ФИО пациента", bad: true, why: "Не ключ слота." },
        { id: "2", text: "Окно как в AC: 24ч", bad: false, why: "Совпадает." },
        { id: "3", text: "GET /sms?diag=J06&name=Иванов", bad: true, why: "PII в query." },
        { id: "4", text: "Exclude тестовых врачей явный", bad: false, why: "Честный scope." },
        { id: "5", text: "ERROR выкинули, смотрим только CONFIRMED", bad: true, why: "Скрыли ретраи." },
      ],
    },
    pass: o("pass", "Словарь и PII", "ИБ не отзовёт контур.", { privacy: 16, trust: 8, flagsAdd: ["privacy_ok"] }, "q5"),
    fail: o("fail", "Утечка и ФИО", "Роскомнадзор в чате. Слоты ни при чём.", { privacy: -18, trust: -10, flagsAdd: ["leak"] }, "q5"),
  },
  q5: {
    id: "q5",
    day: "День 4 · SMS",
    title: "Напишите текст пациенту",
    from: "Коммуникации",
    incident: "Шаблон: «Иванов И.И., кардиология, диагноз уточните в СМС». Юрист уже красный. Напишите шаблон без PII. Слот и время можно.",
    hint: "Не ФИО, не диагноз, не карта. Код записи и время.",
    echoFrom: "q2",
    kind: "write",
    prompt: "SMS/пуш: запись подтверждена или слот занят. Без ПДн сверх минимума.",
    placeholder: "Запись {code} на {time}. Если слот занят: …",
    minChars: 40,
    passNeed: 2,
    checks: [
      { id: "code", any: ["код", "номер записи", "slot", "id"], why: "Идентификатор записи, не ФИО." },
      { id: "time", any: ["время", "часов", "10:", "слот"], why: "Когда прийти." },
      { id: "pii", any: ["диагноз", "фио", "иванов", "паспорт", "снилс", "карт"], why: "ПДн в шаблоне — провал.", forbid: true },
    ],
    pass: o("pass", "Шаблон чистый", "ИБ подпишет. Пациент понимает.", { privacy: 10, trust: 8, flagsAdd: ["sms_ok"] }, "q6"),
    fail: o("fail", "ПДн в SMS", "Шаблон утёк. Контур стопнут.", { privacy: -16, trust: -8, flagsAdd: ["sms_pii"] }, "q6"),
  },
  q6: {
    id: "q6",
    day: "День 5 · очередь",
    title: "Киоск в холле",
    from: "Главврач",
    incident: "Киоск показывает талон. PO хочет, чтобы киоск сам CONFIRMED слот врача, «чтобы не ходить в регистратуру».",
    hint: "Киоск — очередь холла, не calendar.",
    kind: "choice",
    options: [
      o("a", "Киоск читает статус, не пишет CONFIRMED. Слот — schedule-api.", "Два контура не склеились.", { wait: 10, slots: 6, flagsAdd: ["kiosk_ok"] }, "end"),
      o("b", "Пусть киоск пишет CONFIRMED, меньше очереди в окно.", "Третий master. Завтра снова два пациента.", { slots: -14, wait: 8, flagsAdd: ["kiosk_write"] }, "end"),
      o("c", "Отключим киоск до релиза платформы записи.", "Очередь в холле без причины.", { wait: -12, load: 6, flagsAdd: ["kiosk_off"] }, "end"),
    ],
  },
};

const endings: Record<string, QuestEnding> = {
  clean: {
    id: "clean",
    title: "Поликлиника без двойного слота",
    tone: "mint",
    xp: 170,
    summary: "Lock, TTL и SMS без ПДн. Киоск не владеет календарём. Главврач понимает шов.",
    debrief: ["Вы написали правило слота — это и есть продукт.", "ФИО в логах не стало метрикой."],
  },
  double: {
    id: "double",
    title: "Два пациента в кабинете",
    tone: "rose",
    xp: 65,
    summary: "Второй CONFIRMED прошёл. Врач в ступоре. Это не кнопка обновить.",
    debrief: ["Без lock слот — общая память."],
  },
  leak: {
    id: "leak",
    title: "ПДн в SMS и логах",
    tone: "rose",
    xp: 70,
    summary: "ИБ стопнул рассылку. Записи живы, доверие нет.",
    debrief: ["Ключ слота не ФИО. Диагноз не query."],
  },
  theater: {
    id: "theater",
    title: "Шина слотов",
    tone: "violet",
    xp: 80,
    summary: "Kafka есть. Кто держит 10:00 — никто не знает.",
    debrief: ["Транспорт не lock."],
  },
  messy: {
    id: "messy",
    title: "Запись работает, швы живут",
    tone: "gold",
    xp: 115,
    summary: "Двойных меньше. Киоск или SMS ещё спорные. Регистратура дышит.",
    debrief: ["Часть правила вы написали, часть оставили Dev."],
  },
  silent: {
    id: "silent",
    title: "Очередь как была",
    tone: "gold",
    xp: 50,
    summary: "Цифры серые. Master слота не назван. Через месяц снова два CONFIRMED.",
    debrief: ["Нет катастрофы на приёмке — и нет lock."],
  },
};

export const MEDQUEUE_QUEST: QuestCampaign = {
  id: "medqueue",
  title: "Guest · запись MedQueue",
  product: "MedQueue",
  teaser: "Поликлиника. Пишете lock слота и SMS без ПДн. Два CONFIRMED — исход вашей формулировки.",
  minutes: 16,
  systems: [
    { id: "schedule-api", name: "schedule-api" },
    { id: "ehr", name: "ehr-bridge" },
    { id: "sms", name: "sms-gw" },
    { id: "kiosk", name: "kiosk" },
  ],
  metrics: [
    { id: "slots", label: "Целостность слотов", good: "high" },
    { id: "noshow", label: "Возврат no-show", good: "high" },
    { id: "privacy", label: "ПДн / ИБ", good: "high" },
    { id: "wait", label: "Очередь в холле", good: "high" },
    { id: "trust", label: "Доверие главврача", good: "high" },
    { id: "load", label: "Нагрузка команды", good: "low" },
  ],
  emptyMetrics: () => ({ slots: 50, noshow: 46, privacy: 58, wait: 48, trust: 52, load: 36 }),
  startBeat: "q1",
  beats,
  endings,
  pickEnding: (m, f) => {
    if (f.includes("kafka") && (m.slots ?? 0) < 58) return "theater";
    if (f.includes("leak") || f.includes("sms_pii") || (m.privacy ?? 0) < 40) return "leak";
    if ((m.slots ?? 0) < 40 || f.includes("kiosk_write") || f.includes("no_lock")) return "double";
    if ((m.slots ?? 0) >= 68 && (m.privacy ?? 0) >= 64 && f.includes("has_lock") && (f.includes("sms_ok") || f.includes("kiosk_ok")))
      return "clean";
    if ((m.slots ?? 0) >= 52 && (m.trust ?? 0) >= 45) return "messy";
    return "silent";
  },
};
