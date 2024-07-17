import { Injectable } from '@nestjs/common';
import { CnLabInstance } from '../cn-lab-instance.entity';
import { CnLabInstanceMailTemplate, CnLabInstanceSendMailDto } from './cn-lab-instance-mail.dto';
import { BlMailService } from '@monorepo/back-core-lib';
import { CnMailTemplate } from '../../cn-core/model/config/cn-mail-template.class';
import { CnUsersService } from '../../cn-users/cn-users.service';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnRequestLabInstance } from '../cn-lab-instance.dto';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { ClSupportedLanguage } from '@monorepo/core-lib';
import { CnFrontService } from '../../cn-core/services/cn-front.service';
import { CnSpaceService } from '../../cn-spaces/cn-space.service';
import { CnLabInstanceUserService } from '../user/cn-lab-instance-user.service';
import { CnSupportService } from '../../cn-support/cn-support.service';


/**
 * Service to send mail from the lab
 */
@Injectable()
export class CnLabMailService {

  constructor(private mailService: BlMailService,
              private userService: CnUsersService,
              private configService: CnCoreConfigService,
              private frontService: CnFrontService,
              private spaceService: CnSpaceService,
              private labUserService: CnLabInstanceUserService,
              private supportService: CnSupportService) {
  }

  public async sendMailFromLab(labInstance: CnLabInstance, sendMailDTO: CnLabInstanceSendMailDto): Promise<void> {
    const template = this.getLabTemplate(sendMailDTO.mail_template);

    for (const receiver of sendMailDTO.receiver_ids) {
      const user = await this.userService.findByIdAndCheck(receiver);
      // add the user info to data
      const data = Object.assign({}, sendMailDTO.data, { user: user });
      await this.mailService.sendMailToUser(template, user, data, sendMailDTO.subject);
    }
  }

  public async sendRequestLabInstanceMail(request: CnRequestLabInstance, user: CnUser, space: CnSpace): Promise<void> {
    await this.mailService.sendMail(CnMailTemplate.request_lab_instance, this.configService.getCustomerSuccessMail(),
      ClSupportedLanguage.en, {
        user: user,
        space: space,
        cloudProvider: request.cloudProvider,
        cpuCount: request.cpuCount,
        storageSize: request.storageSize,
        labNeed: request.labNeed,
        additionalInfo: request.additionalInfo
      });
  }

  private getLabTemplate(type: CnLabInstanceMailTemplate): string {
    switch (type) {
      case 'experiment-finished':
        return CnMailTemplate.experiment_finished;
      default:
        return CnMailTemplate.generic;
    }
  }

  public async sendLabStartedMail(labInstance: CnLabInstance): Promise<void> {
    const space = await this.spaceService.findByIdAndCheck(labInstance.spaceId);

    const owners = await this.labUserService.findLabOwner(labInstance.id);

    const labUrl = this.frontService.getLabInstanceUrl(space.domain, labInstance.id);

    for (const owner of owners) {
      await this.mailService.sendMailToUser(CnMailTemplate.lab_started, owner.user, {
        user: {
          firstname: owner.user.firstname,
          lastname: owner.user.lastname
        },
        lab: {
          name: labInstance.name
        },
        labUrl: labUrl
      });
    }
  }

  public async sendLabStartErrorMail(labInstance: CnLabInstance): Promise<void> {
    const space = await this.spaceService.findByIdAndCheck(labInstance.spaceId);
    const labUrl = this.frontService.getLabInstanceUrl(space.domain, labInstance.id);
    await this.supportService.sendMailToSupport(CnMailTemplate.support_lab_start_error, {
      lab: {
        id: labInstance.id,
        name: labInstance.name
      },
      space: {
        id: space.id,
        name: space.name
      },
      labUrl: labUrl
    });

  }

}
