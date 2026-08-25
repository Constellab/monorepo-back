# Claude Code plugins served by this application

Client-side packaging for the MCP tools this application exposes: the manifest that points a
Claude Code install at `{API_URL}/mcp/community-doc`, and the skills that teach a model how
to use those tools in sequence.

It lives next to `src/app/mcp-doc/` on purpose. A tool renamed there and a skill that still
names the old one is a silent failure — no error, just a model calling something that does
not exist. Co-located, the same pull request touches both.

## The API serves the install commands

`GET {API_URL}/mcp/install` returns the two `claude plugin` commands that install this plugin,
as ordered steps with a description each, plus the sign-in step that is not a command — which
is where a user whose tools do not appear is actually stuck. Public, and the same path the
Space API answers for its own plugin, so a front-end asks both APIs the same question.

`community_api_url` in the emitted command is this application's `API_URL`, read at request
time and never written per environment. Not `SPACE_API_URL`: per ADR-0001 the Space API is the
Authorization Server, so the host a token comes from and the host the plugin calls differ on
purpose, and what belongs in the plugin's configuration is this one — the Resource being
called.

The rest of the command line is four constants in `hn-mcp-doc.constants.ts`: the marketplace
repo and name, the plugin name, and the `userConfig` key. Two of them repeat what `plugin.json`
declares, so `check_plugin_constants.sh` compares them on every pull request touching either
side — including the plugin's server URL against the endpoint path, since a manifest pointing
somewhere this API does not mount fails only in a user's terminal. Jest does not run in CI, so
that script is the guard rather than the unit test beside the service.

How a command line is assembled is `blMcpInstallInstructions` in back-core-lib, shared with the
Space API: `claude plugin install <name>@<marketplace> --config <key>=<value>` is the CLI's
syntax rather than ours, so a flag that changes changes in one place. What this application
supplies is its identity and its base URL.

## Two skills, because only one of them should fire on its own

`search-community-doc` reads and `edit-community-doc` writes, and they are separate skills
rather than one because their trigger differs. Merging them would load the writing protocol —
the block formats, the operation rules, the destructive tools — into every session where
someone merely asked a question about Constellab, and put a model one step from an edit nobody
asked for.

`edit-community-doc` carries `disable-model-invocation: true` for that reason: writing to
public pages someone else authored is a thing a user decides to do, and says so. It is also
markedly less interactive than the internal beta skill it descends from — it stops to confirm
the plan of operations, and to pick a folder when creating a page, and nowhere else. Every
other stop the beta skill made is one Claude Code's own tool approval already covers, and a
skill that asks twice per call is a skill nobody uses to fix a typo.

## The search skill fires on its own

`search-community-doc` has no `disable-model-invocation`, unlike the space application's
`diagnose-lab-startup`. The two are different kinds of thing: diagnosing a lab is a procedure
someone decides to run, while looking something up in the documentation is what the model
should reach for the moment a Constellab question appears, without being told. A skill nobody
knows to invoke is a skill that never fires, and there is no natural moment for a user to
think "I should ask for the documentation search now".

The price is context: its description sits in every session where the plugin is installed.
That is what keeps the description one line and the body short.

## What the skills add over the tool descriptions

The MCP tool descriptions carry the per-call contract and the search → read order, so a model
handed no skill still uses the tools correctly. What lives only in the search skill is how the
search actually behaves: `query` is one literal `LIKE` substring rather than keywords, results
are unranked, and a match can land in the raw rich-text JSON instead of any prose. Those turn a
search returning nothing useful into a search the model knows how to retry.

The edit skill adds what no single tool description can say, because it is not about one call:
that the modification history is derived by matching block ids, so a delete-all-then-insert-all
batch — the natural reflex, and one that passes every check the server makes — records the page
as destroyed and rewritten. It also gathers the block formats a model has to get right in
`data`, which the tools deliberately leave to the shape `community_doc_read_blocks` returned.

## Published publicly

`Constellab/agent-plugins` is a public repository, and everything under `community/` is copied
into it on release — that subfolder only, so this README and the `CLAUDE.md` beside it stay
internal. Assume every word inside `community/` is readable by anyone: no credentials, no
internal hostnames, no customer names. The prod Community API URL is the one internal fact
that belongs there, because clients need it to connect.

