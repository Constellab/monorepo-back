-- Run on the TARGET application database, once 03-check.sql comes back
-- clean. Merges the staging schema into the application's tables.
--
--   mysql -h <dst> -u <user> -p -t <dst_db> < 04-import.sql
--
-- Fill in the variables below first.
--
-- The target is a bare schema — cn-db-schema.sql, not cn-dev-init.sql —
-- and receives the source's configuration along with the space: the
-- reference data, `settings`, and the buckets with their credentials,
-- ids kept. Those go in with plain INSERTs, so a target that already
-- holds any of it rolls everything back on the first clash; the
-- `configuration already here` line of 03-check.sql catches that first.
--
-- The buckets still carry the SOURCE's credentials after this script.
-- Change them before the application starts writing — see README.md.

SET @space      := 'SPACE_ID_TO_MIGRATE';
SET @robot_mail := 'robot@gencovery.com';   -- ROBOT_USER_MAIL of the target

-- Foreign keys are off for the whole import: hierarchy_object references
-- itself, lab and lab_status_history reference each other, and rows
-- arrive in bulk. Section 6 checks the result.
--
-- Everything up to the COMMIT runs in one transaction: the tables are
-- InnoDB and nothing here is DDL, so a statement that fails halfway
-- leaves the target exactly as it was. Do not add --force to the mysql
-- command line, or the script will carry on past the failure.
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- ---------------------------------------------------------------------
-- 1. rows that may already exist here, seeded by cn-dev-init.sql
--    (fixed UUIDs, so identical rows collide on the primary key)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO `user`                     SELECT * FROM space_export.`user`;
INSERT IGNORE INTO `user_2_fa`                SELECT * FROM space_export.`user_2_fa`;
INSERT IGNORE INTO `brick`                    SELECT * FROM space_export.`brick`;
INSERT IGNORE INTO `brick_version`            SELECT * FROM space_export.`brick_version`;
INSERT IGNORE INTO `lab_config`               SELECT * FROM space_export.`lab_config`;
INSERT IGNORE INTO `lab_config_brick_version` SELECT * FROM space_export.`lab_config_brick_version`;
INSERT IGNORE INTO `group`                    SELECT * FROM space_export.`group`;
INSERT IGNORE INTO `user_group`               SELECT * FROM space_export.`user_group`;

-- ---------------------------------------------------------------------
-- 2. the space itself. Anything colliding here is a mistake, so these
--    are plain inserts and must fail loudly.
-- ---------------------------------------------------------------------
INSERT INTO `space`      SELECT * FROM space_export.`space`;
INSERT INTO `space_user` SELECT * FROM space_export.`space_user`;
INSERT INTO `space_invit`SELECT * FROM space_export.`space_invit`;

INSERT INTO `lab`                SELECT * FROM space_export.`lab`;
INSERT INTO `lab_status_history` SELECT * FROM space_export.`lab_status_history`;
INSERT INTO `lab_user`           SELECT * FROM space_export.`lab_user`;
INSERT INTO `lab_green_option`   SELECT * FROM space_export.`lab_green_option`;

INSERT INTO `hierarchy_object`             SELECT * FROM space_export.`hierarchy_object`;
INSERT INTO `folder`                       SELECT * FROM space_export.`folder`;
INSERT INTO `document`                     SELECT * FROM space_export.`document`;
INSERT INTO `note`                         SELECT * FROM space_export.`note`;
INSERT INTO `scenario`                     SELECT * FROM space_export.`scenario`;
INSERT INTO `resource`                     SELECT * FROM space_export.`resource`;
INSERT INTO `note_scenario`                SELECT * FROM space_export.`note_scenario`;
INSERT INTO `chat_message`                 SELECT * FROM space_export.`chat_message`;
INSERT INTO `folder_user`                  SELECT * FROM space_export.`folder_user`;
INSERT INTO `hierarchy_object_tag`         SELECT * FROM space_export.`hierarchy_object_tag`;
INSERT INTO `hierarchy_object_tag_history` SELECT * FROM space_export.`hierarchy_object_tag_history`;
INSERT INTO `lab_folder`                   SELECT * FROM space_export.`lab_folder`;

INSERT INTO `activity`     SELECT * FROM space_export.`activity`;
INSERT INTO `notification` SELECT * FROM space_export.`notification`;

INSERT INTO `lab_backup_option`         SELECT * FROM space_export.`lab_backup_option`;
INSERT INTO `lab_backup_history`        SELECT * FROM space_export.`lab_backup_history`;
INSERT INTO `lab_backup_history_detail` SELECT * FROM space_export.`lab_backup_history_detail`;
INSERT INTO `lab_volume`                SELECT * FROM space_export.`lab_volume`;
INSERT INTO `lab_free`                  SELECT * FROM space_export.`lab_free`
  WHERE user_id IN (SELECT id FROM `user`);   -- a free lab belongs to one user

