---
name: search-community-doc
description: Find an answer in the Constellab community documentation — how a brick, feature or API of Constellab works. Use whenever a question is about Constellab itself rather than about the user's own code.
---

# Search the Constellab community documentation

Three tools, in one order: `community_doc_search` or `community_doc_list` to get an `id`,
then `community_doc_read` for the page. Search returns snippets only — never answer from a
snippet, it is a 320-character window with no guarantee the sentence you need is inside it.

## `query` is one literal substring, not keywords

The search matches `%query%` against the title and the body. It is not tokenized, stemmed or
ranked, which has three consequences worth planning around:

- **A multi-word query is a phrase.** `create a task` finds only pages containing those
  words in that order, spaced exactly so. Search one distinctive term — `scenario`,
  `gws_core`, `TaskInputs` — and widen from what comes back.
- **Substrings match.** `task` also hits `tasks` and `subtask`, which is usually what you
  want. `id` hits almost everything, which is not.
- **No relevance order.** `limit` takes the first N rows the database returns, not the best
  N. More results than the limit means you are holding an arbitrary subset — say so, or
  narrow the term.

Two or three single-term searches beat one long phrase. Run them before concluding the
documentation says nothing.

## A snippet that does not contain your term is a false hit

The body is stored as rich-text JSON, and the search runs over that raw JSON — so a query can
match markup or a JSON key rather than any prose the reader would ever see. The snippet is
built from the rendered markdown, so the tell is direct: **when the returned snippet does not
contain your query, the match was in the markup.** Drop that result rather than reading it.

## Browse when you do not know the vocabulary

`community_doc_list` takes a `brickName` substring and returns pages ordered by path. Reach
for it when a search comes back empty or full of false hits — the paths show you the terms
the documentation actually uses, and a second search with one of those usually lands.

## Versions

Each page carries `brickName` and `version`, and the same page exists once per major version
of a brick. If the user named a version, check the one you read matches it; if they did not,
say which version your answer came from — behaviour described under `gws_core 0.22` may not
hold in `0.23`.

## Answer from the page, and cite it

Read the page before answering. Quote or paraphrase what it says, and give the `completePath`
and the brick with its version so the user can open it themselves.

When the documentation does not cover something, say that plainly and list the terms you
searched. A plausible answer assembled from general knowledge, presented as if it came from
these pages, is the one failure this tool set cannot recover from.
