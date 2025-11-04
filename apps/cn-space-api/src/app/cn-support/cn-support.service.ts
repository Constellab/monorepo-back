import { BlBadRequestException, BlMailService } from '@monorepo/back-core-lib';
import { ClSupportedLanguage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';

import { CnMailTemplate } from '../cn-core/model/config/cn-mail-template.class';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';

@Injectable()
export class CnSupportService {
  constructor(
    private mailService: BlMailService,
    private coreConfigService: CnCoreConfigService
  ) {}

  public async sendMailToSupport(template: string, data?: Record<string, any>): Promise<void> {
    const email = this.coreConfigService.getSupportMail();
    if (!email) {
      throw new BlBadRequestException('No support email configured');
    }
    await this.mailService.sendMailAndCheck({
      templateName: template,
      recipients: email,
      lang: ClSupportedLanguage.en,
      data,
    });
  }

  public async sendMailFromString(content: string, subject: string): Promise<void> {
    const email = this.coreConfigService.getSupportMail();
    if (!email) {
      throw new BlBadRequestException('No support email configured');
    }
    await this.mailService.sendMailAndCheck({
      templateName: CnMailTemplate.generic,
      recipients: email,
      lang: ClSupportedLanguage.en,
      data: { content: content },
      subject: { text: subject, translate: false },
    });
  }
}
