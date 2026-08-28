# Editing the community plugin

**Bump `version` in `community/.claude-plugin/plugin.json` in the same change that edits anything
under `community/`, a `SKILL.md` included.** That version is the only signal an installed client uses
to refresh its cached copy: content published without a bump reaches nobody, and every install
keeps serving the old skill with no error anywhere to show it. CI refuses the change on the pull
request — and refuses the release tag if one slips through, which is a red release for a one-line
fix that was free while the change was under review.

Pre-1.0: a reworded or restructured skill is a minor bump, a typo or a clarification a patch.

Editing a tool in `../src/app/mcp-doc/` counts too when the skill names that tool. A renamed tool
with a skill still naming the old one fails silently, so the rename and the skill move together,
in one change, with a bump.

This file is not published. Everything under `community/` is — see `README.md` here for what that
means, the local dev marketplace, and the names that cannot change cheaply.
