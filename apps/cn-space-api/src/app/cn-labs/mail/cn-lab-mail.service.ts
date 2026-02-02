import { BlMailService, BlSendMailDTO, BlTranslatableText } from '@monorepo/back-core-lib';
import { ClSupportedLanguage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';

import { CnMailTemplate } from '../../cn-core/model/config/cn-mail-template.class';
import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnFrontService } from '../../cn-core/services/cn-front.service';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnSpaceService } from '../../cn-spaces/cn-space.service';
import { CnSupportService } from '../../cn-support/cn-support.service';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnUsersService } from '../../cn-users/cn-users.service';
import { CnRequestLab } from '../cn-lab.dto';
import { CnLab } from '../cn-lab.entity';
import { CnLabUserService } from '../user/cn-lab-user.service';
import { CnLabMailTemplate, CnLabSendMailDto, CnLabSendMailToMailsDto } from './cn-lab-mail.dto';

/**
 * Service to send mail from the lab
 */
@Injectable()
export class CnLabMailService {
  constructor(
    private mailService: BlMailService,
    private userService: CnUsersService,
    private configService: CnCoreConfigService,
    private frontService: CnFrontService,
    private spaceService: CnSpaceService,
    private labUserService: CnLabUserService,
    private supportService: CnSupportService
  ) {}

  public async sendMailFromLab(lab: CnLab, sendMailDTO: CnLabSendMailDto): Promise<void> {
    const template = this.getLabTemplate(sendMailDTO.mail_template);

    const subject = this.getAndCheckSubject(sendMailDTO.subject, template);

    for (const receiver of sendMailDTO.receiver_ids) {
      const user = await this.userService.findByIdAndCheck(receiver);
      // add the user info to data
      const data = Object.assign({}, sendMailDTO.data, {
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          mail: user.email,
        },
      });
      await this.mailService.sendMailToUser(template, user, data, subject);
    }
  }

  public async sendMailToMailsFromLab(
    lab: CnLab,
    sendMailToMailsDTO: CnLabSendMailToMailsDto
  ): Promise<void> {
    const template = this.getLabTemplate(sendMailToMailsDTO.mail_template);
    for (const email of sendMailToMailsDTO.receiver_mails) {
      const mail: BlSendMailDTO = {
        templateName: template,
        recipients: email,
        lang: ClSupportedLanguage.en,
        data: sendMailToMailsDTO.data,
        subject: this.getAndCheckSubject(sendMailToMailsDTO.subject, template),
      };

      await this.mailService.sendMailAndCheck(mail);
    }
  }

  public async sendRequestLabMail(request: CnRequestLab, user: CnUser, space: CnSpace): Promise<void> {
    await this.mailService.sendMailAndCheck({
      templateName: CnMailTemplate.request_lab,
      recipients: this.configService.getCustomerSuccessMail(),
      lang: ClSupportedLanguage.en,
      data: {
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        },
        space: {
          name: space.name,
        },
        type: request.type,
        labNeed: request.labNeed,
      },
    });
  }

  private getLabTemplate(type: CnLabMailTemplate): CnMailTemplate {
    switch (type) {
      case 'scenario-finished':
        return CnMailTemplate.scenario_finished;
      default:
        return CnMailTemplate.generic;
    }
  }

  private getAndCheckSubject(subject: string | undefined, template: CnMailTemplate): BlTranslatableText {
    if (template === CnMailTemplate.generic && !subject) {
      throw new Error('Subject is required for generic template');
    }

    if (!subject) {
      return null;
    }

    return { text: subject, translate: false };
  }

  public async sendLabStartedMail(lab: CnLab): Promise<void> {
    const owners = await this.labUserService.findLabOwner(lab.id);

    const labUrl = await this.frontService.getLabUrl(lab.spaceId, lab.id);

    for (const owner of owners) {
      await this.mailService.sendMailToUser(CnMailTemplate.lab_started, owner.user, {
        user: {
          firstname: owner.user.firstname,
          lastname: owner.user.lastname,
        },
        lab: {
          name: lab.name,
        },
        labUrl: labUrl,
      });
    }
  }

  public async sendLabStartErrorMail(lab: CnLab): Promise<void> {
    const space = await this.spaceService.findByIdAndCheck(lab.spaceId);
    const labUrl = await this.frontService.getLabUrl(lab.spaceId, lab.id);
    await this.supportService.sendMailToSupport(CnMailTemplate.support_lab_start_error, {
      lab: {
        name: lab.name,
      },
      space: {
        name: space.name,
      },
      labUrl: labUrl,
    });
  }

  public async sendLabBackupErrorMail(lab: CnLab): Promise<void> {
    const space = await this.spaceService.findByIdAndCheck(lab.spaceId);
    const labUrl = await this.frontService.getLabUrl(lab.spaceId, lab.id);
    await this.supportService.sendMailToSupport(CnMailTemplate.support_lab_backup_error, {
      lab: {
        name: lab.name,
      },
      space: {
        name: space.name,
      },
      labUrl: labUrl,
    });
  }

  public async sendLabTempStatusLimitReachedMail(lab: CnLab, message?: string): Promise<void> {
    const space = await this.spaceService.findByIdAndCheck(lab.spaceId);
    const labUrl = await this.frontService.getLabUrl(lab.spaceId, lab.id);
    await this.supportService.sendMailToSupport(CnMailTemplate.support_lab_temp_status_limit_reached, {
      lab: {
        name: lab.name,
      },
      space: {
        name: space.name,
      },
      status: lab.currentStatus.status,
      labUrl: labUrl,
      message: message,
    });
  }
}
