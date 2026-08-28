# The MCP manages the documentation tree, and every write it makes is reversible

ADR-0004 gave a model one page to edit. This one gives it the tree around that page — creating,
renaming, moving and deleting pages, creating, renaming and moving folders — and the undo that
makes the whole set affordable.

Every one of these operations already existed, with its permission check, behind the Community
site's own controllers. Nothing new is being decided about _what_ they do. What had to be decided
is what changes when the caller is a model naming ids rather than a person dragging a node.

## The tree operations go through the aggregate service, not around it

Each MCP tool calls `HnBrickAggregateService` — the same entry point `HnFolderController` and
`HnDocumentationController` call. The path resolution, the uniqueness of a title among siblings,
the sibling ordering, the cascade of a complete path down a moved folder's descendants and the
author check therefore have exactly one implementation.

**Considered and rejected:** writing the tree from the MCP service directly, through the folder
and documentation repositories. It is less code today, and the first change to how a path is
resolved leaves the MCP producing urls the site does not. The cascade alone — a moved folder
rewriting the complete path of every page beneath it — is not something worth having a second
copy of.

The price is a double authorization check: the MCP asks first, to produce a refusal that names the
brick and says what to do about it, and the aggregate asks again on its own account. That is the
right way round. The aggregate's check is the one that must not be removable from here.

## A created page is empty; content only ever arrives through the edit tool

`community_doc_create` takes a folder and a title, and nothing else. The content then goes in
through `community_doc_edit`.

A create that also accepted content would be a second write path for a page's blocks — with its
own block building, its own sanitization entry point, and, worse, a first version that lands
outside the modification history. That history is derived by comparing what is stored with what
is written next (ADR-0004), so content that arrives with the row itself is content no history
entry describes. The page would begin its life with a version nothing can roll back to.

**Considered and rejected:** create-with-content as a convenience, one call instead of two. It
saves a round trip and reintroduces exactly the invisible-first-write problem ADR-0004 exists to
remove.

## Deleting a page takes an explicit confirmation, and no judgement about the page

`community_doc_delete` carries the MCP `destructiveHint` annotation, so a client can ask a human
before it runs, **and** requires `confirm: true` in its arguments. Both, because an annotation is
a hint a client is free to ignore, and this is the one operation with nothing behind it.

The refusal is not conditional on what the page holds. A tool that refused to delete pages it
judged valuable would refuse exactly the deletions that matter and allow the ones nobody would
have minded — while reading as a safety feature. The decision is a human's; the flag is where
they make it.

**Considered and rejected:** a soft delete, so that a deletion could be undone like an edit. It is
the better answer and it is not a change to the MCP: the site's own delete is a hard delete, and
making one path recoverable and not the other would be a worse state than either. When the site
gets a trash, this tool inherits it.

## No tool deletes a folder

Deleting a folder is recursive: it takes the pages under it, and their files, with it. A model that
deletes a page loses a page; a model that deletes a folder loses a branch — and it can be a branch
it never read.

Note what the site does here, because it is _not_ the rule adopted: `HnFolderService.remove`
refuses a folder that has any children at all. Exposing that would be worse than exposing nothing.
A model that wanted a folder gone would work around it by emptying the folder first — a dozen
confirmed page deletions to express one intent, each of them final, and no single step a human
could review as "you are deleting this branch".

**Considered and rejected:** the recursive delete with a confirmation and a list of what would go.
That is the folder deletion worth having, and it is a feature of its own, not a wrapper: it needs
to say what it is about to destroy, and it needs the trash above to be worth agreeing to. Out of
scope for this version. A folder a model wants gone can be emptied and left empty, or removed by a
human on the site.

## Moves are guarded against what a UI cannot express

The tree widget on the site offers a node and a drop target that both exist, in one brick version,
in one tree. A model offers two ids. So three refusals live in the MCP and nowhere below it:

