# BUILD PROMPT — English Language School Website + Admin Panel

> Everything below is a specification, not a suggestion. Do not skip sections.

---

## 1. Mission

Build a **production-ready marketing website + content management admin panel** for a private
English language school (IELTS / General English / Kids English) operating in Uzbekistan.

The public site is a **conversion-focused, single-page-heavy marketing site** with a few
sub-pages. The admin panel makes **every piece of content on the public site editable** without
touching code — no hardcoded text, no hardcoded images, no hardcoded prices.

Two audiences:

| Audience                         | Needs                                                                                                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parents & students (public site) | Trust signals, prices, teacher credentials, free placement test, free materials, one-tap way to request a trial lesson                                                             |
| School staff (admin panel)       | Edit content, manage courses/teachers/testimonials, read incoming leads, manage the placement test question bank, upload study materials, post vacancies and read job applications |

**Primary business goal of the public site: capture leads (name + phone) for a free trial lesson.**
Every section must have a path to that action.

---

## 2. Reference analysis — what the original site does

The site being modelled (`foundersenglishschool.uz`) is a Next.js App Router site. Structure observed:

**Header (sticky):** logo · social icons (Telegram, Instagram, Email, YouTube) · link to external LMS
("CDI") · language switcher (UZ / EN / RU flags) · primary CTA button "Darajangizni aniqlang"
(Find your level) · hamburger that opens a full menu.

**Homepage sections in order:**

1. **Hero** — headline "Kafolatlangan IELTS yoki BEPUL o'qing!" (Guaranteed IELTS or study for
   FREE), subline about 2000+ students, CTA "Birinchi darsga yozilish" (Sign up for the first lesson).
2. **Marquee ticker** — scrolling badges: "Founders School · Ishonchli ta'lim · Malakali ustozlar
   · Unutilmas Darslar".
3. **Stats row** — `4+ yillik tajriba`, `2 500+ mamnun o'quvchilar`, `200+ Ijobiy IELTS natijalari`,
   `40+ xodimlar soni`.
4. **About ("Biz haqimizda")** — text + embedded video of the campus.
5. **Teachers ("Ustozlar")** — carousel of teacher cards / IELTS score result cards (large red
   cards showing "8.0 Overall band", "Listening 9.0" over a scan of an IELTS TRF).
6. **Why us ("Nega aynan bizni tanlashadi?")** — "top 5 reasons": IELTS 7+ KAFOLATI, TEZ
   NATIJADORLIK, TALABCHAN USTOZLAR, QIZIQARLI DARS USLUBI, DO'STONA MUHIT.
7. **Problems block** — "Sizning ham farzandingizda shunday muammolar bormi?" listing 5 pain
   points (word memorisation, no fluency, listening, reading comprehension, writing).
8. **Promotions ("Aksiyalar")** — current campaign with prizes (1st place Umrah trip, 2nd
   sanatorium, 3rd family trip).
9. **Careers teaser** — "Jamoamizning bir bo'lagiga aylaning!" → link to `/join-team`.
10. **Services / Courses ("Xizmatlar")** — 5 course cards, each with description, level duration
    and price: KIDS ENGLISH (3 oy, 850 000 UZS), GENERAL ENGLISH (3 oy, 850 000 UZS),
    IELTS (3 oy, 950 000 UZS), KORPORATIV ENGLISH (8 oy, 1 000 000 UZS), ONLINE ENGLISH
    (Individual, 1 500 000 UZS). Each card has a "Birinchi darsga yozilish" button.
11. **Testimonials ("Mijozlar fikri!")** — infinite marquee of ~8 review cards with avatar initial,
    name and quote.
12. **Materials teaser** — 4 cards: PDF / Audio / Video / Photo materials → separate pages.
13. **FAQ** — accordion, 5+ Q&A.
14. **Contact + map** — phones `71 205-03-33 / 71 205-53-33`, email, Yandex Maps link, socials.
15. **Footer** — nav duplicate, tagline "Chet tillari kurslari Toshkentda".
16. **Floating chat bubble** bottom-right.

**Sub-pages observed:**

- `/choose-level` — pick **KIDS** or **GENERAL** card → routes to `/tests/level-kids` or
  `/tests/level-general` → ~45 single-answer multiple-choice questions, one per screen, "Keyingi"
  (Next) button → final result screen.
- `/parents-solutions` — problems → solutions mapping (Speaking / Listening / Reading / Writing /
  Study on a grant), with skill tabs.
- `/pdf-materials` — level filter chips (BEGINNER, ELEMENTARY, PRE-INTERMEDIATE, INTERMEDIATE,
  UPPER-INTERMEDIATE) + group chips (STUDENT BOOKS, WORK BOOKS) + a list of downloadable files.
- `/audio-materials`, `/video-materials`, `/photo-materials` — same pattern per media type.
- `/join-team` — open positions (Administrator, Academic Support, ESL/IELTS instructor, Grafik
  dizayner, Kassir, Ambassador), each with an "Ariza topshirish" (Apply) button + a hiring-process
  timeline.
- `/materials` is currently a **404 on the original — fix that in our build** (make it a hub page).

**Our build must reproduce all of the above and add the admin panel the original lacks.**

---

## 3. Non-negotiable rules

1. **Zero hardcoded content.** Every string, number, price, image, phone number, social link and
   colour accent that appears on the public site comes from the database or from `SiteSetting`.
   The only hardcoded strings allowed are UI chrome labels that live in the i18n message files.
2. **Three locales: `uz` (default), `ru`, `en`.** Every content model carries localized fields.
3. **Mobile-first.** The majority of traffic is Uzbek mobile users on mid-range Android. Test at
   360px, 390px, 768px, 1280px, 1536px.
4. **Fast.** Lighthouse mobile >= 90 for Performance, >= 95 Accessibility, >= 95 SEO, >= 95 Best
   Practices on the homepage. LCP < 2.5s on Fast 3G.
5. **Type-safe end to end.** TypeScript `strict: true`. Zod schemas shared between client forms,
   server actions and API routes. No `any`.
6. **Every form is validated on the server**, rate-limited, and protected by a honeypot field.
7. **Accessibility:** semantic HTML, keyboard-operable accordions/carousels/modals, visible focus
   rings, `prefers-reduced-motion` respected, alt text on every image (stored in DB).

---

## 4. Tech stack

