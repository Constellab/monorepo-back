-- Run on the SOURCE community database. Builds a staging schema
-- `community_export` holding one space, the bricks listed below, and
-- nothing else.
--
--   mysql -h <src> -u <user> -p --default-character-set=utf8mb4 <src_community_db> < 01-extract.sql
--
-- Every id in this schema is a UUID, so rows are copied verbatim, ids
-- kept, no remapping. `CREATE TABLE ... LIKE` does not copy foreign
-- keys, so insertion order below does not matter; the import inserts
-- with foreign keys ON, and that is where the order is checked.
--
-- The export is made self-contained here, on the source, so that the
-- import is a plain copy:
--   - the users are the space's members, and only them. A reference to
--     anybody else is set to NULL (authorship) or the row is dropped
--     (co-author, brick user, like, comment). Counters are recomputed.
--   - a brick dependency or an agent dependency on a brick that is not
--     in the list is dropped. The report at the end names those bricks,
--     so the list can be extended and the script run again.
--
-- Not exported, on purpose:
--   story, partner, topic and     they belong to a user, not to a space
--   their files, likes, comments
--   tag_key without a space       the community-wide catalogue
--   *_invite                      tokens of links sent from the old front
--   run_stat, run_stat_aggregate, statistics, and they name the old labs
--   app_stat
--   refresh_token, mail           sessions and logs

SET @space      := 'SPACE_ID_TO_MIGRATE';
SET @robot_mail := 'robot@gencovery.com';   -- ROBOT_USER_MAIL of the source
-- Optional: a member of the space who becomes the brick user of every
-- migrated brick left with none (their authors usually do not move).
-- Leave NULL to skip.
SET @brick_owner_mail := NULL;

