# Renessans English School — website + admin panel

Marketing site (uz / ru / en) and content management panel for a private English language school in
Tashkent. Every string, price, image and phone number on the public site is editable from `/admin` —
there is no hardcoded content in the pages.

Built to the specification in [`PROMPT.md`](./PROMPT.md); phase-by-phase notes and decisions are in
[`docs/BUILD-PROGRESS.md`](./docs/BUILD-PROGRESS.md).

---

## Get it running in five minutes

```bash
pnpm install                 # runs `prisma generate` via postinstall
cp .env.example .env         # then fill in AUTH_SECRET and IP_SALT (see below)
pnpm db:up                   # Postgres 16 in Docker, on host port 5433
pnpm db:migrate              # create the schema
pnpm db:seed                 # realistic demo content in all three locales
pnpm dev                     # http://localhost:3000 -> redirects to /uz
```

Sign in to the admin panel at **http://localhost:3000/admin** with the credentials from
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (`admin@school.uz` / `ChangeMe123!` by default).
**Change that password before the site is public.**

Generate the two secrets with:

```bash
openssl rand -base64 32      # AUTH_SECRET
openssl rand -hex 16         # IP_SALT
```

---

## Stack

| Layer         | Choice                                                     |
| ------------- | ---------------------------------------------------------- |
| Framework     | Next.js 15 (App Router, Server Components, Server Actions) |
| Language      | TypeScript strict, zero `any`                              |
| Styling       | Tailwind CSS v4, design tokens in `src/app/globals.css`    |
| UI            | Radix primitives in shadcn style (`src/components/ui`)     |
| i18n          | next-intl, locale-prefixed routes `/uz` `/ru` `/en`        |
| Database      | PostgreSQL 16 + Prisma 6                                   |
| Auth          | NextAuth v5 (credentials, bcrypt, JWT)                     |
| Admin         | TanStack Table, Recharts, Tiptap, dnd-kit                  |
| Notifications | Telegram Bot API                                           |
| Tests         | Vitest (unit) + Playwright (e2e)                           |

Two deliberate deviations from the spec's stack list, both explained in
[`docs/BUILD-PROGRESS.md`](./docs/BUILD-PROGRESS.md): Framer Motion was replaced with a small
IntersectionObserver + CSS reveal (it cost 65 kB gzip and held Lighthouse mobile below the required
90), and brand red for text/fills is `--brand-600` rather than `--brand-500`, because white on
`#E63329` fails WCAG AA at 4.31:1.

---

## Project layout

```
messages/               UI chrome strings per locale (namespaced)
prisma/                 schema, migrations, seed (+ seed-data/ modules)
scripts/                repeatable verification scripts (see "Checks")
e2e/                    Playwright specs for the three critical flows
tests/                  Vitest unit tests
src/app/[locale]/       public site
src/app/admin/          admin panel (not locale-prefixed)
src/app/api/            route handlers
src/components/ui/      design-system primitives
src/components/sections/homepage bands
src/components/shared/  header, footer, lead modal, analytics, …
src/components/admin/   DataTable, LocalizedInput, MediaPicker, …
src/config/             admin resource registry, lead status maps
src/server/queries/     cached reads (unstable_cache + tags)
src/server/actions/     mutations (capability-checked, audited)
src/server/services/    lead pipeline, test scoring
src/lib/                prisma, auth, storage, telegram, ratelimit, validations
```

---

## Scripts

| Script                                              | What it does                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev` / `pnpm build` / `pnpm start`            | Dev server / production build / serve                                    |
| `pnpm typecheck` · `pnpm lint` · `pnpm format`      | TypeScript, ESLint, Prettier                                             |
| `pnpm test` · `pnpm test:coverage`                  | Vitest unit tests                                                        |
| `pnpm e2e`                                          | Playwright e2e (starts its own server on port 3210)                      |
| `pnpm db:up` / `pnpm db:down`                       | Start / stop the Postgres container                                      |
| `pnpm db:migrate` · `pnpm db:deploy`                | Migrations in dev / production                                           |
| `pnpm db:seed` · `pnpm db:reset` · `pnpm db:studio` | Seed, reset, Prisma Studio                                               |
| `pnpm db:counts`                                    | Row count for every table                                                |
| `pnpm check:i18n`                                   | Message-file parity, uz fallback, translation coverage of seeded content |
| `pnpm check:messages`                               | Every `t('key')` used in the code exists in `messages/uz.json`           |
| `pnpm check:responsive`                             | 17 pages × 5 breakpoints: overflow and console errors                    |
| `pnpm check:test`                                   | Drives a full placement test run and asserts the stored attempt          |
| `pnpm check:admin` · `pnpm check:admin-editor`      | Admin auth/CRUD and the editor→public-site flow                          |
| `pnpm check:materials`                              | Material filters, download gate, CV upload                               |

The `check:*` scripts expect a server on `http://localhost:3111`; override with `BASE_URL`.

---

## Environment variables

Everything lives in [`.env.example`](./.env.example). Required:

| Variable               | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string                                   |
| `AUTH_SECRET`          | NextAuth signing key (`openssl rand -base64 32`)               |
| `NEXT_PUBLIC_SITE_URL` | Public origin — canonical URLs, OG images, Telegram deep links |
| `IP_SALT`              | Salt for `sha256(ip + salt)`; raw IPs are never stored         |

Optional, and degrading gracefully when unset:

