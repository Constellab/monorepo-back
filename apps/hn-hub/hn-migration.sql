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

########
1.5.1 ########
DROP TABLE IF EXISTS `app`;
CREATE TABLE `app`
(
  `id`               varchar(36)  NOT NULL,
  `createdAt`        datetime     DEFAULT NULL,
  `lastModifiedAt`   datetime     DEFAULT NULL,
  `likes`            int(11) NOT NULL DEFAULT 0,
  `comments`         int(11) NOT NULL DEFAULT 0,
  `createdById`      varchar(36)  DEFAULT NULL,
  `lastModifiedById` varchar(36)  DEFAULT NULL,
  `spaceId`          varchar(36)  DEFAULT NULL,
  `title`            varchar(255) NOT NULL,
  `app_url`          varchar(255) NOT NULL,
  `executions`       int(11) NOT NULL DEFAULT 0,
  `description`      text         DEFAULT NULL,
  `picture`          varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_76208e75cfb4b19146f5ee4b47` (`app_url`),
  KEY                `FK_9b4630b0929fb82d39971970b17` (`createdById`),
  KEY                `FK_b06b06795fa0e2bf8a8de86393c` (`lastModifiedById`),
  KEY                `FK_92b55618b66b5b24e7a54952074` (`spaceId`),
  CONSTRAINT `FK_92b55618b66b5b24e7a54952074` FOREIGN KEY (`spaceId`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_9b4630b0929fb82d39971970b17` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b06b06795fa0e2bf8a8de86393c` FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `app_stat`;
CREATE TABLE `app_stat`
(
  `id`            varchar(36)  NOT NULL,
  `app_url`       varchar(255) NOT NULL,
  `executionDate` datetime    DEFAULT NULL,
  `creatorId`     varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY             `FK_30c12438667d08f58ee409bf97b` (`creatorId`),
  CONSTRAINT `FK_30c12438667d08f58ee409bf97b` FOREIGN KEY (`creatorId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `comment_app`;
CREATE TABLE `comment_app`
(
  `id`               varchar(36) NOT NULL,
  `createdAt`        datetime    DEFAULT NULL,
  `lastModifiedAt`   datetime    DEFAULT NULL,
  `content`          text        NOT NULL,
  `createdById`      varchar(36) DEFAULT NULL,
  `lastModifiedById` varchar(36) DEFAULT NULL,
  `entityId`         varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY                `FK_d68943aa47772a6604f308b3bdc` (`createdById`),
  KEY                `FK_0ecb62f9115c46adef4708683b9` (`lastModifiedById`),
  KEY                `FK_04a4d92e711fd5ccc00f2f53214` (`entityId`),
  CONSTRAINT `FK_04a4d92e711fd5ccc00f2f53214` FOREIGN KEY (`entityId`) REFERENCES `app` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_0ecb62f9115c46adef4708683b9` FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d68943aa47772a6604f308b3bdc` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `file_app`;
CREATE TABLE `file_app`
(
  `id`          varchar(36)  NOT NULL,
  `type`        enum('FILE','IMAGE','RESOURCE_VIEW') NOT NULL DEFAULT 'FILE',
  `fileName`    varchar(255) NOT NULL,
  `name`        varchar(255) NOT NULL,
  `createdAt`   datetime    DEFAULT NULL,
  `size`        int(11) DEFAULT NULL,
  `createdById` varchar(36) DEFAULT NULL,
  `entityId`    varchar(36)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a01140618440845bfbe978064a` (`fileName`),
  UNIQUE KEY `IDX_d26b204bd6aee6326580a7e684` (`entityId`,`name`),
  KEY           `FK_709655b0a1e4674240b892f6052` (`createdById`),
  CONSTRAINT `FK_223d344f1d2c0bf362d0adcd90f` FOREIGN KEY (`entityId`) REFERENCES `app` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_709655b0a1e4674240b892f6052` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `like_app`;
CREATE TABLE `like_app`
(
  `id`        varchar(36) NOT NULL,
  `likedAt`   datetime    NOT NULL,
  `likedById` varchar(36) DEFAULT NULL,
  `entityId`  varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY         `FK_8473acdde59e5bbb8700e509dc9` (`likedById`),
  KEY         `FK_0f5bbe3221a91cd7dc1b4812ae2` (`entityId`),
  CONSTRAINT `FK_0f5bbe3221a91cd7dc1b4812ae2` FOREIGN KEY (`entityId`) REFERENCES `app` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_8473acdde59e5bbb8700e509dc9` FOREIGN KEY (`likedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `app_user`;
CREATE TABLE `app_user` (
                          `id` varchar(36) NOT NULL,
                          `appId` varchar(36) DEFAULT NULL,
                          `userId` varchar(36) DEFAULT NULL,
                          PRIMARY KEY (`id`),
                          KEY `FK_ab2b6c1ca6939c84cedf0c83b8c` (`appId`),
                          KEY `FK_6ea20ce66257c9bfb9f6690d8d1` (`userId`),
                          CONSTRAINT `FK_6ea20ce66257c9bfb9f6690d8d1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                          CONSTRAINT `FK_ab2b6c1ca6939c84cedf0c83b8c` FOREIGN KEY (`appId`) REFERENCES `app` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

# DECLARE env var BUCKET_APPS
# DECLARE env var BUCKET_APPS_BACKUP


# 1.6.7
ALTER TABLE `story`
ADD COLUMN `title_path` varchar(255) DEFAULT NULL;
# Call migration route POST /story/migrate-title-paths
