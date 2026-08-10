-- SQL EXAMPLES

-- Type: tinyint

-- ALTER TABLE user ADD lastLoginSuccess datetime;
-- ALTER TABLE brick ADD visibility enum('public', 'private') NULL;

-- ALTER TABLE lab_instance MODIFY labManagerApiKey varchar(255) NULL;
-- ALTER TABLE lab_instance MODIFY onPremisePlatform  enum('LINUX','WINDOWS','MAC') NULL;

-- ALTER TABLE bucket ADD UNIQUE KEY (contentType, objectId);
-- ALTER TABLE user_group  ADD CONSTRAINT FK_user_group_created_by FOREIGN KEY (createdById) REFERENCES user(id);
-- ALTER TABLE project DROP COLUMN mainStorageId;
-- ALTER TABLE `space` CHANGE `storageUsage` `cloudStorageUsage` bigint(20) NOT NULL;
-- RENAME TABLE old_table_name TO new_table_name;
--
  
######## 2.0.11 ########
update scenario
SET protocol = REPLACE(protocol, 'TASK.gws_core.Source', 'TASK.gws_core.InputTask');
update scenario
SET protocol = REPLACE(protocol, 'TASK.gws_core.Sink', 'TASK.gws_core.OutputTask');


######## 2.1.0 ########
ALTER TABLE lab
  ADD COLUMN glabDevApiKey varchar(255) null;
ALTER TABLE `lab`
  CHANGE `glabApiKey` `glabProdApiKey` varchar(255) not null;
ALTER TABLE `lab`
  DROP COLUMN volumeSize;
ALTER TABLE `lab`
  DROP COLUMN volumeType;
ALTER TABLE `user`
  MODIFY category enum ('ADMIN', 'STUDENT', 'PUBLIC_RESEARCH', 'PRIVATE_INDUSTRY', 'USER') not null;
update user
set category = 'USER'
where category != 'ADMIN';
ALTER TABLE `user`
  MODIFY category enum ('ADMIN', 'USER') not null default 'USER';

create table mail
(
  id             varchar(36)                                         not null
    primary key,
  recipients     varchar(255)                                        not null,
  subject        varchar(255)                                        null,
  mail           text                                                null,
  status         enum ('PENDING', 'SENT', 'ERROR') default 'PENDING' not null,
  error          text                                                null,
  lastModifiedAt datetime                                            not null
);

# Call migration route POST /labs/migrate-dev-api-key
ALTER TABLE lab
  MODIFY COLUMN glabDevApiKey varchar(255) not null;

# Rename env variables:
#   - RABBITMQ_PASSWORD -> QUEUE_SERVICE_PASSWORD
#   - RABBITMQ_URL -> QUEUE_SERVICE_HOST
#   - RABBITMQ_PORT -> QUEUE_SERVICE_PORT
# Delete env variables QUEUE_SERVICE_USER

# Replace RabbimtMQ docker container with redis

######## 2.1.1 ########
# Call migration route POST /scenarios/migrate-scenario-description

######## 2.2.0 ########
# Add YOUTUBE_API_KEY, YOUTUBE_TUTORIAL_PLAYLIST_ID, FOLDER_ID_TO_COPY_ON_SIGNUP

ALTER TABLE note
  DROP COLUMN content;

create table resource
(
  id               varchar(36)  not null
    primary key,
  createdAt        datetime     not null,
  lastModifiedAt   datetime     not null,
  createdById      varchar(36)  not null,
  lastModifiedById varchar(36)  null,
  resourceId       VARCHAR(36)  NOT NULL,
  name             varchar(255) not null,
  typingName       varchar(255) not null,
  style            text         not null,
  shareLink        varchar(255) not null,
  validUntil       datetime     null,
  labId            varchar(36)  not null,
  constraint FK_resource_created_by foreign key (createdById) references user (id),
  constraint FK_resource_last_modified_by foreign key (lastModifiedById) references user (id),
  constraint FK_resource_lab foreign key (labId) references lab (id),
  constraint FK_resource_hierarchy_object foreign key (id) references hierarchy_object (id)
)
  collate = utf8mb4_unicode_ci;


