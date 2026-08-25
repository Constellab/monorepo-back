---
name: edit-community-doc
description: Write to the Constellab community documentation — change the content of a page, create or rename a page or a folder, undo a change. Use only when the user explicitly asks for the community documentation to be modified.
disable-model-invocation: true
---

# Edit the Constellab community documentation

You are writing to public pages that other people wrote, and every write is recorded against
your account. Four tools, in this order:

1. `community_doc_tree` — the brick version's folders and pages, with their ids. The only tool
   that returns a folder id, so a create or a move starts here. Use `community_doc_list` first
   if you do not yet know which brick and version to work in.
2. `community_doc_read_blocks` — the page as the blocks it is stored as, with their ids, their
   `editable` verdict, and the page's `revision`. Not `community_doc_read`: markdown loses the
   ids an edit is expressed against.
3. `community_doc_edit` — the change, as operations on those block ids. Read its `warnings`:
   the server sanitizes content on the way in, and that is the only field that says what it
   changed about what you sent.
4. `community_doc_read_blocks` again — read back the blocks you touched, as they were actually
   stored.

You need to be the **author or a co-author of the brick**. Every write tool refuses otherwise,
and so does `community_doc_history` — it holds earlier content the public page does not. The
refusal comes at the end of a plan just as readily as at the start, so if you are unsure,
attempt the smallest write first rather than composing a full batch.

## Never rewrite a whole page

This is the mistake that matters, because nothing catches it. The modification history of a page
is not supplied by the caller — it is **derived** by comparing the old blocks to the new ones,
**matched by id**. Delete every block and insert the new text is a valid batch: it passes every
check and returns success. What it records is "the whole page was deleted and a new one written",
which erases the per-block authorship of everyone who wrote before you, and turns the rollback
that would repair your mistake into a single wall you cannot see past.

So: touch the blocks that change, and no others. Untouched blocks are reused as they are, id
included, and the history then names exactly what you changed. A batch is one entry in the
history, one user action.

Fixing a typo in the third paragraph is one `update` on one block id. Not four operations, and
never a rebuild.

## Confirm the plan before applying it

Between reading the page and calling `community_doc_edit`, state the operations you intend in
prose — which block you are rewriting, what you are inserting and where — and wait for the
person to agree. Not because the tool is dangerous (it is reversible), but because a page reads
differently to its author than to you, and a plan is cheaper to correct than a published edit.

Ask which folder a new page goes in unless the user named it. `community_doc_tree` shows the
choices; guessing puts the page at a url that then has to be moved.

Do not stop for anything else. Claude Code already asks the user to approve each tool call.

## Operations

`community_doc_edit(docId, revision, operations[])`, at most 50 operations per batch. Each
operation names its kind in `op`:

- `op: 'update'` — `blockId` and the complete `data` of that block. Never a partial patch: `data`
  replaces what was there. No position: an update never moves anything. It cannot change a
  block's `type` either — for that, `delete` the block and `insert` the new one `before` it, in
  the same batch: a deleted block's place is exactly the gap it leaves.
- `op: 'insert'` — `type`, `data`, and a position. No `blockId`: the server mints the id of a new
  block and returns it. An id you invent risks colliding with an existing one, which corrupts
  the history with nothing to show it.
- `op: 'delete'` — `blockId`, and no position.
- `op: 'move'` — `blockId` and a position, which cannot be the moved block itself.

A position is exactly one of `before: <blockId>`, `after: <blockId>`, `at: 'start' | 'end'`.
Two of them is a refusal, not a preference.

Three rules to plan against:

- **Positions are resolved against the page you read**, not against the state the previous
  operation left. Describe every operation against what `community_doc_read_blocks` returned.
  You may anchor on a block the same batch deletes or updates; anchoring on one the same batch
  **moves** is refused, since "after X" would then mean two different places.
- **One operation of a kind per block**, and a deleted block takes no other operation in the
  same batch. There is no order between operations to resolve a second one against.
- **The batch is atomic.** One invalid operation refuses the whole batch and writes nothing, so
  there is no partial state to reconcile — send the corrected batch again.

`revision` is the optimistic lock. If the page changed since you read it, the edit is refused
and the refusal carries the new revision, and — when the page's history still reaches back to
the revision you held — the blocks that changed since, in `changedSince`. If your batch names
none of them, send it again with the new revision. With no `changedSince`, that comparison
cannot be made: read the page again.

