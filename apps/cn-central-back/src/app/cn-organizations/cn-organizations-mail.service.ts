import {Injectable} from '@nestjs/common';
import {BlMailService} from '@monorepo/back-core-lib';
import {CnRequestNewLicensesDto} from './cn-organization.dto';
import {CnUserOrgaInfo} from '../cn-users/cn-user.dto';
import {CnMailTemplate} from '../cn-core/model/config/cn-mail-template.class';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';

/**
 * Service that handle mail for organizations
 */
@Injectable()
export class CnOrganizationsMailService {

  constructor(private mailService: BlMailService,
              private configService: CnCoreConfigService) {
  }


  public async requestNewLicenses(request: CnRequestNewLicensesDto, userInfo: CnUserOrgaInfo): Promise<void> {
    const data = {
      user: userInfo.user,
      organizationLabel: userInfo.organization.label,
      nbLicenses: request.nbLicenses,
      text: request.text,
    };

    const receiver = this.configService.getGencoveryContactMail();
    await this.mailService.sendMail(CnMailTemplate.request_new_licenses, receiver,
      userInfo.user.lang, data);
  }

}
