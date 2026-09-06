# Build progress

The full specification lives in [`PROMPT.md`](../PROMPT.md). Phases follow section 19.

| Phase | Scope                                                                                                                                          | Status  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1     | Foundation: Next.js 15 + TS + Tailwind v4, ESLint/Prettier, Docker Postgres, Prisma, next-intl, theme tokens, primitives, Header/Footer shells | ✅ done |
| 2     | Data layer: full `schema.prisma`, first migration, seed in uz/ru/en, cached query helpers                                                      | ⏳      |
| 3     | Public site: all homepage sections, course/teacher/contact/privacy pages, lead modal + API + Telegram                                          | ⏳      |
| 4     | Placement test: chooser, runner, scoring, bands, attempts                                                                                      | ⏳      |
| 5     | Materials & careers                                                                                                                            | ⏳      |
| 6     | Admin panel                                                                                                                                    | ⏳      |
| 7     | Blog, SEO, polish                                                                                                                              | ⏳      |
| 8     | Hardening & handover                                                                                                                           | ⏳      |

## Phase 1 notes

- **Next.js is pinned to 15.5.x.** `create-next-app` installs 16.x by default; the spec calls for
  15, and the next-intl / NextAuth v5 / Prisma combination is best tested there.
- **Prisma is pinned to 6.19.x** so `generator client { provider = "prisma-client-js" }` from the
  spec keeps working. Config lives in `prisma.config.ts` (the `package.json#prisma` key is
  deprecated in Prisma 6 and removed in 7).
- **lucide-react v1 dropped brand icons.** Telegram/Instagram/YouTube/Facebook/TikTok/WhatsApp
  glyphs are hand-rolled in `src/components/shared/brand-icons.tsx`.
- **Postgres runs on host port 5433** (`docker-compose.yml`) so it does not collide with a local
  Postgres on 5432.
- `src/config/placeholder.ts` holds Phase 1 header/footer content. Phase 2 replaces the bodies of
  `src/server/queries/site.ts` with cached Prisma reads; the view-model types do not change, so no
  component touches are needed.

## Phase 2 notes

- Migration `20260902185744_init` creates all 34 tables.
- **Schema extensions beyond PROMPT.md §13** (all admin-editable, no new concepts):
  - `HomeSection` gained `body`, `imageUrl`, `videoUrl`, `ctaLabel`, `ctaHref` so the About block
    (§7.5) and the Careers teaser (§7.10) have somewhere to live — the spec listed no model for them.
  - `SiteSetting` gained `madeByLabel` / `madeByUrl` for the footer credit line (§7.16).
  - `Course.schedule` (Localized[]) for the "schedule options" listed in §7.11.
  - `TestCategory.icon`, `JobApplication.cvName`, `ContactMessage.locale`, `JobApplication.locale`,
    `Problem.isPublished`, `LeadNote.author` relation, and `createdAt`/`updatedAt` on every model.
- `pnpm db:seed` is **idempotent**: rows with a natural key (slug/key/email) are upserted, the rest
  are wiped and recreated. Submitted data (leads, applications, contact messages, test attempts,
  audit log) is never touched — test questions are rebuilt without deleting their category.
- Queries live in `src/server/queries/*`. Each module caches **raw, locale-agnostic rows** with
  `unstable_cache` + tags from `src/lib/cache.ts`, then maps to a localized view-model per request.
  Cached values are JSON-safe: `Decimal` becomes `number`, `Date` becomes an ISO string.
  `getActivePromotion` is deliberately uncached so an expired campaign disappears immediately.
- `pnpm db:counts` prints every table's row count; `pnpm check:i18n` verifies message-file key
  parity, uz fallback behaviour, and that every seeded content row is translated in all three locales.
- The build queries the database (SSG + ISR), so `DATABASE_URL` must be reachable at build time.

## Phase 3 notes

### Deviations from the stack list, and why

- **Framer Motion was removed.** Its bundle measured **65 kB gzip** on the homepage — more than
  React itself — and it held Lighthouse mobile at 86. `components/shared/reveal.tsx` now implements
  the same motion the spec asks for (fade + rise 24px, 0.5s, `cubic-bezier(.22,1,.36,1)`, 60ms
  stagger, fires once at 20% visibility) with one shared `IntersectionObserver` and two CSS rules.
  `prefers-reduced-motion` is handled in CSS; the hidden state is scoped to `html[data-js='1']`, so
  content still renders without JavaScript. Reinstating Framer is a contained change (rewrite that
  one file) if the animation library matters more than the performance target.
- **The hero H1 is never animated on first paint.** It is the mobile LCP element; starting it at
  `opacity: 0` cost ~3s of LCP. Later slides fade in via a CSS keyframe.
- **The hero image is desktop-only** (`hidden lg:block`), so mobile LCP is text.
- **Brand red for text and fills is `--brand-600`, not `--brand-500`.** White on `#E63329` is
  4.31:1 and fails WCAG AA for body text; `#C42A21` is 5.7:1. `brand-500` is still used for icons,
  large numerals and decorative marks. This is what took Accessibility from 89 to 100.
