import { ClPageI } from '@monorepo/core-lib';
import { Body, Controller, Inject, Param, ParseIntPipe, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { BlUnauthorizedException } from '../../exceptions/bl-unauthorized.exception';
import { BlSearchParams } from '../../models/bl-search/bl-search.class';
import { BlParsePipe } from '../../pipes/bl-parse.pipe';
import { BL_MAIL_CAN_GET_MAIL_PROVIDER, BlCurrentUserIsAdmin } from './bl-mail.class';
import { BlMailEntity } from './bl-mail.entity';
import { BlMailEntityService } from './bl-mail-entity.service';
import { BlMailSenderService } from './bl-mail-sender.service';

@Controller('mails')
export class BlMailController {
  constructor(
    private mailEntityService: BlMailEntityService,
    private mailSenderService: BlMailSenderService,
    @Inject(BL_MAIL_CAN_GET_MAIL_PROVIDER) private canGetMails: BlCurrentUserIsAdmin
  ) {}

  @Post('search')
  async searchMails(
    @Body(new BlParsePipe(BlSearchParams)) searchParam: BlSearchParams,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number
  ): Promise<ClPageI<BlMailEntity>> {
    if (!this.canGetMails()) {
      throw new BlUnauthorizedException();
    }
    return this.mailEntityService.search(searchParam, page, size);
  }

  @Post(':id/resend')
  async resendMail(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    if (!this.canGetMails()) {
      throw new BlUnauthorizedException();
    }

    await this.mailSenderService.sendMailSync({ id: id });
  }
}