-- ---------------------------------------------------------------------
-- 3. configuration
-- ---------------------------------------------------------------------
INSERT INTO `country`               SELECT * FROM space_export.`country`;
INSERT INTO `city`                  SELECT * FROM space_export.`city`;
INSERT INTO `cloud_provider`        SELECT * FROM space_export.`cloud_provider`;
INSERT INTO `cloud_provider_region` SELECT * FROM space_export.`cloud_provider_region`;
INSERT INTO `server_standard`       SELECT * FROM space_export.`server_standard`;
INSERT INTO `server_cloud`          SELECT * FROM space_export.`server_cloud`;
INSERT INTO `server_price`          SELECT * FROM space_export.`server_price`;
INSERT INTO `storage_price`         SELECT * FROM space_export.`storage_price`;

-- The application reads only the first row and creates a default one on
-- first use, so the target's rows are replaced rather than added to.
DELETE FROM `settings`;
INSERT INTO `settings` SELECT * FROM space_export.`settings`;

INSERT INTO `bucket_credentials` SELECT * FROM space_export.`bucket_credentials`;
INSERT INTO `bucket`             SELECT * FROM space_export.`bucket`;

-- ---------------------------------------------------------------------
-- 4. labs. The rows stay — note, scenario and resource reference them
--    with a NOT NULL foreign key — but they no longer name a server.
--    The server type and the region are kept when this instance knows
--    them. Provision the servers again from this instance, then restore
--    each lab's backup onto its new server.
-- ---------------------------------------------------------------------
UPDATE `lab` l
  LEFT JOIN `server_cloud` sc ON sc.id = l.server_cloud_id
  LEFT JOIN `cloud_provider_region` r ON r.id = l.region_id
   SET l.server_cloud_id       = sc.id,
       l.region_id             = r.id,
       l.server_instance_id    = NULL,
       l.server_volume_id      = NULL,
       l.server_ip_address_id  = NULL,
       l.virtual_host          = NULL,
       l.dns_configured        = 0,
       l.server_task_status    = 'NONE',
       l.server_task_text      = NULL,
       l.server_task_datetime  = NULL
 WHERE l.space_id = @space;

UPDATE `lab_status_history` s
  JOIN `lab` l ON l.current_status_id = s.id
   SET s.status = 'NO_SERVER'
 WHERE l.space_id = @space;

-- ---------------------------------------------------------------------
-- 5. authors who did not travel -> the robot user, which section 1 has
--    just brought in. A missing robot leaves @robot NULL, and these then
--    fail on the NOT NULL columns, rolling everything back.
-- ---------------------------------------------------------------------
SET @robot := NULL;
SELECT id INTO @robot FROM `user` WHERE email = @robot_mail;

UPDATE `cloud_provider`        SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `cloud_provider`        SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `cloud_provider_region` SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `cloud_provider_region` SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `server_standard`       SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `server_standard`       SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `server_cloud`          SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `server_cloud`          SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `server_price`          SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `server_price`          SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `storage_price`         SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `storage_price`         SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `settings`              SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `settings`              SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `lab_backup_option`     SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `lab_backup_option`     SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `lab_backup_history`    SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `lab_backup_history`    SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `lab_volume`            SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `lab_volume`            SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `lab_free`              SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `lab_free`              SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `bucket`                SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `bucket`                SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);
UPDATE `bucket_credentials`    SET created_by_id = @robot WHERE created_by_id NOT IN (SELECT id FROM `user`);
UPDATE `bucket_credentials`    SET last_modified_by_id = @robot WHERE last_modified_by_id NOT IN (SELECT id FROM `user`);

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 6. integrity. Every count must be 0.
-- ---------------------------------------------------------------------
SELECT 'hierarchy_object -> user'   AS dangling, COUNT(*) AS n FROM `hierarchy_object` h
  LEFT JOIN `user` u ON u.id = h.user_id WHERE u.id IS NULL
UNION ALL SELECT 'hierarchy_object -> space', COUNT(*) FROM `hierarchy_object` h
  LEFT JOIN `space` s ON s.id = h.space_id WHERE s.id IS NULL
UNION ALL SELECT 'hierarchy_object -> parent', COUNT(*) FROM `hierarchy_object` h
  LEFT JOIN `hierarchy_object` p ON p.id = h.parent_id WHERE h.parent_id IS NOT NULL AND p.id IS NULL
UNION ALL SELECT 'folder -> hierarchy_object', COUNT(*) FROM `folder` f
  LEFT JOIN `hierarchy_object` h ON h.id = f.id WHERE h.id IS NULL
UNION ALL SELECT 'document -> hierarchy_object', COUNT(*) FROM `document` d
  LEFT JOIN `hierarchy_object` h ON h.id = d.id WHERE h.id IS NULL
