import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';

import { CnCoreConfigService } from '../modules/cn-core-config/cn-core-config.service';

@Injectable()
export class CnCaptchaService {
  private readonly logger = new Logger(CnCaptchaService.name);
  private recaptchaClient: RecaptchaEnterpriseServiceClient;

  constructor(private configService: CnCoreConfigService) {
    this.initializeClient();
  }

  private initializeClient(): void {
    // Skip initialization in non-production environments
    // if (!this.configService.isProduction()) {
    //   return;
    // }

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
  }

  public async validateCaptcha(token: string, action: string): Promise<boolean> {
    // Skip validation in non-production environments
    // if (!this.configService.isProduction()) {
    //   return true;
    // }

    try {
      const projectId = this.configService.getGcpProjectId();
      const projectPath = this.recaptchaClient.projectPath(projectId);

      const request = {
        parent: projectPath,
        assessment: {
          event: {
            token: token,
            siteKey: this.configService.getCaptchaSiteKey(),
            expectedAction: action,
          },
        },
      };

      const [response] = await this.recaptchaClient.createAssessment(request);

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

      // Verify the action matches
      if (response.tokenProperties?.action !== action) {
        this.logger.warn(`Action mismatch. Expected: ${action}, Got: ${response.tokenProperties?.action}`);
        return false;
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
