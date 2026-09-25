-- Run on the SOURCE community database, after 01-extract.sql. Lists
-- every object the migration needs in the object storage, as
-- "bucket name <tab> object key", for ../space-migration/06-copy-s3.sh.
--
--   mysql -N -B -h <src> -u <user> -p <src_community_db> < 05-s3-keys.sql > community-keys.tsv
--
-- Unlike the Space, the Community does not keep its buckets in the
-- database: they come from the BUCKET_* variables of the source
-- community-api. Copy them here. Every object is written to the main
-- and to the backup bucket, so both are listed.

SET @documentation        := 'SOURCE_BUCKET_DOCUMENTATION';
SET @documentation_backup := 'SOURCE_BUCKET_DOCUMENTATION_BACKUP';
SET @agents               := 'SOURCE_BUCKET_AGENTS';
SET @agents_backup        := 'SOURCE_BUCKET_AGENTS_BACKUP';
SET @apps                 := 'SOURCE_BUCKET_APPS';
SET @apps_backup          := 'SOURCE_BUCKET_APPS_BACKUP';
SET @icon                 := 'SOURCE_BUCKET_ICON';
SET @icon_backup          := 'SOURCE_BUCKET_ICON_BACKUP';

SELECT b.name, f.file_name          -- documentation figures and files
FROM community_export.`file_documentation` f
JOIN (SELECT @documentation AS name UNION ALL SELECT @documentation_backup) b

UNION
SELECT b.name, x.image_link         -- brick images, in the documentation buckets
FROM community_export.`brick` x
JOIN (SELECT @documentation AS name UNION ALL SELECT @documentation_backup) b
WHERE x.image_link IS NOT NULL AND x.image_link <> ''

UNION
SELECT b.name, f.file_name          -- agent files
FROM community_export.`file_agent` f
JOIN (SELECT @agents AS name UNION ALL SELECT @agents_backup) b

UNION
SELECT b.name, f.file_name          -- app files
FROM community_export.`file_app` f
JOIN (SELECT @apps AS name UNION ALL SELECT @apps_backup) b

UNION
SELECT b.name, x.picture            -- app pictures, in the app buckets
FROM community_export.`app` x
JOIN (SELECT @apps AS name UNION ALL SELECT @apps_backup) b
WHERE x.picture IS NOT NULL AND x.picture <> ''

UNION
SELECT b.name, x.file_name          -- icons
FROM community_export.`icon` x
JOIN (SELECT @icon AS name UNION ALL SELECT @icon_backup) b;
