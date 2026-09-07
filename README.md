# Analyst Hall

Зал самообучения **BA / SA**. Intern бесплатно. PRO — когда нужно **писать** в учебный банк (`POST /api/v1`), открыть junior+ и полный SQL. Новым — **3 дня PRO**. Не Zoom-школа, сертификата нет.

Гость видит лендинг на [http://localhost:8080](http://localhost:8080). После входа — [зал](http://localhost:8080/hall). Сравнение: [http://localhost:8080/pricing](http://localhost:8080/pricing).

| | |
|---|---|
| Главная | http://localhost:8080 |
| Зал | http://localhost:8080/hall |
| Материалы | http://localhost:8080/materials |
| Практика | http://localhost:8080/practice |
| Собес | http://localhost:8080/interview · http://localhost:8080/live |
| Пет | http://localhost:8080/pet · `/api/v1` |
| Health | http://localhost:8080/api/health |

После старта (если ещё нет):

| Роль | Email | Пароль |
|---|---|---|
| Админ | `admin@malo.academy` | `ChangeMe_Admin1!` |
| PRO | `pro@malo.academy` | `ChangeMe_Pro1!` |

Смените пароли в `.env` перед продом.

## Docker

Нужны Docker Desktop и порт **8080**.

```bash
git clone https://github.com/malox4/analyst-hall.git
cd analyst-hall
cp .env.example .env
docker compose up --build
```

Откройте [http://localhost:8080](http://localhost:8080). Остановка: `docker compose down`. `down -v` сотрёт учебный банк и Postgres.

Образ: Node 22 собирает Vue, Go 1.23 собирает бинарь, Debian slim слушает `:8080`. Рядом Postgres 16.

## Без Docker

Нужны **Go 1.23+** и **Node 22**.

```bash
cd web && npm install && npm run build && cd ..
go run ./cmd/academy
```

Без `DATABASE_URL` учётки пишутся в `data/academy-users.json`.

## Пет

База: `http://localhost:8080/api/v1`

Дважды P2P без ключа идемпотентности — две DR-ноги Анны. Это учебный баг, не поломка.
