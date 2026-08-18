import type { ContentBlock } from "@/types/content";

const o = (text: string, good: boolean, why: string) => ({ text, good, why });

export const MIDDLE_EXTRAS: Record<string, ContentBlock[]> = {
  "middle-1-prio": [
    {
      kind: "sort",
      title: "SA · WSJF платформы Wallet",
      prompt: "Не «всё важно». Смотрите cost of delay системы.",
      buckets: [
        { id: "now", title: "Сейчас" },
        { id: "wait", title: "Позже" },
        { id: "kill", title: "Убить" },
      ],
      items: [
        { id: "a", text: "Идемпотентность P2P: уже двойные проводки", bucket: "now", why: "Деньги." },
        { id: "b", text: "Тёмная тема приложения", bucket: "wait", why: "CoD низкий." },
        { id: "c", text: "Переписать sms-gw на Rust", bucket: "kill", why: "Пет без need." },
        { id: "d", text: "UNKNOWN вместо ложного SUCCESS на 3DS", bucket: "now", why: "Враньё статуса." },
        { id: "e", text: "Третий эквайер «на всякий»", bucket: "kill", why: "Option без боли." },
        { id: "f", text: "Каталог ошибок kyc-gateway", bucket: "now", why: "Блокирует саппорт и контракт." },
      ],
    },
    {
      kind: "case",
      title: "SA · Срочно от C-level: ещё один процессор",
      situation: "В пятницу CEO: «подключим ещё один card-processor на выходных». У вас срез идемпотентности и PCI-лог.",
      question: "Ход Middle?",
      options: [
        o("Берёте процессор, идемпотентность в понедельник.", false, "Деньги не ждут."),
        o("Показываете CoD: двойные проводки vs новый BIN. Обмен глазами, не настроением.", true, "Приоритет системы."),
        o("Берёте всё, команда выгорит.", false, "Скрытый долг."),
      ],
      debrief: "Middle считает delay шва, не громкость Slack.",
    },
    {
      kind: "order",
      title: "SA · 6 минут про приоритет",
      prompt: "Не начинайте с SP.",
      items: [
        { id: "1", text: "Цена ожидания каждого шва (деньги, PCI, простой)", pos: 1 },
        { id: "2", text: "Размер / риск среза контракта", pos: 2 },
        { id: "3", text: "Зависимости: antifraud, процессор, 1С", pos: 3 },
        { id: "4", text: "Один WIP, который выкатываем", pos: 4 },
      ],
    },
  ],
  "middle-1-usm": [
    {
      kind: "match",
      title: "SA · Карта историй кошелька — технические швы",
      prompt: "Активность → системная цель.",
      pairs: [
        { left: "KYC", right: "Статус личности, лимиты" },
        { left: "Top-up", right: "Деньги в ledger" },
        { left: "P2P", right: "Идемпотентный перевод" },
        { left: "Card pay", right: "Авторизация / 3DS" },
        { left: "Recon", right: "Файл и MISMATCH" },
      ],
    },
    {
      kind: "spot",
      title: "SA · USM, который врёт поставке",
      prompt: "Где карта бесполезна инженерам.",
      lines: [
        { id: "1", text: "Все стикеры «5 SP»", bad: true, why: "Карта не оценка." },
        { id: "2", text: "Скелет: KYC → top-up → P2P → спор статуса", bad: false, why: "Поток." },
        { id: "3", text: "Нет walking skeleton через ledger", bad: true, why: "Нельзя выпустить шов." },
        { id: "4", text: "Recon как активность, не забытая", bad: false, why: "Реальная жизнь." },
        { id: "5", text: "50 жёлтых «потом Kafka»", bad: true, why: "Кладбище стека." },
      ],
    },
    {
      kind: "scene",
      title: "SA · Dev хочет горизонтальную модель данных",
      setting: "USM повесили.",
      steps: [
        {
          from: "Dev",
          line: "Без полной модели кошелька ничего не выкатим.",
          options: [
            o("Спринт на модель.", false, "Горизонталь."),
            o("Walking skeleton: тестовый top-up + P2P с ключом + один MISMATCH. Модель растёт вокруг шва.", true, "Вертикаль."),
            o("USM для PO, нам не надо.", false, "Карта для нарезки контрактов."),
          ],
        },
      ],
    },
  ],
  "middle-1-cjm": [
    {
      kind: "order",
      title: "SA · Путь клиента, когда 3DS врёт SUCCESS",
      prompt: "Где система солгала — не только эмоции.",
      items: [
        { id: "1", text: "Pay → ACS challenge", pos: 1 },
        { id: "2", text: "Таймаут ACS, мы всё равно SUCCESS", pos: 2 },
        { id: "3", text: "Клиент думает, что оплатил; мерчант — нет", pos: 3 },
        { id: "4", text: "Саппорт не видит UNKNOWN в админке", pos: 4 },
        { id: "5", text: "Chargeback через 5 дней", pos: 5 },
      ],
    },
    {
      kind: "sort",
      title: "SA · Где чинить",
      prompt: "Корень vs симптом.",
      buckets: [
        { id: "root", title: "Корень системы" },
        { id: "sym", title: "Симптом канала" },
        { id: "later", title: "Позже" },
      ],
      items: [
        { id: "a", text: "Ложный SUCCESS при тишине ACS", bucket: "root", why: "Статус." },
        { id: "b", text: "Грубый IVR", bucket: "later", why: "Не этот change." },
        { id: "c", text: "Админка без raw ACS code", bucket: "root", why: "Ops слеп." },
        { id: "d", text: "Длинный пуш", bucket: "sym", why: "Сообщение." },
        { id: "e", text: "Нет идемпотентности challenge", bucket: "root", why: "Двойная авторизация." },
      ],
    },
    {
      kind: "case",
      title: "BA+SA · CJM vs контракт",
      situation: "UX хочет месяц CJM. Вы видите дыру master-статуса.",
      question: "Как оба инструмента?",
      options: [
        o("Только CJM — человечно.", false, "Не нарежете шов."),
        o("CJM находит, где врали клиенту. Контракт UNKNOWN — walking skeleton. Карта опыта не вместо OpenAPI.", true, "Вместе."),
        o("Только Jira.", false, "Слепые."),
      ],
      debrief: "CJM без статусов — театр. Контракт без пути клиента — глухой инженерный срез.",
    },
  ],
  "middle-1-no": [
    {
      kind: "scene",
      title: "SA · Нет третьему микросервису «на всякий»",
      setting: "Спонсор: ещё шлюз статусов, ещё брокер, ещё BFF — в этом релизе P2P.",
      steps: [
        {
          from: "Спонсор",
          line: "Команда гибкая. Нет — плохой ответ.",
          options: [
            o("Впишем три сервиса.", false, "Швы без нужды."),
            o("Нет этому релизу. Да — P2P с ключом в wallet-api. Вот что вылетает, если плодим швы.", true, "Нет с обменом."),
            o("Киваете и режете втихую.", false, "Политический долг."),
          ],
        },
        {
          from: "Спонсор",
          line: "Найду другого аналитика.",
          options: [
            o("Ок, удачи.", false, "Сдались без следа."),
            o("Аналитика сменить можно. Физику нет: 20 SP ≠ три интеграции. Письмо с CoD швов — спонсору и PO.", true, "След."),
            o("Берём без тестов контракта.", false, "Хуже."),
          ],
        },
      ],
    },
    {
      kind: "spot",
      title: "SA · Письмо «нет» на лишний шов",
      prompt: "Что убивает отказ.",
      lines: [
        { id: "1", text: "Извините что я такой", bad: true, why: "Не про вас." },
        { id: "2", text: "Если берём новый BFF, не выходит идемпотентность к дате", bad: false, why: "Обмен." },
        { id: "3", text: "Вы всё неправильно хотите", bad: true, why: "Атака." },
        { id: "4", text: "Срез: один сервис, дата пересмотра брокера", bad: false, why: "Да рядом." },
        { id: "5", text: "Скрытая копия C-level ради мести", bad: true, why: "Яд." },
      ],
    },
    {
      kind: "match",
      title: "SA · Тип нет",
      prompt: "Разные нет — разные фразы.",
      pairs: [
        { left: "Нет этому сроку PCI-лога", right: "Можно позже, вот дата" },
        { left: "Нет этому scope (третий процессор)", right: "Вот что выкидываем" },
        { left: "Нет этому решению (общая БД)", right: "Риск связности, вот таблица" },
        { left: "Нет этому сервису в релизе", right: "Шов не окупается" },
        { left: "Нет «на всякий Kafka»", right: "Нет требования к доставке — нет брокера" },
      ],
    },
  ],
  "middle-2-api": [
    {
      kind: "spot",
      title: "SA · OpenAPI, который взорвёт прод",
      prompt: "POST /transfers. Отметьте мины.",
      lines: [
        { id: "1", text: "Нет заголовка Idempotency-Key (required)", bad: true, why: "Двойной тап = две проводки." },
        { id: "2", text: "409 DUPLICATE + machine code + человеческий message", bad: false, why: "Контракт ошибки." },
        { id: "3", text: "Всегда HTTP 200, ошибка в body.status=false", bad: true, why: "Ломает клиентов и ретраи." },
        { id: "4", text: "amount integer миноров, currency enum", bad: false, why: "Деньги." },
        { id: "5", text: "GET /transfers без стабильного cursor", bad: true, why: "Дубли выгрузки." },
        { id: "6", text: "5xx без идемпотентного повтора на стороне клиента", bad: true, why: "Надо описать, кто ретраит." },
      ],
    },
    {
      kind: "order",
      title: "SA · Дизайн endpoint перевода",
      prompt: "Не «накидайте JSON».",
      items: [
        { id: "1", text: "Кто клиент API и какая цель (mobile / backoffice)", pos: 1 },
        { id: "2", text: "Ключ, окно, кто генерирует ключ", pos: 2 },
        { id: "3", text: "Успех и таблица 4xx/5xx", pos: 3 },
        { id: "4", text: "Совместимость / версия", pos: 4 },
        { id: "5", text: "Примеры request/response в спецификации", pos: 5 },
      ],
    },
    {
      kind: "scene",
      title: "Guest · MedQueue: клиент ретраит POST 7 раз",
      setting: "Сеть клиники плохая. Слот бронируется семь раз.",
      steps: [
        {
          from: "Mobile lead",
          line: "Мы просто повторяем POST, так проще.",
          options: [
            o("Бэкенд разберётся.", false, "Не разберётся без ключа."),
            o("Ключ на клиенте + серверный no-op. Ретрай без ключа — дефект клиента в контракте.", true, "Обе стороны."),
            o("Запретить ретраи.", false, "Сеть умрёт."),
          ],
        },
      ],
    },
  ],
  "middle-2-sql": [
    {
      kind: "sort",
      title: "SA · Какой запрос зачем",
      prompt: "Вы не DBA, но не должны слепнуть.",
      buckets: [
        { id: "fact", title: "Факт для решения" },
        { id: "bad", title: "Опасно / соврёт" },
        { id: "ops", title: "Тикет смены" },
      ],
      items: [
        { id: "a", text: "COUNT переводов с одним Idempotency-Key и двумя SUCCESS за 7 дней", bucket: "fact", why: "Цена дыры." },
        { id: "b", text: "SELECT * FROM transfers на проде", bucket: "bad", why: "Убьёте базу." },
        { id: "c", text: "UPDATE status руками «починить»", bucket: "bad", why: "След и деньги." },
        { id: "d", text: "Найти transfer_902 для саппорта", bucket: "ops", why: "Run." },
        { id: "e", text: "UNKNOWN vs SUCCESS по процессору", bucket: "fact", why: "Качество статуса." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Вывод «у нас нет дублей P2P»",
      prompt: "Где SQL солгал.",
      lines: [
        { id: "1", text: "Фильтр только status=SUCCESS, ретраи в ERROR выкинули", bad: true, why: "Скрыли проблему." },
        { id: "2", text: "Окно 24ч как в AC", bad: false, why: "Совпадает с контрактом." },
        { id: "3", text: "Склейка без ключа, по ФИО получателя", bad: true, why: "Ложные пары." },
        { id: "4", text: "Exclude тестовых мерчантов явно", bad: false, why: "Честный scope." },
        { id: "5", text: "Цифра без знаменателя", bad: true, why: "14 из чего?" },
      ],
    },
    {
      kind: "case",
      title: "SA · Ваши 14 дублей, BI показывает 3",
      situation: "PO орёт. Разные определения «дубля».",
      question: "Что делаете?",
      options: [
        o("Ваша цифра правильная.", false, "Война метрик."),
        o("Сверяете словарь: ключ vs «похожий перевод». Пока два знаменателя — двух цифр нет.", true, "Семантика."),
        o("Усредняете 8.5.", false, "Туман."),
      ],
      debrief: "SQL без словаря контракта — оружие в чужом споре.",
    },
  ],
  "middle-2-integration": [
    {
      kind: "match",
      title: "SA · Стиль интеграции",
      prompt: "Не всё REST.",
      pairs: [
        { left: "Ночной реестр эквайера", right: "Файл + сверка T+1" },
        { left: "Webhook KYC", right: "Событие + идемпотентность" },
        { left: "Справочник MCC раз в сутки", right: "Batch / файл" },
        { left: "Онлайн холд лимита P2P", right: "Синхронный API" },
        { left: "Создать тикет в CRM при MISMATCH", right: "Событие, не polling UI" },
      ],
    },
    {
      kind: "order",
      title: "SA · Контракт с card-processor",
      prompt: "До кода.",
      items: [
        { id: "1", text: "Кто master статуса авторизации", pos: 1 },
        { id: "2", text: "Идемпотентность и повтор ACS", pos: 2 },
        { id: "3", text: "Таймаут → UNKNOWN", pos: 3 },
        { id: "4", text: "Recon и расхождения", pos: 4 },
        { id: "5", text: "Ops-канал, когда пайп лёг", pos: 5 },
      ],
    },
    {
      kind: "scene",
      title: "Guest · Orient: «наш файл как получится»",
      setting: "Документация 2019. Юристы уже подписали.",
      steps: [
        {
          from: "Партнёр",
          line: "Колонки иногда плывут, не парьтесь.",
          options: [
            o("Подстроимся молча.", false, "Прод взорвётся."),
            o("Фиксируем: кодировка, ключ, коды отклонения. Иначе не включаем трафик.", true, "Контракт > слайд продаж."),
            o("Сразу суд.", false, "Рано."),
          ],
        },
      ],
    },
  ],
  "middle-2-devtalk": [
    {
      kind: "sort",
      title: "SA · Язык груминга с dev",
      prompt: "Что говорить, что оставить себе.",
      buckets: [
        { id: "say", title: "Говорить" },
        { id: "skip", title: "Не этот стол" },
      ],
      items: [
        { id: "a", text: "Правило денег и fail-кейс Postman", bucket: "say", why: "Контракт." },
        { id: "b", text: "Как назвать класс", bucket: "skip", why: "Их ремесло." },
        { id: "c", text: "Гонка двух webhook", bucket: "say", why: "Риск." },
        { id: "d", text: "Любимый IDE", bucket: "skip", why: "Шум." },
        { id: "e", text: "Что не делаем в срезе", bucket: "say", why: "Граница." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Тикет «для девов»",
      prompt: "Что раздражает справедливо.",
      lines: [
        { id: "1", text: "Сделайте как надо", bad: true, why: "Нет контракта." },
        { id: "2", text: "Примеры payload и 409", bad: false, why: "Можно кодить." },
        { id: "3", text: "Ссылка на 19 стр BRD без якоря", bad: true, why: "Не найдут." },
        { id: "4", text: "Риск гонки и ожидаемое поведение", bad: false, why: "Уважение." },
        { id: "5", text: "«Это же просто»", bad: true, why: "Оскорбление размера." },
      ],
    },
    {
      kind: "case",
      title: "SA · Dev уже написал не тот шов",
      situation: "В ветке Kafka и 800 строк. AC ещё не было.",
      question: "Ход?",
      options: [
        o("Пусть выкатывают.", false, "Бетон."),
        o("Что из написанного закрывает ключ и 409. Лишнее — не в релиз. Без унижения за ранний старт.", true, "Контракт важнее гордости."),
        o("Эскалация «без аналитика».", false, "Вы тоже опоздали."),
      ],
      debrief: "Разговор про поведение системы, не про вину.",
    },
  ],
  "middle-3-nfr": [
    {
      kind: "sort",
      title: "SA · NFR, которые можно сломать тестом",
      prompt: "Мера vs поэзия.",
      buckets: [
        { id: "ok", title: "Измеримо" },
        { id: "po", title: "Поэзия" },
      ],
      items: [
        { id: "a", text: "p95 ack webhook KYC ≤ 300мс на профиле 50 rps", bucket: "ok", why: "Число + профиль." },
        { id: "b", text: "Система должна быть быстрой", bucket: "po", why: "Пусто." },
        { id: "c", text: "RPO сверки 15 мин, RTO пайпа файла 30 мин", bucket: "ok", why: "Disaster." },
        { id: "d", text: "Безопасно и надёжно", bucket: "po", why: "Плакат." },
        { id: "e", text: "Audit нельзя UPDATE, хранение 5 лет", bucket: "ok", why: "Комплаенс." },
        { id: "f", text: "Масштабируемая архитектура", bucket: "po", why: "Без нагрузки." },
      ],
    },
    {
      kind: "scene",
      title: "SA · «SLA 99.99 как у взрослых»",
      setting: "Слайд. Нет знаменателя. Нет исключения на процессор.",
      steps: [
        {
          from: "Архитектор",
          line: "99.99 пишем в договор мерчанта.",
          options: [
            o("Круто, в SRS так и есть.", false, "Ложь в договоре."),
            o("Чей простой: wallet-api или ACS? Окно? Исключения? Иначе маркетинг.", true, "NFR = договор."),
            o("QA потом.", false, "Потом = никогда."),
          ],
        },
      ],
    },
    {
      kind: "order",
      title: "SA · NFR на P2P-срез",
      prompt: "Чтобы не забыть деньги.",
      items: [
        { id: "1", text: "Идемпотентность и целостность ledger", pos: 1 },
        { id: "2", text: "UNKNOWN vs SUCCESS", pos: 2 },
        { id: "3", text: "Латентность ack под профилем", pos: 3 },
        { id: "4", text: "Audit / retention", pos: 4 },
        { id: "5", text: "Откат и ручной контур ops", pos: 5 },
      ],
    },
  ],
  "middle-3-arch": [
    {
      kind: "match",
      title: "SA · Граница контекста Wallet",
      prompt: "Кто владеет чем.",
      pairs: [
        { left: "wallet-api", right: "Перевод, лимит, ключ" },
        { left: "ledger", right: "Проводки, не UI" },
        { left: "kyc-gateway", right: "Личность, не баланс" },
        { left: "card-processor", right: "Авторизация, не KYC" },
        { left: "antifraud", right: "Скор, не создание проводки" },
      ],
    },
    {
      kind: "spot",
      title: "SA · Все ходят во все",
      prompt: "Где сломана граница.",
      lines: [
        { id: "1", text: "CRM пишет в ledger напрямую", bad: true, why: "Обход wallet-api." },
        { id: "2", text: "Только wallet двигает P2P principal", bad: false, why: "Master." },
        { id: "3", text: "Antifraud создаёт списание «на всякий»", bad: true, why: "Чужой агрегат." },
        { id: "4", text: "sms-gw не знает лимиты", bad: false, why: "Правильная слепота." },
        { id: "5", text: "Общая БД на 12 команд", bad: true, why: "Скрытая связность." },
      ],
    },
    {
      kind: "case",
      title: "SA · Микросервис на каждый чих статуса",
      situation: "12 сервисов на P2P. Ops не знает, где смотреть UNKNOWN.",
      question: "Рекомендация?",
      options: [
        o("Ещё сервис статусов.", false, "Ещё шов."),
        o("Меньше швов вокруг денег. Один платёжный контур, явный API, сверка. Не мода.", true, "Для ops и денег."),
        o("Монолит навсегда.", false, "Догма."),
      ],
      debrief: "Архитектура на языке сбоев и владения данными.",
    },
  ],
  "middle-3-errors": [
    {
      kind: "sort",
      title: "SA · Класс ошибки P2P",
      prompt: "От этого зависят ретраи и текст.",
      buckets: [
        { id: "val", title: "Валидация" },
        { id: "biz", title: "Бизнес-правило" },
        { id: "sys", title: "Зависимость" },
        { id: "race", title: "Гонка" },
      ],
      items: [
        { id: "a", text: "amount отрицательный", bucket: "val", why: "4xx, не ретраить телом." },
        { id: "b", text: "Повтор ключа", bucket: "biz", why: "409 no-op." },
        { id: "c", text: "Процессор 504", bucket: "sys", why: "UNKNOWN, ретрай с ключом." },
        { id: "d", text: "Два POST одновременно с одним ключом", bucket: "race", why: "Один победил." },
        { id: "e", text: "Нет скоупа", bucket: "biz", why: "403." },
      ],
    },
    {
      kind: "scene",
      title: "SA · 500 на дубле перевода",
      setting: "Клиент видит ошибку. Деньги ушли. Ретрай уводит ещё.",
      steps: [
        {
          from: "QA",
          line: "Ну 500, пусть ретраят.",
          options: [
            o("Да, стандарт.", false, "Идемпотентность умрёт."),
            o("Дубль — 409. 5xx только когда не знаем, прошёл ли. Иначе множим ledger.", true, "Код = деньги."),
            o("Спрячем 500 за 200.", false, "Ещё хуже клиентам API."),
          ],
        },
      ],
    },
    {
      kind: "order",
      title: "SA · Каталог ошибок среза",
      prompt: "Минимум до релиза.",
      items: [
        { id: "1", text: "Список кодов и кто ретраит", pos: 1 },
        { id: "2", text: "Текст человеку vs лог", pos: 2 },
        { id: "3", text: "Идемпотентный повтор", pos: 3 },
        { id: "4", text: "Алерт ops на всплеск UNKNOWN", pos: 4 },
      ],
    },
  ],
  "middle-3-workshop": [
    {
      kind: "order",
      title: "SA · Воркшоп: ломающий change OpenAPI",
      prompt: "Mobile и wallet-api. 50 минут. Нужна версия.",
      items: [
        { id: "1", text: "Цель: совместимость, не терапия", pos: 1 },
        { id: "2", text: "Факты: какие клиенты на v1, какой трафик", pos: 2 },
        { id: "3", text: "Опции: additive vs новая major", pos: 3 },
        { id: "4", text: "Решение Accountable вслух", pos: 4 },
        { id: "5", text: "Пилот заголовка версии и дата выключения v1", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "SA · Фасилитация, которая развалилась",
      prompt: "Что вы сделали не так.",
      lines: [
        { id: "1", text: "Говорили больше всех про Kafka", bad: true, why: "Не фасилитатор." },
        { id: "2", text: "Парковали оффтоп", bad: false, why: "Ритуал." },
        { id: "3", text: "Не было таймера на опции версий", bad: true, why: "Съели решение." },
        { id: "4", text: "Owner контракта на доске", bad: false, why: "След." },
        { id: "5", text: "18 человек «послушать»", bad: true, why: "Толпа." },
      ],
    },
    {
      kind: "scene",
      title: "SA · Архитектор захватил маркер",
      setting: "20 минут C4. Mobile молчит про ломающее поле.",
      steps: [
        {
          from: "Вы",
          line: "(внутри) пора",
          options: [
            o("Пусть дорисует.", false, "Потеряли клиента API."),
            o("Стоп. Опции совместимости по 5 минут. C4 — если выберем новый шов.", true, "Вернули стол."),
            o("Кофе.", false, "Нет ведущего."),
          ],
        },
      ],
    },
  ],
};
