# GRAFFY

Web-application for tasks and habits with XP, activity graph, profile, and admin panel.

**Stack:** Next.js 14 · .NET 8 Web API · PostgreSQL · Entity Framework Core · JWT · Docker

---

## Quick Start (local)

```bash
cp .env.example .env
docker compose up --build
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend (Swagger) | http://localhost:8000/swagger |
| Database | localhost:5432 |

---

## Test Admin Account

Credentials from `.env`:

```
Email:    admin@graffy.local
Password: admin12345
```

Change these values in `.env` before deploying to production.

---

## Working with migrations

The current dev setup uses `EnsureCreated()` which auto-creates the database schema
on startup without migration history. This is fine for development.

**To switch to proper EF Core migrations:**

1. Enter the backend container (or use dotnet CLI with a local connection string):

```bash
docker exec -it graffy-backend-1 sh
# or locally:
cd apps/backend/GraffyApi
```

2. Create the initial migration:

```bash
dotnet ef migrations add InitialCreate \
  --connection "Host=localhost;Port=5432;Database=graffy;Username=graffy;Password=graffy_password"
```

3. Apply migrations:

```bash
dotnet ef database update
```

4. Remove `db.Database.EnsureCreated()` from `Program.cs` and replace with:

```csharp
db.Database.Migrate();
```

---

## Viewing logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

---

## Stopping the project

```bash
docker compose down

# Stop and remove volumes (database data)
docker compose down -v
```

---

## Production deployment

Полное руководство: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — в начале два пошаговых сценария: **тест по IP** (раздел A) и **production с доменом** (раздел B). Проблемы с `docker-compose-plugin` / группой `docker` на VPS — [шаг 2](docs/DEPLOYMENT.md#шаг-2-установите-docker).

Кратко:

```bash
cp .env.example .env
# Edit .env: set strong JWT_SECRET, real ADMIN_PASSWORD, production DB password
# Set NEXT_PUBLIC_API_URL and STATIC_BASE_URL to your public https:// URL

docker compose -f docker-compose.prod.yml --profile ssl up --build -d
```

Production compose adds nginx on port 80 (HTTPS — см. документацию). Database is not exposed externally.

---

## Git workflow

| Branch | Purpose |
|--------|---------|
| `main` | Stable, always deployable |
| `feature/*` | Feature branches |
| `fix/*` | Bug fixes |

Rules:
- **Never push directly to `main`**
- Create a feature branch: `git checkout -b feature/my-feature`
- Open a pull request to `main`
- Squash merge after review

---

## Adding email confirmation (future)

Currently `IEmailSender` is a stub that logs to console. To enable real email via Yandex Mail:

1. Create an app password in Yandex account settings
2. Install `MailKit`:
   ```bash
   dotnet add package MailKit
   ```
3. Implement `SmtpEmailSender` using:
   - Host: `smtp.yandex.ru`
   - Port: `465` (SSL) or `587` (TLS)
   - Username: your Yandex address
   - Password: app password (not account password)
4. Register it in `Program.cs` instead of `StubEmailSender`
5. Set `EmailConfirmed = true` only after the user clicks the confirmation link

---

## Project structure

```
graffy/
  apps/
    frontend/        Next.js 14 app
    backend/         .NET 8 Web API
  infra/nginx/templates/   nginx prod (HTTPS)
  scripts/init-letsencrypt.sh   первый SSL на VPS
  docs/
    DEPLOYMENT.md    production deploy guide
  docker-compose.yml         local dev
  docker-compose.prod.yml    production
  .env.example
```
