# Migrating one space to another instance

Moves a single space — its users, folders, documents, notes, scenarios, resources and the
files behind them — from one Constellab control plane to another, typically a fresh
instance built with [`NEW_INSTANCE.md`](../NEW_INSTANCE.md). Everything else on the source
instance stays where it is.

The data labs themselves are out of scope: their rows travel so the space's content keeps
its references, but the servers are provisioned again on the new instance and their
backups restored there. See section 4 of [`04-import.sql`](04-import.sql).

---

## The principle

Every id in the Space schema is a UUID (`@PrimaryGeneratedColumn('uuid')`). Rows can
therefore be copied **verbatim, ids kept**, with no remapping — which is what makes a
selective migration tractable at all.

The copy goes through a staging schema rather than a pile of `mysqldump --where` calls:

1. on the source, `space_export` is built with `CREATE TABLE ... LIKE` and filtered
   `INSERT ... SELECT` — `LIKE` does not copy foreign keys, so insertion order is free;
2. the schema is dumped and loaded **onto the target as a separate database**, still
   outside the application's tables;
3. the merge into the real tables then happens on the target, in SQL, where every
   conflict can be checked before and after.

Two tables anchor the filter: `hierarchy_object.space_id` carries the whole content tree
(`folder`, `document`, `note`, `scenario` and `resource` share their `hierarchy_object`'s
id), and `space_user.space_id` carries the membership.

## What travels, and what does not

| Migrated                                                                   | Left behind                    | Why                                                                   |
| -------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| `space`, `space_user`, `space_invit`                                       |                                |                                                                       |
| `hierarchy_object` and the five representations, tags, chat, `folder_user` |                                |                                                                       |
| `user` (every id referenced, not just members), `user_2_fa`, groups        | `refresh_token`, `oauth_grant` | people sign in again; passwords travel in `user.password`             |
| `lab`, its current status, `lab_user`, `lab_green_option`, `lab_folder`    |                                | the servers are cleared, the server type and region kept              |
| `lab_backup_*`, `lab_volume`, `lab_free` of the space's labs               |                                | the backups are restored onto the reprovisioned servers               |
| `lab_config`, `brick`, `brick_version`                                     |                                | `note.lab_config_id` and `scenario.lab_config_id` are `NOT NULL`      |
| `activity`, `notification`                                                 | `front_error`, `mail`          | logs                                                                  |
| countries, cities, providers, regions, servers, prices, `settings`         |                                | copied whole: the target is a bare schema and has none                |
| `bucket`, `bucket_credentials` ¹                                           |                                | ids kept, so the space, its folders and its backups need no rebinding |
|                                                                            | `hierarchy_object_token`       | public share links of the old front                                   |

