-- Run on the SOURCE database. Builds a staging schema `space_export`
-- holding one space, the configuration a new instance needs, and nothing
-- else.
--
--   mysql -h <src> -u <user> -p --default-character-set=utf8mb4 <src_db> < 01-extract.sql
--
-- Every id in this schema is a UUID, so rows are copied verbatim, ids
-- kept, no remapping. `CREATE TABLE ... LIKE` does not copy foreign
-- keys, which is why insertion order below does not matter.
--
-- The space: its tree, content, labs, members and every user its rows
-- name. The configuration, copied whole: reference data (countries,
-- cities, providers, regions, servers, prices), `settings`, and the
-- buckets with their credentials. The lab backups of the space.
--
-- The staging schema therefore holds S3 secrets as well as the user
-- rows: drop it, and delete its dumps, as soon as the import is done.
--
-- Not exported, on purpose:
--   hierarchy_object_token      public share links of the old front
--   refresh_token, oauth_grant  users sign in again
--   front_error, mail           logs

SET @space := 'SPACE_ID_TO_MIGRATE';
SET @robot_mail := 'robot@gencovery.com';   -- ROBOT_USER_MAIL of the source

DROP DATABASE IF EXISTS space_export;
CREATE DATABASE space_export DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- -------------------------------------------------------------- space
CREATE TABLE space_export.`space`       LIKE `space`;
CREATE TABLE space_export.`space_user`  LIKE `space_user`;
CREATE TABLE space_export.`space_invit` LIKE `space_invit`;

INSERT INTO space_export.`space`       SELECT * FROM `space`       WHERE id       = @space;
INSERT INTO space_export.`space_user`  SELECT * FROM `space_user`  WHERE space_id = @space;
INSERT INTO space_export.`space_invit` SELECT * FROM `space_invit` WHERE space_id = @space;

-- --------------------------------------------------------------- labs
-- The lab rows are kept even though the servers are rebuilt on the new
-- instance: note.lab_id, scenario.lab_id and resource.lab_id are NOT
-- NULL. 04-import.sql detaches them from the old infrastructure.
CREATE TABLE space_export.`lab`                LIKE `lab`;
CREATE TABLE space_export.`lab_status_history` LIKE `lab_status_history`;
CREATE TABLE space_export.`lab_user`           LIKE `lab_user`;
CREATE TABLE space_export.`lab_green_option`   LIKE `lab_green_option`;
CREATE TABLE space_export.`lab_folder`         LIKE `lab_folder`;

INSERT INTO space_export.`lab` SELECT * FROM `lab` WHERE space_id = @space;
-- current status only; the full history is of no use on the new instance
INSERT INTO space_export.`lab_status_history` SELECT s.* FROM `lab_status_history` s
  JOIN space_export.`lab` l ON l.current_status_id = s.id;
INSERT INTO space_export.`lab_user` SELECT x.* FROM `lab_user` x
  JOIN space_export.`lab` l ON l.id = x.lab_id;
INSERT INTO space_export.`lab_green_option` SELECT x.* FROM `lab_green_option` x
  JOIN space_export.`lab` l ON l.id = x.lab_id;
INSERT INTO space_export.`lab_folder` SELECT x.* FROM `lab_folder` x
  JOIN space_export.`lab` l ON l.id = x.lab_id;

-- ------------------------------------------------- hierarchy and content
CREATE TABLE space_export.`hierarchy_object`             LIKE `hierarchy_object`;
CREATE TABLE space_export.`folder`                       LIKE `folder`;
CREATE TABLE space_export.`document`                     LIKE `document`;
CREATE TABLE space_export.`note`                         LIKE `note`;
CREATE TABLE space_export.`scenario`                     LIKE `scenario`;
CREATE TABLE space_export.`resource`                     LIKE `resource`;
CREATE TABLE space_export.`note_scenario`                LIKE `note_scenario`;
CREATE TABLE space_export.`chat_message`                 LIKE `chat_message`;
CREATE TABLE space_export.`folder_user`                  LIKE `folder_user`;
CREATE TABLE space_export.`hierarchy_object_tag`         LIKE `hierarchy_object_tag`;
CREATE TABLE space_export.`hierarchy_object_tag_history` LIKE `hierarchy_object_tag_history`;

INSERT INTO space_export.`hierarchy_object` SELECT * FROM `hierarchy_object` WHERE space_id = @space;

