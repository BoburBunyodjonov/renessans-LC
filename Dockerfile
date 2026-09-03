# syntax=docker/dockerfile:1

###############################################################################
# deps — install with the lockfile only, so this layer caches well
###############################################################################
FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# `postinstall` runs `prisma generate`, which needs the schema above.
RUN pnpm install --frozen-lockfile

###############################################################################
# builder — compile the Next.js standalone output
###############################################################################
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The build prerenders pages from the database when it can reach one. Without
# DATABASE_URL the queries fall back to empty results and the pages fill in at
# runtime through ISR, so the image still builds in a network-isolated CI.
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

###############################################################################
# runner — minimal runtime image
###############################################################################
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl && corepack enable
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Standalone output carries its own trimmed node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Migrations run from this image on deploy. Only the pinned CLI is installed —
# copying pnpm's store instead would add ~1.5 GB to the image.
ARG PRISMA_VERSION=6.19.3
RUN npm install -g prisma@${PRISMA_VERSION} && npm cache clean --force
# `prisma.config.ts` is deliberately not copied: it loads dotenv for local DX,
# which the runtime image does not carry. In the container the CLI reads
# DATABASE_URL straight from the environment.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Local-driver uploads live here; mount a volume so they survive a redeploy.
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/uz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# `RUN_MIGRATIONS=true` applies pending migrations before the server starts,
# which suits single-instance deploys; leave it unset and run
# `prisma migrate deploy` as a separate step when running several replicas.
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
