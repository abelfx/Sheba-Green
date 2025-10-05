<!--
Purpose: sh- Auth flow: The app uses Firebase Authentication with Firestore for user profiles. `AuthProvider` in `lib/auth-context.tsx` is mounted in `app/layout.tsx`. `useAuth()` throws if used outside the provider — preserve this contract.
- UI primitives: `components/ui/*` are thin, reusable wrappers (Radix + Tailwind). Prefer extending these instead of adding raw Radix markup across pages.t, actionable guidance for AI coding agents (Copilot/assistant) working on this repo.
Keep edits small, preserve existing conventions, and reference files below for examples.
-->

# Copilot / AI agent instructions — ShebaGreen

This file contains focused, repository-specific guidance so an AI coding agent can be productive immediately.
Target: Next.js (app router) + TypeScript + Tailwind project with in-repo mocks for auth/data.

1) Big picture (how the app is organized)
 - App router: app/ contains route handlers and layouts (app/layout.tsx is the root layout).
 - UI: components/ holds page-level components and a `components/ui/` collection of small Radix/Tailwind wrappers.
- Business logic: lib/ contains app-level utilities and models: `lib/auth-context.tsx`, `lib/firebase.ts`, `lib/auth.ts`, `lib/types.ts`, `lib/mock-data.ts`, `lib/utils.ts`.
- Static assets: public/ (images used by activity cards and placeholders).
- Styling: Tailwind + globals.css; `app/layout.tsx` imports `./globals.css`.2) Critical patterns and conventions (do not change lightly)
 - "use client" directive: client components include `"use client"` at top (examples: `lib/auth-context.tsx`, many components under `components/`). Keep it when moving code into client components.
 - Auth flow: The app uses an in-repo mock auth implementation (`lib/firebase-mock.ts`). `AuthProvider` in `lib/auth-context.tsx` is mounted in `app/layout.tsx`. `useAuth()` throws if used outside the provider — preserve this contract.
 - UI primitives: `components/ui/*` are thin, reusable wrappers (Radix + Tailwind). Prefer extending these instead of adding raw Radix markup across pages.
 - Suspense: Root layout wraps children with React `Suspense`. Be aware of lazy/server components and fallbacks.
 - TypeScript-first: types live in `lib/types.ts`. Whenever changing public shapes (User, Event), update types there and adjust consuming code.

3) Dev & build workflows (commands observed in `package.json`)
 - Install: repo contains `pnpm-lock.yaml` — prefer pnpm: `pnpm install`.
 - Dev server: `pnpm dev` (alias: `npm run dev`) starts Next dev server.
 - Build: `pnpm build` -> `next build`.
 - Start: `pnpm start` -> `next start`.
 - Lint: `pnpm lint` -> `next lint`.
 If adding packages, update `package.json` and run `pnpm install` so `pnpm-lock.yaml` stays in sync.

4) Integration points & external dependencies
- Firebase: Real Firebase services initialized in `lib/firebase.ts` (Auth, Firestore, Storage, Analytics). Analytics is client-side only to avoid SSR issues.
- Vercel Analytics is imported in `app/layout.tsx` (package: `@vercel/analytics`).
- The repo uses Firebase for auth and data storage instead of mocks. Search for Firebase imports and `auth`, `db` usage.
- Some packages rely on Radix UI + Tailwind; keep Tailwind utility class patterns consistent.5) Where to look for examples when making changes
 - Root layout & fonts: `app/layout.tsx` (shows AuthProvider, Suspense, fonts via `next/font/google`).
 - Auth: `lib/auth-context.tsx`, `lib/auth.ts`, `lib/firebase.ts`, `components/protected-route.tsx`.
 - Types & sample data: `lib/types.ts`, `lib/mock-data.ts`.
 - UI primitives: `components/ui/*` and `components/navbar.tsx`, `components/activity-card.tsx`.

6) Safe change checklist for AI edits
 - Keep changes minimal and compile-check: run `pnpm dev` or `pnpm build` after edits.
 - Preserve `use client` declarations when converting a file into a client component.
 - Update `lib/types.ts` when changing shape of shared objects (User, Event).
 - If touching auth, ensure `AuthProvider` still wraps `app` (see `app/layout.tsx`). `useAuth()` throws if provider missing.
 - Prefer editing `components/ui/*` for shared UI behavior so pages stay small.

7) Examples of common tasks (quick recipes)
 - Add authentication-aware UI: import `useAuth` from `lib/auth-context.tsx`. Example usage pattern: `const { user, signIn, signOut } = useAuth()` — do not call outside a component wrapped by `AuthProvider`.
 - Add a new page: create `app/your-route/page.tsx` (export default component). Use `components/*` and `components/ui/*` primitives.

8) Known gaps & gotchas
 - Firebase is configured for production use. User profiles are stored in Firestore under the 'users' collection.
 - No test suite detected; rely on manual/dev build checks. Keep changes small and run the dev server to smoke-test.

If anything above is unclear or you'd like more examples (e.g., a sample new page, or a walkthrough of `lib/firebase.ts`), tell me which area to expand and I'll iterate.
