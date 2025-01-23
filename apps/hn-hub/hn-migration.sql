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
# 1.3.4
ALTER TABLE `user`
  MODIFY category enum ('ADMIN', 'STUDENT', 'PUBLIC_RESEARCH', 'PRIVATE_INDUSTRY', 'USER') not null;
update user
set category = 'USER'
where category != 'ADMIN';
ALTER TABLE `user`
  MODIFY category enum ('ADMIN', 'USER') not null default 'USER';


# 1.3.5
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

# Rename env variables:
#   - RABBITMQ_PASSWORD -> QUEUE_SERVICE_PASSWORD
#   - RABBITMQ_URL -> QUEUE_SERVICE_HOST
#   - RABBITMQ_PORT -> QUEUE_SERVICE_PORT
# Delete env variables QUEUE_SERVICE_USER

# Replace RabbimtMQ docker container with redis

# 1.4.2
#  Call rich text migrations POST /story/migrate-rich-text
#  Call rich text migrations POST /documentation/migrate-rich-text
#  Call rich text migrations POST /comment/migrate-rich-text
#  Call rich text migrations POST /agent/migrate-rich-text

# 1.4.3
alter table `agent_version`
  add column old_params text null;
update `agent_version`
set old_params = params;
update `agent_version`
set old_params = NULL
where old_params = '';
update `agent_version`
set params = NULL;
# Then call agent params migrations POST /agent/migrate-params


# 1.4.6
alter table `story`
  drop
    column if exists `modifications_backup`;

alter table `agent_version`
  drop
    column if exists `old_params`;


# 1.4.7
alter table `story`
  drop
    column if exists `category`;


# 1.4.8
DROP TABLE IF EXISTS `run_stat`;
CREATE TABLE `run_stat`
(
  `id`                   varchar(36)  NOT NULL,
  `createdAt`            datetime     NOT NULL,
  `lastModifiedAt`       datetime     NOT NULL,
  `processTypingName`    varchar(255) NOT NULL,
  `status`               varchar(255) NOT NULL,
  `errorInfo`            text        DEFAULT NULL,
  `startedAt`            datetime     NOT NULL,
  `endedAt`              datetime     NOT NULL,
  `elapsedTime`          float        NOT NULL,
  `brickVersionOnRun`    varchar(255) NOT NULL,
  `brickVersionOnCreate` varchar(255) NOT NULL,
  `configValue`          text         NOT NULL,
  `labId`                varchar(255) NOT NULL,
  `labEnv`               varchar(255) NOT NULL,
  `executedById`         varchar(36) DEFAULT NULL,
  `agentVersionId`       varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_601bc27cce37d42095569747998` (`executedById`),
  KEY `FK_b1ad7b313ed95e0d07028789809` (`agentVersionId`),
  CONSTRAINT `FK_601bc27cce37d42095569747998` FOREIGN KEY (`executedById`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_b1ad7b313ed95e0d07028789809` FOREIGN KEY (`agentVersionId`) REFERENCES `agent_version` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

DROP TABLE IF EXISTS `run_stat_aggregate`;
CREATE TABLE `run_stat_aggregate`
(
  `id`                varchar(36)                                                     NOT NULL,
  `objectId`          varchar(255)                                                    NOT NULL,
  `objectType`        enum ('AGENT','AGENT_VERSION','TASK','PROTOCOL','BRICK','USER') NOT NULL,
  `executionCount`    int(11)                                                         NOT NULL,
  `successRate`       float                                                           NOT NULL,
  `averageElapseTime` float                                                           NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_c5a793b4b5f34e02b13fb42eb5` (`objectId`, `objectType`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

########
1.4.10 ########
ALTER TABLE `run_stat`
  ADD COLUMN `creators` text NOT NULL;

#
Call migration route PUT /run-stat-aggregate/migrate-run-stats
