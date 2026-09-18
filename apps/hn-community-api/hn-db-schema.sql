-- Adminer 5.2.1 MariaDB 11.7.2-MariaDB-ubu2404 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `agent`;
CREATE TABLE `agent` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `latest_publish_version` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `parent_agent_version_id` varchar(255) DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `comments` int(11) NOT NULL DEFAULT 0,
  `latest_style` text DEFAULT NULL,
  `space_id` varchar(36) DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_agent_space_id` (`space_id`),
  KEY `FK_agent_created_by_id` (`created_by_id`),
  KEY `FK_agent_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_agent_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_agent_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_agent_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `agent_co_author`;
CREATE TABLE `agent_co_author` (
  `id` varchar(36) NOT NULL,
  `agent_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_agent_co_author_agent_id` (`agent_id`),
  KEY `FK_agent_co_author_user_id` (`user_id`),
  CONSTRAINT `FK_agent_co_author_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_agent_co_author_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `agent_co_author_invite`;
CREATE TABLE `agent_co_author_invite` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `token` varchar(255) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `agent_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_agent_co_author_invite_created_by_id` (`created_by_id`),
  KEY `FK_agent_co_author_invite_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_agent_co_author_invite_agent_id` (`agent_id`),
  CONSTRAINT `FK_agent_co_author_invite_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_agent_co_author_invite_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_agent_co_author_invite_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `agent_version`;
CREATE TABLE `agent_version` (
  `id` varchar(36) NOT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `version_state` enum('PUBLISHED','DRAFT') NOT NULL DEFAULT 'DRAFT',
  `type` enum('PYTHON','CONDA_PYTHON','MAMBA_PYTHON','PIP_PYTHON','CONDA_R','MAMBA_R','STREAMLIT','STREAMLIT_PIP','STREAMLIT_CONDA','STREAMLIT_MAMBA') NOT NULL DEFAULT 'PYTHON',
  `version_infos` text DEFAULT NULL,
  `params` text DEFAULT NULL,
  `environment` text DEFAULT NULL,
  `code` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `input_specs` text DEFAULT NULL,
  `output_specs` text DEFAULT NULL,
  `config_specs` text DEFAULT NULL,
  `style` text DEFAULT NULL,
  `agent_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_agent_version_version_agent_id` (`version`,`agent_id`),
  KEY `FK_agent_version_agent_id` (`agent_id`),
  CONSTRAINT `FK_agent_version_agent_id` FOREIGN KEY (`agent_id`) REFERENCES `agent` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `agent_version_brick_dependencies`;
CREATE TABLE `agent_version_brick_dependencies` (
  `agent_version_id` varchar(36) NOT NULL,
  `brick_version_id` varchar(36) NOT NULL,
  PRIMARY KEY (`agent_version_id`,`brick_version_id`),
  KEY `FK_agent_version_brick_dependencies_brick_version_id` (`brick_version_id`),
  CONSTRAINT `FK_agent_version_brick_dependencies_agent_version_id` FOREIGN KEY (`agent_version_id`) REFERENCES `agent_version` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_agent_version_brick_dependencies_brick_version_id` FOREIGN KEY (`brick_version_id`) REFERENCES `brick_version` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `app`;
CREATE TABLE `app` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `app_url` varchar(255) DEFAULT NULL,
  `contact_mail` varchar(255) DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `comments` int(11) NOT NULL DEFAULT 0,
  `executions` int(11) NOT NULL DEFAULT 0,
  `video` varchar(255) DEFAULT NULL,
  `figures` text DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `space_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_app_app_url` (`app_url`),
  KEY `FK_app_created_by_id` (`created_by_id`),
  KEY `FK_app_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_app_space_id` (`space_id`),
  CONSTRAINT `FK_app_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_app_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_app_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `app_co_author`;
CREATE TABLE `app_co_author` (
  `id` varchar(36) NOT NULL,
  `community_app_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_app_co_author_community_app_id` (`community_app_id`),
  KEY `FK_app_co_author_user_id` (`user_id`),
  CONSTRAINT `FK_app_co_author_community_app_id` FOREIGN KEY (`community_app_id`) REFERENCES `app` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_app_co_author_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `app_co_author_invite`;
CREATE TABLE `app_co_author_invite` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `token` varchar(255) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `community_app_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_app_co_author_invite_created_by_id` (`created_by_id`),
  KEY `FK_app_co_author_invite_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_app_co_author_invite_community_app_id` (`community_app_id`),
  CONSTRAINT `FK_app_co_author_invite_community_app_id` FOREIGN KEY (`community_app_id`) REFERENCES `app` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_app_co_author_invite_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_app_co_author_invite_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `app_stat`;
CREATE TABLE `app_stat` (
  `id` varchar(36) NOT NULL,
  `app_url` varchar(255) NOT NULL,
  `execution_date` datetime DEFAULT NULL,
  `creator_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_app_stat_creator_id` (`creator_id`),
  CONSTRAINT `FK_app_stat_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `app_user`;
CREATE TABLE `app_user` (
  `id` varchar(36) NOT NULL,
  `app_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_app_user_app_id` (`app_id`),
  KEY `FK_app_user_user_id` (`user_id`),
  CONSTRAINT `FK_app_user_app_id` FOREIGN KEY (`app_id`) REFERENCES `app` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_app_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `brick`;
CREATE TABLE `brick` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `is_certified` tinyint(4) NOT NULL,
  `visibility` enum('private','public') NOT NULL DEFAULT 'public',
  `pip_repo` varchar(255) DEFAULT NULL,
  `git_repo` varchar(255) DEFAULT NULL,
  `image_link` varchar(255) DEFAULT NULL,
  `credential_username` varchar(255) DEFAULT NULL,
  `credential_password` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `comments` int(11) NOT NULL DEFAULT 0,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `space_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_brick_name` (`name`),
  KEY `FK_brick_created_by_id` (`created_by_id`),
  KEY `FK_brick_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_brick_space_id` (`space_id`),
  CONSTRAINT `FK_brick_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `brick_major_version`;
CREATE TABLE `brick_major_version` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `major` int(11) NOT NULL DEFAULT 1,
  `version_state` enum('STABLE','LATEST') NOT NULL DEFAULT 'STABLE',
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `brick_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_brick_major_version_brick_id_major` (`brick_id`,`major`),
  KEY `FK_brick_major_version_created_by_id` (`created_by_id`),
  KEY `FK_brick_major_version_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_brick_major_version_brick_id` FOREIGN KEY (`brick_id`) REFERENCES `brick` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_major_version_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_major_version_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `brick_user`;
CREATE TABLE `brick_user` (
  `id` varchar(36) NOT NULL,
  `brick_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_brick_user_brick_id` (`brick_id`),
  KEY `FK_brick_user_user_id` (`user_id`),
  CONSTRAINT `FK_brick_user_brick_id` FOREIGN KEY (`brick_id`) REFERENCES `brick` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `brick_user_invite`;
CREATE TABLE `brick_user_invite` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `token` varchar(255) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `brick_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_brick_user_invite_created_by_id` (`created_by_id`),
  KEY `FK_brick_user_invite_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_brick_user_invite_brick_id` (`brick_id`),
  CONSTRAINT `FK_brick_user_invite_brick_id` FOREIGN KEY (`brick_id`) REFERENCES `brick` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_user_invite_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_user_invite_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `brick_version`;
CREATE TABLE `brick_version` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `minor` int(11) NOT NULL DEFAULT 0,
  `patch` int(11) NOT NULL DEFAULT 0,
  `sub_patch` int(11) DEFAULT NULL,
  `version_type` enum('NORMAL','BETA') NOT NULL,
  `repo_type` enum('PIP','GIT') NOT NULL,
  `technical_info` text DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `brick_major_version_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_brick_version_brick_major_version_id_minor_patch_sub_patch` (`brick_major_version_id`,`minor`,`patch`,`sub_patch`),
  KEY `FK_brick_version_created_by_id` (`created_by_id`),
  KEY `FK_brick_version_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_brick_version_brick_major_version_id` FOREIGN KEY (`brick_major_version_id`) REFERENCES `brick_major_version` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_version_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_version_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `brick_version_reference`;
CREATE TABLE `brick_version_reference` (
  `id` varchar(36) NOT NULL,
  `version_state` enum('DIRECT','INDIRECT') NOT NULL,
  `brick_version_id` varchar(255) NOT NULL,
  `reference_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_brick_version_reference_brick_version_id_reference_id` (`brick_version_id`,`reference_id`),
  KEY `FK_brick_version_reference_reference_id` (`reference_id`),
  CONSTRAINT `FK_brick_version_reference_brick_version_id` FOREIGN KEY (`brick_version_id`) REFERENCES `brick_version` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_brick_version_reference_reference_id` FOREIGN KEY (`reference_id`) REFERENCES `brick_version` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `comment_agent`;
CREATE TABLE `comment_agent` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `content` text NOT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_comment_agent_created_by_id` (`created_by_id`),
  KEY `FK_comment_agent_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_comment_agent_entity_id` (`entity_id`),
  CONSTRAINT `FK_comment_agent_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_agent_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `agent` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_agent_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `comment_app`;
CREATE TABLE `comment_app` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `content` text NOT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_comment_app_created_by_id` (`created_by_id`),
  KEY `FK_comment_app_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_comment_app_entity_id` (`entity_id`),
  CONSTRAINT `FK_comment_app_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_app_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `app` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_app_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `comment_partner`;
CREATE TABLE `comment_partner` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `content` text NOT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_comment_partner_created_by_id` (`created_by_id`),
  KEY `FK_comment_partner_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_comment_partner_entity_id` (`entity_id`),
  CONSTRAINT `FK_comment_partner_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_partner_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `partner` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_partner_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `comment_story`;
CREATE TABLE `comment_story` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `content` text NOT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_comment_story_created_by_id` (`created_by_id`),
  KEY `FK_comment_story_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_comment_story_entity_id` (`entity_id`),
  CONSTRAINT `FK_comment_story_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_story_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `story` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_story_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `comment_tag`;
CREATE TABLE `comment_tag` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `content` text NOT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_comment_tag_created_by_id` (`created_by_id`),
  KEY `FK_comment_tag_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_comment_tag_entity_id` (`entity_id`),
  CONSTRAINT `FK_comment_tag_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_tag_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `tag_key` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_comment_tag_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `documentation`;
CREATE TABLE `documentation` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `modifications` longtext DEFAULT NULL,
  `modifications_backup` longtext DEFAULT NULL,
  `path` varchar(255) NOT NULL,
  `complete_path` varchar(255) NOT NULL,
  `order` int(11) NOT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `folder_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_documentation_created_by_id` (`created_by_id`),
  KEY `FK_documentation_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_documentation_folder_id` (`folder_id`),
  CONSTRAINT `FK_documentation_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_documentation_folder_id` FOREIGN KEY (`folder_id`) REFERENCES `folder` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_documentation_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `file_agent`;
CREATE TABLE `file_agent` (
  `id` varchar(36) NOT NULL,
  `type` enum('FILE','IMAGE','RESOURCE_VIEW') NOT NULL DEFAULT 'FILE',
  `file_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_file_agent_file_name` (`file_name`),
  UNIQUE KEY `IDX_file_agent_entity_id_name` (`entity_id`,`name`),
  KEY `FK_file_agent_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_file_agent_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_file_agent_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `agent` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `file_app`;
CREATE TABLE `file_app` (
  `id` varchar(36) NOT NULL,
  `type` enum('FILE','IMAGE','RESOURCE_VIEW') NOT NULL DEFAULT 'FILE',
  `file_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_file_app_file_name` (`file_name`),
  UNIQUE KEY `IDX_file_app_entity_id_name` (`entity_id`,`name`),
  KEY `FK_file_app_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_file_app_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_file_app_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `app` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `file_documentation`;
CREATE TABLE `file_documentation` (
  `id` varchar(36) NOT NULL,
  `type` enum('FILE','IMAGE','RESOURCE_VIEW') NOT NULL DEFAULT 'FILE',
  `file_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_file_documentation_file_name` (`file_name`),
  UNIQUE KEY `IDX_file_documentation_entity_id_name` (`entity_id`,`name`),
  KEY `FK_file_documentation_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_file_documentation_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_file_documentation_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `documentation` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `file_partner`;
CREATE TABLE `file_partner` (
  `id` varchar(36) NOT NULL,
  `type` enum('FILE','IMAGE','RESOURCE_VIEW') NOT NULL DEFAULT 'FILE',
  `file_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_file_partner_file_name` (`file_name`),
  UNIQUE KEY `IDX_file_partner_entity_id_name` (`entity_id`,`name`),
  KEY `FK_file_partner_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_file_partner_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_file_partner_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `partner` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `file_story`;
CREATE TABLE `file_story` (
  `id` varchar(36) NOT NULL,
  `type` enum('FILE','IMAGE','RESOURCE_VIEW') NOT NULL DEFAULT 'FILE',
  `file_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_file_story_file_name` (`file_name`),
  UNIQUE KEY `IDX_file_story_entity_id_name` (`entity_id`,`name`),
  KEY `FK_file_story_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_file_story_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_file_story_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `story` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `folder`;
CREATE TABLE `folder` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `complete_path` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL,
  `mpath` varchar(255) DEFAULT '',
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `brick_major_version_id` varchar(36) NOT NULL,
  `folder_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_folder_created_by_id` (`created_by_id`),
  KEY `FK_folder_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_folder_brick_major_version_id` (`brick_major_version_id`),
  KEY `FK_folder_folder_id` (`folder_id`),
  CONSTRAINT `FK_folder_brick_major_version_id` FOREIGN KEY (`brick_major_version_id`) REFERENCES `brick_major_version` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_folder_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_folder_folder_id` FOREIGN KEY (`folder_id`) REFERENCES `folder` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_folder_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `icon`;
CREATE TABLE `icon` (
  `id` varchar(36) NOT NULL,
  `technical_name` varchar(30) NOT NULL,
  `name` varchar(255) NOT NULL,
  `sub_names` text NOT NULL,
  `type` enum('COMMUNITY_ICON','COMMUNITY_IMAGE') NOT NULL DEFAULT 'COMMUNITY_ICON',
  `file_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_icon_technical_name` (`technical_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `like_agent`;
CREATE TABLE `like_agent` (
  `id` varchar(36) NOT NULL,
  `liked_at` datetime NOT NULL,
  `liked_by_id` varchar(36) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_like_agent_entity_id_liked_by_id` (`entity_id`,`liked_by_id`),
  KEY `FK_like_agent_liked_by_id` (`liked_by_id`),
  CONSTRAINT `FK_like_agent_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `agent` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_like_agent_liked_by_id` FOREIGN KEY (`liked_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `like_app`;
CREATE TABLE `like_app` (
  `id` varchar(36) NOT NULL,
  `liked_at` datetime NOT NULL,
  `liked_by_id` varchar(36) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_like_app_entity_id_liked_by_id` (`entity_id`,`liked_by_id`),
  KEY `FK_like_app_liked_by_id` (`liked_by_id`),
  CONSTRAINT `FK_like_app_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `app` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_like_app_liked_by_id` FOREIGN KEY (`liked_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `like_brick`;
CREATE TABLE `like_brick` (
  `id` varchar(36) NOT NULL,
  `liked_at` datetime NOT NULL,
  `liked_by_id` varchar(36) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_like_brick_entity_id_liked_by_id` (`entity_id`,`liked_by_id`),
  KEY `FK_like_brick_liked_by_id` (`liked_by_id`),
  CONSTRAINT `FK_like_brick_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `brick` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_like_brick_liked_by_id` FOREIGN KEY (`liked_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `like_partner`;
CREATE TABLE `like_partner` (
  `id` varchar(36) NOT NULL,
  `liked_at` datetime NOT NULL,
  `liked_by_id` varchar(36) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_like_partner_entity_id_liked_by_id` (`entity_id`,`liked_by_id`),
  KEY `FK_like_partner_liked_by_id` (`liked_by_id`),
  CONSTRAINT `FK_like_partner_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `partner` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_like_partner_liked_by_id` FOREIGN KEY (`liked_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `like_story`;
CREATE TABLE `like_story` (
  `id` varchar(36) NOT NULL,
  `liked_at` datetime NOT NULL,
  `liked_by_id` varchar(36) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_like_story_entity_id_liked_by_id` (`entity_id`,`liked_by_id`),
  KEY `FK_like_story_liked_by_id` (`liked_by_id`),
  CONSTRAINT `FK_like_story_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `story` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_like_story_liked_by_id` FOREIGN KEY (`liked_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `like_tag`;
CREATE TABLE `like_tag` (
  `id` varchar(36) NOT NULL,
  `liked_at` datetime NOT NULL,
  `liked_by_id` varchar(36) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_like_tag_entity_id_liked_by_id` (`entity_id`,`liked_by_id`),
  KEY `FK_like_tag_liked_by_id` (`liked_by_id`),
  CONSTRAINT `FK_like_tag_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `tag_key` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_like_tag_liked_by_id` FOREIGN KEY (`liked_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `mail`;
CREATE TABLE `mail` (
  `id` varchar(36) NOT NULL,
  `recipients` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `mail` text NOT NULL,
  `status` enum('PENDING','SENT','ERROR') NOT NULL DEFAULT 'PENDING',
  `last_modified_at` datetime NOT NULL,
  `error` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `partner`;
CREATE TABLE `partner` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `certified` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `info` text NOT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `comments` int(11) NOT NULL DEFAULT 0,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_partner_name` (`name`),
  UNIQUE KEY `REL_partner_user_id` (`user_id`),
  KEY `FK_partner_created_by_id` (`created_by_id`),
  KEY `FK_partner_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_partner_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_partner_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_partner_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `protocol`;
CREATE TABLE `protocol` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `brick_name` varchar(255) NOT NULL,
  `brick_major` int(11) NOT NULL,
  `unique_name` varchar(255) NOT NULL,
  `human_name` varchar(255) NOT NULL,
  `doc` text DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `typing_name` varchar(255) NOT NULL,
  `parent_human_name` varchar(255) DEFAULT NULL,
  `parent_typing_name` varchar(255) DEFAULT NULL,
  `parent_major_version` int(11) DEFAULT NULL,
  `parent_version` varchar(255) DEFAULT NULL,
  `hide` tinyint(4) NOT NULL,
  `deprecated_since` varchar(255) DEFAULT NULL,
  `deprecated_message` varchar(255) DEFAULT NULL,
  `style` text DEFAULT NULL,
  `object_sub_type` varchar(255) DEFAULT NULL,
  `input_specs` text DEFAULT NULL,
  `output_specs` text DEFAULT NULL,
  `config_specs` text DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `technical_folder_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_protocol_unique_name_technical_folder_id` (`unique_name`,`technical_folder_id`),
  KEY `FK_protocol_created_by_id` (`created_by_id`),
  KEY `FK_protocol_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_protocol_technical_folder_id` (`technical_folder_id`),
  CONSTRAINT `FK_protocol_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_protocol_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_protocol_technical_folder_id` FOREIGN KEY (`technical_folder_id`) REFERENCES `technical_folder` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `refresh_token`;
CREATE TABLE `refresh_token` (
  `id` varchar(36) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `previous_token_hash` varchar(64) DEFAULT NULL COMMENT 'hash consumed by the last rotation; NULL when never rotated',
  `kind` varchar(16) NOT NULL COMMENT 'session | oauth',
  `user_id` varchar(36) NOT NULL,
  `expires_at` datetime NOT NULL,
  `client_id` varchar(64) DEFAULT NULL COMMENT 'OAuth clients only',
  `resource` varchar(512) DEFAULT NULL COMMENT 'OAuth clients only: token audience',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_refresh_token_token_hash` (`token_hash`),
  KEY `IDX_refresh_token_previous_token_hash` (`previous_token_hash`),
  KEY `FK_refresh_token_user_id` (`user_id`),
  CONSTRAINT `FK_refresh_token_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `resource`;
CREATE TABLE `resource` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `brick_name` varchar(255) NOT NULL,
  `brick_major` int(11) NOT NULL,
  `unique_name` varchar(255) NOT NULL,
  `human_name` varchar(255) NOT NULL,
  `doc` text DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `typing_name` varchar(255) NOT NULL,
  `parent_human_name` varchar(255) DEFAULT NULL,
  `parent_typing_name` varchar(255) DEFAULT NULL,
  `parent_major_version` int(11) DEFAULT NULL,
  `parent_version` varchar(255) DEFAULT NULL,
  `hide` tinyint(4) NOT NULL,
  `deprecated_since` varchar(255) DEFAULT NULL,
  `deprecated_message` varchar(255) DEFAULT NULL,
  `style` text DEFAULT NULL,
  `object_sub_type` varchar(255) DEFAULT NULL,
  `variables` text DEFAULT NULL,
  `methods` text DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `technical_folder_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_resource_unique_name_technical_folder_id` (`unique_name`,`technical_folder_id`),
  KEY `FK_resource_created_by_id` (`created_by_id`),
  KEY `FK_resource_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_resource_technical_folder_id` (`technical_folder_id`),
  CONSTRAINT `FK_resource_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_resource_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_resource_technical_folder_id` FOREIGN KEY (`technical_folder_id`) REFERENCES `technical_folder` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `run_stat`;
CREATE TABLE `run_stat` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `process_typing_name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `error_info` text DEFAULT NULL,
  `started_at` datetime NOT NULL,
  `ended_at` datetime NOT NULL,
  `elapsed_time` float NOT NULL,
  `brick_version_on_run` varchar(255) NOT NULL,
  `brick_version_on_create` varchar(255) NOT NULL,
  `config_value` text NOT NULL,
  `lab_id` varchar(255) NOT NULL,
  `lab_env` varchar(255) NOT NULL,
  `creators` text NOT NULL,
  `executed_by_id` varchar(36) NOT NULL,
  `agent_version_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_run_stat_executed_by_id` (`executed_by_id`),
  KEY `FK_run_stat_agent_version_id` (`agent_version_id`),
  CONSTRAINT `FK_run_stat_agent_version_id` FOREIGN KEY (`agent_version_id`) REFERENCES `agent_version` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_run_stat_executed_by_id` FOREIGN KEY (`executed_by_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `run_stat_aggregate`;
CREATE TABLE `run_stat_aggregate` (
  `id` varchar(36) NOT NULL,
  `object_id` varchar(255) NOT NULL,
  `object_type` enum('AGENT','AGENT_VERSION','TASK','PROTOCOL','BRICK','USER') NOT NULL,
  `execution_count` int(11) NOT NULL,
  `success_rate` float NOT NULL,
  `average_elapse_time` float NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_run_stat_aggregate_object_id_object_type` (`object_id`,`object_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `space`;
CREATE TABLE `space` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_space_created_by_id` (`created_by_id`),
  KEY `FK_space_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_space_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_space_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `space_user`;
CREATE TABLE `space_user` (
  `user_id` varchar(36) NOT NULL,
  `space_id` varchar(36) NOT NULL,
  `role` enum('ADMIN','USER') NOT NULL DEFAULT 'USER',
  `active` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `added_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`user_id`,`space_id`),
  KEY `FK_space_user_space_id` (`space_id`),
  KEY `FK_space_user_added_by_id` (`added_by_id`),
  CONSTRAINT `FK_space_user_added_by_id` FOREIGN KEY (`added_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_space_user_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_space_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `story`;
CREATE TABLE `story` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `content_edition` text DEFAULT NULL,
  `modifications` longtext DEFAULT NULL,
  `first_paragraph` varchar(255) DEFAULT NULL,
  `main_picture` varchar(255) DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `comments` int(11) NOT NULL DEFAULT 0,
  `title_path` varchar(255) DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_story_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_story_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `story_co_author`;
CREATE TABLE `story_co_author` (
  `id` varchar(36) NOT NULL,
  `story_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_story_co_author_story_id` (`story_id`),
  KEY `FK_story_co_author_user_id` (`user_id`),
  CONSTRAINT `FK_story_co_author_story_id` FOREIGN KEY (`story_id`) REFERENCES `story` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_story_co_author_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `story_co_author_invite`;
CREATE TABLE `story_co_author_invite` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `token` varchar(255) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `story_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_story_co_author_invite_created_by_id` (`created_by_id`),
  KEY `FK_story_co_author_invite_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_story_co_author_invite_story_id` (`story_id`),
  CONSTRAINT `FK_story_co_author_invite_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_story_co_author_invite_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_story_co_author_invite_story_id` FOREIGN KEY (`story_id`) REFERENCES `story` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `story_topics_topic`;
CREATE TABLE `story_topics_topic` (
  `storyId` varchar(36) NOT NULL,
  `topicId` varchar(36) NOT NULL,
  PRIMARY KEY (`storyId`,`topicId`),
  KEY `IDX_story_topics_topic_storyId` (`storyId`),
  KEY `IDX_story_topics_topic_topicId` (`topicId`),
  CONSTRAINT `FK_story_topics_topic_storyId` FOREIGN KEY (`storyId`) REFERENCES `story` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_story_topics_topic_topicId` FOREIGN KEY (`topicId`) REFERENCES `topic` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `tag_co_author`;
CREATE TABLE `tag_co_author` (
  `id` varchar(36) NOT NULL,
  `tag_key_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_tag_co_author_tag_key_id` (`tag_key_id`),
  KEY `FK_tag_co_author_user_id` (`user_id`),
  CONSTRAINT `FK_tag_co_author_tag_key_id` FOREIGN KEY (`tag_key_id`) REFERENCES `tag_key` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tag_co_author_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `tag_co_author_invite`;
CREATE TABLE `tag_co_author_invite` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `status` enum('ACCEPTED','PENDING','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `token` varchar(255) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `tag_key_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_tag_co_author_invite_created_by_id` (`created_by_id`),
  KEY `FK_tag_co_author_invite_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_tag_co_author_invite_tag_key_id` (`tag_key_id`),
  CONSTRAINT `FK_tag_co_author_invite_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tag_co_author_invite_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tag_co_author_invite_tag_key_id` FOREIGN KEY (`tag_key_id`) REFERENCES `tag_key` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `tag_key`;
CREATE TABLE `tag_key` (
  `id` varchar(36) NOT NULL,
  `technical_name` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `type` enum('STRING','INTEGER','FLOAT','BOOLEAN','DATETIME') NOT NULL,
  `deprecated` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `additional_infos_specs` text DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `comments` int(11) NOT NULL DEFAULT 0,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `space_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_tag_key_technical_name` (`technical_name`),
  KEY `FK_tag_key_created_by_id` (`created_by_id`),
  KEY `FK_tag_key_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_tag_key_space_id` (`space_id`),
  CONSTRAINT `FK_tag_key_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tag_key_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tag_key_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `tag_value`;
CREATE TABLE `tag_value` (
  `id` varchar(36) NOT NULL,
  `value` varchar(255) NOT NULL,
  `deprecated` tinyint(4) NOT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `additional_infos` text DEFAULT NULL,
  `tag_key_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_tag_value_value_tag_key_id` (`value`,`tag_key_id`),
  KEY `FK_tag_value_tag_key_id` (`tag_key_id`),
  CONSTRAINT `FK_tag_value_tag_key_id` FOREIGN KEY (`tag_key_id`) REFERENCES `tag_key` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `brick_name` varchar(255) NOT NULL,
  `brick_major` int(11) NOT NULL,
  `unique_name` varchar(255) NOT NULL,
  `human_name` varchar(255) NOT NULL,
  `doc` text DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `typing_name` varchar(255) NOT NULL,
  `parent_human_name` varchar(255) DEFAULT NULL,
  `parent_typing_name` varchar(255) DEFAULT NULL,
  `parent_major_version` int(11) DEFAULT NULL,
  `parent_version` varchar(255) DEFAULT NULL,
  `hide` tinyint(4) NOT NULL,
  `deprecated_since` varchar(255) DEFAULT NULL,
  `deprecated_message` varchar(255) DEFAULT NULL,
  `style` text DEFAULT NULL,
  `object_sub_type` varchar(255) DEFAULT NULL,
  `input_specs` text DEFAULT NULL,
  `output_specs` text DEFAULT NULL,
  `config_specs` text DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `technical_folder_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_task_unique_name_technical_folder_id` (`unique_name`,`technical_folder_id`),
  KEY `FK_task_created_by_id` (`created_by_id`),
  KEY `FK_task_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_task_technical_folder_id` (`technical_folder_id`),
  CONSTRAINT `FK_task_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_task_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_task_technical_folder_id` FOREIGN KEY (`technical_folder_id`) REFERENCES `technical_folder` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `technical_doc_other_class`;
CREATE TABLE `technical_doc_other_class` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `brick_name` varchar(255) NOT NULL,
  `brick_major` int(11) NOT NULL,
  `unique_name` varchar(255) NOT NULL,
  `human_name` varchar(255) NOT NULL,
  `doc` text DEFAULT NULL,
  `variables` text DEFAULT NULL,
  `methods` text DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `technical_folder_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_technical_doc_other_class_unique_name_technical_folder_id` (`unique_name`,`technical_folder_id`),
  KEY `FK_technical_doc_other_class_created_by_id` (`created_by_id`),
  KEY `FK_technical_doc_other_class_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_technical_doc_other_class_technical_folder_id` (`technical_folder_id`),
  CONSTRAINT `FK_technical_doc_other_class_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_technical_doc_other_class_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_technical_doc_other_class_technical_folder_id` FOREIGN KEY (`technical_folder_id`) REFERENCES `technical_folder` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `technical_folder`;
CREATE TABLE `technical_folder` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `brick_major_version_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_technical_folder_created_by_id` (`created_by_id`),
  KEY `FK_technical_folder_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_technical_folder_brick_major_version_id` (`brick_major_version_id`),
  CONSTRAINT `FK_technical_folder_brick_major_version_id` FOREIGN KEY (`brick_major_version_id`) REFERENCES `brick_major_version` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_technical_folder_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_technical_folder_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `topic`;
CREATE TABLE `topic` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `popularity_index` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(255) NOT NULL,
  `user_code` varchar(11) NOT NULL,
  `alias` varchar(52) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `github_link` varchar(255) DEFAULT NULL,
  `linkedin_link` varchar(255) DEFAULT NULL,
  `x_link` varchar(255) DEFAULT NULL,
  `interests` varchar(255) DEFAULT NULL,
  `category` enum('ADMIN','USER') NOT NULL,
  `created_at` datetime NOT NULL,
  `lang` enum('en','fr') NOT NULL DEFAULT 'en',
  `theme` enum('light-theme','dark-theme') NOT NULL DEFAULT 'light-theme',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_user_email` (`email`),
  UNIQUE KEY `IDX_user_user_code` (`user_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2026-09-17 13:41:16 UTC