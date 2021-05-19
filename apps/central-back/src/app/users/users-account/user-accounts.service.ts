import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {User} from '../user.entity';
import {UserTokenPayload} from '../../core/model/config/user-token.class';
import {MailTemplate} from '../../core/model/config/mail-config.class';
import {InjectRepository} from '@nestjs/typeorm';
import {getManager, Repository} from 'typeorm';
import {CoreConfigService} from '../../core/modules/core-config/core-config.service';
import {MailService} from '../../core/services/mail/mail.service';
import {TokenService} from '../../core/services/token/token.service';
import {UsersService} from '../users.service';
import {ErrorText} from '../../core/model/config/error-text.class';
import {GroupSingleUser} from '../../groups/group.entity';
import {GroupType} from '../../groups/group-type.enum';
import {TokenExpiredError} from 'jsonwebtoken';
import * as argon2 from 'argon2';
import {CmUserCategory, CmUserStatus} from '@monorepo/common-model';

/**
 * Service to handle users' account (signup, mail validation, password forgotten, reset password...)
 */
@Injectable()
export class UserAccountsService {

  private readonly oneDay: number = 86400;
  private readonly controllerRoute: string = 'accounts';

  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    private configService: CoreConfigService,
    private mailService: MailService,
    private tokenService: TokenService,
    private usersService: UsersService) {
  }

  async signup(user: User): Promise<User> {
    return await getManager().transaction(async entityManager => {

      if (user.category === CmUserCategory.ADMIN) {
        throw new UnauthorizedException();
      }

      const sameEmailUser: User = await this.usersService.findByEmail(user.email);
      if (sameEmailUser != null) {
        throw new BadRequestException(ErrorText.EMAIL_ALREADY_EXIST);
      }

      // add the single group user to the user
      const group: GroupSingleUser = new GroupSingleUser();
      group.label = user.fullname;
      group.type = GroupType.SINGLE_USER;
      group.user = user;
      group.createdBy = user;
      group.lastModifiedBy = user;
      user.ownGroup = group;

      // hash the user password
      user.password = await this.hashPassword(user.password);

      const newUser: User = await entityManager.save(user);

      // await mail send to include it in transaction
      await this.sendSignupEmail(newUser);
      return newUser;
    });
  }

  private sendSignupEmail(user: User): Promise<boolean> {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, this.oneDay);

    // get activation API url with the token
    const activationUrl: string = this.configService.getApiUrl() + this.controllerRoute + '/activation/' + token;

    return this.mailService.sendMailToUser(MailTemplate.signup, user,
      {user: user, activationUrl: activationUrl});
  }

  async activateAccount(token: string): Promise<void> {
    const user: User = await this.decodeUserToken(token);

    if (user.status !== CmUserStatus.WAITING_FOR_EMAIL) {
      throw new BadRequestException(ErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    // update the user status
    user.status = CmUserStatus.WAITING_FOR_ADMIN;
    await this.usersService.update(user);
  }

  async unlockAccount(token: string): Promise<void> {
    const user: User = await this.decodeUserToken(token);

    user.failedLoginCount = 0;
    await this.usersService.update(user);
  }


  async passwordForgotten(email: string): Promise<void> {
    const user: User = await this.usersService.findByEmail(email);

    if (user != null) {
      // send mail asynchronously
      this.sendPasswordForgottenMail(user);
    }
  }

  private sendPasswordForgottenMail(user: User): void {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, this.oneDay);

    // get activation API url with the token
    const passwordForgottenLink: string = this.configService.getWebsiteURL() + 'reset-password/' + token;

    // send mail asynchronously
    this.mailService.sendMailToUser(MailTemplate.password_forgotten, user,
      {user: user, passwordForgottenLink: passwordForgottenLink}).then();
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user: User = await this.decodeUserToken(token);

    // hash the user password
    user.password = await this.hashPassword(password);

    // save the new password
    await this.usersService.update(user);
  }

  sendAccountLockedMail(user: User, expireIn: number, failedLoginLock: number): void {
    // generate the activation token
    const token: string = this.encodeUserToken(user.id, expireIn);

    // get unlock API url with the token
    const unlockUrl: string = this.configService.getApiUrl() + this.controllerRoute + '/unlock/' + token;

    // send mail asynchronously
    this.mailService.sendMailToUser(MailTemplate.account_locked, user,
      {user: user, failedLoginLocked: failedLoginLock, unlockUrl: unlockUrl}).then();
  }

  /**
   * encode a token with UserTokenPayload
   */
  private encodeUserToken(userId: string, expiresIn: number): string {
    // generate the activation token
    const payload: UserTokenPayload = {id: userId};
    return this.tokenService.encodeToken(payload, expiresIn);
  }

  /**
   * Decode and check the UserTokenPayload and return the user
   */
  private async decodeUserToken(token: string): Promise<User> {
    let payload: UserTokenPayload;
    try {
      payload = await this.tokenService.decodeToken(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new BadRequestException(ErrorText.LINK_EXPIRED);
      }
      throw new BadRequestException(ErrorText.INVALID_LINK);
    }

    if (payload == null || payload.id == null) {
      throw new BadRequestException(ErrorText.INVALID_LINK);
    }

    const user: User = await this.usersService.findOne(payload.id);

    if (user == null) {
      throw new BadRequestException(ErrorText.INVALID_LINK);
    }

    return user;
  }

  private hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  public async adminActivation(userId: string): Promise<User> {
    const user: User = await this.usersService.findByIdAndCheck(userId);

    if (user.status !== CmUserStatus.WAITING_FOR_ADMIN) {
      throw new BadRequestException(ErrorText.ACCOUNT_ALREADY_ACTIVATED);
    }

    user.status = CmUserStatus.INCOMPLETE;
    return this.usersService.update(user);
  }

  findUsersToAdminActivate(): Promise<User[]> {
    return this.repository.find({
      where: {status: CmUserStatus.WAITING_FOR_ADMIN},
      order: {createdAt: 'DESC'}
    });
  }

}