-- folder, document, note, scenario and resource share the id of their
-- hierarchy_object (FK_<table>_id references hierarchy_object.id)
INSERT INTO space_export.`folder`   SELECT x.* FROM `folder`   x JOIN space_export.`hierarchy_object` h ON h.id = x.id;
INSERT INTO space_export.`document` SELECT x.* FROM `document` x JOIN space_export.`hierarchy_object` h ON h.id = x.id;
INSERT INTO space_export.`note`     SELECT x.* FROM `note`     x JOIN space_export.`hierarchy_object` h ON h.id = x.id;
INSERT INTO space_export.`scenario` SELECT x.* FROM `scenario` x JOIN space_export.`hierarchy_object` h ON h.id = x.id;
INSERT INTO space_export.`resource` SELECT x.* FROM `resource` x JOIN space_export.`hierarchy_object` h ON h.id = x.id;

INSERT INTO space_export.`note_scenario` SELECT ns.* FROM `note_scenario` ns
  JOIN space_export.`note` n ON n.id = ns.note_id;
INSERT INTO space_export.`chat_message` SELECT c.* FROM `chat_message` c
  JOIN space_export.`hierarchy_object` h ON h.id = c.folder_hierarchy_id;
INSERT INTO space_export.`folder_user` SELECT fu.* FROM `folder_user` fu
  JOIN space_export.`hierarchy_object` h ON h.id = fu.root_folder_id;
INSERT INTO space_export.`hierarchy_object_tag` SELECT t.* FROM `hierarchy_object_tag` t
  JOIN space_export.`hierarchy_object` h ON h.id = t.hierarchy_object_id;
INSERT INTO space_export.`hierarchy_object_tag_history` SELECT t.* FROM `hierarchy_object_tag_history` t
  JOIN space_export.`hierarchy_object` h ON h.id = t.hierarchy_object_id;

-- ------------------------------------------------------- lab configurations
-- note.lab_config_id and scenario.lab_config_id are NOT NULL, so the
-- referenced lab_config rows travel too, with their brick versions.
CREATE TABLE space_export.`lab_config`               LIKE `lab_config`;
CREATE TABLE space_export.`lab_config_brick_version` LIKE `lab_config_brick_version`;
CREATE TABLE space_export.`brick_version`            LIKE `brick_version`;
CREATE TABLE space_export.`brick`                    LIKE `brick`;

INSERT INTO space_export.`lab_config` SELECT * FROM `lab_config` WHERE id IN (
        SELECT lab_config_id FROM space_export.`lab` WHERE lab_config_id IS NOT NULL
  UNION SELECT lab_config_id FROM space_export.`note`
  UNION SELECT lab_config_id FROM space_export.`scenario`);
INSERT INTO space_export.`lab_config_brick_version` SELECT x.* FROM `lab_config_brick_version` x
  JOIN space_export.`lab_config` lc ON lc.id = x.lab_config_id;
INSERT INTO space_export.`brick_version` SELECT * FROM `brick_version`
  WHERE id IN (SELECT brick_version_id FROM space_export.`lab_config_brick_version`);
INSERT INTO space_export.`brick` SELECT * FROM `brick`
  WHERE id IN (SELECT brick_id FROM space_export.`brick_version`);

-- ------------------------------------------------------------- teams
CREATE TABLE space_export.`group`      LIKE `group`;
CREATE TABLE space_export.`user_group` LIKE `user_group`;

INSERT INTO space_export.`group` SELECT * FROM `group` WHERE space_id = @space;
INSERT INTO space_export.`user_group` SELECT ug.* FROM `user_group` ug
  JOIN space_export.`group` g ON g.id = ug.group_id;

-- ------------------------------------------------ activity and notifications
-- Drop these four statements if the history is not worth migrating.
CREATE TABLE space_export.`activity`     LIKE `activity`;
CREATE TABLE space_export.`notification` LIKE `notification`;
INSERT INTO space_export.`activity`     SELECT * FROM `activity`     WHERE space_id = @space;
INSERT INTO space_export.`notification` SELECT * FROM `notification` WHERE space_id = @space;

-- ------------------------------------------------------------- users
-- Not just the space members: created_by_id / last_modified_by_id are
-- NOT NULL everywhere and can name a user who has left the space.
CREATE TABLE space_export.`_user_ids` (id VARCHAR(36) NOT NULL PRIMARY KEY);

