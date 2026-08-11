# Editing the space plugin

**Bump `version` in `space/.claude-plugin/plugin.json` in the same change that edits anything
under `space/`, `SKILL.md` included.** That version is the only signal an installed client uses
to refresh its cached copy: content published without a bump reaches nobody, and every install
keeps serving the old skill with no error anywhere to show it. CI refuses the change on the pull
request — and refuses the release tag if one slips through, which is a red release for a one-line
fix that was free while the change was under review.

Pre-1.0: a reworded or restructured skill is a minor bump, a typo or a clarification a patch.

Editing a tool in `../src/app/cn-mcp/` counts too when a skill names that tool. A renamed tool
with a skill still naming the old one fails silently, so the rename and the skill move together,
in one change, with a bump.

## One plugin for the whole Space API

This plugin carries every skill built on `/mcp/space-api`, not one per feature. It is named after
the application because the endpoint is: a second plugin pointing at the same MCP server would
make a client open two connections to it and show every tool twice, and there is no way for two
plugins to share one server entry. So a new Space toolset is a new folder under `space/skills/`.

A toolset that needs its **own** consent — anything that writes where `/mcp/space-api` is
advertised read-only — is the one exception, and it is a new Resource on its own path before it
is a new plugin. See `README.md`.

This file is not published. Everything under `space/` is — see `README.md` here for what that
means, the local dev marketplace, and the names that cannot change cheaply.
