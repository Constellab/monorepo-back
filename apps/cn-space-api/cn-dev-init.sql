-- Common variables with community
SET @robotUserId = '65b2ebc3-9ed0-4513-825c-6b9bc7eeddff';
SET @adminUserId = '98ed7a54-9ee4-4257-811f-e1dfe730b97d';
SET @secondaryUserId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SET @gwsCoreBrickId = 'b34d3952-732b-479b-ad26-b34f9d5d43aa';
SET @gwsAcademyBrickId = '041b33e8-9476-42e3-b8cc-3894584c22d8';
SET @adminUserSpaceId = '696072d7-1eb3-4161-a6bb-d3b46d0a2b6e';
SET @secondaryUserSpaceId = '34a3b327-a185-45c5-8a77-4e7be24f7763';
SET @enterpriseSpaceId = '2bd030ba-158f-45ba-ab18-093fcdfa7b1a';


-- Robot user
INSERT INTO `user` (`id`, `firstname`, `lastname`, `email`, `password`, `category`, `activity`, `biography`,
                    `failed_login_count`, `last_login_attempt`, `last_login_success`, `lang`, `theme`, `status`, `created_at`,
                    `photo`, `company`, `has2_fa`, `phone`, `license`)
VALUES -- Robot Gencovery (system user)
       (@robotUserId, 'Roboy', 'Gencovery', 'robot@gencovery.com',
        ' ', 'ADMIN',
        NULL,
        NULL,
        0, NULL, NULL, 'en', 'dark-theme', 'WAITING_FOR_EMAIL', '2023-02-27 17:15:47',
        NULL, 'Gencovery', 0, NULL, 'ENTERPRISE');

-- Robot user group
INSERT INTO `group` (`id`, `created_at`, `last_modified_at`, `label`, `type`, `user_id`, `space_id`, `created_by_id`,
                     `last_modified_by_id`)
VALUES -- Robot Gencovery group
       ('2e589f29-873f-447a-8530-c55549c2c85c', '2023-02-27 17:15:47', '2023-02-27 17:15:47', 'Robot Gencovery',
        'SINGLE_USER', @robotUserId, NULL, @robotUserId,
        @robotUserId);


-- Robot user_group association
INSERT INTO `user_group` (`user_id`, `group_id`, `created_at`, `created_by_id`)
VALUES -- Robot Gencovery -> Robot Gencovery group
       (@robotUserId, '2e589f29-873f-447a-8530-c55549c2c85c', '2023-08-07 15:27:18',
        @robotUserId);


-- Test user (Admin)
INSERT INTO `user` (`id`, `firstname`, `lastname`, `email`, `password`, `category`, `activity`, `biography`,
                    `failed_login_count`, `last_login_attempt`, `last_login_success`, `lang`, `theme`, `status`, `created_at`,
                    `photo`, `company`, `has2_fa`, `phone`, `license`)
VALUES -- Robot Gencovery (system user)
       (@adminUserId, 'Michel', 'Larousse', 'test@gencovery.com',
      --  password: 'test1234'
        '$argon2id$v=19$m=65536,t=3,p=4$+83vEDOdAi2HD+q7WxAA5w$xp68MlL+QKOtBINcYZVW0O+Nx3jt2UYVw/G1JtstdXQ',
         'ADMIN',
        NULL,
        NULL,
        0, NULL, NULL, 'en', 'dark-theme', 'READY', '2023-02-27 17:15:47',
        NULL, 'Gencovery', 0, NULL, 'ENTERPRISE');

-- Test user group
INSERT INTO `group` (`id`, `created_at`, `last_modified_at`, `label`, `type`, `user_id`, `space_id`, `created_by_id`,
                     `last_modified_by_id`)
VALUES -- Test user group
       ('d70c8820-232a-43dd-b54d-7ff71bdf3931', '2023-02-27 17:19:36', '2023-02-27 17:19:36', 'Test group',
        'SINGLE_USER', @adminUserId, NULL, @adminUserId,
        @adminUserId);

-- Test user -> Test user group
INSERT INTO `user_group` (`user_id`, `group_id`, `created_at`, `created_by_id`)
VALUES -- Test user -> Test user group
       (@adminUserId, 'd70c8820-232a-43dd-b54d-7ff71bdf3931', '2023-08-07 15:27:18',
        @adminUserId);


-- =============================================
-- Secondary user (non-admin)
-- =============================================
INSERT INTO `user` (`id`, `firstname`, `lastname`, `email`, `password`, `category`, `activity`, `biography`,
                    `failed_login_count`, `last_login_attempt`, `last_login_success`, `lang`, `theme`, `status`, `created_at`,
                    `photo`, `company`, `has2_fa`, `phone`, `license`)
VALUES (@secondaryUserId, 'Sophie', 'Dupont', 'sophie@gencovery.com',
        --  password: 'test1234'
        '$argon2id$v=19$m=65536,t=3,p=4$+83vEDOdAi2HD+q7WxAA5w$xp68MlL+QKOtBINcYZVW0O+Nx3jt2UYVw/G1JtstdXQ',
        'USER',
        NULL,
        NULL,
        0, NULL, NULL, 'en', 'dark-theme', 'READY', '2023-03-15 10:00:00',
        NULL, 'Gencovery', 0, NULL, 'ENTERPRISE');

