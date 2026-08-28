#!/usr/bin/env bash

# Registers one plugin in the public marketplace manifest, from its own plugin.json.
#
# Copying `plugins/<name>/` is not publishing. A plugin absent from `plugins[]` in
# marketplace.json is installable by no name at all — the folder is there, the loader never
# looks at it, and nothing reports the gap. It has bitten twice: the community plugin's files
# landed a release before its entry did, and `space` shipped its folder while the manifest
# still offered only `datalab`. So the entry is written from the manifest that already carries
# the truth, in the same commit as the files.
#
# `name` and `description` come from plugin.json, so a reworded description reaches the
# marketplace without a second edit. `source` is derived and keeps its `./` prefix — the
# loader validates it as `startsWith("./")` and rejects a bare path with "source: Invalid
# input".
#
# It only ever writes this plugin's entry. Other plugins' entries, and every other field of
# the manifest — `renames` included — are left exactly as they are: a rename or a removal is
# a hand edit in the public repository, not something a release should infer.
#
# Usage: register_plugin.sh <plugin_dir> <marketplace_json>

set -euo pipefail

plugin_dir=$1
marketplace=$2

name=$(jq -r .name "$plugin_dir/.claude-plugin/plugin.json")
description=$(jq -r .description "$plugin_dir/.claude-plugin/plugin.json")

if [ -z "$name" ] || [ "$name" = "null" ]; then
  echo "::error::$plugin_dir/.claude-plugin/plugin.json has no name."
  exit 1
fi

# Filter-then-append rather than an in-place update: it writes the same result whether the entry
# existed or not, so a first publish and a re-publish take one code path. Sorted by name because
# append alone would move whichever plugin published last to the end, and two applications
# releasing in turn would trade places in the diff forever.
#
# jq reformats the whole file. Expect one whitespace-only diff the first time it runs over a
# hand-written manifest, and none after: its output is its own fixed point.
jq --arg name "$name" \
   --arg description "$description" \
   '.plugins = (((.plugins // []) | map(select(.name != $name)))
               + [{name: $name, source: ("./plugins/" + $name), description: $description}]
               | sort_by(.name))' \
   "$marketplace" > "$marketplace.new"

if diff -q "$marketplace" "$marketplace.new" > /dev/null; then
  rm "$marketplace.new"
  echo "$name: already registered in $(basename "$marketplace")"
else
  mv "$marketplace.new" "$marketplace"
  echo "$name: registered in $(basename "$marketplace")"
fi