| Variable                                             | Effect when missing                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`             | Notifications are skipped and logged, never blocking a submission                         |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting falls back to an in-process window (fine for one instance, not for several) |
| `STORAGE_DRIVER=s3` + `S3_*`                         | Uploads stay on local disk under `public/uploads`                                         |
| `REVALIDATE_SECRET`                                  | `POST /api/revalidate` returns 503                                                        |
| `TELEGRAM_API_BASE`                                  | Defaults to the real API; point it at a mock in tests                                     |

Analytics ids (GA4, Meta Pixel, Yandex) are **not** environment variables — they live in
`/admin/settings`, and the scripts load only when an id exists _and_ the visitor consents.

---

## Deployment

### Docker (app + database)

```bash
cp .env.example .env.production          # set AUTH_SECRET, IP_SALT, NEXT_PUBLIC_SITE_URL, …
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.production up -d --build
```

`RUN_MIGRATIONS=true` on the app service applies pending migrations at start-up, which suits a
single instance. With several replicas, leave it unset and run `prisma migrate deploy` once as its
own deploy step.

**Build with the database reachable when you can** — the build prerenders pages from it. Pass
`--build-arg DATABASE_URL=…` (`host.docker.internal` works from Docker Desktop). If the build cannot
reach a database it still succeeds: the queries fall back to empty results, and pages fill in on the
next revalidation. To repopulate immediately after such a deploy:

```bash
curl -X POST https://your-domain/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" -H 'Content-Type: application/json' -d '{}'
```

Seeding is not available inside the runtime image (it needs `tsx` and the seed sources). Run
`pnpm db:seed` from a checkout pointed at the same `DATABASE_URL`.

### Vercel

Works as-is: set the environment variables above, point `DATABASE_URL` at a managed Postgres, and
set `STORAGE_DRIVER=s3` with the `S3_*` variables — Vercel's filesystem is read-only, so the local
upload driver cannot be used there.

### Backups

The database holds everything except uploaded files.

```bash
# nightly dump
docker compose exec -T db pg_dump -U postgres school | gzip > backup-$(date +%F).sql.gz

# restore
gunzip -c backup-2026-09-03.sql.gz | docker compose exec -T db psql -U postgres school
```

With `STORAGE_DRIVER=local`, also back up the `uploads` volume (`/app/public/uploads`); with the S3
driver the bucket is your backup target. Verify a restore into a scratch database occasionally —
an untested backup is not a backup.

---

## How to add a new content type

Most content types need **no new pages**. The admin panel is driven by a registry.

1. **Model it** in `prisma/schema.prisma` (localized columns are `Json`, add `order` if it should be
   drag-sortable and an `isPublished` flag if it should be publishable), then
   `pnpm db:migrate --name add_awards`.

2. **Register it** in `src/config/admin-resources.ts`:

   ```ts
   {
     key: 'awards',                       // URL segment: /admin/awards
     title: 'Mukofotlar',
     singular: 'Mukofot',
     tags: ['home'],                      // cache tags to invalidate on save
     ordered: true,
     publishField: 'isPublished',
     searchField: { name: 'title', localized: true },
     columns: [
       { name: 'title', label: 'Nomi', kind: 'localized' },
       { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
     ],
     fields: [
       { kind: 'localized', name: 'title', label: 'Nomi', required: true },
       { kind: 'localizedText', name: 'description', label: 'Tavsif', rows: 3 },
       { kind: 'image', name: 'imageUrl', label: 'Rasm', folder: 'awards' },
       { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
     ],
   }
   ```

3. **Wire the delegate** in `src/server/admin/delegates.ts`:

   ```ts
   awards: { model: asDelegate(prisma.award) },
   ```

4. **Add it to the sidebar** in `src/components/admin/nav-config.ts`.

At this point `/admin/awards` has a list, create/edit forms with UZ|RU|EN tabs, publish toggles,
drag-reordering, soft delete, audit logging and cache invalidation — all from the registry.

5. **Read it on the public site**: add a cached query in `src/server/queries/` that maps the
   localized `Json` columns to plain strings (use `loc` / `locList` and pass a `fallback` so a
   database outage degrades instead of 500ing), then render it from a section component.

Available field kinds: `localized`, `localizedText`, `localizedHtml` (Tiptap), `localizedList`,
`text`, `slug`, `number`, `decimal`, `boolean`, `date`, `image`, `icon`, `select`, `relation`,
`multiRelation`, `stringList`, `curriculum`.

---

## Things worth knowing

- **Roles are enforced server-side.** `src/lib/permissions.ts` holds the capability matrix; every
  action begins with `requireCapability(...)` and guarded pages redirect. Hiding UI is cosmetic.
- **Localized content never reaches the client as a blob.** Queries resolve `{uz, ru, en}` to a
  string on the server, falling back to `uz` when a translation is blank.
- **The lead pipeline** validates, rate limits (5/phone/hour, 20/IP/hour), de-duplicates the same
  phone within 24h into one lead with a note, stores a hashed IP, then notifies Telegram
  fire-and-forget. A filled honeypot returns success and stores nothing.
- **Uploads are checked three ways** — extension, declared MIME _and_ magic bytes — with per-kind
  size caps. Object keys are random UUIDs.
- **`/admin` is `noindex`**, excluded in `robots.txt`, and gated in `middleware.ts`.
- **Placement test answers never leave the server**: the public API omits `isCorrect`, and grading
  happens in `src/server/services/test-scoring.ts`.
