import { BlParsePipe, BlPublicSecure } from '@monorepo/back-core-lib';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { CnFrontService } from '../../cn-core/services/cn-front.service';
import { CnCreateUserDto, CnUserUpdateLicenseDTO } from '../cn-user.dto';
import { CnUser, CnUserEntity } from '../cn-user.entity';
import { CnUserAccountsService } from './cn-user-accounts.service';

/**
 * Open routes to manage users' accounts
 */
@Controller('accounts')
export class CnUserAccountsController {
  constructor(
    private userAccountsService: CnUserAccountsService,
    private frontService: CnFrontService
  ) {}

  @BlPublicSecure()
  @Post()
  create(@Body() entity: CnCreateUserDto): Promise<CnUser> {
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
  async resetPassword(@Param('token') token: string, @Body() body: { password: string }): Promise<void> {
    await this.userAccountsService.resetPassword(token, body.password);
  }

  @Put(':userId/lock')
  lockUser(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnUser> {
    return this.userAccountsService.lockUser(userId);
  }

  @Put(':userId/unlock')
  unlockUser(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnUser> {
    return this.userAccountsService.unlockUser(userId);
  }

  @Put(':userId/resend-activation-mail')
  resendSignupEmail(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.userAccountsService.resendSignupEmail(userId);
  }

  @Put(':userId/license')
  updateLicense(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() licenseDTO: CnUserUpdateLicenseDTO
  ): Promise<CnUser> {
    return this.userAccountsService.updateUserLicense(userId, licenseDTO);
  }

  @Delete(':userId')
  deleteUser(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.userAccountsService.deleteUser(userId);
  }

  ///////////////////////// SPACE INVITATION /////////////////////////
  /**
   * Method called when the user create his account by joining a space
   * @param invitCode
   * @param entity
   */
  @BlPublicSecure()
  @Post('sign-up-in-space/:invitCode')
  public async createUserAndJoinSpace(
    @Param('invitCode') invitCode: string,
    @Body(new BlParsePipe(CnUserEntity)) entity: CnUser
  ): Promise<CnUser> {
    return this.userAccountsService.createUserAndJoinSpace(invitCode, entity);
  }
}
