import type { ContentBlock } from "@/types/content";

const o = (text: string, good: boolean, why: string) => ({ text, good, why });

export const JUNIOR_EXTRAS: Record<string, ContentBlock[]> = {
  "junior-1-stories": [
    {
      kind: "sort",
      title: "SA · Нарезка 3DS: story / task / bug / spike",
      prompt: "Malo Wallet. Не всё — user story.",
      buckets: [
        { id: "s", title: "Story" },
        { id: "t", title: "Task" },
        { id: "b", title: "Bug" },
        { id: "k", title: "Spike" },
      ],
      items: [
        { id: "a", text: "Клиент видит человеческую причину отказа 3DS", bucket: "s", why: "Ценность + экран." },
        { id: "b", text: "Поднять индекс на auth_id", bucket: "t", why: "Нет самостоятельной ценности." },
        { id: "c", text: "В проде ACS вернул 500, мы нарисовали SUCCESS", bucket: "b", why: "Слом контракта." },
        { id: "d", text: "Не ясно, окно идемпотентности ACS 10 или 30 мин", bucket: "k", why: "Незнание." },
        { id: "e", text: "Повтор challenge не создаёт вторую авторизацию", bucket: "s", why: "Поведение денег/карты." },
        { id: "f", text: "Поменять линтер card-processor", bucket: "t", why: "Инженерия." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Три инкремента в одной «теме карт»",
      prompt: "Что вынести.",
      lines: [
        { id: "1", text: "Маппинг кодов ACS → наш enum", bad: false, why: "Ядро шва." },
        { id: "2", text: "Новый дашборд PCI для аудита", bad: true, why: "Другой ритм." },
        { id: "3", text: "Редизайн всего экрана карты", bad: true, why: "Не small." },
        { id: "4", text: "Текст отказа на текущем экране", bad: false, why: "Тонкий UX поверх контракта." },
        { id: "5", text: "Смена процессора", bad: true, why: "Другой change." },
      ],
    },
    {
      kind: "scene",
      title: "Guest · ShopLine: «это же одна интеграция»",
      setting: "Остатки + заказы + отзывы в одном ticket.",
      steps: [
        {
          from: "PO",
          line: "Ну это всё ShopLine, зачем дробить.",
          options: [
            o("Один ticket на месяц.", false, "Нет шва."),
            o("Тема одна. Инкремент: сначала идемпотентный POST /orders. Остатки — следующий контракт.", true, "Тема ≠ story."),
            o("Пусть SM.", false, "SA режет контракт."),
          ],
        },
      ],
    },
  ],
  "junior-1-ac": [
    {
      kind: "spot",
      title: "SA · Контракт карты: auth / capture / refund",
      prompt: "Что нельзя брать в AC кассы.",
      lines: [
        { id: "1", text: "POST /cards/authorize при holdThenCapture → AUTHORIZED, hold OPEN, ledger без ног", bad: false, why: "Холд." },
        { id: "2", text: "POST .../capture → DR клиента CR мерчанта, hold CAPTURED", bad: false, why: "Журнал." },
        { id: "3", text: "Оплата должна проходить как в хорошем банке", bad: true, why: "Нет fail." },
        { id: "4", text: "Refund без refundPostsReversal может разъехать trial — это баг контракта, не «фича кошелька»", bad: false, why: "Дыра наблюдаема." },
        { id: "5", text: "Сделать эквайринг", bad: true, why: "Не AC." },
      ],
    },
    {
      kind: "order",
      title: "SA · Given/When/Then на POST /transfers",
      prompt: "AC, который QA и Postman поймут одинаково.",
      items: [
        { id: "1", text: "Given: кошелёк A, баланс 100_000 миноров, ключ K ещё не использован", pos: 1 },
        { id: "2", text: "When: POST /transfers с Idempotency-Key K, amount 10_000", pos: 2 },
        { id: "3", text: "Then: 201, ledger −10_000, тело с transfer_id", pos: 3 },
        { id: "4", text: "When again: тот же K → 409, баланс без изменения", pos: 4 },
        { id: "5", text: "Neg: чужой ключ и тот же payload — новый перевод (если хватает баланса)", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "SA · AC «работает корректно»",
      prompt: "Что не критерий.",
      lines: [
        { id: "1", text: "Система работает корректно и удобно", bad: true, why: "Нет fail." },
        { id: "2", text: "Then: второй ledger-entry с тем же ключом отсутствует", bad: false, why: "Наблюдаемо." },
        { id: "3", text: "И ещё всё как в Figma", bad: true, why: "Figma не оракул денег." },
        { id: "4", text: "Timeout процессора 3с → transfer UNKNOWN, не SUCCESS", bad: false, why: "Негатив." },
        { id: "5", text: "Желательно без багов", bad: true, why: "Пусто." },
      ],
    },
    {
      kind: "match",
      title: "SA · Тип проверки",
      prompt: "Свяжите AC и вид.",
      pairs: [
        { left: "Счастливый перевод → 201", right: "Позитив" },
        { left: "Недостаточно средств → 422 INSUFFICIENT_FUNDS", right: "Бизнес-отказ" },
        { left: "Двойной тап / тот же ключ → 409", right: "Идемпотентность" },
        { left: "Текст 409 без stacktrace", right: "Сообщение" },
        { left: "Нет скоупа transfers:write → 403", right: "Авторизация" },
      ],
    },
  ],
  "junior-1-usecase": [
    {
      kind: "order",
      title: "SA · Use case: webhook KYC",
      prompt: "Не user story в одну строку.",
      items: [
        { id: "1", text: "Актор: kyc-gateway (система-система)", pos: 1 },
        { id: "2", text: "Предусловие: заявка в PENDING, application_id известен", pos: 2 },
        { id: "3", text: "Основной: webhook APPROVED → wallet может поднять лимит", pos: 3 },
        { id: "4", text: "Альтернатива: тишина 15м → EXPIRED, не APPROVED", pos: 4 },
        { id: "5", text: "Постусловие: один статус, audit append-only", pos: 5 },
      ],
    },
    {
      kind: "sort",
      title: "SA · Use case или нет",
      prompt: "Не всё достойно сценария.",
      buckets: [
        { id: "uc", title: "Use case" },
        { id: "no", title: "Не сценарий" },
      ],
      items: [
        { id: "a", text: "Провайдер шлёт webhook статуса", bucket: "uc", why: "Цель и актор." },
        { id: "b", text: "email varchar(255)", bucket: "no", why: "Поле." },
        { id: "c", text: "Саппорт переоткрывает заявку", bucket: "uc", why: "Цель." },
        { id: "d", text: "Цвет бейджа KYC", bucket: "no", why: "UI." },
        { id: "e", text: "Клиент оспаривает REJECT", bucket: "uc", why: "Отдельная цель." },
      ],
    },
    {
      kind: "case",
      title: "Guest · CityPark: QA просит 19 веток",
      situation: "Use case брони слота раздут. Никто не читает.",
      question: "Как режете?",
      options: [
        o("Оставляете 19 — полнота.", false, "Мёртвый документ."),
        o("Основной + 3 альтернативы, которые меняют занятость слота. Остальное — список AC.", true, "Читаемость."),
        o("В Confluence и надеетесь.", false, "Надежда не метод."),
      ],
      debrief: "Use case жив, пока его можно прогнать за 3 минуты вслух по статусам.",
    },
  ],
  "junior-1-clarify": [
    {
      kind: "scene",
      title: "SA · PO: «ну идемпотентность, как обычно»",
      setting: "Груминг P2P. Оценки просят сейчас.",
      steps: [
        {
          from: "PO",
          line: "Ну там как всегда ключ.",
          options: [
            o("Ок, 5 SP.", false, "Оценили дыру."),
            o("Какой заголовок, какое окно, что на таймаут, кто видит UNKNOWN? Без этого не оцениваем.", true, "Clarify контракта."),
            o("Пусть архитектор напишет ADR.", false, "SA фасилитирует ясность до оценки."),
          ],
        },
        {
          from: "Dev",
          line: "Я уже начал Kafka, не тормози.",
          options: [
            o("Догоним документом.", false, "Код без контракта."),
            o("Пауза 15 минут: ключ и 409. Kafka может не понадобиться.", true, "Дешёвая ясность."),
            o("Эскалируйте сами.", false, "Вы в комнате."),
          ],
        },
      ],
    },
    {
      kind: "sort",
      title: "SA · Что уточнять первым в OpenAPI",
      prompt: "Не все дыры одинаково дорогие.",
      buckets: [
        { id: "now", title: "Сейчас" },
        { id: "later", title: "Потом" },
        { id: "never", title: "Не этот стол" },
      ],
      items: [
        { id: "a", text: "Идемпотентный ключ и коды 4xx/5xx", bucket: "now", why: "Деньги и ретраи." },
        { id: "b", text: "Иконка 409", bucket: "later", why: "После контракта." },
        { id: "c", text: "Любимый фреймворк стажёра", bucket: "never", why: "Шум." },
        { id: "d", text: "Поведение при 504 процессора", bucket: "now", why: "UNKNOWN." },
        { id: "e", text: "Названия DTO в Kotlin", bucket: "never", why: "Их ремесло." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Список вопросов на 2 часа",
      prompt: "Что выкинуть, чтобы PO и dev не сбежали.",
      lines: [
        { id: "1", text: "Ключ и окно идемпотентности", bad: false, why: "Деньги." },
        { id: "2", text: "Любимый шрифт оператора сверки", bad: true, why: "Не сейчас." },
        { id: "3", text: "Кто master статуса перевода", bad: false, why: "Данные." },
        { id: "4", text: "Имена переменных", bad: true, why: "Dev." },
        { id: "5", text: "Что показываем клиенту vs что в audit", bad: false, why: "Два контракта." },
      ],
    },
  ],
  "junior-2-brd": [
    {
      kind: "match",
      title: "SA · Секции BRD, которые живут",
      prompt: "Эквайринг Malo Wallet. Не роман.",
      pairs: [
        { left: "Проблема", right: "12% реестров с MISMATCH руками" },
        { left: "Системный исход", right: "Файл принят или отклонён с кодом" },
        { left: "Scope", right: "T+1 текущий эквайер, не смена банка" },
        { left: "Успех", right: "Ручные правки ledger < 2 в неделю" },
        { left: "Ограничения", right: "Нельзя UPDATE проводки задним числом" },
      ],
    },
    {
      kind: "spot",
      title: "SA · BRD на 48 страниц",
      prompt: "Что убить.",
      lines: [
        { id: "1", text: "История компании с 1998", bad: true, why: "Не этот документ." },
        { id: "2", text: "In/out of scope: формат файла и API статуса", bad: false, why: "Граница системы." },
        { id: "3", text: "Копипаст BABOK", bad: true, why: "Учебник." },
        { id: "4", text: "RACI на merchant_id+rrn", bad: false, why: "Владение ключом." },
        { id: "5", text: "Скриншоты чужого эквайринга «для вдохновения»", bad: true, why: "Option." },
      ],
    },
    {
      kind: "case",
      title: "BA+SA · BRD никто не подписал, dev уже в коде",
      situation: "PO: «ну ок в принципе». Формат файла не зафиксирован.",
      question: "Как чините?",
      options: [
        o("Мокрые печати всех C-level.", false, "Бюрократия."),
        o("Одна страница: ключ сверки, коды MISMATCH, запрет ручного ledger. Yes от PO и ops сверки.", true, "Договор шва."),
        o("Удаляете BRD, живёте в Slack.", false, "Память короткая."),
      ],
      debrief: "BRD ценен границами системы, не объёмом.",
    },
  ],
  "junior-2-srs": [
    {
      kind: "sort",
      title: "SA · SRS vs Figma vs runbook",
      prompt: "Нотификации OTP.",
      buckets: [
        { id: "srs", title: "SRS / контракт" },
        { id: "ui", title: "UI-спека" },
        { id: "ops", title: "Runbook" },
      ],
      items: [
        { id: "a", text: "TTL OTP 120с, 3 попытки", bucket: "srs", why: "Правило системы." },
        { id: "b", text: "Отступ кнопки «получить код»", bucket: "ui", why: "Визуал." },
        { id: "c", text: "Если sms-gw 504 — не говорить клиенту «вы в системе»", bucket: "ops", why: "Скрипт смены." },
        { id: "d", text: "Коды 429/503 и Retry-After", bucket: "srs", why: "API." },
        { id: "e", text: "Цвет алерта", bucket: "ui", why: "Тема." },
      ],
    },
    {
      kind: "order",
      title: "SA · Кому какой срез SRS",
      prompt: "Не одна простыня.",
      items: [
        { id: "1", text: "Dev: заголовки, коды, идемпотентность", pos: 1 },
        { id: "2", text: "QA: AC и негатив Postman", pos: 2 },
        { id: "3", text: "Arch: граница sms-gw vs wallet-api", pos: 3 },
        { id: "4", text: "Ops: что делать при всплеске 503", pos: 4 },
      ],
    },
    {
      kind: "scene",
      title: "SA · Dev: «в SRS нет их нового 409»",
      setting: "За день до релиза OTP. Провайдер шлёт 409 сами.",
      steps: [
        {
          from: "Dev",
          line: "Они начали отдавать 409, мы ждали только 200/500.",
          options: [
            o("Не в скоупе, игнор.", false, "Клиент без OTP."),
            o("Gap сегодня: таблица кодов + поведение. Не «в следующем BRD».", true, "SRS живой."),
            o("Пусть читают RFC провайдера сами.", false, "SA — переводчик."),
          ],
        },
      ],
    },
  ],
  "junior-2-trace": [
    {
      kind: "order",
      title: "SA · Нитка: лимит P2P",
      prompt: "Чтобы вырезание поля не убило KPI молча.",
      items: [
        { id: "1", text: "KPI: ручные разборы лимита −50%", pos: 1 },
        { id: "2", text: "Требование: дневной лимит в wallet-api", pos: 2 },
        { id: "3", text: "AC: 422 LIMIT, audit причины", pos: 3 },
        { id: "4", text: "Тест QA + кусок кода", pos: 4 },
        { id: "5", text: "Метрика limit_blocked в проде", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "SA · Вырезали «мелочь»",
      prompt: "Что должно было заорать трассировкой.",
      lines: [
        { id: "1", text: "Убрали audit причины лимита «чтобы быстрее»", bad: true, why: "След KPI и споров." },
        { id: "2", text: "Оставили 422", bad: false, why: "Ядро живо." },
        { id: "3", text: "Текст клиенту выпилили", bad: true, why: "Stakeholder-слой." },
        { id: "4", text: "Story не связана с KPI в Jira", bad: true, why: "Нитка оборвана." },
        { id: "5", text: "Тест двух переводов сверх лимита есть", bad: false, why: "Связь жива." },
      ],
    },
    {
      kind: "case",
      title: "Guest · Orient: «где требование к файлу»",
      situation: "Полгода спустя. Код есть, Confluence умер, Jira мигрировали.",
      question: "Минимум следа?",
      options: [
        o("Код — правда.", false, "Код молчит про ключ сверки."),
        o("Формат, ключ, коды отклонения, id теста, метрика MISMATCH. Хоть в README сервиса.", true, "Тонкая нитка."),
        o("BRD 48 стр в почте.", false, "Не найдут."),
      ],
      debrief: "Трассировка — умение найти контракт, не тома.",
    },
  ],
  "junior-2-write": [
    {
      kind: "spot",
      title: "SA · Канцелярит в спецификации",
      prompt: "Отметьте пустые фразы.",
      lines: [
        { id: "1", text: "Осуществляется реализация функционала по оптимизации API", bad: true, why: "Ноль." },
        { id: "2", text: "Повторный Idempotency-Key не двигает ledger", bad: false, why: "Глагол и объект." },
        { id: "3", text: "Необходимо обеспечить возможность пользователю", bad: true, why: "Канцелярит." },
        { id: "4", text: "amount — integer миноров, currency — ISO-4217", bad: false, why: "Данные." },
        { id: "5", text: "В рамках улучшения клиентского опыта", bad: true, why: "Вода." },
      ],
    },
    {
      kind: "match",
      title: "SA · Плохо → прямо",
      prompt: "IT-перевод.",
      pairs: [
        { left: "Осуществить интеграцию", right: "Принять webhook KYC" },
        { left: "Оптимизировать процесс", right: "Убрать ручной MISMATCH" },
        { left: "Гибкая архитектура", right: "Сменить sms-gw без смены TTL OTP" },
        { left: "User-friendly ошибка", right: "422 с кодом, без stacktrace" },
        { left: "Асинхронно обработать", right: "202 + poll GET /jobs/{id}" },
      ],
    },
    {
      kind: "scene",
      title: "SA · Тимлид: «я не понял абзац»",
      setting: "Вы гордитесь слогом.",
      steps: [
        {
          from: "Тимлид",
          line: "Прочитай вслух. Спотыкаешься — перепиши.",
          options: [
            o("Это официальный стиль SRS.", false, "Официальный ≠ ясный."),
            o("Одно предложение: что ledger делает при повторном ключе.", true, "Письмо для кода."),
            o("Добавлю определений.", false, "Хуже."),
          ],
        },
      ],
    },
  ],
  "junior-3-uml": [
    {
      kind: "sort",
      title: "SA · Какая схема на 3DS",
      prompt: "Не class diagram, когда нужна гонка.",
      buckets: [
        { id: "seq", title: "Sequence" },
        { id: "state", title: "State" },
        { id: "act", title: "Activity" },
        { id: "cls", title: "Модель данных" },
      ],
      items: [
        { id: "a", text: "Кто кому шлёт challenge и ACS", bucket: "seq", why: "Время." },
        { id: "b", text: "AUTH: initiated → challenged → ok / failed", bucket: "state", why: "Жизнь объекта." },
        { id: "c", text: "Саппорт: звонок → проверка → эскалация процессору", bucket: "act", why: "Люди." },
        { id: "d", text: "Поля Authorization и acs_trans_id", bucket: "cls", why: "Данные." },
        { id: "e", text: "Два callback ACS одновременно", bucket: "seq", why: "Гонка." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Диаграмма «всё сразу»",
      prompt: "Что убивает пользу.",
      lines: [
        { id: "1", text: "40 классов, Kafka, CRM, чайник", bad: true, why: "Не читается." },
        { id: "2", text: "Sequence только retry ACS", bad: false, why: "Один вопрос." },
        { id: "3", text: "Без легенды статусов", bad: true, why: "Слова врут." },
        { id: "4", text: "id AC на стрелке", bad: false, why: "Трассировка." },
        { id: "5", text: "Clipart человечков", bad: true, why: "Шум." },
      ],
    },
    {
      kind: "case",
      title: "SA · Архитектор хочет C4 в первый день KYC",
      situation: "Enum статусов ещё сырой.",
      question: "Что рисуете сегодня?",
      options: [
        o("Полный C4 на 6 слайдах.", false, "Архитектура без вопроса."),
        o("State заявки KYC + sequence webhook. C4 — когда границы стабильны.", true, "Схема отвечает на вопрос."),
        o("UML устарел, ничего.", false, "Мышление нет."),
      ],
      debrief: "Диаграмма — ответ на один системный вопрос.",
    },
  ],
  "junior-3-bpmn": [
    {
      kind: "order",
      title: "SA · As-is онбординга мерчанта",
      prompt: "Правда процесса, не to-be дворец.",
      items: [
        { id: "1", text: "Старт: заявка в Excel от сейлза", pos: 1 },
        { id: "2", text: "Комплаенс смотрит папку на диске", pos: 2 },
        { id: "3", text: "Ручной MCC в acquiring", pos: 3 },
        { id: "4", text: "Доступ в ЛК выдаёт ops через день", pos: 4 },
        { id: "5", text: "Первый реестр часто с неверным merchant_id", pos: 5 },
      ],
    },
    {
      kind: "spot",
      title: "SA · BPMN со шлюзами ради шлюзов",
      prompt: "Что сломано.",
      lines: [
        { id: "1", text: "Exclusive gateway без вопроса", bad: true, why: "Шлюз обязан спрашивать." },
        { id: "2", text: "Пул «Комплаенс» и пул «acquiring»", bad: false, why: "Люди vs система." },
        { id: "3", text: "Цикл без таймера — вечный «ещё документы»", bad: true, why: "Нет стопа." },
        { id: "4", text: "Файл реестра как message event", bad: false, why: "Так и есть." },
        { id: "5", text: "12 цветов без легенды", bad: true, why: "Умрёт." },
      ],
    },
    {
      kind: "scene",
      title: "Guest · HR Pulse: «у нас не так»",
      setting: "Вы принесли красивый as-is выдачи доступов. ИБ смеётся.",
      steps: [
        {
          from: "ИБ",
          line: "Админов выдаём в обход заявки, в AD руками. На схеме нет.",
          options: [
            o("Неофициальное не рисуем.", false, "As-is врёт."),
            o("Серый поток «обход AD». Это gap: нет аудита JIT.", true, "Правда процесса."),
            o("Сами в Paint.", false, "Ваша работа."),
          ],
        },
      ],
    },
  ],
  "junior-3-gap": [
    {
      kind: "match",
      title: "SA · As-is / gap / чужая мечта — sms-gw",
      prompt: "Не путайте боль и брокер.",
      pairs: [
        { left: "Ретраи OTP руками из админки", right: "As-is" },
        { left: "Нет идемпотентности message_id", right: "Gap" },
        { left: "Ключ + 429 + метрика недоставки", right: "To-be срез 1" },
        { left: "Своя Kafka «как у взрослых»", right: "Мечта стека" },
        { left: "3.2% недоставки за неделю", right: "Доказательство as-is" },
      ],
    },
    {
      kind: "sort",
      title: "SA · Что в первый срез gap OTP",
      prompt: "Не дворец.",
      buckets: [
        { id: "s1", title: "Срез 1" },
        { id: "later", title: "Позже" },
        { id: "no", title: "Не этот change" },
      ],
      items: [
        { id: "a", text: "Идемпотентность webhook доставки", bucket: "s1", why: "Дубли OTP." },
        { id: "b", text: "UNKNOWN вместо ложного «код ушёл»", bucket: "s1", why: "Правда статуса." },
        { id: "c", text: "Мобильный редизайн онбординга", bucket: "later", why: "Не эта пропасть." },
        { id: "d", text: "Кафетерий офиса", bucket: "no", why: "Другой мир." },
        { id: "e", text: "Каталог ошибок провайдера", bucket: "s1", why: "Контракт." },
      ],
    },
    {
      kind: "case",
      title: "SA · Gap «у нас нет Kafka»",
      situation: "Архитектор назвал gap отсутствием брокера. Ops орёт, что OTP приходит дважды.",
      question: "Как переназываете?",
      options: [
        o("Gap = нет Kafka.", false, "Option как дыра."),
        o("Gap = система не отличает повтор доставки от новой. Транспорт — option.", true, "Поведение."),
        o("Два gap: Kafka и UI.", false, "Разрезали решение."),
      ],
      debrief: "Gap языком as-is/to-be системы, не стека.",
    },
  ],
  "junior-3-explain": [
    {
      kind: "scene",
      title: "SA · Объясняете идемпотентность PO за 40 секунд",
      setting: "Лифт. Не BABOK.",
      steps: [
        {
          from: "PO",
          line: "Слово страшное. Зачем нам это?",
          options: [
            o("Свойство операции в распределённых системах…", false, "Потеряли."),
            o("Клиент тапнул дважды. Мы не должны провести перевод дважды. Имя этого правила — идемпотентность.", true, "Смысл, потом термин."),
            o("Это для разработчиков.", false, "PO подписывает scope."),
          ],
        },
      ],
    },
    {
      kind: "order",
      title: "SA · Слайд на 3 минуты про MISMATCH",
      prompt: "Не усыпить.",
      items: [
        { id: "1", text: "Боль: ручная правка ledger", pos: 1 },
        { id: "2", text: "Правило ключа merchant_id+rrn", pos: 2 },
        { id: "3", text: "Что в срезе / что нет", pos: 3 },
        { id: "4", text: "Метрика MISMATCH в проде", pos: 4 },
      ],
    },
    {
      kind: "spot",
      title: "SA · Презентация Junior",
      prompt: "Что выкинуть.",
      lines: [
        { id: "1", text: "12 определений BABOK", bad: true, why: "Не аудитория." },
        { id: "2", text: "Один пример payload и 409", bad: false, why: "Доказательство." },
        { id: "3", text: "Анимация логотипа", bad: true, why: "Время." },
        { id: "4", text: "Таблица in/out: файл vs API", bad: false, why: "Решение." },
        { id: "5", text: "Шутка про джунов", bad: true, why: "Не про change." },
      ],
    },
  ],
};
