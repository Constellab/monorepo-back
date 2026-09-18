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

# 1.7.0
-- Rename keys CENTRAL_API_URL to SPACE_API_URL and CENTRAL_API_KEY to SPACE_API_KEY

# 1.8.0

DROP TABLE IF EXISTS `tag_key`;
CREATE TABLE `tag_key` (
                         `id` varchar(36) NOT NULL,
                         `technicalName` varchar(255) NOT NULL,
                         `label` varchar(255) NOT NULL,
                         `type` enum('STRING','INTEGER','FLOAT','BOOLEAN','DATETIME') NOT NULL,
                         `deprecated` tinyint(4) NOT NULL DEFAULT 0,
                         `createdAt` datetime DEFAULT NULL,
                         `lastModifiedAt` datetime DEFAULT NULL,
                         `publishedAt` datetime DEFAULT NULL,
                         `unit` varchar(255) DEFAULT NULL,
                         `description` text DEFAULT NULL,
                         `additionalInfosSpecs` text DEFAULT NULL,
                         `createdById` varchar(36) DEFAULT NULL,
                         `lastModifiedById` varchar(36) DEFAULT NULL,
                         `spaceId` varchar(36) DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `IDX_383c39ab37dfd85d5395a1858d` (`technicalName`),
                         KEY `FK_aab39dc0acffc09e6a199506fc6` (`createdById`),
                         KEY `FK_50abee9f56ae1bc33006065ef10` (`lastModifiedById`),
                         KEY `FK_9bcd532ef7f1bf88ba44dde9f81` (`spaceId`),
                         CONSTRAINT `FK_50abee9f56ae1bc33006065ef10` FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                         CONSTRAINT `FK_9bcd532ef7f1bf88ba44dde9f81` FOREIGN KEY (`spaceId`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                         CONSTRAINT `FK_aab39dc0acffc09e6a199506fc6` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `tag_value`;
CREATE TABLE `tag_value` (
                           `id` varchar(36) NOT NULL,
                           `value` varchar(255) NOT NULL,
                           `deprecated` tinyint(4) NOT NULL,
                           `shortDescription` varchar(255) DEFAULT NULL,
                           `additionalInfos` text DEFAULT NULL,
                           `tagKeyId` varchar(36) DEFAULT NULL,
                           PRIMARY KEY (`id`),
                           UNIQUE KEY `IDX_dbd6ae60f89f1825b06d3c3d0e` (`value`,`tagKeyId`),
                           KEY `FK_f35fd43511833656868b1694b4b` (`tagKeyId`),
                           CONSTRAINT `FK_f35fd43511833656868b1694b4b` FOREIGN KEY (`tagKeyId`) REFERENCES `tag_key` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tag_co_author`;
CREATE TABLE `tag_co_author` (
                               `id` varchar(36) NOT NULL,
                               `tagKeyId` varchar(36) DEFAULT NULL,
                               `userId` varchar(36) DEFAULT NULL,
                               PRIMARY KEY (`id`),
                               KEY `FK_054371d7acc567ab19e9c2a3644` (`tagKeyId`),
                               KEY `FK_cab144e29c322457d212979f52b` (`userId`),
                               CONSTRAINT `FK_054371d7acc567ab19e9c2a3644` FOREIGN KEY (`tagKeyId`) REFERENCES `tag_key` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                               CONSTRAINT `FK_cab144e29c322457d212979f52b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `tag_co_author_invite`;
CREATE TABLE `tag_co_author_invite` (
                                      `id` varchar(36) NOT NULL,
                                      `createdAt` datetime DEFAULT NULL,
                                      `lastModifiedAt` datetime DEFAULT NULL,
                                      `email` varchar(255) NOT NULL,
                                      `status` enum('ACCEPTED','PENDING') NOT NULL DEFAULT 'PENDING',
                                      `token` varchar(255) NOT NULL,
                                      `createdById` varchar(36) DEFAULT NULL,
                                      `lastModifiedById` varchar(36) DEFAULT NULL,
                                      `tagKeyId` varchar(36) DEFAULT NULL,
                                      PRIMARY KEY (`id`),
                                      KEY `FK_23e34f94917db7c9ab5a4e3034d` (`createdById`),
                                      KEY `FK_34a8d473273df25f0d10c0e5ef6` (`lastModifiedById`),
                                      KEY `FK_ece61b41b451dda3460fe660489` (`tagKeyId`),
                                      CONSTRAINT `FK_23e34f94917db7c9ab5a4e3034d` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                                      CONSTRAINT `FK_34a8d473273df25f0d10c0e5ef6` FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                                      CONSTRAINT `FK_ece61b41b451dda3460fe660489` FOREIGN KEY (`tagKeyId`) REFERENCES `tag_key` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# 1.8.1
-- Fix story delete bug

ALTER TABLE `like_story`
DROP FOREIGN KEY `FK_26d6b630fdc9fc41e02f7da52e8`;

ALTER TABLE `like_story`
  ADD CONSTRAINT `FK_26d6b630fdc9fc41e02f7da52e8`
    FOREIGN KEY (`entityId`) REFERENCES `story` (`id`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;

ALTER TABLE `like_brick`
DROP FOREIGN KEY `FK_0f838a8e0820433db7f7f3d886e`;

ALTER TABLE `like_brick`
  ADD CONSTRAINT `FK_0f838a8e0820433db7f7f3d886e`
    FOREIGN KEY (`entityId`) REFERENCES `brick` (`id`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;

DROP TABLE IF EXISTS `story_file`, `documentation_file`;

ALTER TABLE `tag_key`
  ADD COLUMN `likes` int(11) NOT NULL DEFAULT 0;

ALTER TABLE `tag_key`
  ADD COLUMN `comments` int(11) NOT NULL DEFAULT 0;

DROP TABLE IF EXISTS `comment_tag`;
CREATE TABLE `comment_tag` (
                             `id` varchar(36) NOT NULL,
                             `createdAt` datetime DEFAULT NULL,
                             `lastModifiedAt` datetime DEFAULT NULL,
                             `content` text NOT NULL,
                             `createdById` varchar(36) DEFAULT NULL,
                             `lastModifiedById` varchar(36) DEFAULT NULL,
                             `entityId` varchar(36) DEFAULT NULL,
                             PRIMARY KEY (`id`),
                             KEY `FK_6f5b66a2b8cc5883e077040e943` (`createdById`),
                             KEY `FK_cfa78d72368196db770f2352121` (`lastModifiedById`),
                             KEY `FK_cbb5ade974832179fb0a73b9a64` (`entityId`),
                             CONSTRAINT `FK_6f5b66a2b8cc5883e077040e943` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                             CONSTRAINT `FK_cbb5ade974832179fb0a73b9a64` FOREIGN KEY (`entityId`) REFERENCES `tag_key` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
                             CONSTRAINT `FK_cfa78d72368196db770f2352121` FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `like_tag`;
CREATE TABLE `like_tag` (
                          `id` varchar(36) NOT NULL,
                          `likedAt` datetime NOT NULL,
                          `likedById` varchar(36) DEFAULT NULL,
                          `entityId` varchar(36) DEFAULT NULL,
                          PRIMARY KEY (`id`),
                          KEY `FK_7c0ce0ac4aa0f1cd1626aa3dced` (`likedById`),
                          KEY `FK_4a34296857ef7a85939d6adc48b` (`entityId`),
                          CONSTRAINT `FK_4a34296857ef7a85939d6adc48b` FOREIGN KEY (`entityId`) REFERENCES `tag_key` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
                          CONSTRAINT `FK_7c0ce0ac4aa0f1cd1626aa3dced` FOREIGN KEY (`likedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


#1.8.4
-- Add app co author

DROP TABLE IF EXISTS `app_co_author`;
CREATE TABLE `app_co_author` (
                               `id` varchar(36) NOT NULL,
                               `communityAppId` varchar(36) DEFAULT NULL,
                               `userId` varchar(36) DEFAULT NULL,
                               PRIMARY KEY (`id`),
                               KEY `FK_4d137c715705746e4d3c6eca559` (`communityAppId`),
                               KEY `FK_f91b287b1018e8e298c45bf513e` (`userId`),
                               CONSTRAINT `FK_4d137c715705746e4d3c6eca559` FOREIGN KEY (`communityAppId`) REFERENCES `app` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                               CONSTRAINT `FK_f91b287b1018e8e298c45bf513e` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `app_co_author_invite`;
CREATE TABLE `app_co_author_invite` (
                                      `id` varchar(36) NOT NULL,
                                      `createdAt` datetime DEFAULT NULL,
                                      `lastModifiedAt` datetime DEFAULT NULL,
                                      `email` varchar(255) NOT NULL,
                                      `status` enum('ACCEPTED','PENDING') NOT NULL DEFAULT 'PENDING',
                                      `token` varchar(255) NOT NULL,
                                      `createdById` varchar(36) DEFAULT NULL,
                                      `lastModifiedById` varchar(36) DEFAULT NULL,
                                      `communityAppId` varchar(36) DEFAULT NULL,
                                      PRIMARY KEY (`id`),
                                      KEY `FK_fe25581e89d690b22a942e39ef4` (`createdById`),
                                      KEY `FK_c8af6f3e103dc64b7ff9402d7d3` (`lastModifiedById`),
                                      KEY `FK_eba150aa7061205b7a775864b2a` (`communityAppId`),
                                      CONSTRAINT `FK_c8af6f3e103dc64b7ff9402d7d3` FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                                      CONSTRAINT `FK_eba150aa7061205b7a775864b2a` FOREIGN KEY (`communityAppId`) REFERENCES `app` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                                      CONSTRAINT `FK_fe25581e89d690b22a942e39ef4` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

#1.9.3
ALTER TABLE `app`
ADD COLUMN `video` varchar(255) DEFAULT NULL;

ALTER TABLE `app`
ADD COLUMN `figures` text DEFAULT NULL;

#1.10.0
DROP TABLE IF EXISTS `partner`;
CREATE TABLE `partner` (
                         `id` varchar(36) NOT NULL,
                         `createdAt` datetime DEFAULT NULL,
                         `lastModifiedAt` datetime DEFAULT NULL,
                         `certified` tinyint(4) NOT NULL DEFAULT 0,
                         `info` text NOT NULL,
                         `createdById` varchar(36) DEFAULT NULL,
                         `lastModifiedById` varchar(36) DEFAULT NULL,
                         `userId` varchar(36) DEFAULT NULL,
                         `name` varchar(255) NOT NULL,
                         `logo` varchar(255) DEFAULT NULL,
                         `likes` int(11) NOT NULL DEFAULT 0,
                         `comments` int(11) NOT NULL DEFAULT 0,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `IDX_9af6a8bd7cac55b61babc75385` (`name`),
                         UNIQUE KEY `REL_17701946f05279c9fe1a05cccf` (`userId`),
                         KEY `FK_a7c3976f93f13ed6eb0bafd7366` (`createdById`),
                         KEY `FK_2079d73d63eb4789c064e494348` (`lastModifiedById`),
                         CONSTRAINT `FK_17701946f05279c9fe1a05cccf5` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
                         CONSTRAINT `FK_2079d73d63eb4789c064e494348` FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                         CONSTRAINT `FK_a7c3976f93f13ed6eb0bafd7366` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `comment_partner`;
CREATE TABLE `comment_partner` (
                                 `id` varchar(36) NOT NULL,
                                 `createdAt` datetime DEFAULT NULL,
                                 `lastModifiedAt` datetime DEFAULT NULL,
                                 `content` text NOT NULL,
                                 `createdById` varchar(36) DEFAULT NULL,
                                 `lastModifiedById` varchar(36) DEFAULT NULL,
                                 `entityId` varchar(36) DEFAULT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `FK_4abd8fda2dc997a9892d8d936a3` (`createdById`),
                                 KEY `FK_b9ff27c7dfea554f872932e5048` (`lastModifiedById`),
                                 KEY `FK_e8edeca8bda00edf21dd6165368` (`entityId`),
                                 CONSTRAINT `FK_4abd8fda2dc997a9892d8d936a3` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                                 CONSTRAINT `FK_b9ff27c7dfea554f872932e5048` FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                                 CONSTRAINT `FK_e8edeca8bda00edf21dd6165368` FOREIGN KEY (`entityId`) REFERENCES `partner` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `file_partner`;
CREATE TABLE `file_partner` (
                              `id` varchar(36) NOT NULL,
                              `type` enum('FILE','IMAGE','RESOURCE_VIEW') NOT NULL DEFAULT 'FILE',
                              `fileName` varchar(255) NOT NULL,
                              `name` varchar(255) NOT NULL,
                              `createdAt` datetime DEFAULT NULL,
                              `size` int(11) DEFAULT NULL,
                              `createdById` varchar(36) DEFAULT NULL,
                              `entityId` varchar(36) NOT NULL,
                              PRIMARY KEY (`id`),
                              UNIQUE KEY `IDX_bbb3bf15eee111f377ab392767` (`fileName`),
                              UNIQUE KEY `IDX_4916b162a292a40a7118caa202` (`entityId`,`name`),
                              KEY `FK_82715771f52861dbb71db62a638` (`createdById`),
                              CONSTRAINT `FK_82715771f52861dbb71db62a638` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                              CONSTRAINT `FK_b80c4c187e9d45f938fa4286c5c` FOREIGN KEY (`entityId`) REFERENCES `partner` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `like_partner`;
CREATE TABLE `like_partner` (
                              `id` varchar(36) NOT NULL,
                              `likedAt` datetime NOT NULL,
                              `likedById` varchar(36) DEFAULT NULL,
                              `entityId` varchar(36) DEFAULT NULL,
                              PRIMARY KEY (`id`),
                              KEY `FK_1259e892f169ba025052b387b71` (`likedById`),
                              KEY `FK_fa8a7860d15e07c1226d3c73204` (`entityId`),
                              CONSTRAINT `FK_1259e892f169ba025052b387b71` FOREIGN KEY (`likedById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                              CONSTRAINT `FK_fa8a7860d15e07c1226d3c73204` FOREIGN KEY (`entityId`) REFERENCES `partner` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


#1.10.1
ALTER TABLE `app`
  ADD COLUMN `contact_mail` varchar(255) DEFAULT NULL;
ALTER TABLE `app`
  CHANGE `app_url` `app_url` varchar(255) COLLATE 'utf8mb4_unicode_ci' NULL;

#1.10.2
-- Set space user id constraint to cascade on delete
-- Verify current foreign keys names before running this migration
ALTER TABLE `space`
DROP FOREIGN KEY `FK_527dfe411ef5a7dc258501c09e3`,
  DROP FOREIGN KEY `FK_747b42c9084735920dac77b8ef3`;

ALTER TABLE `space`
  ADD CONSTRAINT `FK_527dfe411ef5a7dc258501c09e3`
    FOREIGN KEY (`lastModifiedById`)
      REFERENCES `user` (`id`)
      ON DELETE SET NULL
      ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_747b42c9084735920dac77b8ef3`
    FOREIGN KEY (`createdById`)
    REFERENCES `user` (`id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION;

#1.10.5
ALTER TABLE `protocol`
DROP FOREIGN KEY `FK_4c5fa66e968e7c30d12aebad9b9`;

ALTER TABLE `protocol`
  ADD CONSTRAINT `FK_8f1002e16009585dc2feae56a70`
    FOREIGN KEY (`technicalFolderId`)
      REFERENCES `technical_folder` (`id`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;

ALTER TABLE `resource`
DROP FOREIGN KEY `FK_091ec1819a0d68e9c9215ee88a0`;

ALTER TABLE `resource`
  ADD CONSTRAINT `FK_543bb2c6c7d0fa9d3b7d5cfe574`
    FOREIGN KEY (`technicalFolderId`)
      REFERENCES `technical_folder` (`id`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;

ALTER TABLE `task`
DROP FOREIGN KEY `FK_1d912d0746e72de513657229797`;

ALTER TABLE `task`
  ADD CONSTRAINT `FK_a6b609f3800157eb4d2b5495f87`
    FOREIGN KEY (`technicalFolderId`)
      REFERENCES `technical_folder` (`id`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;

ALTER TABLE `technical_doc_other_class`
DROP FOREIGN KEY `FK_c30cfffb0f55322728317027423`;

ALTER TABLE `technical_doc_other_class`
  ADD CONSTRAINT `FK_c30cfffb0f55322728317027423`
    FOREIGN KEY (`technicalFolderId`)
      REFERENCES `technical_folder` (`id`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION;

# DECLARE ENV VAR RAGFLOW_BASE_URL
# DECLARE ENV VAR RAGFLOW_API_KEY

#1.10.6
# DECLARE ENV VAR RAGFLOW_CHAT_ID

START TRANSACTION;

-- =====================================================
-- PROTOCOL
-- =====================================================

ALTER TABLE `protocol`
  ADD COLUMN `createdAt` datetime DEFAULT NULL,
  ADD COLUMN `lastModifiedAt` datetime DEFAULT NULL,
  ADD COLUMN `createdById` varchar(36) DEFAULT NULL,
  ADD COLUMN `lastModifiedById` varchar(36) DEFAULT NULL;

UPDATE `protocol`
SET
  `createdAt` = NOW(),
  `lastModifiedAt` = NOW()
WHERE `createdAt` IS NULL;

UPDATE `protocol` SET `typingName` = '' WHERE `typingName` IS NULL;

ALTER TABLE `protocol`
  MODIFY `typingName` varchar(255) NOT NULL,
  ADD KEY `FK_0e189282c6c4f6bfe0727d860a4` (`createdById`),
  ADD KEY `FK_d940e5fff8a99a1470b072792c0` (`lastModifiedById`),
  ADD CONSTRAINT `FK_0e189282c6c4f6bfe0727d860a4`
  FOREIGN KEY (`createdById`) REFERENCES `user` (`id`)
  ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_d940e5fff8a99a1470b072792c0`
    FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION;



-- =====================================================
-- RESOURCE
-- =====================================================

ALTER TABLE `resource`
  ADD COLUMN `createdAt` datetime DEFAULT NULL,
  ADD COLUMN `lastModifiedAt` datetime DEFAULT NULL,
  ADD COLUMN `createdById` varchar(36) DEFAULT NULL,
  ADD COLUMN `lastModifiedById` varchar(36) DEFAULT NULL;

UPDATE `resource`
SET
  `createdAt` = NOW(),
  `lastModifiedAt` = NOW()
WHERE `createdAt` IS NULL;

UPDATE `resource` SET `typingName` = '' WHERE `typingName` IS NULL;

ALTER TABLE `resource`
  MODIFY `typingName` varchar(255) NOT NULL,
  ADD KEY `FK_665a76edb2a7e87d0696727f3fb` (`createdById`),
  ADD KEY `FK_944b8d5bbad8f52b924eca31dd8` (`lastModifiedById`),
  ADD CONSTRAINT `FK_665a76edb2a7e87d0696727f3fb`
  FOREIGN KEY (`createdById`) REFERENCES `user` (`id`)
  ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_944b8d5bbad8f52b924eca31dd8`
    FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION;


-- =====================================================
-- TASK
-- =====================================================

ALTER TABLE `task`
  ADD COLUMN `createdAt` datetime DEFAULT NULL,
  ADD COLUMN `lastModifiedAt` datetime DEFAULT NULL,
  ADD COLUMN `createdById` varchar(36) DEFAULT NULL,
  ADD COLUMN `lastModifiedById` varchar(36) DEFAULT NULL;

UPDATE `task`
SET
  `createdAt` = NOW(),
  `lastModifiedAt` = NOW()
WHERE `createdAt` IS NULL;

UPDATE `task` SET `typingName` = '' WHERE `typingName` IS NULL;

ALTER TABLE `task`
  MODIFY `typingName` varchar(255) NOT NULL,
  ADD KEY `FK_91d76dd2ae372b9b7dfb6bf3fd2` (`createdById`),
  ADD KEY `FK_deb8ff38d42829973ec6db77a1c` (`lastModifiedById`),
  ADD CONSTRAINT `FK_91d76dd2ae372b9b7dfb6bf3fd2`
  FOREIGN KEY (`createdById`) REFERENCES `user` (`id`)
  ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_deb8ff38d42829973ec6db77a1c`
    FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION;


-- =====================================================
-- TECHNICAL_DOC_OTHER_CLASS
-- =====================================================

ALTER TABLE `technical_doc_other_class`
  ADD COLUMN `createdAt` datetime DEFAULT NULL,
  ADD COLUMN `lastModifiedAt` datetime DEFAULT NULL,
  ADD COLUMN `createdById` varchar(36) DEFAULT NULL,
  ADD COLUMN `lastModifiedById` varchar(36) DEFAULT NULL;

UPDATE `technical_doc_other_class`
SET
  `createdAt` = NOW(),
  `lastModifiedAt` = NOW()
WHERE `createdAt` IS NULL;

ALTER TABLE `technical_doc_other_class`
  ADD KEY `FK_95c59a0d83c3abef2bc35f9a7af` (`createdById`),
  ADD KEY `FK_7f0ec9a22b5fd87d7db069d000e` (`lastModifiedById`),
  ADD CONSTRAINT `FK_95c59a0d83c3abef2bc35f9a7af`
    FOREIGN KEY (`createdById`) REFERENCES `user` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_7f0ec9a22b5fd87d7db069d000e`
    FOREIGN KEY (`lastModifiedById`) REFERENCES `user` (`id`)
    ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT;

#1.10.18

START TRANSACTION;
-- =====================================================
-- ADD UNIQUE CONSTRAINTS ON LIKE TABLES (entity + likedBy)
-- =====================================================

-- Remove potential duplicates before adding constraints
DELETE l1 FROM `like_agent` l1
  INNER JOIN `like_agent` l2
  ON l1.`entityId` = l2.`entityId` AND l1.`likedById` = l2.`likedById` AND l1.`id` > l2.`id`;

DELETE l1 FROM `like_app` l1
  INNER JOIN `like_app` l2
  ON l1.`entityId` = l2.`entityId` AND l1.`likedById` = l2.`likedById` AND l1.`id` > l2.`id`;

DELETE l1 FROM `like_brick` l1
  INNER JOIN `like_brick` l2
  ON l1.`entityId` = l2.`entityId` AND l1.`likedById` = l2.`likedById` AND l1.`id` > l2.`id`;

DELETE l1 FROM `like_partner` l1
  INNER JOIN `like_partner` l2
  ON l1.`entityId` = l2.`entityId` AND l1.`likedById` = l2.`likedById` AND l1.`id` > l2.`id`;

DELETE l1 FROM `like_story` l1
  INNER JOIN `like_story` l2
  ON l1.`entityId` = l2.`entityId` AND l1.`likedById` = l2.`likedById` AND l1.`id` > l2.`id`;

DELETE l1 FROM `like_tag` l1
  INNER JOIN `like_tag` l2
  ON l1.`entityId` = l2.`entityId` AND l1.`likedById` = l2.`likedById` AND l1.`id` > l2.`id`;

ALTER TABLE `like_agent` ADD UNIQUE INDEX `UQ_like_agent_entity_user` (`entityId`, `likedById`);
ALTER TABLE `like_app` ADD UNIQUE INDEX `UQ_like_app_entity_user` (`entityId`, `likedById`);
ALTER TABLE `like_brick` ADD UNIQUE INDEX `UQ_like_brick_entity_user` (`entityId`, `likedById`);
ALTER TABLE `like_partner` ADD UNIQUE INDEX `UQ_like_partner_entity_user` (`entityId`, `likedById`);
ALTER TABLE `like_story` ADD UNIQUE INDEX `UQ_like_story_entity_user` (`entityId`, `likedById`);
ALTER TABLE `like_tag` ADD UNIQUE INDEX `UQ_like_tag_entity_user` (`entityId`, `likedById`);


-- Add expiresAt column to all invite tables and update enum to include EXPIRED status
ALTER TABLE `brick_user_invite` ADD COLUMN `expiresAt` datetime NULL;
ALTER TABLE `agent_co_author_invite` ADD COLUMN `expiresAt` datetime NULL;
ALTER TABLE `story_co_author_invite` ADD COLUMN `expiresAt` datetime NULL;
ALTER TABLE `tag_co_author_invite` ADD COLUMN `expiresAt` datetime NULL;
ALTER TABLE `app_co_author_invite` ADD COLUMN `expiresAt` datetime NULL;

-- Update invite status enum to include EXPIRED
ALTER TABLE `brick_user_invite` MODIFY COLUMN `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE `agent_co_author_invite` MODIFY COLUMN `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE `story_co_author_invite` MODIFY COLUMN `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE `tag_co_author_invite` MODIFY COLUMN `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE `app_co_author_invite` MODIFY COLUMN `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING';

COMMIT;

######################### 1.11.1 #######################

-- add ROBOT_USER_MAIL env variable

######################### 1.11.2 #######################

-- Normalize emails to lower case so invitation acceptance and user lookups are case-insensitive
update `user`
set email = lower(email)
where email != lower(email);

######################### 1.12.0 #######################

-- Widen the materialized-path tree column of `folder`.
-- TypeORM auto-generates `mpath` as varchar(255). Each nesting level adds a
-- 36-char UUID + '.' (37 chars), so 255 only holds ~6 levels; a deeper folder
-- overflows and its mpath is truncated, which drops the whole subtree from the
-- hierarchy (findDescendantsTree filters by `mpath LIKE 'ancestor.%'`).
-- Widen to 2048 (~55 levels). synchronize is disabled in prod so this sticks.
ALTER TABLE `folder`
  MODIFY `mpath` varchar(2048) NULL DEFAULT '';

######################### 1.13.0 #######################

-- BlNamingStrategy now snake_cases many-to-many @JoinTable columns (previously
-- fell through to TypeORM's default camelCase). Rename the existing join-table
-- columns so already-synced databases match the entities.
-- Only M2M @JoinTable columns are affected; regular FK columns were already snake_case.

-- story_topics_topic (HnStory.topics <-> HnTopic.stories)
ALTER TABLE `story_topics_topic`
  CHANGE `storyId` `story_id` varchar(36) NOT NULL,
  CHANGE `topicId` `topic_id` varchar(36) NOT NULL;

-- ############################################################################
-- MUST RUN BEFORE THE APP STARTS. Session refresh tokens live in this table; if
-- it is missing, /auth/refresh and /oauth/token fail, so nobody can stay logged
-- in. This is not a degraded feature, it breaks authentication.
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

-- Only for a database that already ran the CREATE TABLE above without
-- `previous_token_hash` (local and dev, which were used to validate the flow by hand).
-- Skip on any database created from the statement above — it already has the column.
--
-- ALTER TABLE `refresh_token`
--   ADD COLUMN `previous_token_hash` varchar(64) NULL COMMENT 'hash consumed by the last rotation; NULL when never rotated' AFTER `token_hash`,
--   ADD INDEX `IDX_refresh_token_previous_token_hash` (`previous_token_hash`);

-- ############################################################################
-- `oauth_grant` used to be created here. It is not any more: the cutover below
-- drops it, and a file that created a table only to drop it forty lines later
-- would no longer describe a schema any database should end up with.
--
-- Grants are the Space API's now — see `cn-migration.sql`, which still creates
-- the table, because that is the application that has one.
-- ############################################################################

-- ############################################################################
-- THE CUTOVER. This application stops being an Authorization Server and becomes
-- a Resource Server only (ADR-0001): tokens for its MCP are now minted by the
-- Space API and verified here against the key set that application publishes.
--
-- Run this AFTER the deployment, not before. Until the new code is live these
-- rows are still what the old endpoints read, and dropping them early would
-- break a flow that is still being served. Running it late costs nothing — the
-- new code never looks at either.
--
-- Browser sessions are deliberately untouched: `kind = 'session'` rows are the
-- Community's own logins, which do not change at all. Only Grant-kind rows go.
-- ############################################################################

-- Refresh tokens belonging to a Grant. They can only be renewed by an
-- Authorization Server, and this application no longer is one, so they are rows
-- nothing can act on. Deleting them is what makes that true in the data rather
-- than only in the code.
DELETE
FROM `refresh_token`
WHERE `kind` = 'oauth';

-- The Grants themselves, i.e. the approvals users gave clients for this
-- application's Resource. They are re-created against the Space API on the next
-- connection: a clean break, and none of this was ever in production, so there
-- is nothing being taken away from anyone.
--
-- `IF EXISTS` because this only has anything to drop on a database that ran the
-- earlier version of this file, which created the table. A database first set up
-- after the cutover never had it.
DROP TABLE IF EXISTS `oauth_grant`;

-- ENV VARIABLES. Nothing to add — a Resource Server holds no signing key, no redirect
-- allowlist and no token lifetime. Two to REMOVE, now the Space API's and no longer
-- read here, harmless to leave but the kind of stale secret that later looks
-- load-bearing: OAUTH_ALLOWED_REDIRECT_URIS and MCP_JWT_PRIVATE_KEY_BASE64.
--
-- SPACE_API_URL, already required for login, now also names the Authorization Server
-- and the host of the key set. It must name the same host as the Space API's API_URL,
-- scheme included; a trailing slash on either is stripped. No test compares them, and a
-- mismatch means every MCP call takes a 401 with both applications looking healthy.
--
-- Optional, defaulting to hn-jwt.config.ts: ACCESS_TOKEN_DURATION_SECONDS (900) and
-- REFRESH_TOKEN_DURATION_SECONDS (2592000).

-- ############################################################################
-- MUST BE SET BEFORE THE APP STARTS. No schema change, an environment variable.
--
-- CORS_ALLOWED_DOMAINS — the domains allowed to call this API cross-origin, replacing
--   the list that used to be hard-coded in hn-cors.config.ts ('constellab.community',
--   'constellab.space', 'preconstellab.com', 'gencovery.com', 'gencovery.io' and
--   'constellab.app'), which no dedicated instance could ever match. Comma-separated;
--   each entry allows the domain itself and any of its sub-domains over https, so one
--   registered domain is normally the whole value:
--     CORS_ALLOWED_DOMAINS=constellab.community,constellab.space,preconstellab.com,gencovery.com,gencovery.io,constellab.app
--
-- Unsetting it stops the application at startup rather than letting it serve a CORS
-- policy that accepts nothing but localhost — which, from the browser, is indistinguishable
-- from the API being down. It also governs the Ragflow chatbot websocket gateway, which
-- reuses the same origins. A local profile (dev, docker, test) ignores the value and
-- accepts every origin, so it may stay empty there.
-- ############################################################################

-- ############################################################################
-- MUST BE SET BEFORE THE APP STARTS. No schema change, environment variables.
--
-- The hard-coded per-environment values in hn-core-config.service.ts are gone: the
-- service used to switch over ENVIRONMENT_PROFILE and return Gencovery's own hosts and
-- buckets, which no dedicated instance could ever be. Each is now a variable, and an
-- unset one fails the same way any other missing config does.
--
-- FRONT_URL — this application's own front, the Community website. Read while the
--   injector is built (the OAuth module needs it to redirect a logged-out /authorize),
--   so an unset value stops the app at startup. Was 'https://constellab.community' in
--   prod, 'https://community-pre-prod.gencovery.com' in preprod:
--     FRONT_URL=https://community.acme-constellab.com
-- SPACE_FRONT_URL — the Space front, where a visitor is sent to log in or subscribe.
--   Was 'https://constellab.space/' in prod, 'https://preconstellab.com/' in preprod:
--     SPACE_FRONT_URL=https://acme-constellab.com
-- BUCKET_DB_BACKUP — where the nightly database dump is written. Was
--   'constellab-db-backup-prod' or '-pre-prod', i.e. a Gencovery bucket a dedicated
--   instance had no business writing to. Read by the midnight cron, not at boot, so
--   leaving it unset shows up as a failed backup rather than a failed start.
--
-- Both URLs are base URLs; a trailing slash is stripped, so either spelling works.
--
-- SPACE_API_URL is now read in every environment. It was already required outside a
-- local profile, where the service used to ignore it and force http://localhost:3001 —
-- dev and test env files now state that host instead of inheriting it from the code.
-- ############################################################################
