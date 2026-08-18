export type HandbookEntry = {
  id: string;
  group: string;
  term: string;
  also?: string[];
  short: string;
  why: string;
  example: string;
  write?: string;
  api?: string;
};

export const HANDBOOK: HandbookEntry[] = [
  {
    id: "debit",
    group: "Проводки",
    term: "Дебет (DR)",
    also: ["debit", "др"],
    short: "Левая нога журнала. Для пассива (счёт клиента) дебет = деньги ушли, остаток пассива упал.",
    why: "Без дебета кредит — дыра. Главбух смотрит ноги, не «минус в Excel».",
    example: "P2P Анна → Борис 5000: DR Анна 5000. Анна — пассив, она отдаёт.",
    write: "Дебет: Анна (отправитель, пассив уменьшается)",
    api: "GET /api/v1/ledger — поле dc: \"D\"",
  },
  {
    id: "credit",
    group: "Проводки",
    term: "Кредит (CR)",
    also: ["credit", "кр"],
    short: "Правая нога. Для пассива кредит = деньги пришли, мы должны клиенту больше.",
    why: "Получатель P2P кредитуется. Мерчант после capture — тоже кредит (мы должны кафе).",
    example: "P2P 5000: CR Борис 5000. Обе ноги 5000, один journalId.",
    write: "Кредит: Борис (получатель, пассив увеличивается)",
    api: "GET /api/v1/ledger — поле dc: \"C\"",
  },
  {
    id: "journal",
    group: "Проводки",
    term: "Журнальный ордер",
    also: ["journal", "проводка", "ноги"],
    short: "Пачка ног с одним journalId. В одной валюте сумма DR должна равняться сумме CR.",
    why: "UPDATE wallets.balance в обход журнала не сторнируется и не выгружается в 1С.",
    example: "jrn_3: DR acc_anna 5000 + CR acc_boris 5000 → balanced true.",
    api: "GET /api/v1/ledger/journals и POST .../journals/{id}/reverse",
  },
  {
    id: "trial",
    group: "Проводки",
    term: "Пробный баланс",
    also: ["trial", "сходимость"],
    short: "Сумма всех DR vs всех CR. Считается отдельно по UZS и отдельно по USD.",
    why: "Если refund кредитует клиента без дебета мерчанта — diff ≠ 0, день не закрывается.",
    example: "После дырявого refund: UZS DR 230000 CR 242000, Δ 12000.",
    api: "GET /api/v1/ledger/trial-balance",
  },
  {
    id: "t-account",
    group: "Проводки",
    term: "T-счёт",
    also: ["t-счет", "карточка счёта"],
    short: "Две колонки одного счёта: слева дебеты, справа кредиты, внизу остаток.",
    why: "Так ops видит, почему available не равен «тому что в приложении».",
    example: "Анна | DR 5000 (P2P) | CR 25000 (IBAN in) | ledger = opening + Δ.",
    api: "GET /api/v1/ledger/t-accounts/acc_anna",
  },
  {
    id: "liability",
    group: "Проводки",
    term: "Пассив клиента",
    also: ["liab", "текущий счёт"],
    short: "Деньги клиента — обязательство банка. Нормальный остаток кредитовый.",
    why: "Поэтому «списать клиенту» = дебет пассива, не кредит.",
    example: "Зачисление зарплаты: CR Анна. Перевод другу: DR Анна.",
    write: "Клиентский счёт — пассив. Отдаёт → дебет. Получает → кредит.",
  },
  {
    id: "hold",
    group: "Касса",
    term: "Холд",
    also: ["hold", "резерв", "авторизация"],
    short: "Резерв на available. Журнала нет. Ledger не двигается, пока не будет capture.",
    why: "Auth ≠ списание. PO врёт, когда говорит «уже списали» на 3DS.",
    example: "Auth 12 000: hold OPEN, available −12000, ledger как был.",
    write: "Холд режет available. Проводка рождается только на capture.",
    api: "GET /api/v1/holds · POST /api/v1/cards/authorize при holdThenCapture",
  },
  {
    id: "available",
    group: "Касса",
    term: "Available / ledger",
    also: ["доступно", "баланс"],
    short: "ledger — сумма ног. hold — OPEN резервы. available = ledger − hold.",
    why: "Клиент видит available. Главкнига видит ledger. Это разные колонки.",
    example: "ledger 80 000, hold 12 000 → available 68 000. В приложении 68к.",
    api: "GET /api/v1/wallets — поля ledger, hold, available",
  },
  {
    id: "capture",
    group: "Касса",
    term: "Capture",
    also: ["каптур", "списание"],
    short: "Закрытие холда проводкой: DR клиент, CR мерчант, опционально CR комиссия.",
    why: "До capture мерчанту ещё ничего не должны в журнале.",
    example: "Capture 12 000: DR Борис 12000, CR Cafe Orient 12000, hold CAPTURED.",
    api: "POST /api/v1/payments/{id}/capture  { amount } — частичный, если allowPartialCapture",
  },
  {
    id: "void",
    group: "Касса",
    term: "Void / cancel",
    also: ["отмена холда"],
    short: "Снять OPEN hold без журнала. Только из AUTHORIZED.",
    why: "Это не возврат. Возврат — после capture.",
    example: "Клиент ушёл из кафе до capture: POST .../cancel, hold RELEASED.",
    api: "POST /api/v1/payments/{id}/cancel",
  },
  {
    id: "refund",
    group: "Касса",
    term: "Refund",
    also: ["возврат", "реверс"],
    short: "Реверс capture: DR мерчант, CR клиент, на сумму captured.",
    why: "Одна нога CR клиенту без DR мерчанта = дыра trial. В пете это баг контракта.",
    example: "Честно: DR Cafe 12000, CR Борис 12000. Дыра: только CR Борис.",
    write: "Refund = реверс capture, две ноги. Не UPDATE balance.",
    api: "POST /api/v1/payments/{id}/refund · флаг refundPostsReversal",
  },
  {
    id: "acs",
    group: "Касса",
    term: "ACS timeout",
    also: ["3ds", "unknown"],
    short: "Процессор молчит. Честный статус UNKNOWN. SUCCESS при тишине — ложное списание.",
    why: "Клиент видит «оплачено», журнала может не быть — или наоборот ложный journal.",
    example: "Заголовок X-ACS-Timeout: 1. Контракт acsTimeoutStatus: UNKNOWN.",
    api: "POST /api/v1/cards/authorize + заголовок X-ACS-Timeout: 1",
  },
  {
    id: "nostro",
    group: "Банк",
    term: "Nostro",
    also: ["корсчёт", "correspondent"],
    short: "Наш счёт в банке-корреспонденте. Это актив. Деньги «у Orient», но наши.",
    why: "Входящий платёж увеличивает актив: DR nostro. Исходящий уменьшает: CR nostro.",
    example: "Зарплата Анне 25 000: DR acc_nostro, CR acc_anna.",
    api: "Счёт acc_nostro в GET /api/v1/accounts",
  },
  {
    id: "iban-in",
    group: "Банк",
    term: "Входящий IBAN",
    also: ["кредит платежа", "incoming"],
    short: "Чужой банк прислал деньги на наш IBAN клиента.",
    why: "Ноги всегда: DR nostro, CR клиент. Не «просто плюс в кошельке».",
    example: "POST /bank/incoming { iban: UZ12MALO…0001, amount: 25000 }.",
    api: "POST /api/v1/bank/incoming",
  },
  {
    id: "iban-out",
    group: "Банк",
    term: "Исходящий IBAN",
    also: ["outgoing", "перевод в другой банк"],
    short: "Сначала холд, статус PENDING_BANK. Ack posted → DR клиент CR nostro + MT103. Rejected → холд снять.",
    why: "Пока банк не подтвердил, денег в чужом банке нет. Журнал рано — враньё.",
    example: "Аренда 7000: hold OPEN → ack posted → MT103 :32A: и :59: IBAN получателя.",
    api: "POST /api/v1/bank/outgoing затем POST .../outgoing/{id}/ack { result: \"posted\" }",
  },
  {
    id: "mt103",
    group: "Банк",
    term: "MT103",
    also: ["swift"],
    short: "Сообщение исходящего перевода. Следствие posted, не master денег.",
    why: "Файл SWIFT не создаёт проводку. Проводка уже в журнале на ack.",
    example: ":20: id исходящего, :32A: дата+валюта+сумма, :50K: наш IBAN, :59: их IBAN.",
    api: "GET /api/v1/bank/outgoing/{id}/mt103",
  },
  {
    id: "suspense",
    group: "Банк",
    term: "Невыясненные (suspense)",
    also: ["невыясненные"],
    short: "Входящие на IBAN, которого нет в плане счетов. DR nostro CR suspense, пока не разнесём.",
    why: "Нельзя зачислить «на Анну, чтобы не висело». Это чужие деньги.",
    example: "IBAN UZ00GHOST… → status SUSPENSE. Потом allocate на IBAN Анны: DR suspense CR Анна.",
    write: "Чужой IBAN → suspense, не соседний клиент.",
    api: "Флаг unknownIbanToSuspense · POST /api/v1/bank/suspense/{id}/allocate",
  },
  {
    id: "fx",
    group: "Банк",
    term: "FX / две валюты",
    also: ["курс", "валюта"],
    short: "Каждая валюта — свой журнал. UZS сходится сам, USD сходится сам. Спред — отдельная нога fee.",
    why: "Одна проводка «−126 500 +10 USD» ломает пробный баланс: яблоки с ящиками.",
    example: "Купить 10 USD @ 12650 + спред 80 bps: DR Анна UZS, CR FX UZS (+ fee); DR FX USD, CR Анна USD.",
    write: "UZS: DR Анна CR FX-позиция. USD: DR FX-позиция CR Анна. Спред — комиссия.",
    api: "POST /api/v1/fx/convert { fromWalletId: wal_anna, toWalletId: wal_anna_usd, amountTo: 10 }",
  },
  {
    id: "salary",
    group: "Банк",
    term: "Зарплатный файл",
    also: ["trailer", "csv"],
    short: "Пачка входящих. Trailer = сумма строк, иначе не грузим. Повтор fileName = 409.",
    why: "«Завтра поправим trailer» = вторая зарплата или дыра на размер файла.",
    example: "Строки 20 000 + 15 000. Trailer должен быть 35000. Иначе reject.",
    write: "Если сумма строк ≠ trailer — не грузить. Тот же fileName — 409, не вторая зарплата. Чужой IBAN — reject или suspense.",
    api: "POST /api/v1/bank/salary · флаги salaryTrailerMustMatch, salaryFileOnce",
  },
  {
    id: "clearing",
    group: "Банк",
    term: "Клиринг T+1",
    also: ["settle", "выплата мерчанту"],
    short: "Capture = мы должны кафе. Settle = отдали с nostro: DR мерчант CR nostro.",
    why: "Касса и выплата — разные дни. Путать auth с settle — казначейство в ярости.",
    example: "После capture 4000 у Cafe ledger 4000. Settle: Cafe → 0, nostro −4000.",
    api: "POST /api/v1/clearing/settle",
  },
  {
    id: "recon",
    group: "Банк",
    term: "Сверка эквайера",
    also: ["rrn", "mismatch"],
    short: "Наш реестр capture (RRN+сумма) против файла Orient. MATCH / MISMATCH / UNKNOWN_RRN / MISSING_IN_FILE.",
    why: "Глазами «примерно сошлось» не контракт. MISMATCH стопит выплату, не «потом».",
    example: "Наш rrn_8 amount 4000, в файле amount 1 → MISMATCH.",
    api: "GET /api/v1/recon/export · POST /api/v1/recon/ingest",
  },
  {
    id: "idempotency",
    group: "API",
    term: "Idempotency-Key",
    also: ["ключ", "409"],
    short: "Повтор POST с тем же ключом не создаёт вторую проводку. Честный ответ — 409, не 200 с новым id.",
    why: "Двойной тап на плохой сети = две DR-ноги Анны, если ключа нет.",
    example: "Два POST /transfers на 5000 без ключа → две пары ног. С ключом и 409 — одна.",
    api: "Заголовок Idempotency-Key · PUT /api/v1/contract transferIdempotencyRequired, transferDuplicateHttp: 409",
  },
];

export const HANDBOOK_GROUPS = [...new Set(HANDBOOK.map((e) => e.group))];

export function handbookById(id: string) {
  return HANDBOOK.find((e) => e.id === id);
}

export function handbookSearch(q: string) {
  const n = q.trim().toLowerCase().replace(/ё/g, "е");
  if (!n) return HANDBOOK;
  return HANDBOOK.filter((e) => {
    const blob = [e.term, e.short, e.why, e.example, e.api, ...(e.also ?? [])].join(" ").toLowerCase().replace(/ё/g, "е");
    return blob.includes(n);
  });
}
