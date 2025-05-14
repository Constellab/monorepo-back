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
alter table folder_user drop foreign key FK_TO_NAME;
alter table folder_user add foreign key FK_folder_user_root_folder
  (rootFolderId) references hierarchy_object (id);

-- Clean folder_user table
# delete from folder_user where rootFolderId not in (select id from hierarchy_object);
-- End check


alter table folder_user
  modify column sharedById varchar(36) not null;

alter table folder_user add foreign key FK_folder_user_shared_by
  (sharedById) references user (id);


alter table folder drop foreign key FK_34673de22eda86531dd8ab2ce22;
alter table folder drop column leaderId;