- **lucide icons are a curated set** (`components/shared/icon.tsx`). A wildcard import cost 200 kB
  on any page whose client component rendered an icon by name.

### Lead pipeline

`POST /api/leads` → zod validation → rate limit (5/phone/hour, 20/IP/hour, Upstash with an
in-memory dev fallback) → 24h dedupe by phone (updates the lead and appends a `LeadNote`) →
persist with a hashed IP → fire-and-forget Telegram. A filled honeypot returns `200 {id: null}`
so bots learn nothing. `TELEGRAM_API_BASE` is overridable for testing against a mock.

### Verified

| Check                               | Result                                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Lighthouse mobile (`/uz`)           | Performance 90 · Accessibility 100 · Best practices 100 · SEO 100                                                           |
| Core Web Vitals (simulated slow 4G) | FCP 1.1s · LCP 3.7s · TBT 10ms · CLS 0 · SI 1.2s                                                                            |
| `pnpm check:responsive`             | 360 / 390 / 768 / 1280 / 1536 px, 6 pages: no horizontal overflow, no JS errors                                             |
| Lead API                            | create 201 · dedupe reuses the row · invalid phone 422 · honeypot 200/no row · foreign origin 403 · 6th post in an hour 429 |
| Telegram                            | verified end to end against a local mock (HTML message + admin deep link)                                                   |

**Open item:** LCP is 3.7s under Lighthouse's simulated slow-4G model (observed LCP on the machine
is 158ms). The spec target is < 2.5s on Fast 3G. Remaining levers are dropping the Radix dialog and
accordion from the initial bundle and serving images from a CDN instead of Unsplash.

## Phase 4 notes

- `GET /api/test/[slug]` serves the question bank; the query behind it never selects `isCorrect`,
  so the answer key cannot leak. Grading happens in `server/services/test-scoring.ts`, a pure
  function (no I/O) so Phase 8 can unit test it directly.
- Band selection is inclusive on both ends; overlapping ranges resolve to the narrowest match and a
  score outside every band clamps to the nearest one.
- A completed attempt with contact details creates a `TEST_RESULT` lead through the same
  `createLead` pipeline as every other form (dedupe, rate limit, Telegram) and links it to the
  attempt. `TestAttempt.leadId` is unique, so a repeat submission from a phone that already has a
  linked attempt stores the new attempt unlinked rather than failing.
- Progress lives in `localStorage` under `placement-test:<slug>`; on return the runner offers
  resume or start-over, and the key is cleared once the attempt is stored.

### Bug found and fixed during verification

The masked phone field pre-fills `+998 `, so pasting a full number produced a doubled country code
and stored `+998998912345`. `lib/phone.ts` and `normalizePhone` now strip repeated `998` prefixes;
`toE164` was added as the single conversion helper.

### Verified

| Check                         | Result                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `GET /api/test/level-general` | 45 questions, maxScore 45, no `isCorrect` anywhere in the payload                                       |
| Full run, all correct         | 45/45 → Upper-Intermediate (B2) → recommends IELTS                                                      |
| Full run, ~50% correct        | 23/45 → Pre-Intermediate (B1) → recommends General English                                              |
| Kids run, ~30% correct        | 14/45 → Beginner → recommends Kids English                                                              |
| Attempt storage               | score, band, category, duration and all 45 graded answers stored; lead linked with `source=TEST_RESULT` |
| Resume                        | 5 answers → reload → "unfinished test" → resumes at question 6; start-over resets to 1                  |
| Keyboard                      | `2` selects the second option, `Enter` advances                                                         |
| Countdown                     | 12s limit auto-submits the partial attempt (run against a dev server: ISR caches the page)              |
| Telegram                      | "Test yakunlandi" message with track, contact, score, band and recommended course                       |

`pnpm check:test <slug> <phone> <correct-ratio>` reruns the full flow; `pnpm check:test-behaviour`
covers resume and keyboard (add `TIMEOUT_BASE=http://localhost:3112` for the countdown).

## Phase 5 notes

- **Filtering is client-side over the ISR-rendered list**, with every change written back to the URL
  (`?level=IELTS&group=…&q=…`) via `router.replace`. The page stays statically generated, and a
  reload or a shared link restores the exact view. The browser is wrapped in `<Suspense>` because
  `useSearchParams` bails out of the static prerender.
- **Download gate** — `Material.requireContact` is enforced in two places: the client opens the lead
  modal (source `MATERIAL_GATE`) and, on success, sets a 30-day `materials_consent` cookie; the
  download route independently refuses with `LEAD_REQUIRED` when the cookie is absent. Counters are
  incremented and a `MaterialDownload` row is written without blocking the redirect.
- **Uploads are validated three ways** (`lib/upload.ts`): extension, declared MIME _and_ magic bytes,
  plus per-kind size caps (10 MB documents, 5 MB images, 200 MB media). Object keys are random UUIDs,
  so a filename can never influence the storage path.