```
Framework      Next.js 15 (App Router, Server Components, Server Actions, Turbopack)
Language       TypeScript 5.x (strict)
Styling        Tailwind CSS v4 + CSS variables for the theme
UI components  shadcn/ui (Radix primitives) — install only the components used
Icons          lucide-react
Animation      Framer Motion (motion/react) — scroll reveals, marquees, page transitions
Forms          react-hook-form + zod + @hookform/resolvers
DB             PostgreSQL 16
ORM            Prisma 6 (with `prisma generate` in postinstall)
Auth           NextAuth v5 (Auth.js) — Credentials provider, bcrypt hashes, JWT session
i18n           next-intl (locale-prefixed routes: /uz, /ru, /en; uz = default)
Uploads        UploadThing OR local disk in dev + S3-compatible in prod.
               Abstract behind `lib/storage.ts` so the driver can be swapped.
Rich text      Tiptap (admin editor) — stored as sanitized HTML
Tables (admin) TanStack Table v8
Charts (admin) Recharts
Validation     zod (single source of truth in `lib/validations/*`)
Email          Resend (optional, for admin notifications)
Messaging      Telegram Bot API (primary lead notification channel)
Rate limiting  Upstash Redis @upstash/ratelimit, with an in-memory fallback for local dev
Testing        Vitest (unit) + Playwright (e2e for: lead form, placement test, admin login+CRUD)
Lint/format    ESLint (next/core-web-vitals) + Prettier + prettier-plugin-tailwindcss
Deployment     Docker Compose (app + postgres) AND Vercel-compatible. Provide both.
```

### Project structure

```
.
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                     # realistic demo content in all 3 locales
│   └── migrations/
├── messages/
│   ├── uz.json
│   ├── ru.json
│   └── en.json
├── public/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # homepage (all sections)
│   │   │   ├── choose-level/page.tsx
│   │   │   ├── tests/[slug]/page.tsx       # level-kids | level-general
│   │   │   ├── parents-solutions/page.tsx
│   │   │   ├── materials/page.tsx          # hub
│   │   │   ├── materials/[type]/page.tsx   # pdf | audio | video | photo
│   │   │   ├── courses/[slug]/page.tsx
│   │   │   ├── teachers/page.tsx
│   │   │   ├── join-team/page.tsx
│   │   │   ├── join-team/[slug]/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   ├── blog/[slug]/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── not-found.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx                  # sidebar shell, auth guard
│   │   │   ├── page.tsx                    # dashboard
│   │   │   └── <resource>/...              # see section 13
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── leads/route.ts
│   │   │   ├── applications/route.ts
│   │   │   ├── contact/route.ts
│   │   │   ├── test/[slug]/route.ts        # GET questions, POST answers
│   │   │   ├── materials/[id]/download/route.ts
│   │   │   ├── upload/route.ts
│   │   │   ├── revalidate/route.ts
│   │   │   └── og/route.tsx                # dynamic OG images
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── manifest.ts
│   ├── components/
│   │   ├── ui/                             # shadcn primitives
│   │   ├── sections/                       # Hero, Stats, Courses, Testimonials, Faq, ...
│   │   ├── admin/                          # DataTable, LocalizedInput, MediaPicker, ...
│   │   └── shared/                         # Header, Footer, LeadModal, LangSwitcher, ...
│   ├── lib/
│   │   ├── prisma.ts  auth.ts  storage.ts  telegram.ts  ratelimit.ts
│   │   ├── i18n.ts    seo.ts   utils.ts    analytics.ts
│   │   └── validations/
│   ├── server/
│   │   ├── actions/                        # server actions grouped by resource
│   │   └── queries/                        # cached read queries (unstable_cache + tags)
│   ├── types/
│   └── middleware.ts                       # locale routing + /admin auth gate
├── e2e/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## 5. Design system

The look is **bold, high-contrast, red-and-white, rounded, energetic** — not a generic corporate
template. Reference feel: large rounded cards, thick red brand blocks, oversized numerals, tight
sans-serif headlines, marquee tickers, generous whitespace.

### Tokens (`globals.css`, `@theme` in Tailwind v4)

```css
--brand-500: #e63329; /* primary red — buttons, brand blocks */
--brand-600: #c42a21; /* hover */
--brand-50: #fff1f0; /* tinted backgrounds */
--ink-900: #0e0e10; /* headings, dark buttons */
--ink-600: #4a4a52; /* body text */
--ink-300: #c9c9d1; /* borders */
--paper: #ffffff;
--paper-alt: #f6f6f8; /* section alternation */
--success: #16a34a;
--warning: #f59e0b;
--danger: #dc2626;

