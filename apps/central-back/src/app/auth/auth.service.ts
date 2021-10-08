import {Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import {TokenUser} from '../core/model/config/token-user.class';
import {User} from '../users/user.entity';
import {CoreConfigService} from '../core/modules/core-config/core-config.service';
import {ErrorText} from '../core/model/config/error-text.class';
import {TokenService} from '../core/services/token/token.service';
import {UserAccountsService} from '../users/users-account/user-accounts.service';
import {ClDateHelper} from '@monorepo/core-lib';
import {CmCredentials, CmUserCategory, CmUserStatus} from '@monorepo/common-model';
import {BlMailService} from '@monorepo/back-core-lib';

@Injectable()
export class AuthService {

  private readonly failedLoginLock: number;

  private readonly activationLinkValidity: number = 86400 * 7;


  constructor(private usersService: UsersService,
              private jwtService: JwtService,
              private configService: CoreConfigService,
              private mailService: BlMailService,
              private tokenService: TokenService,
              private userAccountsService: UserAccountsService) {
    this.failedLoginLock = configService.getFailedLoginLock();
  }

  async login(credentials: CmCredentials): Promise<string> {
    const user = await this.checkCredentialsAndUser(credentials);

    return this.generateToken(user);
  }

  async checkCredentialsWithRole(category: CmUserCategory, credentials: CmCredentials): Promise<boolean> {
    const user = await this.checkCredentialsAndUser(credentials);

    return user.category === category;
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
      this.incrementFailedLoginCount(user);

      // check if user is locked
      if (user.failedLoginCount >= this.failedLoginLock) {
        this.userAccountsService.sendAccountLockedMail(user, this.activationLinkValidity, this.failedLoginLock);
        throw new UnauthorizedException(ErrorText.USER_LOCKED);
      } else {
        throw new UnauthorizedException(ErrorText.WRONG_CREDENTIALS);
      }
    }

    // login successful
    if (user.failedLoginCount >= 0) {
      this.resetFailedLoginCount(user);
    }

    return user;
  }

  private generateToken(user: User): string {
    // set the userId and email in the token
    const payload: TokenUser = {sub: user.id, email: user.email};
    return this.jwtService.sign(payload);
  }

  /**
   * Update the failed login attempt count in the DB and set
   * the last attempt date
   * @param user
   * @private
   */
  private incrementFailedLoginCount(user: User): void {
    user.failedLoginCount++;
    user.lastLoginAttempt = ClDateHelper.getDate();

    this.usersService.update(user);
  }

  /**
   * reset the failedLoginCount to 0
   * @param user
   * @private
   */
  private resetFailedLoginCount(user: User): void {
    user.failedLoginCount = 0;
    this.usersService.update(user);
  }
}