- **`lib/storage.ts`** abstracts the driver: `local` writes to `public/uploads`, `s3` targets any
  S3-compatible bucket with the SDK imported lazily so local installs never load it.

### Two problems found and fixed during verification

1. **`next start` snapshots `public/` at boot**, so a CV uploaded after the server started 404'd.
   Local uploads are now served by `app/api/uploads/[...path]/route.ts`, which resolves inside
   `public/uploads` (rejecting traversal), sends `X-Content-Type-Options: nosniff`, and serves
   images inline while everything else downloads as an attachment (PROMPT.md §17).
2. **`materials.download` was missing from the message files** — next-intl silently rendered the key
   path as the button label in production. `scripts/check-messages-usage.mjs` (`pnpm check:messages`)
   now statically verifies that every key used through `useTranslations` / `getTranslations` exists.

### Verified

| Check                     | Result                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Level chips               | 10 → 2 results, `?level=IELTS` in the URL                                                                                                                |
| Search                    | 2 → 1 result, `?q=Writing` in the URL                                                                                                                    |
| **Reload**                | filters, chip state and query all restored                                                                                                               |
| Reset                     | clears both the results filter and the URL                                                                                                               |
| Gated download            | opens the lead modal; consent cookie set; `MATERIAL_GATE` lead stored                                                                                    |
| Download route            | ungated → 302 to the file; gated without cookie → 403 `LEAD_REQUIRED`; with cookie → 302; `downloadCount` 412 → 413 and a `MaterialDownload` row written |
| CV with wrong magic bytes | rejected (no row created)                                                                                                                                |
| Real PDF CV               | stored, linked to the vacancy, `status=NEW`, served back with a `%PDF` header                                                                            |
| Telegram                  | "Yangi ariza (vakansiya)" with role, contact and CV flag                                                                                                 |
| `pnpm check:responsive`   | 13 pages × 5 breakpoints, no overflow                                                                                                                    |

## Phase 6 notes

### Shape of the panel

- **Auth**: NextAuth v5 credentials, bcrypt cost 12, JWT sessions. `lib/auth.config.ts` is the
  edge-safe half so `middleware.ts` can gate `/admin/**` without pulling Prisma or bcrypt into the
  edge runtime. Failed logins are rate limited 5 / 15 min per IP+email and always return the same
  generic message; successful ones update `lastLoginAt` and write an audit entry.
- **Roles are enforced server-side.** `lib/permissions.ts` holds the §14 capability matrix; every
  action starts with `requireCapability(...)`, and pages redirect rather than render. Hiding UI is
  treated as cosmetic only — verified by driving an EDITOR and a VIEWER at guarded routes directly.
- **A config-driven resource engine** (`config/admin-resources.ts` + `/admin/[resource]`) provides
  list, create, edit, publish toggle, soft delete and drag-reorder for **18 resources** from one
  implementation: hero, home sections, stats, advantages, testimonials, success stories, promotions,
  FAQ (+categories), branches, navigation, material groups, materials, vacancies, hiring steps,
  posts, problems (+nested solution), courses and teachers. Field kinds cover localized text,
  localized rich text (Tiptap), localized lists, images (MediaPicker), icons, relations,
  multi-relations, decimals, dates and the course curriculum builder.
- **Bespoke pages** where the shape demanded it: dashboard, leads (+detail), applications, messages,
  test question bank (+level bands, CSV import/export), test attempts, media library, settings,
  users, audit log.
- **Every save invalidates the cache tags its resource feeds**, so the public site updates within
  seconds without a redeploy.

### Verified

