-- Common variables with space
SET @robotUserId = '65b2ebc3-9ed0-4513-825c-6b9bc7eeddff';
SET @adminUserId = '98ed7a54-9ee4-4257-811f-e1dfe730b97d';
SET @secondaryUserId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
SET @gwsCoreBrickId = 'b34d3952-732b-479b-ad26-b34f9d5d43aa';
SET @gwsAcademyBrickId = '041b33e8-9476-42e3-b8cc-3894584c22d8';
SET @adminUserSpaceId = '696072d7-1eb3-4161-a6bb-d3b46d0a2b6e';
SET @secondaryUserSpaceId = '34a3b327-a185-45c5-8a77-4e7be24f7763';
SET @enterpriseSpaceId = '2bd030ba-158f-45ba-ab18-093fcdfa7b1a';

-- Other variables
SET @gwsCoreMajorVersionId = '4bae6d80-39e2-40e9-9927-a54eb7a7fa2d';
SET @gwsAcademyMajorVersionId = 'a344dc51-a6f6-40c5-8455-f45d73ebd7c0';
SET @gwsCoreMainFolderId = '7c4310ea-a999-439a-b308-e43f3046f480';
SET @gwsAcademyMainFolderId = 'e7d16cb5-287a-4e4a-a22c-936e4e50c44e';

-- Robot user
INSERT INTO `user` (`id`, `user_code`, `alias`, `firstname`, `lastname`, `email`, `photo`, `github_link`, `linkedin_link`,
                    `x_link`, `interests`, `category`, `created_at`, `lang`, `theme`)
VALUES -- Robot Gencovery (system user)
       (@robotUserId, 'ROB_GENCOV', 'Roboy Gencovery', 'Roboy', 'Gencovery',
        'robot@gencovery.com', NULL, NULL, NULL, NULL, NULL, 'ADMIN', '2023-02-27 17:15:47', 'en', 'dark-theme');

-- Test user (Admin)
INSERT INTO `user` (`id`, `user_code`, `alias`, `firstname`, `lastname`, `email`, `photo`, `github_link`, `linkedin_link`,
                    `x_link`, `interests`, `category`, `created_at`, `lang`, `theme`)
VALUES -- Test user (Admin)
       (@adminUserId, 'MICH_123', 'M Larousse', 'Michel', 'Larousse',
        'test@gencovery.com', NULL, NULL, NULL, NULL, NULL, 'ADMIN', '2023-02-27 17:15:47', 'en', 'dark-theme');

-- Secondary user (non-admin)
INSERT INTO `user` (`id`, `user_code`, `alias`, `firstname`, `lastname`, `email`, `photo`, `github_link`, `linkedin_link`,
                    `x_link`, `interests`, `category`, `created_at`, `lang`, `theme`)
VALUES (@secondaryUserId, 'SOPH_456', 'S Dupont', 'Sophie', 'Dupont',
        'sophie@gencovery.com', NULL, NULL, NULL, NULL, NULL, 'USER', '2023-03-15 10:00:00', 'en', 'dark-theme');