DROP DATABASE IF EXISTS community_export;
CREATE DATABASE community_export DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- ---------------------------------------------------------- the bricks
-- One row per brick to migrate, by name (brick.name is UNIQUE). Every
-- major and every version of each brick travels.
CREATE TABLE community_export.`migration_brick_list` (
  `name` varchar(255) NOT NULL PRIMARY KEY
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO community_export.`migration_brick_list` (`name`) VALUES
  ('BRICK_NAME_1'),('BRICK_NAME_2');

-- ------------------------------------------------------ space and users
CREATE TABLE community_export.`space`      LIKE `space`;
CREATE TABLE community_export.`space_user` LIKE `space_user`;
CREATE TABLE community_export.`user`       LIKE `user`;

INSERT INTO community_export.`space`      SELECT * FROM `space`      WHERE id       = @space;
INSERT INTO community_export.`space_user` SELECT * FROM `space_user` WHERE space_id = @space;

INSERT INTO community_export.`user` SELECT u.* FROM `user` u
WHERE u.email = @robot_mail OR u.id IN (
  SELECT id FROM (
          SELECT user_id             AS id FROM community_export.`space_user`
    UNION SELECT added_by_id              FROM community_export.`space_user`
    UNION SELECT created_by_id            FROM community_export.`space`
    UNION SELECT last_modified_by_id      FROM community_export.`space`
  ) refs WHERE id IS NOT NULL);

-- --------------------------------------------------------------- bricks
CREATE TABLE community_export.`brick`                   LIKE `brick`;
CREATE TABLE community_export.`brick_major_version`     LIKE `brick_major_version`;
CREATE TABLE community_export.`brick_version`           LIKE `brick_version`;
CREATE TABLE community_export.`brick_version_reference` LIKE `brick_version_reference`;
CREATE TABLE community_export.`brick_user`              LIKE `brick_user`;
CREATE TABLE community_export.`like_brick`              LIKE `like_brick`;

INSERT INTO community_export.`brick` SELECT b.* FROM `brick` b
  JOIN community_export.`migration_brick_list` l ON l.name = b.name;
INSERT INTO community_export.`brick_major_version` SELECT x.* FROM `brick_major_version` x
  JOIN community_export.`brick` b ON b.id = x.brick_id;
INSERT INTO community_export.`brick_version` SELECT x.* FROM `brick_version` x
  JOIN community_export.`brick_major_version` mv ON mv.id = x.brick_major_version_id;

-- both ends must travel; the others are named in the report below
INSERT INTO community_export.`brick_version_reference` SELECT r.* FROM `brick_version_reference` r
  JOIN community_export.`brick_version` a ON a.id = r.brick_version_id
  JOIN community_export.`brick_version` z ON z.id = r.reference_id;

INSERT INTO community_export.`brick_user` SELECT x.* FROM `brick_user` x
  JOIN community_export.`brick` b ON b.id      = x.brick_id
  JOIN community_export.`user`  u ON u.id      = x.user_id;
INSERT INTO community_export.`like_brick` SELECT x.* FROM `like_brick` x
  JOIN community_export.`brick` b ON b.id      = x.entity_id
  JOIN community_export.`user`  u ON u.id      = x.liked_by_id;

-- ------------------------------------------- brick technical documentation
CREATE TABLE community_export.`technical_folder`          LIKE `technical_folder`;
CREATE TABLE community_export.`task`                      LIKE `task`;
CREATE TABLE community_export.`protocol`                  LIKE `protocol`;
CREATE TABLE community_export.`resource`                  LIKE `resource`;
CREATE TABLE community_export.`technical_doc_other_class` LIKE `technical_doc_other_class`;

INSERT INTO community_export.`technical_folder` SELECT x.* FROM `technical_folder` x
  JOIN community_export.`brick_major_version` mv ON mv.id = x.brick_major_version_id;
INSERT INTO community_export.`task` SELECT x.* FROM `task` x
  JOIN community_export.`technical_folder` t ON t.id = x.technical_folder_id;
INSERT INTO community_export.`protocol` SELECT x.* FROM `protocol` x
  JOIN community_export.`technical_folder` t ON t.id = x.technical_folder_id;
INSERT INTO community_export.`resource` SELECT x.* FROM `resource` x
  JOIN community_export.`technical_folder` t ON t.id = x.technical_folder_id;
INSERT INTO community_export.`technical_doc_other_class` SELECT x.* FROM `technical_doc_other_class` x
  JOIN community_export.`technical_folder` t ON t.id = x.technical_folder_id;

-- ----------------------------------------- brick written documentation
CREATE TABLE community_export.`folder`             LIKE `folder`;
CREATE TABLE community_export.`documentation`      LIKE `documentation`;
CREATE TABLE community_export.`file_documentation` LIKE `file_documentation`;

-- every folder of a major, whatever its depth: folder.mpath is made of
-- ids, which are kept, so the tree stays valid as it is
INSERT INTO community_export.`folder` SELECT x.* FROM `folder` x
  JOIN community_export.`brick_major_version` mv ON mv.id = x.brick_major_version_id;
INSERT INTO community_export.`documentation` SELECT x.* FROM `documentation` x
  JOIN community_export.`folder` f ON f.id = x.folder_id;
INSERT INTO community_export.`file_documentation` SELECT x.* FROM `file_documentation` x
  JOIN community_export.`documentation` d ON d.id = x.entity_id;

-- --------------------------------------------------------------- agents
CREATE TABLE community_export.`agent`                            LIKE `agent`;
CREATE TABLE community_export.`agent_version`                    LIKE `agent_version`;
CREATE TABLE community_export.`agent_version_brick_dependencies` LIKE `agent_version_brick_dependencies`;
CREATE TABLE community_export.`agent_co_author`                  LIKE `agent_co_author`;
CREATE TABLE community_export.`comment_agent`                    LIKE `comment_agent`;
CREATE TABLE community_export.`like_agent`                       LIKE `like_agent`;
CREATE TABLE community_export.`file_agent`                       LIKE `file_agent`;

INSERT INTO community_export.`agent` SELECT * FROM `agent` WHERE space_id = @space;
INSERT INTO community_export.`agent_version` SELECT x.* FROM `agent_version` x
  JOIN community_export.`agent` a ON a.id = x.agent_id;
INSERT INTO community_export.`agent_version_brick_dependencies` SELECT x.* FROM `agent_version_brick_dependencies` x
  JOIN community_export.`agent_version` av ON av.id = x.agent_version_id
  JOIN community_export.`brick_version` bv ON bv.id = x.brick_version_id;
INSERT INTO community_export.`agent_co_author` SELECT x.* FROM `agent_co_author` x
  JOIN community_export.`agent` a ON a.id = x.agent_id
  JOIN community_export.`user`  u ON u.id = x.user_id;
INSERT INTO community_export.`comment_agent` SELECT x.* FROM `comment_agent` x
  JOIN community_export.`agent` a ON a.id = x.entity_id
  JOIN community_export.`user`  u ON u.id = x.created_by_id;
INSERT INTO community_export.`like_agent` SELECT x.* FROM `like_agent` x
  JOIN community_export.`agent` a ON a.id = x.entity_id
  JOIN community_export.`user`  u ON u.id = x.liked_by_id;
INSERT INTO community_export.`file_agent` SELECT x.* FROM `file_agent` x
  JOIN community_export.`agent` a ON a.id = x.entity_id;

-- ----------------------------------------------------------------- apps
CREATE TABLE community_export.`app`           LIKE `app`;
CREATE TABLE community_export.`app_co_author` LIKE `app_co_author`;
CREATE TABLE community_export.`app_user`      LIKE `app_user`;
CREATE TABLE community_export.`comment_app`   LIKE `comment_app`;
CREATE TABLE community_export.`like_app`      LIKE `like_app`;
CREATE TABLE community_export.`file_app`      LIKE `file_app`;

INSERT INTO community_export.`app` SELECT * FROM `app` WHERE space_id = @space;
INSERT INTO community_export.`app_co_author` SELECT x.* FROM `app_co_author` x
  JOIN community_export.`app`  a ON a.id = x.community_app_id
  JOIN community_export.`user` u ON u.id = x.user_id;
INSERT INTO community_export.`app_user` SELECT x.* FROM `app_user` x
  JOIN community_export.`app`  a ON a.id = x.app_id
  JOIN community_export.`user` u ON u.id = x.user_id;
INSERT INTO community_export.`comment_app` SELECT x.* FROM `comment_app` x
  JOIN community_export.`app`  a ON a.id = x.entity_id
  JOIN community_export.`user` u ON u.id = x.created_by_id;
INSERT INTO community_export.`like_app` SELECT x.* FROM `like_app` x
  JOIN community_export.`app`  a ON a.id = x.entity_id
  JOIN community_export.`user` u ON u.id = x.liked_by_id;
INSERT INTO community_export.`file_app` SELECT x.* FROM `file_app` x
  JOIN community_export.`app` a ON a.id = x.entity_id;

-- ----------------------------------------------------------------- tags
CREATE TABLE community_export.`tag_key`       LIKE `tag_key`;
CREATE TABLE community_export.`tag_value`     LIKE `tag_value`;
CREATE TABLE community_export.`tag_co_author` LIKE `tag_co_author`;
CREATE TABLE community_export.`comment_tag`   LIKE `comment_tag`;
CREATE TABLE community_export.`like_tag`      LIKE `like_tag`;

INSERT INTO community_export.`tag_key` SELECT * FROM `tag_key` WHERE space_id = @space;
INSERT INTO community_export.`tag_value` SELECT x.* FROM `tag_value` x
  JOIN community_export.`tag_key` t ON t.id = x.tag_key_id;
INSERT INTO community_export.`tag_co_author` SELECT x.* FROM `tag_co_author` x
  JOIN community_export.`tag_key` t ON t.id = x.tag_key_id
  JOIN community_export.`user`    u ON u.id = x.user_id;
INSERT INTO community_export.`comment_tag` SELECT x.* FROM `comment_tag` x
  JOIN community_export.`tag_key` t ON t.id = x.entity_id
  JOIN community_export.`user`    u ON u.id = x.created_by_id;
INSERT INTO community_export.`like_tag` SELECT x.* FROM `like_tag` x
  JOIN community_export.`tag_key` t ON t.id = x.entity_id
  JOIN community_export.`user`    u ON u.id = x.liked_by_id;

-- ---------------------------------------------------------------- icons
-- The whole catalogue: styles (agent, task, protocol...) name icons by
-- technical_name, and an empty target has none.
CREATE TABLE community_export.`icon` LIKE `icon`;
INSERT INTO community_export.`icon` SELECT * FROM `icon`;

-- ============================================================ REPORT
-- Read before going further. Every query answers with rows, never with
-- nothing, so an empty section is visibly empty.

-- R1. listed bricks that do not exist on the source (typos)
SELECT 'brick name not found' AS problem, l.name
FROM community_export.`migration_brick_list` l
LEFT JOIN community_export.`brick` b ON b.name = l.name
WHERE b.id IS NULL;

-- R2. bricks something migrated depends on, but which are not in the
--     list. Their dependency rows are dropped; add them to the list and
--     run the script again to keep them.
SELECT DISTINCT 'missing dependency' AS problem, b.name, 'brick' AS needed_by
FROM `brick_version_reference` r
JOIN community_export.`brick_version` v ON v.id = r.brick_version_id
JOIN `brick_version`       rv ON rv.id = r.reference_id
JOIN `brick_major_version` mv ON mv.id = rv.brick_major_version_id
JOIN `brick`               b  ON b.id  = mv.brick_id
WHERE b.id NOT IN (SELECT id FROM community_export.`brick`)
UNION
SELECT DISTINCT 'missing dependency', b.name, 'agent'
FROM `agent_version_brick_dependencies` d
JOIN community_export.`agent_version` av ON av.id = d.agent_version_id
JOIN `brick_version`       bv ON bv.id = d.brick_version_id
JOIN `brick_major_version` mv ON mv.id = bv.brick_major_version_id
JOIN `brick`               b  ON b.id  = mv.brick_id
WHERE b.id NOT IN (SELECT id FROM community_export.`brick`);

-- R3. listed bricks private to ANOTHER space: they become private to the
--     migrated space (the fix-up below)
SELECT 'private to another space' AS note, b.name, s.name AS space_name
FROM community_export.`brick` b
LEFT JOIN `space` s ON s.id = b.space_id
WHERE b.space_id IS NOT NULL AND b.space_id <> @space;

-- R4. what is left behind because it belongs to somebody who is not a
--     member of the space
SELECT 'brick_user' AS dropped, COUNT(*) AS n FROM `brick_user` x
  JOIN community_export.`brick` b ON b.id = x.brick_id
  WHERE x.user_id NOT IN (SELECT id FROM community_export.`user`)
UNION ALL SELECT 'agent_co_author', COUNT(*) FROM `agent_co_author` x
  JOIN community_export.`agent` a ON a.id = x.agent_id
  WHERE x.user_id NOT IN (SELECT id FROM community_export.`user`)
UNION ALL SELECT 'app_co_author', COUNT(*) FROM `app_co_author` x
  JOIN community_export.`app` a ON a.id = x.community_app_id
  WHERE x.user_id NOT IN (SELECT id FROM community_export.`user`)
UNION ALL SELECT 'comments', (
    SELECT COUNT(*) FROM `comment_agent` x JOIN community_export.`agent` a ON a.id = x.entity_id
      WHERE COALESCE(x.created_by_id, '') NOT IN (SELECT id FROM community_export.`user`))
  + (SELECT COUNT(*) FROM `comment_app` x JOIN community_export.`app` a ON a.id = x.entity_id
      WHERE COALESCE(x.created_by_id, '') NOT IN (SELECT id FROM community_export.`user`))
  + (SELECT COUNT(*) FROM `comment_tag` x JOIN community_export.`tag_key` t ON t.id = x.entity_id
      WHERE COALESCE(x.created_by_id, '') NOT IN (SELECT id FROM community_export.`user`));

-- ============================================================ FIX-UPS

-- F1. a private brick keeps its visibility, inside the migrated space
UPDATE community_export.`brick` SET space_id = @space
WHERE space_id IS NOT NULL AND space_id <> @space;

-- F2. authorship by somebody who does not move becomes NULL
UPDATE community_export.`brick`                     SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`brick`                     SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`brick_major_version`       SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`brick_major_version`       SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`brick_version`             SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`brick_version`             SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`technical_folder`          SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`technical_folder`          SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`task`                      SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`task`                      SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`protocol`                  SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`protocol`                  SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`resource`                  SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`resource`                  SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`technical_doc_other_class` SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`technical_doc_other_class` SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`folder`                    SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`folder`                    SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`documentation`             SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`documentation`             SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`file_documentation`        SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`agent`                     SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`agent`                     SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`comment_agent`             SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`file_agent`                SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`app`                       SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`app`                       SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`comment_app`               SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`file_app`                  SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`tag_key`                   SET created_by_id       = NULL WHERE created_by_id       NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`tag_key`                   SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);
UPDATE community_export.`comment_tag`               SET last_modified_by_id = NULL WHERE last_modified_by_id NOT IN (SELECT id FROM community_export.`user`);

