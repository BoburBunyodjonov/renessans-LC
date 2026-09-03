#!/bin/sh
set -e

# Applies pending migrations before the server starts, which suits a single
# instance. With several replicas, leave RUN_MIGRATIONS unset and run
# `prisma migrate deploy` once as a separate deploy step.
if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "> applying database migrations"
  prisma migrate deploy --schema ./prisma/schema.prisma
fi

# Seeding needs tsx and the seed sources, which only the repo has:
#   pnpm db:seed   (from a checkout, pointed at the same DATABASE_URL)

exec "$@"
