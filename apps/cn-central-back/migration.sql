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


# 2.1.0
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
#   - QUEUE_SERVICE_PASSWORD -> TRANSPORT_PASSWORD
#   - QUEUE_SERVICE_URL -> TRANSPORT_HOST
#   - QUEUE_SERVICE_PORT -> TRANSPORT_PORT
# Delete env variables QUEUE_SERVICE_USER

# 2.0.11
update scenario
SET protocol = REPLACE(protocol, 'TASK.gws_core.Source', 'TASK.gws_core.InputTask');
update scenario
SET protocol = REPLACE(protocol, 'TASK.gws_core.Sink', 'TASK.gws_core.OutputTask');