-- F3. an agent forked from an agent of another space loses the link
--     (a plain column, no foreign key)
UPDATE community_export.`agent` SET parent_agent_version_id = NULL
WHERE parent_agent_version_id NOT IN (SELECT id FROM community_export.`agent_version`);

-- F4. counters, now that likes and comments were filtered
UPDATE community_export.`brick` x SET
  likes = (SELECT COUNT(*) FROM community_export.`like_brick` l WHERE l.entity_id = x.id);
UPDATE community_export.`agent` x SET
  likes    = (SELECT COUNT(*) FROM community_export.`like_agent`    l WHERE l.entity_id = x.id),
  comments = (SELECT COUNT(*) FROM community_export.`comment_agent` c WHERE c.entity_id = x.id);
UPDATE community_export.`app` x SET
  likes    = (SELECT COUNT(*) FROM community_export.`like_app`    l WHERE l.entity_id = x.id),
  comments = (SELECT COUNT(*) FROM community_export.`comment_app` c WHERE c.entity_id = x.id);
UPDATE community_export.`tag_key` x SET
  likes    = (SELECT COUNT(*) FROM community_export.`like_tag`    l WHERE l.entity_id = x.id),
  comments = (SELECT COUNT(*) FROM community_export.`comment_tag` c WHERE c.entity_id = x.id);

-- F5. a brick user for every brick left with none, if one was given
INSERT INTO community_export.`brick_user` (id, brick_id, user_id)
SELECT UUID(), b.id, u.id
FROM community_export.`brick` b
JOIN community_export.`user` u ON u.email = @brick_owner_mail
WHERE NOT EXISTS (SELECT 1 FROM community_export.`brick_user` x WHERE x.brick_id = b.id);

-- R5. what is staged
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'community_export' ORDER BY TABLE_NAME;
