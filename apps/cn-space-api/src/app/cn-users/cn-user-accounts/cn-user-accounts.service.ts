import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlHttpException,
  BlMailService,
  BlTokenHelper,
  BlUnauthorizedException,
  BlUserCategory,
  BlUserStatus,
} from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
import { TokenExpiredError } from 'jsonwebtoken';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { CnUserTokenPayload } from '../../cn-core/model/config/cn-config.class';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnMailTemplate } from '../../cn-core/model/config/cn-mail-template.class';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnCaptchaService } from '../../cn-core/services/cn-captcha.service';
import { CnFrontService } from '../../cn-core/services/cn-front.service';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnGroupsService } from '../../cn-groups/cn-groups.service';
import { CnSpaceAggregateService } from '../../cn-spaces/cn-space-aggregate.service';
import { CnSupportService } from '../../cn-support/cn-support.service';
import { CnCreateUserDto, CnUserUpdateLicenseDTO } from '../cn-user.dto';
import { CnUser, CnUserEntity, CnUserLicense } from '../cn-user.entity';
import { CnUsersService } from '../cn-users.service';
import { CN_USER_ACCOUNT_EVENT_NAME, CnUserAccountEvent } from './cn-user-account.event';

/**
 * Service to handle users' account (signup, mail validation, password forgotten, reset password...)
 */
@Injectable()
export class CnUserAccountsService extends BlAbstractPaginatedService<CnUser> {
  private readonly oneDay: number = 86400;
  private readonly controllerRoute: string = '/accounts';

  private readonly logger = new Logger(CnUserAccountsService.name);

  private readonly userLockMailActivation: number = 86400 * 7;

  constructor(
    @InjectRepository(CnUserEntity) private repository: Repository<CnUser>,
    private configService: CnCoreConfigService,
    private mailService: BlMailService,
    private usersService: CnUsersService,
    private datasource: DataSource,
    private frontService: CnFrontService,
    private spaceAggregateService: CnSpaceAggregateService,
    private groupService: CnGroupsService,
    private captchaService: CnCaptchaService,
    private supportService: CnSupportService,
    private eventEmitter: EventEmitter2
  ) {
    super(repository, CnUserEntity);
  }

  async signup(createUser: CnCreateUserDto): Promise<CnUser> {
    const captchaValid = await this.captchaService.validateCaptcha(createUser.captcha, 'signup');

    if (!captchaValid) {
      throw new BlBadRequestException(CnErrorText.INVALID_CAPTCHA);
    }

    try {
      return await this.datasource.transaction(async (entityManager) => {
        const user = new CnUserEntity();
        user.firstname = createUser.firstname;
        user.lastname = createUser.lastname;
        user.password = createUser.password;
        user.email = createUser.email.toLowerCase();
        user.phone = createUser.phone;
        user.license = CnUserLicense.FREE;

        const newUser: CnUser = await this.createAccount(user, BlUserStatus.WAITING_FOR_EMAIL, entityManager);

        // await mail send to include it in transaction
        await this.sendSignupEmail(newUser);

        this.emitUserAccountEvent({ type: 'CREATE_USER', user: newUser });

        return newUser;
      });
    } catch (e: any) {
      if (e instanceof BlHttpException) {
        throw e;
      }
      const message =
        `Error while creating account for user ${createUser.firstname} ${createUser.lastname} ` +
        +`${createUser.email} : ${e}`;
      this.supportService
        .sendMailFromString(message, 'Error while creating account')
        .catch((error) => this.logger.error('Error while sending error mail: ' + error));

      throw new BlBadRequestException(CnErrorText.ACCOUNT_CREATION_ERROR);
    }
  }

