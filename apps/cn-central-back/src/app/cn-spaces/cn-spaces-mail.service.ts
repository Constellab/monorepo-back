import {Injectable} from '@nestjs/common';
import {BlMailService} from '@monorepo/back-core-lib';
import {CnRequestNewLicensesDto} from './cn-space.dto';
import {CnUserSpaceInfo} from '../cn-users/cn-user.dto';
import {CnMailTemplate} from '../cn-core/model/config/cn-mail-template.class';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnFrontService} from '../cn-core/services/cn-front.service';

/**
 * Service that handle mail for spaces
 */
@Injectable()
export class CnSpacesMailService {

  constructor(private mailService: BlMailService,
              private configService: CnCoreConfigService,
              private frontService: CnFrontService) {
  }


  public async requestNewLicenses(request: CnRequestNewLicensesDto, userInfo: CnUserSpaceInfo): Promise<void> {
    const data = {
      user: userInfo.user,
      spaceName: userInfo.space.name,
      nbLicenses: request.nbLicenses,
      text: request.text,
    };

    const receiver = this.configService.getGencoveryContactMail();
    await this.mailService.sendMail(CnMailTemplate.request_new_licenses, receiver,
      userInfo.user.lang, data);
  }


  public async sendInvitationMail(invit: CnSpaceInvit, user: CnUser, validityInDays: number): Promise<boolean> {
    let template: string;
    let lang: ClSupportedLanguage;
    const data = {
      admin: invit.createdBy,
      validityInDays: validityInDays,
      url: this.frontService.getSignupSpaceUrl(invit.space.domain, invit.code),
      user: null as CnUser,
      spaceName: invit.space.name,
    };

    // if the user already exists
    if (user) {
      template = CnMailTemplate.space_invit_existing_user;
      // add info about the user
      data.user = user;
      // use lang of the destination user
      lang = user.lang;
    } else {
      template = CnMailTemplate.space_invit_new_user;
      // user lang of the admin that sent the invitation
      lang = invit.createdBy.lang;
    }

    return this.mailService.sendMail(template, invit.userMail, lang, data);
  }
}
