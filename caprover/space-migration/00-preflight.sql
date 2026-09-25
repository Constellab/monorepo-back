-- Run on the SOURCE and on the TARGET, then diff the two outputs.
--
--   mysql -h <host> -u <user> -p <db> < 00-preflight.sql > source.txt
--   mysql -h <host> -u <user> -p <db> < 00-preflight.sql > target.txt
--   diff source.txt target.txt     # empty apart from sections C and D
--
-- Section A is the gate: the two instances must run the same space-api
-- version, or rows copied from one will not fit the other.

SET @space := 'SPACE_ID_TO_MIGRATE';   -- ignored on the target

-- A. schema fingerprint
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, COLUMN_NAME;

-- B. seeded rows that both instances share, by id (cn-dev-init.sql uses
--    fixed UUIDs). They are imported with INSERT IGNORE, so identical ids
--    are fine; different ids for the same thing are not.
SELECT 'robot user' AS what, id, email AS label FROM `user` WHERE email LIKE 'robot@%'
UNION ALL SELECT 'brick', id, name FROM `brick`
UNION ALL SELECT 'lab_config', id, label FROM `lab_config`;

-- C. what the space holds (source only)
SELECT 'space_user'       AS t, COUNT(*) AS n FROM `space_user` WHERE space_id = @space
UNION ALL SELECT 'hierarchy_object', COUNT(*) FROM `hierarchy_object` WHERE space_id = @space
UNION ALL SELECT 'lab', COUNT(*) FROM `lab` WHERE space_id = @space
UNION ALL SELECT 'document', COUNT(*) FROM `document` d
  JOIN `hierarchy_object` h ON h.id = d.id WHERE h.space_id = @space
UNION ALL SELECT 'document bytes', COALESCE(SUM(d.size), 0) FROM `document` d
  JOIN `hierarchy_object` h ON h.id = d.id WHERE h.space_id = @space;

-- D. which buckets the space's files actually live in (source only)
SELECT b.id, b.name, b.content_type, b.bucket_type, COUNT(*) AS folders
FROM `folder` f
JOIN `hierarchy_object` h ON h.id = f.id AND h.parent_id IS NULL
JOIN `bucket` b ON b.id IN (f.main_storage_id, f.backup_storage_id)
WHERE h.space_id = @space
GROUP BY b.id, b.name, b.content_type, b.bucket_type;