## Develop against your local server

The repository root carries a `.claude-plugin/marketplace.json` naming the marketplace
`constellab-dev`, so it can coexist with the published `constellab` one — Claude Code keeps
only one marketplace per name, and same-named registration replaces the other.

```
/plugin marketplace add ./
/plugin install community@constellab-dev
```

The trailing slash matters: a bare `.` is rejected as a source, the CLI reads it as neither a
repo nor a path.

Set `community_api_url` to `http://localhost:3333` when prompted. Edits to `SKILL.md` take
effect immediately; edits to `plugin.json` need `/reload-plugins`.

Install `community@constellab-dev` **or** `community@constellab`, never both: they declare
the same MCP server, so you would connect twice and see every tool duplicated.

## The endpoint needs a token

`/mcp/community-doc` is not open. `BlResourceGuard` requires an OAuth Bearer token whose
audience is this Resource, and answers an unauthenticated call with the `WWW-Authenticate`
header that starts the discovery flow — so a client that supports MCP OAuth connects on its
own. A client that does not will see 401s and no tools, which looks like a broken plugin
rather than a missing login.

### Locally, that means three processes

Signing in walks across all three applications, so a local install connects only when all three
are up:

| Process             | Local URL               | Its part in the flow                                                    |
| ------------------- | ----------------------- | ----------------------------------------------------------------------- |
| **Community API**   | `http://localhost:3333` | The Resource — serves `/mcp/community-doc` and names the issuer         |
| **Space API**       | `http://localhost:3001` | The Authorization Server — `/oauth/authorize`, code exchange, the token |
| **Space front-end** | `http://localhost:4200` | The only two screens a person sees: the login page and the consent page |

The front-end is not optional. `/oauth/authorize` redirects the browser to `frontLoginUrl` when
there is no session and to `frontConsentUrl` when the client has nothing granted yet — the API
renders neither screen itself, so with the front down the flow dies mid-redirect and no token is
ever issued.

Which Space API a client is sent to is `SPACE_API_URL`, read at boot and published in this API's
protected-resource metadata. Ask a running server rather than reading the env file — an override
in the shell that started it wins, and this is the one value deciding where the sign-in goes:

```
curl http://localhost:3333/.well-known/oauth-protected-resource/mcp/community-doc
```

`authorization_servers` in the answer is where the client will go. Point it at a host nothing is
listening on and Claude Code reports `Unable to connect` against the MCP URL — which reads as the
Community API being down when it is in fact answering correctly. Restart the API after changing
the value: the metadata is built once, at boot.

## Publishing

`.github/workflows/publish-community-plugin.yml` publishes this folder into
`Constellab/agent-plugins` on an `hn_*` tag — that is, when the API carrying the tools is
actually deployed. Publishing off `master` would hand clients a skill describing tools the
prod API does not expose yet. The shared machinery is in `publish_agent_plugin.yml`; the
space application calls it from its own workflow, on its own tag.

`version` in `plugin.json` is the update signal: without a bump, clients keep their cached
copy whatever changed in the files. Bump it in the pull request that changes the plugin —
`check_plugin_version.sh` compares this folder against the published copy and fails there,
where the bump is one line, and again before the push as a backstop.

It compares against what is published, not against your diff, so a missed bump fails every
later tag until the version moves — including tags whose own commits never touched the plugin.
That is the shape of the failure to expect: a release turning red over an edit made weeks
earlier.

## Names that cannot change cheaply

| Name                          | Where it surfaces                          | Cost of changing it                                                                                       |
| ----------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `constellab` (marketplace)    | `/plugin install community@constellab`     | Users keep the old marketplace registered, silently, until they remove it by hand                         |
| `community` (plugin)          | `community@constellab`, skill names        | `renames` in the public `marketplace.json` migrates existing installs; forget it and their install breaks |
| `constellab` (MCP server key) | `mcp__plugin_community_constellab__<tool>` | Breaks users' permission allowlists and hooks with no error — they simply get asked to approve again      |

The server key is `constellab` here and in the space plugin, deliberately. They do not
collide: the plugin name sits between `plugin` and the key in the mangled tool name, so the
two sets stay distinct while reading as one product to whoever writes an allowlist.
