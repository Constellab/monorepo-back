# Claude Code plugins served by this application

Client-side packaging for the MCP tools this application exposes: the manifest that points a
Claude Code install at `{API_URL}/mcp/space-api`, and the skills that teach a model how to
use those tools in sequence.

It lives next to `src/app/cn-mcp/` on purpose. A tool renamed there and a skill that still
names the old one is a silent failure — no error, just a model calling something that does
not exist. Co-located, the same pull request touches both.

## The skill fires by hand

`diagnose-lab-startup` carries `disable-model-invocation: true`: it runs when someone types
`/datalab:diagnose-lab-startup`, never on its own. Its description leaves the model's reach
entirely, so it costs nothing in context until it is called — and the price is that the human
is the index. Whoever installs the plugin has to be told the command exists, which is what
the public README is for.

The MCP tool descriptions stand on their own for a model that was never handed this playbook:
they carry the per-call contract, and `blockedAtLayer` still orders the calls. What is lost
without the skill is the stopping rules, not the ability to use the tools.

## Published publicly

`Constellab/agent-plugins` is a public repository, and everything under this folder is
copied into it on release. Assume every word here is readable by anyone: no credentials, no
internal hostnames, no customer names. The prod Space API URL is the one internal fact that
belongs here, because clients need it to connect.

## Develop against your local server

The repository root carries a `.claude-plugin/marketplace.json` naming the marketplace
`constellab-dev`, so it can coexist with the published `constellab` one — Claude Code keeps
only one marketplace per name, and same-named registration replaces the other.

```
/plugin marketplace add .
/plugin install datalab@constellab-dev
```

Set `space_api_url` to `http://localhost:3001` when prompted. Edits to `SKILL.md` take
effect immediately; edits to `plugin.json` need `/reload-plugins`.

Install `datalab@constellab-dev` **or** `datalab@constellab`, never both: they declare the
same MCP server, so you would connect twice and see every tool duplicated.

## Publishing

`.github/workflows/publish-space-plugin.yml` publishes this folder into
`Constellab/agent-plugins` on a `cn_*` tag — that is, when the API carrying the tools is
actually deployed. Publishing off `master` would hand clients a skill describing tools the
prod API does not expose yet. The shared machinery is in `publish_agent_plugin.yml`; the
community application calls it from its own workflow, on its own tag.

`version` in `plugin.json` is the update signal: without a bump, clients keep their cached
copy whatever changed in the files. Bump it in the pull request that changes the plugin. CI
fails the publish if the content moved and the version did not.

## Names that cannot change cheaply

| Name                          | Where it surfaces                             | Cost of changing it                                                                                       |
| ----------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `constellab` (marketplace)    | `/plugin install datalab@constellab`          | Users keep the old marketplace registered, silently, until they remove it by hand                         |
| `datalab` (plugin)            | `datalab@constellab`, skill names, tool names | `renames` in the public `marketplace.json` migrates existing installs; forget it and their install breaks |
| `constellab` (MCP server key) | `mcp__plugin_datalab_constellab__<tool>`      | Breaks users' permission allowlists and hooks with no error — they simply get asked to approve again      |
