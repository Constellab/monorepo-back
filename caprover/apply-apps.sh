#!/bin/bash
#
# Applies a caprover-apps.<customer>.json file to a CapRover instance.
#
# Creates the missing apps, then writes for each one: environment variables, volumes,
# port, SSL and extra domains.
#
# It deploys the pinned infrastructure images (redis, the two MariaDB, adminer) because
# those versions are constants. It does NOT deploy the four product images: theirs is a
# decision, taken in step 7 of NEW_INSTANCE.md.
#
# Safe to re-run: fixing a value and running it again breaks nothing.
#
# Usage:
#   ./apply-apps.sh caprover-apps.acme.json              # dry-run, writes nothing
#   ./apply-apps.sh caprover-apps.acme.json --apply      # writes to the instance
#   ./apply-apps.sh caprover-apps.acme.json --apply space-api community-api
#
# The CapRover password is read from stdin, or from $CAPROVER_PASSWORD.
#
set -euo pipefail
CONFIG="${1:-}"
if [ -z "$CONFIG" ] || [ ! -f "$CONFIG" ]; then
    echo "Usage: $0 <config.json> [--apply] [appName...]" >&2
    exit 1
fi
shift
APPLY=false
ONLY=()
for arg in "$@"; do
    case "$arg" in
        --apply) APPLY=true ;;
        -*) echo "Unknown option: $arg" >&2; exit 1 ;;
        *) ONLY+=("$arg") ;;
    esac
done
command -v jq >/dev/null || { echo "jq is required." >&2; exit 1; }
command -v curl >/dev/null || { echo "curl is required." >&2; exit 1; }
# --- Resolving ${VAR} --------------------------------------------------------
# split/join is a literal replacement, not a regex, so a value containing $, \ or
# parentheses passes through untouched.
#
# Keys in 'vars' may reference each other, so we loop to a fixed point, at most 10
# passes so a circular reference cannot spin forever.
resolve() {
    jq '
      def subst($vars):
        walk(
          if type == "string"
          then reduce ($vars | to_entries[]) as $v (.; split("${" + $v.key + "}") | join($v.value))
          else . end
        );
      def fixpoint($n):
        if $n == 0 then .
        else . as $before
             | ($before.vars) as $v
             | (.vars |= subst($v))
             | if . == $before then . else fixpoint($n - 1) end
        end;
      fixpoint(10)
      | . as $doc
      | $doc | subst($doc.vars)
      | del(.vars)
      | del(._README)
    ' "$CONFIG"
}
RESOLVED="$(resolve)"
# --- Guards ------------------------------------------------------------------
UNRESOLVED="$(printf '%s' "$RESOLVED" | grep -o '\${[A-Z0-9_]*}' | sort -u || true)"
if [ -n "$UNRESOLVED" ]; then
    echo "ERROR: these variables are not defined in 'vars':" >&2
    printf '  %s\n' $UNRESOLVED >&2
    exit 1
fi
TODO="$(printf '%s' "$RESOLVED" | grep -c 'FILL_ME' || true)"
if [ "$TODO" != "0" ]; then
    echo "ERROR: $TODO value(s) still at FILL_ME in $CONFIG." >&2
    printf '%s' "$RESOLVED" | grep -n 'FILL_ME' | head -20 >&2
    exit 1
