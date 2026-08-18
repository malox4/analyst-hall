import type { ContentBlock } from "@/types/content";

const o = (text: string, good: boolean, why: string) => ({ text, good, why });

export const SENIOR_EXTRAS: Record<string, ContentBlock[]> = {
  "senior-1-strategy": [
    {
      kind: "sort",
      title: "SA · Стратегия платформы vs бэклог",
      prompt: "Malo Wallet. Не путайте горизонты.",
      buckets: [
        { id: "str", title: "Ставка" },
        { id: "tac", title: "Срез / шов" },
        { id: "noise", title: "Шум" },
      ],
      items: [
        { id: "a", text: "Стать master статуса платежа/перевода внутри группы", bucket: "str", why: "18 месяцев." },
        { id: "b", text: "Идемпотентность P2P в этом квартале", bucket: "tac", why: "Проверка ставки." },
        { id: "c", text: "Анимация карты к 8 марта", bucket: "noise", why: "Не ставка." },
        { id: "d", text: "Снизить регуляторный хвост по KYC-отказам", bucket: "str", why: "Исход." },
        { id: "e", text: "Брокер «потому что модно»", bucket: "noise", why: "Option." },
        { id: "f", text: "Пилот UNKNOWN на 5% 3DS", bucket: "tac", why: "Проверка." },
      ],
    },
    {
      kind: "case",
      title: "SA · Три продукта, один ledger",
      situation: "Карты, кошелёк, эквайринг хотят «платформу статусов». Бюджет один.",
      question: "Рамка Senior?",
      options: [
        o("Платформа статусов всем сразу.", false, "Ничья ставка, море швов."),
        o("Одна ставка: master денег и статуса. Остальные — клиенты API с очередью. Явный отказ двум темам в полугодии.", true, "Стратегия = отказ."),
        o("Пусть C-level дерутся без вас.", false, "Вы переводчик ставок системы."),
      ],
      debrief: "Стратегия IT-аналитика — какой шов не делаем.",
    },
    {
      kind: "order",
      title: "SA · 40 минут стратсессии",
      prompt: "Не с микросервисов.",
      items: [
        { id: "1", text: "Исход через год: жалобы, штраф, доля", pos: 1 },
        { id: "2", text: "Где мы обязаны быть master данных", pos: 2 },
        { id: "3", text: "Ставки и швы, которые убиваем", pos: 3 },
        { id: "4", text: "Первый срез, который проверяет ставку", pos: 4 },
      ],
    },
  ],
  "senior-1-options": [
    {
      kind: "match",
      title: "SA · Option vs need — KYC",
      prompt: "Не влюбляйтесь в провайдера.",
      pairs: [
        { left: "Need: меньше ручных разборов личности", right: "Исход" },
        { left: "Допилить текущий kyc-gateway", right: "Option A · build" },
        { left: "Сменить провайдера", right: "Option B · buy" },
        { left: "Ручной контур ops на пике", right: "Option C · временный" },
        { left: "«Как у банка мечты»", right: "Не option" },
      ],
    },
    {
      kind: "spot",
      title: "SA · Таблица опций, стыдная для архитектуры",
      prompt: "Дописать / выкинуть.",
      lines: [
        { id: "1", text: "Только плюсы любимого провайдера", bad: true, why: "Продажа." },
        { id: "2", text: "Cost, latency p95, vendor lock, обратимость", bad: false, why: "Оси." },
        { id: "3", text: "Do nothing как строка", bad: false, why: "Цена бездействия." },
        { id: "4", text: "20 опций равноценно", bad: true, why: "Паралич." },
        { id: "5", text: "Критерий отсечения до скоринга (резидентство, PII)", bad: false, why: "Фильтр." },
      ],
    },
    {
      kind: "scene",
      title: "SA · ADR написан до сравнения",
      setting: "Архитектор: «просто подпиши, мы уже начали адаптер».",
      steps: [
        {
          from: "Архитектор",
          line: "Оформи как анализ.",
          options: [
            o("Ок, экономим время.", false, "Декоратор."),
            o("Тогда это решение, не анализ. Либо таблица опций за день, либо в ADR: alternatives = none.", true, "Честный след."),
            o("Эскалация на 80 человек.", false, "Яд."),
          ],
        },
      ],
    },
  ],
  "senior-1-eval": [
    {
      kind: "order",
      title: "SA · Оценка без театра Excel",
      prompt: "Не 40 критериев с весом 0.03.",
      items: [
        { id: "1", text: "3–5 критериев, которые меняют выбор шва", pos: 1 },
        { id: "2", text: "Факты / допущения пометить отдельно (latency, штраф)", pos: 2 },
        { id: "3", text: "Чувствительность: если p95 x2 — меняется ли buy/build", pos: 3 },
        { id: "4", text: "Рекомендация + какой шов убиваем", pos: 4 },
        { id: "5", text: "Пилот, который может опровергнуть", pos: 5 },
      ],
    },
    {
      kind: "sort",
      title: "SA · Факт или допущение",
      prompt: "Senior, который путает — врёт совету про систему.",
      buckets: [
        { id: "f", title: "Факт" },
        { id: "a", title: "Допущение" },
      ],
      items: [
        { id: "1", text: "3.2% недоставки OTP за неделю в проде", bucket: "f", why: "Лог." },
        { id: "2", text: "Штраф будет 2 млн", bucket: "a", why: "Пока нет письма." },
        { id: "3", text: "Смена процессора = 2 квартала", bucket: "a", why: "Оценка." },
        { id: "4", text: "Инцидент #441: два SUCCESS на один ключ", bucket: "f", why: "Постмортем." },
        { id: "5", text: "Клиенты «точно уйдут»", bucket: "a", why: "Страх." },
      ],
    },
    {
      kind: "case",
      title: "SA · Скоринг подогнали под Kafka",
      situation: "Веса крутили, пока брокер не выиграл. Risk/ops не в комнате. Latency не измеряли.",
      question: "Что делаете?",
      options: [
        o("Модель сошлась.", false, "Театр."),
        o("Веса фиксируете до заполнения. Пересчёт публично. Строка: p95 и vendor lock.", true, "Протокол оценки."),
        o("Удаляете таблицу, голосуете руками.", false, "Потеряли след."),
      ],
      debrief: "Оценка — протокол выбора шва, не украшение любимого стека.",
    },
  ],
  "senior-1-change": [
    {
      kind: "match",
      title: "SA · Срез влияния смены процессора",
      prompt: "Не только код адаптера.",
      pairs: [
        { left: "Процесс", right: "Скрипт саппорта 3DS" },
        { left: "Данные", right: "Маппинг ACS-кодов" },
        { left: "Система", right: "Кто master авторизации" },
        { left: "Ops", right: "UNKNOWN в ночной смене" },
        { left: "Комплаенс", right: "PCI-лог append-only" },
      ],
    },
    {
      kind: "spot",
      title: "SA · План «выкатили адаптер и ок»",
      prompt: "Что забыли.",
      lines: [
        { id: "1", text: "Dual-run статусов 14 дней", bad: false, why: "Transition." },
        { id: "2", text: "Обучение саппорта новым кодам", bad: false, why: "Процесс." },
        { id: "3", text: "Нет критерия отката на всплеск UNKNOWN", bad: true, why: "Change без стопа." },
        { id: "4", text: "Сразу 100% трафика", bad: true, why: "Риск на всех." },
        { id: "5", text: "Owner гиперкэра после релиза", bad: false, why: "Не бросили." },
      ],
    },
    {
      kind: "order",
      title: "SA · Вкатывание нового ACS",
      prompt: "Чтобы не убить эквайринг.",
      items: [
        { id: "1", text: "Пилот 5% + antifraud смотрит FP", pos: 1 },
        { id: "2", text: "Маппинг кодов и экран UNKNOWN", pos: 2 },
        { id: "3", text: "100% + алерт на всплеск", pos: 3 },
        { id: "4", text: "Выключение ручного «починить статус»", pos: 4 },
      ],
    },
  ],
  "senior-2-conflict": [
    {
      kind: "scene",
      title: "SA · Risk vs issuing, уже кричат",
      setting: "3DS. Risk: блокируйте любой retry ACS. Issuing: режем конверсию.",
      steps: [
        {
          from: "Risk",
          line: "Блокируйте любой retry. Иначе совет.",
          options: [
            o("Блокируем всё.", false, "Сторона без критерия."),
            o("Крик → правило: какой retry, какой FP, какая потеря авторизаций. Совет получит таблицу.", true, "Конфликт → контракт."),
            o("Голосовать руками.", false, "Толпа."),
          ],
        },
        {
          from: "Issuing",
          line: "Вы топите продукт.",
          options: [
            o("Цифры: сколько спасает детект vs сколько режет ложный блок. Решает Accountable.", true, "В комнате."),
            o("Извинитесь перед риском.", false, "Театр."),
            o("Выйдите оба.", false, "Стейкхолдеры системы не декорации."),
          ],
        },
      ],
    },
    {
      kind: "sort",
      title: "SA · Тип конфликта",
      prompt: "Лечится по-разному.",
      buckets: [
        { id: "data", title: "Данные / словарь" },
        { id: "val", title: "KPI систем" },
        { id: "pow", title: "Власть" },
      ],
      items: [
        { id: "a", text: "14 vs 3 «дубля» P2P — разные определения ключа", bucket: "data", why: "Словарь." },
        { id: "b", text: "Штраф KYC vs конверсия онбординга", bucket: "val", why: "P&L vs комплаенс." },
        { id: "c", text: "Кто Accountable за enum статусов", bucket: "pow", why: "RACI данных." },
        { id: "d", text: "Kafka vs без Kafka", bucket: "data", why: "Часто маска KPI." },
        { id: "e", text: "Кто докладывает совету про инцидент", bucket: "pow", why: "Сцена." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Медиация, которую нельзя",
      prompt: "Яд.",
      lines: [
        { id: "1", text: "Повторить смысл каждой стороны до «да, так»", bad: false, why: "Слушание." },
        { id: "2", text: "«Вы всегда тормозите релизы»", bad: true, why: "Атака." },
        { id: "3", text: "Таймер на опции контракта", bad: false, why: "Ритуал." },
        { id: "4", text: "Тайное обещание одной стороне про feature flag", bad: true, why: "Двойная игра." },
        { id: "5", text: "Письмо-решение: enum + пилот", bad: false, why: "След." },
      ],
    },
  ],
  "senior-2-politics": [
    {
      kind: "match",
      title: "SA · Карта власти на платежном контуре",
      prompt: "Кто реально стопит релиз адаптера.",
      pairs: [
        { left: "Спонсор", right: "Деньги и крыша" },
        { left: "ИБ / PCI", right: "Вето через аудит" },
        { left: "Ops", right: "Ночная правда UNKNOWN" },
        { left: "Программа", right: "Календарь зависимостей" },
        { left: "Вы", right: "Ясность контракта, не указ" },
      ],
    },
    {
      kind: "case",
      title: "SA · «Продави подпись риска на адаптер»",
      situation: "Спонсор. Фактов по latency мало. Дедлайн завтра.",
      question: "Этика Senior?",
      options: [
        o("Продавливаете.", false, "Стёрли роль."),
        o("Не подменяете риск. Пакет: дыры p95, пилот 5%, что именно подписывают. Если завтра — scope режется, не подпись.", true, "Политика без лжи."),
        o("Сливаете переписку в общий чат.", false, "Ядерный."),
      ],
      debrief: "Политика Senior — свет на шов, не нож.",
    },
    {
      kind: "scene",
      title: "Guest · Orient: кулуары после совета",
      setting: "Формально подписали файл. Шепчут: «торпедируем колонки».",
      steps: [
        {
          from: "Союзник",
          line: "Ты свой. Предупреждаю.",
          options: [
            o("Молчим.", false, "Релиз в мину."),
            o("Риск исполнения в свет: owner сверки, алерт на MISMATCH, критерий саботажа формата.", true, "Политика → ops-контракт."),
            o("Анонимка HR.", false, "Не ваш контур."),
          ],
        },
      ],
    },
  ],
  "senior-2-exec": [
    {
      kind: "order",
      title: "SA · Бриф совету: 6 минут про процессор",
      prompt: "Не BABOK. Не C4 с первой фразы.",
      items: [
        { id: "1", text: "Что сломается в авторизациях, если ничего", pos: 1 },
        { id: "2", text: "Решение одной фразой (пилот ACS)", pos: 2 },
        { id: "3", text: "Цена, срок, какой шов убиваем", pos: 3 },
        { id: "4", text: "Стоп-кран UNKNOWN", pos: 4 },
        { id: "5", text: "Просьба: yes / no / пилот 5%", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "SA · Слайды, которые усыпляют совет",
      prompt: "Выкиньте.",
      lines: [
        { id: "1", text: "18 определений", bad: true, why: "Не совет." },
        { id: "2", text: "Один график авторизаций / UNKNOWN", bad: false, why: "Доказательство." },
        { id: "3", text: "Таблица опций 3×4 (build/buy/nothing)", bad: false, why: "Выбор." },
        { id: "4", text: "Скрин IDE адаптера", bad: true, why: "Не их ремесло." },
        { id: "5", text: "Просьба «поддержать направление платформы»", bad: true, why: "Не голосуется." },
      ],
    },
    {
      kind: "scene",
      title: "SA · CFO: «в двух словах»",
      setting: "Лифт. 40 секунд. Вы готовили час C4.",
      steps: [
        {
          from: "CFO",
          line: "Ну?",
          options: [
            o("Идемпотентность и bounded context…", false, "Потеряли."),
            o("Клиент тапает дважды — проводим дважды. Чиним ключ. 6 недель. Нет — дыра в ledger. Нужен yes на пилот.", true, "Исход, цена, просьба."),
            o("Слот на час.", false, "Окно закрылось."),
          ],
        },
      ],
    },
  ],
  "senior-2-think": [
    {
      kind: "sort",
      title: "SA · Где думаете, где защищаете стек",
      prompt: "Разбор собственного ADR.",
      buckets: [
        { id: "asm", title: "Допущение" },
        { id: "evd", title: "Доказательство" },
        { id: "snd", title: "Театр" },
        { id: "pre", title: "Предвзятость" },
      ],
      items: [
        { id: "a", text: "Штраф будет", bucket: "asm", why: "Пока нет письма." },
        { id: "b", text: "Инцидент #441, два SUCCESS", bucket: "evd", why: "Факт." },
        { id: "c", text: "«Я Senior, мне виднее Kafka»", bucket: "pre", why: "Авторитет ≠ довод." },
        { id: "d", text: "Красивый ADR без alternatives", bucket: "snd", why: "Театр следа." },
        { id: "e", text: "Пилот опроверг: FP 12% на 3DS", bucket: "evd", why: "Данные против эго." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Самообман в рекомендации",
      prompt: "Найдите.",
      lines: [
        { id: "1", text: "Вывод раньше замеров latency", bad: true, why: "Advocacy." },
        { id: "2", text: "Что опровергнет рекомендацию (метрика)", bad: false, why: "Стальной человек." },
        { id: "3", text: "Игнор do-nothing", bad: true, why: "Скрыли CoD." },
        { id: "4", text: "Список неизвестных в контракте", bad: false, why: "Честность." },
        { id: "5", text: "Цитаты только союзников по стеку", bad: true, why: "Вишня." },
      ],
    },
    {
      kind: "case",
      title: "SA · Пилот опроверг смену шлюза",
      situation: "Рекомендовали смену sms-gw. Домашняя идемпотентность message_id закрыла 90% дублей OTP дешевле.",
      question: "Как выглядите?",
      options: [
        o("Защищаете старое «в долгую».", false, "Эго."),
        o("Меняете рекомендацию вслух. След: что узнали, какой шов убиваете.", true, "Обновление ставки."),
        o("Confluence датой назад.", false, "Подлог."),
      ],
      debrief: "Сильный SA дешевле меняет мнение, чем прод.",
    },
  ],
  "senior-3-mentor": [
    {
      kind: "scene",
      title: "SA · Intern принёс Kafka для OTP",
      setting: "Хочется накричать. Нельзя.",
      steps: [
        {
          from: "Intern",
          line: "Я уже написал epic на 40 SP про шину.",
          options: [
            o("Удали и не позорься.", false, "Убьёте голос."),
            o("12 минут: need доставки vs option брокера. Контракт message_id. Epic подождёт.", true, "Разбор без унижения."),
            o("Перепишите сами ночью.", false, "Не менторство."),
          ],
        },
        {
          from: "Intern",
          line: "Можно Kafka оставить в story?",
          options: [
            o("Нет. Сначала таблица кодов sms-gw. Право на option — после.", true, "Практика контракта."),
            o("Ладно, чтобы не плакал.", false, "Ложный навык."),
            o("Иди к PO.", false, "Сняли шляпу."),
          ],
        },
      ],
    },
    {
      kind: "order",
      title: "SA · Ревью работы Junior по OpenAPI",
      prompt: "Не стиль первым.",
      items: [
        { id: "1", text: "Ключ, коды, кто ретраит?", pos: 1 },
        { id: "2", text: "Можно ли уронить Postman-тестом?", pos: 2 },
        { id: "3", text: "Границы контекстов", pos: 3 },
        { id: "4", text: "Язык спецификации", pos: 4 },
        { id: "5", text: "Что Junior повторит сам завтра", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "SA · Ревью, которое учит",
      prompt: "Яд выкинуть.",
      lines: [
        { id: "1", text: "Один рычаг: таблица ошибок", bad: false, why: "Унести можно." },
        { id: "2", text: "«Ты не аналитик»", bad: true, why: "Личность." },
        { id: "3", text: "Пример переписанного 409", bad: false, why: "Модель." },
        { id: "4", text: "Переписать весь spec за него", bad: true, why: "Не навык." },
        { id: "5", text: "Похвала за вопрос про 504", bad: false, why: "Поведение." },
      ],
    },
  ],
  "senior-3-discovery": [
    {
      kind: "order",
      title: "SA · Discovery, когда не ясен chargeback",
      prompt: "Не BRD на 40 страниц в неделю 1.",
      items: [
        { id: "1", text: "Гипотеза: кто master претензии", pos: 1 },
        { id: "2", text: "Самый дешёвый способ опровергнуть (логи эквайера)", pos: 2 },
        { id: "3", text: "Spike: 20 кейсов + контракт статусов", pos: 3 },
        { id: "4", text: "Убить или нарезать шов", pos: 4 },
        { id: "5", text: "Только потом SRS", pos: 5 },
      ],
    },
    {
      kind: "sort",
      title: "SA · Discovery vs delivery",
      prompt: "Путаница сжигает квартал.",
      buckets: [
        { id: "d", title: "Discovery" },
        { id: "v", title: "Delivery" },
        { id: "k", title: "Убить" },
      ],
      items: [
        { id: "a", text: "Не знаем, дубль перевода это или два ключа", bucket: "d", why: "Незнание словаря." },
        { id: "b", text: "Правило ключа ясно — пишем 409", bucket: "v", why: "Знаем." },
        { id: "c", text: "Платформа на 3 года без боли", bucket: "k", why: "Мечта." },
        { id: "d", text: "Пилот 5% UNKNOWN на 3DS", bucket: "d", why: "Проверка." },
        { id: "e", text: "Обучение саппорта после enum", bucket: "v", why: "Transition известного." },
      ],
    },
    {
      kind: "scene",
      title: "Guest · CityPark: «хватит исследовать, пишите»",
      setting: "Неделя 2. Не ясна гонка слотов. Давление «как у конкурента».",
      steps: [
        {
          from: "PO",
          line: "Discovery закончили. В спринт.",
          options: [
            o("34 SP в туман.", false, "Delivery незнания."),
            o("Кодить можно, если гипотеза гонки и стоп-критерий. Иначе казино, не спринт.", true, "Discovery с датой."),
            o("Ещё квартал интервью.", false, "Паралич."),
          ],
        },
      ],
    },
  ],
  "senior-3-lead": [
    {
      kind: "match",
      title: "SA · Лидерство практики, не менеджер людей",
      prompt: "Стандарт IT-анализа.",
      pairs: [
        { left: "Definition of Ready", right: "Без fail и ключа не в спринт" },
        { left: "Ревью артефактов", right: "Один рычаг контракта" },
        { left: "Эскалация", right: "Ломающий API не в Slack на 80" },
        { left: "Наём", right: "Кейс OpenAPI, не кроссворд BABOK" },
        { left: "Ритм", right: "Discovery и delivery не в одной колонке" },
      ],
    },
    {
      kind: "spot",
      title: "SA · Команда разъехалась",
      prompt: "Симптомы, что вы не лидите практику.",
      lines: [
        { id: "1", text: "У каждого свой словарь статуса перевода", bad: true, why: "Нет стандарта данных." },
        { id: "2", text: "Общий каталог ошибок денег", bad: false, why: "Практика." },
        { id: "3", text: "Junior боится спросить про 504", bad: true, why: "Климат." },
        { id: "4", text: "Разбор инцидента без поиска виноватого", bad: false, why: "Культура." },
        { id: "5", text: "Только вы пишете OpenAPI", bad: true, why: "Узкое горло." },
      ],
    },
    {
      kind: "case",
      title: "SA · Титул «главный аналитик», штат — вы",
      situation: "PO ждёт чудес на трёх продуктах.",
      question: "Как лидите?",
      options: [
        o("Героически везде.", false, "Не практика."),
        o("Один стандарт контракта, один пилот-продукт, явный отказ двум. Титул без ёмкости — ложь.", true, "Границы."),
        o("Переименовываете тикеты.", false, "Косметика."),
      ],
      debrief: "Lead без ёмкости — приоритет швов и отказ, не супергерой.",
    },
  ],
  "senior-3-studio": [
    {
      kind: "order",
      title: "SA · Студия: контур идемпотентного P2P",
      prompt: "Как будто уже прод.",
      items: [
        { id: "1", text: "Словарь дубля и KPI", pos: 1 },
        { id: "2", text: "OpenAPI: ключ, 409, UNKNOWN", pos: 2 },
        { id: "3", text: "Границы ledger vs wallet-api", pos: 3 },
        { id: "4", text: "Админка ops и алерт", pos: 4 },
        { id: "5", text: "Пилот, стоп-кран, след совету", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "SA · Пакет на релиз студии",
      prompt: "Что нельзя считать готовым.",
      lines: [
        { id: "1", text: "Fail-тест двух POST с одним ключом", bad: false, why: "Деньги." },
        { id: "2", text: "Нет UNKNOWN", bad: true, why: "Будете врать SUCCESS." },
        { id: "3", text: "Owner гиперкэра", bad: false, why: "После релиза." },
        { id: "4", text: "Figma без таблицы кодов", bad: true, why: "Картинка." },
        { id: "5", text: "Сверка с процессором", bad: false, why: "Интеграция." },
      ],
    },
    {
      kind: "scene",
      title: "SA · Go / no-go в 17:40",
      setting: "Пилот зелёный. Antifraud орёт FP. Юрист молчит по 3DS-текстам.",
      steps: [
        {
          from: "PO",
          line: "Катим, окно до пятницы.",
          options: [
            o("Катим, потом.", false, "Нет крана."),
            o("No-go без порога FP и молчания юриста. Go — 5% с отзывом за час.", true, "Условный go."),
            o("Снимаете с себя.", false, "Студия держит контур."),
          ],
        },
      ],
    },
  ],
};
