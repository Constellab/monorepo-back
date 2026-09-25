-- Run on the TARGET community database, once every count of
-- 03-check.sql but the last is 0.
--
--   mysql -h <dst> -u <user> -p -t <dst_community_db> < 04-import.sql
--
-- Foreign keys stay ON, so the order below is the dependency order and
-- the server itself checks every reference. The one exception is
-- `folder`, which points at itself: it goes in with the checks off, and
-- the query at the end checks it instead.
--
-- One transaction: a failing statement leaves the target as it was.
-- Do not pass --force to mysql, or it carries on past the failure.
--
-- INSERT IGNORE only where an overlap is expected: `user` (the robot is
-- seeded with a fixed id) and `icon`. Everything else must fail loudly.

START TRANSACTION;

INSERT IGNORE INTO `user`       SELECT * FROM community_export.`user`;
INSERT        INTO `space`      SELECT * FROM community_export.`space`;
INSERT        INTO `space_user` SELECT * FROM community_export.`space_user`;
INSERT IGNORE INTO `icon`       SELECT * FROM community_export.`icon`;

-- bricks
INSERT INTO `brick`                   SELECT * FROM community_export.`brick`;
INSERT INTO `brick_major_version`     SELECT * FROM community_export.`brick_major_version`;
INSERT INTO `brick_version`           SELECT * FROM community_export.`brick_version`;
INSERT INTO `brick_version_reference` SELECT * FROM community_export.`brick_version_reference`;
INSERT INTO `brick_user`              SELECT * FROM community_export.`brick_user`;
INSERT INTO `like_brick`              SELECT * FROM community_export.`like_brick`;

INSERT INTO `technical_folder`          SELECT * FROM community_export.`technical_folder`;
INSERT INTO `task`                      SELECT * FROM community_export.`task`;
INSERT INTO `protocol`                  SELECT * FROM community_export.`protocol`;
INSERT INTO `resource`                  SELECT * FROM community_export.`resource`;
INSERT INTO `technical_doc_other_class` SELECT * FROM community_export.`technical_doc_other_class`;

SET FOREIGN_KEY_CHECKS = 0;
INSERT INTO `folder` SELECT * FROM community_export.`folder`;
SET FOREIGN_KEY_CHECKS = 1;
INSERT INTO `documentation`      SELECT * FROM community_export.`documentation`;
INSERT INTO `file_documentation` SELECT * FROM community_export.`file_documentation`;

-- agents
INSERT INTO `agent`                            SELECT * FROM community_export.`agent`;
INSERT INTO `agent_version`                    SELECT * FROM community_export.`agent_version`;
INSERT INTO `agent_version_brick_dependencies` SELECT * FROM community_export.`agent_version_brick_dependencies`;
INSERT INTO `agent_co_author`                  SELECT * FROM community_export.`agent_co_author`;
INSERT INTO `comment_agent`                    SELECT * FROM community_export.`comment_agent`;
INSERT INTO `like_agent`                       SELECT * FROM community_export.`like_agent`;
INSERT INTO `file_agent`                       SELECT * FROM community_export.`file_agent`;

-- apps
INSERT INTO `app`           SELECT * FROM community_export.`app`;
INSERT INTO `app_co_author` SELECT * FROM community_export.`app_co_author`;
INSERT INTO `app_user`      SELECT * FROM community_export.`app_user`;
INSERT INTO `comment_app`   SELECT * FROM community_export.`comment_app`;
INSERT INTO `like_app`      SELECT * FROM community_export.`like_app`;
INSERT INTO `file_app`      SELECT * FROM community_export.`file_app`;

-- tags
INSERT INTO `tag_key`       SELECT * FROM community_export.`tag_key`;
INSERT INTO `tag_value`     SELECT * FROM community_export.`tag_value`;
INSERT INTO `tag_co_author` SELECT * FROM community_export.`tag_co_author`;
INSERT INTO `comment_tag`   SELECT * FROM community_export.`comment_tag`;
INSERT INTO `like_tag`      SELECT * FROM community_export.`like_tag`;

COMMIT;

-- Must be 0 everywhere. The foreign keys checked the rest as it went in.
SELECT 'folder -> parent folder' AS dangling, COUNT(*) AS n FROM `folder` f
  LEFT JOIN `folder` p ON p.id = f.folder_id WHERE f.folder_id IS NOT NULL AND p.id IS NULL
UNION ALL SELECT 'folder -> brick_major_version', COUNT(*) FROM `folder` f
  LEFT JOIN `brick_major_version` mv ON mv.id = f.brick_major_version_id WHERE mv.id IS NULL
UNION ALL SELECT 'staged user not imported', COUNT(*) FROM community_export.`user` s
  LEFT JOIN `user` t ON t.id = s.id WHERE t.id IS NULL;

-- Then: DROP DATABASE community_export;
