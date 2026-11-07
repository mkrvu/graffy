# Развёртывание GRAFFY

См. также [README.md](../README.md) (локальная разработка на своём ПК).

---

## С чего начать

| Цель | Читать |
|------|--------|
| **Тестовый стенд на VPS по IP** (без домена, HTTP) | → [раздел A](#a-тестовый-стенд-с-нуля-ip-без-домена) |
| **Production с доменом и HTTPS** | → [раздел B](#b-production-с-нуля-домен--https) |
| **Уже подняли — выкатить новую версию** | → [раздел C](#c-обновить-уже-работающий-стенд) |
| **Что-то сломалось** | → [раздел D](#d-если-что-то-сломалось) |

Дальше в документе — только справочник (архитектура, логи, бэкапы).

---

# A. Тестовый стенд с нуля (IP, без домена)

**Что получится:** сайт по адресу `http://ВАШ_IP` (или `http://ВАШ_IP:8080`, если порт не 80).

**Что НЕ нужно:** домен, DNS, SSL, `init-letsencrypt.sh`, GitHub Actions (можно подключить позже).

**Где выполнять команды:** на VPS по SSH (Ubuntu/Debian), если не написано иное.

### Какой пользователь (не root для всего подряд)

| | Рекомендуется | Можно, но хуже |
|---|----------------|----------------|
| SSH-логин | `ubuntu` или пользователь от хостинга | `root` |
| Установка пакетов, firewall | команды с **`sudo`** | то же (у root `sudo` не обязателен) |
| `git clone`, `.env`, `docker compose` | **без** root, обычный пользователь | под root — работает, но нежелательно |
| Каталог проекта | `~/graffy` → `/home/ubuntu/graffy` | `/root/graffy` |
| GitHub Secret `SSH_USER` | тот же логин, напр. `ubuntu` | `root` |

**Важно:** постоянно под **root** заходить не нужно. Root не требуется для шагов 4–9 — только там, где в доке явно стоит `sudo` (шаги 2–3).

После `sudo usermod -aG docker $USER` (шаг 2) перелогиньтесь и дальше `docker compose` запускайте **без** `sudo`.

---

### Шаг 1. Арендуйте VPS и зайдите по SSH

Под пользователем с `sudo` (типично `ubuntu`):

```bash
ssh ubuntu@ВАШ_IP
```

Проверка, что вы не путаете пользователей:

```bash
whoami          # ожидается ubuntu (или ваш deploy-пользователь)
pwd             # /home/ubuntu
```

Если хостинг выдал только `root`: `ssh root@ВАШ_IP`, тогда `DEPLOY_PATH=/root/graffy` и в GitHub `SSH_USER=root`. Для нового VPS лучше создать отдельного пользователя с `sudo`, чем вести проект только от root.

Запомните **публичный IP** сервера (например `203.0.113.10`) — он понадобится в `.env`.

---

### Шаг 2. Установите Docker

Сначала проверьте ОС (нужна **Ubuntu 22.04+** или **Debian 11+**):

```bash
cat /etc/os-release
```

Установка **Docker Engine** и плагина **Compose** из официального репозитория Docker (не `docker.io` из стандартного apt — на многих VPS там нет `docker-compose-plugin`).

**Ubuntu:**

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

**Debian** — те же команды, но GPG и `deb` с `https://download.docker.com/linux/debian` (см. [Install Docker Engine](https://docs.docker.com/engine/install/)).

Добавьте пользователя в группу `docker` (только после успешной установки выше):

```bash
sudo usermod -aG docker $USER
```

**Выйдите из SSH и зайдите снова.**

Проверка:

```bash
docker --version
docker compose version
```

Обе команды должны отработать без `permission denied`. Для GRAFFY нужна именно **`docker compose`** (с пробелом), не устаревший `docker-compose`.

#### Если снова ошибки при установке

| Ошибка | Что делать |
|--------|------------|
| `docker-compose-plugin` has no installation candidate | Не используйте `apt install docker.io` — ставьте через репозиторий Docker (блок Ubuntu выше). |
| `usermod: group 'docker' does not exist` | Docker не установился. Проверьте: `getent group docker`. Сначала доведите до конца `apt install docker-ce …`, потом `usermod`. |
| `Package docker-ce has no installation candidate` | Старая ОС или неверный codename. Выполните `cat /etc/os-release` и инструкцию для своей версии на [docs.docker.com/engine/install](https://docs.docker.com/engine/install/). |
| Не Ubuntu/Debian | Установка по документации Docker для вашей ОС; на сервере должны работать `docker` и `docker compose`. |

**Запасной вариант** (только если Docker CE недоступен): `sudo apt install -y docker.io`, затем отдельно плагин Compose v2 по [документации Docker](https://docs.docker.com/compose/install/linux/). Без `docker compose` деплой GRAFFY не запустится.

---

### Шаг 3. Откройте порт в firewall

Для стандартного HTTP (порт 80):

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

Если будете использовать порт **8080** — вместо 80: `sudo ufw allow 8080/tcp`.

---

### Шаг 4. Склонируйте проект

```bash
git clone https://github.com/<ваш-org>/graffy.git ~/graffy
cd ~/graffy
```

Путь `~/graffy` — каталог **текущего** SSH-пользователя (у `ubuntu` это `/home/ubuntu/graffy`). Дальше все команды из **`cd ~/graffy`**. Не клонируйте в `/root`, если работаете под `ubuntu`.

---

### Шаг 5. Создайте файл `.env`

```bash
cp .env.example .env
nano .env
```

**Вставьте и подставьте свой IP** (пример для IP `203.0.113.10`, порт 80):

```env
POSTGRES_DB=graffy
POSTGRES_USER=graffy
POSTGRES_PASSWORD=придумайте-пароль-бд
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=graffy;Username=graffy;Password=придумайте-пароль-бд

JWT_SECRET=придумайте-длинную-случайную-строку-32-символа
JWT_ISSUER=graffy
JWT_AUDIENCE=graffy
JWT_ACCESS_TOKEN_MINUTES=30
JWT_REFRESH_TOKEN_DAYS=30

HTTP_PORT=80
NEXT_PUBLIC_API_URL=http://203.0.113.10
STATIC_BASE_URL=http://203.0.113.10

ADMIN_EMAIL=admin@test.local
ADMIN_PASSWORD=придумайте-пароль-админа
```

Важно:

- В `NEXT_PUBLIC_API_URL` и `STATIC_BASE_URL` — **ваш реальный IP**, схема **`http://`**, **без** `/api` в конце.
- Пароль в `ConnectionStrings__...` = тот же, что в `POSTGRES_PASSWORD`.
- Если порт не 80, например 8080:

```env
HTTP_PORT=8080
NEXT_PUBLIC_API_URL=http://203.0.113.10:8080
STATIC_BASE_URL=http://203.0.113.10:8080
```

Сохраните файл (`Ctrl+O`, Enter, `Ctrl+X` в nano).

---

### Шаг 6. Запустите приложение

Из каталога `~/graffy`:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml up -d --build
```

Первый раз сборка **5–15 минут**. Дождитесь окончания без ошибок.

---

### Шаг 7. Проверьте, что контейнеры работают

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml ps
```

Должны быть `running`: `nginx`, `frontend`, `backend`, `db`. Сервиса `certbot` быть не должно.

---

### Шаг 8. Откройте сайт в браузере

- Порт 80: `http://203.0.113.10`
- Порт 8080: `http://203.0.113.10:8080`

---

### Шаг 9. Войдите админом

Логин и пароль — из `.env`:

- Email: `ADMIN_EMAIL`
- Пароль: `ADMIN_PASSWORD`

Проверьте задачи, профиль, загрузку аватара.

---

### Шаг 10. (По желанию) Автодеплой через GitHub

Только когда ручной запуск уже работает.

1. На ПК: `ssh-keygen -t ed25519 -f ~/.ssh/graffy_deploy -N ""`
2. Содержимое `graffy_deploy.pub` → на VPS в `~/.ssh/authorized_keys`
3. Содержимое `graffy_deploy` → GitHub → Settings → Secrets → `SSH_KEY`
4. Ещё secrets: `VPS_HOST` (IP), `SSH_USER` — **тот же логин**, под которым деплоите (`ubuntu`, не `root`, если работаете от `ubuntu`), `DEPLOY_PATH` — полный путь к клону (`/home/ubuntu/graffy`)
5. В [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) в SSH-скрипте замените команду `docker compose` на:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml up --build -d
```

6. Merge в `main` → вкладка Actions → job Deploy должен быть зелёным.

---

### Повторный деплой тестового стенда (кратко)

```bash
cd ~/graffy
git pull origin main
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml up --build -d
```

---

# B. Production с нуля (домен + HTTPS)

**Что получится:** `https://ваш-домен.ru`

**Нужно заранее:** домен, A-запись DNS на IP VPS.

Все команды на VPS из каталога деплоя (например `~/graffy`) под тем же пользователем, что в [разделе A](#какой-пользователь-не-root-для-всего-подряд) (`ubuntu` + `sudo`, не постоянный root).

---

### Шаг 1–3. VPS, Docker, firewall

1. [Шаг 1 раздела A](#шаг-1-арендуйте-vps-и-зайдите-по-ssh) — SSH на VPS.
2. [Шаг 2 раздела A](#шаг-2-установите-docker) — Docker CE + `docker compose` (официальный репозиторий).
3. [Шаг 3 раздела A](#шаг-3-откройте-порт-в-firewall) — порты 22, 80 и дополнительно **443**:

```bash
sudo ufw allow 443/tcp
```

---

### Шаг 4. DNS

У регистратора домена: **A-запись** `ваш-домен.ru` → IP VPS. Подождите 5–30 минут.

---

### Шаг 5. Клон и `.env`

```bash
git clone https://github.com/<ваш-org>/graffy.git ~/graffy
cd ~/graffy
cp .env.example .env
nano .env
```

Пример (подставьте домен и пароли):

```env
POSTGRES_DB=graffy
POSTGRES_USER=graffy
POSTGRES_PASSWORD=<пароль-бд>
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=graffy;Username=graffy;Password=<пароль-бд>

JWT_SECRET=<случайная-строка-32+>
JWT_ISSUER=graffy
JWT_AUDIENCE=graffy
JWT_ACCESS_TOKEN_MINUTES=30
JWT_REFRESH_TOKEN_DAYS=30

DOMAIN=graffy.example.com
CERTBOT_EMAIL=you@example.com
NEXT_PUBLIC_API_URL=https://graffy.example.com
STATIC_BASE_URL=https://graffy.example.com

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<пароль-админа>
```

---

### Шаг 6. SSL (один раз)

```bash
chmod +x scripts/init-letsencrypt.sh
bash scripts/init-letsencrypt.sh
```

Без ошибок — сертификат выпущен.

---

### Шаг 7. Запуск всего стека

```bash
docker compose -f docker-compose.prod.yml --profile ssl up -d --build
docker compose -f docker-compose.prod.yml --profile ssl ps
```

В списке должен быть `certbot` в статусе `running`.

---

### Шаг 8. Проверка

Браузер: `https://graffy.example.com` → логин админом → API и аватары.

---

### Шаг 9. GitHub Actions (по желанию)

Secrets: `VPS_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`.  
Workflow [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) уже использует `--profile ssl`.  
Первый успешный ручной деплой — потом merge в `main`.

---

### Повторный деплой production (кратко)

```bash
cd ~/graffy
git pull origin main
docker compose -f docker-compose.prod.yml --profile ssl up --build -d
```

---

# C. Обновить уже работающий стенд

| Режим | Команда после `git pull` |
|-------|---------------------------|
| Тест (IP) | `docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml up --build -d` |
| Production (домен) | `docker compose -f docker-compose.prod.yml --profile ssl up --build -d` |

Меняли только пароли в `.env` (без смены URL):

```bash
docker compose -f docker-compose.prod.yml ... up -d --force-recreate backend
```

(добавьте `-f docker-compose.prod.ip.yml` или `--profile ssl` как у вас принято)

Меняли домен или `NEXT_PUBLIC_API_URL` — обязательно `up --build -d` (пересборка frontend).

---

# D. Если что-то сломалось

**Не открывается сайт**

```bash
cd ~/graffy
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml ps   # тест
# или
docker compose -f docker-compose.prod.yml --profile ssl ps                   # production

docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml logs --tail 50 nginx backend frontend
```

**В браузере API уходит на localhost**

В `.env` неверный `NEXT_PUBLIC_API_URL`. Исправьте, затем:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml up --build -d
```

**Откат на старую версию кода**

```bash
cd ~/graffy
git log --oneline -5
git checkout <хороший-коммит>
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml up --build -d
```

**Ошибки при установке Docker (шаг 2)**

| Сообщение | Решение |
|-----------|---------|
| `docker-compose-plugin` has no installation candidate | Установите Docker из [шага 2](#шаг-2-установите-docker) (репозиторий download.docker.com), не `apt install docker.io docker-compose-plugin`. |
| `usermod: group 'docker' does not exist` | Пакет Docker не установлен — повторите `apt install docker-ce …`, проверьте `getent group docker`, затем `usermod`. |
| `docker: permission denied` | Выполните `sudo usermod -aG docker $USER` и **перелогиньтесь** в SSH. |
| `docker compose`: command not found | Нужен плагин `docker-compose-plugin` из репозитория Docker CE, не отдельный бинарник v1 без настройки. |

---

# Справочник

## Пользователь на VPS

См. [таблицу в начале раздела A](#какой-пользователь-не-root-для-всего-подряд). Кратко: SSH как `ubuntu` → `sudo` только для установки и firewall → `docker compose` без `sudo` → `DEPLOY_PATH=/home/ubuntu/graffy`, `SSH_USER=ubuntu`.

## Архитектура

```
Браузер → nginx (:80 или :443) → frontend / backend → PostgreSQL
```

| Файл | Зачем |
|------|--------|
| [docker-compose.prod.yml](../docker-compose.prod.yml) | Базовый prod-стек |
| [docker-compose.prod.ip.yml](../docker-compose.prod.ip.yml) | Тест: HTTP по IP, без SSL |
| [infra/nginx/default.conf](../infra/nginx/default.conf) | nginx для IP-режима |
| [infra/nginx/templates/default.conf.template](../infra/nginx/templates/default.conf.template) | nginx + HTTPS |
| [scripts/init-letsencrypt.sh](../scripts/init-letsencrypt.sh) | Первый SSL (только с доменом) |

## Переменные `.env` (кратко)

| Переменная | Тест (IP) | Production |
|------------|-----------|------------|
| `HTTP_PORT` | Да (80 или 8080) | — |
| `DOMAIN`, `CERTBOT_EMAIL` | Не нужны | Да |
| `NEXT_PUBLIC_API_URL` | `http://IP`[:порт] | `https://домен` |
| `STATIC_BASE_URL` | как API URL | как API URL |
| `POSTGRES_PASSWORD` + `ConnectionStrings__...` | Да, пароли совпадают | Да |
| `JWT_SECRET`, `ADMIN_*` | Да | Да |

`NEXT_PUBLIC_API_URL` вшивается в frontend при **сборке** образа.

## Логи и остановка

```bash
cd ~/graffy
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml logs -f
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml down      # остановить
docker compose -f docker-compose.prod.yml -f docker-compose.prod.ip.yml down -v  # + удалить БД!
```

## Бэкап БД

```bash
docker compose -f ~/graffy/docker-compose.prod.yml exec -T db \
  pg_dump -U graffy graffy > backup.sql
```

## Локальная разработка (не VPS)

На своём ПК:

```bash
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:3000