-- Secondary user group
INSERT INTO `group` (`id`, `created_at`, `last_modified_at`, `label`, `type`, `user_id`, `space_id`, `created_by_id`,
                     `last_modified_by_id`)
VALUES ('f1e2d3c4-b5a6-9780-1234-567890abcdef', '2023-03-15 10:00:00', '2023-03-15 10:00:00', 'Sophie Dupont',
        'SINGLE_USER', @secondaryUserId, NULL, @secondaryUserId,
        @secondaryUserId);

-- Secondary user -> group association
INSERT INTO `user_group` (`user_id`, `group_id`, `created_at`, `created_by_id`)
VALUES (@secondaryUserId, 'f1e2d3c4-b5a6-9780-1234-567890abcdef', '2023-03-15 10:00:00',
        @secondaryUserId);




-- Countries
INSERT INTO `country` (`id`, `name`, `short_name`)
VALUES ('018bf5eb-0835-11ed-afdd-0242ac120004', 'Australia', 'au'),
       ('0a24ced9-0834-11ed-afdd-0242ac120004', 'France', 'fr'),
       ('263089da-0834-11ed-afdd-0242ac120004', 'Canada', 'ca'),
       ('7d178e13-0834-11ed-afdd-0242ac120004', 'Great Britain', 'gb'),
       ('a53feed1-0834-11ed-afdd-0242ac120004', 'Poland', 'pl'),
       ('daa9a0e2-f0cf-4a15-8263-fb85f1ef0665', 'Germany', 'de'),
       ('df6895a7-0834-11ed-afdd-0242ac120004', 'Singapore', 'sg');

-- Cities 
INSERT INTO `city` (`id`, `name`, `country_id`)
VALUES ('2694a12e-0835-11ed-afdd-0242ac120004', 'Gravelines', '0a24ced9-0834-11ed-afdd-0242ac120004'),
       ('305860a7-0835-11ed-afdd-0242ac120004', 'Strasbourg', '0a24ced9-0834-11ed-afdd-0242ac120004'),
       ('6c9ef4b8-0835-11ed-afdd-0242ac120004', 'Beauharnois', '263089da-0834-11ed-afdd-0242ac120004'),
       ('8253cb0c-0835-11ed-afdd-0242ac120004', 'London', '7d178e13-0834-11ed-afdd-0242ac120004'),
       ('9c93dbbc-0835-11ed-afdd-0242ac120004', 'Warsaw', 'a53feed1-0834-11ed-afdd-0242ac120004'),
       ('b3f96543-c9e8-4eac-881a-161b9c38b765', 'Frankfurt', 'daa9a0e2-f0cf-4a15-8263-fb85f1ef0665'),
       ('c9830588-0835-11ed-afdd-0242ac120004', 'Singapore', 'df6895a7-0834-11ed-afdd-0242ac120004'),
       ('eb134eb4-0835-11ed-afdd-0242ac120004', 'Sidney', '018bf5eb-0835-11ed-afdd-0242ac120004');


-- Cloud providers 
INSERT INTO `cloud_provider` (`id`, `created_at`, `last_modified_at`, `name`, `created_by_id`, `last_modified_by_id`,
                              `description`, `logo`)
VALUES -- AZURE
       ('57a6f823-6b73-4e0a-9818-f055cbd6d546', '2023-05-19 14:58:31', '2024-03-27 11:11:10', 'AZURE',
        @adminUserId, @adminUserId, NULL,
        'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/azure.jpg'),
       -- OVH
       ('964ad825-6b0b-44f2-9825-7129b01a9df7', '2023-02-27 17:19:36', '2024-03-27 11:10:54', 'OVH',
        @adminUserId, @adminUserId, NULL,
        'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/ovh.png'),
       -- OUTSCALE
       ('cdfdc499-61a4-445d-94e6-b65cef54f479', '2023-12-21 15:27:08', '2024-03-27 11:11:27', 'OUTSCALE',
        @adminUserId, @adminUserId, NULL,
        'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/ouscale.gif'),
       -- GCP
       ('cce27e1c-71d3-4820-a65a-12baac537115', '2023-12-21 15:27:08', '2024-03-27 11:11:27', 'GCP',
        @adminUserId, @adminUserId, NULL,
        'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/gcp.png');


-- Cloud provider regions 
INSERT INTO `cloud_provider_region` (`id`, `created_at`, `last_modified_at`, `technical_name`, `s3_endpoint`, `created_by_id`,
                                     `last_modified_by_id`, `cloud_provider_id`, `city_id`, `name`, `type`)
