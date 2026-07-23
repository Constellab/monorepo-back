-- Common variables with space
SET @robotUserId = '65b2ebc3-9ed0-4513-825c-6b9bc7eeddff';
SET @adminUserId = '98ed7a54-9ee4-4257-811f-e1dfe730b97d';
SET @secondaryUserId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SET @gwsCoreBrickId = 'b34d3952-732b-479b-ad26-b34f9d5d43aa';
SET @gwsAcademyBrickId = '041b33e8-9476-42e3-b8cc-3894584c22d8';
SET @adminPrivateBrickId = 'c5f1e8a2-4d2b-4a6e-9c3f-7b8e1d2a3c4f';
SET @adminUserSpaceId = '696072d7-1eb3-4161-a6bb-d3b46d0a2b6e';
SET @secondaryUserSpaceId = '34a3b327-a185-45c5-8a77-4e7be24f7763';
SET @enterpriseSpaceId = '2bd030ba-158f-45ba-ab18-093fcdfa7b1a';

-- Other variables
SET @gwsCoreMajorVersionId = '4bae6d80-39e2-40e9-9927-a54eb7a7fa2d';
SET @gwsAcademyMajorVersionId = 'a344dc51-a6f6-40c5-8455-f45d73ebd7c0';
SET @gwsCoreMainFolderId = '7c4310ea-a999-439a-b308-e43f3046f480';
SET @gwsAcademyMainFolderId = 'e7d16cb5-287a-4e4a-a22c-936e4e50c44e';
SET @adminPrivateBrickMajorVersionId = 'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f50';
SET @adminPrivateBrickMainFolderId = 'e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5061';

-- Robot user
INSERT IGNORE INTO `user` (`id`, `user_code`, `alias`, `firstname`, `lastname`, `email`, `photo`, `github_link`, `linkedin_link`,
                    `x_link`, `interests`, `category`, `created_at`, `lang`, `theme`)
VALUES -- Robot Gencovery (system user)
       (@robotUserId, 'ROB_GENCOV', 'Robot Gencovery', 'Robot', 'Gencovery',
        'robot@gencovery.com', NULL, NULL, NULL, NULL, NULL, 'ADMIN', '2023-02-27 17:15:47', 'en', 'dark-theme');

-- Test user (Admin)
INSERT IGNORE INTO `user` (`id`, `user_code`, `alias`, `firstname`, `lastname`, `email`, `photo`, `github_link`, `linkedin_link`,
                    `x_link`, `interests`, `category`, `created_at`, `lang`, `theme`)
VALUES -- Test user (Admin)
       (@adminUserId, 'MICH_123', 'M Larousse', 'Michel', 'Larousse',
        'test@gencovery.com', NULL, NULL, NULL, NULL, NULL, 'ADMIN', '2023-02-27 17:15:47', 'en', 'dark-theme');

-- Secondary user (non-admin)
INSERT IGNORE INTO `user` (`id`, `user_code`, `alias`, `firstname`, `lastname`, `email`, `photo`, `github_link`, `linkedin_link`,
                    `x_link`, `interests`, `category`, `created_at`, `lang`, `theme`)
VALUES (@secondaryUserId, 'SOPH_456', 'S Dupont', 'Sophie', 'Dupont',
        'sophie@gencovery.com', NULL, NULL, NULL, NULL, NULL, 'USER', '2023-03-15 10:00:00', 'en', 'dark-theme');