-- Personal space for Test user (Michel Larousse)
INSERT INTO `space` (`id`, `name`, `photo`, `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@adminUserSpaceId, 'Michel Larousse', NULL, '2023-03-01 10:00:00', '2023-03-01 10:00:00',
        @adminUserId, @adminUserId);

-- Default space (Enterprise)
INSERT INTO `space` (`id`, `name`, `photo`, `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES -- Constellab default space
       (@enterpriseSpaceId, 'Constellab', NULL, '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);

-- Personal space for Sophie Dupont
INSERT INTO `space` (`id`, `name`, `photo`, `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@secondaryUserSpaceId, 'Sophie Dupont', NULL, '2023-03-15 10:00:00', '2023-03-15 10:00:00',
        @secondaryUserId, @secondaryUserId);


-- Space user (Robot -> Constellab space)
INSERT INTO `space_user` (`user_id`, `space_id`, `role`, `active`, `created_at`, `added_by_id`)
VALUES -- Robot Gencovery as admin of Constellab space
       (@robotUserId, @enterpriseSpaceId, 'ADMIN', 1,
        '2023-02-27 17:15:47', @robotUserId);

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


-- Create the bricks

-- gws_core brick
INSERT INTO `brick` (`id`, `name`, `description`, `is_certified`, `visibility`, `pip_repo`, `git_repo`, `image_link`,
                     `credential_username`, `credential_password`, `likes`, `comments`, `created_at`, `last_modified_at`,
                     `created_by_id`, `last_modified_by_id`, `space_id`)
VALUES (@gwsCoreBrickId, 'gws_core', 'Core brick of Constellab platform', 1, 'public',
        NULL, 'https://github.com/Constellab/gws_core.git', NULL, NULL, NULL, 0, 0,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId, null);

-- gws_academy brick
INSERT INTO `brick` (`id`, `name`, `description`, `is_certified`, `visibility`, `pip_repo`, `git_repo`, `image_link`,
                     `credential_username`, `credential_password`, `likes`, `comments`, `created_at`, `last_modified_at`,
                     `created_by_id`, `last_modified_by_id`, `space_id`)
VALUES (@gwsAcademyBrickId, 'gws_academy', 'Academy brick for tutorials and learning', 1, 'public',
        NULL, 'https://github.com/Constellab/gws_academy.git', NULL, NULL, NULL, 0, 0,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId, null);


-- Brick users
INSERT INTO `brick_user` (`id`, `brick_id`, `user_id`)
VALUES -- Robot Gencovery -> gws_core
       ('8ba5b426-3cba-4560-99a3-a1d9e65f911a', @gwsCoreBrickId,
        @adminUserId),
       -- Robot Gencovery -> gws_academy
       ('a79f5133-4b3c-4104-a958-1b4ebfe7296e', @gwsAcademyBrickId,
        @adminUserId);


-- Brick major versions

-- gws_core major version 0
INSERT INTO `brick_major_version` (`id`, `major`, `version_state`, `created_at`, `last_modified_at`,
                                   `created_by_id`, `last_modified_by_id`, `brick_id`)
VALUES (@gwsCoreMajorVersionId, 0, 'LATEST', '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsCoreBrickId);

-- gws_academy major version 0
INSERT INTO `brick_major_version` (`id`, `major`, `version_state`, `created_at`, `last_modified_at`,
                                   `created_by_id`, `last_modified_by_id`, `brick_id`)
VALUES (@gwsAcademyMajorVersionId, 0, 'LATEST', '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsAcademyBrickId);


-- Brick versions

-- gws_core version 0.16.6
INSERT INTO `brick_version` (`id`, `minor`, `patch`, `sub_patch`, `version_type`, `repo_type`, `technical_info`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`, `brick_major_version_id`)
VALUES ('9e9beb89-ddd5-4c05-a502-14327cdd39ec', 21, 0, NULL, 'NORMAL', 'GIT', '{"FRONT_VERSION":"2.8.0","GLAB_VERSION":"2.16.0"}',
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsCoreMajorVersionId);

-- gws_academy version 0.5.1
INSERT INTO `brick_version` (`id`, `minor`, `patch`, `sub_patch`, `version_type`, `repo_type`, `technical_info`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`, `brick_major_version_id`)
VALUES ('456dd68e-b5b5-44c0-846b-f4aa3768fc5d', 5, 1, NULL, 'NORMAL', 'GIT', NULL,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId,
        @gwsAcademyMajorVersionId);


-- Main folders for brick major versions

-- gws_core main folder (root folder for brick major version)
INSERT INTO `folder` (`id`, `title`, `path`, `complete_path`, `order`, `brick_major_version_id`, `folder_id`, `mpath`,
                      `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@gwsCoreMainFolderId, NULL, NULL, NULL, 0,
        @gwsCoreMajorVersionId, NULL, CONCAT(@gwsCoreMainFolderId, '.'),
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);

-- gws_academy main folder (root folder for brick major version)
INSERT INTO `folder` (`id`, `title`, `path`, `complete_path`, `order`, `brick_major_version_id`, `folder_id`, `mpath`,
                      `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES (@gwsAcademyMainFolderId, NULL, NULL, NULL, 0,
        @gwsAcademyMajorVersionId, NULL, CONCAT(@gwsAcademyMainFolderId, '.'),
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);


-- Main documentation (Getting Started) for each brick

-- gws_core Getting Started doc
INSERT INTO `documentation` (`id`, `title`, `path`, `complete_path`, `order`, `folder_id`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES ('8b1acb58-ee72-4994-9fbe-04022c7f4116', 'Getting Started', 'getting-started', 'getting-started/', 0,
        @gwsCoreMainFolderId,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);

-- gws_academy Getting Started doc
INSERT INTO `documentation` (`id`, `title`, `path`, `complete_path`, `order`, `folder_id`,
                             `created_at`, `last_modified_at`, `created_by_id`, `last_modified_by_id`)
VALUES ('9300732e-9463-44d6-b570-7a9821192bf3', 'Getting Started', 'getting-started', 'getting-started/', 0,
        @gwsAcademyMainFolderId,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        @adminUserId, @adminUserId);


-- SET RAGFLOW_API_KEY env var
-- SET RAGFLOW_BASE_URL env var
-- SET RAGFLOW_CHAT_ID env var