fi
CAPROVER_URL="$(printf '%s' "$RESOLVED" | jq -r '.instance.caproverUrl')"
echo "Instance : $CAPROVER_URL"
echo "Mode     : $([ "$APPLY" = true ] && echo 'APPLY (writes)' || echo 'dry-run (read only)')"
echo
# --- App selection -----------------------------------------------------------
if [ ${#ONLY[@]} -gt 0 ]; then
    FILTER="$(printf '%s\n' "${ONLY[@]}" | jq -R . | jq -s .)"
    RESOLVED="$(printf '%s' "$RESOLVED" | jq --argjson only "$FILTER" '.apps |= map(select(.appName as $n | $only | index($n)))')"
fi
APP_NAMES="$(printf '%s' "$RESOLVED" | jq -r '.apps[].appName')"
echo "Apps : $(echo $APP_NAMES | tr '\n' ' ')"
echo
# --- Dry-run: show and stop --------------------------------------------------
if [ "$APPLY" != true ]; then
    printf '%s' "$RESOLVED" | jq '.apps[] | {
        appName,
        image,
        containerHttpPort,
        notExposeAsWebApp,
        forceSsl,
        websocketSupport,
        hasPersistentData,
        volumes,
        customDomain,
        envVarCount: (.envVars | length),
        envVars: (.envVars | with_entries(
            .value |= (if (.|length) > 12 then .[0:6] + "…(" + ((.|length)|tostring) + ")" else . end)))
    }'
    echo
    echo "Dry-run done. Run again with --apply to write."
    exit 0
fi
# --- Login -------------------------------------------------------------------
if [ -z "${CAPROVER_PASSWORD:-}" ]; then
    read -rs -p "CapRover password ($CAPROVER_URL): " CAPROVER_PASSWORD; echo
fi
TOKEN="$(curl -sS "$CAPROVER_URL/api/v2/login" \
    -H 'x-namespace: captain' \
    -H 'content-type: application/json' \
    --data-raw "$(jq -n --arg p "$CAPROVER_PASSWORD" '{password:$p}')" \
    | jq -r '.data.token // empty')"
if [ -z "$TOKEN" ]; then
    echo "ERROR: CapRover login refused." >&2
    exit 1
fi
api() {
    # api <METHOD> <path> [json-body]
    local method="$1" path="$2" body="${3:-}"
    if [ -n "$body" ]; then
        curl -sS -X "$method" "$CAPROVER_URL$path" \
            -H 'x-namespace: captain' -H "x-captain-auth: $TOKEN" \
            -H 'content-type: application/json' --data-raw "$body"
    else
        curl -sS -X "$method" "$CAPROVER_URL$path" \
            -H 'x-namespace: captain' -H "x-captain-auth: $TOKEN"
    fi
}
check() {
    # check <json response> <label>  -> fails when status is not 100
    local status
    status="$(printf '%s' "$1" | jq -r '.status // "?"')"
    if [ "$status" != "100" ]; then
        echo "  FAILED ($2): $(printf '%s' "$1" | jq -rc '.description // .')" >&2
        return 1
    fi
}
EXISTING="$(api GET /api/v2/user/apps/appDefinitions | jq -r '.data.appDefinitions[].appName')"
# --- One pass per app --------------------------------------------------------
for name in $APP_NAMES; do
    echo "== $name"
    APP="$(printf '%s' "$RESOLVED" | jq --arg n "$name" '.apps[] | select(.appName == $n)')"
    persistent="$(printf '%s' "$APP" | jq -r '.hasPersistentData')"
    if ! grep -qx "$name" <<<"$EXISTING"; then
        echo "  creating"
        resp="$(api POST /api/v2/user/apps/appDefinitions/register \
            "$(jq -n --arg n "$name" --argjson p "$persistent" \
                '{appName:$n, projectId:"", hasPersistentData:$p}')")"
        check "$resp" "register" || exit 1
    else
        echo "  already exists, updating"
    fi
    # Full definition. CapRover expects exactly the shape GET appDefinitions returns,
    # hence the explicit neutral fields.
    DEF="$(printf '%s' "$APP" | jq '{
        appName,
        instanceCount: 1,
        captainDefinitionRelativeFilePath: "./captain-definition",
        notExposeAsWebApp,
        forceSsl,
        websocketSupport,
        containerHttpPort,
        description: (._role // ""),
        envVars: (.envVars | to_entries | map({key: .key, value: .value})),
        volumes: (.volumes // []),
        ports: [],
        nodeId: "",
        preDeployFunction: "",
        serviceUpdateOverride: (.serviceUpdateOverride // ""),
        redirectDomain: "",
        tags: [],
        appDeployTokenConfig: {enabled: false},
        appPushWebhook: {}
    }')"
    # CapRover refuses `forceSsl: true` on an app that has no SSL-enabled domain yet,
    # and a certificate can only be requested once the app exists. So the definition goes
    # in twice: first with forceSsl off, then again below, once the certificates are there.
    FORCE_SSL="$(printf '%s' "$APP" | jq -r '.forceSsl')"

    resp="$(api POST /api/v2/user/apps/appDefinitions/update \
        "$(printf '%s' "$DEF" | jq '.forceSsl = false')")"
    check "$resp" "update" || exit 1
    echo "  config written ($(printf '%s' "$APP" | jq '.envVars | length') variables)"
    # Pinned infrastructure images deploy from here. The four product images say
    # "skip": their version is a decision, taken in step 7.
    IMAGE="$(printf '%s' "$APP" | jq -r '.image // "skip"')"
    if [ "$IMAGE" != "skip" ] && [ "$IMAGE" != "null" ]; then
        DEF_CONTENT="$(jq -n --arg i "$IMAGE" '{schemaVersion: 2, imageName: $i}' | jq -c .)"
        resp="$(api POST "/api/v2/user/apps/appData/$name" \
            "$(jq -n --arg c "$DEF_CONTENT" '{captainDefinitionContent: $c, gitHash: ""}')")"
        check "$resp" "deploy $IMAGE" || exit 1
        echo "  deploying $IMAGE"
    fi
    # SSL on the CapRover subdomain, for exposed apps only.
    if [ "$(printf '%s' "$APP" | jq -r '.notExposeAsWebApp')" = "false" ]; then
        resp="$(api POST /api/v2/user/apps/appDefinitions/enablebasedomainssl \
            "$(jq -n --arg n "$name" '{appName:$n}')")"
        check "$resp" "enablebasedomainssl" || echo "  (base domain SSL not enabled, do it in the UI)"
    fi
    # Extra domains.
    for domain in $(printf '%s' "$APP" | jq -r '.customDomain[]?.publicDomain'); do
        resp="$(api POST /api/v2/user/apps/appDefinitions/customdomain \
            "$(jq -n --arg n "$name" --arg d "$domain" '{appName:$n, customDomain:$d}')")"
        check "$resp" "customdomain $domain" || true
        wantSsl="$(printf '%s' "$APP" | jq -r --arg d "$domain" '.customDomain[] | select(.publicDomain==$d) | .hasSsl')"
        if [ "$wantSsl" = "true" ]; then
            resp="$(api POST /api/v2/user/apps/appDefinitions/enablecustomdomainssl \
                "$(jq -n --arg n "$name" --arg d "$domain" '{appName:$n, customDomain:$d}')")"
            check "$resp" "enablecustomdomainssl $domain" \
                || echo "  (no certificate for $domain: has DNS propagated?)"
        else
            echo "  $domain added without SSL (certificate managed outside CapRover, see CAPROVER_CERTIFICATES.md)"
        fi
    done

    # Second pass, now that a certificate exists. A failure here is not fatal: it means
    # no certificate was issued, which the messages above have already reported.
    if [ "$FORCE_SSL" = "true" ]; then
        resp="$(api POST /api/v2/user/apps/appDefinitions/update "$DEF")"
        check "$resp" "forceSsl" \
            && echo "  HTTPS forced" \
            || echo "  (HTTPS not forced: no certificate on this app yet, re-run once there is one)"
    fi
done
echo
echo "Done. Next: deploy the images (NEW_INSTANCE.md, step 7)."
