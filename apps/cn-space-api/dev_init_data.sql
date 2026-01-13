INSERT INTO `user` (`id`, `firstname`, `lastname`, `email`, `password`, `category`, `activity`, `biography`,
                    `failedLoginCount`, `lastLoginAttempt`, `lastLoginSuccess`, `lang`, `theme`, `status`, `createdAt`,
                    `photo`, `company`, `has2FA`, `phone`, `license`)
VALUES ('cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'Roboy', 'Gencovery', 'robot@gencovery.com',
        ' ', 'ADMIN',
        NULL,
        NULL,
        0, NULL, NULL, 'en', 'dark-theme', 'WAITING_FOR_EMAIL', '2023-02-27 17:15:47',
        NULL, 'Gencovery', 0, NULL, 'ENTERPRISE');

INSERT INTO `group` (`id`, `createdAt`, `lastModifiedAt`, `label`, `type`, `userId`, `spaceId`, `createdById`,
                     `lastModifiedById`)
VALUES ('2e589f29-873f-447a-8530-c55549c2c85c', '2023-02-27 17:15:47', '2023-02-27 17:15:47', 'Robot Gencovery',
        'SINGLE_USER', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', NULL, 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f');


INSERT INTO `user_group` (`userId`, `groupId`, `createdAt`, `createdById`)
VALUES ('cc041136-3e20-48e6-bf9d-9aa8ecaad21f', '2e589f29-873f-447a-8530-c55549c2c85c', '2023-08-07 15:27:18',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f');



INSERT INTO `country` (`id`, `name`, `shortName`)
VALUES ('018bf5eb-0835-11ed-afdd-0242ac120004', 'Australia', 'au'),
       ('0a24ced9-0834-11ed-afdd-0242ac120004', 'France', 'fr'),
       ('263089da-0834-11ed-afdd-0242ac120004', 'Canada', 'ca'),
       ('7d178e13-0834-11ed-afdd-0242ac120004', 'Great Britain', 'gb'),
       ('a53feed1-0834-11ed-afdd-0242ac120004', 'Poland', 'pl'),
       ('daa9a0e2-f0cf-4a15-8263-fb85f1ef0665', 'Germany', 'de'),
       ('df6895a7-0834-11ed-afdd-0242ac120004', 'Singapore', 'sg');

INSERT INTO `city` (`id`, `name`, `countryId`)
VALUES ('2694a12e-0835-11ed-afdd-0242ac120004', 'Gravelines', '0a24ced9-0834-11ed-afdd-0242ac120004'),
       ('305860a7-0835-11ed-afdd-0242ac120004', 'Strasbourg', '0a24ced9-0834-11ed-afdd-0242ac120004'),
       ('6c9ef4b8-0835-11ed-afdd-0242ac120004', 'Beauharnois', '263089da-0834-11ed-afdd-0242ac120004'),
       ('8253cb0c-0835-11ed-afdd-0242ac120004', 'London', '7d178e13-0834-11ed-afdd-0242ac120004'),
       ('9c93dbbc-0835-11ed-afdd-0242ac120004', 'Warsaw', 'a53feed1-0834-11ed-afdd-0242ac120004'),
       ('b3f96543-c9e8-4eac-881a-161b9c38b765', 'Frankfurt', 'daa9a0e2-f0cf-4a15-8263-fb85f1ef0665'),
       ('c9830588-0835-11ed-afdd-0242ac120004', 'Singapore', 'df6895a7-0834-11ed-afdd-0242ac120004'),
       ('eb134eb4-0835-11ed-afdd-0242ac120004', 'Sidney', '018bf5eb-0835-11ed-afdd-0242ac120004');


INSERT INTO `cloud_provider` (`id`, `createdAt`, `lastModifiedAt`, `name`, `createdById`, `lastModifiedById`,
                              `description`, `logo`)
VALUES ('57a6f823-6b73-4e0a-9818-f055cbd6d546', '2023-05-19 14:58:31', '2024-03-27 11:11:10', 'AZURE',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', NULL,
        'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/azure.jpg'),
       ('964ad825-6b0b-44f2-9825-7129b01a9df7', '2023-02-27 17:19:36', '2024-03-27 11:10:54', 'OVH',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', NULL,
        'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/ovh.png'),
       ('cdfdc499-61a4-445d-94e6-b65cef54f479', '2023-12-21 15:27:08', '2024-03-27 11:11:27', 'OUTSCALE',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', NULL,
        'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/ouscale.gif'),
        ('cce27e1c-71d3-4820-a65a-12baac537115', '2023-12-21 15:27:08', '2024-03-27 11:11:27', 'GCP',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', NULL,
        'https://storage.sbg.cloud.ovh.net/v1/AUTH_a0286631d7b24afba3f3cdebed2992aa/public/gcp.png');


INSERT INTO `cloud_provider_region` (`id`, `createdAt`, `lastModifiedAt`, `technicalName`, `s3Endpoint`, `createdById`,
                                     `lastModifiedById`, `cloudProviderId`, `cityId`, `name`, `type`)
VALUES ('2f71581d-2882-476a-a6d5-e077dd2724ff', '2023-02-27 17:19:45', '2023-12-22 14:11:56', 'gra',
        'https://s3.gra.io.cloud.ovh.net/', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', '964ad825-6b0b-44f2-9825-7129b01a9df7',
        '2694a12e-0835-11ed-afdd-0242ac120004', 'Graveline', 'S3'),
       ('d4c4172b-10d6-4c47-84c5-b6575d90c06f', '2023-10-04 09:23:30', '2024-03-25 12:21:17', 'sbg',
        'https://s3.sbg.io.cloud.ovh.net/', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', '964ad825-6b0b-44f2-9825-7129b01a9df7',
        '305860a7-0835-11ed-afdd-0242ac120004', 'Strasbourg', 'S3'),
      ('0d9edec6-19b3-41a0-8811-606e240188f9',	'2024-07-03 15:34:50',	'2024-07-03 16:10:41',	'francecentral',	NULL,	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'57a6f823-6b73-4e0a-9818-f055cbd6d546',	'305860a7-0835-11ed-afdd-0242ac120004',	'France central',	'ALL'),
      ('53534232-d11a-4fae-a97e-d9dbc6d28763',	'2025-04-30 09:00:06',	'2025-04-30 09:00:06',	'europe-west9',	'https://storage.googleapis.com',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cce27e1c-71d3-4820-a65a-12baac537115',	'2694a12e-0835-11ed-afdd-0242ac120004',	'Europe west S3',	'S3'),
      ('588de190-d0a2-479c-a31e-792b98b89156',	'2025-04-30 08:59:48',	'2025-04-30 08:59:48',	'europe-west9-a',	NULL,	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cce27e1c-71d3-4820-a65a-12baac537115',	'2694a12e-0835-11ed-afdd-0242ac120004',	'Europe west',	'SERVER'),
      ('6e908ec7-15c4-4c6a-b967-13ca11b7ccc3',	'2023-05-24 14:47:59',	'2024-07-03 16:10:47',	'northeurope',	NULL,	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'57a6f823-6b73-4e0a-9818-f055cbd6d546',	'2694a12e-0835-11ed-afdd-0242ac120004',	'North europe',	'ALL'),
      ('9c8d95a8-57d8-4936-835a-98d295766e98',	'2025-04-30 09:07:18',	'2025-04-30 09:07:18',	'europe-north1',	'https://storage.googleapis.com',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cce27e1c-71d3-4820-a65a-12baac537115',	'8253cb0c-0835-11ed-afdd-0242ac120004',	'Europe north S3',	'S3'),
      ('a0a953a8-a089-4b7e-b1a3-f0ed3f2c2e04',	'2026-01-05 12:52:56',	'2026-01-05 12:52:56',	'europe-west1-b',	NULL,	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cce27e1c-71d3-4820-a65a-12baac537115',	'305860a7-0835-11ed-afdd-0242ac120004', 'Europe - Brussels', 'SERVER');


INSERT INTO `bucket_credentials` (`id`, `createdAt`, `lastModifiedAt`, `name`, `accessKeyId`, `secretAccessKey`,
                                  `s3Username`, `shortDescription`, `createdById`, `lastModifiedById`,
                                  `cloudProviderId`, `spaceId`)
VALUES ('bc97b9f2-3241-47b2-aef5-2321c9e347af', '2023-03-17 12:05:07', '2024-07-04 10:35:26', 'LAB_BACKUP',
        'TO DEFINE', 'TO DEFINE', '',
        'S3 object storage', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        '964ad825-6b0b-44f2-9825-7129b01a9df7', NULL);

INSERT INTO `bucket` (`id`, `createdAt`, `lastModifiedAt`, `name`, `contentType`, `createdById`, `lastModifiedById`,
                      `regionId`, `credentialsId`, `bucketType`, `labId`)
VALUES ('5a83422b-5604-401b-8c73-ac3bf0d122ef', '2023-10-18 16:08:03', '2023-10-18 16:08:03',
        'constellab-project-local-gra', 'FOLDER', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', '2f71581d-2882-476a-a6d5-e077dd2724ff',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       ('dcaaa6f7-ef76-4692-9412-6687b3bfc272', '2023-10-18 18:24:02', '2023-10-18 18:24:02',
        'constellab-lab-backup-local-gra', 'LAB_BACKUP', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', '2f71581d-2882-476a-a6d5-e077dd2724ff',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       ('e5cd6bc5-b621-463e-9e52-219bfaf2f6e3', '2024-04-24 10:57:57', '2024-04-24 10:57:57',
        'constellab-lab-bakcup-pre-prod-gra', 'LAB_BACKUP', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', '2f71581d-2882-476a-a6d5-e077dd2724ff',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       ('132a4311-5a4f-4814-822b-bd3015e08d34', '2023-10-18 18:24:10', '2023-10-18 18:24:10',
        'constellab-lab-backup-local-sbg', 'LAB_BACKUP', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'd4c4172b-10d6-4c47-84c5-b6575d90c06f',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       ('9d119fd6-512f-4953-9ec0-6edc13d27f37', '2023-10-18 16:08:30', '2023-10-18 16:08:30',
        'constellab-project-local-sbg', 'FOLDER', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'd4c4172b-10d6-4c47-84c5-b6575d90c06f',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL),
       ('c40f71e8-4ad3-446f-ab1d-01bdde497b7a', '2024-04-24 10:57:42', '2024-04-24 10:57:42',
        'constellab-lab-bakcup-pre-prod-sbg', 'LAB_BACKUP', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'd4c4172b-10d6-4c47-84c5-b6575d90c06f',
        'bc97b9f2-3241-47b2-aef5-2321c9e347af', 'NORMAL', NULL);


INSERT INTO `storage_price` (`id`, `createdAt`, `lastModifiedAt`, `startDate`, `endDate`, `createdById`,
                             `lastModifiedById`, `volumeStoragePrice`, `backupStoragePrice`, `backupTransfertPrice`)
VALUES ('0c3c83db-f7cb-4c78-804e-11796476ed3e', '2024-04-25 11:17:43', '2024-04-25 11:17:43', '2000-01-01 00:00:00',
        NULL, 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 0.33, 0.075, 0.03);


INSERT INTO `server_standard` (`id`, `createdAt`, `lastModifiedAt`, `name`, `description`, `technicalDescription`, `createdById`, `lastModifiedById`) VALUES
('c5714c74-c8c4-4175-b231-51a58a5a3522',	'2024-04-25 11:00:13',	'2024-04-25 11:00:13',	'General purpose',	'Basic usage',	'2 CPU\8 GB RAM',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f');


INSERT INTO `server_price` (`id`, `price`, `startDate`, `endDate`, `createdAt`, `lastModifiedAt`, `createdById`, `lastModifiedById`, `serverStandardId`) VALUES
('2b0b9b80-ada8-49a0-bd0f-b06e6e0660b6',	3.14,	'2010-04-25 09:40:23',	NULL,	'2024-04-25 09:42:35',	'2024-04-25 09:42:35',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'c5714c74-c8c4-4175-b231-51a58a5a3522');

INSERT INTO `server_cloud` (`id`, `technicalName`, `ram`, `diskSpace`, `diskType`, `cpuCount`, `cpuType`, `gpuCount`, `gpuType`, `cloudProviderId`, `createdAt`, `lastModifiedAt`, `createdById`, `lastModifiedById`, `serverStandardId`) VALUES
('0e69afcf-a477-45eb-9854-38854c0e8366',	'e2-medium',	4,	0,	'SSD',	2,	'Unknown',	NULL,	NULL,	'cce27e1c-71d3-4820-a65a-12baac537115',	'2025-04-30 09:08:20',	'2025-04-30 09:08:20',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'c5714c74-c8c4-4175-b231-51a58a5a3522'),
('1affda9b-10c7-4e0a-a281-37429279ba74',	'e2-standard-4',	16,	0,	'SSD',	4,	'Unknown',	NULL,	NULL,	'cce27e1c-71d3-4820-a65a-12baac537115',	'2025-07-10 10:04:05',	'2025-07-10 10:04:05',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'c5714c74-c8c4-4175-b231-51a58a5a3522'),
('4009b9e6-7e9d-43d6-afab-51d178a6f3bb',	'b2-7',	7000,	50,	'SSD',	2,	'2.3 Ghz',	NULL,	NULL,	'964ad825-6b0b-44f2-9825-7129b01a9df7',	'2023-01-01 00:00:00',	'2024-04-26 07:03:49',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'c5714c74-c8c4-4175-b231-51a58a5a3522'),
('c8a43d0f-ff7c-4298-9a04-c18aa8d50be7',	'Standard_D4as_v5',	16,	30,	'SSD',	4,	'Unknown',	NULL,	NULL,	'57a6f823-6b73-4e0a-9818-f055cbd6d546',	'2024-04-25 11:00:44',	'2024-04-25 11:00:44',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'c5714c74-c8c4-4175-b231-51a58a5a3522'),
('8a950f80-66a9-4b3e-9718-e9b77e3ec7b5',	'e2-standard-2',	8,	0,	'SSD',	2,	'Unknown',	NULL,	NULL,	'cce27e1c-71d3-4820-a65a-12baac537115', '2026-01-05 12:54:08',	'2026-01-05 12:54:08',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',	'c5714c74-c8c4-4175-b231-51a58a5a3522');

------------------ Create the bricks and bricks version ------------------

INSERT INTO `brick` (`id`, `name`, `pipRepo`, `gitRepo`, `visibility`) VALUES
('b34d3952-732b-479b-ad26-b34f9d5d43aa',	'gws_core',	NULL,	'https://github.com/Constellab/gws_core.git',	'public');

INSERT INTO `brick_version` (`id`, `major`, `minor`, `patch`, `subPatch`, `versionType`, `versionState`, `repoType`, `technicalInfo`, `brickId`) VALUES
('9e9beb89-ddd5-4c05-a502-14327cdd39ec',	0,	16,	6,	NULL,	'NORMAL',	'STABLE',	'GIT',	NULL,	'b34d3952-732b-479b-ad26-b34f9d5d43aa');

INSERT INTO `brick` (`id`, `name`, `pipRepo`, `gitRepo`, `visibility`) VALUES
('041b33e8-9476-42e3-b8cc-3894584c22d8',	'gws_academy',	NULL,	'https://github.com/Constellab/gws_academy.git',	'public');

INSERT INTO `brick_version` (`id`, `major`, `minor`, `patch`, `subPatch`, `versionType`, `versionState`, `repoType`, `technicalInfo`, `brickId`) VALUES
('456dd68e-b5b5-44c0-846b-f4aa3768fc5d',	0,	5,	1,	NULL,	'NORMAL',	'STABLE',	'GIT',	NULL,	'041b33e8-9476-42e3-b8cc-3894584c22d8');
