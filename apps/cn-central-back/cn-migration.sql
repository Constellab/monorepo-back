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
