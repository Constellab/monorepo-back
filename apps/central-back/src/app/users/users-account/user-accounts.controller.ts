import {Body, Controller, Get, HttpException, Param, ParseUUIDPipe, Post, Res} from '@nestjs/common';
import {Public} from '../../core/decorators/public.decorator';
import {Response} from 'express';
import {ParsePipe} from '../../core/pipes/parse.pipe';
import {User} from '../user.entity';
import {UserAccountsService} from './user-accounts.service';
import {FrontService} from '../../core/services/front/front.service';
import {UserCategories} from '../../core/decorators/user-category.decorator';
import {CmUserCategory} from '@monorepo/common-model';

/**
 * Open routes to manage users' accounts
 */
@Controller('accounts')
export class UserAccountsController {

  constructor(private userAccountsService: UserAccountsService,
              private frontService: FrontService) {
  }

  @Public()
  @Post()
  create(@Body(new ParsePipe(User)) entity: User): Promise<User> {
    return this.userAccountsService.signup(entity);
  }

  /**
   * Open route for account activation with link sent by mail
   */
  @Public()
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
  @Public()
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
  @Public()
  @Post('password-forgotten')
  async passwordForgotten(@Body() body: { email: string }): Promise<void> {
    await this.userAccountsService.passwordForgotten(body.email);
  }

  /**
   * Open route to reset password with link
   */
  @Public()
  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string,
                      @Body() body: { password: string }): Promise<void> {
    await this.userAccountsService.resetPassword(token, body.password);
  }

  /**
   * Route to set the admin activate a user.
   * Only accessible by admins
   */
  @UserCategories(CmUserCategory.ADMIN)
  @Post('adminActivation/:userId')
  async adminActivation(@Param('userId', ParseUUIDPipe) userId: string): Promise<User> {
    return this.userAccountsService.adminActivation(userId);
  }

  /**
   * Get the list of users to need to be activated by an admin
   */
  @UserCategories(CmUserCategory.ADMIN)
  @Get('usersToAdminActivate')
  findUsersToAdminActivate(): Promise<User[]> {
    return this.userAccountsService.findUsersToAdminActivate();
  }


}
