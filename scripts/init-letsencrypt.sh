#!/bin/bash
# Первый выпуск Let's Encrypt для GRAFFY (запускать на VPS из корня репозитория).
# Требует: .env с DOMAIN и CERTBOT_EMAIL, docker compose, открытый порт 80.

set -e

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Создайте .env из .env.example и задайте DOMAIN, CERTBOT_EMAIL"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [ -z "${DOMAIN:-}" ]; then
  echo "DOMAIN не задан в .env"
  exit 1
fi

if [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "CERTBOT_EMAIL не задан в .env (для Let's Encrypt)"
  exit 1
fi

DATA_PATH="./certbot"
mkdir -p "$DATA_PATH/conf" "$DATA_PATH/www"

if [ -d "$DATA_PATH/conf/live/$DOMAIN" ] && [ -f "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" ]; then
  # Проверяем, что это не однодневный dummy (опционально по сроку — пропускаем, если live уже есть)
  if openssl x509 -in "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" -noout -checkend 86400 2>/dev/null; then
    echo "Действующий сертификат для $DOMAIN уже есть."
    echo "Для перевыпуска удалите $DATA_PATH/conf/live/$DOMAIN и запустите снова."
    exit 0
  fi
fi

echo ">>> Временный самоподписанный сертификат (чтобы nginx смог стартовать)"
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout "$DATA_PATH/conf/live/$DOMAIN/privkey.pem" \
  -out "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" \
  -subj "/CN=$DOMAIN"

BUILD_FLAG="--build"
# Если образы уже загружены (собраны в GitHub Actions), на сервере ничего не собираем:
# с российских VPS часто недоступны mcr.microsoft.com и др.
if docker image inspect graffy-backend:latest graffy-frontend:latest >/dev/null 2>&1; then
  BUILD_FLAG="--no-build"
fi

echo ">>> Запуск стека (nginx с временным сертификатом), $BUILD_FLAG"
docker compose -f docker-compose.prod.yml --profile ssl up -d $BUILD_FLAG nginx backend frontend db

echo ">>> Запрос сертификата Let's Encrypt"
docker compose -f docker-compose.prod.yml --profile ssl run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$CERTBOT_EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo ">>> Перезагрузка nginx"
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "Готово: https://$DOMAIN"
echo "Полный стек: docker compose -f docker-compose.prod.yml --profile ssl up -d --build"
