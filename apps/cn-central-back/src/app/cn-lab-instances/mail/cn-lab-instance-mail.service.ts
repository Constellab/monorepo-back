import {BadRequestException, Injectable} from '@nestjs/common';
import {CnLabInstancesService} from '../cn-lab-instances.service';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnLabInstanceMailTemplate, CnLabInstanceSendMailDto} from './cn-lab-instance-mail.dto';
import {BlMailService} from '@monorepo/back-core-lib';
import {CnMailTemplate} from '../../cn-core/model/config/cn-mail-template.class';
import {CnUsersService} from '../../cn-users/cn-users.service';


/**
 * Service to send mail from the lab
 */
@Injectable()
export class CnLabInstanceMailService {

  constructor(private labInstanceService: CnLabInstancesService,
              private mailService: BlMailService,
              private userService: CnUsersService) {
  }

  public async sendMailFromLab(labInstance: CnLabInstance, sendMailDTO: CnLabInstanceSendMailDto): Promise<void> {
    const template = this.getTemplate(sendMailDTO.mail_template);

    for (const receiver of sendMailDTO.receiver_ids) {
      const user = await this.userService.findByIdAndCheck(receiver);
      // add the user info to data
      const data = Object.assign({}, sendMailDTO.data, {user: user});
      await this.mailService.sendMailToUser(template, user, data);
    }

  }

  private getTemplate(type: CnLabInstanceMailTemplate): string {
    switch (type) {
      case 'experiment-finished':
        return CnMailTemplate.experiment_finished;
      default:
        throw new BadRequestException(`The email template for the type '${type}' does not exist`);
    }
  }

}
