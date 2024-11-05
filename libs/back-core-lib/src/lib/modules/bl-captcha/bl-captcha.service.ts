import { Inject, Injectable } from '@nestjs/common';
import { BL_CAPTCHA_CONFIG_PROVIDER, BlCaptchaModuleConfig } from './bl-captcha.class';
import { lastValueFrom } from 'rxjs';
import { BlExternalApiService } from '../bl-external-api/bl-external-api.service';

@Injectable()
export class BlCaptchaService {
  constructor(
    @Inject(BL_CAPTCHA_CONFIG_PROVIDER) private moduleConfig: BlCaptchaModuleConfig,
    private externalApiService: BlExternalApiService
  ) {}

  public async validateCaptcha(captcha: string): Promise<boolean> {
    if (this.moduleConfig.localEnv) {
      return true;
    }

    const route = `https://www.google.com/recaptcha/api/siteverify?secret=${this.moduleConfig.secretKey}&response=${captcha}`;
    const response: { success: boolean; 'error-codes': string[] } = await lastValueFrom(
      this.externalApiService.post(route, null)
    );

    return response.success;
  }
}
