# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing NestJS backend applications for Gencovery's platform. The repository follows domain-driven design principles with modular architecture and consistent naming conventions.

### Applications

- **cn-space-api** (prefix: `Cn`): Main NestJS application for the Constellab space platform
- **hn-community-api** (prefix: `Hn`): Community NestJS application for documentation and community features

### Libraries

- **back-core-lib** (prefix: `Bl`): Generic NestJS backend utilities, guards, services, and base classes
- **core-lib** (prefix: `Cl`): Shared TypeScript utilities for both frontend and backend
- **te-text-editor** (prefix: `Te`): Rich text editor functionality

## Development Commands

### Build Commands

```bash
# Build specific application
nest build cn-space-api
nest build hn-community-api

# Build using bun scripts
bun run cn-space-api:build
bun run hn-community-api:build
```

### Development Server

```bash
# Serve applications in development
nest serve cn-space-api
nest serve hn-community-api

# Alternative NestJS watch mode
bun run cn-space-api:serve-nest
bun run hn-community-api:serve-nest
```

### Compilation (SWC / webpack)

- **Dev serve** (`nest start`) and **Jest** use **SWC** (fast). SWC config is in root `.swcrc` (`decoratorMetadata: true` and `keepClassNames: true` are required for TypeORM/class-validator/Nest DI; alias `paths` mirror `tsconfig.base.json`).
- **Production build** keeps **webpack**: the `:build` scripts pass `--webpack`. Reason: the Nest SWC builder does **not** compile the `@monorepo/*` path-aliased libs, so a pure-SWC build crashes at boot with `Cannot find module`. Webpack bundles the libs, keeping the Dockerfile and `node dist/cn-main` entry unchanged. Do not drop `--webpack` without solving lib compilation.
- **Type checking**: `nest-cli.json` sets `builder: swc` + `typeCheck: true` (forked tsc during dev serve); the webpack prod build type-checks via `ts-loader`.
- **Tests**: Jest configs use `@swc/jest` with an explicit `moduleNameMapper` for the 3 `@monorepo/*` aliases (SWC does not resolve tsconfig `paths` in Jest).

## Architecture Guidelines

### Naming Conventions

- All components use prefixes to simplify search and organization:
  - `Cn` prefix for cn-space-api components (e.g., `CnUsersModule`, `CnAuthService`)
  - `Hn` prefix for hn-community-api components (e.g., `HnUserModule`, `HnAuthService`)
  - `Bl` prefix for back-core-lib utilities (e.g., `BlAbstractService`, `BlCorsConfig`)
  - `Cl` prefix for core-lib utilities (e.g., `ClDateHelper`, `ClStringHelper`)
  - `Te` prefix for text editor components (e.g., `TeRichText`, `TeBlock`)

### Module Structure

Both applications follow a similar modular structure:

- **Core modules**: Configuration, authentication, guards, middleware
- **Domain modules**: Business logic organized by feature (users, labs, spaces, etc.)
- **Aggregate modules**: Complex business operations spanning multiple domains
- **Utility modules**: Shared services and helpers

### Key Architectural Patterns

- **Domain-driven design**: Features are organized into cohesive modules
- **Aggregate services**: Complex operations that coordinate multiple services
- **Security layers**: JWT authentication with role-based guards
- **Event-driven**: Uses NestJS EventEmitter for decoupled communication
- **Queue processing**: BullMQ integration for background tasks
- **Internationalization**: i18n support with cookie and header resolvers

### Database & Configuration

- **Database**: MySQL with TypeORM
- **Configuration**: Environment-based config with separate dev/prod settings
- **Logging**: Winston logger with daily rotation
- **Caching**: Redis integration through BullMQ transport

### Testing Strategy

- Jest for unit testing
- E2E tests using Supertest
- Test configuration in `test/` directories with dedicated test modules

## Development Workflow

1. **Starting Development**: Use `nest serve <app-name>` or bun scripts for watch mode
2. **Adding Features**: Follow the existing module structure and naming conventions
3. **Database Changes**: Use TypeORM migrations (synchronize disabled in production)
4. **Environment Setup**: Configure `.env` files in `environments/` directories
5. **Deployment**: Use Docker builds and CapRover deployment scripts

## Good practices

- For email, use template in `assets/templates/[lang]` folder. Define the template in sub folder `en` and `fr` for localization. For email subject, define it in `assets/i18n/[lang]/mail-subject.json` for each language. And provide it in the enum file `*-mail-template.class.ts`.
