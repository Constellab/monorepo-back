-- Run on the TARGET application database, once space_export is there and
-- before 04-import.sql. Read-only: it changes nothing and reports what
-- would go wrong.
--
--   mysql -h <dst> -u <user> -p -t <dst_db> < 03-check.sql
--
-- The first table is the verdict: every count must be 0 except
-- `seeded rows shared by id`, which is expected — cn-dev-init.sql gives
-- the robot user, the bricks and their groups fixed UUIDs, so both
-- instances hold the same rows and the import skips them.
--
-- `configuration already here` must be 0 too: the target is a bare
-- schema, cn-db-schema.sql without cn-dev-init.sql, and 04-import.sql
-- brings the source's reference data, settings and buckets into it.
--
-- The tables after it detail whatever was counted. Anything real is
-- resolved by hand on the target, usually by deleting the account or
-- the space created there before the migration.

SELECT 'email already taken by another account' AS check_name, COUNT(*) AS n
FROM space_export.`user` s JOIN `user` t ON t.email = s.email AND t.id <> s.id
UNION ALL
SELECT 'same id, different email', COUNT(*)
FROM space_export.`user` s JOIN `user` t ON t.id = s.id AND t.email <> s.email
UNION ALL
SELECT 'space id already here', COUNT(*)
FROM space_export.`space` s JOIN `space` t ON t.id = s.id
UNION ALL
SELECT 'space domain taken', COUNT(*)
FROM space_export.`space` s JOIN `space` t ON t.domain = s.domain AND t.id <> s.id
UNION ALL
SELECT 'brick name clash', COUNT(*)
FROM space_export.`brick` s JOIN `brick` t ON t.name = s.name AND t.id <> s.id
UNION ALL
SELECT 'lab_config hash clash', COUNT(*)
FROM space_export.`lab_config` s
JOIN `lab_config` t ON t.brick_versions_hash = s.brick_versions_hash AND t.id <> s.id
UNION ALL
SELECT 'lab unique key already used', COUNT(*)
FROM space_export.`lab` s JOIN `lab` t ON t.id <> s.id AND (
     t.glab_prod_api_key   = s.glab_prod_api_key
  OR t.glab_dev_api_key    = s.glab_dev_api_key
  OR t.lab_manager_api_key = s.lab_manager_api_key
  OR t.virtual_host        = s.virtual_host)
UNION ALL
SELECT 'configuration already here', (
    (SELECT COUNT(*) FROM `cloud_provider`) + (SELECT COUNT(*) FROM `cloud_provider_region`)
  + (SELECT COUNT(*) FROM `server_standard`) + (SELECT COUNT(*) FROM `country`)
  + (SELECT COUNT(*) FROM `bucket`) + (SELECT COUNT(*) FROM `bucket_credentials`))
UNION ALL
SELECT 'seeded rows shared by id (expected)', (
    (SELECT COUNT(*) FROM space_export.`user`  s JOIN `user`  t ON t.id = s.id)
  + (SELECT COUNT(*) FROM space_export.`brick` s JOIN `brick` t ON t.id = s.id)
  + (SELECT COUNT(*) FROM space_export.`group` s JOIN `group` t ON t.id = s.id));

-- detail of each non-zero count above
SELECT 'email already taken' AS problem, s.id AS source_id, t.id AS target_id, s.email AS detail
FROM space_export.`user` s JOIN `user` t ON t.email = s.email AND t.id <> s.id
UNION ALL
SELECT 'same id, different email', s.id, t.id, CONCAT(s.email, ' / ', t.email)
FROM space_export.`user` s JOIN `user` t ON t.id = s.id AND t.email <> s.email
UNION ALL
SELECT 'space already here', s.id, t.id, t.name
FROM space_export.`space` s JOIN `space` t ON t.id = s.id
UNION ALL
SELECT 'space domain taken', s.id, t.id, t.domain
FROM space_export.`space` s JOIN `space` t ON t.domain = s.domain AND t.id <> s.id
UNION ALL
SELECT 'brick name clash', s.id, t.id, s.name
FROM space_export.`brick` s JOIN `brick` t ON t.name = s.name AND t.id <> s.id
UNION ALL
SELECT 'lab_config hash clash', s.id, t.id, CAST(s.brick_versions_hash AS CHAR)
FROM space_export.`lab_config` s
JOIN `lab_config` t ON t.brick_versions_hash = s.brick_versions_hash AND t.id <> s.id
UNION ALL
SELECT 'lab unique key already used', s.id, t.id, s.name
FROM space_export.`lab` s JOIN `lab` t ON t.id <> s.id AND (
     t.glab_prod_api_key   = s.glab_prod_api_key
  OR t.glab_dev_api_key    = s.glab_dev_api_key
  OR t.lab_manager_api_key = s.lab_manager_api_key
  OR t.virtual_host        = s.virtual_host);
