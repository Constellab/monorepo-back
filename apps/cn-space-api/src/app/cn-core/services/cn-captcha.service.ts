import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';

import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';

@Injectable()
export class CnCaptchaService {
  private readonly logger = new Logger(CnCaptchaService.name);
  private recaptchaClient: RecaptchaEnterpriseServiceClient | undefined;

  constructor(private configService: CnCoreConfigService) {}

  private getClient(): RecaptchaEnterpriseServiceClient {
    if (this.recaptchaClient) {
      return this.recaptchaClient;
    }

    // Verify credentials file exists (similar to CnGcpService pattern)
    const credentialsPath = this.configService.getGcpCredentialsFilePath();
    if (!credentialsPath || !existsSync(credentialsPath)) {
      this.logger.error(`GCP credentials file not found at ${credentialsPath}`);
      throw new Error('GCP credentials file not found.');
    }

    // Initialize the reCAPTCHA Enterprise client
    this.recaptchaClient = new RecaptchaEnterpriseServiceClient({
      keyFilename: credentialsPath,
    });
    return this.recaptchaClient;
  }

  public async validateCaptcha(token: string, action: string): Promise<boolean> {
    if (!this.configService.getCaptchaSiteKey()) {
      this.logger.warn('Captcha site key not configured, skipping captcha validation.');
      return true;
    }
    try {
      const projectId = this.configService.getGcpProjectId();
      const projectPath = this.getClient().projectPath(projectId);

      const request = {
        parent: projectPath,
        assessment: {
          event: {
            token: token,
            siteKey: this.configService.getCaptchaSiteKey(),
          },
        },
      };

      const [response] = await this.getClient().createAssessment(request);

      // Check if the token is valid
      if (!response.tokenProperties?.valid) {
        this.logger.warn(`Invalid reCAPTCHA token: ${response.tokenProperties?.invalidReason}`);
        return false;
      }

      // Check the risk score (0.0 to 1.0, where 1.0 is very likely a good interaction)
      const score = response.riskAnalysis?.score || 0;
      const threshold = 0.5;

      if (score < threshold) {
        this.logger.warn(`Low reCAPTCHA score: ${score}`);
        return false;
      }

      // For now only verify action to log a message, return error once all lab are on v0.20.0 or more
      if (action && response.tokenProperties?.action !== action) {
        this.logger.warn(`Action mismatch. Expected: ${action}, Got: ${response.tokenProperties?.action}`);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error validating reCAPTCHA: ${errorMessage}`, errorStack);
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.recaptchaClient) {
      await this.recaptchaClient.close();
    }
  }
}