VALUES -- OVH gra (Gravelines) S3
       ('2f71581d-2882-476a-a6d5-e077dd2724ff', '2023-02-27 17:19:45', '2023-12-22 14:11:56', 'gra',
        'https://s3.gra.io.cloud.ovh.net/', @adminUserId,
        @adminUserId, '964ad825-6b0b-44f2-9825-7129b01a9df7',
        '2694a12e-0835-11ed-afdd-0242ac120004', 'Graveline', 'S3'),
       -- OVH gra (Gravelines) ALL
       ('a7c8e3f1-5d42-4b9a-8f6e-1c2d3e4f5a6b', '2026-03-16 10:00:00', '2026-03-16 10:00:00', 'gra',
        'https://s3.gra.io.cloud.ovh.net/', @adminUserId,
        @adminUserId, '964ad825-6b0b-44f2-9825-7129b01a9df7',
        '2694a12e-0835-11ed-afdd-0242ac120004', 'Graveline', 'ALL'),
       -- OVH sbg (Strasbourg)
       ('d4c4172b-10d6-4c47-84c5-b6575d90c06f', '2023-10-04 09:23:30', '2024-03-25 12:21:17', 'sbg',
        'https://s3.sbg.io.cloud.ovh.net/', @adminUserId,
        @adminUserId, '964ad825-6b0b-44f2-9825-7129b01a9df7',
        '305860a7-0835-11ed-afdd-0242ac120004', 'Strasbourg', 'S3'),
       -- AZURE francecentral
       ('0d9edec6-19b3-41a0-8811-606e240188f9',	'2024-07-03 15:34:50',	'2024-07-03 16:10:41',	'francecentral',	NULL,	@adminUserId,	@adminUserId,	'57a6f823-6b73-4e0a-9818-f055cbd6d546',	'305860a7-0835-11ed-afdd-0242ac120004',	'France central',	'ALL'),
       -- GCP europe-west9 (S3)
       ('53534232-d11a-4fae-a97e-d9dbc6d28763',	'2025-04-30 09:00:06',	'2025-04-30 09:00:06',	'europe-west9',	'https://storage.googleapis.com',	@adminUserId,	@adminUserId,	'cce27e1c-71d3-4820-a65a-12baac537115',	'2694a12e-0835-11ed-afdd-0242ac120004',	'Europe west S3',	'S3'),
       -- GCP europe-west9-a (SERVER)
       ('588de190-d0a2-479c-a31e-792b98b89156',	'2025-04-30 08:59:48',	'2025-04-30 08:59:48',	'europe-west9-a',	NULL,	@adminUserId,	@adminUserId,	'cce27e1c-71d3-4820-a65a-12baac537115',	'2694a12e-0835-11ed-afdd-0242ac120004',	'Europe west',	'SERVER'),
       -- AZURE northeurope
       ('6e908ec7-15c4-4c6a-b967-13ca11b7ccc3',	'2023-05-24 14:47:59',	'2024-07-03 16:10:47',	'northeurope',	NULL,	@adminUserId,	@adminUserId,	'57a6f823-6b73-4e0a-9818-f055cbd6d546',	'2694a12e-0835-11ed-afdd-0242ac120004',	'North europe',	'ALL'),
       -- GCP europe-north1 (S3)
       ('9c8d95a8-57d8-4936-835a-98d295766e98',	'2025-04-30 09:07:18',	'2025-04-30 09:07:18',	'europe-north1',	'https://storage.googleapis.com',	@adminUserId,	@adminUserId,	'cce27e1c-71d3-4820-a65a-12baac537115',	'8253cb0c-0835-11ed-afdd-0242ac120004',	'Europe north S3',	'S3'),
       -- GCP europe-west1-b (SERVER)
       ('a0a953a8-a089-4b7e-b1a3-f0ed3f2c2e04',	'2026-01-05 12:52:56',	'2026-01-05 12:52:56',	'europe-west1-b',	NULL,	@adminUserId,	@adminUserId,	'cce27e1c-71d3-4820-a65a-12baac537115',	'305860a7-0835-11ed-afdd-0242ac120004', 'Europe - Brussels', 'SERVER');


-- Bucket credentials 
INSERT INTO `bucket_credentials` (`id`, `created_at`, `last_modified_at`, `name`, `access_key_id`, `secret_access_key`,
                                  `s3_username`, `short_description`, `created_by_id`, `last_modified_by_id`,
                                  `cloud_provider_id`, `space_id`)
VALUES -- LAB_BACKUP credentials (OVH)
       ('bc97b9f2-3241-47b2-aef5-2321c9e347af', '2023-03-17 12:05:07', '2024-07-04 10:35:26', 'LAB_BACKUP',
        'TO DEFINE', 'TO DEFINE', '',
        'S3 object storage', @adminUserId, @adminUserId,
        '964ad825-6b0b-44f2-9825-7129b01a9df7', NULL);

-- Buckets 
INSERT INTO `bucket` (`id`, `created_at`, `last_modified_at`, `name`, `content_type`, `created_by_id`, `last_modified_by_id`,
                      `region_id`, `credentials_id`, `bucket_type`, `lab_id`)
