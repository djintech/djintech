# 🚀 DjinTech — NestJS Monorepo Backend

Welcome to **DjinTech** — a backend project built with **NestJS** using a **monorepo architecture** designed for scalable microservices development.

---

## 🧱 Architecture

- Project type: **NestJS Monorepo**
- Package manager: **pnpm**
- Microservices support: ✅
- Shared libraries: `libs/*`

### Current services

| Service | Description |
|---------|-------------|
| `api`   | Main REST API service |
| `files` | File service for working with AWS S3 (upload, storage, presigned URLs) |

Project structure:

```text
.
├── apps/
│   └── api/          # Main backend service
│   └── files/        # File service (AWS S3 integration)
├── libs/             # Shared libraries (auth, prisma, common, etc.)
├── package.json
├── nest-cli.json
├── tsconfig.base.json
└── .env
```
## ▶️ Getting Started

### Install dependencies

```bash
pnpm install

## Running the API service

```bash
# development
$ pnpm run start:api

# watch mode
$ pnpm run start:api:dev

# debug mode
$ pnpm run start:api:debug

# production mode
$ pnpm run start:api:prod
```

## Running the FILES service

```bash
# production
pnpm run start:files

# development (watch)
pnpm run start:dev:files

# debug
pnpm run start:files:debug
```

## Database & Prisma

```bash
# generate client
pnpm run prisma:api:generate

# dev migrate
pnpm run prisma:api:migrate:dev

# deploy migrations (test)
pnpm run prisma:api:migrate:deploy:test

# prisma studio
pnpm run prisma:api:studio:dev
```

## Run tests

```bash
# unit tests
$ pnpm run test

# API tests
pnpm run test:unit
pnpm run test:e2e

# Files service tests
pnpm run test:files:unit
pnpm run test:files:e2e

# test coverage
$ pnpm run test:cov
```

## 🧠 Tech Stack

- **NestJS 11** — backend framework  
- **TypeScript** — static typing  
- **pnpm** — fast and efficient package manager  
- **Prisma + PostgreSQL** — ORM and relational database  
- **JWT + Passport** — authentication and authorization  
- **Swagger** — API documentation  
- **CQRS** — command–query responsibility segregation  
- **Rate Limiting** — request throttling and protection  
- **Mailer** — email delivery module
- **AWS S3 SDK** — file storage and presigned URLs  
- **Multer** — file uploads handling  
- **Schedule + Cron** — background jobs  
