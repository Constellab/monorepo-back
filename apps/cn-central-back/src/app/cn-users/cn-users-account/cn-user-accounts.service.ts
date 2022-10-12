import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {CnUser} from '../cn-user.entity';
import {CnMailTemplate} from '../../cn-core/model/config/cn-mail-template.class';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnUsersService} from '../cn-users.service';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {CnGroupSingleUser} from '../../cn-groups/cn-group.entity';
import {CnGroupType} from '../../cn-groups/cn-group-type.enum';
import {TokenExpiredError} from 'jsonwebtoken';
import {hash} from 'argon2';
import {CmUserCategory, CmUserStatus} from '@monorepo/common-model';
import {BlMailService, BlTokenHelper} from '@monorepo/back-core-lib';
import {CnUserTokenPayload} from '../../cn-core/model/config/cn-config.class';

/**
 * Service to handle users' account (signup, mail validation, password forgotten, reset password...)
 */
@Injectable()
export class CnUserAccountsService {

  private readonly oneDay: number = 86400;
  private readonly controllerRoute: string = '/accounts';

  constructor(
    @InjectRepository(CnUser) private repository: Repository<CnUser>,
    private configService: CnCoreConfigService,
    private mailService: BlMailService,
    private usersService: CnUsersService,
    private datasource: DataSource) {
  }

  async signup(user: CnUser): Promise<CnUser> {
    return await this.datasource.transaction(async entityManager => {

      if (user.category === CmUserCategory.ADMIN) {
        throw new UnauthorizedException();
      }

      const sameEmailUser: CnUser = await this.usersService.findByEmail(user.email);
      if (sameEmailUser != null) {
        throw new BadRequestException(CnErrorText.EMAIL_ALREADY_EXIST);
      }

      // add the single group user to the user
      const group: CnGroupSingleUser = new CnGroupSingleUser();
      group.label = user.fullname;
      group.type = CnGroupType.SINGLE_USER;
      group.user = user;
      group.createdBy = user;
      group.lastModifiedBy = user;
      user.ownGroup = group;

      // hash the user password
      user.password = await this.hashPassword(user.password);

      const newUser: CnUser = await entityManager.save(user);

      // await mail send to include it in transaction
      await this.sendSignupEmail(newUser);
      return newUser;
    });
  }

  private sendSignupEmail(user: CnUser): Promise<boolean> {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, this.oneDay);

    // get activation API url with the token
    const activationUrl: string = this.configService.getApiUrl() + this.controllerRoute + '/activation/' + token;

    return this.mailService.sendMailToUser(CnMailTemplate.signup, user,
      {user: user, activationUrl: activationUrl});
  }

  async activateAccount(token: string): Promise<void> {
    const user: CnUser = await this.decodeUserToken(token);

    if (user.status !== CmUserStatus.WAITING_FOR_EMAIL) {
      throw new BadRequestException(CnErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    // update the user status
    user.status = CmUserStatus.WAITING_FOR_ADMIN;
    await this.usersService.update(user);
  }

  async unlockAccount(token: string): Promise<void> {
    const user: CnUser = await this.decodeUserToken(token);

    user.failedLoginCount = 0;
    await this.usersService.update(user);
  }


  async passwordForgotten(email: string): Promise<void> {
    const user: CnUser = await this.usersService.findByEmail(email);

    if (user != null) {
      // send mail asynchronously
      this.sendPasswordForgottenMail(user);
    }
  }

  private sendPasswordForgottenMail(user: CnUser): void {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, this.oneDay);

    // get activation API url with the token
    const passwordForgottenLink: string = this.configService.getWebsiteURL() + 'reset-password/' + token;

    // send mail asynchronously
    this.mailService.sendMailToUser(CnMailTemplate.password_forgotten, user,
      {user: user, passwordForgottenLink: passwordForgottenLink}).then();
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user: CnUser = await this.decodeUserToken(token);

    // hash the user password
    user.password = await this.hashPassword(password);

    // save the new password
    await this.usersService.update(user);
  }

  sendAccountLockedMail(user: CnUser, expireIn: number, failedLoginLock: number): void {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, expireIn);

    // get unlock API url with the token
    const unlockUrl: string = this.configService.getApiUrl() + this.controllerRoute + '/unlock/' + token;

    // send mail asynchronously
    this.mailService.sendMailToUser(CnMailTemplate.account_locked, user,
      {user: user, failedLoginLocked: failedLoginLock, unlockUrl: unlockUrl}).then();
  }

  /**
   * encode a token with UserTokenPayload
   */
  private encodeUserToken(userId: string, expiresIn: number): string {
    // generate the activation token
    const payload: CnUserTokenPayload = {id: userId};
    return BlTokenHelper.encodeToken(this.configService.getOtherJwtSecret(), payload, expiresIn);
  }

  /**
   * Decode and check the UserTokenPayload and return the user
   */
  private async decodeUserToken(token: string): Promise<CnUser> {
    let payload: CnUserTokenPayload;
    try {
      payload = await BlTokenHelper.decodeToken(this.configService.getOtherJwtSecret(), token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BadRequestException(CnErrorText.LINK_EXPIRED);
      }
      throw new BadRequestException(CnErrorText.INVALID_LINK);
    }

    if (payload == null || payload.id == null) {
      throw new BadRequestException(CnErrorText.INVALID_LINK);
    }

    const user: CnUser = await this.usersService.findOne(payload.id);

    if (user == null) {
      throw new BadRequestException(CnErrorText.INVALID_LINK);
    }

    return user;
  }

  private hashPassword(password: string): Promise<string> {
    return hash(password);
  }

  public async adminActivation(userId: string): Promise<CnUser> {
    const user: CnUser = await this.usersService.findByIdAndCheck(userId);

    if (user.status !== CmUserStatus.WAITING_FOR_ADMIN) {
      throw new BadRequestException(CnErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    user.status = CmUserStatus.INCOMPLETE;
    return this.usersService.update(user);
  }

  findUsersToAdminActivate(): Promise<CnUser[]> {
    return this.repository.find({
      where: {status: CmUserStatus.WAITING_FOR_ADMIN},
      order: {createdAt: 'DESC' as any}
    });
  }

}
