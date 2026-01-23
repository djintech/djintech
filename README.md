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
|--------|-------------|
| `api`  | Main REST API service |

Project structure:

```text
.
├── apps/
│   └── api/          # Main backend service
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
## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

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
