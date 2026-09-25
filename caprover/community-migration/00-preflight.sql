-- Run on the SOURCE and on the TARGET community database, then diff the
-- two outputs.
--
--   mysql -h <host> -u <user> -p <db> < 00-preflight.sql > source.txt
--   mysql -h <host> -u <user> -p <db> < 00-preflight.sql > target.txt
--   diff source.txt target.txt     # empty apart from sections B and C
--
-- Section A is the gate: the two instances must run the same
-- community-api version, or rows copied from one will not fit the other.

SET @space := 'SPACE_ID_TO_MIGRATE';   -- ignored on the target

-- A. schema fingerprint
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, COLUMN_NAME;

-- B. what the space owns (source only)
SELECT 'space_user' AS t, COUNT(*) AS n FROM `space_user` WHERE space_id = @space
UNION ALL SELECT 'agent',   COUNT(*) FROM `agent`   WHERE space_id = @space
UNION ALL SELECT 'app',     COUNT(*) FROM `app`     WHERE space_id = @space
UNION ALL SELECT 'tag_key', COUNT(*) FROM `tag_key` WHERE space_id = @space
UNION ALL SELECT 'private brick', COUNT(*) FROM `brick` WHERE space_id = @space;

-- C. the bricks there are to choose from (source only): the names go
--    into the brick list at the top of 01-extract.sql
SELECT b.name, b.visibility, s.name AS private_to_space,
       COUNT(DISTINCT mv.id) AS majors, COUNT(v.id) AS versions
FROM `brick` b
LEFT JOIN `space` s                ON s.id = b.space_id
LEFT JOIN `brick_major_version` mv ON mv.brick_id = b.id
LEFT JOIN `brick_version` v        ON v.brick_major_version_id = mv.id
GROUP BY b.id, b.name, b.visibility, s.name
ORDER BY b.name;
