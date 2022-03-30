import {Body, Controller, Get, HttpException, Param, ParseUUIDPipe, Post, Res} from '@nestjs/common';
import {Response} from 'express';
import {CnUser} from '../cn-user.entity';
import {CnUserAccountsService} from './cn-user-accounts.service';
import {CnFrontService} from '../../cn-core/services/cn-front.service';
import {CnUserCategories} from '../../cn-core/decorators/cn-user-category.decorator';
import {CmUserCategory} from '@monorepo/common-model';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';

/**
 * Open routes to manage users' accounts
 */
@Controller('accounts')
export class CnUserAccountsController {

  constructor(private userAccountsService: CnUserAccountsService,
              private frontService: CnFrontService) {
  }

  @BlPublic()
  @Post()
  create(@Body(new BlParsePipe(CnUser)) entity: CnUser): Promise<CnUser> {
    return this.userAccountsService.signup(entity);
  }

  /**
   * Open route for account activation with link sent by mail
   */
  @BlPublic()
  @Get('activation/:token')
  async accountActivation(@Param('token') token: string, @Res() response: Response): Promise<void> {
    const loginUrl = this.frontService.getLoginUrl();

    try {
      await this.userAccountsService.activateAccount(token);
    } catch (e) {
      if (e instanceof HttpException) {
        response.redirect(`${loginUrl}?error=${e.message}`);
      } else {
        response.redirect(`${loginUrl}?error=server_error`);
      }
      return;
    }

    response.redirect(`${loginUrl}?success=account_activated`);
  }

  /**
   * Open route to unlock account with link sent by mail
   */
  @BlPublic()
  @Get('unlock/:token')
  async unlockAccount(@Param('token') token: string, @Res() response: Response): Promise<void> {
    const loginUrl = this.frontService.getLoginUrl();

    try {
      await this.userAccountsService.unlockAccount(token);
    } catch (e) {
      if (e instanceof HttpException) {
        response.redirect(`${loginUrl}?error=${e.message}`);
      } else {
        response.redirect(`${loginUrl}?error=server_error`);
      }
      return;
    }

    response.redirect(`${loginUrl}?success=account_unlocked`);
  }

  /**
   * Open route to send an email with link to reset password
   */
  @BlPublic()
  @Post('password-forgotten')
  async passwordForgotten(@Body() body: { email: string }): Promise<void> {
    await this.userAccountsService.passwordForgotten(body.email);
  }

  /**
   * Open route to reset password with link
   */
  @BlPublic()
  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string,
                      @Body() body: { password: string }): Promise<void> {
    await this.userAccountsService.resetPassword(token, body.password);
  }

  /**
   * Route to set the admin activate a user.
   * Only accessible by admins
   */
  @CnUserCategories(CmUserCategory.ADMIN)
  @Post('adminActivation/:userId')
  async adminActivation(@Param('userId', ParseUUIDPipe) userId: string): Promise<CnUser> {
    return this.userAccountsService.adminActivation(userId);
  }

  /**
   * Get the list of users to need to be activated by an admin
   */
  @CnUserCategories(CmUserCategory.ADMIN)
  @Get('usersToAdminActivate')
  findUsersToAdminActivate(): Promise<CnUser[]> {
    return this.userAccountsService.findUsersToAdminActivate();
  }


}
