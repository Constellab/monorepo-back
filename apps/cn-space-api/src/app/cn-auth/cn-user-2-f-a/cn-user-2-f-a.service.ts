import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CnUser2FA } from './cn-user-2-f-a.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { ClDateHelper, ClStringHelper } from '@monorepo/core-lib';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { BlBadRequestException, BlMailService } from '@monorepo/back-core-lib';
import { CnMailTemplate } from '../../cn-core/model/config/cn-mail-template.class';

@Injectable()
export class CnUser2FAService {
  constructor(
    @InjectRepository(CnUser2FA) private repository: Repository<CnUser2FA>,
    private datasource: DataSource,
    private mailService: BlMailService
  ) {}

  public async generateCode(user: CnUser): Promise<CnUser2FA> {
    return this.datasource.transaction(async (entityManager) => {
      await this.deleteOldCode(user, entityManager);

      const user2FA = new CnUser2FA();
      user2FA.user = user;
      user2FA.createdAt = ClDateHelper.getDate();
      // generate a 6 digit code
      user2FA.twoFACode = Math.floor(100000 + Math.random() * 900000) + '';
      user2FA.urlCode = ClStringHelper.generateUUID();

      await entityManager.save(user2FA);

      await this.sendMail(user, user2FA.twoFACode);
      return user2FA;
    });
  }

  private async deleteOldCode(user: CnUser, entityManager: EntityManager): Promise<void> {
    await entityManager.delete(CnUser2FA, { user: user.id });
  }

  /**
   * Method to check the 2FA code and throw an exception if the code is not valid
   */
  public async checkIsValidCode(twoFACode: string, urlCode: string): Promise<CnUser> {
    const user2FA = await this.repository.findOne({
      where: { urlCode: urlCode },
      relations: { user: true },
    });

    if (user2FA == null || user2FA.twoFACode !== twoFACode) {
      throw new BlBadRequestException(CnErrorText.TWO_FA_WRONG_CODE);
    }

    if (!user2FA.isValid()) {
      throw new BlBadRequestException(CnErrorText.TWO_FA_CODE_EXPIRED);
    }

    await this.repository.delete(user2FA.id);

    return user2FA.user;
  }

  private async sendMail(user: CnUser, twoFACode: string): Promise<void> {
    await this.mailService.sendMailToUser(CnMailTemplate.two_factor_authentication, user, {
      code: twoFACode,
    });
  }
}
