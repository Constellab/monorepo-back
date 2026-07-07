import * as fs from 'node:fs';

import { ClSupportedLanguage } from '@monorepo/core-lib';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { join } from 'path';

import { BlTranslatableText } from '../../..';
import { BlTranslateService } from '../bl-translate/bl-translate.service';
import { BL_MAIL_CONFIG_PROVIDER, BlMailModuleConfig, BlMailQueue } from './bl-mail.class';
import { BlMailEntity, BlMailStatus } from './bl-mail.entity';
import { BlMailEntityService } from './bl-mail-entity.service';

/**
 * Service to send mail using .hbs template in assets/template
 * it supports internationalisation
 */
@Injectable()
export class BlMailSenderService {
  private readonly logger = new Logger(BlMailSenderService.name);

  // base key for i18n subjects
  private readonly subjectI18nBase: string = 'mail-subject.';

  constructor(
    @Inject(BL_MAIL_CONFIG_PROVIDER) private moduleConfig: BlMailModuleConfig,
    private translateService: BlTranslateService,
    private mailEntityService: BlMailEntityService
  ) {}

  /**
   * Method to send a mail by getting it from the DB
   * @param queueMail
   */
  public async sendMailSync(queueMail: BlMailQueue): Promise<void> {
    const mailEntity = await this.mailEntityService.findById(queueMail.id);

    if (mailEntity == null) {
      this.logger.error(`Mail with id ${queueMail.id} not found`);
      return;
    }

    if (mailEntity.subject == null || mailEntity.mail === null) {
      mailEntity.status = BlMailStatus.ERROR;
      mailEntity.error = 'Mail has no subject or mail';
      await this.mailEntityService.save(mailEntity);
      throw new Error(`Mail has no subject or mail`);
    }

    await this.sendMail(mailEntity).catch(async (error) => {
      mailEntity.error = error.toString();
      mailEntity.status = BlMailStatus.ERROR;
      await this.mailEntityService.save(mailEntity);
      throw error;
    });

    // Success
    mailEntity.status = BlMailStatus.SENT;
    mailEntity.error = null;
    await this.mailEntityService.save(mailEntity).catch((error) => {
      this.logger.error(`Error while saving mail ${mailEntity.id} to Sent ${error}`);
    });
  }

  /**
   * Method to send the mail using nodemailer
   * @param mailEntity
   * @private
   */
  private async sendMail(mailEntity: BlMailEntity): Promise<void> {
    const transporter = nodemailer.createTransport(this.getTransportConfig());

    const mailOptions = {
      from: this.getMailSender(),
      to: mailEntity.recipients,
      subject: mailEntity.subject,
      html: mailEntity.mail,
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: Error | null) => {
        if (error) {
          const strError =
            `Error while sending mail ${mailEntity.id} to ${mailEntity.recipients}.` + ` ${error}`;
          this.logger.error(strError);
          reject(new Error(strError));
        }
        resolve();
      });
    });
  }

  // return the config mail for transport
  private getTransportConfig(): SMTPTransport.Options {
    return {
      host: this.moduleConfig.mailConfig.host,
      port: this.moduleConfig.mailConfig.port,
      secure: this.moduleConfig.mailConfig.secure,
      auth: {
        user: this.moduleConfig.mailConfig.user,
        pass: this.moduleConfig.mailConfig.password,
      },
    };
  }

  private getMailSender(): string {
    return this.moduleConfig.mailConfig.sender;
  }

  /**
   * Method to convert the hbs template to html
   * @param templateName
   * @param lang
   * @param data
   */
  public generateMailHTML(
    templateName: string,
    lang: ClSupportedLanguage,
    data: Record<string, any>
  ): string {
    let body: string;
    try {
      body = this.compileTemplate(templateName, lang, data);
    } catch (e: any) {
      const error = `Error while generating mail ${templateName} in ${lang}. ${e}`;
      this.logger.error(error);
      throw new Error(error, { cause: e });
    }

    // if the default layout is set, we use it
    // we pass the generated body as the body of the layout
    if (this.moduleConfig.defaultLayout) {
      try {
        return this.compileTemplate(this.moduleConfig.defaultLayout, lang, { body: body });
      } catch (e: any) {
        const error =
          `Error while generating mail layout ${this.moduleConfig.defaultLayout} in ${lang}.` +
          ` Error: ${e}`;
        this.logger.error(error);
        throw new Error(error, { cause: e });
      }
    }

    return body;
  }

  private compileTemplate(template: string, lang: ClSupportedLanguage, data: Record<string, any>): string {
    const templatePath = join(
      this.moduleConfig.templateFolder,
      this.getTemplatePath(template, lang) + '.hbs'
    );
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(templateContent);
    const completeData = Object.assign({}, this.moduleConfig.defaultData, data);
    return compiledTemplate(completeData);
  }

  // return the correct template path based on lang
  private getTemplatePath(template: string, lang: ClSupportedLanguage): string {
    return join(lang, template);
  }

  // get the translation for the subject form the template name
  public async generateSubject(template: BlTranslatableText, lang: ClSupportedLanguage): Promise<string> {
    if (!template.translate) {
      return template.text;
    }
    const result = await this.translateService.translateIfExists(this.subjectI18nBase + template.text, {
      lang: lang,
    });
    return result;
  }
}