A block whose `id` is `null` is a legacy block saved before ids existed. No operation can name
it — it cannot be updated, moved or deleted. Work around it.

## Block data, by type

`data` is the block's EditorJS payload. The shape `community_doc_read_blocks` returns for a
block of that type is the shape to send.

Inline HTML is allowed in text fields, restricted to `<b> <i> <u> <a href> <code> <br>`;
`<strong>` and `<em>` are rewritten to `<b>` and `<i>`, and anything else is dropped and
reported in `warnings`. Links accept `http`, `https` and `mailto` only. No markdown: `**x**`
stays four asterisks on the page.

| Type                                 | `data`                                                                                                                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paragraph`                          | `{ text }` — inline HTML                                                                                                                                             |
| `header`                             | `{ text, level }` — inline HTML; `level` is 2, 3 or 4, H1 being the page title                                                                                       |
| `list`                               | `{ style, items, meta }`, `style` one of `ordered`, `unordered`, `checklist`; each item `{ content, meta, items }`, nested through `items`; `content` is inline HTML |
| `code`                               | `{ code, language }` — `code` is plain text and is never sanitized, so a sample keeps its angle brackets                                                             |
| `hint`                               | `{ hintType, content }` — exactly these two fields                                                                                                                   |
| `table`                              | `{ withHeadings, stretched, content }` — `content` is rows of cells, each cell inline HTML                                                                           |
| `figure`, `resourceView`, `fileView` | Not writable — see below                                                                                                                                             |

What the server normalizes, and what it does not:

- `code.language` is one of `python`, `typescript`, `javascript`, `json`, `bash`, `yaml`,
  `plaintext`. Anything else is replaced by `plaintext`, with a warning.
- A `hint` carries **exactly** `hintType` (`info`, `warning`, `science`) and `content`. A
  `title`, a `message`, a `text` is dropped with a warning; an unsupported `hintType` becomes
  `info`; and `content` is **plain text** — its renderer does not interpret HTML, so a tag would
  show up as a tag.
- Nothing validates `header.level` or `list.style`. A `level: 1` or a misspelled style is stored
  exactly as you sent it, with no warning and a block that renders wrong. Getting these right is
  on you.

## What you cannot do

- **Insert a `figure`, a `resourceView` or a `fileView`** — an image, a lab view, an attached
  file. Those blocks are filled from an upload or from a lab, which no MCP tool performs. You can
  move or delete an existing one.
- **Rewrite a block whose `editable` is `false`.** Its `summary` says what it holds and why.
  Move it or delete it; an `update` on it refuses the batch. A block can be non-editable for
  carrying markup the server would clean, not only for being one of the three types above.
- **Delete a folder.** No tool does: the deletion is recursive and would take every page under
  it. Move its pages out instead, and leave the empty folder.
- **Undo a delete, a rename or a move of a page.** `community_doc_rollback` restores content
  only.

## The rest of the tree

`community_doc_create` makes an **empty** page in a folder; its content then goes in through
`community_doc_edit`, so the first version is recorded like every other.
`community_doc_rename`, `community_doc_move`, and `community_doc_delete` — which is final, takes
`confirm: true`, and needs the person's actual agreement before you set it. Folders:
`community_folder_create`, `community_folder_rename`, `community_folder_move`.

A rename or a move changes the url, and links to the old one stop resolving. Say so when you
propose one.

## When you get it wrong

`community_doc_history(docId, limit)` lists what was recorded on the page, newest first, with the
blocks each entry touched and a `modificationId`. `limit` defaults to 20 and goes up to 100, and
`moreEntries` appears when some were withheld, carrying how many the page has in all — so a page
with a long history shows you a window, not all of it. Reading it needs the same authorship as
writing.

`community_doc_rollback(docId, modificationId)` puts the content back to before that entry,
undoing everything recorded after it as well — including edits someone else made in between, so
read the history before rolling back. The rollback is itself recorded, so it can be rolled back
in turn.

Read the history after a batch you are unsure of. It is also the check on the rule at the top of
this file: an entry naming every block on the page is the whole-page rewrite you were meant to
avoid.
