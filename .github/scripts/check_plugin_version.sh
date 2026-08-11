#!/usr/bin/env bash

# Fails when a plugin's content moved but its `version` did not.
#
# `version` in plugin.json is the only signal a client uses to refresh its cached copy. Content
# that moved without a bump would publish and reach nobody, which is worse than not publishing:
# the repository says one thing and every install says another.
#
# Called from two jobs on purpose. `validate` runs it on the pull request, where the bump is one
# line in a file already open for review; `publish` runs it again before pushing, as the last
# gate for workflow_dispatch and for anything that reached a tag without passing through a pull
# request. One script, so the two cannot drift.
#
# Usage: check_plugin_version.sh <plugin_dir> <published_dir>
#
# A published_dir that does not exist means a first publish: nothing to compare, any version
# passes. Exports PLUGIN_VERSION through GITHUB_ENV when running under Actions.

set -euo pipefail

plugin_dir=$1
published_dir=$2
plugin_name=$(basename "$published_dir")

new_version=$(jq -r .version "$plugin_dir/.claude-plugin/plugin.json")

if [ -d "$published_dir" ] && ! diff -r -q "$plugin_dir" "$published_dir" > /dev/null; then
  old_version=$(jq -r .version "$published_dir/.claude-plugin/plugin.json")
  if [ "$new_version" = "$old_version" ]; then
    # The file list comes first: "something changed" is not actionable until you know which
    # file, and a reader who expected no change at all needs to see it to believe it.
    echo "Published $plugin_name $old_version differs from this checkout:"
    diff -r -q "$plugin_dir" "$published_dir" || true
    echo "::error::$plugin_name changed but its version is still $new_version." \
         "Bump version in $plugin_dir/.claude-plugin/plugin.json — without it, installed" \
         "clients keep the cached copy."
    exit 1
  fi
  echo "$plugin_name: content changed, version $old_version -> $new_version"
elif [ -d "$published_dir" ]; then
  echo "$plugin_name: content matches the published copy at $new_version"
else
  echo "$plugin_name: not published yet, first publish at $new_version"
fi

if [ -n "${GITHUB_ENV:-}" ]; then
  echo "PLUGIN_VERSION=$new_version" >> "$GITHUB_ENV"
fi
