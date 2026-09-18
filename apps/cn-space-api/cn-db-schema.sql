-- Adminer 5.2.1 MariaDB 11.7.2-MariaDB-ubu2404 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
  `id` varchar(36) NOT NULL,
  `entity_type` enum('FOLDER','SCENARIO','NOTE','DOCUMENT','RESOURCE','MESSAGE') NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `entity_name` varchar(255) NOT NULL,
  `action_type` enum('CREATE','UPDATE','DELETE','TRASH') NOT NULL,
  `title` varchar(255) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `space_id` varchar(36) DEFAULT NULL,
  `parent_entity_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_activity_user_id` (`user_id`),
  KEY `FK_activity_space_id` (`space_id`),
  CONSTRAINT `FK_activity_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_activity_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `brick`;
CREATE TABLE `brick` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `pip_repo` varchar(255) DEFAULT NULL,
  `git_repo` varchar(255) DEFAULT NULL,
  `visibility` enum('private','public') NOT NULL DEFAULT 'public',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_brick_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `brick_version`;
CREATE TABLE `brick_version` (
  `id` varchar(36) NOT NULL,
  `major` int(11) NOT NULL DEFAULT 1,
  `minor` int(11) NOT NULL DEFAULT 0,
  `patch` int(11) NOT NULL DEFAULT 0,
  `sub_patch` int(11) DEFAULT NULL,
  `version_type` enum('NORMAL','BETA') NOT NULL,
  `version_state` enum('STABLE','LATEST','NEXT') NOT NULL DEFAULT 'STABLE',
  `repo_type` enum('PIP','GIT') NOT NULL,
  `technical_info` text DEFAULT NULL,
  `brick_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_brick_version_brick_id` (`brick_id`),
  CONSTRAINT `FK_brick_version_brick_id` FOREIGN KEY (`brick_id`) REFERENCES `brick` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bucket`;
CREATE TABLE `bucket` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `name` varchar(100) NOT NULL,
  `content_type` enum('LAB_BACKUP','SPACE_IMAGE','USER_IMAGE','FOLDER') NOT NULL,
  `bucket_type` enum('NORMAL','LAB','AZURE','GCP') NOT NULL DEFAULT 'NORMAL',
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `region_id` varchar(36) DEFAULT NULL,
  `lab_id` varchar(36) DEFAULT NULL,
  `credentials_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_bucket_created_by_id` (`created_by_id`),
  KEY `FK_bucket_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_bucket_region_id` (`region_id`),
  KEY `FK_bucket_lab_id` (`lab_id`),
  KEY `FK_bucket_credentials_id` (`credentials_id`),
  CONSTRAINT `FK_bucket_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bucket_credentials_id` FOREIGN KEY (`credentials_id`) REFERENCES `bucket_credentials` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bucket_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bucket_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bucket_region_id` FOREIGN KEY (`region_id`) REFERENCES `cloud_provider_region` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `bucket_credentials`;
CREATE TABLE `bucket_credentials` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `name` varchar(50) NOT NULL,
  `access_key_id` varchar(100) NOT NULL,
  `secret_access_key` varchar(100) NOT NULL,
  `space_id` varchar(36) DEFAULT NULL,
  `s3_username` varchar(50) DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `cloud_provider_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_bucket_credentials_created_by_id` (`created_by_id`),
  KEY `FK_bucket_credentials_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_bucket_credentials_cloud_provider_id` (`cloud_provider_id`),
  KEY `FK_bucket_credentials_space_id` (`space_id`),
  CONSTRAINT `FK_bucket_credentials_cloud_provider_id` FOREIGN KEY (`cloud_provider_id`) REFERENCES `cloud_provider` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bucket_credentials_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bucket_credentials_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bucket_credentials_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `chat_message`;
CREATE TABLE `chat_message` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `content` text DEFAULT NULL,
  `folder_hierarchy_id` varchar(36) NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_chat_message_created_by_id` (`created_by_id`),
  KEY `FK_chat_message_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_chat_message_folder_hierarchy_id` (`folder_hierarchy_id`),
  CONSTRAINT `FK_chat_message_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_chat_message_folder_hierarchy_id` FOREIGN KEY (`folder_hierarchy_id`) REFERENCES `hierarchy_object` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_chat_message_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `city`;