alter table folder
  drop column mpath;

ALTER table hierarchy_object
  ADD COLUMN style text null;
ALTER table document
  ADD COLUMN style text null;

alter table hierarchy_object
  modify column objectType enum ('FOLDER', 'DOCUMENT', 'CONSTELLAB_DOCUMENT', 'HIDDEN_DOCUMENT', 'NOTE', 'SCENARIO', 'RESOURCE') not null;
alter table document
  modify column bucketType enum ('NORMAL', 'LAB', 'AZURE') not null;
# Call route POST folders/migrate-style

ALTER table hierarchy_object
  MODIFY COLUMN style text not null;
ALTER table document
  MODIFY COLUMN style text not null;

######## 2.2.4 ########
# Set LAB_MANAGER_VERSION=0.15.0

######## 2.3.0 ########
ALTER TABLE folder
  MODIFY mainStorageId varchar(36) NULL;
update folder
set mainStorageId = null
where id = (Select id from hierarchy_object where id = folder.id and rootParentId is not null);

update folder
set backupStorageId = null
where id = (Select id from hierarchy_object where id = folder.id and rootParentId is not null);

############ 2.4.0 ############
CREATE TABLE hierarchy_object_tag
(
  id                VARCHAR(36) NOT NULL PRIMARY KEY,
  tagKey            VARCHAR(50) NOT NULL,
  tagValue          VARCHAR(50) NOT NULL,
  hierarchyObjectId VARCHAR(36) NOT NULL,
  createdAt         DATETIME    NOT NULL,
  lastModifiedAt    DATETIME    NULL,
  createdById       varchar(36) not null,
  lastModifiedById  varchar(36) null,
  UNIQUE KEY hierarchy_object_tag_key_value_lab (tagKey, tagValue, hierarchyObjectId),
  CONSTRAINT FK_hierarchy_object_tag_hierarchy_object FOREIGN KEY (hierarchyObjectId) REFERENCES hierarchy_object (id) ON DELETE CASCADE,
  CONSTRAINT FK_hierarchy_object_tag_created_by FOREIGN KEY (createdById) REFERENCES user (id),
  CONSTRAINT FK_hierarchy_object_tag_last_modified_by FOREIGN KEY (lastModifiedById) REFERENCES user (id)
);

CREATE TABLE hierarchy_object_tag_history
(
  id                VARCHAR(36)                 NOT NULL PRIMARY KEY,
  tagKey            VARCHAR(50)                 NOT NULL,
  tagValue          VARCHAR(50)                 NOT NULL,
  hierarchyObjectId VARCHAR(36)                 NOT NULL,
  type              ENUM ('CREATED', 'DELETED') NOT NULL,
  createdAt         DATETIME                    NOT NULL,
  lastModifiedAt    DATETIME                    NULL,
  createdById       varchar(36)                 not null,
  lastModifiedById  varchar(36)                 null,
  CONSTRAINT FK_hierarchy_object_tag_history_hierarchy_object FOREIGN KEY (hierarchyObjectId) REFERENCES hierarchy_object (id) ON DELETE CASCADE,
  CONSTRAINT FK_hierarchy_object_tag_history_created_by FOREIGN KEY (createdById) REFERENCES user (id),
  CONSTRAINT FK_hierarchy_object_tag_history_last_modified_by FOREIGN KEY (lastModifiedById) REFERENCES user (id)
);

ALTER TABLE hierarchy_object
  ADD COLUMN lastTagsStr varchar(255) NULL;

update hierarchy_object
set style = '{"icon_type":"MATERIAL_ICON","icon_technical_name":"folder_shared","background_color":"accent","icon_color":"accentContrast"}'
where parentId is null;

alter table folder
  add column style text null;
update folder
set style = (select style from hierarchy_object where id = folder.id);
alter table folder
  modify column style text null;

