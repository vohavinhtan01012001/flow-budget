# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flow Budget — React 18 + TypeScript frontend, built with Vite 6, package manager is pnpm (>= 10, Node >= 22).

## Commands

- `pnpm dev` — Dev server (port 3000)
- `pnpm build` — Type-check (`tsc -b`) then Vite build
- `pnpm lint` — ESLint with auto-fix
- `pnpm format` — Prettier format all files
- `pnpm type-check` — TypeScript check only (`tsc --build --force`)
- `pnpm check-all` — Run format + lint + type-check in parallel
- `pnpm preview` — Preview production build (port 3030)

## Architecture

Entry: `index.html` → `src/main.tsx` → `<StrictMode>` → `<App />`

App wraps: `QueryClientProvider` (TanStack React Query) → `AntConfigProvider` (Ant Design theme/locale) → `BrowserRouter` → `AppRoutes`

### Routing

File-based route registration: `AppRoutes.tsx` uses `import.meta.glob('@/routes/*.tsx')` to auto-discover route files. Each file in `src/routes/` exports a default route object with `path`, `element`, `children`, and `meta` (title, requiresAuth, roles).

Route guard via `ProtectedRoute` component — checks auth state from Zustand store, redirects to login if unauthenticated, redirects to `/forbidden` if role mismatch.

Layouts: `DefaultLayout` (sidebar + topbar + content), `GuestLayout` (pass-through), `ErrorLayout`.

### State Management

Zustand stores in `src/stores/`:
- `auth.store.ts` — auth state, token management, user profile, refresh token logic
- `loading.store.ts` — global loading state

Token persistence via `store2` (localStorage wrapper), key: `r_access_token`.

### API Layer

Axios instance in `src/libs/axios/config.ts` with interceptors:
- Request: auto-converts payload to snake_case, attaches Bearer token
- Response: auto-converts response to camelCase, handles 401 with token refresh

API wrapper functions in `src/libs/axios/util.ts`: `get`, `post`, `put`, `patch`, `del` — all support generic typing, loading targets, and toast messages.

API functions grouped by domain in `src/apis/` (e.g., `auth.api.ts`, `shared.api.ts`).

### Auto-imports

`unplugin-auto-import` is configured in `vite.config.ts`. The following are available globally without imports:
- React hooks (`useState`, `useEffect`, `useMemo`, etc.)
- React Router hooks (`useNavigate`, `useLocation`, `useParams`, etc.)
- `react-i18next` (`useTranslation`)
- All exports from `src/apis/**`, `src/constants/**`, `src/hooks/shared/**`, `src/utils/**`

Generated types in `src/@types/auto-imports.d.ts`. ESLint globals in `.eslint-globals.json`. Do NOT manually edit these files.

### i18n

`react-i18next` configured in `src/plugins/react-i18next.plugin.ts`. Locale JSON files auto-loaded from `locales/` directory via `import.meta.glob`. Supported: en, vi, ja.

## Key Conventions

### Path Alias

`@/` maps to `src/` (configured in both `tsconfig.app.json` and `vite.config.ts`).

### Styling

- SCSS modules for component styles: `src/assets/styles/components/{domain}/{name}.module.scss`
- Tailwind CSS with `tw-` prefix (e.g., `tw-flex`, `tw-bg-white`)
- Custom Tailwind utilities: `flex-center`, `flex-between`, `fixed-center`
- Global SCSS variables (`_variables.scss`) and mixins (`_mixins.scss`) auto-injected into all SCSS files via Vite config
- Ant Design theming via `AntConfigProvider` with dark/light mode support
- Theme colors defined in `src/constants/theme-colors.const.ts` (DARK, LIGHT, DEFAULT)

### Forms

React Hook Form + Yup validation schemas (in `src/schemas/`), integrated with Ant Design via `react-hook-form-antd`. Base form components wrap Ant Design inputs (`BaseInput`, `BaseSelect`, `BaseFormItem`, etc.).

### Models

TypeScript types organized in `src/models/`:
- `enums/` — enum definitions (e.g., `ERole`, `ELanguageCode`, `EToast`)
- `interfaces/` — request/response shapes (e.g., `ILoginRequest`, `IUserInfo`)
- `types/` — utility types and type aliases (e.g., `TSuccessResponse`, `TFailureResponse`)

Naming: enums prefixed `E`, interfaces prefixed `I`, types prefixed `T`.

### SVG

`vite-plugin-svgr` enabled — SVGs can be imported as React components.

### Git

- Commit format: `[TICKET-XXX]: Commit message` (enforced by commitlint)
- Branch naming: `feature/*`, `bugfix/*`, `hotfix/*`, `release/*`, or `master`
- Pre-commit: lint-staged runs Prettier + ESLint on staged JS/TS files
- Husky for git hooks

### ESLint Rules

- `no-explicit-any`: error
- `no-console`: warn (only `console.error` and `console.info` allowed)
- `eslint-plugin-perfectionist`: auto-sorts imports, object keys, etc.
- Unused vars allowed only with `_` prefix

### Prettier

Single quotes, semicolons, 2-space indent, trailing commas, 80 char print width.

### Environment Variables

Prefixed with `VITE_` (see `.env.sample`): `VITE_API_BASE_URL`, `VITE_NODE_ENV`, `VITE_PORT`, `VITE_PORT_PREVIEW`.
