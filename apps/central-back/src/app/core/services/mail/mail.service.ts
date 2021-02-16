import {Injectable, Logger} from '@nestjs/common';
import {join} from 'path';
import {CoreConfigService} from '../../modules/core-config/core-config.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {MailConfig, MailTemplate} from '../../model/config/mail-config.class';
import {User} from '../../../users/user.entity';
import {TranslateService} from '../../modules/translate/translate.service';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import nodemailer = require('nodemailer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hbs = require('nodemailer-express-handlebars');

/**
 * Service to send mail using .hbs template in assets/template
 * it supports internationalisation
 */
@Injectable()
export class MailService {

  private readonly logger = new Logger(MailService.name);


  // base key for i18n subjects
  private readonly subjectI18nBase: string = 'mail-subject.';

  // configuration for the template with hbs
  private readonly templateOptions = {
    viewEngine: {
      extname: '.hbs', // handlebars extension
      layoutsDir: join(__dirname, 'assets/templates/'), // location of handlebars templates
      defaultLayout: 'main', // name of main template, will wrap all other templates
      partialsDir: join(__dirname, 'assets/templates/'), // location of your subtemplates aka. header, footer etc
    },
    viewPath: join(__dirname, 'assets/templates/'),
    extName: '.hbs'
  };

  constructor(private configService: CoreConfigService,
              private translateService: TranslateService) {
  }

  /**
   * Send an email to one user
   * @param template name of the .hbs template email
   * and name of the subject key in mail-subject i18n file
   * The .hbs filename and translation key in mail-subject must be the same
   * @param receiver receiver
   * @param data map to pass data to template
   * @return true if the mail was sent, false otherwise
   */
  async sendMailToUser(template: MailTemplate, receiver: User, data?: { [key: string]: any }): Promise<boolean> {
    const transporter = nodemailer.createTransport(this.getTransportConfig());

    // use https://nicholaspretorius.github.io/til0025/ example for configuration
    // configure the mail to use template .hbs files
    transporter.use('compile', hbs(this.templateOptions));

    const mailOptions = {
      from: this.getMailSender(),
      to: receiver.email,
      subject: await this.translateSubject(template),
      template: this.getTemplatePath(template, receiver.lang),
      context: data
    };

    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error: Error | null) => {
        if (error) {
          this.logger.error('Error during mail send');
          this.logger.error(error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  // return the correct template path based on lang
  private getTemplatePath(template: MailTemplate, lang: ClSupportedLanguage): string {
    return join(lang, template);
  }

  // get the translation for the subject form the template name
  private translateSubject(template: MailTemplate): Promise<string> {
    return this.translateService.translate(this.subjectI18nBase + template);
  }

  // return the config mail for transport
  private getTransportConfig(): SMTPTransport.Options {
    const mailConfig: MailConfig = this.configService.getMailConfig();

    return {
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.password
      }
    };
  }

  private getMailSender(): string {
    return this.configService.getMailSender();
  }
}