  public async createAccount(
    user: CnUser,
    status: BlUserStatus,
    entityManager: EntityManager
  ): Promise<CnUser> {
    user.category = BlUserCategory.USER;

    const sameEmailUser: CnUser = await this.usersService.findByEmail(user.email);
    if (sameEmailUser != null) {
      // if a user not validated with the same email exist, no error, return the user
      if (sameEmailUser.status === BlUserStatus.WAITING_FOR_EMAIL) {
        return sameEmailUser;
      }

      throw new BlBadRequestException(CnErrorText.EMAIL_ALREADY_EXIST);
    }

    // hash the user password
    user.password = await this.hashPassword(user.password);
    user.status = status;

    // create the user and his group
    const dbUser = await entityManager.save(user);

    // create the user own group
    await this.groupService.createOwnGroup(user, entityManager);

    // create the user personal space
    await this.spaceAggregateService.createPersonalSpace(dbUser, entityManager);

    return dbUser;
  }

  public async resendSignupEmail(id: string): Promise<void> {
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();

    const user = await this.usersService.findByIdAndCheck(id);

    if (user.status !== BlUserStatus.WAITING_FOR_EMAIL) {
      throw new BlBadRequestException(CnErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    await this.sendSignupEmail(user);
  }

  private async sendSignupEmail(user: CnUser): Promise<void> {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, this.oneDay);

    // get activation API url with the token
    const activationUrl: string =
      this.configService.getApiUrl() + this.controllerRoute + '/activation/' + token;

    await this.mailService.sendMailToUser(CnMailTemplate.signup, user, {
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
      },
      activationUrl: activationUrl,
    });
  }

  async activateAccount(token: string): Promise<void> {
    const user: CnUser = await this.decodeUserToken(token);

    if (user.status !== BlUserStatus.WAITING_FOR_EMAIL) {
      throw new BlBadRequestException(CnErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    // update the user status
    user.status = BlUserStatus.READY;
    await this.usersService.update(user);
    this.usersService.sendUserToTransport(user);

    this.emitUserAccountEvent({ type: 'ACTIVATE_USER', user });
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
      await this.sendPasswordForgottenMail(user);
    }
  }

  private async sendPasswordForgottenMail(user: CnUser): Promise<void> {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, this.oneDay);

    // get activation API url with the token
    const passwordForgottenLink: string = this.frontService.getBaseWebsiteURL() + '/reset-password/' + token;

    // send mail asynchronously
    await this.mailService.sendMailToUser(CnMailTemplate.password_forgotten, user, {
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
      },
      passwordForgottenLink: passwordForgottenLink,
    });
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

  sendAccountLockedMail(user: CnUser, failedLoginLock: number): void {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, this.userLockMailActivation);

    // get unlock API url with the token
    const unlockUrl: string = this.configService.getApiUrl() + this.controllerRoute + '/unlock/' + token;

    // send mail asynchronously
    this.mailService
      .sendMailToUser(CnMailTemplate.account_locked, user, {
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
        },
        failedLoginLocked: failedLoginLock,
        unlockUrl: unlockUrl,
      })
      .then()
      .catch((error) => this.logger.error('Error while sending account locked mail to : ' + error));
  }

  /**
   * encode a token with UserTokenPayload
   */
  private encodeUserToken(userId: string, expiresIn: number): string {
    // generate the activation token
    const payload: CnUserTokenPayload = { id: userId };
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

      this.emitUserAccountEvent({ type: 'CREATE_USER', user: userDb });
      this.emitUserAccountEvent({ type: 'ACTIVATE_USER', user: userDb });

      return userDb;
    });
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

  public async updateUserLicense(userId: string, licenseDTO: CnUserUpdateLicenseDTO): Promise<CnUser> {
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();

    const user: CnUser = await this.usersService.findByIdAndCheck(userId);

    user.license = licenseDTO.license;

    return this.repository.save(user);
  }

  private emitUserAccountEvent(userEvent: CnUserAccountEvent): void {
    this.eventEmitter.emit(CN_USER_ACCOUNT_EVENT_NAME, userEvent);
  }
}