| Check                     | Result                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm check:admin`        | login guard · bad password rejected · dashboard KPIs · generic list · edit persists · audit entry written                            |
| `pnpm check:admin-editor` | **EDITOR changes hero headline, course price and teacher photo → all three visible on the public site with no redeploy**             |
| Role guards               | EDITOR blocked from `/admin/users` (redirect, not just hidden nav); VIEWER blocked from `/admin/courses/new` and sees no content nav |
| Admin mobile              | no horizontal overflow at 390px; sidebar opens as a sheet                                                                            |
| build / lint / typecheck  | clean                                                                                                                                |

### Notes

- `isomorphic-dompurify` pulls jsdom, which resolves its own assets from disk; it is listed in
  `serverExternalPackages` so Next does not bundle it (it fails page-data collection otherwise).
- `server/actions/helpers.ts` is a plain `server-only` module, not a `'use server'` file — action
  modules may only export async functions, and these helpers include synchronous ones.

## Phase 7 notes

- **Blog**: `/blog` listing and `/blog/[slug]` articles with cover, tags, reading time, related
  posts, a reading-progress bar and a view counter that fires once per session from the client so
  the page itself stays statically cacheable. The admin side is the generic engine's `posts`
  resource (Tiptap body, scheduled `publishedAt`, SEO fields).
- **SEO**: `sitemap.ts` emits **87 URLs** with full hreflang alternates for every locale, built from
  the database (courses, posts, vacancies, tests and static routes). `robots.ts` disallows `/admin`,
  `/api` and `/tests`. `manifest.ts` reads the brand from settings.
- **JSON-LD coverage**: `EducationalOrganization` + `FAQPage` (home), `Course` + `Offer` +
  `BreadcrumbList` (course), `Article` + `BreadcrumbList` (post), `JobPosting` (vacancy) — verified
  by parsing `@type` out of each rendered page.
- **OG images**: `/api/og` renders a branded 1200×630 card. Satori needs real font data for weights,
  so Inter 800 is fetched once per process with a graceful fallback to the system face; pages fall
  back to this route whenever no cover image is set.
- **Analytics**: GA4 / Meta Pixel / Yandex Metrica load **only** when an id is configured in settings
  _and_ the visitor consents. Non-essential tracking defaults to declined.
- **`POST /api/revalidate`** (secret-guarded) invalidates cache tags or paths for deploy hooks; the
  admin uses server actions instead. Unknown tags are reported back rather than silently ignored.

### Fixed during verification

- Article bodies in the seed opened at `<h3>` under the page `<h1>`, tripping Lighthouse's
  `heading-order`. Normalised to `<h2>`.
- Three more `bg-brand-500` fills carrying white text (teacher IELTS badge, result cards, logo mark)
  failed AA at 4.31:1 — all moved to `brand-600`. **No `bg-brand-500` fill with white text remains.**

### Lighthouse (mobile, warm server)

| Page                | Perf | A11y | Best practices | SEO |
| ------------------- | ---- | ---- | -------------- | --- |
| `/uz`               | 89   | 100  | 100            | 100 |
| `/uz/blog/[slug]`   | 90   | 100  | 100            | 100 |
| `/uz/courses/ielts` | 89   | 100  | 100            | 100 |

Performance sits in an 86–90 band across runs; the only failing audit is LCP under Lantern's
simulated slow-4G model (3.6–4.0s against the 2.5s target), which stays open into Phase 8.

## Phase 8 notes

### Hardening

- **Security headers** in `next.config.ts`: CSP with an explicit host allowlist, `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS. Uploads get their own
  stricter policy (`default-src 'none'; sandbox`) on top of the attachment disposition.
  `script-src` keeps `'unsafe-inline'`: a nonce has to be generated per request, which would force
  every page dynamic and lose ISR. Documented rather than hidden.
- **Database outages degrade instead of 500ing.** `cachedQuery` takes a `fallback`; a failed read
  logs and returns it, and failures are never cached. This also lets `next build` succeed with no
  database — the pages fill in on the next revalidation.

### Tests

- **58 Vitest unit tests** across 6 files: scoring and band selection (including overlapping ranges,
  cross-question option spoofing and double answers), phone masking/normalisation, the localization
  helpers and their uz fallback, all four zod schemas, upload magic-byte validation, CSV writing and
  HTML sanitisation.
- **8 Playwright e2e tests** covering the three critical flows from §19: lead submit (plus invalid
  phone and honeypot), a complete 45-question placement run with resume, and admin login → edit →
  verify on the public site (plus the anonymous guard and `noindex`).

### Deployment

- Multi-stage `Dockerfile` on Next's standalone output, **645 MB** (an early version copied pnpm's
  store and came to 2 GB). `docker-entrypoint.sh` applies migrations when `RUN_MIGRATIONS=true`.
- Verified by building the image and running it against Postgres: pages, admin redirect, API,
  sitemap and security headers all correct. Both deployment paths were tested — building **with**
  `DATABASE_URL` prerenders content, and building **without** one produces empty pages that
  `POST /api/revalidate` repopulates immediately.

### Defects found and fixed while hardening

- **`/uz/materials/[type]` had CLS 0.466** — the Suspense fallback was a single line of text, so the
  page jumped when the client-rendered list took over. A layout-matching skeleton took CLS to **0**
  and the score from **68 to 92**.
- **Faded white text on the brand block** (`opacity-80/85`) on `/uz/teachers` measured 3.7:1.
  Removed; accessibility back to 100.
- A dead Unsplash id in the seed produced a 404 on every render of the promotion block.

### Performance work

Three attempts moved the needle, one did not: trimming font preloads from 9 to 1 and dropping the
mobile-wasted hero image preload (no measurable change), a modern `browserslist` (LCP 3.9s → 3.5s),
and cutting the client message payload to the namespaces client components actually read.

### Final Lighthouse (mobile, warm server)

| Page                | Perf  | A11y | Best practices | SEO |
| ------------------- | ----- | ---- | -------------- | --- |
| `/uz`               | 85–91 | 100  | 100            | 100 |
| `/uz/courses/ielts` | 88    | 100  | 100            | 100 |
| `/uz/teachers`      | 85    | 100  | 100            | 100 |
| `/uz/materials/pdf` | 92    | 100  | 100            | 100 |
| `/uz/blog/[slug]`   | 91    | 100  | 100            | 100 |
| `/uz/join-team`     | 94    | 100  | 100            | 100 |
| `/uz/choose-level`  | 94    | 100  | 100            | 100 |
| `/uz/contact`       | 98    | 100  | 100            | 100 |

