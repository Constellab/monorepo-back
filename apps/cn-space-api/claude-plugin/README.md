# Claude Code plugins served by this application

Client-side packaging for the MCP tools this application exposes: the manifest that points a
Claude Code install at `{API_URL}/mcp/space-api`, and the skills that teach a model how to
use those tools in sequence.

It lives next to `src/app/cn-mcp/` on purpose. A tool renamed there and a skill that still
names the old one is a silent failure — no error, just a model calling something that does
not exist. Co-located, the same pull request touches both.

## The API serves the install commands

`GET {API_URL}/mcp/install` returns the two `claude plugin` commands that install this plugin,
as ordered steps with a description each, plus the sign-in step that is not a command — which
is where a user whose tools do not appear is actually stuck. Public, and the same path the
Community API answers for its own plugin, so a front-end asks both APIs the same question.

`space_api_url` in the emitted command is `API_URL`, read at request time and never written per
environment. That is what makes one route correct in prod, preprod and local, and it ties the
URL a user configures to the URL the plugin's tokens are minted for — the same value the OAuth
issuer and this endpoint are advertised at.

The rest of the command line is four constants in `cn-mcp.constants.ts`: the marketplace repo
and name, the plugin name, and the `userConfig` key. Two of them repeat what `plugin.json`
declares, so `check_plugin_constants.sh` compares them on every pull request touching either
side — including the plugin's server URL against the endpoint path, since a manifest pointing
somewhere this API does not mount fails only in a user's terminal. Jest does not run in CI, so
that script is the guard rather than the unit test beside the service.

How a command line is assembled is `blMcpInstallInstructions` in back-core-lib, shared with the
Community API: `claude plugin install <name>@<marketplace> --config <key>=<value>` is the CLI's
syntax rather than ours, so a flag that changes changes in one place. What this application
supplies is its identity and its base URL.

## The skill fires by hand

`diagnose-lab-startup` carries `disable-model-invocation: true`: it runs when someone types
`/space:diagnose-lab-startup`, never on its own. Its description leaves the model's reach
entirely, so it costs nothing in context until it is called — and the price is that the human
is the index. Whoever installs the plugin has to be told the command exists, which is what
the public README is for.

The MCP tool descriptions stand on their own for a model that was never handed this playbook:
they carry the per-call contract, and `blockedAtLayer` still orders the calls. What is lost
without the skill is the stopping rules, not the ability to use the tools.

## Published publicly

`Constellab/agent-plugins` is a public repository, and everything under `space/` is copied
into it on release — that subfolder only, so this README and the `CLAUDE.md` beside it stay
internal. Assume every word inside `space/` is readable by anyone: no credentials, no
internal hostnames, no customer names. The prod Space API URL is the one internal fact that
belongs there, because clients need it to connect.

## Develop against your local server

The repository root carries a `.claude-plugin/marketplace.json` naming the marketplace
`constellab-dev`, so it can coexist with the published `constellab` one — Claude Code keeps
only one marketplace per name, and same-named registration replaces the other.

```
/plugin marketplace add ./
/plugin install space@constellab-dev
```

The trailing slash matters: a bare `.` is rejected as a source, the CLI reads it as neither a
repo nor a path.

Set `space_api_url` to `http://localhost:3001` when prompted. Edits to `SKILL.md` take
effect immediately; edits to `plugin.json` need `/reload-plugins`.

Install `space@constellab-dev` **or** `space@constellab`, never both: they declare the
same MCP server, so you would connect twice and see every tool duplicated.

## Publishing

`.github/workflows/publish-space-plugin.yml` publishes this folder into
`Constellab/agent-plugins` on a `cn_*` tag — that is, when the API carrying the tools is
actually deployed. Publishing off `master` would hand clients a skill describing tools the
prod API does not expose yet. The shared machinery is in `publish_agent_plugin.yml`; the
community application calls it from its own workflow, on its own tag.

Two things reach the public repository, and an install needs both: this folder copied to
`plugins/space`, and an entry for it in `plugins[]` of the public `marketplace.json`. The entry
is written by `register_plugin.sh` from `plugin.json` — `name`, a `./plugins/<name>` source, and
`description` — so a reworded description ships without a second edit, and a new plugin is
installable on its first release rather than the one after. The copy alone would be a folder no
`/plugin install` resolves, which is exactly how `space` shipped its files while the marketplace
still offered only `datalab`.

It writes that one entry and nothing else. Removing a plugin, or the `renames` map below, stays
a hand edit in the public repository: a release should not infer that a name has disappeared.

`version` in `plugin.json` is the update signal: without a bump, clients keep their cached
copy whatever changed in the files. Bump it in the pull request that changes the plugin —
`check_plugin_version.sh` compares this folder against the published copy and fails there,
where the bump is one line, and again before the push as a backstop.

It compares against what is published, not against your diff, so a missed bump fails every
later tag until the version moves — including tags whose own commits never touched the plugin.
That is the shape of the failure to expect: a release turning red over an edit made weeks
earlier.

## Names that cannot change cheaply

| Name                          | Where it surfaces                           | Cost of changing it                                                                                       |
| ----------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `constellab` (marketplace)    | `/plugin install space@constellab`          | Users keep the old marketplace registered, silently, until they remove it by hand                         |
| `space` (plugin)              | `space@constellab`, skill names, tool names | `renames` in the public `marketplace.json` migrates existing installs; forget it and their install breaks |
| `constellab` (MCP server key) | `mcp__plugin_space_constellab__<tool>`      | Breaks users' permission allowlists and hooks with no error — they simply get asked to approve again      |

## It was `datalab` until 0.2.0

Renamed because the plugin is named after the endpoint it connects to, `/mcp/space-api`, and that
endpoint answers for the whole Space API rather than for labs. A per-feature plugin cannot work
here: two plugins declaring the same MCP server make a client connect to it twice and list every
tool twice, so one plugin per endpoint is the only shape available. The name has to stay generic
for the same reason: the next Space toolset joins this plugin, it does not get one of its own.

The rename is not free, and two things in the **public** repository carried it, both by hand —
the publish workflow adds and refreshes the `space` entry, and touches nothing else. First,
`renames` — a top-level field of `marketplace.json`, an append-only map of old name to current
name, which the loader follows on plugin-not-found and uses to migrate a user's plugin settings:

```json
"renames": { "datalab": "space" }
```

It cannot be added before `space` is in `plugins[]`: a chain resolving to a plugin the list does
not contain fails validation, and at runtime falls through to plugin-not-found — the same broken
install as no entry at all.

Second, `plugins/datalab` had to be deleted. The workflow's `git add` is scoped to the plugin it
publishes, so it creates `plugins/space` and would leave the old folder installable forever —
serving 0.1.0, whose Space API URL default was never filled in.

What does not follow is the mangled tool prefix. Anyone who allowlisted
`mcp__plugin_datalab_constellab__*` is now being asked about `mcp__plugin_space_constellab__*`,
with no error to explain why — the loader migrates plugin settings, not permission rules written
against the old name.
