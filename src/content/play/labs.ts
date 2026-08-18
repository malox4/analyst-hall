import type { LabMission } from "@/types/content";

const o = (text: string, good: boolean, why: string) => ({ text, good, why });

export const LABS: LabMission[] = [
  {
    id: "lab-intern-1",
    gradeId: "intern",
    title: "KYC зависла, 03:12",
    teaser: "Malo Wallet. Статусы, повтор заявки, не «кнопка как у банка».",
    minutes: 12,
    xp: 80,
    setting: "Ночной Slack. Клиент в PENDING 40 минут. PO орёт UI. Dev орёт поля. Вы Intern.",
    blocks: [
      {
        kind: "sort",
        title: "SA · Пачка сообщений",
        prompt: "Поведение / боль / не сейчас.",
        buckets: [
          { id: "sys", title: "Система" },
          { id: "biz", title: "Боль" },
          { id: "out", title: "Не сейчас" },
        ],
        items: [
          { id: "a", text: "PENDING > 15м без причины на экране", bucket: "sys", why: "Статус." },
          { id: "b", text: "Конверсия онбординга упала", bucket: "biz", why: "Исход." },
          { id: "c", text: "Проверьте kyc_8841", bucket: "out", why: "Тикет." },
          { id: "d", text: "Второй POST /kyc/start без ключа", bucket: "sys", why: "Идемпотентность." },
          { id: "e", text: "Кнопка как у Тинькофф", bucket: "out", why: "Чужой UI." },
        ],
      },
      {
        kind: "match",
        title: "SA · Master данных",
        prompt: "Кто чем владеет.",
        pairs: [
          { left: "kyc-gateway", right: "Статус личности" },
          { left: "wallet-api", right: "Лимит после APPROVED" },
          { left: "sms-gw", right: "OTP, не решение впускать" },
        ],
      },
      {
        kind: "scene",
        title: "BA+SA · Чат",
        setting: "Три пинга.",
        steps: [
          {
            from: "Mobile",
            line: "Какой статус рисовать, если wallet уже ACTIVE?",
            options: [
              o("Любой красивый.", false, "Враньё."),
              o("KYC — master личности. Не ACTIVE, пока не APPROVED.", true, "Шов."),
              o("Пусть обновят через 5 минут.", false, "Спрятали."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lab-intern-2",
    gradeId: "intern",
    title: "Guest: заказ ShopLine",
    teaser: "Чужой продукт. Контракт заказа, не вселенная Wallet.",
    minutes: 10,
    xp: 70,
    setting: "Маркетплейс. «Сделайте интеграцию как у WB».",
    blocks: [
      {
        kind: "spot",
        title: "SA · Тикет интеграции",
        prompt: "Что нельзя брать.",
        lines: [
          { id: "1", text: "Заказы должны синхронизироваться", bad: true, why: "Нет ключа." },
          { id: "2", text: "POST /orders с idempotency-key", bad: false, why: "Контракт." },
          { id: "3", text: "Как у Wildberries", bad: true, why: "Чужой UI." },
          { id: "4", text: "409 если order_id есть — остатки не двигаем", bad: false, why: "Fail." },
        ],
      },
      {
        kind: "order",
        title: "SA · 20 минут с их SA",
        prompt: "Порядок.",
        items: [
          { id: "1", text: "Направление и актор", pos: 1 },
          { id: "2", text: "Один живой payload", pos: 2 },
          { id: "3", text: "Ключ и 409", pos: 3 },
          { id: "4", text: "Что на 5xx", pos: 4 },
        ],
      },
      {
        kind: "case",
        title: "BA+SA · Воркшоп на 14 человек",
        situation: "Need и контракт сырые.",
        question: "Первые 5 минут?",
        options: [
          o("Miro to-be.", false, "Рано."),
          o("Один заказ, один ключ, 409. Остальное — слоты.", true, "Не толпа."),
          o("Стенограмма.", false, "Секретарь."),
        ],
        debrief: "Guest-задача: тот же навык, другой продукт.",
      },
    ],
  },
  {
    id: "lab-intern-3",
    gradeId: "intern",
    title: "Контракт sms-gw за 20 минут",
    teaser: "TTL, коды, граница: шлюз не решает «впускать».",
    minutes: 8,
    xp: 65,
    setting: "Malo Wallet. Инвайт был «SMS и вообще».",
    blocks: [
      {
        kind: "spot",
        title: "SA · Инвайт",
        prompt: "Что убьёт встречу.",
        lines: [
          { id: "1", text: "Тема: SMS и вообще", bad: true, why: "Нет цели." },
          { id: "2", text: "Цель: TTL и таблица кодов yes/no", bad: false, why: "Контракт." },
          { id: "3", text: "Обязательны SA, провайдер, mobile", bad: false, why: "Не толпа." },
          { id: "4", text: "Повтор в четверг на всякий", bad: true, why: "Нет DoD." },
        ],
      },
      {
        kind: "sort",
        title: "SA · Заметки",
        prompt: "Куда строка.",
        buckets: [
          { id: "dec", title: "Контракт" },
          { id: "fact", title: "Факт" },
          { id: "noise", title: "Шум" },
        ],
        items: [
          { id: "a", text: "TTL 120с, 3/10мин", bucket: "dec", why: "Правило." },
          { id: "b", text: "3.2% недоставки", bucket: "fact", why: "Цифра." },
          { id: "c", text: "Шутка про кофе", bucket: "noise", why: "Нет." },
          { id: "d", text: "sms-gw не владеет «впускать»", bucket: "dec", why: "Граница." },
        ],
      },
      {
        kind: "scene",
        title: "SA · Уехали в шину",
        setting: "Минута 18.",
        steps: [
          {
            from: "Архитектор",
            line: "Event sourcing на год.",
            options: [
              o("Ещё час.", false, "Цель умерла."),
              o("Стоянка. Сейчас коды sms-gw.", true, "Фасилитация."),
              o("Молчите.", false, "Роль не стаж."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lab-junior-1",
    gradeId: "junior",
    title: "POST /transfers без тумана",
    teaser: "AC и OpenAPI. Оценка только после ключа.",
    minutes: 12,
    xp: 90,
    setting: "Груминг P2P. «Идемпотентность как обычно».",
    blocks: [
      {
        kind: "order",
        title: "SA · Given/When/Then",
        prompt: "Postman поймёт.",
        items: [
          { id: "1", text: "Given: баланс и неиспользованный ключ K", pos: 1 },
          { id: "2", text: "When: POST с K", pos: 2 },
          { id: "3", text: "Then: 201 и движение ledger", pos: 3 },
          { id: "4", text: "When again: 409, баланс тот же", pos: 4 },
        ],
      },
      {
        kind: "spot",
        title: "SA · Дыры спецификации",
        prompt: "Мины.",
        lines: [
          { id: "1", text: "Нет Idempotency-Key required", bad: true, why: "Деньги." },
          { id: "2", text: "409 DUPLICATE", bad: false, why: "Ок." },
          { id: "3", text: "Всегда 200 + success:false", bad: true, why: "Ломает ретраи." },
          { id: "4", text: "amount в минорах", bad: false, why: "Данные." },
        ],
      },
      {
        kind: "scene",
        title: "SA · «Ну как обычно»",
        setting: "Оценки через 2 минуты.",
        steps: [
          {
            from: "PO",
            line: "Ну ключ, 5 SP.",
            options: [
              o("Ок.", false, "Дыра."),
              o("Окно, 504, кто видит UNKNOWN — иначе не оцениваем.", true, "Clarify."),
              o("Пусть ADR.", false, "SA в комнате."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lab-junior-2",
    gradeId: "junior",
    title: "Guest: гонка слота MedQueue",
    teaser: "Два POST одновременно. Чей статус в БД?",
    minutes: 9,
    xp: 75,
    setting: "Клиника. «Запись прыгает».",
    blocks: [
      {
        kind: "scene",
        title: "SA · Врач: система тупит",
        setting: "11 минут.",
        steps: [
          {
            from: "Врач",
            line: "Сделайте нормально.",
            options: [
              o("Какие кнопки?", false, "UI."),
              o("Два клиента в один слот. Какой статус после обоих POST?", true, "Race."),
              o("Саппорт.", false, "SA."),
            ],
          },
        ],
      },
      {
        kind: "spot",
        title: "SA · Use case раздут",
        prompt: "Что вынести.",
        lines: [
          { id: "1", text: "Основной: успешный book", bad: false, why: "Ядро." },
          { id: "2", text: "19 альтернатив включая шрифт", bad: true, why: "Мёртвый." },
          { id: "3", text: "Гонка: второй 409 SLOT_TAKEN", bad: false, why: "Деньги времени врача." },
          { id: "4", text: "Редизайн кабинета", bad: true, why: "Другой change." },
        ],
      },
      {
        kind: "order",
        title: "SA · Каркас use case",
        prompt: "Система-система + человек.",
        items: [
          { id: "1", text: "Актор: клиент приложения", pos: 1 },
          { id: "2", text: "Предусловие: слот FREE", pos: 2 },
          { id: "3", text: "Основной: BOOKED", pos: 3 },
          { id: "4", text: "Альт: гонка → 409", pos: 4 },
        ],
      },
    ],
  },
  {
    id: "lab-junior-3",
    gradeId: "junior",
    title: "Реестр мерчанта, T+1",
    teaser: "Ключ merchant_id+rrn. MISMATCH без ручного ledger.",
    minutes: 10,
    xp: 80,
    setting: "Acquiring Malo Wallet. Excel ещё жив.",
    blocks: [
      {
        kind: "sort",
        title: "SA · As-is / gap / мечта",
        prompt: "Не Kafka.",
        buckets: [
          { id: "as", title: "As-is" },
          { id: "g", title: "Gap" },
          { id: "m", title: "Мечта" },
        ],
        items: [
          { id: "a", text: "Правки ledger руками", bucket: "as", why: "Правда." },
          { id: "b", text: "Нет ключа сверки", bucket: "g", why: "Пропасть." },
          { id: "c", text: "Свой брокер «как у взрослых»", bucket: "m", why: "Стек." },
          { id: "d", text: "Файл плывёт по колонкам", bucket: "as", why: "Контракт живой?" },
        ],
      },
      {
        kind: "match",
        title: "SA · Story сверки",
        prompt: "Каркас.",
        pairs: [
          { left: "Want", right: "Видеть MISMATCH по rrn" },
          { left: "AC", right: "Файл accepted/rejected с кодом" },
          { left: "Out", right: "Смена эквайера" },
        ],
      },
      {
        kind: "case",
        title: "SA · 34 SP",
        situation: "UI + antifraud + шлюз + 1С.",
        question: "Срез?",
        options: [
          o("34 целиком.", false, "Нет."),
          o("Парсер + MISMATCH в API. UI список — следующая.", true, "Шов."),
          o("Epic.", false, "Кладбище."),
        ],
        debrief: "Режьте по проверяемому файлу.",
      },
    ],
  },
  {
    id: "lab-middle-1",
    gradeId: "middle",
    title: "Нет третьему BFF",
    teaser: "Лишний шов vs идемпотентность к дате.",
    minutes: 11,
    xp: 95,
    setting: "Спонсор плодит сервисы. Срез P2P горит.",
    blocks: [
      {
        kind: "sort",
        title: "SA · WSJF",
        prompt: "Сейчас / позже / убить.",
        buckets: [
          { id: "now", title: "Сейчас" },
          { id: "wait", title: "Позже" },
          { id: "kill", title: "Убить" },
        ],
        items: [
          { id: "a", text: "Ключ P2P, уже двойные проводки", bucket: "now", why: "Деньги." },
          { id: "b", text: "Тёмная тема", bucket: "wait", why: "CoD." },
          { id: "c", text: "BFF «на всякий»", bucket: "kill", why: "Шов." },
          { id: "d", text: "UNKNOWN на 3DS", bucket: "now", why: "Враньё." },
        ],
      },
      {
        kind: "scene",
        title: "SA · «Нет — плохой ответ»",
        setting: "Спонсор.",
        steps: [
          {
            from: "Спонсор",
            line: "Команда гибкая.",
            options: [
              o("Впишем три сервиса.", false, "Ложь."),
              o("Нет швам. Да — ключ в wallet-api. Вот обмен.", true, "Нет."),
              o("Тихо режем.", false, "Долг."),
            ],
          },
        ],
      },
      {
        kind: "spot",
        title: "SA · Письмо",
        prompt: "Яд вон.",
        lines: [
          { id: "1", text: "Извините что я такой", bad: true, why: "Не вы." },
          { id: "2", text: "BFF вместо ключа к дате", bad: false, why: "Обмен." },
          { id: "3", text: "Вы хотите неправильно", bad: true, why: "Атака." },
        ],
      },
    ],
  },
  {
    id: "lab-middle-2",
    gradeId: "middle",
    title: "SQL, который врёт",
    teaser: "«Дублей нет». Знаменатель, ключ, не ФИО.",
    minutes: 12,
    xp: 100,
    setting: "PO орёт: BI 3, вы 14.",
    blocks: [
      {
        kind: "spot",
        title: "SA · Где запрос солгал",
        prompt: "Отметьте.",
        lines: [
          { id: "1", text: "Только SUCCESS, ERROR выкинули", bad: true, why: "Скрыли." },
          { id: "2", text: "Окно как в AC", bad: false, why: "Ок." },
          { id: "3", text: "Склейка по ФИО", bad: true, why: "Не ключ." },
          { id: "4", text: "Цифра без знаменателя", bad: true, why: "14 из чего." },
        ],
      },
      {
        kind: "sort",
        title: "SA · Тип запроса",
        prompt: "Факт / опасно / ops.",
        buckets: [
          { id: "f", title: "Факт" },
          { id: "b", title: "Опасно" },
          { id: "o", title: "Ops" },
        ],
        items: [
          { id: "a", text: "COUNT двойных SUCCESS на ключ", bucket: "f", why: "Дыра." },
          { id: "b", text: "SELECT * на проде", bucket: "b", why: "Нагрузка." },
          { id: "c", text: "UPDATE статуса руками", bucket: "b", why: "След." },
          { id: "d", text: "Найти transfer_902", bucket: "o", why: "Тикет." },
        ],
      },
      {
        kind: "case",
        title: "SA · Две цифры",
        situation: "Словарь разный.",
        question: "Ход?",
        options: [
          o("Мы правы.", false, "Война."),
          o("Сверить определение дубля. Два знаменателя = два вопроса.", true, "Семантика."),
          o("8.5.", false, "Туман."),
        ],
        debrief: "SQL без словаря контракта бесполезен.",
      },
    ],
  },
  {
    id: "lab-middle-3",
    gradeId: "middle",
    title: "Guest: файл Orient «как получится»",
    teaser: "Колонки плывут. Трафик не включаем без контракта.",
    minutes: 10,
    xp: 90,
    setting: "Спека 2019. Юристы подписали.",
    blocks: [
      {
        kind: "match",
        title: "SA · Стиль интеграции",
        prompt: "Не всё REST.",
        pairs: [
          { left: "Ночной реестр", right: "Файл + сверка" },
          { left: "Холд лимита", right: "Синхронный API" },
          { left: "Тикет при MISMATCH", right: "Событие" },
        ],
      },
      {
        kind: "order",
        title: "SA · До кода",
        prompt: "Порядок.",
        items: [
          { id: "1", text: "Ключ строки", pos: 1 },
          { id: "2", text: "Кодировка и обязательные колонки", pos: 2 },
          { id: "3", text: "Коды отклонения", pos: 3 },
          { id: "4", text: "Ops, когда пайп лёг", pos: 4 },
        ],
      },
      {
        kind: "scene",
        title: "SA · «Не парьтесь»",
        setting: "Партнёр.",
        steps: [
          {
            from: "Orient",
            line: "Колонки иногда плывут.",
            options: [
              o("Подстроимся.", false, "Прод."),
              o("Фиксируем. Иначе не включаем трафик.", true, "Контракт."),
              o("Суд.", false, "Рано."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lab-senior-1",
    gradeId: "senior",
    title: "Buy vs build KYC",
    teaser: "Таблица опций. Не влюбляйтесь в провайдера.",
    minutes: 11,
    xp: 110,
    setting: "Ручные разборы личности. Архитектор уже пишет адаптер.",
    blocks: [
      {
        kind: "match",
        title: "SA · Option vs исход",
        prompt: "Свяжите.",
        pairs: [
          { left: "Меньше ручных разборов", right: "Need" },
          { left: "Допилить gateway", right: "Build" },
          { left: "Сменить провайдера", right: "Buy" },
          { left: "Как у банка мечты", right: "Не option" },
        ],
      },
      {
        kind: "spot",
        title: "SA · Стыдная таблица",
        prompt: "Дыры.",
        lines: [
          { id: "1", text: "Только плюсы любимого", bad: true, why: "Продажа." },
          { id: "2", text: "p95, lock, обратимость", bad: false, why: "Оси." },
          { id: "3", text: "Do nothing", bad: false, why: "CoD." },
          { id: "4", text: "20 равноценных опций", bad: true, why: "Паралич." },
        ],
      },
      {
        kind: "scene",
        title: "SA · «Просто подпиши ADR»",
        setting: "Уже начали.",
        steps: [
          {
            from: "Архитектор",
            line: "Оформи как анализ.",
            options: [
              o("Ок.", false, "Декоратор."),
              o("Решение ≠ анализ. Таблица за день или alternatives=none.", true, "След."),
              o("На 80 человек.", false, "Яд."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lab-senior-2",
    gradeId: "senior",
    title: "Лифт: процессор за 40 секунд",
    teaser: "CFO. Потом 6 минут совету. Без C4 в первой фразе.",
    minutes: 9,
    xp: 100,
    setting: "Вы готовили час диаграмм.",
    blocks: [
      {
        kind: "scene",
        title: "SA · «Ну?»",
        setting: "Лифт.",
        steps: [
          {
            from: "CFO",
            line: "В двух словах.",
            options: [
              o("Bounded context…", false, "Потеряли."),
              o("Тапают дважды — проводим дважды. Ключ. 6 недель. Нет — дыра ledger. Yes на пилот.", true, "Исход."),
              o("Слот на час.", false, "Окно."),
            ],
          },
        ],
      },
      {
        kind: "order",
        title: "SA · Бриф 6 минут",
        prompt: "Порядок.",
        items: [
          { id: "1", text: "Что сломается в авторизациях", pos: 1 },
          { id: "2", text: "Решение одной фразой", pos: 2 },
          { id: "3", text: "Цена и убитый шов", pos: 3 },
          { id: "4", text: "Стоп-кран UNKNOWN", pos: 4 },
          { id: "5", text: "Просьба yes/no/пилот", pos: 5 },
        ],
      },
      {
        kind: "spot",
        title: "SA · Слайды",
        prompt: "Вон.",
        lines: [
          { id: "1", text: "18 определений", bad: true, why: "Совет." },
          { id: "2", text: "График UNKNOWN", bad: false, why: "Док." },
          { id: "3", text: "Скрин IDE", bad: true, why: "Не они." },
          { id: "4", text: "«Поддержать платформу»", bad: true, why: "Не голос." },
        ],
      },
    ],
  },
  {
    id: "lab-senior-3",
    gradeId: "senior",
    title: "Go/no-go 17:40",
    teaser: "Пилот P2P зелёный. FP орёт. Юрист молчит. Студия.",
    minutes: 12,
    xp: 120,
    setting: "Окно до пятницы. Вы держите контур ключа.",
    blocks: [
      {
        kind: "spot",
        title: "SA · Пакет студии",
        prompt: "Не готово?",
        lines: [
          { id: "1", text: "Fail двух POST с одним ключом", bad: false, why: "Деньги." },
          { id: "2", text: "Нет UNKNOWN", bad: true, why: "Враньё SUCCESS." },
          { id: "3", text: "Owner гиперкэра", bad: false, why: "После." },
          { id: "4", text: "Figma без кодов", bad: true, why: "Картинка." },
        ],
      },
      {
        kind: "scene",
        title: "SA · Катим?",
        setting: "PO давит.",
        steps: [
          {
            from: "PO",
            line: "Окно до пятницы.",
            options: [
              o("Катим.", false, "Нет крана."),
              o("No-go без порога FP. Go — 5% с отзывом за час.", true, "Условный."),
              o("Снимаете с себя.", false, "Студия."),
            ],
          },
        ],
      },
      {
        kind: "case",
        title: "SA · Пилот убил смену шлюза",
        situation: "Хотели новый sms-gw. Ключ message_id закрыл 90%.",
        question: "Как выглядите?",
        options: [
          o("Защищаем старое.", false, "Эго."),
          o("Меняем рекомендацию вслух. След: что узнали.", true, "Мышление."),
          o("Дата назад.", false, "Подлог."),
        ],
        debrief: "Студия дешевле меняет мнение, чем прод.",
      },
    ],
  },
];
