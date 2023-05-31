import {Injectable} from '@nestjs/common';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnLabInstanceMailTemplate, CnLabInstanceSendMailDto} from './cn-lab-instance-mail.dto';
import {BlBadRequestException, BlMailService} from '@monorepo/back-core-lib';
import {CnMailTemplate} from '../../cn-core/model/config/cn-mail-template.class';
import {CnUsersService} from '../../cn-users/cn-users.service';
import {CnCoreConfigService} from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import {CnRequestLabInstance} from '../cn-lab-instance.dto';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
import {CnUser} from '../../cn-users/cn-user.entity';
import {ClSupportedLanguage} from '@monorepo/core-lib';


/**
 * Service to send mail from the lab
 */
@Injectable()
export class CnLabInstanceMailService {

  constructor(private mailService: BlMailService,
              private userService: CnUsersService,
              private configService: CnCoreConfigService) {
  }

  public async sendMailFromLab(labInstance: CnLabInstance, sendMailDTO: CnLabInstanceSendMailDto): Promise<void> {
    const template = this.getLabTemplate(sendMailDTO.mail_template);

    for (const receiver of sendMailDTO.receiver_ids) {
      const user = await this.userService.findByIdAndCheck(receiver);
      // add the user info to data
      const data = Object.assign({}, sendMailDTO.data, {user: user});
      await this.mailService.sendMailToUser(template, user, data, sendMailDTO.subject);
    }
  }

  public async sendRequestLabInstanceMail(request: CnRequestLabInstance, user: CnUser, space: CnSpace): Promise<void> {
    await this.mailService.sendMail(CnMailTemplate.request_lab_instance, this.configService.getGencoveryContactMail(),
      ClSupportedLanguage.en, {
        user: user,
        space: space,
        cloudProvider: request.cloudProvider,
        cpuCount: request.cpuCount,
        storageSize: request.storageSize,
        labNeed: request.labNeed,
        additionalInfo: request.additionalInfo,
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

}
