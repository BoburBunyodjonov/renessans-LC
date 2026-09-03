# Working in this repo

The complete specification is [`PROMPT.md`](./PROMPT.md); phase status is tracked in
[`docs/BUILD-PROGRESS.md`](./docs/BUILD-PROGRESS.md). Read both before changing anything.

## Hard rules (from PROMPT.md §3)

1. **No hardcoded content.** Anything a visitor reads on the public site comes from the database
   (`prisma/`) or from `messages/{uz,ru,en}.json` (UI chrome only). Never inline Uzbek/Russian
   copy into a `.tsx` file.
2. **Three locales**: `uz` (default), `ru`, `en`. Content columns are `Json` of shape
   `{ uz, ru, en }` and are resolved to plain strings **on the server** with `t()` from
   `src/types/i18n.ts`. Client components never receive raw `Localized` blobs.
3. **`strict: true`, no `any`.** Zod schemas in `src/lib/validations` are the single source of
   truth shared by forms, server actions and route handlers.
4. Every form: server validation + rate limit + honeypot.
5. Mobile-first; check 360 / 390 / 768 / 1280 / 1536 px. Respect `prefers-reduced-motion`.

## Conventions

- Pinned: Next.js 15.5.x, Prisma 6.19.x. Do not bump either without updating `docs/BUILD-PROGRESS.md`.
- `src/server/queries/*` = cached reads (`unstable_cache` + tags). `src/server/actions/*` = mutations.
- Public UI primitives live in `src/components/ui`, page sections in `src/components/sections`,
  admin-only widgets in `src/components/admin`.
- lucide-react v1 has no brand icons — social glyphs live in `src/components/shared/brand-icons.tsx`.
- Run before declaring anything done: `pnpm typecheck && pnpm lint && pnpm build`.
