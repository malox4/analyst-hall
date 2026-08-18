export const WORLD = {
  product: "Malo Wallet",
  line: "Кошелёк, карты, P2P, KYC, эквайринг. Вы аналитик в платформенной команде.",
  systems: [
    { id: "wallet-api", name: "wallet-api", owns: "переводы, лимиты, идемпотентность" },
    { id: "ledger", name: "ledger", owns: "движения денег, не UI" },
    { id: "kyc", name: "kyc-gateway", owns: "статус проверки личности" },
    { id: "cards", name: "card-processor", owns: "3DS, выпуск, авторизации" },
    { id: "sms", name: "sms-gw", owns: "OTP и пуши, не бизнес-правило" },
    { id: "af", name: "antifraud", owns: "скор и блок, не создание проводки" },
    { id: "acq", name: "acquiring", owns: "мерчант, реестр, MCC" },
    { id: "erp", name: "1C-bridge", owns: "выгрузка проводок" },
    { id: "nostro", name: "nostro", owns: "корсчёт, входящие/исходящие IBAN" },
    { id: "fx", name: "treasury-fx", owns: "курс, спред, позиция по валюте" },
    { id: "clearing", name: "clearing", owns: "T+1 settle мерчанта, не auth" },
  ],
};

export const GUESTS = {
  shopline: "ShopLine — маркетплейс, чужой бэклог",
  medqueue: "MedQueue — запись к врачу",
  citypark: "CityPark — парковочные сессии",
  orient: "Orient Bank — файлы ISO / реестры",
  hrpulse: "HR Pulse — доступы сотрудников",
};
