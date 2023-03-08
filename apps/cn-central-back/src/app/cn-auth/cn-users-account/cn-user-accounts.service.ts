import {Injectable, Logger} from '@nestjs/common';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnMailTemplate} from '../../cn-core/model/config/cn-mail-template.class';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, Repository} from 'typeorm';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnUsersService} from '../../cn-users/cn-users.service';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {TokenExpiredError} from 'jsonwebtoken';
import {hash} from 'argon2';
import {CmUserCategory, CmUserStatus} from '@monorepo/common-model';
import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlMailService,
  BlTokenHelper,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {CnUserTokenPayload} from '../../cn-core/model/config/cn-config.class';
import {CnFrontService} from '../../cn-core/services/cn-front.service';
import {ClPage} from '@monorepo/core-lib';
import {CnSpaceAggregateService} from '../../cn-spaces/cn-space-aggregate.service';
import {CnGroupsService} from '../../cn-groups/cn-groups.service';
import {CnNotificationService, CnNotificationType} from '../../cn-notification/cn-notification.service';

/**
 * Service to handle users' account (signup, mail validation, password forgotten, reset password...)
 */
@Injectable()
export class CnUserAccountsService extends BlAbstractPaginatedService<CnUser> {

  private readonly oneDay: number = 86400;
  private readonly controllerRoute: string = '/accounts';

  private readonly logger = new Logger(CnUserAccountsService.name);

  constructor(@InjectRepository(CnUser) private repository: Repository<CnUser>,
              private configService: CnCoreConfigService,
              private mailService: BlMailService,
              private usersService: CnUsersService,
              private datasource: DataSource,
              private frontService: CnFrontService,
              private spaceAggregateService: CnSpaceAggregateService,
              private groupService: CnGroupsService,
              private notificationService: CnNotificationService) {
    super(repository, CnUser);
  }

  async signup(user: CnUser): Promise<CnUser> {
    return await this.datasource.transaction(async entityManager => {
      const newUser: CnUser = await this.createAccount(user, CmUserStatus.WAITING_FOR_EMAIL, entityManager);

      // await mail send to include it in transaction
      await this.sendSignupEmail(newUser);
      return newUser;
    });
  }

  public async createAccount(user: CnUser, status: CmUserStatus, entityManager: EntityManager): Promise<CnUser> {
    if (user.category === CmUserCategory.ADMIN) {
      throw new BlUnauthorizedException();
    }

    const sameEmailUser: CnUser = await this.usersService.findByEmail(user.email);
    if (sameEmailUser != null) {
      throw new BlBadRequestException(CnErrorText.EMAIL_ALREADY_EXIST);
    }

    // hash the user password
    user.password = await this.hashPassword(user.password);
    user.status = status;

    // create the user and his group
    const dbUser = await entityManager.save(user);

    // create the user own group
    await this.groupService.createOwnGroup(user, entityManager);

    // send notification to gencovery user to warn him that a new user has been created
    this.sendCreateAccountNotification(dbUser).catch(
      error => this.logger.error('Error while sending create account notification: ' + error)
    );

    this.usersService.sendUserToTransport(dbUser);

    return dbUser;
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
      throw new BlBadRequestException(CnErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    // update the user status
    user.status = CmUserStatus.INCOMPLETE;
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
    const passwordForgottenLink: string = this.frontService.getBaseWebsiteURL() + '/reset-password/' + token;

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
        throw new BlBadRequestException(CnErrorText.LINK_EXPIRED);
      }
      throw new BlBadRequestException(CnErrorText.INVALID_LINK);
    }

    if (payload == null || payload.id == null) {
      throw new BlBadRequestException(CnErrorText.INVALID_LINK);
    }

    const user: CnUser = await this.usersService.findOne(payload.id);

    if (user == null) {
      throw new BlBadRequestException(CnErrorText.INVALID_LINK);
    }

    return user;
  }

  private hashPassword(password: string): Promise<string> {
    return hash(password);
  }

  public async adminActivation(userId: string): Promise<CnUser> {
    const user: CnUser = await this.usersService.findByIdAndCheck(userId);

    if (user.status !== CmUserStatus.WAITING_FOR_ADMIN) {
      throw new BlBadRequestException(CnErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    user.status = CmUserStatus.INCOMPLETE;
    return this.usersService.update(user);
  }

  findUsersToAdminActivate(page: number, size: number): Promise<ClPage<CnUser>> {
    return this.findPaginated(page, size, {
      where: {status: CmUserStatus.WAITING_FOR_ADMIN},
      order: {createdAt: 'DESC' as any}
    });
  }

  /**
   * Method called when a user accepted an invitation and created an account
   */
  public async createUserAndJoinSpace(invitCode: string, user: CnUser): Promise<CnUser> {
    const invitation = await this.spaceAggregateService.findInvitationByCodeAndCheckValidity(invitCode);

    return await this.datasource.transaction(async (transaction) => {
      // create the user with an active but incomplete profile
      const userDb = await this.createAccount(user, CmUserStatus.INCOMPLETE, transaction);

      return await this.spaceAggregateService.acceptInvitation(invitation, userDb, transaction);
    });
  }

  /**
   * Send notification to admin when a new user is created
   * @param user
   * @param spaceId
   * @private
   */
  private async sendCreateAccountNotification(user: CnUser): Promise<void> {
    const adminUserMails = this.configService.newUserNotifReceiver();

    for (const adminUserMail of adminUserMails) {
      const adminUser = await this.usersService.findByEmail(adminUserMail);

      if (adminUser == null) continue;
      await this.notificationService.createNotification({
        createdBy: user,
        objectType: CnNotificationType.NEW_USER,
        objectId: user.id,
        user: adminUser,
        text: `New user : ${user.firstname} ${user.lastname}`,
        text2: user.email,
        link: CnFrontService.getAdminUsersRoute()
      });
    }
  }

}