--radius-sm: 12px;
--radius-md: 20px;
--radius-lg: 28px;
--radius-xl: 40px;
--shadow-card: 0 8px 30px rgba(14, 14, 16, 0.08);
--shadow-brand: 0 12px 40px rgba(230, 51, 41, 0.28);
```

Support **dark mode** on the admin panel only (`class` strategy). The public site is light-only
but must still declare an explicit background so it never inherits a dark UA theme.

### Typography

- Headings: a geometric grotesk with wide weights — `Poppins` or `Manrope` (700/800), tight
  tracking (`-0.02em`), size clamp: `clamp(2rem, 6vw, 4.5rem)` for the hero H1.
- Body: `Inter` 400/500, `1.0625rem` base, `1.65` line-height.
- Load with `next/font/google`, `display: swap`, subsets `latin`, `latin-ext`, `cyrillic`
  (needed for RU).
- Numerals in stat blocks: `font-variant-numeric: tabular-nums`, huge (`clamp(2.5rem,8vw,6rem)`).

### Component conventions

- **Buttons:** pill (`rounded-full`), 3 variants — `brand` (red fill, white text),
  `dark` (ink fill), `outline` (1.5px ink border). Height 48px mobile / 52px desktop.
  Hover: `translateY(-2px)` + shadow. Active: `scale(.98)`.
- **Cards:** `rounded-[var(--radius-lg)]`, white on `--paper-alt` sections, `--shadow-card`,
  1px `--ink-300/40` border. Hover lifts 4px.
- **Section rhythm:** `py-16 md:py-24 lg:py-28`, container `max-w-[1240px] px-5 md:px-8`.
- **Section header pattern:** small red eyebrow label → big H2 → muted subtitle, left-aligned on
  desktop, centered on mobile.
- **Motion:** every section fades+rises 24px on enter (`viewport={{ once: true, amount: .2 }}`,
  duration .5s, ease `[0.22,1,0.36,1]`), staggered children 60ms. Marquees use CSS
  `@keyframes` translate with duplicated content, paused on hover, **disabled entirely under
  `prefers-reduced-motion`**.

---

## 6. Information architecture

| Route                             | Page                                                      | Rendering                                                 |
| --------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `/[locale]`                       | Homepage — all 16 sections                                | Static + ISR (`revalidate: 300`) + tag-based revalidation |
| `/[locale]/courses/[slug]`        | Single course detail                                      | ISR                                                       |
| `/[locale]/teachers`              | All teachers grid                                         | ISR                                                       |
| `/[locale]/parents-solutions`     | Problems → solutions                                      | ISR                                                       |
| `/[locale]/choose-level`          | Test category chooser                                     | Static                                                    |
| `/[locale]/tests/[slug]`          | Placement test runner                                     | Client + API                                              |
| `/[locale]/materials`             | Materials hub (4 type cards)                              | ISR                                                       |
| `/[locale]/materials/[type]`      | Filtered material list (`pdf`\|`audio`\|`video`\|`photo`) | ISR + client filters                                      |
| `/[locale]/join-team`             | Vacancies + hiring process                                | ISR                                                       |
| `/[locale]/join-team/[slug]`      | Single vacancy + apply form                               | ISR                                                       |
| `/[locale]/blog` , `/blog/[slug]` | News / blog                                               | ISR                                                       |
| `/[locale]/contact`               | Contact info + form + map                                 | ISR                                                       |
| `/[locale]/privacy`               | Privacy policy (required for ad platforms)                | Static from DB                                            |
| `/admin/**`                       | Admin panel                                               | Dynamic, auth-gated                                       |

Also keep the original's in-page anchors working: `#teachers`, `#services`, `#testimonials`,
`#faq`, `#contact` — smooth-scroll with a scroll-margin offset equal to the sticky header height.

---

## 7. Public site — section-by-section specification

Each section is a component in `components/sections/`, receives **already-localized, typed props**
from a server query, and renders nothing (returns `null`) if the admin has toggled it off or it
has no published rows. **Section order and on/off state are themselves editable** via a
`HomeSection` table (see schema).

### 7.1 Header

Sticky, translucent-blur on scroll (`backdrop-blur-md bg-white/85`, adds shadow after 20px).
Contents: logo (from settings) · social icon row (from `SiteSetting.socials`, only non-empty
ones render) · optional external-LMS button (label + URL from settings) · language switcher
(dropdown with flag SVGs, preserves the current path) · primary CTA button (label + target from
settings) · hamburger opening a full-screen overlay menu on mobile, a slide-down panel on desktop.
Menu items come from a `NavItem` table (label, href, order, visible, target).

### 7.2 Hero

Full-width, brand-red background block with an outlined-logo watermark. H1 supports a
**highlight span** (a word rendered in white-on-black or with an underline swash) — store the
headline as localized HTML-lite with `<mark>` allowed. Subtitle, CTA button, and an optional
right-side media (image or looping muted video). Below: the **stats row** (4 pill badges).
Hero fields (image, headline, subtitle, CTA label, CTA action) are admin-editable, and the hero
supports **multiple slides** with autoplay if more than one is published.

### 7.3 Marquee ticker

Endless horizontal scroll of short phrases separated by an arrow/sparkle icon. Phrases come from
`SiteSetting.tickerItems` (localized string array). Two rows scrolling in opposite directions on
desktop, one row on mobile.

### 7.4 Stats

4–6 items from the `Stat` table: `value` (string, e.g. `2 500+`), `label`, `icon`, `order`.
Count-up animation on first view (skip when reduced motion).

### 7.5 About

Localized rich text + media (video embed via `next/image` poster + click-to-play `<video>`, or a
YouTube lite-embed component — do **not** load the YouTube iframe until clicked).

### 7.6 Teachers

Horizontal snap-scroll carousel on mobile, 3–4 column grid on desktop. Teacher card:
photo (portrait 3:4, `object-cover`), name, role, IELTS/CEFR score badge, certificate chips
(TESOL, CELTA, ...), years of experience, optional short bio, optional link to a full profile.
Also supports **result cards** (a student's IELTS score sheet) as a second card type in the same
carousel — use a separate `SuccessStory` table (cleaner).

### 7.7 Why us

5 cards: icon, title, description. From the `Advantage` table.

### 7.8 Problems

Heading + 5 problem cards (icon, title, description) from `Problem`, then a CTA. This section is
also reused on `/parents-solutions` where each problem is paired with its `Solution`.

### 7.9 Promotions

Renders the currently active `Promotion` (now between `startsAt` and `endsAt`, `isActive`).
Layout: full-bleed red block, campaign title, description, and a prize list (1st/2nd/3rd with
icon + label). Optional countdown timer to `endsAt`. Hides itself entirely when nothing is active.

### 7.10 Careers teaser

Title, subtitle, CTA → `/join-team`. Background image from settings.

### 7.11 Courses ("Services")

Grid of `Course` cards: cover image, level/tag chip, title, description, `duration` label,
`price` (formatted `850 000 UZS` with non-breaking thin spaces, currency from settings),
CTA button that opens the **Lead modal pre-filled with that course**.
Card links to `/courses/[slug]` when `hasDetailPage` is true.
Course detail page: hero, description rich text, curriculum list (levels/modules), what's
included, schedule options, price block, FAQ subset, teachers assigned to the course,
and a lead form.

### 7.12 Testimonials

Two-row infinite marquee of testimonial cards. Card: avatar (image or generated initial circle
using a deterministic colour from the name), name, role/relationship ("Ota-ona", "O'quvchi"),
star rating, quote (clamped to 4 lines with a "read more" dialog), optional source badge
(Instagram / Telegram / Google) and optional **video testimonial** (opens a modal player).
Admin can pin testimonials to the top via `isFeatured` + `order`.

### 7.13 Materials teaser

4 cards (PDF, Audio, Video, Photo) each linking to `/materials/[type]`, showing the live count of
published materials of that type.

### 7.14 FAQ

Accordion (Radix), single-open, keyboard accessible, with `FAQPage` JSON-LD emitted from the same
data. Grouped by `FaqCategory` with filter chips when more than one category exists.

### 7.15 Contact

Two columns: (a) branches list — each `Branch` with name, address, phones (tel: links),
working hours, map link; (b) a short contact form (name, phone, message). Below: an embedded map
(lazy iframe, loaded on click) using the branch's map embed URL.

### 7.16 Footer

Logo + tagline, nav columns (from `NavItem` groups), socials, phones, email, license/legal line,
`© {year}`, and a link to `/privacy`. A small "Made by ..." credit line is admin-editable.

### 7.17 Global UI

- **Lead modal** — opens from every CTA. Fields: `name`, `phone` (masked `+998 (__) ___-__-__`,
  validated with a UZ regex), optional `courseId` select, optional `preferredTime`, hidden
  `source`/UTM fields, honeypot. On success: inline success state with a Telegram/phone follow-up
  hint, and a `lead_submitted` analytics event. Never navigate away.
- **Floating action bubble** bottom-right: expands into quick links (Telegram, Call, Lead form).
- **Cookie/consent notice** — only if analytics are enabled; default to declining non-essential.
- **Scroll progress bar** on article/blog pages.
- **404 and error boundaries** styled with the brand.

---

## 8. Placement test ("Darajangizni aniqlang")

Flow:

1. `/choose-level` — cards for each published `TestCategory` (seeded: **KIDS**, **GENERAL**;
   the admin can add more, e.g. **IELTS DIAGNOSTIC**). Each card: title, subtitle, icon/image,
   question count, estimated time. Buttons: `Orqaga` (Back) / `Davom etish` (Continue).
2. `/tests/[slug]` — the runner:
   - Questions delivered by `GET /api/test/[slug]` **without the `isCorrect` flags**. Order can be
     fixed or shuffled per `TestCategory.shuffle`.
   - One question per screen, `N. <prompt>` with support for a two-line dialogue prompt and a
     `_____` gap, 2–5 answer options as full-width pill buttons, single select.
   - Sticky progress bar (`x / total`) + optional per-test countdown (`TestCategory.timeLimitSec`,
     null = untimed). Auto-submit on timeout.
   - `Keyingi` (Next) is disabled until an option is selected; `Orqaga` allows going back and
     changing an answer while `allowBack` is true.
   - Progress persisted in `localStorage` keyed by attempt id, so a refresh resumes.
   - Keyboard: `1..5` selects an option, `Enter` = next.
3. **Result gate** — before showing the result, ask for `name` + `phone` (this is the lead
   capture; make it a required step but state clearly that the result appears immediately after).
   Optional: allow "skip" if `TestCategory.requireContact` is false.
4. **Result screen** — score `X/45`, a determined **level band** (from `TestLevelBand`:
   min/max score → level name, description, recommended `Course`), a CTA to book the trial lesson
   for that course, and a "share result" button (Telegram share URL).
5. The attempt is stored in `TestAttempt` with answers, score, band, contact and UTM data, and
   a Telegram notification is sent to the admin channel.

**Admin side:** full CRUD on categories, questions (with option editor, correct-answer radio,
points, difficulty, order, active flag), **CSV/XLSX bulk import + export** of the question bank,
level bands editor, and an attempts table with score distribution charts and CSV export.

---

## 9. Materials library

- Types: `PDF`, `AUDIO`, `VIDEO`, `PHOTO` (enum `MaterialType`).
- Levels: `BEGINNER`, `ELEMENTARY`, `PRE_INTERMEDIATE`, `INTERMEDIATE`, `UPPER_INTERMEDIATE`,
  `ADVANCED`, `IELTS`, `KIDS` (enum `MaterialLevel`).
- Groups (free-form, admin-managed `MaterialGroup`): "Student Books", "Work Books", "Listening
  practice", "Speaking topics", ...
- `/materials/[type]` page: title, level chips (multi-select, URL-synced via `searchParams`),
  group chips, search box (debounced, matches localized title + tags), and a result list.
- Row/card: title, level badge, group badge, file size, page/duration meta, download count, and a
  download button.
- **Downloads go through `/api/materials/[id]/download`** which: checks `isPublished`, increments
  `downloadCount`, logs a `MaterialDownload` row (with optional lead gating), then redirects/streams.
- **Optional lead gate:** when `Material.requireContact` is true, show the lead modal before the
  download and remember consent in a cookie for 30 days.
- Video materials embed a lite YouTube/Vimeo player; photo materials open a lightbox gallery.

---

## 10. Careers

- `/join-team`: hero, list of open `Vacancy` cards (title, short description, department,
  employment type, salary range if `showSalary`), and a **hiring process timeline** (ordered
  `HiringStep` records: number, title, description).
- `/join-team/[slug]`: full description, responsibilities list, requirements list, conditions,
  and an application form: `fullName`, `phone`, `email` (optional), `birthDate` (optional),
  `about` textarea, **CV upload** (pdf/doc/docx, <= 10 MB, validated by magic bytes not just
  extension), consent checkbox, honeypot.
- Submissions create `JobApplication` rows with status `NEW → REVIEWING → INTERVIEW → HIRED |
REJECTED`, notify Telegram, and appear in the admin with a CV download link and a notes field.

---

## 11. Leads, notifications and integrations

### Lead pipeline

`Lead { name, phone, courseId?, source, page, utmSource, utmMedium, utmCampaign, utmContent,
utmTerm, referrer, userAgent, ip (hashed), status, assignedToId?, note, createdAt }`

`LeadStatus`: `NEW | CONTACTED | TRIAL_BOOKED | ENROLLED | REJECTED | SPAM`.

`LeadSource`: `HERO | COURSE_CARD | COURSE_PAGE | TEST_RESULT | MATERIAL_GATE | CONTACT_FORM |
FLOATING_CTA | PROMOTION | OTHER`.

On create: validate → rate limit (5 per phone per hour, 20 per IP per hour) → dedupe (same phone
within 24h updates the existing lead and adds a note instead of creating a duplicate) → persist →
fire Telegram notification → return success. Notifications must be **fire-and-forget** (never
block or fail the user's request; log failures).

### Telegram

`lib/telegram.ts` — `sendTelegramMessage(text, opts)` using `TELEGRAM_BOT_TOKEN` +
`TELEGRAM_CHAT_ID`. Message templates (HTML parse mode) for: new lead, new job application,
new contact message, new completed placement test. Include a deep link to the admin record.
Make the chat id configurable **per notification type** via `SiteSetting` so different teams get
different channels.

### Analytics

`lib/analytics.ts` with a thin `track(event, props)` wrapper. Wire Google Analytics 4 and Meta
Pixel, ids from `SiteSetting`, loaded with `next/script strategy="afterInteractive"` and only when
an id exists. Events: `lead_submitted`, `test_started`, `test_completed`, `material_downloaded`,
`vacancy_applied`, `call_clicked`, `telegram_clicked`.

---

## 12. Internationalization

- `next-intl` with routes `/uz`, `/ru`, `/en`; `uz` is the default locale.
- `middleware.ts` handles locale detection (cookie → `Accept-Language` → default) and redirects.
- **UI chrome strings** live in `messages/{locale}.json`, organized by namespace
  (`common`, `nav`, `home`, `forms`, `test`, `materials`, `careers`, `admin`).
- **Content strings** live in the DB as a `Json` column of shape `{ uz: string; ru: string; en: string }`.
  Define:

  ```ts
  // src/types/i18n.ts
  export type Locale = 'uz' | 'ru' | 'en';
  export type Localized = Record<Locale, string>;
  export const t = (v: Localized | null | undefined, l: Locale, fb: Locale = 'uz') =>
    v?.[l]?.trim() || v?.[fb]?.trim() || '';
  ```

  Every read query maps localized JSON → plain strings **on the server** before it reaches a
  client component. Client components never receive the raw `Localized` blobs.

- In the admin, every localized field renders as a **tabbed input** (UZ | RU | EN) with a
  "copy from UZ" helper and a per-locale completeness indicator.
- `hreflang` alternates + `og:locale:alternate` on every page. Phone/price/date formatting via
  `Intl` with locale `uz-UZ` / `ru-RU` / `en-US`.

---

## 13. Database schema (Prisma)

Write this into `prisma/schema.prisma`. Add `@@index` on every field used in a filter or sort.
Use `cuid()` ids, `createdAt`/`updatedAt` on every model, and soft-delete (`deletedAt`) on
content models that staff might delete by accident (Lead, JobApplication, Material, Course).

```prisma
generator client { provider = "prisma-client-js" }
datasource db    { provider = "postgresql"; url = env("DATABASE_URL") }

// ---------- auth ----------
enum Role { SUPER_ADMIN ADMIN EDITOR MODERATOR VIEWER }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  passwordHash  String
  role          Role     @default(EDITOR)
  avatarUrl     String?
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  leads         Lead[]           @relation("LeadAssignee")
  auditLogs     AuditLog[]
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action     String   // CREATE | UPDATE | DELETE | LOGIN | EXPORT
  entity     String
  entityId   String?
  diff       Json?
  ip         String?
  createdAt  DateTime @default(now())
  @@index([entity, entityId])
  @@index([createdAt])
}

// ---------- site config ----------
model SiteSetting {
  id                String  @id @default("singleton")
  brandName         Json    // Localized
  tagline           Json
  logoLightUrl      String?
  logoDarkUrl       String?
  faviconUrl        String?
  ogImageUrl        String?
  primaryCtaLabel   Json
  primaryCtaHref    String?
  externalLmsLabel  String?
  externalLmsUrl    String?
  phones            String[]
  email             String?
  socials           Json    // { telegram, instagram, youtube, facebook, tiktok, whatsapp }
  tickerItems       Json    // Localized[]  (array of Localized)
  currency          String  @default("UZS")
  ga4Id             String?
  metaPixelId       String?
  yandexMetricaId   String?
  telegramChatIds   Json?   // { lead, application, contact, test }
  privacyPolicy     Json?   // Localized rich text
  updatedAt         DateTime @updatedAt
}

model NavItem {
  id        String  @id @default(cuid())
  label     Json
  href      String
  group     String  @default("header") // header | footer-1 | footer-2 | mobile
  order     Int     @default(0)
  isVisible Boolean @default(true)
  openInNew Boolean @default(false)
  @@index([group, order])
}

model HomeSection {
  id        String  @id @default(cuid())
  key       String  @unique // hero | ticker | stats | about | teachers | advantages | problems |
                            // promotions | careers | courses | testimonials | materials | faq | contact
  order     Int
  isVisible Boolean @default(true)
  title     Json?
  subtitle  Json?
  eyebrow   Json?
}

model Branch {
  id           String  @id @default(cuid())
  name         Json
  address      Json
  phones       String[]
  workingHours Json?
  mapEmbedUrl  String?
  mapLinkUrl   String?
  lat          Float?
  lng          Float?
  imageUrl     String?
  order        Int     @default(0)
  isActive     Boolean @default(true)
}

// ---------- home content ----------
model HeroSlide {
  id          String   @id @default(cuid())
  headline    Json
  subtitle    Json?
  ctaLabel    Json?
  ctaHref     String?
  imageUrl    String?
  imageAlt    Json?
  videoUrl    String?
  order       Int      @default(0)
  isPublished Boolean  @default(true)
}

model Stat {
  id     String @id @default(cuid())
  value  String
  label  Json
  icon   String?
  order  Int    @default(0)
  isVisible Boolean @default(true)
}

model Advantage {   // "Nega aynan bizni tanlashadi"
  id          String @id @default(cuid())
  title       Json
  description Json
  icon        String?
  imageUrl    String?
  order       Int    @default(0)
  isPublished Boolean @default(true)
}

model Problem {
  id          String @id @default(cuid())
  title       Json
  description Json
  icon        String?
  order       Int    @default(0)
  solution    Solution?
}

model Solution {
  id          String  @id @default(cuid())
  problemId   String  @unique
  problem     Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
  skill       Skill
  title       Json
  description Json
  imageUrl    String?
}

enum Skill { SPEAKING LISTENING READING WRITING GRANT }

model Promotion {
  id          String   @id @default(cuid())
  title       Json
  description Json
  prizes      Json     // [{ place: 1, label: Localized, icon }]
  imageUrl    String?
  ctaLabel    Json?
  ctaHref     String?
  startsAt    DateTime
  endsAt      DateTime
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  @@index([isActive, startsAt, endsAt])
}

// ---------- courses ----------
model Course {
  id             String   @id @default(cuid())
  slug           String   @unique
  title          Json
  shortDesc      Json
  description    Json?    // rich text HTML
  level          Json?    // e.g. "Beginner - Upper-Intermediate"
  durationLabel  Json     // "3 oy"
  price          Decimal? @db.Decimal(12,2)
  priceNote      Json?    // "1 daraja uchun"
  currency       String   @default("UZS")
  publisher      String?  // OXFORD / MACMILLAN
  coverUrl       String?
  iconUrl        String?
  curriculum     Json?    // [{ title: Localized, items: Localized[] }]
  includes       Json?    // Localized[]
  hasDetailPage  Boolean  @default(true)
  isFeatured     Boolean  @default(false)
  isPublished    Boolean  @default(true)
  order          Int      @default(0)
  seoTitle       Json?
  seoDescription Json?
  teachers       Teacher[] @relation("CourseTeachers")
  leads          Lead[]
  levelBands     TestLevelBand[]
  deletedAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@index([isPublished, order])
}

model Teacher {
  id           String  @id @default(cuid())
  slug         String  @unique
  fullName     String
  position     Json
  bio          Json?
  photoUrl     String?
  photoAlt     Json?
  ieltsScore   String?
  certificates String[]
  experience   Int?     // years
  order        Int      @default(0)
  isPublished  Boolean  @default(true)
  courses      Course[] @relation("CourseTeachers")
}

model SuccessStory {   // IELTS result cards in the teachers carousel
  id           String  @id @default(cuid())
  studentName  String
  overallBand  String  // "8.0"
  scores       Json?   // { listening: "9.0", reading: "8.5", ... }
  imageUrl     String? // TRF scan / branded card
  quote        Json?
  order        Int     @default(0)
  isPublished  Boolean @default(true)
}

model Testimonial {
  id          String  @id @default(cuid())
  authorName  String
  authorRole  Json?
  avatarUrl   String?
  content     Json
  rating      Int     @default(5)
  videoUrl    String?
  sourceLabel String? // Instagram | Telegram | Google
  sourceUrl   String?
  isFeatured  Boolean @default(false)
  isPublished Boolean @default(true)
  order       Int     @default(0)
  @@index([isPublished, order])
}

model FaqCategory {
  id    String @id @default(cuid())
  name  Json
  order Int    @default(0)
  items Faq[]
}

model Faq {
  id          String       @id @default(cuid())
  categoryId  String?
  category    FaqCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  question    Json
  answer      Json
  order       Int          @default(0)
  isPublished Boolean      @default(true)
  @@index([isPublished, order])
}

// ---------- materials ----------
enum MaterialType  { PDF AUDIO VIDEO PHOTO }
enum MaterialLevel { BEGINNER ELEMENTARY PRE_INTERMEDIATE INTERMEDIATE UPPER_INTERMEDIATE ADVANCED IELTS KIDS }

model MaterialGroup {
  id        String     @id @default(cuid())
  name      Json
  type      MaterialType
  order     Int        @default(0)
  materials Material[]
}

model Material {
  id             String        @id @default(cuid())
  title          Json
  description    Json?
  type           MaterialType
  level          MaterialLevel?
  groupId        String?
  group          MaterialGroup? @relation(fields: [groupId], references: [id], onDelete: SetNull)
  fileUrl        String?
  externalUrl    String?       // YouTube etc.
  coverUrl       String?
  fileSize       Int?          // bytes
  meta           Json?         // { pages, durationSec, width, height }
  tags           String[]
  requireContact Boolean       @default(false)
  downloadCount  Int           @default(0)
  isPublished    Boolean       @default(true)
  order          Int           @default(0)
  deletedAt      DateTime?
  createdAt      DateTime      @default(now())
  downloads      MaterialDownload[]
  @@index([type, level, isPublished])
}

model MaterialDownload {
  id         String   @id @default(cuid())
  materialId String
  material   Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  leadId     String?
  ipHash     String?
  createdAt  DateTime @default(now())
  @@index([materialId, createdAt])
}

// ---------- placement test ----------
model TestCategory {
  id             String   @id @default(cuid())
  slug           String   @unique   // level-kids | level-general
  title          Json
  subtitle       Json?
  imageUrl       String?
  timeLimitSec   Int?
  shuffle        Boolean  @default(false)
  allowBack      Boolean  @default(true)
  requireContact Boolean  @default(true)
  isPublished    Boolean  @default(true)
  order          Int      @default(0)
  questions      TestQuestion[]
  bands          TestLevelBand[]
  attempts       TestAttempt[]
}

model TestQuestion {
  id          String       @id @default(cuid())
  categoryId  String
  category    TestCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  prompt      String       // English text; supports two-line dialogue and "_____" gaps
  imageUrl    String?
  audioUrl    String?
  explanation String?
  points      Int          @default(1)
  difficulty  Int          @default(1)  // 1..5
  order       Int          @default(0)
  isActive    Boolean      @default(true)
  options     TestOption[]
  @@index([categoryId, order])
}

model TestOption {
  id         String       @id @default(cuid())
  questionId String
  question   TestQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  text       String
  isCorrect  Boolean      @default(false)
  order      Int          @default(0)
}

model TestLevelBand {
  id          String       @id @default(cuid())
  categoryId  String
  category    TestCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  minScore    Int
  maxScore    Int
  levelName   String       // Beginner / Elementary / ...
  title       Json
  description Json
  courseId    String?
  course      Course?      @relation(fields: [courseId], references: [id], onDelete: SetNull)
  order       Int          @default(0)
  @@index([categoryId, minScore, maxScore])
}

model TestAttempt {
  id           String       @id @default(cuid())
  categoryId   String
  category     TestCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name         String?
  phone        String?
  answers      Json         // [{ questionId, optionId, isCorrect }]
  score        Int
  maxScore     Int
  bandId       String?
  levelName    String?
  durationSec  Int?
  locale       String       @default("uz")
  utm          Json?
  ipHash       String?
  leadId       String?      @unique
  lead         Lead?        @relation(fields: [leadId], references: [id], onDelete: SetNull)
  createdAt    DateTime     @default(now())
  @@index([categoryId, createdAt])
}

// ---------- leads & forms ----------
enum LeadStatus { NEW CONTACTED TRIAL_BOOKED ENROLLED REJECTED SPAM }
enum LeadSource { HERO COURSE_CARD COURSE_PAGE TEST_RESULT MATERIAL_GATE CONTACT_FORM FLOATING_CTA PROMOTION OTHER }

model Lead {
  id           String     @id @default(cuid())
  name         String
  phone        String
  email        String?
  courseId     String?
  course       Course?    @relation(fields: [courseId], references: [id], onDelete: SetNull)
  message      String?
  preferredTime String?
  source       LeadSource @default(OTHER)
  page         String?
  locale       String     @default("uz")
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  utmContent   String?
  utmTerm      String?
  referrer     String?
  userAgent    String?
  ipHash       String?
  status       LeadStatus @default(NEW)
  assignedToId String?
  assignedTo   User?      @relation("LeadAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
  notes        LeadNote[]
  attempt      TestAttempt?
  deletedAt    DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  @@index([status, createdAt])
  @@index([phone])
}

model LeadNote {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  authorId  String?
  body      String
  createdAt DateTime @default(now())
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  email     String?
  subject   String?
  message   String
  isRead    Boolean  @default(false)
  ipHash    String?
  createdAt DateTime @default(now())
  @@index([isRead, createdAt])
}

// ---------- careers ----------
enum ApplicationStatus { NEW REVIEWING INTERVIEW HIRED REJECTED }

model Vacancy {
  id               String   @id @default(cuid())
  slug             String   @unique
  title            Json
  shortDesc        Json
  description      Json?
  responsibilities Json?    // Localized[]
  requirements     Json?    // Localized[]
  conditions       Json?    // Localized[]
  department       Json?
  employmentType   Json?    // "To'liq stavka"
  salaryFrom       Decimal? @db.Decimal(12,2)
  salaryTo         Decimal? @db.Decimal(12,2)
  showSalary       Boolean  @default(false)
  isOpen           Boolean  @default(true)
  order            Int      @default(0)
  applications     JobApplication[]
  @@index([isOpen, order])
}

model HiringStep {
  id          String @id @default(cuid())
  title       Json
  description Json
  order       Int    @default(0)
}

model JobApplication {
  id        String            @id @default(cuid())
  vacancyId String?
  vacancy   Vacancy?          @relation(fields: [vacancyId], references: [id], onDelete: SetNull)
  fullName  String
  phone     String
  email     String?
  birthDate DateTime?
  about     String?
  cvUrl     String?
  status    ApplicationStatus @default(NEW)
  note      String?
  ipHash    String?
  deletedAt DateTime?
  createdAt DateTime          @default(now())
  @@index([status, createdAt])
}

// ---------- blog ----------
model Post {
  id             String    @id @default(cuid())
  slug           String    @unique
  title          Json
  excerpt        Json?
  body           Json      // Localized rich-text HTML
  coverUrl       String?
  tags           String[]
  authorId       String?
  readingMinutes Int?
  seoTitle       Json?
  seoDescription Json?
  isPublished    Boolean   @default(false)
  publishedAt    DateTime?
  viewCount      Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  @@index([isPublished, publishedAt])
}

// ---------- media ----------
model MediaAsset {
  id        String   @id @default(cuid())
  url       String
  key       String   @unique
  mimeType  String
  size      Int
  width     Int?
  height    Int?
  alt       Json?
  folder    String   @default("uploads")
  createdAt DateTime @default(now())
  @@index([folder, createdAt])
}
```

---

## 14. Admin panel specification

Route root `/admin` (not locale-prefixed). Shell: fixed left sidebar (collapsible, grouped nav),
top bar with breadcrumbs, global search (⌘K command palette), locale-preview switcher, theme
toggle, user menu. Mobile: sidebar becomes a sheet.

### Auth

- `/admin/login` — email + password, Credentials provider, bcrypt (cost 12), generic error
  messages, rate limit 5 attempts / 15 min per IP+email, `lastLoginAt` update, audit log entry.
- `middleware.ts` blocks `/admin/*` (except `/admin/login`) without a valid session.
- **Role matrix:**

  | Capability                                 | SUPER_ADMIN | ADMIN | EDITOR | MODERATOR | VIEWER    |
  | ------------------------------------------ | ----------- | ----- | ------ | --------- | --------- |
  | Manage users & settings                    | yes         | yes   | no     | no        | no        |
  | Content CRUD (courses, teachers, pages...) | yes         | yes   | yes    | no        | no        |
  | Publish / unpublish                        | yes         | yes   | yes    | no        | no        |
  | Leads, applications, messages              | yes         | yes   | yes    | yes       | read-only |
  | Test question bank                         | yes         | yes   | yes    | no        | read-only |
  | Delete (soft)                              | yes         | yes   | yes    | no        | no        |
  | Hard delete / restore                      | yes         | yes   | no     | no        | no        |
  | Export CSV                                 | yes         | yes   | yes    | yes       | no        |

  Enforce roles **server-side in every action**, not only by hiding UI.

### Dashboard (`/admin`)

KPI cards: leads today / this week / this month (with % vs previous period), conversion
`NEW -> ENROLLED`, test attempts, material downloads, unread messages, open vacancies.
Charts (Recharts): leads per day (30d line), leads by source (donut), leads by course (bar),
test score distribution (histogram), top downloaded materials (bar).
Lists: 10 latest leads (with quick status change + call/Telegram buttons), 5 latest applications.

### Resource pages

Every resource gets: list (TanStack Table — server-side pagination, sort, text search, filters,
column visibility, row selection, bulk actions), create, edit, soft-delete + restore, and
drag-and-drop reordering where the model has `order` (persist via a single batch action).

Resources and their routes:

```
/admin/leads                 filters: status, source, course, date range, assignee
                             detail drawer: contact, UTM, timeline, notes, status, assignee
                             actions: call/Telegram deep links, export CSV, mark spam, bulk assign
/admin/applications          filters: vacancy, status; CV download; status pipeline (kanban optional)
/admin/messages              inbox view, mark read, reply-by-mail deep link
/admin/tests                 categories -> questions (inline option editor, bulk import/export)
/admin/tests/attempts        table + charts + CSV export
/admin/courses               localized form, price, curriculum builder, teacher multi-select, SEO
/admin/teachers              photo upload with crop (1:1 and 3:4), certificates chips
/admin/success-stories       result cards
/admin/testimonials          text + video, featured toggle, moderation queue
/admin/advantages            icon picker (lucide names)
/admin/problems              with nested solution editor
/admin/promotions            date range picker, prize repeater, live/expired badge
/admin/materials             type/level/group filters, multi-file upload, drag-reorder
/admin/material-groups
/admin/vacancies             + /admin/hiring-steps
/admin/posts                 Tiptap editor, cover, tags, schedule publish
/admin/faq                   + categories
/admin/branches
/admin/navigation            header/footer nav builder, drag-reorder
/admin/home-sections         toggle + reorder homepage sections, edit section titles
/admin/hero                  slides
/admin/stats
/admin/media                 media library: grid, search, folders, alt text, copy URL, delete
/admin/settings              brand, contacts, socials, ticker, analytics ids, telegram, privacy
/admin/users                 SUPER_ADMIN only
/admin/audit                 audit log viewer
```

### Admin UX requirements

- **LocalizedInput / LocalizedTextarea / LocalizedEditor** components with UZ|RU|EN tabs, a
  per-tab filled/empty dot, and "copy from UZ".
- **MediaPicker** modal: pick from library or upload inline; returns `{url, alt}`; shows image
  dimensions and warns above 500 KB.
- **Unsaved-changes guard** on every form (`beforeunload` + route interception).
- **Optimistic UI** with `useOptimistic` where it's safe; toasts via `sonner`.
- **Preview**: every content form has a "Preview" button opening the public page in a new tab in
  draft mode (Next.js Draft Mode) so unpublished changes can be reviewed.
- **Publish flow**: `isPublished` toggle + a "Save as draft" secondary action; on save, call
  `revalidateTag()` for the affected tags so the public site updates within seconds.
- **Empty states** with an illustration + primary action, and skeleton loaders on every table.

---

## 15. API and server actions

Prefer **Server Actions** for admin mutations (they're colocated and typed) and **Route Handlers**
for anything a browser or third party calls directly.

```
POST /api/leads                     { name, phone, courseId?, message?, source, utm..., hp }
POST /api/applications              multipart: fields + cv file
POST /api/contact                   { name, phone?, email?, message, hp }
GET  /api/test/[slug]               -> { category, questions: [{id, prompt, options:[{id,text}]}] }
POST /api/test/[slug]/submit        { answers, name?, phone?, durationSec, utm } -> { score, band, course }
GET  /api/materials/[id]/download   -> 302 to signed URL, increments counters
POST /api/upload                    admin-only, multipart, returns MediaAsset
POST /api/revalidate                secret-guarded, { tags: string[] }
GET  /api/og                        dynamic OG image (title, subtitle params)
```

Every handler: `zod.safeParse` the body -> 422 with field errors on failure; rate limit; sanitize
strings (`isomorphic-dompurify` for any HTML); never echo back internal errors; log with a request id.

Response envelope: `{ ok: true, data }` | `{ ok: false, error: { code, message, fields? } }`.

Caching: read queries wrapped in `unstable_cache` with tags
(`settings`, `courses`, `teachers`, `testimonials`, `faq`, `materials`, `vacancies`, `posts`,
`promotions`, `home`), invalidated by `revalidateTag` inside the corresponding admin action.

---

## 16. SEO, sharing and structured data

- `generateMetadata` on every page from DB values with sensible fallbacks; canonical URLs;
  `alternates.languages` for all three locales.
- **JSON-LD**: `EducationalOrganization` (name, logo, address, telephone, sameAs socials,
  aggregateRating from testimonials), `Course` on course pages, `FAQPage` on the FAQ,
  `BreadcrumbList` on sub-pages, `JobPosting` on vacancy pages, `Article` on blog posts.
- `app/sitemap.ts` generated from the DB (all locales, all published slugs, `lastModified`).
- `app/robots.ts` disallowing `/admin` and `/api`.
- Open Graph + Twitter cards; dynamic OG image route for courses and posts.
- Images: `next/image` everywhere, AVIF+WebP, explicit `sizes`, `priority` only on the hero,
  blur placeholders for DB images (store a `blurDataURL` or use a plaiceholder at upload time).

---

## 17. Security & compliance

- Argon2/bcrypt password hashing; no password ever logged.
- CSRF: Server Actions are protected by Next.js; for Route Handlers verify `Origin`.
- Security headers in `next.config.ts`: `Content-Security-Policy` (allowing only the analytics and
  media hosts actually used), `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`.
- Upload validation: extension **and** MIME **and** magic bytes; max 10 MB docs / 5 MB images /
  200 MB audio-video (stream to storage, don't buffer); randomized keys; never serve user uploads
  from the app origin with an inline `Content-Disposition` for HTML/SVG.
- Store only a **hashed IP** (`sha256(ip + IP_SALT)`) for rate limiting/analytics.
- Personal data: leads/applications visible only to authenticated staff; provide a "delete
  permanently" action for GDPR-style requests; a privacy policy page fed from settings.
- `.env` never committed; ship `.env.example`.

---

## 18. Environment variables (`.env.example`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school?schema=public"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET=""                      # openssl rand -base64 32
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# storage (choose one driver)
STORAGE_DRIVER="local"              # local | s3
S3_ENDPOINT=""  S3_REGION=""  S3_BUCKET=""  S3_ACCESS_KEY_ID=""  S3_SECRET_ACCESS_KEY=""  S3_PUBLIC_URL=""

# notifications
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
RESEND_API_KEY=""
NOTIFY_EMAIL=""

# rate limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# misc
IP_SALT=""
REVALIDATE_SECRET=""
SEED_ADMIN_EMAIL="admin@school.uz"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

---

## 19. Build order — execute in these phases

Complete a phase, run `pnpm build` + lint + the phase's checks, then summarize and pause.

**Phase 1 — Foundation**
Scaffold Next.js 15 + TS + Tailwind v4 + shadcn/ui. ESLint/Prettier. `docker-compose.yml` with
Postgres. Prisma installed and connected. next-intl configured with `/uz|/ru|/en` and middleware.
Theme tokens, fonts, `Button`/`Container`/`Section` primitives. Header + Footer shells reading
from placeholder data. **Check:** all three locales render, header/footer visible, `pnpm build` passes.

**Phase 2 — Data layer**
Full `schema.prisma` from section 13, first migration, `prisma/seed.ts` populating realistic
demo content in **uz/ru/en** (5 courses with the reference prices, 6 teachers, 8 testimonials,
5 advantages, 5 problems+solutions, 6 FAQs, 2 test categories with 45 questions each and level
bands, ~20 materials across the 4 types, 6 vacancies, 5 hiring steps, 1 promotion, 2 branches,
nav items, home sections, settings, and one SUPER_ADMIN user). Typed query helpers in
`server/queries` with `unstable_cache` tags. **Check:** `pnpm db:seed` runs clean; a script
prints seeded counts.

**Phase 3 — Public site**
All homepage sections (7.1-7.17) wired to real queries, then `/courses/[slug]`, `/teachers`,
`/parents-solutions`, `/contact`, `/privacy`. Lead modal + `/api/leads` + Telegram notification.
Animations, marquees, responsive passes at the 5 breakpoints. **Check:** submitting the lead form
creates a row and pings Telegram; Lighthouse mobile >= 90.

**Phase 4 — Placement test**
`/choose-level`, `/tests/[slug]`, the API, scoring, level bands, result screen, attempt storage,
resume-from-localStorage, timer. **Check:** a full 45-question run produces the right band and a
linked lead.

**Phase 5 — Materials & careers**
`/materials` hub, `/materials/[type]` with URL-synced filters and search, gated downloads and
counters. `/join-team`, `/join-team/[slug]`, CV upload, applications API. **Check:** filters
survive a reload; a CV upload lands in storage and the application appears in the DB.

**Phase 6 — Admin panel**
Auth + role guard + layout + dashboard, then every resource from section 14 with the shared
`DataTable`, `LocalizedInput`, `MediaPicker`, drag-reorder, media library, settings, users,
audit log, revalidation on save. **Check:** an editor can change the hero headline, a course
price and a teacher photo and see it live on the public site without a redeploy.

**Phase 7 — Blog, SEO, polish**
Posts + editor + public blog, sitemap/robots/manifest, JSON-LD, OG images, 404/error pages,
loading skeletons, analytics events.

**Phase 8 — Hardening & handover**
Security headers, rate limits, Vitest unit tests for scoring/validation/localization helpers,
Playwright e2e for the three critical flows (lead submit, test completion, admin login + edit +
verify on the public page), Dockerfile + compose for production, and a `README.md` covering local
setup, seeding, env vars, deployment, backups, and "how to add a new content type".

---

## 20. Definition of done

- [ ] `pnpm build` and `pnpm lint` pass with zero errors and zero `any`.
- [ ] Every public string is either in `messages/*.json` or in the DB — grep proves no hardcoded
      Uzbek/Russian content strings in `.tsx` files.
- [ ] All three locales are complete for seeded content; missing translations fall back to `uz`
      instead of rendering empty.
- [ ] Lighthouse mobile: Performance >= 90, A11y >= 95, Best Practices >= 95, SEO >= 95.
- [ ] Keyboard-only walkthrough of the homepage, the test and the admin CRUD works.
- [ ] A staff member with the EDITOR role can change any homepage content and reorder sections.
- [ ] Leads, applications, contact messages and completed tests all arrive in Telegram.
- [ ] `docker compose up` gives a working app + database from a clean machine.
- [ ] README explains everything a new developer needs in under 10 minutes.

---

## 21. Content to seed (from the reference site — translate to ru/en)

**Courses**

| Slug                | Title              | Description                                                                                                           | Duration   | Price         |
| ------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------- | ------------- |
| `kids-english`      | KIDS ENGLISH       | 1-4 darajadan iborat bo'lib Buyuk Britaniyaning MACMILLAN nashriyoti darsliklaridan foydalanib o'tiladi               | 3 oy       | 850 000 UZS   |
| `general-english`   | GENERAL ENGLISH    | Beginner - Upper-Intermediate darajalarini o'z ichiga olib, OXFORD nashriyoti darsliklaridan foydalanib o'tiladi      | 3 oy       | 850 000 UZS   |
| `ielts`             | IELTS              | 350 dan ortiq haqiqiy test materiallari yordamida tayyorlangan, IELTS 7+ kafolatlovchi maxsus dastur, bepul mock test | 3 oy       | 950 000 UZS   |
| `corporate-english` | KORPORATIV ENGLISH | Xodimlarning biznes ingliz tilini jamoaviy o'rganishlari uchun mo'ljallangan B2B o'quv dasturi                        | 8 oy       | 1 000 000 UZS |
| `online-english`    | ONLINE ENGLISH     | Ingliz tilini masofadan ZOOM platformasi orqali o'rganish kursi                                                       | Individual | 1 500 000 UZS |

**Stats:** `4+ yillik tajriba`, `2 500+ mamnun o'quvchilar`, `200+ ijobiy IELTS natijalari`,
`40+ xodimlar soni`.

**Advantages:** IELTS 7+ KAFOLATI · TEZ NATIJADORLIK · TALABCHAN USTOZLAR · QIZIQARLI DARS
USLUBI · DO'STONA MUHIT.

**Problems:** SO'Z YODLASH · RAVON SO'ZLAY OLMASLIK · ESHITIB ANGLAY OLMASLIK · O'QIB TUSHUNA
OLMASLIK · MATN TUZA OLMASLIK — each paired with a solution mapped to a `Skill`.

**Vacancies:** Administrator · Academic Support · ESL/IELTS instructor · Grafik dizayner ·
Kassir · Ambassador.

**Ticker:** `Founders School` · `Ishonchli ta'lim` · `Malakali ustozlar` · `Unutilmas darslar`.

**FAQ (seed at least these five):**

1. Ingliz tilini noldan qancha muddatda o'rganish mumkin?
2. Darslar qanday formatda o'tiladi?
3. O'quv markazda kimlar dars beradi?
4. Darslarga qanday yozilish mumkin?
5. Sinov darsi bepulmi?

**Contact:** phones `71 205-03-33`, `71 205-53-33`; socials: Telegram, Instagram, YouTube, email;
Yandex Maps link for the branch.

> **Branding:** do not copy the reference school's logo, name, photos or exact review texts
> into production. Seed with placeholder brand assets and the school's own real content before
> launch. The structure, layout and copy patterns above are the specification; the brand is not.