update folder
set mainStorageId = null
where id = (Select id from hierarchy_object where id = folder.id and rootParentId is not null);


################### 2.4.1 ###################
-- Rename the column shareLink to token
ALTER TABLE resource RENAME COLUMN shareLink TO token;
ALTER TABLE resource
  CHANGE shareLink token varchar(255) not null;

-- Update the token column by extracting the token from the old shareLink URL
UPDATE resource
SET token = SUBSTRING_INDEX(token, '/', -1);

ALTER TABLE resource
  DROP COLUMN validUntil;

################### 2.5.0 ###################
-- Adding GCP support
-- Rename AZURE_SSH_KEY to AZURE_SSH_KEY_NAME
-- Rename OVH_SSH_KEY to OVH_SSH_KEY_NAME
-- Rename OUTSCALE_SSH_KEY to OUTSCALE_SSH_KEY_NAME
-- Add keys : GCP_PROJECT_ID, GCP_FIREWALL_TAG, GOOGLE_APPLICATION_CREDENTIALS
-- Delete keys : DOCKER_REGISTRY_URL DOCKER_REGISTRY_USERNAME DOCKER_REGISTRY_PASSWORD
-- Delete keys:  LAB_DESKTOP_WINDOWS_EXE_URL  LAB_DESKTOP_MAC_EXE_URL
-- Delete keys:  SALES_MAIL
-- Delete key: SSH_PRIVATE_KEY
-- Create keys : MAIN_SSH_PRIVATE_KEY_FILE_PATH, OUTSCALE_SSH_PRIVATE_KEY_FILE_PATH,
--               GCP_SSH_PRIVATE_KEY_FILE_PATH

alter table lab
  add column serverIpAddressId varchar(255) null;

ALTER TABLE bucket
  MODIFY bucketType enum ('NORMAL', 'LAB', 'AZURE', 'GCP') default 'NORMAL' not null;
ALTER TABLE document
  MODIFY bucketType enum ('NORMAL', 'LAB', 'AZURE', 'GCP') not null;

##################### 2.7.0 #####################
alter table hierarchy_object
  add column visibility enum ('VISIBLE', 'TRASH', 'HIDDEN') null;
update hierarchy_object
set visibility = 'VISIBLE'
where isVisible = 1;
update hierarchy_object
set visibility = 'TRASH'
where isVisible = 0;
update hierarchy_object
set visibility = 'HIDDEN'
where objectType = 'HIDDEN_DOCUMENT';
alter table hierarchy_object
  modify column visibility enum ('VISIBLE', 'TRASH', 'HIDDEN') not null;

alter table hierarchy_object
  drop column isVisible;
alter table document
  drop column inTrash;

alter table activity
  modify entityType enum ('USER', 'FOLDER', 'SCENARIO', 'NOTE', 'DOCUMENT', 'RESOURCE', 'MESSAGE') not null;

alter table activity
  modify actionType enum ('CREATE', 'UPDATE', 'DELETE', 'TRASH') not null;


####################### 2.8.0 #######################

create table hierarchy_object_token
(
  id                varchar(36)  not null primary key,
  createdAt         datetime     not null,
  lastModifiedAt    datetime     not null,
  createdById       varchar(36)  not null,
  lastModifiedById  varchar(36)  not null,
  expirationDate    datetime     null,
  token             varchar(255) not null,
  hierarchyObjectId varchar(36)  not null,
  constraint FK_hierarchy_object_token_created_by
    foreign key (createdById) references user (id),
  constraint FK_hierarchy_object_token_last_modified_by
    foreign key (lastModifiedById) references user (id),
  constraint FK_hierarchy_object_token_hierarchy_object
    foreign key (hierarchyObjectId) references hierarchy_object (id)
);

alter table folder_user
  add column role enum ('OWNER', 'USER', 'VIEWER') null;


-- First, set users to OWNER if they are leaders in folders
UPDATE folder_user fu
  JOIN folder f ON fu.rootFolderId = f.id
