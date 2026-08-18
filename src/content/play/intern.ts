import type { ContentBlock } from "@/types/content";

const o = (text: string, good: boolean, why: string) => ({ text, good, why });

export const INTERN_EXTRAS: Record<string, ContentBlock[]> = {
  "intern-1-profession": [
    {
      kind: "sort",
      title: "SA · Что вы разбираете в Malo Wallet",
      prompt: "Первая неделя. PO кидает «кнопку». Разложите: поведение системы / бизнес-боль / не ваша работа сегодня.",
      buckets: [
        { id: "sys", title: "Поведение системы" },
        { id: "biz", title: "Боль бизнеса" },
        { id: "out", title: "Не сейчас" },
      ],
      items: [
        { id: "a", text: "KYC зависает в PENDING больше 15 минут — клиент не видит причину", bucket: "sys", why: "Статус и контракт шлюза." },
        { id: "b", text: "Конверсия онбординга упала после смены провайдера", bucket: "biz", why: "Исход, не поле JSON." },
        { id: "c", text: "Перекрасить иконку кошелька", bucket: "out", why: "Дизайн без правила." },
        { id: "d", text: "Повторный POST /kyc/start без ключа создаёт вторую заявку", bucket: "sys", why: "Идемпотентность." },
        { id: "e", text: "Проверьте заявку kyc_8841 глазами", bucket: "out", why: "Операционный тикет, не change." },
        { id: "f", text: "Отдел роста хочет «как у Тинькофф»", bucket: "out", why: "Чужой UI, нет контракта." },
      ],
    },
    {
      kind: "match",
      title: "SA · Кто master каких данных",
      prompt: "Смешанная роль. Свяжите контур Malo Wallet и что ему нельзя отдавать чужому сервису.",
      pairs: [
        { left: "wallet-api", right: "Идемпотентный перевод и лимит" },
        { left: "ledger", right: "Проводка, не текст кнопки" },
        { left: "kyc-gateway", right: "Статус личности, не баланс" },
        { left: "sms-gw", right: "Доставка OTP, не решение «впускать»" },
        { left: "antifraud", right: "Скор/блок, не создание ledger-записи" },
      ],
    },
    {
      kind: "spot",
      title: "Guest · ShopLine: тикет «сделайте интеграцию»",
      prompt: "Чужой продукт. Отметьте строки, которые нельзя брать как системное требование.",
      lines: [
        { id: "1", text: "Заказы должны синхронизироваться", bad: true, why: "Нет направления, частоты, ключа, ошибки." },
        { id: "2", text: "При создании заказа ShopLine шлёт POST /orders с idempotency-key", bad: false, why: "Есть актор, глагол, ключ." },
        { id: "3", text: "Сделать как у Wildberries", bad: true, why: "Чужой продукт." },
        { id: "4", text: "409 если order_id уже есть — остатки не двигаем", bad: false, why: "Наблюдаемый fail." },
        { id: "5", text: "Проверьте заказ 12044", bad: true, why: "Run." },
      ],
    },
    {
      kind: "scene",
      title: "BA+SA · Стендап: «ты кто, документы?»",
      setting: "Malo Wallet, 9:32. Вас Intern.",
      steps: [
        {
          from: "PO",
          line: "Ну ты просто оформляешь то, что скажем?",
          options: [
            o("Да, Confluence из Slack.", false, "Секретарь."),
            o("Я перевожу боль онбординга в поведение: статусы KYC, повтор заявки, что видит клиент при REJECT.", true, "Need + контракт."),
            o("Я сразу нарисую Kafka.", false, "Option без вопроса."),
          ],
        },
        {
          from: "Dev",
          line: "Скажи поля для kyc-gateway, мне кодить.",
          options: [
            o("Вот 30 полей на всякий случай.", false, "Свалка."),
            o("Сначала: какие статусы нам возвращают и что мы показываем. Поля — из этого, не наоборот.", true, "Статус раньше JSON."),
            o("Это BA, я не трогаю API.", false, "IT-аналитик как раз трогает."),
          ],
        },
      ],
    },
  ],
  "intern-1-sdlc": [
    {
      kind: "order",
      title: "SA · Выпуск карты к дате PCI-среза",
      prompt: "Malo Wallet. Комплаенс просит неизменяемый лог авторизаций. PO кладёт рядом «анимацию карты».",
      items: [
        { id: "a", text: "Отделить compliance-инкремент от косметики: свой DoD", pos: 1 },
        { id: "b", text: "Контракт лога: кто пишет, какой ключ, запрет UPDATE", pos: 2 },
        { id: "c", text: "Тонкий срез: один тип события auth + тест «update падает»", pos: 3 },
        { id: "d", text: "Анимация карты — если осталась ёмкость", pos: 4 },
        { id: "e", text: "Отчёт: лог append-only, сверка с card-processor", pos: 5 },
      ],
    },
    {
      kind: "match",
      title: "SA · Кто что делает на доске",
      prompt: "Не путайте ритмы.",
      pairs: [
        { left: "PO", right: "Лог раньше анимации" },
        { left: "SA", right: "Поля события и запрет update" },
        { left: "Dev", right: "Срез, который выкатывается" },
        { left: "QA", right: "Попытка подделать запись — fail" },
        { left: "Ops", right: "Куда смотреть, если пайп лога лёг" },
      ],
    },
    {
      kind: "spot",
      title: "Guest · CityPark: «всё в этот спринт»",
      prompt: "Парковки. Регулятор сессий + смена цвета шлагбаума. Что сломает DoD?",
      lines: [
        { id: "1", text: "Один WIP: сессия парковки неизменяема после close", bad: false, why: "Ядро." },
        { id: "2", text: "В том же спринте редизайн приложения", bad: true, why: "Два ритма." },
        { id: "3", text: "Хотфикс шлагбаума — ops-поток, не бэклог фичи", bad: false, why: "Run vs change." },
        { id: "4", text: "Velocity 20, три темы «потом порежем в четверг»", bad: true, why: "Классический срыв." },
      ],
    },
  ],
  "intern-1-team": [
    {
      kind: "sort",
      title: "SA · RACI на статус KYC",
      prompt: "Malo Wallet. Кто решает правило, кто пишет сервис, кого звать, кого только уведомить.",
      buckets: [
        { id: "a", title: "Accountable" },
        { id: "r", title: "Responsible" },
        { id: "c", title: "Consulted" },
        { id: "i", title: "Informed" },
      ],
      items: [
        { id: "1", text: "PO онбординга — правило «когда REJECT окончательный»", bucket: "a", why: "Один решатель." },
        { id: "2", text: "Команда kyc-gateway — контракт статусов", bucket: "r", why: "Делают систему." },
        { id: "3", text: "Комплаенс AML — формулировка отказа", bucket: "c", why: "Consulted, не veto на каждый коммит." },
        { id: "4", text: "Поддержка — скрипт «что сказать клиенту»", bucket: "i", why: "Их учат после правила." },
        { id: "5", text: "SA, который фиксирует enum статусов", bucket: "r", why: "Responsible за ясность контракта." },
        { id: "6", text: "Провайдер Sumsub-like — таймауты их API", bucket: "c", why: "Внешний контракт." },
      ],
    },
    {
      kind: "scene",
      title: "SA · Два сервиса спорят, чей статус",
      setting: "wallet-api показывает ACTIVE, kyc-gateway ещё PENDING.",
      steps: [
        {
          from: "Mobile",
          line: "Какой статус показывать на экране?",
          options: [
            o("Любой, лишь бы красиво.", false, "Враньё данных."),
            o("Экран читает kyc как master личности. wallet не имеет права рисовать ACTIVE, пока KYC не APPROVED.", true, "Master данных."),
            o("Пусть клиент сам обновит через 5 минут.", false, "Спрятали шов."),
          ],
        },
      ],
    },
    {
      kind: "spot",
      title: "Guest · HR Pulse: письмо «всем ответить»",
      prompt: "Доступы в AD. Что ломает решение.",
      lines: [
        { id: "1", text: "Кому: all@, тема: роли срочно", bad: true, why: "Нет адресата." },
        { id: "2", text: "Нужно: одно правило от владельца каталога ролей", bad: false, why: "Accountable." },
        { id: "3", text: "CC: маркетинг и охрана офиса", bad: true, why: "Шум." },
        { id: "4", text: "Вопрос к ИБ: привилегия admin через JIT, ок?", bad: false, why: "Точечный Consulted." },
      ],
    },
  ],
  "intern-1-questions": [
    {
      kind: "sort",
      title: "SA · Какой вопрос к интеграции",
      prompt: "Созвон с kyc-gateway. Не спрашивайте цвет кнопки.",
      buckets: [
        { id: "open", title: "Открытый" },
        { id: "closed", title: "Закрытый / факт" },
        { id: "lead", title: "Наводящий" },
        { id: "late", title: "Рано" },
      ],
      items: [
        { id: "a", text: "Что происходит, когда провайдер шлёт webhook дважды?", bucket: "open", why: "Поведение." },
        { id: "b", text: "Идемпотентный ключ — application_id?", bucket: "closed", why: "Да/нет на контракт." },
        { id: "c", text: "Вы же хотите Kafka, правда?", bucket: "lead", why: "Подсказка option." },
        { id: "d", text: "Какой градиент экрана REJECT?", bucket: "late", why: "UI до статусов." },
        { id: "e", text: "p95 webhook за последнюю неделю — число", bucket: "closed", why: "Факт." },
        { id: "f", text: "Какие статусы бывают кроме APPROVED/REJECT?", bucket: "open", why: "Модель." },
      ],
    },
    {
      kind: "order",
      title: "SA · 20 минут с провайдером KYC",
      prompt: "Порядок, который даёт контракт, не впечатления.",
      items: [
        { id: "1", text: "Цель: статусы, таймаут, повтор webhook", pos: 1 },
        { id: "2", text: "Один живой payload (не «как обычно»)", pos: 2 },
        { id: "3", text: "Ключ идемпотентности и окно", pos: 3 },
        { id: "4", text: "Что на 5xx / тишине 30с", pos: 4 },
        { id: "5", text: "Открытое — owner и слот, не «ещё часок»", pos: 5 },
      ],
    },
    {
      kind: "scene",
      title: "Guest · MedQueue: врач говорит «система тупит»",
      setting: "11 минут. Нужен факт, не UI.",
      steps: [
        {
          from: "Врач",
          line: "Запись прыгает, сделайте нормально.",
          options: [
            o("Какие кнопки удобнее?", false, "UI до гонки."),
            o("Один слот: два клиента POST одновременно. Какой статус слота в БД после?", true, "Гонка — системный вопрос."),
            o("Это саппорт.", false, "SA видит run, чтобы увидеть race."),
          ],
        },
      ],
    },
  ],
  "intern-2-requirement": [
    {
      kind: "sort",
      title: "SA · Need / требование системы / wish / тикет",
      prompt: "P2P в Malo Wallet. Не путайте слои.",
      buckets: [
        { id: "need", title: "Need" },
        { id: "req", title: "Системное требование" },
        { id: "wish", title: "Желание" },
        { id: "tix", title: "Тикет" },
      ],
      items: [
        { id: "a", text: "Клиент дважды тапнул «отправить» — ушло два перевода", bucket: "need", why: "Боль." },
        { id: "b", text: "Повтор POST /transfers с тем же Idempotency-Key → 409, ledger не двигается", bucket: "req", why: "Проверяемый контракт." },
        { id: "c", text: "Чтобы было вау как у банков мечты", bucket: "wish", why: "Нельзя сломать тестом." },
        { id: "d", text: "Посмотрите transfer_902", bucket: "tix", why: "Run." },
        { id: "e", text: "Клиент видит статус UNKNOWN, не «успех», если процессор молчит 3с", bucket: "req", why: "Наблюдаемо." },
        { id: "f", text: "Сделать модно", bucket: "wish", why: "Пусто." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Черновик требования на перевод",
      prompt: "Что не является системным требованием.",
      lines: [
        { id: "1", text: "Система должна быть надёжной", bad: true, why: "NFR без меры." },
        { id: "2", text: "При совпадении Idempotency-Key за 24ч ответ 409, баланс без изменения", bad: false, why: "Fail есть." },
        { id: "3", text: "Желательно микросервисы", bad: true, why: "Option." },
        { id: "4", text: "amount в минорных единицах, валюта ISO-4217", bad: false, why: "Данные." },
        { id: "5", text: "Сделать красиво", bad: true, why: "Пусто." },
      ],
    },
    {
      kind: "case",
      title: "BA+SA · PO: «интеграция с банком — это требование»",
      situation: "Confluence: «Нужна интеграция с Orient как у всех». Спринт начат.",
      question: "Что фиксируете сегодня?",
      options: [
        o("Story «Интеграция Orient» на 13 SP.", false, "Оценили туман."),
        o("Направление, файл или API, ключ сверки, что на расхождении. Без этого в спринт не кладёте.", true, "IT-требование."),
        o("Ждёте архитектора молча.", false, "SA — переводчик контракта."),
      ],
      debrief: "«Как у всех» не требование. Требование — то, что QA и Postman могут уронить.",
    },
  ],
  "intern-2-levels": [
    {
      kind: "match",
      title: "SA · Слой требования на KYC",
      prompt: "Не прыгайте сразу в JSON.",
      pairs: [
        { left: "Снизить ручные разборы KYC на 40%", right: "Business" },
        { left: "Клиент видит причину REJECT человеческим языком", right: "Stakeholder" },
        { left: "Webhook: status enum + correlation_id", right: "Solution" },
        { left: "Dual-run старого экрана 14 дней", right: "Transition · экран" },
        { left: "Обучение саппорта скрипту отказа", right: "Transition · люди" },
      ],
    },
    {
      kind: "order",
      title: "SA · Не начинайте с полей",
      prompt: "Жалоба: «висит проверка». Порядок слоёв.",
      items: [
        { id: "1", text: "Business: какая метрика и чей P&L", pos: 1 },
        { id: "2", text: "Stakeholder: что видит клиент и саппорт", pos: 2 },
        { id: "3", text: "Solution: статусы, таймаут, повтор webhook", pos: 3 },
        { id: "4", text: "Transition: как вкатываем, кого учим", pos: 4 },
      ],
    },
    {
      kind: "scene",
      title: "SA · Архитектор сразу про JSON",
      setting: "15 минут. KYC.",
      steps: [
        {
          from: "Архитектор",
          line: "Давайте сразу payload. Какие поля?",
          options: [
            o("Сначала enum статусов и кто master. Поля из переходов.", true, "Модель раньше свалки."),
            o("24 поля, вдруг пригодится.", false, "Свалка."),
            o("Я только BA.", false, "IT-аналитик держит слои."),
          ],
        },
      ],
    },
  ],
  "intern-2-stakeholders": [
    {
      kind: "sort",
      title: "SA · Карта на смену card-processor",
      prompt: "Сила vs интерес. Не коллекторы — выпуск карт.",
      buckets: [
        { id: "manage", title: "Manage closely" },
        { id: "keep", title: "Keep satisfied" },
        { id: "inform", title: "Keep informed" },
        { id: "watch", title: "Monitor" },
      ],
      items: [
        { id: "a", text: "PO карт — режет scope 3DS", bucket: "manage", why: "Сила и интерес." },
        { id: "b", text: "ИБ / PCI — может стопнуть релиз", bucket: "keep", why: "Вето точечное." },
        { id: "c", text: "Оператор саппорта карт", bucket: "inform", why: "Интерес высокий, власти мало." },
        { id: "d", text: "Маркетинг про цвет пластика", bucket: "watch", why: "Не этот change." },
        { id: "e", text: "Тимлид card-processor", bucket: "manage", why: "Без него нет среза." },
        { id: "f", text: "Юрист договора с процессором", bucket: "keep", why: "Контракт SLA." },
      ],
    },
    {
      kind: "case",
      title: "SA · Забыли антифрод на лимитах P2P",
      situation: "UAT: antifraud режет 30% легитимных переводов. Релиз стоп.",
      question: "Что было дырой?",
      options: [
        o("Они сами должны были прийти.", false, "SA зовёт Consulted по правилу."),
        o("Не собрали тех, кто владеет скором. Чините: код отказа, порог FP, пилот 5%.", true, "Стейкхолдер системы."),
        o("Откатить и забыть.", false, "Боль останется."),
      ],
      debrief: "Пропущенный системный Consulted дороже лишнего письма.",
    },
    {
      kind: "spot",
      title: "Guest · Orient Bank: 40 имён из AD",
      prompt: "Реестр погашений. Кого выкинуть из воркшопа.",
      lines: [
        { id: "1", text: "Все, кто комментировал Jira когда-либо", bad: true, why: "Шум." },
        { id: "2", text: "Владелец формата файла и сверки", bad: false, why: "Контракт." },
        { id: "3", text: "Гендир «на всякий»", bad: true, why: "Дайджест, не workshop." },
        { id: "4", text: "Оператор, который руками чинит расхождения", bad: false, why: "As-is правда." },
      ],
    },
  ],
  "intern-2-quality": [
    {
      kind: "spot",
      title: "SA · INVEST на историю перевода",
      prompt: "Отметьте, что нельзя брать в спринт.",
      lines: [
        { id: "1", text: "As a user I want систему чтобы было хорошо", bad: true, why: "Не testable." },
        { id: "2", text: "Повтор ключа → 409. Тест: два POST подряд.", bad: false, why: "Small + testable." },
        { id: "3", text: "Зависит от смены процессора и редизайна приложения", bad: true, why: "Не independent." },
        { id: "4", text: "89 SP, «потом порежем»", bad: true, why: "Не small." },
        { id: "5", text: "Текст 409 без stacktrace", bad: false, why: "Сообщение проверяемо." },
      ],
    },
    {
      kind: "match",
      title: "SA · Какая дыра в формулировке",
      prompt: "Свяжите дефект качества.",
      pairs: [
        { left: "«API должно быть быстрым»", right: "Неизмеримо" },
        { left: "UI + шлюз + 1С в одной story", right: "Не atomic" },
        { left: "Два PO правят enum статусов KYC", right: "Не consistent · владельцы" },
        { left: "Нет субъекта «кто видит REJECT»", right: "Не complete" },
        { left: "Противоречит уже живущему reversal", right: "Не consistent · reversal" },
      ],
    },
    {
      kind: "scene",
      title: "SA · QA: «это нельзя уронить»",
      setting: "Вы написали «удобный онбординг».",
      steps: [
        {
          from: "QA",
          line: "Где fail?",
          options: [
            o("Вы тестировщики, придумайте.", false, "SA даёт наблюдаемый fail."),
            o("Fail 1: вторая заявка KYC с тем же application_id. Fail 2: PENDING > 15м без причины на экране.", true, "Два контракта."),
            o("Релиз без QA.", false, "Самоубийство."),
          ],
        },
      ],
    },
  ],
  "intern-3-elicitation": [
    {
      kind: "order",
      title: "SA · Элиситация 3DS-отказа",
      prompt: "Не начинайте с воркшопа на 14 человек.",
      items: [
        { id: "1", text: "Логи card-processor: коды отказа за 7 дней", pos: 1 },
        { id: "2", text: "Один живой кейс в приложении (запись экрана)", pos: 2 },
        { id: "3", text: "Интервью с саппортом: что говорят клиенту", pos: 3 },
        { id: "4", text: "Черновик state-машины 3DS — подтвердить/опровергнуть", pos: 4 },
        { id: "5", text: "Воркшоп только если спор Accountable по коду", pos: 5 },
      ],
    },
    {
      kind: "sort",
      title: "SA · Какой приём",
      prompt: "Не «давайте встречу».",
      buckets: [
        { id: "obs", title: "Логи / наблюдение" },
        { id: "int", title: "Интервью" },
        { id: "doc", title: "Контракт / OpenAPI" },
        { id: "ws", title: "Воркшоп" },
      ],
      items: [
        { id: "a", text: "Не ясно, какой HTTP реально шлёт процессор", bucket: "doc", why: "Спека." },
        { id: "b", text: "Клиент тыкает «обновить» 8 раз — гонка", bucket: "obs", why: "Поведение." },
        { id: "c", text: "ИБ и продукт спорят, можно ли показывать raw code", bucket: "ws", why: "Конфликт правила." },
        { id: "d", text: "Юрист не придёт на стол — 20 минут тет-а-тет", bucket: "int", why: "Редкий стейкхолдер." },
        { id: "e", text: "Webhook сырой за месяц уже в S3", bucket: "obs", why: "Факты дешевле мнений." },
      ],
    },
    {
      kind: "case",
      title: "Guest · ShopLine: воркшоп слишком рано",
      situation: "PO собрал 14 человек «на требования остатков». Need и контракт сырые. Вас просят фасилитировать.",
      question: "Первые 5 минут?",
      options: [
        o("Miro: «как должно быть».", false, "Дизайн без шва."),
        o("Сворачиваете: один заказ, один складской ключ, что на 409. Остальное — слоты.", true, "Элиситация ≠ толпа."),
        o("Стенограмма криков.", false, "Секретарь."),
      ],
      debrief: "Толпа дорогая. Сначала payload и частота.",
    },
  ],
  "intern-3-notes": [
    {
      kind: "sort",
      title: "SA · Заметки созвона по sms-gw",
      prompt: "Через час интонации умрут.",
      buckets: [
        { id: "dec", title: "Решение / контракт" },
        { id: "oq", title: "Открытый вопрос" },
        { id: "fact", title: "Факт" },
        { id: "noise", title: "Шум" },
      ],
      items: [
        { id: "a", text: "OTP: TTL 120с, повтор не чаще 3/10мин", bucket: "dec", why: "Правило." },
        { id: "b", text: "Провайдер не дал SLA на INTL", bucket: "oq", why: "Follow-up." },
        { id: "c", text: "3.2% недоставки за неделю, не «много»", bucket: "fact", why: "Цифра." },
        { id: "d", text: "Шутка про кофе", bucket: "noise", why: "Не в протокол." },
        { id: "e", text: "Не кладём бизнес-решение «впускать» в sms-gw", bucket: "dec", why: "Граница контекста." },
        { id: "f", text: "Кто owner шаблона текста — до пятницы", bucket: "oq", why: "Owner+срок." },
      ],
    },
    {
      kind: "spot",
      title: "SA · Протокол, который никто не откроет",
      prompt: "Мёртвые куски.",
      lines: [
        { id: "1", text: "18 фамилий без ролей и систем", bad: true, why: "Нужны контуры." },
        { id: "2", text: "Решили: webhook OTP идемпотентен по message_id. Owner: SA sms", bad: false, why: "Контракт." },
        { id: "3", text: "Обсуждали много интересного", bad: true, why: "Ноль." },
        { id: "4", text: "Открыто: код ошибки провайдера на blacklist. Срок: ср", bad: false, why: "Живой вопрос." },
        { id: "5", text: "Стенограмма на 6 страниц", bad: true, why: "Не читают." },
      ],
    },
    {
      kind: "scene",
      title: "SA · PO: «запроси протокол как обычно»",
      setting: "Все встают.",
      steps: [
        {
          from: "PO",
          line: "Ну ты там выложи транскрипт.",
          options: [
            o("Ок, 12 страниц вечером.", false, "Транскрипт ≠ контракт."),
            o("90 секунд вслух: статусы, TTL, owners. Потом 6 строк в чат.", true, "Подтверждение в комнате."),
            o("Некогда.", false, "Потеряете неделю."),
          ],
        },
      ],
    },
  ],
  "intern-3-story": [
    {
      kind: "spot",
      title: "SA · История «как у банка мечты»",
      prompt: "Выкиньте из story мерчантского реестра до груминга.",
      lines: [
        { id: "1", text: "As a бухгалтер I want сверку реестра so that не править 1С руками", bad: false, why: "Роль + so that." },
        { id: "2", text: "Сделать красивый дашборд как у конкурента", bad: true, why: "Чужой UI." },
        { id: "3", text: "AC: файл T+1, ключ merchant_id+rrn, расхождение → статус MISMATCH", bad: false, why: "Контракт." },
        { id: "4", text: "Переезд на новый эквайер в этой же story", bad: true, why: "Другой инкремент." },
        { id: "5", text: "Out of scope: смена 1С", bad: false, why: "Граница." },
      ],
    },
    {
      kind: "match",
      title: "SA · Каркас story на сверку",
      prompt: "IT-начинка, не слоган.",
      pairs: [
        { left: "Роль", right: "Оператор сверки acquiring" },
        { left: "Want", right: "Видеть MISMATCH по rrn" },
        { left: "So that", right: "Не править ledger вручную" },
        { left: "AC", right: "Файл принят или отклонён с кодом" },
        { left: "Out of scope", right: "Новый эквайер и редизайн 1С" },
      ],
    },
    {
      kind: "case",
      title: "SA · Story на 34 SP",
      situation: "Внутри: UI, antifraud, шлюз, обучение, отчёт регулятору по мерчантам.",
      question: "Груминг?",
      options: [
        o("Оставляете 34.", false, "Не возьмут."),
        o("Вертикаль: парсер файла + MISMATCH в API. UI список — следующая. Эквайер — не этот срез.", true, "Small + ценный шов."),
        o("Epic и уходите.", false, "Кладбище."),
      ],
      debrief: "Режьте по проверяемому шву системы, не «сначала всю базу».",
    },
  ],
  "intern-3-meeting": [
    {
      kind: "order",
      title: "SA · Созвон по контракту sms-gw",
      prompt: "20 минут. Артефакт на экране — не болтовня.",
      items: [
        { id: "1", text: "Цель и стоп-время: TTL и коды ошибок", pos: 1 },
        { id: "2", text: "Один payload / таблица кодов на экране", pos: 2 },
        { id: "3", text: "Решения вслух: enum, ретраи", pos: 3 },
        { id: "4", text: "Owners в чат до выхода", pos: 4 },
        { id: "5", text: "Кто не нужен системе — отпускаете на 8-й минуте", pos: 5 },
      ],
    },
    {
      kind: "scene",
      title: "SA · Встреча уехала в event sourcing",
      setting: "Минута 22. Нужен код ошибки blacklist.",
      steps: [
        {
          from: "Архитектор",
          line: "Давайте шину на год…",
          options: [
            o("Ещё час, интересно.", false, "Цель умерла."),
            o("Стоянка. Сейчас: код + ретраи sms-gw. Шина — отдельный слот.", true, "Фасилитация контракта."),
            o("Молчите, Intern.", false, "Роль не про стаж."),
          ],
        },
      ],
    },
    {
      kind: "spot",
      title: "Guest · MedQueue: инвайт на 45 минут",
      prompt: "Что убьёт встречу до старта.",
      lines: [
        { id: "1", text: "Тема: слоты и вообще", bad: true, why: "Нет цели." },
        { id: "2", text: "Цель: yes/no правилу гонки POST /slots/{id}/book", bad: false, why: "Можно уйти с контрактом." },
        { id: "3", text: "Обязательны: SA, тимлид, владелец расписания", bad: false, why: "Не толпа." },
        { id: "4", text: "Повтор в четверг на всякий", bad: true, why: "Нет DoD." },
      ],
    },
  ],
};