Accessibility, best practices and SEO clear their targets everywhere. Performance clears ≥90 on five
of eight pages; the homepage and teachers page sit at 85–91 depending on the run, held there by
Lighthouse's _simulated_ LCP (3.3–3.9s against a 2.5s target) — the observed LCP on the machine is
~160ms, and the simulation charges the whole React + next-intl hydration graph against a 1.6 Mbps
link. Closing the gap would mean removing the next-intl client provider or hand-rolling i18n, which
trades real maintainability for a synthetic number; the remaining practical levers are a CDN for
images and HTTP/2 in production.

### Known deviation — resolved

The admin panel UI was hardcoded Uzbek (28 files) at handover, on the reasoning that it is
staff-facing and single-language. It is now fully localised in all three languages; see
**Admin panel localisation** below.

## Post-handover fixes (reported from the running site)

1. **The mobile/overlay menu was clipped to the header** — once the page was scrolled, the header
   picks up `backdrop-blur-md`, and `backdrop-filter` makes an element the containing block for its
   `position: fixed` descendants. `inset-0` therefore resolved to the header's 72–84px box instead
   of the viewport, so the nav items rendered over the hero with no background behind them. The
   overlay is now portalled to `document.body` (`components/shared/header.tsx`). Verified full-height
   at 390 / 768 / 1512px, scrolled and unscrolled.
2. **The stat counters froze near zero** (`0+`, `13+`, `1+`, `0+` instead of `6+`, `2 500+`, `200+`,
   `40+`). `parseValue()` ran in the render body, so each `setDisplay` produced a new object, which
   re-ran the effect, which started another animation loop from zero — the competing loops kept
   resetting the number. `parsed` is now memoised, the run is guarded by a ref, and the frame is
   cancelled on unmount. The final frame renders the authored string verbatim.
3. **`2 500+` wrapped onto two lines** at the old `clamp(2.5rem, 8vw, 6rem)`. The numeral is now
   `clamp(2.25rem, 5.5vw, 4.5rem)` with `white-space: nowrap`, checked at all five breakpoints.

## Follow-up work (post-handover)

**Repository.** `git init`, `.gitignore` corrected so `.env.example` ships while real `.env` files
stay out, and an initial commit covering all eight phases. Verified before committing that no
`.env`, `node_modules`, `.next` or upload artefacts were staged.

**Material downloads delivered nothing.** The seeded materials pointed at `/uploads/demo/*.pdf`,
which never existed — the route worked, but every download 302'd to a 404.
`scripts/generate-demo-files.mjs` now writes real files to `public/demo` (valid single-page PDFs
with a correct xref table, and playable WAV audio), the seed points at them, and it reads each
file's true size from disk so the listing never advertises a size the file does not have.

**Draft Mode (spec §14).** `/api/draft` enables Next.js Draft Mode for signed-in staff — no shared
preview secret, and site-relative paths only, so it cannot be used as an open redirect. The course,
post, vacancy, hero, advantage and testimonial queries bypass their cache and include unpublished
rows while previewing, a banner makes the mode obvious with a one-click exit, and the admin's
"Ko‘rish" button now routes through it. Verified: hidden from visitors, 401 for anonymous callers,
visible to staff, gone again on exit, external paths rejected.

**CI.** `.github/workflows/ci.yml` runs two jobs — types/lint/format/unit tests for fast feedback,
then migrate → seed → i18n check → build → Playwright against a Postgres service, uploading the
report on failure. Playwright uses the machine's Chrome locally and its own Chromium on CI.

### Defect found while doing the above

Re-seeding recreates test options with new ids, so a page cached from before scored **0/45** in
silence — every submitted option id was unknown. `submitAttempt` now returns a stale marker when
answers were given but none matched, the API answers `409 STALE_TEST`, and the runner clears its
saved progress and asks the visitor to reload. Covered by a unit test.

## Admin panel localisation (post-handover)

The public site was translated from the start; the admin panel was not. Every label, column
heading, button, toast and error in `/admin` now comes from the message files, and staff pick
their own panel language from the topbar. The choice is stored in an `admin_locale` cookie, so it
survives sessions and does not touch the public site's locale prefixes.

**Why the cookie, not a URL prefix.** `/admin` is deliberately not locale-prefixed (§13), so there
is no segment to read a locale from. `i18n/request.ts` therefore falls back to the cookie whenever
`requestLocale` is absent, which is what makes _server_ components follow the switcher — without
it the sidebar and page headings stayed Uzbek while the forms translated, because client
components read the provider and server components read the request config.

`messages/{uz,ru,en}.json` hold 663 keys each and stay in sync (`pnpm check:i18n`). Resource labels
resolve through `components/admin/resource-labels.ts`, which prefers a resource-specific key, falls
back to a shared field key, and finally to the registry's Uzbek source text — so a new content type
works untranslated and improves as keys are added.