SET fu.role = 'OWNER'
WHERE fu.userId = f.leaderId;

-- Then set all remaining users (with null role) to USER
UPDATE folder_user
SET role = 'USER'
WHERE role IS NULL;

alter table folder_user
  modify column role enum ('OWNER', 'USER', 'VIEWER') not null;

alter table folder_user
  add column sharedAt datetime null;

update folder_user set sharedAt = now();

alter table folder_user
  modify column sharedAt datetime not null;

alter table folder_user add sharedById varchar(36) null;

update folder_user fu
set sharedById = (select userId from folder_user f where f.rootFolderId = fu.rootFolderId and f.role = 'OWNER');

-- Check foreign key folder_user
-- alter table folder_user drop foreign key FK_TO_NAME;
-- alter table folder_user add foreign key FK_folder_user_root_folder
  -- (rootFolderId) references hierarchy_object (id) on update cascade on delete cascade;

-- Clean folder_user table
-- # delete from folder_user where rootFolderId not in (select id from hierarchy_object);
-- End check


alter table folder_user
  modify column sharedById varchar(36) not null;

alter table folder_user add foreign key FK_folder_user_shared_by
  (sharedById) references user (id);


alter table folder drop foreign key FK_34673de22eda86531dd8ab2ce22;
alter table folder drop column leaderId;

########################### 2.8.11 ##########################
-- Add LAB_MANAGER_STANDALONE_FRONT_VERSION=latest env variable

alter table notification modify column `objectType` enum('USER','FOLDER','SCENARIO','NOTE','DOCUMENT','MESSAGE', 'RESOURCE', 'LAB') NOT NULL;
alter table activity modify column `entityType` enum('FOLDER','SCENARIO','NOTE','DOCUMENT','RESOURCE', 'MESSAGE') NOT NULL;


########################### 2.9.0 ##########################
 -- Add REFLEX_ACCESS_TOKEN, 
########################### 2.9.2 ##########################
--  STARTED_SERVER_TEMP_STATUS_MAX_DURATION_MINUTES


############################ 2.10.0 ##########################
alter table resource
  add column isApplication boolean not null default false;

update resource
set isApplication = true
where typingName IN ('RESOURCE.gws_core.StreamlitResource', 'RESOURCE.gws_core.ReflexResource'); 

alter table hierarchy_object
  modify column objectType enum ('FOLDER', 'DOCUMENT', 'CONSTELLAB_DOCUMENT', 'HIDDEN_DOCUMENT', 'NOTE', 'SCENARIO', 'RESOURCE', 'APPLICATION') not null;

-- Update hierarchy_object to set objectType to 'APPLICATION' for Streamlit and Reflex resources
UPDATE hierarchy_object ho
INNER JOIN resource r ON ho.id = r.id
SET ho.objectType = 'APPLICATION'
WHERE r.typingName IN ('RESOURCE.gws_core.StreamlitResource', 'RESOURCE.gws_core.ReflexResource');

alter table settings 
  add column constellabSuite text null;

############################ 2.9.11 ##########################
-- Update CAPTCHA_SITE_KEY and delete CAPTCHA_SECRET_KEY

############################ 2.9.14 ##########################

delete from mail where subject is null or mail is null;

-- Modify columns to set NOT NULL constraints
alter table mail
  modify column subject varchar(255) not null,
  modify column mail text not null;

############################ 2.9.17 ##########################
alter table settings
  add column freeLabConfig text null;

update settings
set freeLabConfig = '{"cloudProvider":"GCP","cloudProviderRegion":"europe-west1-b","cloudProviderInstanceType":"e2-standard-2","nbCpus":2,"ramSize":8,"volumeSize":100,"volumeType":"HIGH_SPEED","billingMode":"HOURLY","domain":"constellab.app","greenOption":"STOP_AFTER_INACTIVITY_TIME","greenOptionInactivityDuration":60,"bricks":["gws_core","gws_academy"],"hourLimit":25,"deletionAfterDays":2}'
where freeLabConfig is null;

