# AGENTS.md

## Project Overview

DjinTech is a private NestJS 11 monorepo backend built with TypeScript, pnpm, Prisma, PostgreSQL, Jest, and Nest CQRS. The repository contains multiple Nest applications under `apps/`, shared libraries under `libs/`, generated Prisma clients, and a small `frontend/` folder with static OAuth/recaptcha helper pages.

Current Nest applications:

- `api`: main REST API service for authentication, user accounts, posts, privacy policies, notifications, cleanup jobs, and integrations with files/payments.
- `files`: file service for uploads, validation, deletion, and AWS S3 storage.
- `payments`: payments/subscriptions service with Prisma models and subscription providers such as Stripe.

## Core Commands

Use pnpm from the repository root.

```bash
pnpm install
```

Build:

```bash
pnpm run build
pnpm run build:api
pnpm run build:files
pnpm run build:payments
```

Development servers:

```bash
pnpm run start:dev:api
pnpm run start:dev:files
pnpm run start:dev:payments
```

Production starts expect built output in `dist/`:

```bash
pnpm run start:api
pnpm run start:files
pnpm run start:payments
```

Lint and format:

```bash
pnpm run lint
pnpm run format
```

Important: `pnpm run lint` runs ESLint with `--fix`, so it may modify files.

Tests:

```bash
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:unit
pnpm run test:e2e
pnpm run test:files:unit
pnpm run test:files:e2e
```

Prisma:

```bash
pnpm run prisma:api:generate
pnpm run prisma:api:generate:dev
pnpm run prisma:api:migrate:dev
pnpm run prisma:api:migrate:create
pnpm run prisma:api:migrate:deploy:test

pnpm run prisma:payments:generate:dev
pnpm run prisma:payments:migrate:dev
pnpm run prisma:payments:migrate:create
pnpm run prisma:payments:migrate:deploy:test
```

Prisma dev commands load `.env.development.local`; test migration deploy commands load `.env.testing`.

## Code Style and Conventions

- Language: TypeScript targeting ES2023 with CommonJS modules and Nest decorators enabled.
- Formatting: Prettier uses single quotes and trailing commas. Run `pnpm run format` for formatting across `apps/**/*.ts` and `libs/**/*.ts`.
- Linting: ESLint uses `typescript-eslint` recommended type-checked rules plus Prettier integration. `no-explicit-any` is disabled; `no-floating-promises` and `no-unsafe-argument` are warnings.
- Architecture: prefer Nest modules, dependency injection, controllers, repositories, query repositories, CQRS command handlers, and query handlers.
- CQRS pattern: commands are small classes, use cases are decorated with `@CommandHandler`, queries use dedicated query handler classes, and controllers call `CommandBus`/`QueryBus`.
- Module layout usually follows `api/`, `application/`, `domain/`, `infrastructure/`, `constants/`, and `swagger/` folders inside feature modules.
- DTO naming is explicit: `input-dto`, `view-dto`, and `application/dto` are used in different layers.
- Repository naming distinguishes write repositories, such as `posts.repository.ts`, from read/query repositories under `infrastructure/query/`.
- Shared imports commonly use aliases from `tsconfig.json`: `@src/*`, `@files/*`, `@modules/*`, `@core/*`, and `@libs/*`. Keep imports consistent with nearby files.
- Domain errors are represented with shared exception types from `@libs/core/exceptions` where applicable.
- Generated Prisma code under `apps/*/src/generated/prisma/` should not be edited manually. Change Prisma schema/migrations and regenerate instead.
- Keep feature changes localized. Avoid broad refactors when updating a single use case, controller, repository, or contract.

## Repository Structure

```text
.
+-- apps/
|   +-- api/
|   |   +-- prisma/                 # API Prisma schema, migrations, Prisma config
|   |   +-- src/
|   |   |   +-- core/               # API core DTOs, config, filters, shared API plumbing
|   |   |   +-- modules/            # API feature modules
|   |   |   +-- setup/              # API/bootstrap setup helpers
|   |   |   +-- swagger/            # Shared Swagger DTOs and setup
|   |   +-- test/                   # API Jest unit/e2e configs
|   +-- files/
|   |   +-- src/
|   |   |   +-- modules/files/      # S3 config, file controllers, services, use cases
|   |   |   +-- main.ts             # Files service bootstrap
|   |   +-- test/                   # Files Jest unit/e2e configs
|   +-- payments/
|       +-- prisma/                 # Payments Prisma schema, migrations, Prisma config
|       +-- src/
|           +-- core/               # Payments app core config/module
|           +-- db/                 # Prisma module/service for payments
|           +-- generated/prisma/   # Generated Prisma client artifacts
|           +-- modules/            # Payments feature modules, including subscriptions
+-- frontend/                       # Static helper HTML pages
+-- libs/
|   +-- config/                     # Shared configuration helpers and DB config
|   +-- constants/                  # Shared constants and microservice message patterns
|   +-- contracts/                  # Shared request/response contracts between services
|   +-- core/                       # Shared core module and exception/filter utilities
|   +-- utils/                      # Shared utility modules
+-- dist/                           # Build output
+-- nest-cli.json                   # Nest monorepo project definitions
+-- package.json                    # Root scripts and dependencies
+-- pnpm-lock.yaml                  # pnpm lockfile
+-- tsconfig.json                   # Root TypeScript config and path aliases
```

## Agent Workflow Notes

- Check `git status --short` before editing. This repository may contain user work in progress; do not revert unrelated changes.
- Prefer reading nearby files before introducing new patterns. The codebase is convention-driven and feature modules are the best source of local style.
- When changing Prisma models, update the relevant schema under `apps/api/prisma/` or `apps/payments/prisma/`, create/apply migrations with the matching script, and regenerate clients.
- When adding shared message contracts or constants, place them in `libs/contracts/*` or `libs/constants` and update both caller and service implementations.
- For API-facing changes, check whether a Swagger decorator file exists in the feature's `swagger/` folder and update it when the response or request shape changes.
- For tests, use the most specific available command first, such as `test:unit`, `test:e2e`, `test:files:unit`, or `test:files:e2e`, then broaden if the change touches shared behavior.