¹ Every shared bucket, plus the space's own lab buckets; another space's private storage
stays. The credentials travel as they are and are changed on the target afterwards — see
[Plugging the buckets](#plugging-the-buckets).

## Before starting

- **Both instances must run the same `space-api` version.** There are no TypeORM
  migrations: a row copied into a schema one release older lands in the wrong shape.
  `00-preflight.sql` section A is that check, and it is the one that must not be skipped.
- **The target is a bare schema**: `cn-db-schema.sql` loaded, `cn-dev-init.sql` not. It
  receives the source's reference data, `settings` and buckets, ids kept, and the
  `configuration already here` line of `03-check.sql` must be 0.
- **The target should hold no account that the space also uses.** `user.email` is UNIQUE;
  a collision means the row is skipped and everything that user created loses its owner.
  The first line of `03-check.sql` counts them — resolve them by hand before importing.
- **Freeze the space** for the duration: put the source instance in maintenance, or at
  least accept that anything written between `01-extract.sql` and the end of the S3 copy
  is lost. The database snapshot and the file copy must describe the same moment.
- Rehearse against a throwaway database first, and start the application on it. The
  fastest rehearsal is the test stack: `bun run test-db:up`, then load
  `apps/cn-space-api/cn-db-schema.sql` and `cn-dev-init.sql` into a source database on
  `localhost:3311`, the schema alone into a target, and run the whole sequence between the
  two. One of the seed's personal spaces carries a folder tree, a scenario and a lab.

## The run, through Adminer

Every numbered file but `06-copy-s3.sh` is plain SQL: paste it into
Adminer's _SQL command_ box on the right instance, which is how the databases of a
CapRover instance are reached anyway (step 6 of [`NEW_INSTANCE.md`](../NEW_INSTANCE.md)).
Only the transfer itself becomes a download and an upload:

1. **Source Adminer**, `space_export` selected → _Export_ → Output **gzip**, Format
   **SQL**, and set **Database** to `CREATE` so the dump carries its own
   `CREATE DATABASE` and `USE`. Download the `.sql.gz`.
2. **Target Adminer** → create `space_export` and select it → _Import_ → upload the file.

The `adminer:5.2.1` image of the template allows a 128 MB upload with a 1 GB memory limit
and no execution timeout, and it has zlib, so the gzip export is what sets the ceiling —
a SQL dump compresses roughly tenfold. Past that, dump and load it from a shell, as in
step 2 below.

> **Select `space_export` before importing, and export with `Database: CREATE`.** Adminer
> imports into whichever database is currently selected, and the dump begins with a
> `DROP TABLE IF EXISTS` for each of its tables — which carry the same names as the
> application's. Importing it with `spaceDb` selected drops the real tables first. The
> `USE` statement that `Database: CREATE` puts at the top is what makes that impossible.

Nothing is lost by taking this route rather than `mysqldump --single-transaction`: the
snapshot was already frozen by `01-extract.sql`, which copied the rows into a static
schema. `space_export` does not change while it is being exported.

## The run, from a shell

```bash
# 0. schema fingerprint, on both sides, then diff
mysql -h "$SRC" -u root -p "$SRC_DB" < 00-preflight.sql > source.txt
mysql -h "$DST" -u root -p "$DST_DB" < 00-preflight.sql > target.txt
diff source.txt target.txt          # only sections B, C and D may differ

# 1. build the staging schema on the source (set @space at the top first)
mysql -h "$SRC" -u root -p --default-character-set=utf8mb4 "$SRC_DB" < 01-extract.sql

# 2. move it to the target, where it lands as the database space_export
#    (or through Adminer, above); --databases writes its own CREATE DATABASE and USE
mysqldump -h "$SRC" -u root -p --default-character-set=utf8mb4 --single-transaction \
    --hex-blob --no-tablespaces --databases space_export > space_export.sql
mysql -h "$DST" -u root -p --default-character-set=utf8mb4 < space_export.sql

# 3. what would collide — every count must be 0
mysql -h "$DST" -u root -p -t "$DST_DB" < 03-check.sql

# 4. merge into the application's tables (set @space first); every count
#    must be 0, and the last table lists the credentials to change
mysql -h "$DST" -u root -p -t "$DST_DB" < 04-import.sql

#    -> plug the buckets into the new instance (see below)

# 5-6. only when the new instance uses another object storage:
#      list the objects the space owns, on the source, then copy them
mysql -N -B -h "$SRC" -u root -p "$SRC_DB" < 05-s3-keys.sql > keys.tsv
./06-copy-s3.sh keys.tsv

```

The Community side — the same space and users, its agents, apps, tags and a list of
bricks — is migrated separately, from its own database: see
[`community-migration/`](../community-migration/README.md).

`03-check.sql` and the integrity query of `04-import.sql` both answer as a table of counts,
so "nothing came back" and "everything is 0" cannot be confused.

`04-import.sql` runs inside one transaction: a statement that fails halfway leaves the
target exactly as it was, and the script can be run again once the conflict is resolved.
Do not pass `--force` to `mysql`, or it will carry on past the failure.

### Plugging the buckets

After step 4 the buckets carry the **source's** credentials. The application reads them
from the database on every call — endpoint from `cloud_provider_region.s3_endpoint`, name
from `bucket.name`, keys from `bucket_credentials` — so changing them takes effect at once,
from the admin (Object storage) or in SQL. Do it before anybody works on the new instance.

- **Same object storage, same buckets.** Give the new instance its own access key on
  those buckets and put it in `bucket_credentials`. Nothing is copied: the objects are
  already where the rows say, and steps 5 and 6 are skipped. From then on both instances
  reach the same objects, so **never delete the migrated space from the source's
  application** — it would delete the space's documents and its lab backups
  (`<space_id>/<lab_id>/`) along with it. Retire the source, or remove the space there in
  SQL.
- **Another object storage.** Create the buckets there, then point the rows at them:
  `bucket.name`, `bucket_credentials` (keys), and `cloud_provider_region.s3_endpoint` when
  the endpoint changes. Then run steps 5 and 6: one rclone remote per endpoint and set of
  keys on each side, and one line of `BUCKETS` in `06-copy-s3.sh` per source bucket.

```sql
UPDATE bucket_credentials SET access_key_id = '...', secret_access_key = '...' WHERE id = '...';
UPDATE bucket SET name = 'new-project-gra' WHERE id = '...';
```

Profile pictures and space images are **not** in the `bucket` table. The application
reaches them with `OBJECT_STORAGE_DEFAULT_ENDPOINT`, `_REGION`, `_ACCESS_KEY_ID` and
`_SECRET_ACCESS_KEY` from its environment, in the buckets named by
`BUCKET_USER_PROFILE_PICTURE` and `BUCKET_SPACE_IMAGE` (older releases fix those names in
`cn-core-config.service.ts`). On another storage, create the two buckets **in the region of
`OBJECT_STORAGE_DEFAULT_ENDPOINT`**, set the six variables of the target, and give
`05-s3-keys.sql` the source's names. Their source keys are the source's
`OBJECT_STORAGE_DEFAULT_*`, which may differ from any `bucket_credentials` row: give them
their own rclone remote.

With rclone installed as a snap, run `06-copy-s3.sh` from a non-hidden folder of your
home: the snap sees neither `/tmp` nor dot-folders, and `WORK` is relative to the current
folder.

### Then

On the new instance: sign in, walk the space, open a document, and provision each lab again
before restoring its backup. `settings.free_lab_config` names a lab domain that the
application checks against `LAB_ALLOWED_DOMAINS`; the last query of `04-import.sql` prints
it. If the new instance serves labs on another domain, change it from the admin.

## Afterwards

`DROP DATABASE space_export;` on both servers, and delete the `.sql` dumps, `keys.tsv` and
`s3-lists/` — they hold the user rows, the S3 credentials, the lab API keys and
the space's whole content. The dumps are not git-ignored
here because they should never be written into the repository in the first place.

## Known pitfalls

**The robot user is seeded with a fixed UUID.** `cn-dev-init.sql` sets it, so both instances have the same row and the import
uses `INSERT IGNORE` for `user`. The same holds for the seeded bricks and their groups.
The `same id, different email` line of `03-check.sql` is what tells a legitimate overlap
from an accident.

**`INSERT IGNORE` hides a skipped row.** It is used only where an overlap is expected
(`user`, `group`, `user_group`, `brick`, `brick_version`, `lab_config`). Everything else
is a plain `INSERT` that must fail loudly. The integrity queries at the end of
`04-import.sql` are the real gate: a skipped user shows up there as a dangling reference.

**S3 keys carry no prefix.** `BlObjectStorageService` stores each object under the
filename it generates, and that is the whole key — no space or folder prefix. So the copy
is driven by the list in `05-s3-keys.sql`, and a bucket-level copy would carry every other
space's files along with it. Lab backups are the exception: they sit under
`<space_id>/<lab_id>/`, and `05-s3-keys.sql` lists them as one prefix per bucket.

**The Community is fed by Redis, not by the database.** Users and spaces reach it through
`BL_TRANSPORT_SPACE_USER_QUEUE` and `BL_TRANSPORT_SPACE_SPACE_USER_QUEUE` when the Space's
services write them. A SQL import triggers none of that, which is what
[`community-migration/`](../community-migration/README.md) makes up for. The Community's `user.user_code` is UNIQUE and generated per instance, so it is
checked separately there.

**The space's `domain` column is a UUID, and it is UNIQUE.** It is what the front resolves
as `<domain>.space.<DOMAIN>`, so the space keeps its workspace subdomain — under the new
instance's root. Nothing to change, but the wildcard certificate of the target has to
cover it (see [`CAPROVER_CERTIFICATES.md`](../CAPROVER_CERTIFICATES.md)).
