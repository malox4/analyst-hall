# Malo Academy

Локальная премиальная академия **Business Analyst / System Analyst**.

Прогресс живёт только в браузере:

- **LocalStorage** — путь, XP, бейджи, квизы, режим линейный/свободный
- **IndexedDB** — тексты практических работ

Авторизации нет. Прогресс — в браузере (LocalStorage). Живой пет `/api/v1` есть в `npm run dev` и в Docker.

## Docker

Контейнер отдаёт академию **и** core-banking API (проводки, холд, IBAN, FX). Состояние пета лежит в volume `academy-data`.

```bash
docker compose up --build
```

Откройте [http://localhost:8080](http://localhost:8080).

```bash
curl -sS http://localhost:8080/api/health
curl -sS http://localhost:8080/api/v1/wallets
```

Консоль пета: [/pet](http://localhost:8080/pet) · справочник: [/book](http://localhost:8080/book)

Остановка: `docker compose down`. Volume с ledger не трогает `down` без `-v`.

## Локальный запуск без Docker

```bash
npm install
npm run dev
```

Откройте [http://localhost:8080](http://localhost:8080) — тот же порт, что у Docker.

Живой пет API (Postman / curl / встроенная консоль):

```bash
curl -sS http://localhost:8080/api/v1/wallets
curl -sS -X POST http://localhost:8080/api/v1/transfers \
  -H 'Content-Type: application/json' \
  -d '{"fromWalletId":"wal_anna","toWalletId":"wal_boris","amount":5000,"currency":"UZS"}'
```

Спека: [http://localhost:8080/api/v1/openapi.json](http://localhost:8080/api/v1/openapi.json) · консоль: [/pet](http://localhost:8080/pet)

Сборка статики (пет API в preview тоже живой — Vite middleware):

```bash
npm run build
npm run preview
```

Либо после `npm run build`:

```bash
node server/serve.mjs
```

## Стек

Vite · React · TypeScript · Tailwind CSS · Framer Motion · Zustand · Lucide  
Шрифты: Inter + Fraunces

## Путь ученика

**Intern 1–3 → Junior 1–3 → Middle 1–3 → Senior 1–3** (48 модулей)

В каждом модуле: теория, инфографика/схема, кейс, квиз, практика, чек-лист, копируемый шаблон, soft skill.

Дополнительно:

- подготовка к собеседованию (типичные вопросы + сильный ответ + ловушки)
- финальная симуляция (ситуационный экзамен, порог 70%)
- печати грейдов и достижения

Источники идей (не дословные копии): IIBA BABOK v3, Karl Wiegers *Software Requirements*, IREB CPRE, внутренний SkillMap BA/SA, банк собеседований.
