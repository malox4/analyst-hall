import type { LabMission } from "@/types/content";

const o = (text: string, good: boolean, why: string) => ({ text, good, why });

export const LABS: LabMission[] = [
  {
    id: "lab-intern-1",
    gradeId: "intern",
    title: "Смена 03:12",
    teaser: "Ночной Slack. Отделите need от Kafka и loan 254.",
    minutes: 12,
    xp: 80,
    setting: "Ops кидает loan id. Product: «кнопку». Архитектор: «Kafka». Вы Intern первую неделю.",
    blocks: [
      {
        kind: "sort",
        title: "Пачка сообщений",
        prompt: "Корзины как на живом бэклоге.",
        buckets: [
          { id: "need", title: "Need" },
          { id: "opt", title: "Option" },
          { id: "run", title: "Операционка" },
        ],
        items: [
          { id: "a", text: "Клиенты жалуются на второе списание тела", bucket: "need", why: "Боль." },
          { id: "b", text: "Проверьте loan 254 прямо сейчас", bucket: "run", why: "Тикет смены." },
          { id: "c", text: "Kafka exactly-once", bucket: "opt", why: "Транспорт." },
          { id: "d", text: "Оператор не видит confirmed за 24ч", bucket: "need", why: "Дыра роли." },
          { id: "e", text: "Кнопка как в Payme", bucket: "opt", why: "Чужое решение." },
        ],
      },
      {
        kind: "scene",
        title: "Чат не ждёт",
        setting: "Три пинга за минуту.",
        steps: [
          {
            from: "Ops",
            line: "Ну что, чини 254, ты же аналитик.",
            options: [
              o("Беру loan как epic.", false, "Run ≠ change."),
              o("Сейчас паттерн: сколько таких за неделю и кто Accountable за дубль. 254 — в ops-поток.", true, "Сигнал, не геройство."),
              o("Это не моё.", false, "Вы видите run, чтобы увидеть change."),
            ],
          },
          {
            from: "PO",
            line: "Кнопку как в Payme, срочно.",
            options: [
              o("Ок, рисую Figma.", false, "Option."),
              o("Need: повторный principal. Payme — гипотеза. Сначала правило дубля.", true, "Перевод."),
              o("Пусть архитектор.", false, "Ваш стол."),
            ],
          },
        ],
      },
      {
        kind: "spot",
        title: "Тикет, который завёл PO",
        prompt: "Отметьте брак.",
        lines: [
          { id: "1", text: "As a user I want кнопку Payme", bad: true, why: "Чужой UI." },
          { id: "2", text: "14 жалоб за неделю на второе тело", bad: false, why: "Факт." },
          { id: "3", text: "Сделать Kafka до пятницы", bad: true, why: "Option + дедлайн." },
          { id: "4", text: "Повторный callback не создаёт второй principal", bad: false, why: "AC." },
        ],
      },
    ],
  },
  {
    id: "lab-intern-2",
    gradeId: "intern",
    title: "Интервью на 11 минут",
    teaser: "Коллектор устал. Достаньте случай, не «сделайте нормально».",
    minutes: 10,
    xp: 70,
    setting: "Комната взыскания. Диктофон нельзя. Нужны факты до воркшопа.",
    blocks: [
      {
        kind: "order",
        title: "Порядок вопросов",
        prompt: "Не начинайте с цвета кнопки.",
        items: [
          { id: "1", text: "Зачем мы здесь и сколько минут", pos: 1 },
          { id: "2", text: "Один вчерашний звонок", pos: 2 },
          { id: "3", text: "Что открыли в CRM, что сказали", pos: 3 },
          { id: "4", text: "Частота за неделю — число", pos: 4 },
          { id: "5", text: "Что должно стать правдой, чтобы успокоились", pos: 5 },
        ],
      },
      {
        kind: "scene",
        title: "«Да там всё криво»",
        setting: "Человек смотрит в пол.",
        steps: [
          {
            from: "Коллектор",
            line: "Сделайте нормально, я не технарь.",
            options: [
              o("Ок, какие кнопки.", false, "Туман."),
              o("Возьмём loan 8812. Две галки — тело или комиссия? Время?", true, "Эпизод."),
              o("Вы сами плохо смотрите.", false, "Закрыли рот."),
            ],
          },
        ],
      },
      {
        kind: "sort",
        title: "После разговора: куда строка",
        prompt: "Протокол в голове.",
        buckets: [
          { id: "f", title: "Факт" },
          { id: "d", title: "Решение? ещё нет" },
          { id: "n", title: "Шум" },
        ],
        items: [
          { id: "a", text: "Вчера 8812 — две зелёные", bucket: "f", why: "Случай." },
          { id: "b", text: "«Как в Payme»", bucket: "n", why: "Чужое." },
          { id: "c", text: "PO ещё не зафиксировал дубль", bucket: "d", why: "Открыто." },
          { id: "d", text: "Шутка про кофе", bucket: "n", why: "Не в протокол." },
        ],
      },
    ],
  },
  {
    id: "lab-intern-3",
    gradeId: "intern",
    title: "Созвон, который не стыдно",
    teaser: "20 минут. Цель, артефакт, owners до выхода.",
    minutes: 8,
    xp: 65,
    setting: "Инвайт был «Humo и вообще». Вы Intern, вас попросили вести.",
    blocks: [
      {
        kind: "spot",
        title: "Инвайт",
        prompt: "Что сломает встречу.",
        lines: [
          { id: "1", text: "Тема: Humo и вообще", bad: true, why: "Нет цели." },
          { id: "2", text: "Цель: yes/no правилу дубля", bad: false, why: "Можно уйти." },
          { id: "3", text: "Обязательны PO, риск, тимлид", bad: false, why: "Не толпа." },
          { id: "4", text: "Повтор в четверг на всякий", bad: true, why: "Нет DoD." },
        ],
      },
      {
        kind: "scene",
        title: "Расползлось на Kafka",
        setting: "Минута 18.",
        steps: [
          {
            from: "Архитектор",
            line: "Давайте event sourcing на год.",
            options: [
              o("Интересно, ещё час.", false, "Цель умерла."),
              o("Стоянка. Сейчас правило. Event sourcing — слот отдельно.", true, "Фасилитация."),
              o("Молчите, вы Intern.", false, "Роль не про стаж."),
            ],
          },
        ],
      },
      {
        kind: "order",
        title: "Закрытие",
        prompt: "Все уже встают.",
        items: [
          { id: "1", text: "Три решения вслух", pos: 1 },
          { id: "2", text: "Owners и сроки", pos: 2 },
          { id: "3", text: "В чат до выхода из комнаты", pos: 3 },
        ],
      },
    ],
  },
  {
    id: "lab-junior-1",
    gradeId: "junior",
    title: "Груминг без тумана",
    teaser: "История 34 SP. Нарежьте или не оценивайте.",
    minutes: 12,
    xp: 90,
    setting: "PO не хочет резать. Dev уже думает про Kafka.",
    blocks: [
      {
        kind: "spot",
        title: "Одна «тема Humo»",
        prompt: "Что вынести из story.",
        lines: [
          { id: "1", text: "Детект дубля в API", bad: false, why: "Ядро." },
          { id: "2", text: "Дашборд для ЦБ", bad: true, why: "Другой ритм." },
          { id: "3", text: "Редизайн CRM", bad: true, why: "Не small." },
          { id: "4", text: "Текст 409 на текущем экране", bad: false, why: "Тонкий UX." },
          { id: "5", text: "Смена шлюза", bad: true, why: "Другой change." },
        ],
      },
      {
        kind: "order",
        title: "AC, который QA примет",
        prompt: "Given / When / Then.",
        items: [
          { id: "1", text: "Given: confirmed principal по X", pos: 1 },
          { id: "2", text: "When: retry с тем же X за 24ч", pos: 2 },
          { id: "3", text: "Then: 409, баланс тот же, audit", pos: 3 },
          { id: "4", text: "Neg: другой id — новое списание", pos: 4 },
        ],
      },
      {
        kind: "scene",
        title: "«Это же одна тема»",
        setting: "Оценка через 2 минуты.",
        steps: [
          {
            from: "PO",
            line: "Ну Humo же. Зачем дробить.",
            options: [
              o("Один ticket на месяц.", false, "Нет инкремента."),
              o("Тема одна, срезы разные. Без fail не оцениваем.", true, "Clarify."),
              o("Пусть SM.", false, "Ваш стол."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lab-junior-2",
    gradeId: "junior",
    title: "Нитка не оборвалась",
    teaser: "Вырезали «мелочь». KPI умер. Найдите обрыв.",
    minutes: 9,
    xp: 75,
    setting: "Через спринт кто-то выпилил audit «для скорости».",
    blocks: [
      {
        kind: "order",
        title: "Соберите трассировку",
        prompt: "Need → прод.",
        items: [
          { id: "1", text: "KPI −50% повторных principal", pos: 1 },
          { id: "2", text: "Требование детекта 24ч", pos: 2 },
          { id: "3", text: "AC 409 + audit", pos: 3 },
          { id: "4", text: "Тест QA", pos: 4 },
          { id: "5", text: "Метрика duplicate_blocked", pos: 5 },
        ],
      },
      {
        kind: "spot",
        title: "Что вырезали",
        prompt: "Что должно было заорать.",
        lines: [
          { id: "1", text: "Убрали audit", bad: true, why: "След KPI." },
          { id: "2", text: "Оставили 409", bad: false, why: "Ядро." },
          { id: "3", text: "Текст оператору выпилили", bad: true, why: "Stakeholder." },
          { id: "4", text: "Нет связи story с KPI", bad: true, why: "Нитка мертва заранее." },
        ],
      },
      {
        kind: "case",
        title: "Регулятор через полгода",
        situation: "Jira мигрировали. Где требование?",
        question: "Минимум следа?",
        options: [
          o("Код — правда.", false, "Код молчит про need."),
          o("Need, правило, AC, id теста, метрика.", true, "Тонкая нитка."),
          o("BRD на 48 страниц в почте.", false, "Не найдут."),
        ],
        debrief: "Трассировка — умение найти.",
      },
    ],
  },
  {
    id: "lab-junior-3",
    gradeId: "junior",
    title: "As-is, который врёт",
    teaser: "Ops смеётся над вашей BPMN. Добавьте обход.",
    minutes: 10,
    xp: 80,
    setting: "На схеме всё красиво. В жизни звонят в обход Guide.",
    blocks: [
      {
        kind: "sort",
        title: "As-is / gap / мечта",
        prompt: "Не путайте.",
        buckets: [
          { id: "as", title: "As-is" },
          { id: "g", title: "Gap" },
          { id: "m", title: "Чужая мечта" },
        ],
        items: [
          { id: "a", text: "Guide врёт, звонок в обход", bucket: "as", why: "Правда." },
          { id: "b", text: "Нет детекта дубля", bucket: "g", why: "Пропасть." },
          { id: "c", text: "Новый шлюз как Payme", bucket: "m", why: "Option." },
          { id: "d", text: "Две галки в CRM", bucket: "as", why: "Симптом." },
          { id: "e", text: "Нет UNKNOWN", bucket: "g", why: "Дыра статуса." },
        ],
      },
      {
        kind: "scene",
        title: "«У нас не так»",
        setting: "Старший оператор.",
        steps: [
          {
            from: "Ops",
            line: "Мы врём в Guide. На схеме нет.",
            options: [
              o("Неофициальное не рисуем.", false, "As-is врёт."),
              o("Серый поток «обход» — это и есть gap.", true, "Правда."),
              o("Сами в Paint.", false, "Ваша работа."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lab-middle-1",
    gradeId: "middle",
    title: "Нет с обменом",
    teaser: "CEO хочет Revolut-кнопку. У вас регулятор. Скажите нет.",
    minutes: 11,
    xp: 95,
    setting: "Пятница. Velocity кончилась. Спонсор в чате.",
    blocks: [
      {
        kind: "sort",
        title: "WSJF руками",
        prompt: "Сейчас / позже / убить.",
        buckets: [
          { id: "now", title: "Сейчас" },
          { id: "wait", title: "Позже" },
          { id: "kill", title: "Убить" },
        ],
        items: [
          { id: "a", text: "Детект дубля, жалоба ЦБ", bucket: "now", why: "CoD." },
          { id: "b", text: "Кнопка как Revolut", bucket: "wait", why: "Не штраф." },
          { id: "c", text: "Переписать на Rust", bucket: "kill", why: "Пет." },
          { id: "d", text: "UNKNOWN вместо ложного успеха", bucket: "now", why: "Враньё статуса." },
        ],
      },
      {
        kind: "scene",
        title: "«Нет — плохой ответ»",
        setting: "Спонсор смотрит.",
        steps: [
          {
            from: "Спонсор",
            line: "Команда гибкая.",
            options: [
              o("Впишем.", false, "Ложь."),
              o("Нет этому релизу. Да — дата. Вот что вылетает.", true, "Обмен."),
              o("Тихо режем.", false, "Долг."),
            ],
          },
        ],
      },
      {
        kind: "spot",
        title: "Письмо нет",
        prompt: "Яд выкинуть.",
        lines: [
          { id: "1", text: "Извините что я такой", bad: true, why: "Не про вас." },
          { id: "2", text: "X вместо Y к дате регулятора", bad: false, why: "Обмен." },
          { id: "3", text: "Вы хотите неправильно", bad: true, why: "Атака." },
          { id: "4", text: "Срез и дата пересмотра", bad: false, why: "Да рядом." },
        ],
      },
    ],
  },
  {
    id: "lab-middle-2",
    gradeId: "middle",
    title: "Контракт, который не взорвёт прод",
    teaser: "POST без ключа. Мобильный ретраит 7 раз.",
    minutes: 12,
    xp: 100,
    setting: "Вы SA. OpenAPI набросали за вечер.",
    blocks: [
      {
        kind: "spot",
        title: "Дырявый контракт",
        prompt: "Отметьте мины.",
        lines: [
          { id: "1", text: "POST /pay без idempotency-key", bad: true, why: "Двойные деньги." },
          { id: "2", text: "409 DUPLICATE + message", bad: false, why: "Ок." },
          { id: "3", text: "200 и status=false", bad: true, why: "Ломает клиентов." },
          { id: "4", text: "amount в минорах явно", bad: false, why: "Деньги." },
          { id: "5", text: "Пагинация без cursor", bad: true, why: "Дубли выгрузок." },
        ],
      },
      {
        kind: "order",
        title: "Переговоры со шлюзом",
        prompt: "До кода.",
        items: [
          { id: "1", text: "Кто master статуса", pos: 1 },
          { id: "2", text: "Ключ и повторная доставка", pos: 2 },
          { id: "3", text: "Таймаут → UNKNOWN", pos: 3 },
          { id: "4", text: "Сверка расхождений", pos: 4 },
        ],
      },
      {
        kind: "scene",
        title: "«Мы просто повторяем POST»",
        setting: "Mobile lead.",
        steps: [
          {
            from: "Mobile",
            line: "Так проще.",
            options: [
              o("Бэкенд разберётся.", false, "Нет."),
              o("Ключ на клиенте + серверный no-op. Ретрай без ключа — дефект.", true, "Обе стороны."),
              o("Запретить ретраи.", false, "Сеть."),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "lab-middle-3",
    gradeId: "middle",
    title: "Воркшоп на крик",
    teaser: "Risk vs Collections. 50 минут. Одно правило.",
    minutes: 10,
    xp: 90,
    setting: "Маркер уже у архитектора. Risk молчит.",
    blocks: [
      {
        kind: "order",
        title: "Ритуал 50 минут",
        prompt: "Не терапия.",
        items: [
          { id: "1", text: "Цель: одно правило", pos: 1 },
          { id: "2", text: "Факты на стену", pos: 2 },
          { id: "3", text: "Опции с ценой", pos: 3 },
          { id: "4", text: "Accountable вслух", pos: 4 },
          { id: "5", text: "Пилот и дата", pos: 5 },
        ],
      },
      {
        kind: "scene",
        title: "Захват маркера",
        setting: "Kafka 20 минут.",
        steps: [
          {
            from: "Вы",
            line: "Пора.",
            options: [
              o("Пусть дорисует.", false, "Risk потерян."),
              o("Стоп. Опции по 5 минут. Архитектура — если выберем этот option.", true, "Стол."),
              o("Кофе.", false, "Нет ведущего."),
            ],
          },
        ],
      },
      {
        kind: "spot",
        title: "После воркшопа",
        prompt: "Что провалило.",
        lines: [
          { id: "1", text: "Говорили больше всех", bad: true, why: "Не фасилитация." },
          { id: "2", text: "Owner на доске", bad: false, why: "След." },
          { id: "3", text: "18 слушателей", bad: true, why: "Толпа." },
          { id: "4", text: "Парковали оффтоп", bad: false, why: "Ок." },
        ],
      },
    ],
  },
  {
    id: "lab-senior-1",
    gradeId: "senior",
    title: "Ставка, не бэклог",
    teaser: "Три продукта, один P&L. Убейте две темы.",
    minutes: 11,
    xp: 110,
    setting: "Карты, кредиты, кошелёк хотят «платформу».",
    blocks: [
      {
        kind: "sort",
        title: "Горизонт",
        prompt: "Стратегия / срез / шум.",
        buckets: [
          { id: "s", title: "Ставка" },
          { id: "t", title: "Срез" },
          { id: "n", title: "Шум" },
        ],
        items: [
          { id: "a", text: "Master статуса платежа в группе", bucket: "s", why: "18 мес." },
          { id: "b", text: "Идемпотентность Humo в квартале", bucket: "t", why: "Проверка." },
          { id: "c", text: "Бейдж к 8 марта", bucket: "n", why: "Нет." },
          { id: "d", text: "Снизить хвост жалоб ЦБ", bucket: "s", why: "Исход." },
        ],
      },
      {
        kind: "case",
        title: "Платформа для всех",
        situation: "Бюджет один.",
        question: "Рамка?",
        options: [
          o("Всем сразу.", false, "Ничья ставка."),
          o("Одна ставка: master денег. Остальные — очередь. Явный отказ.", true, "Стратегия = нет."),
          o("Пусть C-level без вас.", false, "Ваш перевод."),
        ],
        debrief: "Стратегия — какой change не делаем.",
      },
      {
        kind: "order",
        title: "40 минут совету направления",
        prompt: "Не микросервисы первыми.",
        items: [
          { id: "1", text: "Исход через год", pos: 1 },
          { id: "2", text: "Где мы master", pos: 2 },
          { id: "3", text: "Что убиваем", pos: 3 },
          { id: "4", text: "Первый срез-проверка", pos: 4 },
        ],
      },
    ],
  },
  {
    id: "lab-senior-2",
    gradeId: "senior",
    title: "Совет, 6 минут",
    teaser: "CFO в лифте. Потом слайды без 18 определений.",
    minutes: 9,
    xp: 100,
    setting: "Вас вызовут без слота. Пакет должен жить в голове.",
    blocks: [
      {
        kind: "scene",
        title: "«В двух словах»",
        setting: "Лифт, 40 секунд.",
        steps: [
          {
            from: "CFO",
            line: "Ну?",
            options: [
              o("Идемпотентность и BACCM…", false, "Потеряли."),
              o("Шлюз стучит дважды — снимаем дважды. Чиним правило. 6 недель. Нет — штраф. Нужен yes на пилот.", true, "Исход, цена, просьба."),
              o("Слот на час.", false, "Окно закрыто."),
            ],
          },
        ],
      },
      {
        kind: "order",
        title: "Бриф",
        prompt: "6 минут на совете.",
        items: [
          { id: "1", text: "Что сломается, если ничего", pos: 1 },
          { id: "2", text: "Решение одной фразой", pos: 2 },
          { id: "3", text: "Цена, срок, что убиваем", pos: 3 },
          { id: "4", text: "Стоп-кран", pos: 4 },
          { id: "5", text: "Просьба yes/no/пилот", pos: 5 },
        ],
      },
      {
        kind: "spot",
        title: "Слайды",
        prompt: "Усыпляющее — вон.",
        lines: [
          { id: "1", text: "18 определений", bad: true, why: "Не совет." },
          { id: "2", text: "График жалоб", bad: false, why: "Док." },
          { id: "3", text: "Скрин IDE", bad: true, why: "Не они." },
          { id: "4", text: "Просьба «поддержать направление»", bad: true, why: "Не голосуется." },
        ],
      },
    ],
  },
  {
    id: "lab-senior-3",
    gradeId: "senior",
    title: "Go / no-go 17:40",
    teaser: "Пилот зелёный. Юрист молчит. Антифрод орёт. Студия.",
    minutes: 12,
    xp: 120,
    setting: "Окно релиза до пятницы. Вы держите контур дубля.",
    blocks: [
      {
        kind: "spot",
        title: "Пакет студии",
        prompt: "Что не готово.",
        lines: [
          { id: "1", text: "Fail-тест двойного callback", bad: false, why: "Деньги." },
          { id: "2", text: "Нет UNKNOWN", bad: true, why: "Враньё confirmed." },
          { id: "3", text: "Owner гиперкэра", bad: false, why: "После." },
          { id: "4", text: "Figma без правила", bad: true, why: "Картинка." },
          { id: "5", text: "Сверка со шлюзом", bad: false, why: "Интеграция." },
        ],
      },
      {
        kind: "scene",
        title: "Катим?",
        setting: "PO давит.",
        steps: [
          {
            from: "PO",
            line: "Окно до пятницы.",
            options: [
              o("Катим, потом.", false, "Нет крана."),
              o("No-go без порога FP и молчания юриста. Go — 5% с отзывом за час.", true, "Условный go."),
              o("Снимаете с себя.", false, "Студия держит."),
            ],
          },
        ],
      },
      {
        kind: "case",
        title: "Пилот опроверг вашу ставку",
        situation: "Рекомендовали смену шлюза. Домашняя идемпотентность закрыла 90%.",
        question: "Как выглядите?",
        options: [
          o("Защищаете старое «в долгую».", false, "Эго."),
          o("Меняете рекомендацию вслух, след: что узнали, что убиваете.", true, "Мышление."),
          o("Confluence датой назад.", false, "Подлог."),
        ],
        debrief: "Студия дешевле меняет мнение, чем прод.",
      },
    ],
  },
];
