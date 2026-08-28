#!/usr/bin/env bash

# Fails when a plugin manifest and the API constants that describe it disagree.
#
# An API serves the command lines that install its own plugin (`GET mcp/install`), so several
# strings exist on both sides of a boundary the compiler cannot see: the plugin's name, the
# `userConfig` key the install command passes, and the endpoint path the plugin connects to.
# Each drifts silently in its own way — plugin-not-found, a `--config` key the CLI rejects, or
# a client connecting to a path nothing serves — and none of them fails until someone installs
# it. There is no import to keep them equal, so this is the import.
#
# Jest does not run in CI, so this is the guard, not a test. It runs on each plugin's publish
# workflow, whose pull-request paths include that application's constants file for that reason:
# an edit to either side has to reach it.
#
# The constant names are arguments because each application names its own: `CN_MCP_PLUGIN_NAME`
# beside `CN_MCP_SPACE_API_RESOURCE_PATH`, `HN_MCP_PLUGIN_NAME` beside
# `HN_MCP_COMMUNITY_DOC_RESOURCE_PATH`. Passing them beats deriving them from a prefix: the
# Space API's constants file declares two resource paths, and a pattern would have to guess.
#
# Usage: check_plugin_constants.sh <plugin_json> <constants_ts> \
#          <plugin_name_const> <config_key_const> <resource_path_const>

set -euo pipefail

plugin_json=$1
constants_ts=$2
plugin_name_const=$3
config_key_const=$4
resource_path_const=$5

# Single-quoted single-line `export const NAME = '...';`, which is how these constants files
# write every one of these. A constant reformatted onto two lines reads as empty here and fails
# the emptiness check below rather than passing silently.
constant_value() {
  sed -n "s/^export const $1 = '\(.*\)';\$/\1/p" "$constants_ts"
}

fail() {
  echo "::error file=$constants_ts::$*"
  exit 1
}

plugin_name=$(jq -r .name "$plugin_json")
config_key=$(jq -r '.userConfig | keys[0]' "$plugin_json")
server_url=$(jq -r '.mcpServers | to_entries[0].value.url' "$plugin_json")

const_name=$(constant_value "$plugin_name_const")
const_config_key=$(constant_value "$config_key_const")
const_resource_path=$(constant_value "$resource_path_const")

[ -n "$const_name" ] || fail "$plugin_name_const not found. Expected a single-line export."
[ -n "$const_config_key" ] || fail "$config_key_const not found. Expected a single-line export."
[ -n "$const_resource_path" ] || fail "$resource_path_const not found. Expected a single-line export."

if [ "$const_name" != "$plugin_name" ]; then
  fail "$plugin_name_const is '$const_name' but $plugin_json declares name '$plugin_name'." \
       "The install command the API serves would name a plugin the marketplace does not have."
fi

# `userConfig` carries the one key the install command passes. Compared by name and by count:
# a second key would be a value the API has to supply and does not know it has to.
declared_keys=$(jq -r '.userConfig | keys | length' "$plugin_json")
if [ "$declared_keys" != "1" ] || [ "$const_config_key" != "$config_key" ]; then
  fail "$config_key_const is '$const_config_key' but $plugin_json declares" \
       "userConfig keys: $(jq -c '.userConfig | keys' "$plugin_json")." \
       "\`claude plugin install --config <key>=\` is refused for a key the manifest does not declare."
fi

# The plugin's server URL is the API's own endpoint path, joined to the configured base URL.
# Checking the whole string covers the path and the interpolation of the key in one comparison.
expected_url="\${user_config.$const_config_key}/$const_resource_path"
if [ "$server_url" != "$expected_url" ]; then
  fail "The plugin connects to '$server_url' but this API mounts '$expected_url'." \
       "A client would call a path nothing serves."
fi

echo "plugin constants agree with $plugin_json: $plugin_name, $config_key, $const_resource_path"