-- Personal space for Test user (Michel Larousse)
INSERT IGNORE INTO `space` (`id`, `name`, `photo`, `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@adminUserSpaceId, 'Michel Larousse', NULL, '2023-03-01 10:00:00', '2023-03-01 10:00:00',
        @adminUserId, @adminUserId);

-- Default space (Enterprise)
INSERT IGNORE INTO `space` (`id`, `name`, `photo`, `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES -- Constellab default space
       (@enterpriseSpaceId, 'Constellab', NULL, '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);

-- Personal space for Sophie Dupont
INSERT IGNORE INTO `space` (`id`, `name`, `photo`, `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@secondaryUserSpaceId, 'Sophie Dupont', NULL, '2023-03-15 10:00:00', '2023-03-15 10:00:00',
        @secondaryUserId, @secondaryUserId);


-- Space user (Robot -> Constellab space)
INSERT IGNORE INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES -- Robot Gencovery as admin of Constellab space
       (@robotUserId, @enterpriseSpaceId, 'ADMIN', 1,
        '2023-02-27 17:15:47', @robotUserId);

-- Test user (Michel) -> own personal space (ADMIN)
INSERT IGNORE INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES (@adminUserId, @adminUserSpaceId, 'ADMIN', 1,
        '2023-03-01 10:00:00', @adminUserId);

-- Test user (Michel) -> enterprise space (ADMIN)
INSERT IGNORE INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES (@adminUserId, @enterpriseSpaceId, 'ADMIN', 1,
        '2023-03-01 10:00:00', @adminUserId);

-- Sophie -> own personal space (ADMIN)
INSERT IGNORE INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES (@secondaryUserId, @secondaryUserSpaceId, 'ADMIN', 1,
        '2023-03-15 10:00:00', @secondaryUserId);

-- Sophie -> Michel's personal space (USER)
INSERT IGNORE INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES (@secondaryUserId, @adminUserSpaceId, 'USER', 1,
        '2023-03-15 10:00:00', @adminUserId);


-- Create the bricks

-- gws_core brick
INSERT IGNORE INTO `brick` (`id`, `name`, `description`, `is_certified`, `visibility`, `pip_repo`, `git_repo`, `image_link`,
                     `credential_username`, `credential_password`, `likes`, `comments`, `created_at`, `last_modified_at`,
                     `created_by_id`, `last_modified_by_id`, `space_id`)
VALUES (@gwsCoreBrickId, 'gws_core', 'Core brick of Constellab platform', 1, 'public',
        NULL, 'https://github.com/Constellab/gws_core.git', NULL, NULL, NULL, 0, 0,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId, null);

-- gws_academy brick
INSERT IGNORE INTO `brick` (`id`, `name`, `description`, `is_certified`, `visibility`, `pip_repo`, `git_repo`, `image_link`,
                     `credential_username`, `credential_password`, `likes`, `comments`, `created_at`, `last_modified_at`,
                     `created_by_id`, `last_modified_by_id`, `space_id`)
VALUES (@gwsAcademyBrickId, 'gws_academy', 'Academy brick for tutorials and learning', 1, 'public',
        NULL, 'https://github.com/Constellab/gws_academy.git', NULL, NULL, NULL, 0, 0,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId, null);


-- Brick users
INSERT IGNORE INTO `brick_user` (`id`, `brick_id`, `user_id`)
VALUES -- Robot Gencovery -> gws_core
       ('8ba5b426-3cba-4560-99a3-a1d9e65f911a', @gwsCoreBrickId,
        @adminUserId),
       -- Robot Gencovery -> gws_academy
       ('a79f5133-4b3c-4104-a958-1b4ebfe7296e', @gwsAcademyBrickId,
        @adminUserId);


-- Brick major versions

-- gws_core major version 0
INSERT IGNORE INTO `brick_major_version` (`id`, `major`, `version_state`, `created_at`, `last_modified_at`,
                                   `created_by_id`, `last_modified_by_id`, `brick_id`)
VALUES (@gwsCoreMajorVersionId, 0, 'LATEST', '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsCoreBrickId);

-- gws_academy major version 0
INSERT IGNORE INTO `brick_major_version` (`id`, `major`, `version_state`, `created_at`, `last_modified_at`,
                                   `created_by_id`, `last_modified_by_id`, `brick_id`)
VALUES (@gwsAcademyMajorVersionId, 0, 'LATEST', '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsAcademyBrickId);


-- Brick versions

-- gws_core version 0.16.6
INSERT IGNORE INTO `brick_version` (`id`, `minor`, `patch`, `sub_patch`, `version_type`, `repo_type`, `technical_info`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`, `brick_major_version_id`)
VALUES ('9e9beb89-ddd5-4c05-a502-14327cdd39ec', 21, 0, NULL, 'NORMAL', 'GIT', '{"FRONT_VERSION":"2.8.0","GLAB_VERSION":"2.16.0"}',
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsCoreMajorVersionId);

-- gws_core version 0.23.8
INSERT IGNORE INTO `brick_version` (`id`, `minor`, `patch`, `sub_patch`, `version_type`, `repo_type`, `technical_info`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`, `brick_major_version_id`)
VALUES ('c1f3a7d2-4b6e-4c9a-8f21-9d5e7a0b3c48', 23, 8, NULL, 'NORMAL', 'GIT', '{"FRONT_VERSION":"2.8.0","GLAB_VERSION":"2.16.0"}',
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsCoreMajorVersionId);

-- gws_academy version 0.5.1
INSERT IGNORE INTO `brick_version` (`id`, `minor`, `patch`, `sub_patch`, `version_type`, `repo_type`, `technical_info`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`, `brick_major_version_id`)
VALUES ('456dd68e-b5b5-44c0-846b-f4aa3768fc5d', 5, 1, NULL, 'NORMAL', 'GIT', NULL,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsAcademyMajorVersionId);


-- Main folders for brick major versions

-- gws_core main folder (root folder for brick major version)
INSERT IGNORE INTO `folder` (`id`, `title`, `path`, `complete_path`, `order`, `brick_major_version_id`, `folder_id`, `mpath`,
                      `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@gwsCoreMainFolderId, NULL, NULL, NULL, 0,
        @gwsCoreMajorVersionId, NULL, CONCAT(@gwsCoreMainFolderId, '.'),
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);

-- gws_academy main folder (root folder for brick major version)
INSERT IGNORE INTO `folder` (`id`, `title`, `path`, `complete_path`, `order`, `brick_major_version_id`, `folder_id`, `mpath`,
                      `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@gwsAcademyMainFolderId, NULL, NULL, NULL, 0,
        @gwsAcademyMajorVersionId, NULL, CONCAT(@gwsAcademyMainFolderId, '.'),
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);


-- Main documentation (Getting Started) for each brick

-- gws_core Getting Started doc
INSERT IGNORE INTO `documentation` (`id`, `title`, `path`, `complete_path`, `order`, `folder_id`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES ('8b1acb58-ee72-4994-9fbe-04022c7f4116', 'Getting Started', 'getting-started', 'getting-started/', 0,
        @gwsCoreMainFolderId,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);

-- gws_academy Getting Started doc
INSERT IGNORE INTO `documentation` (`id`, `title`, `path`, `complete_path`, `order`, `folder_id`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES ('9300732e-9463-44d6-b570-7a9821192bf3', 'Getting Started', 'getting-started', 'getting-started/', 0,
        @gwsAcademyMainFolderId,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);


-- Private brick for Test user (Michel Larousse) attached to his personal space
INSERT IGNORE INTO `brick` (`id`, `name`, `description`, `is_certified`, `visibility`, `pip_repo`, `git_repo`, `image_link`,
                     `credential_username`, `credential_password`, `likes`, `comments`, `created_at`, `last_modified_at`,
                     `created_by_id`, `last_modified_by_id`, `space_id`)
VALUES (@adminPrivateBrickId, 'michel_private_brick', 'Private brick owned by Michel Larousse', 0, 'private',
        NULL, NULL, NULL, NULL, NULL, 0, 0,
        '2023-03-01 10:00:00', '2023-03-01 10:00:00',
        @adminUserId, @adminUserId, @adminUserSpaceId);

-- Brick user for the private brick
INSERT IGNORE INTO `brick_user` (`id`, `brick_id`, `user_id`)
VALUES ('f3a4b5c6-d7e8-4f9a-0b1c-2d3e4f506172', @adminPrivateBrickId, @adminUserId);

-- Private brick major version 0
INSERT IGNORE INTO `brick_major_version` (`id`, `major`, `version_state`, `created_at`, `last_modified_at`,
                                   `created_by_id`, `last_modified_by_id`, `brick_id`)
VALUES (@adminPrivateBrickMajorVersionId, 0, 'LATEST', '2023-03-01 10:00:00', '2023-03-01 10:00:00',
        @adminUserId, @adminUserId,
        @adminPrivateBrickId);

-- Private brick version
INSERT IGNORE INTO `brick_version` (`id`, `minor`, `patch`, `sub_patch`, `version_type`, `repo_type`, `technical_info`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`, `brick_major_version_id`)
VALUES ('a4b5c6d7-e8f9-4a0b-1c2d-3e4f50617283', 1, 0, NULL, 'NORMAL', 'GIT', NULL,
        '2023-03-01 10:00:00', '2023-03-01 10:00:00',
        @adminUserId, @adminUserId,
        @adminPrivateBrickMajorVersionId);

-- Private brick main folder (root folder for brick major version)
INSERT IGNORE INTO `folder` (`id`, `title`, `path`, `complete_path`, `order`, `brick_major_version_id`, `folder_id`, `mpath`,
                      `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@adminPrivateBrickMainFolderId, NULL, NULL, NULL, 0,
        @adminPrivateBrickMajorVersionId, NULL, CONCAT(@adminPrivateBrickMainFolderId, '.'),
        '2023-03-01 10:00:00', '2023-03-01 10:00:00',
        @adminUserId, @adminUserId);

-- Private brick Getting Started doc
INSERT IGNORE INTO `documentation` (`id`, `title`, `path`, `complete_path`, `order`, `folder_id`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES ('b5c6d7e8-f9a0-4b1c-2d3e-4f5061728394', 'Getting Started', 'getting-started', 'getting-started/', 0,
        @adminPrivateBrickMainFolderId,
        '2023-03-01 10:00:00', '2023-03-01 10:00:00',
        @adminUserId, @adminUserId);


-- SET RAGFLOW_API_KEY env var
-- SET RAGFLOW_BASE_URL env var
-- SET RAGFLOW_CHAT_ID env var
