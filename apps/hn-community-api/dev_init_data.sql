------------------ Robot user ------------------
INSERT INTO `user` (`id`, `userCode`, `alias`, `firstname`, `lastname`, `email`, `photo`, `githubLink`, `linkedinLink`,
                    `xLink`, `interests`, `category`, `createdAt`, `lang`, `theme`)
VALUES -- Robot Gencovery (system user)
       ('cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'ROB_GENCOV', 'Roboy Gencovery', 'Roboy', 'Gencovery',
        'robot@gencovery.com', NULL, NULL, NULL, NULL, NULL, 'ADMIN', '2023-02-27 17:15:47', 'en', 'dark-theme');


------------------ Default space ------------------
INSERT INTO `space` (`id`, `name`, `photo`, `createdAt`, `lastModifiedAt`, `createdById`, `lastModifiedById`)
VALUES -- Constellab default space
       ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Constellab', NULL, '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f');


------------------ Space user (Robot -> Constellab space) ------------------
INSERT INTO `space_user` (`userId`, `spaceId`, `role`, `active`, `createdAt`, `addedById`)
VALUES -- Robot Gencovery as admin of Constellab space
       ('cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADMIN', 1,
        '2023-02-27 17:15:47', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f');


------------------ Create the bricks ------------------

-- gws_core brick
INSERT INTO `brick` (`id`, `name`, `description`, `isCertified`, `visibility`, `pipRepo`, `gitRepo`, `imageLink`,
                     `credentialUsername`, `credentialPassword`, `likes`, `comments`, `createdAt`, `lastModifiedAt`,
                     `createdById`, `lastModifiedById`, `spaceId`)
VALUES ('b34d3952-732b-479b-ad26-b34f9d5d43aa', 'gws_core', 'Core brick of Constellab platform', 1, 'public',
        NULL, 'https://github.com/Constellab/gws_core.git', NULL, NULL, NULL, 0, 0,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- gws_academy brick
INSERT INTO `brick` (`id`, `name`, `description`, `isCertified`, `visibility`, `pipRepo`, `gitRepo`, `imageLink`,
                     `credentialUsername`, `credentialPassword`, `likes`, `comments`, `createdAt`, `lastModifiedAt`,
                     `createdById`, `lastModifiedById`, `spaceId`)
VALUES ('041b33e8-9476-42e3-b8cc-3894584c22d8', 'gws_academy', 'Academy brick for tutorials and learning', 1, 'public',
        NULL, 'https://github.com/Constellab/gws_academy.git', NULL, NULL, NULL, 0, 0,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890');


------------------ Brick users ------------------
INSERT INTO `brick_user` (`id`, `brickId`, `userId`)
VALUES -- Robot Gencovery -> gws_core
       ('f1a2b3c4-d5e6-7890-abcd-111111111111', 'b34d3952-732b-479b-ad26-b34f9d5d43aa',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f'),
       -- Robot Gencovery -> gws_academy
       ('f1a2b3c4-d5e6-7890-abcd-222222222222', '041b33e8-9476-42e3-b8cc-3894584c22d8',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f');


------------------ Brick major versions ------------------

-- gws_core major version 0
INSERT INTO `brick_major_version` (`id`, `major`, `versionState`, `createdAt`, `lastModifiedAt`,
                                   `createdById`, `lastModifiedById`, `brickId`)
VALUES ('d1e2f3a4-b5c6-7890-abcd-aaaaaaaaaaaa', 0, 'LATEST', '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'b34d3952-732b-479b-ad26-b34f9d5d43aa');

-- gws_academy major version 0
INSERT INTO `brick_major_version` (`id`, `major`, `versionState`, `createdAt`, `lastModifiedAt`,
                                   `createdById`, `lastModifiedById`, `brickId`)
VALUES ('d1e2f3a4-b5c6-7890-abcd-bbbbbbbbbbbb', 0, 'LATEST', '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        '041b33e8-9476-42e3-b8cc-3894584c22d8');


------------------ Brick versions ------------------

-- gws_core version 0.16.6
INSERT INTO `brick_version` (`id`, `minor`, `patch`, `subPatch`, `versionType`, `repoType`, `technicalInfo`,
                             `createdAt`, `lastModifiedAt`, `createdById`, `lastModifiedById`, `brickMajorVersionId`)
VALUES ('9e9beb89-ddd5-4c05-a502-14327cdd39ec', 16, 6, NULL, 'NORMAL', 'GIT', NULL,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'd1e2f3a4-b5c6-7890-abcd-aaaaaaaaaaaa');

-- gws_academy version 0.5.1
INSERT INTO `brick_version` (`id`, `minor`, `patch`, `subPatch`, `versionType`, `repoType`, `technicalInfo`,
                             `createdAt`, `lastModifiedAt`, `createdById`, `lastModifiedById`, `brickMajorVersionId`)
VALUES ('456dd68e-b5b5-44c0-846b-f4aa3768fc5d', 5, 1, NULL, 'NORMAL', 'GIT', NULL,
        '2023-02-27 17:15:47', '2023-02-27 17:15:47',
        'cc041136-3e20-48e6-bf9d-9aa8ecaad21f', 'cc041136-3e20-48e6-bf9d-9aa8ecaad21f',
        'd1e2f3a4-b5c6-7890-abcd-bbbbbbbbbbbb');


-- SET RAGFLOW_API_KEY env var
-- SET RAGFLOW_BASE_URL env var
-- SET RAGFLOW_CHAT_ID env var