- **Across brick versions or bricks.** It would carry a page out of the tree its author was checked
  against, and hand one brick's page to another brick's authors.
- **A folder into its own descendant.** The branch detaches from the root. The read side already
  refuses to return a tree it cannot walk whole from the root, so the consequence is the brick's
  whole documentation becoming unbrowsable — from one move. The check walks up a bounded number of
  ancestors, and running out of that bound **refuses** rather than allows: a chain that long either
  was never meant to exist or already holds a cycle, which is the case the bound exists to survive.
- **The root folder of a brick version, renamed or moved.** It is the version's documentation
  itself. It has no parent, and its title is displayed nowhere, so a rename would rewrite every url
  of the version for nothing visible.

A fourth is a refusal rather than a silent success: a title that slugifies to nothing. The url is
built from the title, and `!!!` produces a node no url reaches and no error anywhere. It is checked
on a create and a rename, where the caller chose the title, **and on a move**, where it did not —
a title the site or the CLI accepted years ago is recomputed into a path by the move.

One of these checks is deliberately made twice. `updateNodeLocation` refuses a title already taken
in the target folder, but it does so _after_ renumbering the siblings of the source and the target,
one `save` each and no transaction around them. A refusal from there is a refusal on top of a
half-done move, and reporting it as "nothing was changed" would be a lie the caller acts on. So the
MCP asks the same question — by calling `HnFolderService.resolveNodePath`, not by reproducing it —
before the operation is entered. The catch stays, for the collision that lands in the window between
the two, and it says what it actually knows: the move was interrupted, go and look at the tree.

**Considered and rejected:** wrapping `updateNodeLocation` in a transaction. It is the real fix and
it belongs to that method, not to its newest caller: the site's own drag-and-drop has the same
window, and a transaction added from here would cover one of the two paths into it.

## The rollback is an ordinary write, and reading the history needs the same rights as writing

`community_doc_history` lists what was recorded on a page, one entry per user action, and
`community_doc_rollback` puts the page back to any of those points.

The rollback writes the restored content through `HnDocumentationService.updateContent`, the single
write path — so it is sanitized, it locks on a revision, and **it appends to the history like any
other edit**. It is therefore itself in the history and can be rolled back in turn.

This is deliberately not what the site's own rollback does: that one truncates the record at the
point it returns to. For a human undoing their own work with the page in front of them, that is
right — the discarded versions are ones they just saw. For a tool whose entire justification is
that nothing a model did is unrecoverable, a rollback that destroys history is a second way to lose
work, and the one a model would reach for while trying to fix the first.

Two consequences follow from the rollback being a write. It locks on the revision of the content
the undo was computed from, so a page someone edited in between is refused rather than reverted
past their change. And the history entry is a **group**, not a single block change: one user action
records several block modifications sharing a `groupId`, and half a group undone is a page in a
state nobody ever saved. The id a rollback takes is the id of the group's first change.

Reading the history requires being the brick's author or a co-author, unlike reading the page. The
page is public on the web; its history is not the page. It carries the previous content of blocks —
including content that was removed on purpose — and the names of the people who wrote them.

**Considered and rejected:** exposing the history read to anyone with a Community account, matching
the site, whose history endpoint only requires being logged in. The MCP is where a model reads
things in bulk, and "who wrote what, and what did it say before" is a different thing to hand out
than a rendered page.

## The author check lives in one place

Ten tools now reach these pages with something more than a Community account required of the
caller. The check is asked once, of `HnMcpDocAuthorization`, which resolves a page or a folder up to
its brick and applies `HnBrickSecurity` — the brick's own rule.

**Considered and rejected:** the check inside each tool, as ADR-0004's single write tool had it. It
was right for one tool and is the obvious way to end up with nine that agree and one that does not.
Every tool description also states the requirement in words, duplicated into each: a client shows a
model one description at a time, and a rights requirement stated only in the server instructions is
one the model discovers by being refused.