`pnpm check:admin-i18n` is the acceptance check: for each of the three languages it drives the
switcher and asserts the sidebar, the page heading, the document title (all server-rendered) and
the save button and form labels (client-rendered) match that language's message file, and that no
raw message key leaks into the page. 15 assertions, all passing.

### Defects found while doing this

1. **The sign-in lockout counted successful logins.** `authorize()` consumed one of five attempts
   per 15 minutes on _every_ call, so a staff member who signed in six times — several devices, a
   couple of tabs — locked themselves out with the correct password. Brute-force protection should
   only care about failures: the check now peeks at the budget (`peekRateLimit`, which never
   consumes) and only records an attempt when the email is unknown, the account is inactive, or the
   password is wrong. The limit itself is unchanged. Covered by three unit tests, and verified end
   to end: eight consecutive correct sign-ins all succeed, and six wrong passwords still lock the
   account.

2. **Eleven admin pages hard-coded their Uzbek browser-tab title**, and the generic resource route
   used the registry's Uzbek label. All now build their title through `getTranslations`, so the tab
   follows the panel language.

3. **Two acceptance scripts were asserting the wrong things** and had been passing for the wrong
   reasons. `a[href^="/admin/advantages/"]` matched the _"New"_ button before any list row, so the
   scripts filled in a create form and then checked whichever row happened to sort first; they now
   scope to list rows and verify the exact record they opened. The editor check also asserted the
   address bar to prove a denied route redirects — but `redirect()` serves the dashboard without
   always rewriting the URL, so it now asserts what actually matters: that no user or audit data
   renders. Both scripts also waited fixed delays for a save; they now wait for the save toast,
   which is what made them flaky on a cold dev compile.

4. **The seed churned test question ids on every run.** Questions, options and bands were deleted
   and recreated, so each `db:seed` minted fresh cuids — silently invalidating any page already
   serving the old ids, which is what the `STALE_TEST` guard exists to catch. Seeded rows now carry
   deterministic ids (`level-general-q1-o2`), so re-seeding is genuinely idempotent: rows are
   upserted, anything dropped from the authored bank is removed, and past attempts keep pointing at
   real options. Verified by seeding twice and comparing all 360 option ids. The seed also asks a
   running server to drop its cache tags afterwards (best effort — nothing is listening during a
   fresh bootstrap), because a seed runs outside the app and cannot call `revalidateTag` itself.

5. **The submit API required ids to be cuids.** Giving seeded rows deterministic ids surfaced a
   contract that was too narrow: `z.string().cuid()` rejected `level-general-q1-o2`, so a completed
   test came back 422 and the visitor was told the test had changed. Ids are opaque strings — rows
   the app creates get `cuid()`, seeded rows do not — so the schemas now use a shared
   `recordIdSchema` that bounds length and charset instead of assuming a generator. Whether an id
   _exists_ was always settled by the lookup that follows. Applied to test answers, `courseId` and
   `vacancyId`, and covered by tests for both id styles.

6. **The admin login redirect left the host the visitor was on.** `new URL('/admin/login',
request.nextUrl)` resolves its origin from `AUTH_URL`/`NEXTAUTH_URL`, so an unauthenticated
   request to `/admin` on any other hostname redirected to the configured one — visible locally as
   a redirect from port 3111 to port 3000, and in production as staff being bounced off a preview
   domain, an apex/www variant, or a proxied host. The middleware now builds the redirect from the
   request's own `x-forwarded-host`/`host`, consistent with the `trustHost` already set on the auth
   config.

### Worth knowing before deploying

`next build` fetches Inter and Poppins from Google Fonts. A build in a network-restricted
environment fails at `src/lib/fonts.ts` rather than falling back — worth knowing if the Docker
image is ever built without egress. Self-hosting the two font files would remove the dependency.

## Performance (post-handover)

The handover left the homepage and teachers page at 85–91 against the ≥90 mobile target, with the
gap attributed to Lighthouse's _simulated_ throttling. Re-measuring with **real** throttling
(`--throttling-method=devtools`) split that claim in two: the homepage was fine (93, LCP 2.1s), and
the teachers page was worse than the simulation suggested — **77, LCP 5.1s**. There was a real
defect hiding behind the "it's only the simulation" explanation.

Two causes, both about content that is on screen at load:

1. **The LCP image was lazy-loaded.** The first teacher photo is the largest element above the fold,
   but carried `loading="lazy"`, so the fetch only started after layout — 1.5s of pure load delay.
   `TeacherCard` now takes a `priority` prop, set on the first card of the teachers page and the
   first cover on the blog index.

2. **Above-the-fold content waited for JavaScript to become visible.** The scroll-reveal hides
   `.reveal` elements via CSS gated on `html[data-js='1']`, so anything inside a reveal stayed at
   `opacity: 0` until the main bundle executed and the observer fired — 3.4s of render delay on the
   teachers page, where the first grid _is_ the opening viewport. `Reveal`/`RevealItem` now accept
   `immediate`, used for the first row. Content already on screen should not animate in anyway, so
   this is also the better behaviour.