VALUES -- OVH gra (Gravelines)
       ('5a83422b-5604-401b-8c73-ac3bf0d122ef', '2023-10-18 16:08:03', '2023-10-18 16:08:03',
        'constellab-project-local-gra', 'FOLDER', @adminUserId,
        @adminUserId, '2f71581d-2882-476a-a6d5-e077dd2724ff',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- OVH gra (Gravelines)
       ('dcaaa6f7-ef76-4692-9412-6687b3bfc272', '2023-10-18 18:24:02', '2023-10-18 18:24:02',
        'constellab-lab-backup-local-gra', 'LAB_BACKUP', @adminUserId,
        @adminUserId, '2f71581d-2882-476a-a6d5-e077dd2724ff',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- OVH gra (Gravelines)
       ('e5cd6bc5-b621-463e-9e52-219bfaf2f6e3', '2024-04-24 10:57:57', '2024-04-24 10:57:57',
        'constellab-lab-bakcup-pre-prod-gra', 'LAB_BACKUP', @adminUserId,
        @adminUserId, '2f71581d-2882-476a-a6d5-e077dd2724ff',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- OVH sbg (Strasbourg)
       ('132a4311-5a4f-4814-822b-bd3015e08d34', '2023-10-18 18:24:10', '2023-10-18 18:24:10',
        'constellab-lab-backup-local-sbg', 'LAB_BACKUP', @adminUserId,
        @adminUserId, 'd4c4172b-10d6-4c47-84c5-b6575d90c06f',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- OVH sbg (Strasbourg)
       ('9d119fd6-512f-4953-9ec0-6edc13d27f37', '2023-10-18 16:08:30', '2023-10-18 16:08:30',
        'constellab-project-local-sbg', 'FOLDER', @adminUserId,
        @adminUserId, 'd4c4172b-10d6-4c47-84c5-b6575d90c06f',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- OVH sbg (Strasbourg)
       ('c40f71e8-4ad3-446f-ab1d-01bdde497b7a', '2024-04-24 10:57:42', '2024-04-24 10:57:42',
        'constellab-lab-bakcup-pre-prod-sbg', 'LAB_BACKUP', @adminUserId,
        @adminUserId, 'd4c4172b-10d6-4c47-84c5-b6575d90c06f',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- GCP europe-west9
       ('2bd99c3b-cb5d-4fb1-bf96-7231caa65305', '2026-02-11 10:00:00', '2026-02-11 10:00:00',
        'constellab-lab-backup-local-europe-west9', 'LAB_BACKUP', @adminUserId,
        @adminUserId, '53534232-d11a-4fae-a97e-d9dbc6d28763',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- GCP europe-north1
       ('bb2fe470-2285-490e-8515-0c482bace884', '2026-02-11 10:00:00', '2026-02-11 10:00:00',
        'constellab-lab-backup-local-europe-north1', 'LAB_BACKUP', @adminUserId,
        @adminUserId, '9c8d95a8-57d8-4936-835a-98d295766e98',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- AZURE francecentral
       ('058357a0-7fd5-4810-b1e5-72e6a4a15716', '2026-02-11 10:00:00', '2026-02-11 10:00:00',
        'constellab-lab-backup-local-francecentral', 'LAB_BACKUP', @adminUserId,
        @adminUserId, '0d9edec6-19b3-41a0-8811-606e240188f9',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       -- AZURE northeurope
       ('e2b7a0e6-866b-4aae-9e3c-f853ee769af8', '2026-02-11 10:00:00', '2026-02-11 10:00:00',
        'constellab-lab-backup-local-northeurope', 'LAB_BACKUP', @adminUserId,
        @adminUserId, '6e908ec7-15c4-4c6a-b967-13ca11b7ccc3',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL);


-- Storage price 
INSERT INTO `storage_price` (`id`, `created_at`, `last_modified_at`, `start_date`, `end_date`, `created_by_id`,
                             `last_modified_by_id`, `volume_storage_price`, `backup_storage_price`, `backup_transfert_price`)
VALUES -- Default storage price
       ('0c3c83db-f7cb-4c78-804e-11796476ed3e', '2024-04-25 11:17:43', '2024-04-25 11:17:43', '2000-01-01 00:00:00',
        NULL, @adminUserId, @adminUserId, 0.33, 0.075, 0.03);


-- Server standards 
INSERT INTO `server_standard` (`id`, `created_at`, `last_modified_at`, `name`, `description`, `technical_description`, `created_by_id`, `last_modified_by_id`) VALUES
-- General purpose (2 CPU, 8 GB RAM)
('c5714c74-c8c4-4175-b231-51a58a5a3522',	'2024-04-25 11:00:13',	'2024-04-25 11:00:13',	'General purpose',	'Basic usage',	'2 CPU\8 GB RAM',	@adminUserId,	@adminUserId);


-- Server prices 
INSERT INTO `server_price` (`id`, `price`, `start_date`, `end_date`, `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`, `server_standard_id`) VALUES
-- General purpose price
('2b0b9b80-ada8-49a0-bd0f-b06e6e0660b6',	3.14,	'2010-04-25 09:40:23',	NULL,	'2024-04-25 09:42:35',	'2024-04-25 09:42:35',	@adminUserId,	@adminUserId,	'c5714c74-c8c4-4175-b231-51a58a5a3522');

-- Server cloud configurations 
INSERT INTO `server_cloud` (`id`, `technical_name`, `ram`, `disk_space`, `disk_type`, `cpu_count`, `cpu_type`, `gpu_count`, `gpu_type`, `cloud_provider_id`, `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`, `server_standard_id`) VALUES
-- GCP e2-medium (2 CPU, 4 GB RAM)
('0e69afcf-a477-45eb-9854-38854c0e8366',	'e2-medium',	4,	0,	'SSD',	2,	'Unknown',	NULL,	NULL,	'cce27e1c-71d3-4820-a65a-12baac537115',	'2025-04-30 09:08:20',	'2025-04-30 09:08:20',	@adminUserId,	@adminUserId,	'c5714c74-c8c4-4175-b231-51a58a5a3522'),
-- GCP e2-standard-4 (4 CPU, 16 GB RAM)
('1affda9b-10c7-4e0a-a281-37429279ba74',	'e2-standard-4',	16,	0,	'SSD',	4,	'Unknown',	NULL,	NULL,	'cce27e1c-71d3-4820-a65a-12baac537115',	'2025-07-10 10:04:05',	'2025-07-10 10:04:05',	@adminUserId,	@adminUserId,	'c5714c74-c8c4-4175-b231-51a58a5a3522'),
-- OVH b2-7 (2 CPU, 7 GB RAM, 50 GB disk)
('4009b9e6-7e9d-43d6-afab-51d178a6f3bb',	'b2-7',	7000,	50,	'SSD',	2,	'2.3 Ghz',	NULL,	NULL,	'964ad825-6b0b-44f2-9825-7129b01a9df7',	'2023-01-01 00:00:00',	'2024-04-26 07:03:49',	@adminUserId,	@adminUserId,	'c5714c74-c8c4-4175-b231-51a58a5a3522'),
-- AZURE Standard_D4as_v5 (4 CPU, 16 GB RAM, 30 GB disk)
('c8a43d0f-ff7c-4298-9a04-c18aa8d50be7',	'Standard_D4as_v5',	16,	30,	'SSD',	4,	'Unknown',	NULL,	NULL,	'57a6f823-6b73-4e0a-9818-f055cbd6d546',	'2024-04-25 11:00:44',	'2024-04-25 11:00:44',	@adminUserId,	@adminUserId,	'c5714c74-c8c4-4175-b231-51a58a5a3522'),
-- GCP e2-standard-2 (2 CPU, 8 GB RAM)
('8a950f80-66a9-4b3e-9718-e9b77e3ec7b5',	'e2-standard-2',	8,	0,	'SSD',	2,	'Unknown',	NULL,	NULL,	'cce27e1c-71d3-4820-a65a-12baac537115', '2026-01-05 12:54:08',	'2026-01-05 12:54:08',	@adminUserId,	@adminUserId,	'c5714c74-c8c4-4175-b231-51a58a5a3522');

-- Create the bricks and bricks version 

-- gws_core brick
INSERT INTO `brick` (`id`, `name`, `pip_repo`, `git_repo`, `visibility`) VALUES
(@gwsCoreBrickId,	'gws_core',	NULL,	'https://github.com/Constellab/gws_core.git',	'public');

-- gws_core version 0.21.0
INSERT INTO `brick_version` (`id`, `major`, `minor`, `patch`, `sub_patch`, `version_type`, `version_state`, `repo_type`, `technical_info`, `brick_id`) VALUES
('9e9beb89-ddd5-4c05-a502-14327cdd39ec',	0,	21,	0,	NULL,	'NORMAL',	'STABLE',	'GIT',	'{"FRONT_VERSION":"2.8.0","GLAB_VERSION":"2.16.0"}',	@gwsCoreBrickId);

-- gws_academy brick
INSERT INTO `brick` (`id`, `name`, `pip_repo`, `git_repo`, `visibility`) VALUES
(@gwsAcademyBrickId,	'gws_academy',	NULL,	'https://github.com/Constellab/gws_academy.git',	'public');

-- gws_academy version 0.5.1
INSERT INTO `brick_version` (`id`, `major`, `minor`, `patch`, `sub_patch`, `version_type`, `version_state`, `repo_type`, `technical_info`, `brick_id`) VALUES
('456dd68e-b5b5-44c0-846b-f4aa3768fc5d',	0,	5,	1,	NULL,	'NORMAL',	'STABLE',	'GIT',	NULL,	@gwsAcademyBrickId);



-- =============================================
-- Spaces
-- =============================================

-- Personal space for Test user (Michel Larousse)
INSERT INTO `space` (`id`, `name`, `domain`, `type`, `cloud_storage_limit`, `cloud_storage_usage`,
                     `default_folder_bucket_id`, `default_folder_backup_bucket_id`,
                     `created_at`, `created_by_id`, `last_modified_at`, `last_modified_by_id`)
VALUES (@adminUserSpaceId, 'Michel Larousse', 'michel-larousse',
        'PERSONAL', 1073741824, 0,
        '5a83422b-5604-401b-8c73-ac3bf0d122ef', 'dcaaa6f7-ef76-4692-9412-6687b3bfc272',
        '2023-03-01 10:00:00', @adminUserId,
        '2023-03-01 10:00:00', @adminUserId);

-- Enterprise space for Test user
INSERT INTO `space` (`id`, `name`, `domain`, `type`, `cloud_storage_limit`, `cloud_storage_usage`,
                     `default_folder_bucket_id`, `default_folder_backup_bucket_id`,
                     `created_at`, `created_by_id`, `last_modified_at`, `last_modified_by_id`)
VALUES (@enterpriseSpaceId, 'Enterprise', 'enterprise',
        'ENTREPRISE', 1073741824, 0,
        '5a83422b-5604-401b-8c73-ac3bf0d122ef', 'dcaaa6f7-ef76-4692-9412-6687b3bfc272',
        '2023-03-01 10:00:00', @adminUserId,
        '2023-03-01 10:00:00', @adminUserId);

-- Personal space for Sophie Dupont
INSERT INTO `space` (`id`, `name`, `domain`, `type`, `cloud_storage_limit`, `cloud_storage_usage`,
                     `default_folder_bucket_id`, `default_folder_backup_bucket_id`,
                     `created_at`, `created_by_id`, `last_modified_at`, `last_modified_by_id`)
VALUES (@secondaryUserSpaceId, 'Sophie Dupont', 'sophie-dupont',
        'PERSONAL', 1073741824, 0,
        '5a83422b-5604-401b-8c73-ac3bf0d122ef', 'dcaaa6f7-ef76-4692-9412-6687b3bfc272',
        '2023-03-15 10:00:00', @secondaryUserId,
        '2023-03-15 10:00:00', @secondaryUserId);


-- =============================================
-- Space-User associations
-- =============================================

-- Test user (Michel) -> own personal space (ADMIN)
INSERT INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES (@adminUserId, @adminUserSpaceId, 'ADMIN', 1,
        '2023-03-01 10:00:00', @adminUserId);

-- Test user (Michel) -> enterprise space (ADMIN)
INSERT INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES (@adminUserId, @enterpriseSpaceId, 'ADMIN', 1,
        '2023-03-01 10:00:00', @adminUserId);

-- Sophie -> own personal space (ADMIN)
INSERT INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES (@secondaryUserId, @secondaryUserSpaceId, 'ADMIN', 1,
        '2023-03-15 10:00:00', @secondaryUserId);

-- Sophie -> Michel's personal space (USER)
INSERT INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES (@secondaryUserId, @adminUserSpaceId, 'USER', 1,
        '2023-03-15 10:00:00', @adminUserId);


-- =============================================
-- Labs
-- =============================================

-- Localhost lab in Michel's personal space
INSERT INTO `lab` (`id`, `created_at`, `last_modified_at`, `name`, `cloud_name`, `type`, `lab_config_id`,
                   `glab_prod_api_key`, `glab_dev_api_key`, `lab_manager_api_key`, `virtual_host`, `codelab_token`,
                   `gws_core_prod_db_password`, `gws_core_dev_db_password`, `space_id`,
                   `server_instance_id`, `server_volume_id`, `server_ip_address_id`, `dns_configured`,
                   `server_task_text`, `server_task_status`, `server_task_datetime`, `billing_mode`, `desktop_platform`,
                   `is_free_lab`, `created_by_id`, `last_modified_by_id`, `current_status_id`, `server_cloud_id`, `region_id`)
VALUES ('83afdd53-2509-4dcc-82d4-86af435447dc', '2025-08-19 16:49:37', '2025-10-07 15:55:38', 'localhost',
        '6b5d906b-3c74-4252-a873-8da2c7527479', 'CLOUD', NULL,
        '123456', '123456789', '1234', 'localhost.gencovery.io',
        'vFMX4s7pAhM9xvy2cxefhBXHfNKdlHHOTozbwMTA3hJR1lHqgwsxsb7YnHWnpd',
        'cUW2Jivc5X8rkNhQcQGNmNpAs0d3lP0DOwvkEI00te2rKhFI0Lba2kEXqOB',
        '7a3XRsxBj4gAjksl4BYHoasdyunwsJdExMlGtgwAqK812cwKXzaXylLjpAZDe',
        @adminUserSpaceId,
        '', '', '', 0,
        '', 'NONE', '2025-10-07 15:45:00', 'HOURLY', NULL,
        0, @adminUserId, @adminUserId,
        NULL, '0e69afcf-a477-45eb-9854-38854c0e8366', '588de190-d0a2-479c-a31e-792b98b89156');

-- Lab status history for localhost lab (RUNNING)
INSERT INTO `lab_status_history` (`id`, `created_at`, `last_modified_at`, `end_date`, `status`, `created_by_id`, `last_modified_by_id`, `entity_id`) VALUES
('05cda333-a519-4d75-8d38-adef76849f99',	'2026-01-05 12:54:15',	'2026-01-05 12:54:16',	null,	'LAB_RUNNING',	@adminUserId,	@adminUserId,	'83afdd53-2509-4dcc-82d4-86af435447dc');

-- set the current status of the localhost lab to RUNNING
UPDATE `lab` SET `current_status_id` = '05cda333-a519-4d75-8d38-adef76849f99' WHERE `id` = '83afdd53-2509-4dcc-82d4-86af435447dc';

-- Lab volume

INSERT INTO `lab_volume` (`id`, `created_at`, `last_modified_at`, `start_date`, `end_date`, `size`, `type`, `created_by_id`, `last_modified_by_id`, `lab_id`) VALUES
('844cb6f2-ca2d-49c2-a00b-74939a275ea4',	'2026-02-11 18:40:10',	'2026-02-11 18:40:10',	'2026-02-11 18:40:10',	NULL,	100,	'HIGH_SPEED',	@adminUserId,	@adminUserId,	'83afdd53-2509-4dcc-82d4-86af435447dc');


-- =============================================
-- Lab-User associations
-- =============================================

-- Michel -> localhost lab (OWNER)
INSERT INTO `lab_user` (`lab_id`, `user_id`, `role`, `created_at`, `created_by_id`, `last_modified_at`, `last_modified_by_id`)
VALUES ('83afdd53-2509-4dcc-82d4-86af435447dc', @adminUserId, 'OWNER',
        '2025-08-19 16:49:37', @adminUserId,
        '2025-08-19 16:49:37', @adminUserId);

-- Sophie -> localhost lab (USER)
INSERT INTO `lab_user` (`lab_id`, `user_id`, `role`, `created_at`, `created_by_id`, `last_modified_at`, `last_modified_by_id`)
VALUES ('83afdd53-2509-4dcc-82d4-86af435447dc', @secondaryUserId, 'USER',
        '2025-08-20 10:00:00', @adminUserId,
        '2025-08-20 10:00:00', @adminUserId);


-- =============================================
-- Settings
-- =============================================

SET @serverDecisionTree = '{\"tree\":[{\"title\":\"Data office\",\"description\":\"A budget-friendly server ideal for everyday use (e.g. basic data transformation and analysis, result compilation and interpretation, report writing, dashboard creation, etc.)\",\"suggestedServerNames\":[\"S1\",\"S2\",\"C1\",\"C2\"]},{\"title\":\"Specialized data lab\",\"description\":\"Specialized server designed for high-demand applications, ideal for on a pay-as-you-go basis\",\"children\":[{\"title\":\"Data science\",\"description\":\"Optimized for machine learning, statistics, deep learning\",\"children\":[{\"title\":\"Large data\",\"description\":\"Server with large memories, optimized for bulk analysis of big data\",\"suggestedServerNames\":[\"D2\",\"D3\",\"D4\",\"D5\"]},{\"title\":\"Fast compute\",\"description\":\"Server with high-speed processors, optimized for fast computation or task parallelization\",\"suggestedServerNames\":[\"C2\",\"C3\",\"C4\",\"C5\"]},{\"title\":\"AI compute\",\"description\":\"Server recommended for deep learning, large AI models\",\"suggestedServerNames\":[\"C2\"]}]},{\"title\":\"Life sciences\",\"description\":\"Optimized for data analysis in biology, biochemistry, chemistry\",\"children\":[{\"title\":\"Large data\",\"description\":\"Server with large memory capacity, optimized for big data analysis (e.g. Omics data)\",\"suggestedServerNames\":[\"D1\",\"D2\",\"D3\",\"D4\",\"D5\"]},{\"title\":\"Fast compute\",\"description\":\"Server with high-speed processors, optimized for fast computation or task parallelization (e.g: Dynamical/chemical simulations, PK/PD, etc.)\",\"suggestedServerNames\":[\"C1\",\"C2\",\"C3\",\"C4\",\"C5\"]}]},{\"title\":\"Physics\",\"description\":\"Server with high-speed processors, optimized for fast computation or task parallelization (e.g. Dynamical simulation, PDE analysis, etc.)\",\"suggestedServerNames\":[\"C1\",\"C2\",\"C3\",\"C4\",\"C5\"]},{\"title\":\"Business analytics and intelligence\",\"description\":\"Optimized business data analysis (e.g. table transformation, statistics, machine learning)\",\"children\":[{\"title\":\"Large data\",\"description\":\"Server with large memory capacity, optimized for bulk analysis of big data (e.g. ETL Processes)\",\"suggestedServerNames\":[\"D1\",\"D2\",\"D3\",\"D4\",\"D5\"]},{\"title\":\"Fast compute\",\"description\":\"Server with high-speed processors, optimized for fast computation or task parallelization (e.g.: time series, multi-field tables etc.)\",\"suggestedServerNames\":[\"C1\",\"C2\",\"C3\",\"C4\",\"C5\"]}]}]},{\"title\":\"Data hub\",\"description\":\"Optimized for large-scale data federation and annotation, facilitating interoperability between your data offices and data labs\",\"suggestedServerNames\":[\"D2\",\"D3\",\"D4\",\"D4\"]}]}';

SET @constellabSuite = '{\"apps\":[{\"name\":\"Constellab Project\",\"emoji\":\"📓\",\"background\":\"#22c55e\",\"shortDescription\":\"A lightweight, interactive project management tool designed for innovation-driven teams. It helps organizations track progress, manage resources, and visualize key performance indicators with ease. By centralizing all project data, Constellab Project offers dynamic Gantt charts, status tracking, and real-time insights—empowering teams to collaborate efficiently and make smarter decisions across their innovation projects.\"},{\"name\":\"Constellab Table\",\"emoji\":\"📊\",\"background\":\"#3b82f6\",\"shortDescription\":\"The AI assistant for managing all your tabular data with scientific precision. It transforms the way you work with Excel, CSV, or text files by combining intelligent visualization with conversational AI. Effortlessly upload and explore multiple datasets, clean and transform your data, and generate charts or statistical insights in seconds. Ideal for analysts, researchers, and non-technical users who want to analyze and report data—without writing a single formula or line of code.\",\"communityAppLink\":\"https://constellab.community/apps/ef742e82-6000-4326-b687-59b998a8354b/constellab-table\"},{\"name\":\"Constellab Search\",\"emoji\":\"🤖\",\"background\":\"#a855f7\",\"shortDescription\":\"The AI assistant that consolidates your large collections of unstructured documents, enabling you to explore data and enhance your analytics through natural language and scientific precision. Constellab Search transforms your organization knowledge into an accessible, searchable resource for your teams, partners, and clients—empowering everyone to find, understand, and value information instantly.\",\"communityAppLink\":\"https://constellab.community/apps/76a51a59-58c5-494f-8ea9-775ca60ccfb5/chromato-ai\"},{\"name\":\"Constellab Bioprocess\",\"emoji\":\"🧬\",\"background\":\"#f97316\",\"shortDescription\":\"The playground for monitoring, analyzing, and optimizing your bioprocess experiments. It centralizes data from instruments, sensors, and lab records to provide real-time insights into culture performance, productivity, and process parameters. With built-in and customizable visualization, QC checks, AI-driven analytics, and automated reporting, Constellab Bioprocess helps scientists accelerate process development, ensure data integrity, and make faster, evidence-based decisions across R&D and production environments.\"},{\"name\":\"Constellab 16S rRNASeq\",\"emoji\":\"🦠\",\"background\":\"#f1ee63\",\"shortDescription\":\"The bioinformatics workspace for exploring and interpreting microbial communities with clarity and precision. It streamlines your entire 16S rRNA sequencing workflow—from raw data import to taxonomy and functional profiling and comparative analysis—while offering intuitive visualization. Designed to make complex bioinformatics accessible, Constellab 16S rRNASeq helps scientists work smoothly, collaborate easily, and uncover microbial patterns without the usual technical friction.\",\"communityAppLink\":\"https://constellab.community/apps/f1f107de-68ad-4b7c-82bf-bbaacb27c117/constellab-16s-rrna-seq\"},{\"name\":\"Constellab Digital Twin\",\"emoji\":\"🔬\",\"background\":\"#c03c72\",\"shortDescription\":\"The discovery workspace for creating, visualizing, and simulating digital twins of cellular metabolism and accelerate your discovery pipelines. It connects experimental data, models, and metabolic pathways to help you understand complex behaviors and predict outcomes in silico. With interactive dashboards, dynamic visualizations, and seamless collaboration tools, Constellab Digital Twin turns data into living models—making your research more intuitive, exploratory, and enjoyable.\",\"communityAppLink\":\"https://constellab.community/apps/8fa00164-1b33-4f94-8ad2-d4376635423b/constellab-digital-twin\"}]}';

SET @freeLabConfig = '{\"cloudProvider\":\"GCP\",\"cloudProviderRegion\":\"europe-west1-b\",\"cloudProviderInstanceType\":\"e2-standard-2\",\"nbCpus\":2,\"ramSize\":8,\"volumeSize\":100,\"volumeType\":\"HIGH_SPEED\",\"billingMode\":\"HOURLY\",\"domain\":\"constellab.app\",\"greenOption\":\"STOP_AFTER_INACTIVITY_TIME\",\"greenOptionInactivityDuration\":60,\"bricks\":[\"gws_core\",\"gws_academy\"],\"hourLimit\":25,\"deletionAfterDays\":2}';

INSERT INTO `settings` (`id`, `created_at`, `last_modified_at`, `server_decision_tree`, `created_by_id`, `last_modified_by_id`,
                         `constellab_suite`, `free_lab_config`)
VALUES ('10db47da-9aa0-417b-b5ff-3e34094fadbc', '2024-04-25 09:46:03', '2025-11-05 16:00:40',
        @serverDecisionTree,
        @adminUserId, @adminUserId,
        @constellabSuite,
        @freeLabConfig);