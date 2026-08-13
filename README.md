# Malo Academy

Локальная премиальная академия **Business Analyst / System Analyst**.

Прогресс живёт только в браузере:

- **LocalStorage** — путь, XP, бейджи, квизы, режим линейный/свободный
- **IndexedDB** — тексты практических работ

Авторизации и бэкенда нет. Можно открыть через `npm run dev` или раздать папку `dist`.

## Docker

```bash
docker compose up --build
```

Откройте [http://localhost:8080](http://localhost:8080).

Остановка: `docker compose down`.

## Локальный запуск без Docker

```bash
npm install
npm run dev
```

Сборка статики:

```bash
npm run build
npm run preview
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