############################ 2.9.18 ##########################

-- Make spaceId ON DELETE CASCADE on activity table

############################ 2.10.4 ##########################
-- /!\ FROM THIS POINT THE COLUMNS ARE SNAKE_CASED, NOT CAMEL_CASED
ALTER TABLE space_user MODIFY COLUMN role ENUM('ADMIN','USER','VIEWER') NOT NULL DEFAULT 'USER';
ALTER TABLE space_invit MODIFY COLUMN role ENUM('ADMIN','USER','VIEWER') NOT NULL DEFAULT 'USER';

############################ 2.14.0 ##########################
-- On-premise labs only reachable on the client network: optional private IP the
-- lab hostnames must resolve to, instead of overriding DNS via /etc/hosts on the server.
alter table lab
  add column lab_ip_override varchar(255) null;

-- On-premise labs reachable through a non-standard port (client NAT/reverse proxy):
-- optional port injected into the lab URLs (glab/lab-manager) instead of the default 443.
alter table lab
  add column lab_port_override int null;

-- Normalize emails to lower case so invitation acceptance and user lookups are case-insensitive
update `user`
set email = lower(email)
where email != lower(email);

update space_invit
set user_mail = lower(user_mail)
where user_mail != lower(user_mail);

-- Cascade delete access tokens when their hierarchy object is deleted, so
-- emptying the trash no longer fails with a foreign key constraint error.
ALTER TABLE hierarchy_object_token
  DROP FOREIGN KEY FK_hierarchy_object_token_hierarchy_object_id;
ALTER TABLE hierarchy_object_token
  ADD CONSTRAINT FK_hierarchy_object_token_hierarchy_object_id
  FOREIGN KEY (hierarchy_object_id) REFERENCES hierarchy_object (id)
  ON DELETE CASCADE ON UPDATE NO ACTION;

############################ 2.15.0 ##########################

-- Widen the materialized-path tree column of `hierarchy_object`.
-- TypeORM auto-generates `mpath` as varchar(255). Each nesting level adds a
-- 36-char UUID + '.' (37 chars), so 255 only holds ~6 levels; a deeper object
-- overflows and its mpath is truncated, which drops the whole subtree from the
-- hierarchy (findDescendantsTree filters by `mpath LIKE 'ancestor.%'`).
-- Widen to 2048 (~55 levels). synchronize is disabled in prod so this sticks.
ALTER TABLE `hierarchy_object`
  MODIFY `mpath` varchar(2048) NULL DEFAULT '';

############################ 2.16.0 ##########################