CREATE TABLE `city` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `country_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_city_country_id` (`country_id`),
  CONSTRAINT `FK_city_country_id` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cloud_provider`;
CREATE TABLE `cloud_provider` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_cloud_provider_name` (`name`),
  KEY `FK_cloud_provider_created_by_id` (`created_by_id`),
  KEY `FK_cloud_provider_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_cloud_provider_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_cloud_provider_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `cloud_provider_region`;
CREATE TABLE `cloud_provider_region` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `type` enum('ALL','SERVER','S3') NOT NULL,
  `technical_name` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `s3_endpoint` varchar(255) DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `cloud_provider_id` varchar(36) DEFAULT NULL,
  `city_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_cloud_provider_region_technical_name_cloud_provider_id_type` (`technical_name`,`cloud_provider_id`,`type`),
  KEY `FK_cloud_provider_region_created_by_id` (`created_by_id`),
  KEY `FK_cloud_provider_region_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_cloud_provider_region_cloud_provider_id` (`cloud_provider_id`),
  KEY `FK_cloud_provider_region_city_id` (`city_id`),
  CONSTRAINT `FK_cloud_provider_region_city_id` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_cloud_provider_region_cloud_provider_id` FOREIGN KEY (`cloud_provider_id`) REFERENCES `cloud_provider` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_cloud_provider_region_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_cloud_provider_region_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `country`;
CREATE TABLE `country` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `short_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `document`;
CREATE TABLE `document` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `name` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `size` bigint(20) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `type` enum('UPLOADED_DOCUMENT','CONSTELLAB_DOCUMENT','CONSTELLAB_DOCUMENT_CONTENT','DESCRIPTION_CONTENT','NOTE','NOTE_CONTENT','MESSAGE_CONTENT') NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `bucket_type` enum('NORMAL','LAB','AZURE','GCP') NOT NULL,
  `preview_token` varchar(36) DEFAULT NULL,
  `preview_token_expiration` datetime DEFAULT NULL,
  `style` text NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `parent_document_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_document_created_by_id` (`created_by_id`),
  KEY `FK_document_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_document_parent_document_id` (`parent_document_id`),
  CONSTRAINT `FK_document_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_document_id` FOREIGN KEY (`id`) REFERENCES `hierarchy_object` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_document_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_document_parent_document_id` FOREIGN KEY (`parent_document_id`) REFERENCES `document` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `folder`;
CREATE TABLE `folder` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `starting_date` date DEFAULT NULL,
  `ending_date` date DEFAULT NULL,
  `chat_enabled` tinyint(4) NOT NULL DEFAULT 0,
  `style` text NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `main_storage_id` varchar(36) DEFAULT NULL,
  `backup_storage_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_folder_created_by_id` (`created_by_id`),
  KEY `FK_folder_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_folder_main_storage_id` (`main_storage_id`),
  KEY `FK_folder_backup_storage_id` (`backup_storage_id`),
  CONSTRAINT `FK_folder_backup_storage_id` FOREIGN KEY (`backup_storage_id`) REFERENCES `bucket` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_folder_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_folder_id` FOREIGN KEY (`id`) REFERENCES `hierarchy_object` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_folder_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_folder_main_storage_id` FOREIGN KEY (`main_storage_id`) REFERENCES `bucket` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `folder_user`;