| Page           | Before        | After         |
| -------------- | ------------- | ------------- |
| `/uz/teachers` | 77 (LCP 5.1s) | 98 (LCP 2.0s) |
| `/uz`          | 93 (LCP 2.1s) | 95 (LCP 2.1s) |

Accessibility is back to **100** on the homepage. Two contrast failures had crept in: testimonial
avatar initials (white on `hsl(H 65% 45%)`, 3.8:1 — the generated colour is now capped at 28%
lightness, which clears 4.5:1 for every hue), and the decorative card index on the advantages
cards (`#e8e8ee` on white, 1.22:1), which is now a CSS pseudo-element rather than a text node,
since it carries no information and `aria-hidden` does not excuse a contrast failure.

### Open item — an intermittent hydration mismatch

Roughly one Lighthouse run in three logs React error #418 ("the server rendered HTML didn't match
the client"), and when it fires React discards the server markup and re-renders: the homepage drops
from ~95 to ~78 and LCP from 2.1s to 4.5s. It is not a scoring artefact — it is the single largest
remaining performance variable.

It has not been reproduced outside Lighthouse: 60+ loads across dev and production, with and
without network and 4× CPU throttling, stay clean. Ruled out so far — the hero headline (the DOM
and the RSC payload in the same response carry identical HTML), every rich-text body (none is
re-normalised by the browser's parser), the consent banner and the reduced-motion hook (both read
browser APIs only inside effects), and non-deterministic initial state (there is none). The
production bundle reports only the minified code, so the failing element is not named.

`pnpm check:responsive` now prints console errors in full rather than truncating them at 60
characters, which is what made this visible in the first place.

## Admin dark mode (post-handover)

Dark mode is admin-only and driven by the `--admin-*` tokens that the `.dark` block swaps
(PROMPT.md §5). It was broken in a way that is easy to miss on a quick look, because the sidebar,
topbar and cards paint their own surfaces and therefore looked right — the failures were in the
places that paint nothing and inherit.

**The admin document never switched.** `app/admin/layout.tsx` set `<body className="bg-paper-alt
text-ink-900">`, which are public-site colours with no dark counterpart. So in dark mode the page
stayed light grey while every child switched to light-on-dark text: the dashboard heading rendered
near-white on near-white at **1.02:1**, and the topbar labels, breadcrumb and user name with it.
The body now uses `bg-admin-bg text-admin-text`, whose light values are identical to the old ones —
light mode is byte-for-byte unchanged.

Four more, all the same root cause of reaching for a colour that does not flip:

1. **Headings inside the rich-text editor were invisible.** The base rule pins `h1`–`h6` to
   `ink-900`; admin page headings override it, but content authored in Tiptap does not, so editing
   the privacy policy in dark mode showed near-black headings on a near-black panel (1.08:1). A
   `.dark :where(h1, …)` rule now defaults them to the admin text colour — `:where()` contributes
   no specificity, so an explicit `text-*` utility still wins.
2. **The leads bulk-action selects** were `bg-white` with no text colour, so they inherited the
   near-white admin text: white on white.
3. **`text-brand-600` and `text-danger`** read at 3.15:1 and 3.7:1 on the admin panel — action
   links like "Tahrirlash", "O‘chirish" and required-field markers. Both now have lightened
   dark-mode counterparts (`--admin-accent`, `--admin-danger`) applied through `dark:` variants at
   the call sites, because the same tokens are also used as _backgrounds_ with white text, where
   lightening them would push contrast the other way.
4. **The media picker** used `text-ink-600` (2.3:1 on a dark panel) and duplicate `.dark` blocks in
   `globals.css` left `--admin-hover` defined twice, the first fully transparent.

Two pre-existing **light**-mode failures surfaced in the same components and are fixed too:
`text-success` was 3.3:1 on white (now 5.02:1, with a lighter green in dark mode where the dark
value would have failed instead), and rich-text links used `brand-500` at 4.31:1 (now `brand-600`
at 5.68:1). `--color-warning` was deliberately left alone: it is also the draft banner's background
and the rating-star fill, so darkening it for text would have regressed both.

`pnpm check:admin-theme` walks seven admin pages in **both** themes and fails on any text under the
AA threshold for its size, or any large near-white surface while dark mode is on. 14 assertions,
all passing. Public accessibility is unchanged at 100 on `/uz` and `/uz/privacy`.

## Brand colour in the admin (post-handover)

The site's palette is now chosen in the admin instead of living in `globals.css`.

**One colour is editable, not five.** The brand stops are not independent: `brand-600` carries white
text on buttons _and_ is the link colour on white, and `brand-50` is the chip background that
`brand-600` sits on. Exposing those separately is how a site ends up with an unreadable button, so
`src/lib/theme.ts` takes the single colour an admin picks and generates the scale, darkening every
stop that carries text until it clears 4.5:1 against the lightest surface it appears on.

