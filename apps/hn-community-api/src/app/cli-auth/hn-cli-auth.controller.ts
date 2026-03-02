import { BlPublicSecure } from '@monorepo/back-core-lib';
import { Body, Controller, Param, Post, Put } from '@nestjs/common';

import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnCliAuthService } from './hn-cli-auth.service';

@Controller('cli-auth')
export class HnCliAuthController {
  constructor(private readonly cliAuthService: HnCliAuthService) {}

  @BlPublicSecure()
  @Post('code')
  createCode(): { code: string; authUrl: string } {
    return this.cliAuthService.createCode();
  }

  @Put('validate/:code')
  validateCode(@Param('code') code: string): { message: string } {
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    this.cliAuthService.validateCode(code, user);
    return { message: 'Code validated' };
  }

  @Put('refuse/:code')
  refuseCode(@Param('code') code: string): { message: string } {
    this.cliAuthService.refuseCode(code);
    return { message: 'Code refused' };
  }

  @BlPublicSecure()
  @Post('token')
  exchangeToken(@Body() body: { code: string }): { status: string; token?: string } {
    return this.cliAuthService.exchangeToken(body.code);
  }
}
