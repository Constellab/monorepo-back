import { Injectable } from '@nestjs/common';
import { BlBadRequestException, BlMailService } from '@monorepo/back-core-lib';
import { CnCoreConfigService } from '../cn-core/modules/cn-core-config/cn-core-config.service';
import { ClSupportedLanguage } from '@monorepo/core-lib';

@Injectable()
export class CnSupportService {
  constructor(
    private mailService: BlMailService,
    private coreConfigService: CnCoreConfigService
  ) {}

  public async sendMailToSupport(
    template: string,
    data?: Record<string, any>,
    subject?: string
  ): Promise<void> {
    const email = this.coreConfigService.getSupportMail();
    if (!email) {
      throw new BlBadRequestException('No support email configured');
    }
    await this.mailService.sendMailAndCheck({
      templateName: template,
      recipients: email,
      lang: ClSupportedLanguage.en,
      data,
      subject,
    });
  }
}
