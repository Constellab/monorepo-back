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
import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlCaptchaService,
  BlMailService,
  BlTokenHelper,
  BlUnauthorizedException,
  BlUserCategory,
  BlUserStatus
} from '@monorepo/back-core-lib';
import {CnUserTokenPayload} from '../../cn-core/model/config/cn-config.class';
import {CnFrontService} from '../../cn-core/services/cn-front.service';
import {CnSpaceAggregateService} from '../../cn-spaces/cn-space-aggregate.service';
import {CnGroupsService} from '../../cn-groups/cn-groups.service';
import {CnNotificationService} from '../../cn-notification/cn-notification.service';
import {CnCreateUserDto} from '../../cn-users/cn-user.dto';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnActivityEntityType} from '../../cn-activity/cn-activity.entity';

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
              private notificationService: CnNotificationService,
              private captchaService: BlCaptchaService) {
    super(repository, CnUser);
  }

  async signup(createUser: CnCreateUserDto): Promise<CnUser> {

    const captchaValid = await this.captchaService.validateCaptcha(createUser.captcha);

    if (!captchaValid) {
      throw new BlBadRequestException(CnErrorText.INVALID_CAPTCHA);
    }

    return await this.datasource.transaction(async entityManager => {
      const user = new CnUser();
      user.firstname = createUser.firstname;
      user.lastname = createUser.lastname;
      user.email = createUser.email;
      user.password = createUser.password;
      user.category = createUser.category;
      user.phone = createUser.phone;

      const newUser: CnUser = await this.createAccount(user, BlUserStatus.WAITING_FOR_EMAIL, entityManager);

      // await mail send to include it in transaction
      await this.sendSignupEmail(newUser);
      return newUser;
    });
  }

  public async createAccount(user: CnUser, status: BlUserStatus, entityManager: EntityManager): Promise<CnUser> {
    if (user.category === BlUserCategory.ADMIN) {
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

    // create the user personal space
    await this.spaceAggregateService.createPersonalSpace(dbUser, entityManager);

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

    if (user.status !== BlUserStatus.WAITING_FOR_EMAIL) {
      throw new BlBadRequestException(CnErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    // update the user status
    user.status = BlUserStatus.READY;
    await this.usersService.update(user);

    this.onAccountActivated(user);
  }

  /**
   * Actions once the account is activated
   * @param user
   * @private
   */
  private onAccountActivated(user: CnUser): void {
    // send mail asynchronously
    this.sendAccountValidatedMail(user).catch(
      error => this.logger.error('Error while sending account validated mail: ' + error)
    );
  }

  /**
   * Send a welcome mail to the user with doc and info links
   * @param user
   * @private
   */
  private async sendAccountValidatedMail(user: CnUser): Promise<boolean> {
    return this.mailService.sendMailToUser(CnMailTemplate.signup_validated, user, {
      user: user,
      documentationLink: this.frontService.getCommunityProductDocUrl(),
      communityLink: this.configService.getCommunityFrontUrl(),
      contactMail: this.configService.getGencoveryContactMail()
    });
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
      {user: user, passwordForgottenLink: passwordForgottenLink}).then().catch(
      error => this.logger.error('Error while sending password forgotten mail: ' + error)
    );
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user: CnUser = await this.decodeUserToken(token);

    // hash the user password
    user.password = await this.hashPassword(password);
    // reset the failed login count to unlock the account
    user.failedLoginCount = 0;

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
      {user: user, failedLoginLocked: failedLoginLock, unlockUrl: unlockUrl}).then().catch(
      error => this.logger.error('Error while sending account locked mail to : ' + error)
    );
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

  /**
   * Method called when a user accepted an invitation and created an account
   */
  public async createUserAndJoinSpace(invitCode: string, user: CnUser): Promise<CnUser> {
    const invitation = await this.spaceAggregateService.findInvitationByCodeAndCheckValidity(invitCode);

    return await this.datasource.transaction(async (transaction) => {
      // create the user with an active but incomplete profile
      const userDb = await this.createAccount(user, BlUserStatus.READY, transaction);

      await this.spaceAggregateService.acceptInvitation(invitation, userDb, transaction);

      this.onAccountActivated(userDb);

      return userDb;
    });
  }

  /**
   * Send notification to admin when a new user is created
   * @param user
   * @private
   */
  private async sendCreateAccountNotification(user: CnUser): Promise<void> {
    let adminUserMails = this.configService.newUserNotifReceiver();

    if (this.configService.isLocal()) {
      adminUserMails = [];
    }

    for (const adminUserMail of adminUserMails) {
      const adminUser = await this.usersService.findByEmail(adminUserMail);

      if (adminUser == null) continue;
      await this.notificationService.createNotification({
        createdBy: user,
        objectType: CnActivityEntityType.USER,
        objectId: user.id,
        user: adminUser,
        text: `New user : ${user.firstname} ${user.lastname}`,
        text2: user.email,
        link: CnFrontService.getAdminUsersRoute()
      });
    }
  }

  public async lockUser(userId: string): Promise<CnUser> {
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();
    const user: CnUser = await this.usersService.findByIdAndCheck(userId);

    if (user.status === BlUserStatus.LOCKED_BY_ADMIN) {
      throw new BlBadRequestException('User is already locked');
    }

    if (user.status === BlUserStatus.WAITING_FOR_EMAIL) {
      throw new BlBadRequestException('User is not validated');
    }

    user.status = BlUserStatus.LOCKED_BY_ADMIN;
    return this.repository.save(user);
  }

  public async unlockUser(userId: string): Promise<CnUser> {
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();
    const user: CnUser = await this.usersService.findByIdAndCheck(userId);

    if (user.status !== BlUserStatus.LOCKED_BY_ADMIN) {
      throw new BlBadRequestException('User is not locked');
    }

    user.status = BlUserStatus.READY;
    return this.repository.save(user);
  }


}
