# Migrating one space's Community data to another instance

Moves what one space owns in the Community — its members, agents, apps and tags — and a
chosen list of bricks with all their versions and documentation, from one community
database to another, typically the empty one of a fresh instance built with
[`NEW_INSTANCE.md`](../NEW_INSTANCE.md).

This is the Community half. The Space half (users' accounts, folders, documents, labs)
is [`space-migration/`](../space-migration/README.md); run both, for the same space.

---

## The principle

The same as the Space migration: every id is a UUID, so rows are copied **verbatim, ids
kept**, through a staging schema `community_export` built on the source, moved to the
target as a separate database, then merged there in SQL.

One difference: the export is made self-contained **on the source**. Whatever points
outside of it is cut there, so `04-import.sql` is a plain copy, run with foreign keys ON,
and the server itself refuses any reference that would dangle.

## What travels, and what does not

| Migrated                                                                                 | Left behind                      | Why                                                                         |
| ---------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| `space`, `space_user`, and the `user` rows of its members (+ the robot)                  | every other user                 | the Community mirrors the Space's users; people who do not move stay behind |
| the listed `brick`s: every major, version, dependency, brick user, like                  | the other bricks                 | chosen by name at the top of `01-extract.sql`                               |
| their documentation: `folder`, `documentation`, `file_documentation`                     |                                  |                                                                             |
| their technical doc: `technical_folder`, `task`, `protocol`, `resource`, `…_other_class` |                                  |                                                                             |
| `agent`s of the space, versions, dependencies, co-authors, comments, likes, files        | `run_stat`, `run_stat_aggregate` | statistics, naming the old labs                                             |
| `app`s of the space, co-authors, users, comments, likes, files                           | `app_stat`                       | statistics                                                                  |
| `tag_key`s of the space, values, co-authors, comments, likes                             | tags with no space               | the community-wide catalogue                                                |
| the whole `icon` catalogue                                                               |                                  | styles name icons by `technical_name`; an empty target has none             |
|                                                                                          | `story`, `partner`, `topic`      | they belong to a user, not to a space                                       |
|                                                                                          | `*_invite`                       | tokens of links sent from the old front                                     |
|                                                                                          | `refresh_token`, `mail`          | sessions and logs                                                           |

### What is cut, and how you see it

`01-extract.sql` ends with a report. Read it before going further:

- **R1 — listed bricks that do not exist.** A typo in the list.
- **R2 — missing dependencies.** A migrated brick version depends on a brick that is not
  in the list (`brick_version_reference`), or an agent does
  (`agent_version_brick_dependencies`). Those rows are dropped. Add the named bricks to
  the list and run the script again: it starts with `DROP DATABASE community_export`.
- **R3 — bricks private to another space.** A private brick keeps its visibility, but
  inside the migrated space, since the other one does not exist on the target.
- **R4 — what belongs to non-members.** Authorship (`created_by_id`,
  `last_modified_by_id`) by somebody who is not a member becomes `NULL`. Co-authors,
  brick users, app users, likes and comments of non-members are dropped, and the
  `likes`/`comments` counters recomputed.

A brick's authors are rarely members of the customer's space, so the migrated bricks
usually end up with no brick user. Set `@brick_owner_mail` to a member's email and they
get that member instead.

## Before starting

- **Both instances must run the same `community-api` version.** `00-preflight.sql`
  section A, diffed between the two, is that check.
- **The target's Community buckets must exist**: the `BUCKET_*` variables of its
  `community-api`.
- **An empty target means the schema only**, not `hn-dev-init.sql`. The seed carries
  `gws_core` and `gws_academy` with fixed ids, which collide with the same bricks coming
  from a source seeded the same way; `03-check.sql` shows them. Either skip the seed on
  the target, or leave those bricks out of the list.
- **`GENCOVERY_SPACE_ID`** of the target's `community-api` must name a space that exists in
  its database. The migrated space can be that space.
- **Freeze the source** between `01-extract.sql` and the end of the S3 copy.

## The run

Every step but the transfer and the copy is plain SQL, to paste in Adminer's _SQL
command_ box on the right instance, or to pipe into `mysql` as below. The transfer goes
through Adminer too — see [the Space README](../space-migration/README.md#the-run-through-adminer),
with `community_export` in place of `space_export`, and the same warning: **select
`community_export` before importing, and export with `Database: CREATE`**.

```bash
# 0. schema fingerprint, on both sides, then diff; section C lists the brick names
mysql -h "$SRC" -u root -p "$SRC_DB" < 00-preflight.sql > source.txt
mysql -h "$DST" -u root -p "$DST_DB" < 00-preflight.sql > target.txt
diff source.txt target.txt          # only sections B and C may differ

# 1. build the staging schema on the source
#    (set @space, the brick list and @brick_owner_mail at the top first)
mysql -h "$SRC" -u root -p -t --default-character-set=utf8mb4 "$SRC_DB" < 01-extract.sql

# 2. move it to the target, where it lands as the database community_export
#    (or through Adminer); --databases writes its own CREATE DATABASE and USE
mysqldump -h "$SRC" -u root -p --default-character-set=utf8mb4 --single-transaction \
    --hex-blob --no-tablespaces --databases community_export > community_export.sql
mysql -h "$DST" -u root -p --default-character-set=utf8mb4 < community_export.sql

# 3. what would collide — every count must be 0, bar the last line
mysql -h "$DST" -u root -p -t "$DST_DB" < 03-check.sql

# 4. merge into the application's tables; the last query must return 0 everywhere
mysql -h "$DST" -u root -p -t "$DST_DB" < 04-import.sql

# 5. list the objects to copy, on the source (set the source bucket names first)
mysql -N -B -h "$SRC" -u root -p "$SRC_DB" < 05-s3-keys.sql > community-keys.tsv

# 6. copy them: fill BUCKETS in the script with source -> target Community buckets
../space-migration/06-copy-s3.sh community-keys.tsv
```

`04-import.sql` runs in one transaction: if a statement fails, the target is left as it
was, and the script can be run again once the cause is fixed. Do not pass `--force`.

`06-copy-s3.sh` takes one line of `BUCKETS` per source bucket, each naming its source
remote and its target remote: one rclone remote per endpoint and set of keys, on each
side. The Community's keys are the `OBJECT_STORAGE_*` of each `community-api`.

Then, on the new instance: sign in, open the space in the Community, open a migrated
brick's documentation, and one agent.

## Afterwards

`DROP DATABASE community_export;` on both servers and delete the dump and
`community-keys.tsv`: they hold user rows and the bricks' `credential_password`.

## Known pitfalls

**Users' profile pictures are not in the Community's buckets.** `user.photo` is set by
the Space and served from its bucket, so the Space migration's `05-s3-keys.sql` copies
them. A Community-only migration leaves them behind.

**Signing in goes through the Space.** A user migrated here but not in the target's
Space database exists in the Community without being able to log in. Migrate the Space
half too, for the same space.

**`user.email` and `user.user_code` are UNIQUE**, and `user_code` is generated per
instance. The first line of `03-check.sql` counts collisions; resolve them by hand.

**`folder` points at itself.** It is the one table imported with foreign keys off; the
query at the end of `04-import.sql` checks it instead. `folder.mpath` is made of folder
ids, which are kept, so the tree needs no rebuilding.

**Rehearse it.** A throwaway MariaDB with `hn-db-schema.sql` + `hn-dev-init.sql` as
source and `hn-db-schema.sql` alone as target is enough: migrate one of the seed's
personal spaces with a public and a private brick of the seed, and R3 and R4 then have
something to report. The seed has no agent
and no brick dependency, so add a few rows by hand to exercise R2 and the files.
