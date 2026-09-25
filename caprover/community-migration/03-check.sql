-- Run on the TARGET community database, after 01-extract.sql and the
-- transfer. Reads only.
--
--   mysql -h <dst> -u <user> -p -t <dst_community_db> < 03-check.sql
--
-- Every line must be 0 but the last one. On a target built from the
-- schema alone they all are; on one that also received hn-dev-init.sql,
-- the seed's gws_core and gws_academy are what shows up here, and the
-- robot user in the last line.

SELECT 'user: same email or user_code, other id' AS check_name, COUNT(*) AS n
  FROM community_export.`user` s JOIN `user` t
    ON (t.email = s.email OR t.user_code = s.user_code) AND t.id <> s.id
UNION ALL SELECT 'user: same id, other email', COUNT(*)
  FROM community_export.`user` s JOIN `user` t ON t.id = s.id AND t.email <> s.email
UNION ALL SELECT 'space already there', COUNT(*)
  FROM community_export.`space` s JOIN `space` t ON t.id = s.id
UNION ALL SELECT 'brick: name taken', COUNT(*)
  FROM community_export.`brick` s JOIN `brick` t ON t.name = s.name
UNION ALL SELECT 'brick: id already there', COUNT(*)
  FROM community_export.`brick` s JOIN `brick` t ON t.id = s.id
UNION ALL SELECT 'agent: id already there', COUNT(*)
  FROM community_export.`agent` s JOIN `agent` t ON t.id = s.id
UNION ALL SELECT 'app: id or app_url taken', COUNT(*)
  FROM community_export.`app` s JOIN `app` t ON t.id = s.id OR t.app_url = s.app_url
UNION ALL SELECT 'tag_key: id or technical_name taken', COUNT(*)
  FROM community_export.`tag_key` s JOIN `tag_key` t ON t.id = s.id OR t.technical_name = s.technical_name
UNION ALL SELECT 'icon: technical_name taken by another id', COUNT(*)
  FROM community_export.`icon` s JOIN `icon` t ON t.technical_name = s.technical_name AND t.id <> s.id
UNION ALL SELECT 'file names taken', (
    SELECT COUNT(*) FROM community_export.`file_documentation` s JOIN `file_documentation` t ON t.file_name = s.file_name)
  + (SELECT COUNT(*) FROM community_export.`file_agent` s JOIN `file_agent` t ON t.file_name = s.file_name)
  + (SELECT COUNT(*) FROM community_export.`file_app`   s JOIN `file_app`   t ON t.file_name = s.file_name)
UNION ALL SELECT 'seeded rows shared by id (users, icons)', (
    SELECT COUNT(*) FROM community_export.`user` s JOIN `user` t ON t.id = s.id AND t.email = s.email)
  + (SELECT COUNT(*) FROM community_export.`icon` s JOIN `icon` t ON t.id = s.id);

-- the rows behind a non-zero count
SELECT 'user' AS what, s.id AS source_id, t.id AS target_id, s.email AS label
  FROM community_export.`user` s JOIN `user` t
    ON (t.email = s.email OR t.user_code = s.user_code) AND t.id <> s.id
UNION ALL SELECT 'brick', s.id, t.id, s.name
  FROM community_export.`brick` s JOIN `brick` t ON t.name = s.name OR t.id = s.id
UNION ALL SELECT 'app', s.id, t.id, s.app_url
  FROM community_export.`app` s JOIN `app` t ON t.id = s.id OR t.app_url = s.app_url
UNION ALL SELECT 'tag_key', s.id, t.id, s.technical_name
  FROM community_export.`tag_key` s JOIN `tag_key` t ON t.id = s.id OR t.technical_name = s.technical_name;
