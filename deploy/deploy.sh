#!/usr/bin/env bash
#
# Ships the current checkout to the production host in one command.
#
#   ./deploy/deploy.sh
#
# The image is built here rather than on the server: that box has ~1 GB of free
# RAM and no swap, and `next build` does not fit. Since both machines are arm64
# the image is copied over as-is.
#
# Secrets are never sent. They live in $REMOTE_PATH/.env on the server, written
# once by hand; this script only reads it there to start the stack.
#
# Override any of these from the environment:
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-root@46.225.113.117}"
REMOTE_PATH="${REMOTE_PATH:-/opt/renessans-lc}"
SITE_URL="${SITE_URL:-https://renessans-lc.uz}"
APP_PORT="${APP_PORT:-3020}"
IMAGE="${IMAGE:-renessans-school:prod}"
PLATFORM="${PLATFORM:-linux/arm64}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

bold() { printf '\n\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\033[31m%s\033[0m\n' "$*" >&2; exit 1; }

ssh_do() { ssh -o BatchMode=yes "$REMOTE_HOST" "$@"; }

# ---------------------------------------------------------------- checks ----
bold "1/7  Tekshiruvlar"
command -v docker >/dev/null || fail "docker topilmadi"
ssh_do 'true' 2>/dev/null || fail "SSH ishlamadi: $REMOTE_HOST"
ssh_do "test -f $REMOTE_PATH/.env" || fail "$REMOTE_PATH/.env serverda yo'q — avval qo'lda yarating"

if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "  diqqat: commit qilinmagan o'zgarishlar bor — o'sha holat deploy qilinadi"
fi
echo "  server : $REMOTE_HOST:$REMOTE_PATH"
echo "  domen  : $SITE_URL"
echo "  commit : $(git rev-parse --short HEAD 2>/dev/null || echo '?')"

# ----------------------------------------------------------------- build ----
bold "2/7  Image yig'ish ($PLATFORM)"
# NEXT_PUBLIC_SITE_URL is baked in at build time, so the domain must be correct
# here — changing it later needs a rebuild, not just an env change.
docker build \
  --platform "$PLATFORM" \
  --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" \
  -t "$IMAGE" .

# -------------------------------------------------------------- rollback ----
bold "3/7  Joriy versiyani zaxiraga olish"
# Keep what is running as :previous so a bad deploy can be undone in seconds.
if ssh_do "docker image inspect $IMAGE" >/dev/null 2>&1; then
  ssh_do "docker tag $IMAGE renessans-school:previous"
  echo "  zaxira: renessans-school:previous"
else
  echo "  birinchi deploy — zaxira yo‘q"
fi

# ------------------------------------------------------------------ ship ----
bold "4/7  Serverga yuborish"
docker save "$IMAGE" | gzip -1 | ssh -o BatchMode=yes "$REMOTE_HOST" 'gunzip | docker load' | tail -1
scp -q deploy/docker-compose.server.yml "$REMOTE_HOST:$REMOTE_PATH/docker-compose.yml"

# ----------------------------------------------------------------- start ----
bold "5/7  Ishga tushirish"
# Migrations run from the container entrypoint (RUN_MIGRATIONS=true).
ssh_do "cd $REMOTE_PATH && docker compose --env-file .env up -d" 2>&1 | sed 's/^/  /'

# --------------------------------------------------------------- warm up ----
# The image is built without a database (see the Dockerfile), so every
# prerendered page ships empty and fills in from the database on its first
# request. Without this the first real visitor after a deploy gets the empty
# copy: ISR serves the stale page and regenerates behind it, so each path is
# fetched twice — once to trigger the rebuild, once to confirm it took.
bold "6/7  Keshni bekor qilish va sahifalarni isitish"
# Purge first. A page prerendered by the build is *fresh*, not stale, so ISR
# will not regenerate it for the whole revalidate window — warming alone would
# just fetch the empty copy twice. /api/revalidate drops every known tag, which
# marks the pages stale so the fetches below actually rebuild them.
secret=$(ssh_do "grep '^REVALIDATE_SECRET=' $REMOTE_PATH/.env | cut -d= -f2" | tr -d '\r')
if [ -n "$secret" ]; then
  ssh_do "curl -s -o /dev/null -X POST -H 'Content-Type: application/json' -H 'x-revalidate-secret: $secret' -d '{}' http://127.0.0.1:$APP_PORT/api/revalidate --max-time 20" || true
  echo "  kesh teglari bekor qilindi"
else
  echo "  diqqat: REVALIDATE_SECRET yo'q, kesh bekor qilinmadi"
fi

WARM_PATHS="/uz /ru /en /uz/choose-level /uz/teachers /uz/materials /uz/blog /uz/contact /uz/join-team /uz/tests/level-kids /uz/tests/level-general /uz/tests/learning-style /uz/tests/temperament"
warm=0
for path in $WARM_PATHS; do
  for _ in 1 2; do
    ssh_do "curl -s -o /dev/null -H 'Host: ${SITE_URL#https://}' http://127.0.0.1:$APP_PORT$path --max-time 20" || true
  done
  warm=$((warm + 1))
done
echo "  $warm ta sahifa isitildi"

# --------------------------------------------------------------- verify -----
bold "7/7  Tekshirish"
ok=0
for _ in $(seq 1 30); do
  code=$(ssh_do "curl -s -o /dev/null -w '%{http_code}' -H 'Host: ${SITE_URL#https://}' http://127.0.0.1:$APP_PORT/uz --max-time 10" 2>/dev/null || true)
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 3
done

if [ "$ok" != "1" ]; then
  printf '\033[31m  sayt javob bermadi (oxirgi kod: %s) — orqaga qaytarilmoqda\033[0m\n' "${code:-000}"
  ssh_do "docker image inspect renessans-school:previous >/dev/null 2>&1 \
    && docker tag renessans-school:previous $IMAGE \
    && cd $REMOTE_PATH && docker compose --env-file .env up -d" 2>&1 | sed 's/^/  /'
  fail "Deploy bekor qilindi, eski versiya tiklandi. Loglar: ssh $REMOTE_HOST 'docker logs renessans_app --tail 50'"
fi

echo "  ilova       : 200 OK (127.0.0.1:$APP_PORT)"
containers=$(ssh_do "docker ps --filter name=renessans --format '{{.Names}} {{.Status}}'" \
  | awk '{ lines = lines sep $0; sep = " | " } END { print lines }')
echo "  konteynerlar: $containers"
public=$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL/uz" --max-time 15 2>/dev/null) || true
public="${public:-000}"
if [ "$public" = "200" ]; then
  echo "  ommaviy URL : $SITE_URL — 200 OK"
else
  echo "  ommaviy URL : $SITE_URL hali javob bermayapti (kod $public) — DNS/sertifikat kutilyapti"
fi

bold "Tayyor."
