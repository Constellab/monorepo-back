import { BlMailService } from '@monorepo/back-core-lib';
import { ClSupportedLanguage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';

import { CnMailTemplate } from '../cn-core/model/config/cn-mail-template.class';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnFrontService } from '../cn-core/services/cn-front.service';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnRequestNewLicensesDto } from './cn-space.dto';
import { CnSpaceInvit } from './cn-space-invit.entity';

/**
 * Service that handle mail for spaces
 */
@Injectable()
export class CnSpacesMailService {
  constructor(
    private mailService: BlMailService,
    private configService: CnCoreConfigService,
    private frontService: CnFrontService
  ) {}

  public async requestNewLicenses(
    request: CnRequestNewLicensesDto,
    userInfo: CnUserSpaceInfo
  ): Promise<void> {
    const data = {
      user: {
        firstname: userInfo.user.firstname,
        lastname: userInfo.user.lastname,
        email: userInfo.user,
      },
      spaceName: userInfo.space.name,
      nbLicenses: request.nbLicenses,
      text: request.text,
    };

    const receiver = this.configService.getCustomerSuccessMail();
    await this.mailService.sendMailAndCheck({
      templateName: CnMailTemplate.request_new_licenses,
      recipients: receiver,
      lang: userInfo.user.lang,
      data: data,
    });
  }

  public async sendInvitationMail(
    invit: CnSpaceInvit,
    user: CnUser,
    validityInDays: number
  ): Promise<boolean> {
    let template: string;
    let lang: ClSupportedLanguage;
    const data = {
      admin: {
        firstname: invit.createdBy.firstname,
        lastname: invit.createdBy.lastname,
      },
      validityInDays: validityInDays,
      url: await this.frontService.getSignupSpaceUrl(invit.space.id, invit.code),
      user: null as any,
      spaceName: invit.space.name,
    };

    // if the user already exists
    if (user) {
      template = CnMailTemplate.space_invit_existing_user;
      // add info about the user
      data.user = {
        firstname: user.firstname,
        lastname: user.lastname,
      };
      // use lang of the destination user
      lang = user.lang;
    } else {
      template = CnMailTemplate.space_invit_new_user;
      // user lang of the admin that sent the invitation
      lang = invit.createdBy.lang;
    }

    return this.mailService.sendMail({
      templateName: template,
      recipients: invit.userMail,
      lang,
      data,
    });
  }
}