-- BlNamingStrategy now snake_cases many-to-many @JoinTable columns (previously
-- fell through to TypeORM's default camelCase). Rename the existing join-table
-- columns so already-synced databases match the entities.
-- Only M2M @JoinTable columns are affected; regular FK columns were already snake_case.

-- lab_config_brick_version (CnLabConfig.brickVersions)
ALTER TABLE `lab_config_brick_version`
  CHANGE `labConfigId` `lab_config_id` varchar(36) NOT NULL,
  CHANGE `brickVersionId` `brick_version_id` varchar(36) NOT NULL;

-- note_scenario (CnNote.scenarios <-> CnScenario.notes)
ALTER TABLE `note_scenario`
  CHANGE `noteId` `note_id` varchar(36) NOT NULL,
  CHANGE `scenarioId` `scenario_id` varchar(36) NOT NULL;

-- ############################################################################
-- MUST RUN BEFORE THE APP STARTS. Session refresh tokens live in this table; if
-- it is missing, /auth/login and /auth/refresh fail, so nobody can log in or
-- stay logged in. This is not a degraded feature, it breaks authentication.
-- ############################################################################

CREATE TABLE `refresh_token`
(
  `id`                   varchar(36)  NOT NULL,
  `token_hash`           varchar(64)  NOT NULL,
  `previous_token_hash`  varchar(64)  NULL COMMENT 'hash consumed by the last rotation; NULL when never rotated',
  `kind`                 varchar(16)  NOT NULL COMMENT 'session | oauth',
  `user_id`              varchar(36)  NOT NULL,
  `expires_at`           datetime     NOT NULL,
  `client_id`            varchar(64)  NULL COMMENT 'OAuth clients only',
  `resource`             varchar(512) NULL COMMENT 'OAuth clients only: token audience',
  `created_at`           datetime     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_refresh_token_token_hash` (`token_hash`),
  -- NOT unique: rotation writes the consumed hash here, and two sessions could in
  -- principle collide. Indexed because `rotate` matches on either hash column in a
  -- single query — without it that OR degrades to a table scan on every refresh.
  INDEX `IDX_refresh_token_previous_token_hash` (`previous_token_hash`),
  CONSTRAINT `FK_refresh_token_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
-- InnoDB rejects a foreign key between two varchar columns whose collations differ.
-- `user` carries an explicit utf8mb4_general_ci (dumps write the collation out, so any
-- database restored from one keeps it), while a table created here would take the
-- database default instead — utf8mb4_uca1400_ai_ci or utf8mb4_0900_ai_ci on a recent
-- server. Pin the collation so the key holds whatever the default happens to be.
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- ############################################################################
-- MUST RUN BEFORE THE APP STARTS. A Grant is a user's standing approval of one
-- machine client for one Resource, and it is what the consent screen creates. If
-- this table is missing, every authorization request fails at the decision step:
-- clients cannot be approved at all, and already-approved ones cannot renew
-- through a fresh authorization.
-- ############################################################################

CREATE TABLE `oauth_grant`
(
  `id`          varchar(36)  NOT NULL,
  -- SHA-256 of user + client + Resource. One hashed column rather than a unique
  -- index over the three below: `resource` is a 512-character URL, and hashing is
  -- also what keeps re-approval a single indexed lookup. This index is the
  -- "one Grant per user, client and Resource" rule — approving twice updates the
  -- row it finds instead of accumulating a second one.
  `grant_key`   varchar(64)  NOT NULL,
  `client_id`   varchar(64)  NOT NULL,
  `resource`    varchar(512) NOT NULL COMMENT 'the one Resource this Grant covers, as its URL',
  `user_id`     varchar(36)  NOT NULL,
  `approved_at` datetime     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_oauth_grant_grant_key` (`grant_key`),
  CONSTRAINT `FK_oauth_grant_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
-- Same collation pin as `refresh_token` above, and for the same reason: the foreign
-- key to `user` (id) only forms when both columns share one collation.
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- ENV VARIABLES, both required and read while the injector is built, so a missing one
-- stops the app at startup. Commentary in src/environments/cn-dev.env.
--
-- MCP_JWT_PRIVATE_KEY_BASE64 — signs MCP access tokens, public half published at
--   /.well-known/jwks.json. Not JWT_SECRET. One per environment, never the repo key:
--     openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 | base64 -w0
-- OAUTH_ALLOWED_REDIRECT_URIS — non-loopback redirect URIs a client may register,
--   comma-separated, matched exactly. Incomplete boots fine then refuses registration:
--     https://claude.ai/api/mcp/auth_callback,https://claude.com/api/mcp/auth_callback
--
-- Optional, defaulting to cn-jwt.config.ts: ACCESS_TOKEN_DURATION_SECONDS (900),
-- REFRESH_TOKEN_DURATION_SECONDS (2592000), MCP_ACCESS_TOKEN_DURATION_SECONDS (3600),
-- and MCP_JWT_PREVIOUS_PRIVATE_KEY_BASE64 during a key rotation only.
--
-- API_URL (the OAuth issuer) and the Community's SPACE_API_URL must name the same host,
-- scheme included; a trailing slash on either is stripped. No test compares them, and a
-- mismatch means every MCP call takes a 401 with both applications looking healthy.