INSERT IGNORE INTO space_export.`_user_ids` (id)
SELECT id FROM (
        SELECT user_id             AS id FROM space_export.`space_user`
  UNION SELECT added_by_id              FROM space_export.`space_user`
  UNION SELECT created_by_id            FROM space_export.`space`
  UNION SELECT last_modified_by_id      FROM space_export.`space`
  UNION SELECT created_by_id            FROM space_export.`space_invit`
  UNION SELECT last_modified_by_id      FROM space_export.`space_invit`
  UNION SELECT user_id                  FROM space_export.`hierarchy_object`
  UNION SELECT created_by_id            FROM space_export.`folder`
  UNION SELECT last_modified_by_id      FROM space_export.`folder`
  UNION SELECT created_by_id            FROM space_export.`document`
  UNION SELECT last_modified_by_id      FROM space_export.`document`
  UNION SELECT created_by_id            FROM space_export.`note`
  UNION SELECT last_modified_by_id      FROM space_export.`note`
  UNION SELECT validated_by_id          FROM space_export.`note`
  UNION SELECT last_sync_by_id          FROM space_export.`note`
  UNION SELECT created_by_id            FROM space_export.`scenario`
  UNION SELECT last_modified_by_id      FROM space_export.`scenario`
  UNION SELECT validated_by_id          FROM space_export.`scenario`
  UNION SELECT last_sync_by_id          FROM space_export.`scenario`
  UNION SELECT created_by_id            FROM space_export.`resource`
  UNION SELECT last_modified_by_id      FROM space_export.`resource`
  UNION SELECT created_by_id            FROM space_export.`chat_message`
  UNION SELECT last_modified_by_id      FROM space_export.`chat_message`
  UNION SELECT user_id                  FROM space_export.`folder_user`
  UNION SELECT shared_by_id             FROM space_export.`folder_user`
  UNION SELECT created_by_id            FROM space_export.`hierarchy_object_tag`
  UNION SELECT last_modified_by_id      FROM space_export.`hierarchy_object_tag`
  UNION SELECT created_by_id            FROM space_export.`hierarchy_object_tag_history`
  UNION SELECT last_modified_by_id      FROM space_export.`hierarchy_object_tag_history`
  UNION SELECT created_by_id            FROM space_export.`lab`
  UNION SELECT last_modified_by_id      FROM space_export.`lab`
  UNION SELECT created_by_id            FROM space_export.`lab_status_history`
  UNION SELECT last_modified_by_id      FROM space_export.`lab_status_history`
  UNION SELECT user_id                  FROM space_export.`lab_user`
  UNION SELECT created_by_id            FROM space_export.`lab_user`
  UNION SELECT last_modified_by_id      FROM space_export.`lab_user`
  UNION SELECT created_by_id            FROM space_export.`lab_green_option`
  UNION SELECT last_modified_by_id      FROM space_export.`lab_green_option`
  UNION SELECT created_by_id            FROM space_export.`lab_folder`
  UNION SELECT user_id                  FROM space_export.`group`
  UNION SELECT created_by_id            FROM space_export.`group`
  UNION SELECT last_modified_by_id      FROM space_export.`group`
  UNION SELECT user_id                  FROM space_export.`user_group`
  UNION SELECT created_by_id            FROM space_export.`user_group`
  UNION SELECT user_id                  FROM space_export.`activity`
  UNION SELECT user_id                  FROM space_export.`notification`
  UNION SELECT created_by_id            FROM space_export.`notification`
  UNION SELECT id FROM `user` WHERE email = @robot_mail
) refs WHERE id IS NOT NULL;

-- the SINGLE_USER group each user owns (user.ownGroup, unique per user),
-- collected before the users themselves so its own created_by_id counts
INSERT INTO space_export.`group` SELECT g.* FROM `group` g
  JOIN space_export.`_user_ids` i ON i.id = g.user_id
  WHERE g.type = 'SINGLE_USER';
INSERT INTO space_export.`user_group` SELECT ug.* FROM `user_group` ug
  JOIN space_export.`group` g ON g.id = ug.group_id
  WHERE g.type = 'SINGLE_USER';

INSERT IGNORE INTO space_export.`_user_ids` (id)
SELECT id FROM (
        SELECT created_by_id       AS id FROM space_export.`group`
  UNION SELECT last_modified_by_id      FROM space_export.`group`
  UNION SELECT created_by_id            FROM space_export.`user_group`
) refs WHERE id IS NOT NULL;

CREATE TABLE space_export.`user`      LIKE `user`;
CREATE TABLE space_export.`user_2_fa` LIKE `user_2_fa`;

INSERT INTO space_export.`user` SELECT u.* FROM `user` u
  JOIN space_export.`_user_ids` i ON i.id = u.id;
-- "last space visited" may name a space that stays behind
UPDATE space_export.`user` SET last_connected_space_id = NULL
  WHERE last_connected_space_id IS NOT NULL AND last_connected_space_id <> @space;

