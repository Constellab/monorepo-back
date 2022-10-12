# File to run before running the e2e tests to init data for testing


#  Drop and init the database
drop database if exists gencoveryDbTest;
create database gencoveryDbTest;

CREATE OR REPLACE USER gencoveryUser IDENTIFIED BY 'gencovery2020$';

GRANT ALL privileges ON `gencoveryDbTest`.* TO 'gencoveryUser';


#  Users
INSERT INTO gencoveryDbTest.user (id, firstname, lastname, email, password, category, job, failedLoginCount, lastLoginAttempt, lang, status, createdAt) VALUES ('06866542-f089-46dc-b57f-a11e25a23aa5', 'User', 'Admin', 'user.admin@gencovery.com', '$argon2i$v=19$m=4096,t=3,p=1$pjLJw/wUR/EGbGzlXC/yVA$0xADB8wxZpvuBDo6fUKZusd/9Fe51kjNPEOVYWCQ/xw', 'ADMIN', 'Admin', 0, null, 'en', 'READY', '2020-11-26 10:21:26.757944');
INSERT INTO `group` (id, createdAt, lastModifiedAt, label, type, organizationId, createdById, lastModifiedById, userId) VALUES ('7a56ee46-3fff-490a-97db-58247138bdb7', '2020-11-26 10:21:26.757944', '2020-11-26 10:21:26.757944', 'Admin', 'SINGLE_USER',  null, '06866542-f089-46dc-b57f-a11e25a23aa5', '06866542-f089-46dc-b57f-a11e25a23aa5', '06866542-f089-46dc-b57f-a11e25a23aa5');
INSERT INTO user_group (userId, groupId) VALUES('06866542-f089-46dc-b57f-a11e25a23aa5', '7a56ee46-3fff-490a-97db-58247138bdb7');
