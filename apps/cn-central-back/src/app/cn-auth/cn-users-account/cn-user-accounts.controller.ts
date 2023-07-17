import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Res
} from '@nestjs/common';
import {Response} from 'express';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnUserAccountsService} from './cn-user-accounts.service';
import {CnFrontService} from '../../cn-core/services/cn-front.service';
import {CnUserCategories} from '../../cn-core/decorators/cn-user-category.decorator';
import {BlParsePipe, BlPublicSecure, BlUserCategory} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';

/**
 * Open routes to manage users' accounts
 */
@Controller('accounts')
export class CnUserAccountsController {

  constructor(private userAccountsService: CnUserAccountsService,
              private frontService: CnFrontService) {
  }

  @BlPublicSecure()
  @Post()
  create(@Body(new BlParsePipe(CnUser)) entity: CnUser): Promise<CnUser> {
    return this.userAccountsService.signup(entity);
  }

  /**
   * Open route for account activation with link sent by mail
   */
  @BlPublicSecure()
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
  @BlPublicSecure()
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
  @BlPublicSecure()
  @Post('password-forgotten')
  async passwordForgotten(@Body() body: { email: string }): Promise<void> {
    await this.userAccountsService.passwordForgotten(body.email);
  }

  /**
   * Open route to reset password with link
   */
  @BlPublicSecure()
  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string,
                      @Body() body: { password: string }): Promise<void> {
    await this.userAccountsService.resetPassword(token, body.password);
  }

  /**
   * Route to set the admin activate a user.
   * Only accessible by admins
   */
  @CnUserCategories(BlUserCategory.ADMIN)
  @Post('adminActivation/:userId')
  async adminActivation(@Param('userId', ParseUUIDPipe) userId: string): Promise<CnUser> {
    return this.userAccountsService.adminActivation(userId);
  }

  /**
   * Get the list of users to need to be activated by an admin
   */
  @CnUserCategories(BlUserCategory.ADMIN)
  @Get('usersToAdminActivate')
  findUsersToAdminActivate(@Query('page', ParseIntPipe) page: number,
                           @Query('size', ParseIntPipe) size: number): Promise<ClPage<CnUser>> {
    return this.userAccountsService.findUsersToAdminActivate(page, size);
  }


  ///////////////////////// SPACE INVITATION /////////////////////////
  /**
   * Method called when the user create his account by joining a space
   * @param invitCode
   * @param entity
   */
  @BlPublicSecure()
  @Post('sign-up-in-space/:invitCode')
  public async createUserAndJoinSpace(@Param('invitCode') invitCode: string,
                                      @Body(new BlParsePipe(CnUser)) entity: CnUser): Promise<CnUser> {
    return this.userAccountsService.createUserAndJoinSpace(invitCode, entity);
  }


}