CREATE TABLE `folder_user` (
  `user_id` varchar(36) NOT NULL,
  `root_folder_id` varchar(36) NOT NULL,
  `role` enum('OWNER','USER','VIEWER') NOT NULL,
  `shared_at` datetime NOT NULL,
  `folder_notif` enum('NOTIF_ONLY','EMAIL_ONLY','NOTIF_AND_EMAIL','NONE') NOT NULL DEFAULT 'NONE',
  `message_notif` enum('NOTIF_ONLY','EMAIL_ONLY','NOTIF_AND_EMAIL','NONE') NOT NULL DEFAULT 'NOTIF_ONLY',
  `scenario_notif` enum('NOTIF_ONLY','EMAIL_ONLY','NOTIF_AND_EMAIL','NONE') NOT NULL DEFAULT 'NONE',
  `note_notif` enum('NOTIF_ONLY','EMAIL_ONLY','NOTIF_AND_EMAIL','NONE') NOT NULL DEFAULT 'NONE',
  `document_notif` enum('NOTIF_ONLY','EMAIL_ONLY','NOTIF_AND_EMAIL','NONE') NOT NULL DEFAULT 'NONE',
  `shared_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`user_id`,`root_folder_id`),
  KEY `FK_folder_user_root_folder_id` (`root_folder_id`),
  KEY `FK_folder_user_shared_by_id` (`shared_by_id`),
  CONSTRAINT `FK_folder_user_root_folder_id` FOREIGN KEY (`root_folder_id`) REFERENCES `hierarchy_object` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_folder_user_shared_by_id` FOREIGN KEY (`shared_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_folder_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `front_error`;
CREATE TABLE `front_error` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `message` varchar(1000) NOT NULL,
  `stack_trace` text DEFAULT NULL,
  `route` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `created_by_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_front_error_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_front_error_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `group`;
CREATE TABLE `group` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `label` varchar(255) NOT NULL,
  `type` enum('SINGLE_USER','TEAM') NOT NULL DEFAULT 'SINGLE_USER',
  `user_id` varchar(36) DEFAULT NULL,
  `space_id` varchar(36) DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_group_user_id` (`user_id`),
  KEY `IDX_group_type` (`type`),
  KEY `FK_group_created_by_id` (`created_by_id`),
  KEY `FK_group_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_group_space_id` (`space_id`),
  CONSTRAINT `FK_group_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_group_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_group_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_group_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `hierarchy_object`;
CREATE TABLE `hierarchy_object` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `object_type` enum('FOLDER','DOCUMENT','CONSTELLAB_DOCUMENT','HIDDEN_DOCUMENT','NOTE','SCENARIO','RESOURCE','APPLICATION') NOT NULL,
  `object_type_order` int(11) NOT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `root_parent_id` varchar(36) DEFAULT NULL,
  `space_id` varchar(36) NOT NULL,
  `visibility` enum('VISIBLE','TRASH','HIDDEN') NOT NULL,
  `chat_enabled` tinyint(4) NOT NULL DEFAULT 0,
  `has_description` tinyint(4) NOT NULL DEFAULT 0,
  `is_validated` tinyint(4) NOT NULL DEFAULT 0,
  `document_size` bigint(20) DEFAULT NULL,
  `style` text NOT NULL,
  `last_tags_str` varchar(255) DEFAULT NULL,
  `mpath` varchar(255) DEFAULT '',
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_hierarchy_object_user_id` (`user_id`),
  KEY `FK_hierarchy_object_parent_id` (`parent_id`),
  KEY `FK_hierarchy_object_root_parent_id` (`root_parent_id`),
  KEY `FK_hierarchy_object_space_id` (`space_id`),
  CONSTRAINT `FK_hierarchy_object_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `hierarchy_object` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_hierarchy_object_root_parent_id` FOREIGN KEY (`root_parent_id`) REFERENCES `hierarchy_object` (`id`),
  CONSTRAINT `FK_hierarchy_object_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_hierarchy_object_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `hierarchy_object_tag`;
CREATE TABLE `hierarchy_object_tag` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `tag_key` varchar(50) NOT NULL,
  `tag_value` varchar(50) NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `hierarchy_object_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hierarchy_object_tag_key_value_lab` (`tag_key`,`tag_value`,`hierarchy_object_id`),
  KEY `FK_hierarchy_object_tag_created_by_id` (`created_by_id`),
  KEY `FK_hierarchy_object_tag_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_hierarchy_object_tag_hierarchy_object_id` (`hierarchy_object_id`),
  CONSTRAINT `FK_hierarchy_object_tag_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_hierarchy_object_tag_hierarchy_object_id` FOREIGN KEY (`hierarchy_object_id`) REFERENCES `hierarchy_object` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_hierarchy_object_tag_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `hierarchy_object_tag_history`;
CREATE TABLE `hierarchy_object_tag_history` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `tag_key` varchar(50) NOT NULL,
  `tag_value` varchar(50) NOT NULL,
  `type` enum('CREATED','DELETED') NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `hierarchy_object_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_hierarchy_object_tag_history_created_by_id` (`created_by_id`),
  KEY `FK_hierarchy_object_tag_history_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_hierarchy_object_tag_history_hierarchy_object_id` (`hierarchy_object_id`),
  CONSTRAINT `FK_hierarchy_object_tag_history_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_hierarchy_object_tag_history_hierarchy_object_id` FOREIGN KEY (`hierarchy_object_id`) REFERENCES `hierarchy_object` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_hierarchy_object_tag_history_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `hierarchy_object_token`;
CREATE TABLE `hierarchy_object_token` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `hierarchy_object_id` varchar(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiration_date` datetime DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_hierarchy_object_token_created_by_id` (`created_by_id`),
  KEY `FK_hierarchy_object_token_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_hierarchy_object_token_hierarchy_object_id` (`hierarchy_object_id`),
  CONSTRAINT `FK_hierarchy_object_token_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_hierarchy_object_token_hierarchy_object_id` FOREIGN KEY (`hierarchy_object_id`) REFERENCES `hierarchy_object` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_hierarchy_object_token_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab`;
CREATE TABLE `lab` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `name` varchar(50) NOT NULL,
  `cloud_name` varchar(36) DEFAULT NULL,
  `type` enum('CLOUD','DESKTOP','ON_PREMISE') NOT NULL,
  `lab_config_id` varchar(36) DEFAULT NULL,
  `glab_prod_api_key` varchar(255) NOT NULL,
  `glab_dev_api_key` varchar(255) NOT NULL,
  `lab_manager_api_key` varchar(255) DEFAULT NULL,
  `virtual_host` varchar(255) DEFAULT NULL,
  `codelab_token` varchar(255) DEFAULT NULL,
  `gws_core_prod_db_password` varchar(255) NOT NULL,
  `gws_core_dev_db_password` varchar(255) NOT NULL,
  `space_id` varchar(36) NOT NULL,
  `server_instance_id` varchar(255) DEFAULT NULL,
  `server_volume_id` varchar(255) DEFAULT NULL,
  `server_ip_address_id` varchar(255) DEFAULT NULL,
  `dns_configured` tinyint(4) NOT NULL DEFAULT 0,
  `server_task_text` text DEFAULT NULL,
  `server_task_status` enum('RUNNING','SUCCESS','ERROR','NONE') NOT NULL DEFAULT 'NONE',
  `server_task_datetime` datetime DEFAULT NULL,
  `billing_mode` enum('HOURLY','MONTHLY') DEFAULT NULL,
  `desktop_platform` enum('LINUX','WINDOWS','MAC') DEFAULT NULL,
  `is_free_lab` tinyint(4) NOT NULL DEFAULT 0,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `current_status_id` varchar(36) DEFAULT NULL,
  `server_cloud_id` varchar(36) DEFAULT NULL,
  `region_id` varchar(36) DEFAULT NULL,
  `lab_ip_override` varchar(255) DEFAULT NULL,
  `lab_port_override` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_lab_glab_prod_api_key` (`glab_prod_api_key`),
  UNIQUE KEY `IDX_lab_glab_dev_api_key` (`glab_dev_api_key`),
  UNIQUE KEY `IDX_lab_lab_manager_api_key` (`lab_manager_api_key`),
  UNIQUE KEY `IDX_lab_virtual_host` (`virtual_host`),
  UNIQUE KEY `REL_lab_current_status_id` (`current_status_id`),
  KEY `FK_lab_created_by_id` (`created_by_id`),
  KEY `FK_lab_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_lab_lab_config_id` (`lab_config_id`),
  KEY `FK_lab_space_id` (`space_id`),
  KEY `FK_lab_server_cloud_id` (`server_cloud_id`),
  KEY `FK_lab_region_id` (`region_id`),
  CONSTRAINT `FK_lab_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_current_status_id` FOREIGN KEY (`current_status_id`) REFERENCES `lab_status_history` (`id`),
  CONSTRAINT `FK_lab_lab_config_id` FOREIGN KEY (`lab_config_id`) REFERENCES `lab_config` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_region_id` FOREIGN KEY (`region_id`) REFERENCES `cloud_provider_region` (`id`) ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_server_cloud_id` FOREIGN KEY (`server_cloud_id`) REFERENCES `server_cloud` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_backup_history`;
CREATE TABLE `lab_backup_history` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `frequency` enum('DAILY','WEEKLY') NOT NULL,
  `trigger_mode` enum('MANUAL','AUTOMATIC') NOT NULL,
  `started_at` datetime NOT NULL,
  `ended_at` datetime DEFAULT NULL,
  `backup_id` varchar(60) DEFAULT NULL,
  `status` enum('IN_PROGRESS','SUCCESS','ERROR','DELETED') NOT NULL,
  `s3_prefix` varchar(255) DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `lab_id` varchar(36) NOT NULL,
  `bucket_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_lab_backup_history_backup_id` (`backup_id`),
  KEY `FK_lab_backup_history_created_by_id` (`created_by_id`),
  KEY `FK_lab_backup_history_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_lab_backup_history_lab_id` (`lab_id`),
  KEY `FK_lab_backup_history_bucket_id` (`bucket_id`),
  CONSTRAINT `FK_lab_backup_history_bucket_id` FOREIGN KEY (`bucket_id`) REFERENCES `bucket` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_backup_history_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_backup_history_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_backup_history_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_backup_history_detail`;
CREATE TABLE `lab_backup_history_detail` (
  `id` varchar(36) NOT NULL,
  `type` enum('DATA','DB') NOT NULL,
  `status` enum('IN_PROGRESS','SUCCESS','ERROR','DELETED') NOT NULL,
  `message` text NOT NULL,
  `total_size` bigint(20) NOT NULL DEFAULT 0,
  `transfer_size` bigint(20) NOT NULL DEFAULT 0,
  `transfer_duration` int(11) NOT NULL DEFAULT 0,
  `transfer_speed` bigint(20) NOT NULL DEFAULT 0,
  `transfer_nb_errors` int(11) NOT NULL DEFAULT 0,
  `transfer_nb_checks` int(11) NOT NULL DEFAULT 0,
  `transfer_nb_file` int(11) NOT NULL DEFAULT 0,
  `transfer_nb_deleted` int(11) NOT NULL DEFAULT 0,
  `transfer_nb_renamed` int(11) NOT NULL DEFAULT 0,
  `history_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lab_type` (`history_id`,`type`),
  CONSTRAINT `FK_lab_backup_history_detail_history_id` FOREIGN KEY (`history_id`) REFERENCES `lab_backup_history` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_backup_option`;
CREATE TABLE `lab_backup_option` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `frequency1` enum('DAILY','WEEKLY') NOT NULL,
  `frequency2` enum('DAILY','WEEKLY') NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `lab_id` varchar(36) NOT NULL,
  `bucket1_id` varchar(36) NOT NULL,
  `bucket2_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_lab_backup_option_lab_id` (`lab_id`),
  KEY `FK_lab_backup_option_created_by_id` (`created_by_id`),
  KEY `FK_lab_backup_option_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_lab_backup_option_bucket1_id` (`bucket1_id`),
  KEY `FK_lab_backup_option_bucket2_id` (`bucket2_id`),
  CONSTRAINT `FK_lab_backup_option_bucket1_id` FOREIGN KEY (`bucket1_id`) REFERENCES `bucket` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_backup_option_bucket2_id` FOREIGN KEY (`bucket2_id`) REFERENCES `bucket` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_backup_option_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_backup_option_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_backup_option_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_config`;
CREATE TABLE `lab_config` (
  `id` varchar(36) NOT NULL,
  `label` varchar(50) NOT NULL,
  `brick_versions_hash` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_lab_config_brick_versions_hash` (`brick_versions_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_config_brick_version`;
CREATE TABLE `lab_config_brick_version` (
  `lab_config_id` varchar(36) NOT NULL,
  `brick_version_id` varchar(36) NOT NULL,
  PRIMARY KEY (`lab_config_id`,`brick_version_id`),
  KEY `IDX_lab_config_brick_version_labConfigId` (`lab_config_id`),
  KEY `IDX_lab_config_brick_version_brickVersionId` (`brick_version_id`),
  CONSTRAINT `FK_lab_config_brick_version_brickVersionId` FOREIGN KEY (`brick_version_id`) REFERENCES `brick_version` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_lab_config_brick_version_labConfigId` FOREIGN KEY (`lab_config_id`) REFERENCES `lab_config` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_folder`;
CREATE TABLE `lab_folder` (
  `lab_id` varchar(36) NOT NULL,
  `root_folder_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`lab_id`,`root_folder_id`),
  KEY `FK_lab_folder_root_folder_id` (`root_folder_id`),
  KEY `FK_lab_folder_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_lab_folder_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_folder_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_folder_root_folder_id` FOREIGN KEY (`root_folder_id`) REFERENCES `hierarchy_object` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_free`;
CREATE TABLE `lab_free` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `lab_id` varchar(36) DEFAULT NULL,
  `usage_limit_in_hours` int(11) NOT NULL,
  `expiration_date` datetime DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_lab_free_created_by_id` (`created_by_id`),
  KEY `FK_lab_free_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_lab_free_user_id` (`user_id`),
  KEY `FK_lab_free_lab_id` (`lab_id`),
  CONSTRAINT `FK_lab_free_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_free_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_free_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_free_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_green_option`;
CREATE TABLE `lab_green_option` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `type` enum('STOP_AFTER_SCENARIO','STOP_AFTER_BACKUP','STOP_AFTER_TIME','STOP_AFTER_INACTIVITY_TIME') NOT NULL,
  `value` text DEFAULT NULL,
  `lab_id` varchar(36) NOT NULL,
  `is_persistent` tinyint(4) NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_lab_green_option_created_by_id` (`created_by_id`),
  KEY `FK_lab_green_option_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_lab_green_option_lab_id` (`lab_id`),
  CONSTRAINT `FK_lab_green_option_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_green_option_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_green_option_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_status_history`;
CREATE TABLE `lab_status_history` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('SERVER_STARTING','SERVER_STOPPING','SERVER_RUNNING','SERVER_STOPPED','SERVER_CONFIGURED','LAB_RUNNING','NO_SERVER','ERROR') NOT NULL DEFAULT 'NO_SERVER',
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_lab_status_history_created_by_id` (`created_by_id`),
  KEY `FK_lab_status_history_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_lab_status_history_entity_id` (`entity_id`),
  CONSTRAINT `FK_lab_status_history_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_status_history_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `lab` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_lab_status_history_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_user`;
CREATE TABLE `lab_user` (
  `lab_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('OWNER','USER') NOT NULL DEFAULT 'USER',
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`lab_id`,`user_id`),
  KEY `FK_lab_user_user_id` (`user_id`),
  KEY `FK_lab_user_created_by_id` (`created_by_id`),
  KEY `FK_lab_user_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_lab_user_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_user_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_user_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `lab_volume`;
CREATE TABLE `lab_volume` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `size` int(11) NOT NULL,
  `type` enum('CLASSIC','HIGH_SPEED') NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `lab_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_lab_volume_created_by_id` (`created_by_id`),
  KEY `FK_lab_volume_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_lab_volume_lab_id` (`lab_id`),
  CONSTRAINT `FK_lab_volume_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_lab_volume_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_lab_volume_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
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


DROP TABLE IF EXISTS `note`;
CREATE TABLE `note` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `title` varchar(255) NOT NULL,
  `is_validated` tinyint(4) NOT NULL DEFAULT 0,
  `validated_at` datetime DEFAULT NULL,
  `last_sync_at` datetime NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `lab_id` varchar(36) NOT NULL,
  `lab_config_id` varchar(36) NOT NULL,
  `validated_by_id` varchar(36) DEFAULT NULL,
  `last_sync_by_id` varchar(36) NOT NULL,
  `document_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_note_created_by_id` (`created_by_id`),
  KEY `FK_note_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_note_lab_id` (`lab_id`),
  KEY `FK_note_lab_config_id` (`lab_config_id`),
  KEY `FK_note_validated_by_id` (`validated_by_id`),
  KEY `FK_note_last_sync_by_id` (`last_sync_by_id`),
  KEY `FK_note_document_id` (`document_id`),
  CONSTRAINT `FK_note_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_note_document_id` FOREIGN KEY (`document_id`) REFERENCES `document` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_note_id` FOREIGN KEY (`id`) REFERENCES `hierarchy_object` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_note_lab_config_id` FOREIGN KEY (`lab_config_id`) REFERENCES `lab_config` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_note_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_note_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_note_last_sync_by_id` FOREIGN KEY (`last_sync_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_note_validated_by_id` FOREIGN KEY (`validated_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `note_scenario`;
CREATE TABLE `note_scenario` (
  `note_id` varchar(36) NOT NULL,
  `scenario_id` varchar(36) NOT NULL,
  PRIMARY KEY (`note_id`,`scenario_id`),
  KEY `IDX_note_scenario_noteId` (`note_id`),
  KEY `IDX_note_scenario_scenarioId` (`scenario_id`),
  CONSTRAINT `FK_note_scenario_noteId` FOREIGN KEY (`note_id`) REFERENCES `note` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_note_scenario_scenarioId` FOREIGN KEY (`scenario_id`) REFERENCES `scenario` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `is_read` tinyint(4) NOT NULL,
  `link` varchar(255) NOT NULL,
  `object_id` varchar(255) NOT NULL,
  `object_type` enum('USER','FOLDER','SCENARIO','NOTE','DOCUMENT','RESOURCE','MESSAGE','LAB') NOT NULL,
  `text` varchar(255) NOT NULL,
  `text2` varchar(255) NOT NULL,
  `space_id` varchar(36) DEFAULT NULL,
  `associated_object_ids` text DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_notification_created_by_id` (`created_by_id`),
  KEY `FK_notification_space_id` (`space_id`),
  KEY `FK_notification_user_id` (`user_id`),
  CONSTRAINT `FK_notification_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_notification_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_notification_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `oauth_grant`;
CREATE TABLE `oauth_grant` (
  `id` varchar(36) NOT NULL,
  `grant_key` varchar(64) NOT NULL,
  `client_id` varchar(64) NOT NULL,
  `resource` varchar(512) NOT NULL COMMENT 'the one Resource this Grant covers, as its URL',
  `user_id` varchar(36) NOT NULL,
  `approved_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_oauth_grant_grant_key` (`grant_key`),
  KEY `FK_oauth_grant_user_id` (`user_id`),
  CONSTRAINT `FK_oauth_grant_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
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
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `resource_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `typing_name` varchar(255) NOT NULL,
  `style` text NOT NULL,
  `token` varchar(255) NOT NULL,
  `is_application` tinyint(4) NOT NULL DEFAULT 0,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `lab_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_resource_created_by_id` (`created_by_id`),
  KEY `FK_resource_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_resource_lab_id` (`lab_id`),
  CONSTRAINT `FK_resource_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_resource_id` FOREIGN KEY (`id`) REFERENCES `hierarchy_object` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_resource_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_resource_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `scenario`;
CREATE TABLE `scenario` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `title` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('DRAFT','SUCCESS','ERROR','ARCHIVED','PARTIALLY_RUN') NOT NULL,
  `protocol` longtext NOT NULL,
  `is_validated` tinyint(4) NOT NULL DEFAULT 0,
  `validated_at` datetime DEFAULT NULL,
  `last_sync_at` datetime NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) DEFAULT NULL,
  `lab_id` varchar(36) NOT NULL,
  `lab_config_id` varchar(36) NOT NULL,
  `validated_by_id` varchar(36) DEFAULT NULL,
  `last_sync_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_scenario_created_by_id` (`created_by_id`),
  KEY `FK_scenario_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_scenario_lab_id` (`lab_id`),
  KEY `FK_scenario_lab_config_id` (`lab_config_id`),
  KEY `FK_scenario_validated_by_id` (`validated_by_id`),
  KEY `FK_scenario_last_sync_by_id` (`last_sync_by_id`),
  CONSTRAINT `FK_scenario_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_scenario_id` FOREIGN KEY (`id`) REFERENCES `hierarchy_object` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_scenario_lab_config_id` FOREIGN KEY (`lab_config_id`) REFERENCES `lab_config` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_scenario_lab_id` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_scenario_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_scenario_last_sync_by_id` FOREIGN KEY (`last_sync_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_scenario_validated_by_id` FOREIGN KEY (`validated_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `server_cloud`;
CREATE TABLE `server_cloud` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `technical_name` varchar(50) NOT NULL,
  `ram` int(11) NOT NULL,
  `disk_space` int(11) NOT NULL,
  `disk_type` enum('SSD','HDD') NOT NULL,
  `cpu_count` int(11) NOT NULL,
  `cpu_type` varchar(30) NOT NULL,
  `gpu_count` int(11) DEFAULT NULL,
  `gpu_type` varchar(30) DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `cloud_provider_id` varchar(36) NOT NULL,
  `server_standard_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_NAME` (`technical_name`,`cloud_provider_id`),
  KEY `FK_server_cloud_created_by_id` (`created_by_id`),
  KEY `FK_server_cloud_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_server_cloud_cloud_provider_id` (`cloud_provider_id`),
  KEY `FK_server_cloud_server_standard_id` (`server_standard_id`),
  CONSTRAINT `FK_server_cloud_cloud_provider_id` FOREIGN KEY (`cloud_provider_id`) REFERENCES `cloud_provider` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_server_cloud_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_server_cloud_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_server_cloud_server_standard_id` FOREIGN KEY (`server_standard_id`) REFERENCES `server_standard` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `server_price`;
CREATE TABLE `server_price` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `price` float NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `server_standard_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_server_price_created_by_id` (`created_by_id`),
  KEY `FK_server_price_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_server_price_server_standard_id` (`server_standard_id`),
  CONSTRAINT `FK_server_price_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_server_price_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_server_price_server_standard_id` FOREIGN KEY (`server_standard_id`) REFERENCES `server_standard` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `server_standard`;
CREATE TABLE `server_standard` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `technical_description` varchar(255) NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_server_standard_name` (`name`),
  KEY `FK_server_standard_created_by_id` (`created_by_id`),
  KEY `FK_server_standard_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_server_standard_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_server_standard_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `server_decision_tree` text NOT NULL,
  `constellab_suite` text DEFAULT NULL,
  `free_lab_config` text DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_settings_created_by_id` (`created_by_id`),
  KEY `FK_settings_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_settings_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_settings_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `space`;
CREATE TABLE `space` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `name` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `domain` varchar(50) NOT NULL,
  `cloud_storage_limit` bigint(20) NOT NULL,
  `cloud_storage_usage` bigint(20) NOT NULL,
  `type` enum('PERSONAL','ENTREPRISE') NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  `default_folder_bucket_id` varchar(36) NOT NULL,
  `default_folder_backup_bucket_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_space_domain` (`domain`),
  KEY `FK_space_created_by_id` (`created_by_id`),
  KEY `FK_space_last_modified_by_id` (`last_modified_by_id`),
  KEY `FK_space_default_folder_bucket_id` (`default_folder_bucket_id`),
  KEY `FK_space_default_folder_backup_bucket_id` (`default_folder_backup_bucket_id`),
  CONSTRAINT `FK_space_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_space_default_folder_backup_bucket_id` FOREIGN KEY (`default_folder_backup_bucket_id`) REFERENCES `bucket` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_space_default_folder_bucket_id` FOREIGN KEY (`default_folder_bucket_id`) REFERENCES `bucket` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_space_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `space_invit`;
CREATE TABLE `space_invit` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `space_id` varchar(36) NOT NULL,
  `role` enum('ADMIN','USER','VIEWER') NOT NULL DEFAULT 'USER',
  `user_mail` varchar(255) NOT NULL,
  `valid_until` datetime NOT NULL,
  `code` varchar(60) NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_space_invit_space_id_user_mail` (`space_id`,`user_mail`),
  KEY `FK_space_invit_created_by_id` (`created_by_id`),
  KEY `FK_space_invit_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_space_invit_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_space_invit_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_space_invit_space_id` FOREIGN KEY (`space_id`) REFERENCES `space` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `space_user`;
CREATE TABLE `space_user` (
  `user_id` varchar(36) NOT NULL,
  `space_id` varchar(36) NOT NULL,
  `role` enum('ADMIN','USER','VIEWER') NOT NULL DEFAULT 'USER',
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


DROP TABLE IF EXISTS `storage_price`;
CREATE TABLE `storage_price` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_modified_at` datetime NOT NULL,
  `volume_storage_price` float NOT NULL,
  `backup_storage_price` float NOT NULL,
  `backup_transfert_price` float NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_by_id` varchar(36) NOT NULL,
  `last_modified_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_storage_price_created_by_id` (`created_by_id`),
  KEY `FK_storage_price_last_modified_by_id` (`last_modified_by_id`),
  CONSTRAINT `FK_storage_price_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_storage_price_last_modified_by_id` FOREIGN KEY (`last_modified_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `category` enum('ADMIN','USER') NOT NULL DEFAULT 'USER',
  `activity` varchar(255) DEFAULT NULL,
  `biography` varchar(255) DEFAULT NULL,
  `failed_login_count` int(11) NOT NULL DEFAULT 0,
  `last_login_attempt` datetime DEFAULT NULL,
  `last_login_success` datetime DEFAULT NULL,
  `lang` enum('en','fr') NOT NULL DEFAULT 'en',
  `theme` enum('light-theme','dark-theme') NOT NULL DEFAULT 'light-theme',
  `status` enum('WAITING_FOR_EMAIL','LOCKED_BY_ADMIN','READY') NOT NULL DEFAULT 'WAITING_FOR_EMAIL',
  `created_at` datetime NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `has2_fa` tinyint(4) NOT NULL DEFAULT 0,
  `phone` varchar(50) DEFAULT NULL,
  `license` enum('FREE','ENTERPRISE') NOT NULL DEFAULT 'FREE',
  `last_connected_space_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_user_email` (`email`),
  KEY `FK_user_last_connected_space_id` (`last_connected_space_id`),
  CONSTRAINT `FK_user_last_connected_space_id` FOREIGN KEY (`last_connected_space_id`) REFERENCES `space` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `user_2_fa`;
CREATE TABLE `user_2_fa` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `two_fa_code` varchar(10) NOT NULL,
  `url_code` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_user_2_fa_url_code` (`url_code`),
  UNIQUE KEY `IDX_user_2_fa_user_id` (`user_id`),
  CONSTRAINT `FK_user_2_fa_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `user_group`;
CREATE TABLE `user_group` (
  `user_id` varchar(36) NOT NULL,
  `group_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by_id` varchar(36) NOT NULL,
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `FK_user_group_group_id` (`group_id`),
  KEY `FK_user_group_created_by_id` (`created_by_id`),
  CONSTRAINT `FK_user_group_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_user_group_group_id` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_user_group_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2026-09-17 13:40:36 UTC