import type { ContentBlock } from "@/types/content";

const o = (text: string, good: boolean, why: string) => ({ text, good, why });

export const JUNIOR_EXTRAS: Record<string, ContentBlock[]> = {
  "junior-1-stories": [
    {
      kind: "sort",
      title: "Нарезка: story / task / bug / spike",
      prompt: "Бэклог после жалоб на дубль. Не всё — user story.",
      buckets: [
        { id: "s", title: "Story" },
        { id: "t", title: "Task" },
        { id: "b", title: "Bug" },
        { id: "k", title: "Spike" },
      ],
      items: [
        { id: "a", text: "Коллектор видит одно confirmed тело", bucket: "s", why: "Ценность роли." },
        { id: "b", text: "Поднять индекс на payment_id", bucket: "t", why: "Нет самостоятельной ценности для роли." },
        { id: "c", text: "В проде второй principal на retry Humo", bucket: "b", why: "Слом текущего контракта." },
        { id: "d", text: "Не ясно, окно идемпотентности 24ч или TTL шлюза", bucket: "k", why: "Незнание, не фича." },
        { id: "e", text: "Сообщение 409 человеческим языком", bucket: "s", why: "Поведение для человека." },
        { id: "f", text: "Поменять линтер", bucket: "t", why: "Инженерия без need." },
      ],
    },
    {
      kind: "spot",
      title: "Три истории в одной",
      prompt: "Отметьте, что надо вынести.",
      lines: [
        { id: "1", text: "Детект дубля в API", bad: false, why: "Ядро ценности." },
        { id: "2", text: "Новый дашборд для ЦБ", bad: true, why: "Другой стейкхолдер и ритм." },
        { id: "3", text: "Редизайн всей карточки CRM", bad: true, why: "Не small." },
        { id: "4", text: "Текст причины на текущем экране", bad: false, why: "Тонкий UX-срез." },
        { id: "5", text: "Миграция шлюза", bad: true, why: "Другой change." },
      ],
    },
    {
      kind: "scene",
      title: "Груминг: «это же одна тема»",
      setting: "PO не хочет резать. Команда молчит.",
      steps: [
        {
          from: "PO",
          line: "Ну это всё про Humo, зачем дробить.",
          options: [
            o("Согласны, один ticket на месяц.", false, "Не будет инкремента."),
            o("Тема одна, инкременты разные: сначала no-op retry, потом экран, потом отчёт.", true, "Тема ≠ story."),
            o("Пусть SM решает.", false, "Это ваш стол."),
          ],
        },
      ],
    },
  ],
  "junior-1-ac": [
    {
      kind: "order",
      title: "Given / When / Then на дубле",
      prompt: "Соберите AC, который QA не возненавидит.",
      items: [
        { id: "1", text: "Given: уже есть confirmed principal по payment_id X", pos: 1 },
        { id: "2", text: "When: шлюз присылает retry с тем же X в окне 24ч", pos: 2 },
        { id: "3", text: "Then: HTTP 409, баланс не меняется, пишется audit", pos: 3 },
        { id: "4", text: "And: оператор видит «повтор, тело не снято»", pos: 4 },
        { id: "5", text: "Neg: другой payment_id — создаётся новое списание", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "AC «система работает корректно»",
      prompt: "Что не является критерием.",
      lines: [
        { id: "1", text: "Система работает корректно и удобно", bad: true, why: "Нет fail." },
        { id: "2", text: "Then: второй confirmed principal отсутствует в ledger", bad: false, why: "Наблюдаемо." },
        { id: "3", text: "И ещё всё как в Figma", bad: true, why: "Figma не оракул денег." },
        { id: "4", text: "Timeout шлюза 3с → статус UNKNOWN, не confirmed", bad: false, why: "Негатив." },
        { id: "5", text: "Желательно без багов", bad: true, why: "Пусто." },
      ],
    },
    {
      kind: "match",
      title: "Тип проверки",
      prompt: "Свяжите AC и вид.",
      pairs: [
        { left: "Счастливый retry → 409", right: "Позитив" },
        { left: "Чужой payment_id → новое списание", right: "Негатив / граница" },
        { left: "Двойной клик оператора", right: "Край" },
        { left: "Текст 409 без stacktrace", right: "Сообщение" },
        { left: "Нет прав — 403, не 500", right: "Авторизация" },
      ],
    },
  ],
  "junior-1-usecase": [
    {
      kind: "order",
      title: "Use case: повторный callback",
      prompt: "Соберите каркас, не user story в одну строку.",
      items: [
        { id: "1", text: "Актор: шлюз Humo (система-система)", pos: 1 },
        { id: "2", text: "Предусловие: платёж уже confirmed", pos: 2 },
        { id: "3", text: "Основной: retry → идемпотентный no-op", pos: 3 },
        { id: "4", text: "Альтернатива: UNKNOWN / таймаут", pos: 4 },
        { id: "5", text: "Постусловие: один principal, есть audit", pos: 5 },
      ],
    },
    {
      kind: "sort",
      title: "Это use case или нет",
      prompt: "Не всё достойно отдельного сценария.",
      buckets: [
        { id: "uc", title: "Use case" },
        { id: "no", title: "Не сценарий" },
      ],
      items: [
        { id: "a", text: "Шлюз присылает callback", bucket: "uc", why: "Цель и актор." },
        { id: "b", text: "Поле email varchar(255)", bucket: "no", why: "Данные, не сценарий." },
        { id: "c", text: "Оператор ищет loan по id", bucket: "uc", why: "Цель." },
        { id: "d", text: "Цвет кнопки", bucket: "no", why: "UI-деталь." },
        { id: "e", text: "Клиент оспаривает списание", bucket: "uc", why: "Отдельная цель." },
      ],
    },
    {
      kind: "case",
      title: "QA просит «все ветки»",
      situation: "В use case 19 альтернатив. Никто не читает.",
      question: "Как режете?",
      options: [
        o("Оставляете 19 — полнота.", false, "Мёртвый документ."),
        o("Основной + 3 альтернативы, которые меняют деньги или юридический риск. Остальное — в AC списком.", true, "Читаемость."),
        o("Кидаете в Confluence и надеетесь.", false, "Надежда не метод."),
      ],
      debrief: "Use case живёт, пока его можно прогнать за 3 минуты вслух.",
    },
  ],
  "junior-1-clarify": [
    {
      kind: "scene",
      title: "PO отвечает «ну понятно же»",
      setting: "Груминг. История без AC. Вас просят оценить.",
      steps: [
        {
          from: "PO",
          line: "Ну там как обычно, идемпотентность.",
          options: [
            o("Ок, 5 SP.", false, "Оценили дыру."),
            o("Какой ключ, какое окно, что на таймаут, кто видит ошибку? Без этого не оцениваем.", true, "Clarify до estimate."),
            o("Пусть архитектор напишет.", false, "Вы фасилитируете ясность."),
          ],
        },
        {
          from: "Dev",
          line: "Я уже начал Kafka, не тормози.",
          options: [
            o("Ок, догоним документом.", false, "Код без контракта."),
            o("Пауза: 15 минут на правило. Kafka может оказаться не нужна.", true, "Дешёвая ясность."),
            o("Эскалируйте сами.", false, "Вы в комнате."),
          ],
        },
      ],
    },
    {
      kind: "sort",
      title: "Что уточнять в первую очередь",
      prompt: "Не все вопросы одинаково дороги.",
      buckets: [
        { id: "now", title: "Сейчас" },
        { id: "later", title: "Потом" },
        { id: "never", title: "Не надо" },
      ],
      items: [
        { id: "a", text: "Что считается дублем для денег", bucket: "now", why: "Ядро." },
        { id: "b", text: "Иконка 409", bucket: "later", why: "После правила." },
        { id: "c", text: "Любимый фреймворк стажёра", bucket: "never", why: "Шум." },
        { id: "d", text: "Поведение при таймауте шлюза", bucket: "now", why: "Деньги и статусы." },
        { id: "e", text: "Цвет бейджа", bucket: "later", why: "Косметика." },
      ],
    },
    {
      kind: "spot",
      title: "Список вопросов на 2 часа",
      prompt: "Что выкинуть, чтобы PO не сбежал.",
      lines: [
        { id: "1", text: "Ключ идемпотентности", bad: false, why: "Деньги." },
        { id: "2", text: "Любимый шрифт оператора", bad: true, why: "Не сейчас." },
        { id: "3", text: "Кто Accountable за правило", bad: false, why: "Политика." },
        { id: "4", text: "Названия переменных в коде", bad: true, why: "Dev, не PO." },
        { id: "5", text: "Что показываем клиенту vs оператору", bad: false, why: "Два стейкхолдера." },
      ],
    },
  ],
  "junior-2-brd": [
    {
      kind: "match",
      title: "Секции BRD, которые живут",
      prompt: "Не пишите роман.",
      pairs: [
        { left: "Проблема", right: "14 повторных principal / неделя" },
        { left: "Need", right: "Одно тело на один платёж" },
        { left: "Scope", right: "Humo retry, не новый шлюз" },
        { left: "Успех", right: "−50% жалоб за 30 дней" },
        { left: "Ограничения", right: "Нельзя трогать ledger вручную" },
      ],
    },
    {
      kind: "spot",
      title: "BRD на 48 страниц",
      prompt: "Что убить.",
      lines: [
        { id: "1", text: "История компании с 1998", bad: true, why: "Не этот документ." },
        { id: "2", text: "In/out of scope таблицей", bad: false, why: "Граница." },
        { id: "3", text: "Копипаст BABOK", bad: true, why: "Учебник." },
        { id: "4", text: "Стейкхолдеры и RACI на правило дубля", bad: false, why: "Решения." },
        { id: "5", text: "Скриншоты чужого продукта «для вдохновения»", bad: true, why: "Option без need." },
      ],
    },
    {
      kind: "case",
      title: "BRD никто не подписал",
      situation: "Вы две недели писали. PO: «ну ок в принципе». Юрист не видел. Dev уже в коде.",
      question: "Как чините процесс, не гордость?",
      options: [
        o("Требуете мокрую печать со всех C-level.", false, "Бюрократия."),
        o("Одна страница: need, scope, успех, ограничения. Yes от PO и риска. Остальное — живые AC.", true, "BRD как договор, не том."),
        o("Удаляете BRD, живёте в Slack.", false, "Память команды короткая."),
      ],
      debrief: "BRD ценен договором границ, не объёмом.",
    },
  ],
  "junior-2-srs": [
    {
      kind: "sort",
      title: "Это в SRS или в Figma",
      prompt: "Системные требования vs картинка.",
      buckets: [
        { id: "srs", title: "SRS" },
        { id: "ui", title: "UI-спека" },
        { id: "ops", title: "Runbook" },
      ],
      items: [
        { id: "a", text: "Идемпотентный ключ payment_id", bucket: "srs", why: "Контракт системы." },
        { id: "b", text: "Отступ кнопки 8px", bucket: "ui", why: "Визуал." },
        { id: "c", text: "Если UNKNOWN — не звонить клиенту «оплачено»", bucket: "ops", why: "Скрипт смены." },
        { id: "d", text: "Коды 409/422 и тела ошибок", bucket: "srs", why: "API." },
        { id: "e", text: "Цвет алерта", bucket: "ui", why: "Тема." },
      ],
    },
    {
      kind: "order",
      title: "Кому какой срез SRS",
      prompt: "Не один простынь на всех.",
      items: [
        { id: "1", text: "Dev: правила, поля, идемпотентность", pos: 1 },
        { id: "2", text: "QA: AC и негатив", pos: 2 },
        { id: "3", text: "SA/Arch: границы и NFR", pos: 3 },
        { id: "4", text: "Ops: сообщения и ручные шаги", pos: 4 },
      ],
    },
    {
      kind: "scene",
      title: "Dev: «в SRS нет моего случая»",
      setting: "За день до релиза. Новый retry-код шлюза.",
      steps: [
        {
          from: "Dev",
          line: "Они шлют 409 сами, мы не ожидали.",
          options: [
            o("Это не в скоупе, игнор.", false, "Деньги."),
            o("Фиксируем как gap: поведение на чужой 409. Патч AC сегодня, не «в следующем BRD».", true, "SRS живой."),
            o("Пусть сами читают RFC Humo.", false, "Вы переводчик."),
          ],
        },
      ],
    },
  ],
  "junior-2-trace": [
    {
      kind: "order",
      title: "Нитка трассировки",
      prompt: "Соберите цепочку, чтобы вырезание поля не убило KPI молча.",
      items: [
        { id: "1", text: "Need / KPI: −50% повторных principal", pos: 1 },
        { id: "2", text: "Требование: детект дубля 24ч", pos: 2 },
        { id: "3", text: "AC / дизайн: 409, экран, лог", pos: 3 },
        { id: "4", text: "Тест QA и кусок кода", pos: 4 },
        { id: "5", text: "Метрика в проде: count duplicate_blocked", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "Вырезали «мелочь»",
      prompt: "Что должно было заорать трассировкой.",
      lines: [
        { id: "1", text: "Убрали audit «чтобы быстрее»", bad: true, why: "След для KPI и споров." },
        { id: "2", text: "Оставили 409", bad: false, why: "Ядро живо." },
        { id: "3", text: "Текст оператору выпилили", bad: true, why: "Stakeholder-слой.", },
        { id: "4", text: "Не связали story с KPI в Jira", bad: true, why: "Нитка оборвана заранее." },
        { id: "5", text: "Тест на двойной callback есть", bad: false, why: "Связь жива." },
      ],
    },
    {
      kind: "case",
      title: "Регулятор спрашивает «где требование»",
      situation: "Через полгода. Код есть, Confluence умер, Jira мигрировали.",
      question: "Что должно было остаться минимально?",
      options: [
        o("Ничего, код — правда.", false, "Код не объясняет need."),
        o("Need, правило дубля, AC, id теста, метрика. Хоть в шапке сервиса.", true, "Тонкая нитка."),
        o("48-страничный BRD в архиве почты.", false, "Не найдут."),
      ],
      debrief: "Трассировка — это умение найти, не умение хранить тома.",
    },
  ],
  "junior-2-write": [
    {
      kind: "spot",
      title: "Черновик аналитика за 20 минут",
      prompt: "Отметьте канцелярит и дыры.",
      lines: [
        { id: "1", text: "Осуществляется реализация функционала по оптимизации", bad: true, why: "Ноль смысла." },
        { id: "2", text: "Повторный callback с тем же payment_id не двигает баланс", bad: false, why: "Глагол и объект." },
        { id: "3", text: "Необходимо обеспечить возможность пользователю", bad: true, why: "Канцелярит." },
        { id: "4", text: "Оператор видит last confirmed_at", bad: false, why: "Наблюдаемо." },
        { id: "5", text: "В рамках улучшения клиентского опыта", bad: true, why: "Вода." },
      ],
    },
    {
      kind: "match",
      title: "Плохо → прямо",
      prompt: "Перепишите головой, свяжите пары.",
      pairs: [
        { left: "Осуществить интеграцию", right: "Принять callback Humo" },
        { left: "Оптимизировать процесс", right: "Убрать второе списание тела" },
        { left: "Гибкая архитектура", right: "Можно сменить шлюз без смены правила дубля" },
        { left: "User-friendly", right: "Текст 409 без stacktrace" },
        { left: "Асинхронно обработать", right: "Ответ 202, статус в poll через 2с" },
      ],
    },
    {
      kind: "scene",
      title: "Тимлид: «я не понял абзац»",
      setting: "Вы гордитесь слогом.",
      steps: [
        {
          from: "Тимлид",
          line: "Прочитай вслух. Если спотыкаешься — перепиши.",
          options: [
            o("Это официальный стиль.", false, "Официальный ≠ ясный."),
            o("Ок. Одно предложение: что система делает с деньгами при retry.", true, "Письмо для дела."),
            o("Добавлю ещё определений.", false, "Хуже."),
          ],
        },
      ],
    },
  ],
  "junior-3-uml": [
    {
      kind: "sort",
      title: "Какая схема сейчас",
      prompt: "Не рисуйте class diagram, когда нужен поток денег.",
      buckets: [
        { id: "seq", title: "Sequence" },
        { id: "state", title: "State" },
        { id: "act", title: "Activity" },
        { id: "cls", title: "Class / модель" },
      ],
      items: [
        { id: "a", text: "Кто кому шлёт retry и 409", bucket: "seq", why: "Время и участники." },
        { id: "b", text: "Платёж: created → pending → confirmed / UNKNOWN", bucket: "state", why: "Жизнь объекта." },
        { id: "c", text: "Взыскание: звонок → спор → эскалация", bucket: "act", why: "Работа людей." },
        { id: "d", text: "Поля Payment и IdempotencyKey", bucket: "cls", why: "Данные." },
        { id: "e", text: "Гонка двух callback", bucket: "seq", why: "Гонка видна на sequence." },
      ],
    },
    {
      kind: "spot",
      title: "Диаграмма «всё сразу»",
      prompt: "Что убивает пользу.",
      lines: [
        { id: "1", text: "Одна картинка: 40 классов, Kafka, CRM, чайник", bad: true, why: "Не читается." },
        { id: "2", text: "Sequence только retry Humo", bad: false, why: "Один вопрос." },
        { id: "3", text: "Без легенды статусов", bad: true, why: "Слова врут." },
        { id: "4", text: "Связь с AC: id сценария на стрелке", bad: false, why: "Трассировка." },
        { id: "5", text: "Clipart человечков", bad: true, why: "Шум." },
      ],
    },
    {
      kind: "case",
      title: "Архитектор хочет C4 сразу",
      situation: "Вы Junior. Need ещё сырой. Вас просят «нарисовать систему».",
      question: "Что рисуете сегодня?",
      options: [
        o("Полный C4 на 6 слайдах.", false, "Архитектура без вопроса."),
        o("State платежа + sequence retry. C4 — когда границы стабильны.", true, "Схема отвечает на вопрос."),
        o("Ничего, UML устарел.", false, "Мышление нет."),
      ],
      debrief: "Диаграмма — ответ на один вопрос, не карта мира.",
    },
  ],
  "junior-3-bpmn": [
    {
      kind: "order",
      title: "As-is взыскания при споре",
      prompt: "Соберите текущий процесс, не to-be мечту.",
      items: [
        { id: "1", text: "Старт: клиент орёт «уже сняли»", pos: 1 },
        { id: "2", text: "Коллектор смотрит CRM — две зелёные галки", pos: 2 },
        { id: "3", text: "Эскалация в ops чат, ждут ночную смену", pos: 3 },
        { id: "4", text: "Ручной ретрай / «посмотрите лог»", pos: 4 },
        { id: "5", text: "Исход: либо извинения, либо повторный звонок", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "BPMN со шлюзами ради шлюзов",
      prompt: "Что сломано в схеме стажёра.",
      lines: [
        { id: "1", text: "Exclusive gateway без вопроса на развилке", bad: true, why: "Шлюз обязан спрашивать." },
        { id: "2", text: "Пул «Коллектор» и пул «Платёжный сервис»", bad: false, why: "Люди vs система." },
        { id: "3", text: "Цикл без таймера — вечный ретрай", bad: true, why: "Нет стопа." },
        { id: "4", text: "Сообщение от шлюза как message event", bad: false, why: "Так и есть." },
        { id: "5", text: "12 цветов «для красоты»", bad: true, why: "Легенда умрёт." },
      ],
    },
    {
      kind: "scene",
      title: "Ops: «у нас не так»",
      setting: "Вы принесли красивый as-is. Старший оператор смеётся.",
      steps: [
        {
          from: "Ops",
          line: "Мы в Guide врём и звоним в обход. На схеме этого нет.",
          options: [
            o("Неофициальное не рисуем.", false, "As-is врёт — change врёт."),
            o("Добавляем серый поток «обход». Это и есть gap.", true, "Правда процесса."),
            o("Пусть сами нарисуют в Paint.", false, "Ваша работа."),
          ],
        },
      ],
    },
  ],
  "junior-3-gap": [
    {
      kind: "match",
      title: "As-is / gap / to-be",
      prompt: "Не путайте боль и решение.",
      pairs: [
        { left: "Ретрай руками, Guide врёт", right: "As-is" },
        { left: "Нет детекта дубля и UNKNOWN", right: "Gap" },
        { left: "Детект, отказ, сверка без смены шлюза", right: "To-be срез 1" },
        { left: "Новый шлюз «как Payme»", right: "To-be чужой мечты" },
        { left: "14 тикетов / неделя", right: "Доказательство as-is" },
      ],
    },
    {
      kind: "sort",
      title: "Что в первый срез gap",
      prompt: "Не закрывайте пропасть дворцом.",
      buckets: [
        { id: "s1", title: "Срез 1" },
        { id: "later", title: "Позже" },
        { id: "no", title: "Не gap этого change" },
      ],
      items: [
        { id: "a", text: "Идемпотентность retry", bucket: "s1", why: "Деньги." },
        { id: "b", text: "UNKNOWN вместо ложного confirmed", bucket: "s1", why: "Правда статуса." },
        { id: "c", text: "Мобильный редизайн", bucket: "later", why: "Не эта пропасть." },
        { id: "d", text: "Кафетерий офиса", bucket: "no", why: "Другой мир." },
        { id: "e", text: "Аудит, который нельзя update", bucket: "s1", why: "Спор и регулятор." },
      ],
    },
    {
      kind: "case",
      title: "Gap «у нас нет Kafka»",
      situation: "Архитектор назвал gap отсутствием брокера. Ops орёт про две галки.",
      question: "Как переназываете gap?",
      options: [
        o("Согласны: gap = нет Kafka.", false, "Option как дыра."),
        o("Gap = система не отличает дубль от нового платежа и врёт статусом. Транспорт — option.", true, "Gap про поведение."),
        o("Два gap: Kafka и UI.", false, "Разрезали решение."),
      ],
      debrief: "Gap формулируют языком as-is/to-be работы, не стека.",
    },
  ],
  "junior-3-explain": [
    {
      kind: "scene",
      title: "Объясняете дубль бабушке PO",
      setting: "PO не технарь. 4 минуты в лифте.",
      steps: [
        {
          from: "PO",
          line: "Ну и зачем нам идемпотентность, слово страшное.",
          options: [
            o("Это свойство операции в распределённых системах…", false, "Потеряли человека."),
            o("Шлюз стучится дважды. Мы не должны снять тело дважды. «Идемпотентность» — имя этого правила.", true, "Слово после смысла."),
            o("Это для разработчиков, вам не надо.", false, "PO подписывает scope."),
          ],
        },
      ],
    },
    {
      kind: "order",
      title: "Слайд на 3 минуты",
      prompt: "Порядок, чтобы не усыпить.",
      items: [
        { id: "1", text: "Боль: две галки, ор клиента", pos: 1 },
        { id: "2", text: "Правило одной фразой", pos: 2 },
        { id: "3", text: "Что в срезе / что нет", pos: 3 },
        { id: "4", text: "Как поймём, что стало лучше", pos: 4 },
      ],
    },
    {
      kind: "spot",
      title: "Презентация Junior",
      prompt: "Что выкинуть.",
      lines: [
        { id: "1", text: "12 определений из BABOK", bad: true, why: "Не аудитория." },
        { id: "2", text: "Один скрин двух галок", bad: false, why: "Доказательство." },
        { id: "3", text: "Анимация логотипа", bad: true, why: "Время." },
        { id: "4", text: "Таблица in/out scope", bad: false, why: "Решение." },
        { id: "5", text: "Шутка про джунов", bad: true, why: "Не про change." },
      ],
    },
  ],
};