INSERT INTO space_export.`user_2_fa` SELECT f.* FROM `user_2_fa` f
  JOIN space_export.`_user_ids` i ON i.id = f.user_id;

-- ----------------------------------------------------- reference data
CREATE TABLE space_export.`country`               LIKE `country`;
CREATE TABLE space_export.`city`                  LIKE `city`;
CREATE TABLE space_export.`cloud_provider`        LIKE `cloud_provider`;
CREATE TABLE space_export.`cloud_provider_region` LIKE `cloud_provider_region`;
CREATE TABLE space_export.`server_standard`       LIKE `server_standard`;
CREATE TABLE space_export.`server_cloud`          LIKE `server_cloud`;
CREATE TABLE space_export.`server_price`          LIKE `server_price`;
CREATE TABLE space_export.`storage_price`         LIKE `storage_price`;
CREATE TABLE space_export.`settings`              LIKE `settings`;

INSERT INTO space_export.`country`               SELECT * FROM `country`;
INSERT INTO space_export.`city`                  SELECT * FROM `city`;
INSERT INTO space_export.`cloud_provider`        SELECT * FROM `cloud_provider`;
INSERT INTO space_export.`cloud_provider_region` SELECT * FROM `cloud_provider_region`;
INSERT INTO space_export.`server_standard`       SELECT * FROM `server_standard`;
INSERT INTO space_export.`server_cloud`          SELECT * FROM `server_cloud`;
INSERT INTO space_export.`server_price`          SELECT * FROM `server_price`;
INSERT INTO space_export.`storage_price`         SELECT * FROM `storage_price`;
INSERT INTO space_export.`settings`              SELECT * FROM `settings`;

-- --------------------------------------------------------- lab backups
-- The backup objects live under "<space_id>/<lab_id>" in the LAB_BACKUP
-- buckets (CnLabBackupOptionService.getBackupS3Prefix); 05-s3-keys.sql
-- lists them for 06-copy-s3.sh.
CREATE TABLE space_export.`lab_backup_option`         LIKE `lab_backup_option`;
CREATE TABLE space_export.`lab_backup_history`        LIKE `lab_backup_history`;
CREATE TABLE space_export.`lab_backup_history_detail` LIKE `lab_backup_history_detail`;
CREATE TABLE space_export.`lab_volume`                LIKE `lab_volume`;
CREATE TABLE space_export.`lab_free`                  LIKE `lab_free`;

INSERT INTO space_export.`lab_backup_option` SELECT x.* FROM `lab_backup_option` x
  JOIN `lab` l ON l.id = x.lab_id WHERE l.space_id = @space;
INSERT INTO space_export.`lab_backup_history` SELECT x.* FROM `lab_backup_history` x
  JOIN `lab` l ON l.id = x.lab_id WHERE l.space_id = @space;
INSERT INTO space_export.`lab_backup_history_detail` SELECT d.* FROM `lab_backup_history_detail` d
  JOIN space_export.`lab_backup_history` h ON h.id = d.history_id;
INSERT INTO space_export.`lab_volume` SELECT x.* FROM `lab_volume` x
  JOIN `lab` l ON l.id = x.lab_id WHERE l.space_id = @space;
INSERT INTO space_export.`lab_free` SELECT x.* FROM `lab_free` x
  JOIN `lab` l ON l.id = x.lab_id WHERE l.space_id = @space;

-- ------------------------------------------------------------ buckets
-- Rows copied as they are, credentials included: the space, its root
-- folders and its backups keep pointing at the same bucket ids. What
-- the target's application reaches is decided afterwards, by editing
-- bucket_credentials (and bucket.name, cloud_provider_region.s3_endpoint
-- if the storage changes) — see README.md.
--
-- Every shared bucket whose credentials belong to no other space, and
-- the space's own lab buckets. Another space's private storage stays.
CREATE TABLE space_export.`bucket`             LIKE `bucket`;
CREATE TABLE space_export.`bucket_credentials` LIKE `bucket_credentials`;

INSERT INTO space_export.`bucket` SELECT b.* FROM `bucket` b
  JOIN `bucket_credentials` c ON c.id = b.credentials_id
  LEFT JOIN `lab` l ON l.id = b.lab_id
  WHERE (c.space_id IS NULL OR c.space_id = @space)
    AND (b.lab_id IS NULL OR l.space_id = @space);
INSERT INTO space_export.`bucket_credentials` SELECT c.* FROM `bucket_credentials` c
  WHERE c.id IN (SELECT credentials_id FROM space_export.`bucket`);

-- ------------------------------------------------------------- report
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'space_export' ORDER BY TABLE_NAME;
