import {Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {User} from '../users/user.entity';
import {CoreConfigService} from '../core/modules/core-config/core-config.service';
import {ErrorText} from '../core/model/config/error-text.class';
import {TokenService} from '../core/services/token/token.service';
import {UserAccountsService} from '../users/users-account/user-accounts.service';
import {ClDateHelper} from '@monorepo/core-lib';
import {CmCredentials, CmUserCategory, CmUserStatus} from '@monorepo/common-model';
import {BlJwtService, BlMailService} from '@monorepo/back-core-lib';

@Injectable()
export class AuthService {

  private readonly failedLoginLock: number;

  private readonly activationLinkValidity: number = 86400 * 7;


  constructor(private usersService: UsersService,
              private jwtService: BlJwtService,
              private configService: CoreConfigService,
              private mailService: BlMailService,
              private tokenService: TokenService,
              private userAccountsService: UserAccountsService) {
    this.failedLoginLock = configService.getFailedLoginLock();
  }

  async login(credentials: CmCredentials): Promise<string> {
    const user = await this.checkCredentialsAndUser(credentials);

    return this.jwtService.generateToken(user.id, user.email);
  }

  async checkCredentialsWithRole(category: CmUserCategory, credentials: CmCredentials): Promise<User | null> {
    const user = await this.checkCredentialsAndUser(credentials);

    if (user.category === category) {
      return user;
    }

    return null;
  }

  private async checkCredentialsAndUser(credentials: CmCredentials): Promise<User> {
    const user = await this.usersService.findByEmail(credentials.email);

    // if the email is wrong
    if (user == null) {
      throw new UnauthorizedException(ErrorText.WRONG_CREDENTIALS);
    }

    if (user.status === CmUserStatus.WAITING_FOR_EMAIL) {
      throw new UnauthorizedException(ErrorText.ACCOUNT_NOT_ACTIVATED);
    }

    if (user.status === CmUserStatus.WAITING_FOR_ADMIN) {
      throw new UnauthorizedException(ErrorText.ACCOUNT_NOT_ADMIN_ACTIVATED);
    }

    // check if user is locked
    if (user.failedLoginCount >= this.failedLoginLock) {
      throw new UnauthorizedException(ErrorText.USER_LOCKED);
    }

    if (!await user.comparePassword(credentials.password)) {
      // increment the failed login count
      await this.incrementFailedLoginCount(user);

      // check if user is locked
      if (user.failedLoginCount >= this.failedLoginLock) {
        this.userAccountsService.sendAccountLockedMail(user, this.activationLinkValidity, this.failedLoginLock);
        throw new UnauthorizedException(ErrorText.USER_LOCKED);
      } else {
        throw new UnauthorizedException(ErrorText.WRONG_CREDENTIALS);
      }
    }

    // login successful
    if (user.failedLoginCount > 0) {
      await this.resetFailedLoginCount(user);
    }

    return user;
  }


  /**
   * Update the failed login attempt count in the DB and set
   * the last attempt date
   * @param user
   * @private
   */
  private async incrementFailedLoginCount(user: User): Promise<void> {
    user.failedLoginCount++;
    user.lastLoginAttempt = ClDateHelper.getDate();

    await this.usersService.update(user);
  }

  /**
   * reset the failedLoginCount to 0
   * @param user
   * @private
   */
  private async resetFailedLoginCount(user: User): Promise<void> {
    user.failedLoginCount = 0;
    await this.usersService.update(user);
  }
}
