import {Inject, Injectable, Logger} from '@nestjs/common';
import {join} from 'path';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {ClHelpService, ClSupportedLanguage} from '@monorepo/core-lib';
import {BL_MAIL_CONFIG_PROVIDER, BlMailModuleConfig} from './bl-mail.class';
import {BlTranslateService} from '../bl-translate/bl-translate.service';
import {BlUser} from '../../models/bl-user/bl-user.class';
import * as hbs from 'nodemailer-express-handlebars';
import * as nodemailer from 'nodemailer';

/**
 * Service to send mail using .hbs template in assets/template
 * it supports internationalisation
 */
@Injectable()
export class BlMailService {

  private readonly logger = new Logger(BlMailService.name);


  // base key for i18n subjects
  private readonly subjectI18nBase: string = 'mail-subject.';


  constructor(@Inject(BL_MAIL_CONFIG_PROVIDER) private moduleConfig: BlMailModuleConfig,
              private translateService: BlTranslateService) {
  }

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
  async sendMailToUser(template: string, receiver: BlUser | BlUser[], data?: Record<string, any>, subject?: string): Promise<boolean> {
    const receivers: BlUser[] = ClHelpService.convertObjectOrArrayToArray(receiver);

    let result: boolean = true;
    for (const rec of receivers) {
      const res = await this.sendMail(template, rec.email, rec.lang, data, subject);

      if (!res) result = false;
    }

    return result;
  }

  public async sendMail(template: string, recipients: string, lang: ClSupportedLanguage,
                        data?: Record<string, any>, subject?: string): Promise<boolean> {
    const transporter = nodemailer.createTransport(this.getTransportConfig());

    // use https://nicholaspretorius.github.io/til0025/ example for configuration
    // configure the mail to use template .hbs files
    transporter.use('compile', hbs(this.getTemplateOptions(lang)));

    // add default data to the data passed in parameter
    const completeData = Object.assign({}, this.moduleConfig.defaultData, data);

    const mailOptions = {
      from: this.getMailSender(),
      to: recipients,
      subject: subject ? subject : (await this.translateSubject(template)),
      template: this.getTemplatePath(template, lang),
      context: completeData,
    };

    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error: Error | null) => {
        if (error) {
          this.logger.error(`Error during mail send using template ${template} to ${recipients} in lang ${lang}`);
          this.logger.error(error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  // return the correct template path based on lang
  private getTemplatePath(template: string, lang: ClSupportedLanguage): string {
    return join(lang, template);
  }

  // get the translation for the subject form the template name
  private translateSubject(template: string): Promise<string> {
    return this.translateService.translate(this.subjectI18nBase + template);
  }

  // return the config mail for transport
  private getTransportConfig(): SMTPTransport.Options {
    return {
      host: this.moduleConfig.mailConfig.host,
      port: this.moduleConfig.mailConfig.port,
      secure: this.moduleConfig.mailConfig.secure,
      auth: {
        user: this.moduleConfig.mailConfig.user,
        pass: this.moduleConfig.mailConfig.password
      }
    };
  }

  private getMailSender(): string {
    return this.moduleConfig.mailConfig.sender;
  }

  private getTemplateOptions(lang: ClSupportedLanguage): any {
    // configuration for the template with hbs
    return {
      viewEngine: {
        extname: '.hbs', // handlebars extension
        layoutsDir: this.moduleConfig.templateFolder, // location of handlebars templates
        // name of main template, will wrap all other templates
        defaultLayout: this.moduleConfig.defaultLayout ? this.moduleConfig.defaultLayout + lang : null,
        partialsDir: this.moduleConfig.templateFolder, // location of your subtemplates aka. header, footer etc
      },
      viewPath: this.moduleConfig.templateFolder,
      extName: '.hbs'
    };
  }
}
