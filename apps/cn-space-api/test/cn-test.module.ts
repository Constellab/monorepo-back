import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Service for the test environment to reset and init the database
 */
@Injectable()
export class CnTestDbInitializerService {
  constructor(private datasource: DataSource) {}

  async initDb(): Promise<void> {
    await this.datasource.dropDatabase();
    await this.datasource.synchronize();

    await this.datasource
      .query(`INSERT INTO \`user\` (id, firstname, lastname, email, password, category, job,
                                                       failedLoginCount, lastLoginAttempt, lang, status, createdAt)
                                 VALUES ('06866542-f089-46dc-b57f-a11e25a23aa5', 'User', 'Admin',
                                         'user.admin@gencovery.com',
                                         '$argon2i$v=19$m=4096,t=3,p=1$pjLJw/wUR/EGbGzlXC/yVA$0xADB8wxZpvuBDo6fUKZusd/9Fe51kjNPEOVYWCQ/xw',
                                         'ADMIN', 'Admin', 0, null, 'en', 'READY', '2020-11-26 10:21:26.757944')`);
    await this.datasource.query(`INSERT INTO \`group\` (id, createdAt, lastModifiedAt, label, type, spaceId,
                                                        createdById, lastModifiedById, userId)
                                 VALUES ('7a56ee46-3fff-490a-97db-58247138bdb7', '2020-11-26 10:21:26.757944',
                                         '2020-11-26 10:21:26.757944', 'Admin', 'SINGLE_USER', null,
                                         '06866542-f089-46dc-b57f-a11e25a23aa5', '06866542-f089-46dc-b57f-a11e25a23aa5',
                                         '06866542-f089-46dc-b57f-a11e25a23aa5')`);
    await this.datasource.query(`INSERT INTO \`user_group\` (userId, groupId)
                                 VALUES ('06866542-f089-46dc-b57f-a11e25a23aa5',
                                         '7a56ee46-3fff-490a-97db-58247138bdb7')`);
  }
}
