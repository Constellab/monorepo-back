import { ClHelpService, ClSupportedLanguage } from '@monorepo/core-lib';
import { Inject, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { BlUser } from '../../models/bl-user/bl-user.class';
import { BlTranslatableText } from '../public-api';
import { BlMailQueue } from './bl-mail.class';
import { BlMailEntity, BlMailStatus } from './bl-mail.entity';
import { BlMailEntityService } from './bl-mail-entity.service';
import { BlMailSenderService } from './bl-mail-sender.service';

export interface BlSendMailDTO {
  templateName: string;
  recipients: string;
  lang: ClSupportedLanguage;
  data?: Record<string, any>;
  subject?: BlTranslatableText;
}

/**
 * this class must be extended to inject the correct queue
 */
export class BlMailService {
  @Inject(BlMailSenderService) private mailService: BlMailSenderService;
  @Inject(BlMailEntityService) private mailEntityService: BlMailEntityService;

  private readonly logger = new Logger(BlMailService.name);

  constructor(private queue: Queue) {}

  /**
   * Email one user
   * @param template name of the .hbs template email
   * and name of the subject key in mail-subject i18n file
   * The .hbs filename and translation key in mail-subject must be the same
   * @param receiver receiver
   * @param data map to pass data to template
   * @param subject if provided, override the subject from the template
   * @return true if the mail was sent, false otherwise
   */
  async sendMailToUser(
    template: string,
    receiver: BlUser | BlUser[],
    data?: Record<string, any>,
    subject?: BlTranslatableText
  ): Promise<boolean> {
    const receivers: BlUser[] = ClHelpService.convertObjectOrArrayToArray(receiver);

    let result: boolean = true;
    for (const rec of receivers) {
      const res = await this.sendMail({
        templateName: template,
        recipients: rec.email,
        lang: rec.lang,
        data: data,
        subject: subject,
      });

      if (!res) result = false;
    }

    return result;
  }

  public async sendMail(mail: BlSendMailDTO): Promise<boolean> {
    return this.sendMailAndCheck(mail)
      .then(() => true)
      .catch(() => false);
  }

  public async sendMailAndCheck(mail: BlSendMailDTO): Promise<void> {
    const mailEntity = new BlMailEntity();
    mailEntity.recipients = mail.recipients;
    mailEntity.status = BlMailStatus.PENDING;

    try {
      mailEntity.mail = this.mailService.generateMailHTML(mail.templateName, mail.lang, mail.data);
    } catch (e) {
      mailEntity.status = BlMailStatus.ERROR;
      mailEntity.error = e.toString();
      await this.mailEntityService.save(mailEntity);
      throw e;
    }

    try {
      // generate the subject
      if (mail.subject) {
        mailEntity.subject = await this.mailService.generateSubject(mail.subject, mail.lang);
      } else {
        mailEntity.subject = await this.mailService.generateSubject(
          { text: mail.templateName, translate: true },
          mail.lang
        );
      }
    } catch (e) {
      mailEntity.status = BlMailStatus.ERROR;
      mailEntity.error = e.toString();
      await this.mailEntityService.save(mailEntity);
      throw e;
    }

    // save the mail in the database
    await this.mailEntityService.save(mailEntity);

    const queueMail: BlMailQueue = {
      id: mailEntity.id,
    };
    await this.queue.add('mail', queueMail).catch(async (error) => {
      const strError = `Error during mail queueing: ${error}`;
      this.logger.error(strError);
      mailEntity.status = BlMailStatus.ERROR;
      mailEntity.error = strError;
      await this.mailEntityService.save(mailEntity);
      throw new Error(strError);
    });
  }
}
