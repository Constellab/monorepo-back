#!/bin/bash
#
# Copies the objects listed by 05-s3-keys.sql from the old object storage
# to the new one, bucket by bucket. A line whose key ends with "/" is a
# prefix and is copied whole — that is how 05-s3-keys.sql lists the lab
# backups. Several lists can be passed at once.
#
# Only needed when the new instance uses another object storage than the
# source. When it keeps using the same buckets — with its own credentials
# on them — the objects are already where the rows say, and this step and
# 05-s3-keys.sql are skipped.
#
# Needs rclone, with one remote per endpoint and per set of keys: each
# region of each provider is its own endpoint, and the image buckets use
# the OBJECT_STORAGE_DEFAULT_* keys of each instance rather than a
# `bucket_credentials` row. For example, one region on both sides:
#
#   rclone config create src-region s3 provider=Other region=<region> \
#       endpoint=https://<endpoint> access_key_id=... secret_access_key=...
#   rclone config create dst-region s3 provider=Other region=<region> \
#       endpoint=https://<endpoint> access_key_id=... secret_access_key=...
#
# Usage:
#   ./06-copy-s3.sh keys.tsv
#
# Fill in BUCKETS below, one line per source bucket found in keys.tsv:
#
#   ["<source bucket>"]="<source remote> <target remote>:<target bucket>"
#
set -euo pipefail

[ "$#" -gt 0 ] || set -- keys.tsv
for KEYS in "$@"; do
    [ -f "$KEYS" ] || { echo "no such file: $KEYS" >&2; exit 1; }
done

declare -A BUCKETS=(
    ["SOURCE_FOLDER_BUCKET"]="src-region dst-region:TARGET_FOLDER_BUCKET"
    ["SOURCE_LAB_BACKUP_BUCKET"]="src-region dst-region:TARGET_LAB_BACKUP_BUCKET"
    ["SOURCE_BUCKET_USER_PROFILE_PICTURE"]="src-default dst-default:TARGET_BUCKET_USER_PROFILE_PICTURE"
    ["SOURCE_BUCKET_SPACE_IMAGE"]="src-default dst-default:TARGET_BUCKET_SPACE_IMAGE"
)

RCLONE_OPTS=(--transfers 16 --checkers 32 --retries 3)

WORK="${WORK:-./s3-lists}"
rm -rf "$WORK" && mkdir -p "$WORK"
awk -F'\t' -v w="$WORK" '
    NF == 2 && $2 ~ /\/$/ { print $2 > (w "/" $1 ".prefixes"); next }
    NF == 2                { print $2 > (w "/" $1 ".txt") }' "$@"

echo "==> buckets found in $*:"
for name in $(ls "$WORK" | sed -E 's/\.(txt|prefixes)$//' | sort -u); do
    if [ -n "${BUCKETS[$name]+set}" ]; then
        read -r src_remote dst <<< "${BUCKETS[$name]}"
        echo "    $src_remote:$name -> $dst"
    else
        echo "    $name -> NOT MAPPED, its objects will not be copied" >&2
        unmapped=1
    fi
done
if [ "${unmapped:-0}" = 1 ]; then
    echo
    echo "Add the missing entries to BUCKETS, or confirm you meant to skip them." >&2
    read -r -p "continue anyway? [y/N] " answer
    [ "$answer" = y ] || exit 1
fi

for name in "${!BUCKETS[@]}"; do
    list="$WORK/$name.txt"
    prefixes="$WORK/$name.prefixes"
    if [ ! -f "$list" ] && [ ! -f "$prefixes" ]; then
        echo "==> $name: nothing to copy"
        continue
    fi
    read -r src_remote dst <<< "${BUCKETS[$name]}"
    src="$src_remote:$name"
    if [ -f "$list" ]; then
        echo "==> $src -> $dst ($(wc -l < "$list") objects)"
        rclone copy "$src" "$dst" --files-from "$list" "${RCLONE_OPTS[@]}" --progress
    fi
    if [ -f "$prefixes" ]; then
        while read -r prefix; do
            echo "==> $src/$prefix -> $dst/$prefix"
            rclone copy "$src/$prefix" "$dst/$prefix" "${RCLONE_OPTS[@]}" --progress
        done < "$prefixes"
    fi
done

echo
echo "==> checking what landed"
for name in "${!BUCKETS[@]}"; do
    read -r src_remote dst <<< "${BUCKETS[$name]}"
    src="$src_remote:$name"
    list="$WORK/$name.txt"
    if [ -f "$list" ]; then
        missing=$(rclone check "$src" "$dst" --files-from "$list" \
            --one-way --combined - 2>/dev/null | grep -c '^-' || true)
        echo "    $dst: $(wc -l < "$list") expected, $missing missing"
    fi
    prefixes="$WORK/$name.prefixes"
    if [ -f "$prefixes" ]; then
        while read -r prefix; do
            missing=$(rclone check "$src/$prefix" "$dst/$prefix" \
                --one-way --combined - 2>/dev/null | grep -c '^-' || true)
            echo "    $dst/$prefix: $missing missing"
        done < "$prefixes"
    fi
done