UNION ALL SELECT 'note -> lab', COUNT(*) FROM `note` n
  LEFT JOIN `lab` l ON l.id = n.lab_id WHERE l.id IS NULL
UNION ALL SELECT 'note -> lab_config', COUNT(*) FROM `note` n
  LEFT JOIN `lab_config` c ON c.id = n.lab_config_id WHERE c.id IS NULL
UNION ALL SELECT 'scenario -> lab_config', COUNT(*) FROM `scenario` sc
  LEFT JOIN `lab_config` c ON c.id = sc.lab_config_id WHERE c.id IS NULL
UNION ALL SELECT 'resource -> lab', COUNT(*) FROM `resource` r
  LEFT JOIN `lab` l ON l.id = r.lab_id WHERE l.id IS NULL
UNION ALL SELECT 'brick_version -> brick', COUNT(*) FROM `brick_version` bv
  LEFT JOIN `brick` b ON b.id = bv.brick_id WHERE b.id IS NULL
UNION ALL SELECT 'space_user -> user', COUNT(*) FROM `space_user` su
  LEFT JOIN `user` u ON u.id = su.user_id WHERE u.id IS NULL
UNION ALL SELECT 'folder_user -> user', COUNT(*) FROM `folder_user` fu
  LEFT JOIN `user` u ON u.id = fu.user_id WHERE u.id IS NULL
UNION ALL SELECT 'lab_user -> user', COUNT(*) FROM `lab_user` lu
  LEFT JOIN `user` u ON u.id = lu.user_id WHERE u.id IS NULL
UNION ALL SELECT 'city -> country', COUNT(*) FROM `city` c
  LEFT JOIN `country` x ON x.id = c.country_id WHERE x.id IS NULL
UNION ALL SELECT 'region -> city', COUNT(*) FROM `cloud_provider_region` r
  LEFT JOIN `city` c ON c.id = r.city_id WHERE c.id IS NULL
UNION ALL SELECT 'server_cloud -> standard', COUNT(*) FROM `server_cloud` s
  LEFT JOIN `server_standard` x ON x.id = s.server_standard_id WHERE x.id IS NULL
UNION ALL SELECT 'settings rows (must be 1)', COUNT(*) - 1 FROM `settings`
UNION ALL SELECT 'bucket -> credentials', COUNT(*) FROM `bucket` b
  WHERE b.credentials_id NOT IN (SELECT id FROM `bucket_credentials`)
UNION ALL SELECT 'bucket -> region', COUNT(*) FROM `bucket` b
  WHERE b.region_id IS NOT NULL AND b.region_id NOT IN (SELECT id FROM `cloud_provider_region`)
UNION ALL SELECT 'space -> bucket', COUNT(*) FROM `space` s
  WHERE s.default_folder_bucket_id NOT IN (SELECT id FROM `bucket`)
     OR s.default_folder_backup_bucket_id NOT IN (SELECT id FROM `bucket`)
UNION ALL SELECT 'root folder -> bucket', COUNT(*) FROM `folder` f
  JOIN `hierarchy_object` h ON h.id = f.id
  WHERE h.parent_id IS NULL
    AND (f.main_storage_id IS NULL OR f.main_storage_id NOT IN (SELECT id FROM `bucket`)
         OR f.backup_storage_id NOT IN (SELECT id FROM `bucket`))
UNION ALL SELECT 'backup -> bucket', COUNT(*) FROM `lab_backup_option` o
  WHERE o.bucket1_id NOT IN (SELECT id FROM `bucket`) OR o.bucket2_id NOT IN (SELECT id FROM `bucket`)
UNION ALL SELECT 'backup history -> bucket', COUNT(*) FROM `lab_backup_history` h
  WHERE h.bucket_id NOT IN (SELECT id FROM `bucket`);

-- What the application will reach once it starts: the credentials to
-- change are listed here, with the endpoint and the buckets behind each.
SELECT c.id AS credentials_id, c.name AS credentials, c.access_key_id,
       r.s3_endpoint, GROUP_CONCAT(b.name ORDER BY b.name SEPARATOR ', ') AS buckets
FROM `bucket_credentials` c
JOIN `bucket` b ON b.credentials_id = c.id
LEFT JOIN `cloud_provider_region` r ON r.id = b.region_id
GROUP BY c.id, c.name, c.access_key_id, r.s3_endpoint
ORDER BY c.name, r.s3_endpoint;

-- @robot must not be NULL; the free lab domain must be one of
-- LAB_ALLOWED_DOMAINS of THIS instance, or be changed from the admin.
SELECT @robot AS robot_user_id,
       (SELECT JSON_VALUE(free_lab_config, '$.domain') FROM `settings` LIMIT 1) AS free_lab_domain;
