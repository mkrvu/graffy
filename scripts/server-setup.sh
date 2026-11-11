#!/usr/bin/env bash
# Первичная установка GRAFFY на чистый VPS (Ubuntu/Debian), от root.
# Запуск из корня клона:
#   DOMAIN=graffy.example.com CERTBOT_EMAIL=you@example.com bash scripts/server-setup.sh
# Повторный запуск безопасен: существующий .env и сертификат не перезаписываются.

set -euo pipefail
cd "$(dirname "$0")/.."

: "${DOMAIN:?Укажите DOMAIN}"
: "${CERTBOT_EMAIL:?Укажите CERTBOT_EMAIL}"
export DEBIAN_FRONTEND=noninteractive

if [ "$(id -u)" -ne 0 ]; then
  echo "Запустите от root (или через sudo)."
  exit 1
fi

echo ">>> Пакеты"
apt-get update -q
apt-get install -y -q ca-certificates curl git openssl dnsutils

echo ">>> Docker"
if ! docker compose version >/dev/null 2>&1; then
  if ! curl -fsSL https://get.docker.com | sh; then
    echo "get.docker.com недоступен — ставлю Docker из репозитория дистрибутива"
    apt-get install -y -q docker.io docker-compose-v2 || apt-get install -y -q docker.io docker-compose-plugin
  fi
fi

# Зеркало Docker Hub (для российских VPS). Если зеркало недоступно, Docker сам идёт в Docker Hub.
if [ ! -f /etc/docker/daemon.json ]; then
  mkdir -p /etc/docker
  echo '{ "registry-mirrors": ["https://dockerhub.timeweb.cloud"] }' > /etc/docker/daemon.json
fi
systemctl enable docker >/dev/null 2>&1 || true
systemctl restart docker
docker compose version

echo ">>> Swap (сборка Next.js и .NET на маленьком VPS)"
mem_mb=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [ "$mem_mb" -lt 3500 ] && ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ">>> Firewall"
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
fi

echo ">>> .env"
if [ ! -f .env ]; then
  db_pw=$(openssl rand -hex 16)
  admin_pw=$(openssl rand -hex 8)
  cat > .env <<EOF
POSTGRES_DB=graffy
POSTGRES_USER=graffy
POSTGRES_PASSWORD=${db_pw}
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=graffy;Username=graffy;Password=${db_pw}

JWT_SECRET=$(openssl rand -hex 32)
JWT_ISSUER=graffy
JWT_AUDIENCE=graffy
JWT_ACCESS_TOKEN_MINUTES=30
JWT_REFRESH_TOKEN_DAYS=30

DOMAIN=${DOMAIN}
CERTBOT_EMAIL=${CERTBOT_EMAIL}
NEXT_PUBLIC_API_URL=https://${DOMAIN}
STATIC_BASE_URL=https://${DOMAIN}

ADMIN_EMAIL=${ADMIN_EMAIL:-admin@${DOMAIN}}
ADMIN_PASSWORD=${admin_pw}
EOF
  chmod 600 .env
  echo ".env создан. Логин и пароль администратора: grep ADMIN $(pwd)/.env"
else
  echo ".env уже есть — оставляю как есть."
fi

echo ">>> Проверка DNS"
server_ip=$(curl -4 -fsS --max-time 10 https://api.ipify.org || true)
domain_ip=$(dig +short A "$DOMAIN" | tail -n1)
echo "IP сервера: ${server_ip:-?}, ${DOMAIN} -> ${domain_ip:-не резолвится}"
if [ -z "$domain_ip" ]; then
  echo "ОШИБКА: у домена ${DOMAIN} нет A-записи. Добавьте A-запись на IP сервера и запустите снова."
  exit 1
fi
if [ -n "$server_ip" ] && [ "$domain_ip" != "$server_ip" ]; then
  echo "ОШИБКА: ${DOMAIN} указывает на ${domain_ip}, а сервер — ${server_ip}. Исправьте A-запись и запустите снова."
  exit 1
fi

if [ -f /tmp/graffy-images.tgz ]; then
  echo ">>> Загрузка готовых Docker-образов (собраны в GitHub Actions)"
  docker load < /tmp/graffy-images.tgz
  rm -f /tmp/graffy-images.tgz
fi

BUILD_FLAG="--build"
if docker image inspect graffy-backend:latest graffy-frontend:latest >/dev/null 2>&1; then
  BUILD_FLAG="--no-build"
fi

echo ">>> SSL и запуск"
bash scripts/init-letsencrypt.sh
docker compose -f docker-compose.prod.yml --profile ssl up -d $BUILD_FLAG
docker compose -f docker-compose.prod.yml ps

echo ">>> Готово: https://${DOMAIN}"
