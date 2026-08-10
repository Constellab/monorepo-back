# Claude Code plugins served by this application

Client-side packaging for the MCP tools this application exposes: the manifest that points a
Claude Code install at `{API_URL}/mcp/community-doc`, and the skill that teaches a model how
to use those tools in sequence.

It lives next to `src/app/mcp-doc/` on purpose. A tool renamed there and a skill that still
names the old one is a silent failure — no error, just a model calling something that does
not exist. Co-located, the same pull request touches both.

## The skill fires on its own

`search-community-doc` has no `disable-model-invocation`, unlike the space application's
`diagnose-lab-startup`. The two are different kinds of thing: diagnosing a lab is a procedure
someone decides to run, while looking something up in the documentation is what the model
should reach for the moment a Constellab question appears, without being told. A skill nobody
knows to invoke is a skill that never fires, and there is no natural moment for a user to
think "I should ask for the documentation search now".

The price is context: its description sits in every session where the plugin is installed.
That is what keeps the description one line and the body short.

## What the skill adds over the tool descriptions

The MCP tool descriptions carry the per-call contract and the search → read order, so a model
handed no skill still uses the tools correctly. What lives only here is how the search
actually behaves: `query` is one literal `LIKE` substring rather than keywords, results are
unranked, and a match can land in the raw rich-text JSON instead of any prose. Those turn a
search returning nothing useful into a search the model knows how to retry.

## Published publicly

`Constellab/agent-plugins` is a public repository, and everything under this folder is
copied into it on release. Assume every word here is readable by anyone: no credentials, no
internal hostnames, no customer names. The prod Community API URL is the one internal fact
that belongs here, because clients need it to connect.

## Develop against your local server

The repository root carries a `.claude-plugin/marketplace.json` naming the marketplace
`constellab-dev`, so it can coexist with the published `constellab` one — Claude Code keeps
only one marketplace per name, and same-named registration replaces the other.

```
/plugin marketplace add .
/plugin install community@constellab-dev
```

Set `community_api_url` to your local Community API when prompted. Edits to `SKILL.md` take
effect immediately; edits to `plugin.json` need `/reload-plugins`.

Install `community@constellab-dev` **or** `community@constellab`, never both: they declare
the same MCP server, so you would connect twice and see every tool duplicated.

## The endpoint needs a token

`/mcp/community-doc` is not open. `BlResourceGuard` requires an OAuth Bearer token whose
audience is this Resource, and answers an unauthenticated call with the `WWW-Authenticate`
header that starts the discovery flow — so a client that supports MCP OAuth connects on its
own. A client that does not will see 401s and no tools, which looks like a broken plugin
rather than a missing login.

## Publishing

`.github/workflows/publish-community-plugin.yml` publishes this folder into
`Constellab/agent-plugins` on an `hn_*` tag — that is, when the API carrying the tools is
actually deployed. Publishing off `master` would hand clients a skill describing tools the
prod API does not expose yet. The shared machinery is in `publish_agent_plugin.yml`; the
space application calls it from its own workflow, on its own tag.

`version` in `plugin.json` is the update signal: without a bump, clients keep their cached
copy whatever changed in the files. Bump it in the pull request that changes the plugin. CI
fails the publish if the content moved and the version did not.

## Names that cannot change cheaply

| Name                          | Where it surfaces                          | Cost of changing it                                                                                       |
| ----------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `constellab` (marketplace)    | `/plugin install community@constellab`     | Users keep the old marketplace registered, silently, until they remove it by hand                         |
| `community` (plugin)          | `community@constellab`, skill names        | `renames` in the public `marketplace.json` migrates existing installs; forget it and their install breaks |
| `constellab` (MCP server key) | `mcp__plugin_community_constellab__<tool>` | Breaks users' permission allowlists and hooks with no error — they simply get asked to approve again      |

The server key is `constellab` here and in the space plugin, deliberately. They do not
collide: the plugin name sits between `plugin` and the key in the mangled tool name, so the
two sets stay distinct while reading as one product to whoever writes an allowlist.
