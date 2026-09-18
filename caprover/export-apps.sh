#!/bin/bash
#
# Exports the full app definitions of a CapRover instance.
#
# Two uses:
#   - start from an existing instance to fill in a caprover-apps.<customer>.json
#   - read back what an instance really holds after running apply-apps.sh
#
# Usage:
#   ./export-apps.sh https://captain.constellab-pre-prod.gencovery.com > apps-raw.json
#   ./export-apps.sh https://captain.<root> --env space-api   # just one app's env vars
#
# The output contains plaintext secrets. Do not commit it.
#
set -euo pipefail

HOST="${1:-}"
if [ -z "$HOST" ]; then
    echo "Usage: $0 <https://captain.domain> [--env <appName>]" >&2
    exit 1
fi
shift

MODE="full"
APP=""
if [ "${1:-}" = "--env" ]; then
    MODE="env"
    APP="${2:?--env needs an app name}"
fi

if [ -z "${CAPROVER_PASSWORD:-}" ]; then
    read -rs -p "CapRover password ($HOST): " CAPROVER_PASSWORD; echo >&2
fi

TOKEN="$(curl -sS "$HOST/api/v2/login" \
    -H 'x-namespace: captain' \
    -H 'content-type: application/json' \
    --data-raw "$(jq -n --arg p "$CAPROVER_PASSWORD" '{password:$p}')" \
    | jq -r '.data.token // empty')"

[ -n "$TOKEN" ] || { echo "ERROR: CapRover login refused." >&2; exit 1; }

DEFS="$(curl -sS "$HOST/api/v2/user/apps/appDefinitions" \
    -H 'x-namespace: captain' -H "x-captain-auth: $TOKEN" \
    | jq '.data.appDefinitions')"

if [ "$MODE" = "env" ]; then
    printf '%s' "$DEFS" | jq -r --arg a "$APP" \
        '.[] | select(.appName == $a) | .envVars[] | "\(.key)=\(.value)"'
else
    printf '%s\n' "$DEFS"
fi