Lightness is adjusted in OKLCH rather than sRGB so a blue and a red produce scales of the same
visual weight, and chroma is reduced when a lightness change would push a saturated hue outside the
display gamut — clamping the channels instead would shift the hue visibly.

Picking the shipped red returns the **hand-tuned** palette verbatim rather than a regenerated
near-miss (`#c42a21` at 5.68:1 against the generated `#d61d18` at 5.19:1). Adding this feature
therefore changes nothing for a site whose owner never picks a colour, and the accessibility scores
measured before it remain valid.

The palette is injected as an inline `<style>` by both root layouts — inline so it lands before
first paint and never flashes the old colour, and behind a doubled `:root:root` selector so it wins
over Tailwind's own `@theme` block whatever order the stylesheets land in. The admin panel wears the
same brand, deriving its dark-mode accent from the same hue. `manifest.ts` and the OG image follow
too. Saving revalidates the root layout, since a colour change invalidates every cached page rather
than only the ones settings usually touch.

Two checks cover it. `tests/theme.test.ts` holds the contrast promise across the hue circle
including the awkward cases — yellow has to travel a long way before white text works on it — and
`pnpm check:theme` changes the colour for real through the admin, reads what the public site
actually paints, and puts it back.

Writing the tests first paid: they caught that `600` was being measured against white when the chip
tint it sits on is the stricter constraint (4.19:1 for the shipped red), and that a pure-black pick
produced identical `600` and `700`, leaving hover with nothing to show.

## Self-hosted fonts (post-handover)

`next/font/google` downloads Inter and Poppins while `next build` runs. That is invisible locally and
fatal in a Docker build on a slow link: two production deploys built everything else and then died
on `Failed to fetch \`Inter\` from Google Fonts`, the second with a socket timeout. A container on
the same machine took ten minutes just to pull `node:22-alpine`, so the network — not the code — was
the problem, but a deploy that only works on a good connection is not a deploy.

The fonts now live in `public/fonts` with their `@font-face` rules in `src/app/fonts.css`. Rather
than hand-writing those, `scripts/vendor-fonts.mjs` lifts exactly what `next/font` generated from a
previous build: the same files, the same per-subset `unicode-range` splits so an Uzbek page still
downloads only the Latin subsets rather than the Cyrillic one, and the metric-adjusted
`Inter Fallback` / `Poppins Fallback` faces that keep the swap from shifting layout. The three
subsets `next/font` used to preload are preloaded by the public layout, so the critical path is
unchanged.

Verified after the switch: zero requests to Google on both `/uz` and `/ru`, headings still render in
Poppins and body in Inter with both fallback faces loaded, and Lighthouse desktop at
100 / 100 / 100 performance, accessibility and best practices with LCP 0.8 s and CLS 0.035. (The SEO
92 in that run is a localhost artefact: the canonical URL is baked to the real domain and cannot
match `localhost:3111`.)

## Real placement tests (post-handover)

Both papers now hold the school's own questions, replacing the sample bank the seed shipped with.

**General English — 45 multiple-choice questions.** The wording, the options and the answer key come
from the school's PDF, and a check compares every keyed letter against the seed rather than trusting
the transcription. The bands follow the paper: 0–8 Beginner, 9–18 Elementary, 19–27 Pre-Intermediate,
28–36 Intermediate, 37–45 Upper-Intermediate.

**Kids — 35 written answers.** This one did not fit the schema at all: the paper asks a child to name
a picture, translate a word, answer questions about a text and put words back in order. None of that
is a choice between options, so `TestQuestion` gained an `answerType` and a list of `acceptedAnswers`,
and the runner renders a text field for those questions.

Grading them has to forgive what a human marker forgives. `src/lib/answer-match.ts` normalises case,
trailing punctuation, collapsed whitespace and — the one that matters locally — the several
apostrophes Uzbek is typed with, so `o'tirmoq`, `oʻtirmoq` and `o‘tirmoq` are one answer. It stays
exact after normalising rather than fuzzy: `swim` never passes for `swimming` unless a teacher listed
both. Translations accept either Russian or Uzbek, and comprehension questions accept both the full
sentence and the short answer a child is likely to write.

Verified by taking both papers in a browser: the General key scores 45/45 → Upper-Intermediate, the
Kids key scores 35/35 → Level 04, the same Kids answers typed casually — lower case, no full stops,
a plain apostrophe — still score 35/35, and 18 correct lands on Level 02 as the paper says.

Part 3 shows the reading passage above each of its questions, since the runner puts one question on a
screen and the text has to travel with them.

**Outstanding:** the six Part 1 pictures are not in the repo. Those questions are seeded with their
answers and no image; attach the pictures under Media and paste the link into each question. The
admin question editor now handles this — answer type, accepted answers and an image URL are editable
per question.

Two answers in the school's key look wrong and were kept as the school marks them, not silently
changed: **Q20** is keyed A (`mustn't`) where "we've still got twenty minutes" points to D
(`needn't`), and **Q25** is keyed D (`A few`) where "\_\_\_ people know this" idiomatically takes C
(`Few`). Both are one edit away in the admin if the school agrees.
