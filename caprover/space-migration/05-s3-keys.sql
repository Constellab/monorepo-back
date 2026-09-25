-- Run on the SOURCE server, against the source application database,
-- after 01-extract.sql. Lists every object the space owns in the object
-- storage, as "bucket name <tab> object key", for 06-copy-s3.sh.
--
--   mysql -N -B -h <src> -u <user> -p <src_db> < 05-s3-keys.sql > keys.tsv
--
-- Keys are flat: BlObjectStorageService stores an object under the
-- filename it returns, which is what the row keeps. There is no prefix
-- per space or per folder, so the copy has to be driven by this list —
-- a whole-bucket copy would carry the other spaces' files along.
--
-- Lab backups are the exception: they are written under
-- "<space_id>/<lab_id>/" (CnLabBackupOptionService.getBackupS3Prefix),
-- so they come as one prefix per bucket, ending with "/", and
-- 06-copy-s3.sh copies it whole.
--
-- Profile pictures and space images are not in the `bucket` table: the
-- application reaches them with OBJECT_STORAGE_DEFAULT_* from its
-- environment, in the buckets named by BUCKET_USER_PROFILE_PICTURE and
-- BUCKET_SPACE_IMAGE (older releases fix the names in
-- cn-core-config.service.ts). The two variables below are those names ON
-- THE SOURCE.
--
-- Lab buckets (bucket_type LAB) are left out: they live on a lab's own
-- server and come back with the lab's backup.

SET @space               := 'SPACE_ID_TO_MIGRATE';
SET @user_image_bucket   := 'SOURCE_BUCKET_USER_PROFILE_PICTURE';
SET @space_image_bucket  := 'SOURCE_BUCKET_SPACE_IMAGE';

SELECT b.name, d.filename          -- documents, main bucket
FROM space_export.`document` d
JOIN space_export.`hierarchy_object` h  ON h.id  = d.id
JOIN space_export.`folder`           rf ON rf.id = COALESCE(h.root_parent_id, h.id)
JOIN `bucket`                        b  ON b.id  = rf.main_storage_id
WHERE b.bucket_type <> 'LAB'

UNION
SELECT b.name, d.filename          -- documents, backup bucket
FROM space_export.`document` d
JOIN space_export.`hierarchy_object` h  ON h.id  = d.id
JOIN space_export.`folder`           rf ON rf.id = COALESCE(h.root_parent_id, h.id)
JOIN `bucket`                        b  ON b.id  = rf.backup_storage_id
WHERE b.bucket_type <> 'LAB'

UNION
SELECT @user_image_bucket, u.photo -- profile pictures of the migrated users
FROM space_export.`user` u
WHERE u.photo IS NOT NULL AND u.photo <> ''

UNION
SELECT @space_image_bucket, s.photo -- the space's own image
FROM space_export.`space` s
WHERE s.photo IS NOT NULL AND s.photo <> ''

UNION
SELECT b.name, CONCAT(@space, '/') -- lab backups, a whole prefix
FROM `bucket` b
WHERE b.id IN (SELECT bucket1_id FROM space_export.`lab_backup_option`
         UNION SELECT bucket2_id FROM space_export.`lab_backup_option`
         UNION SELECT bucket_id  FROM space_export.`lab_backup_history`);
