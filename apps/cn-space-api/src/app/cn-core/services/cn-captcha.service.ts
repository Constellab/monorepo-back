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

  /**
   * An unconfigured site key is a **local-only** shortcut.
   *
   * Answering `true` to a missing key anywhere else silently removes the only
   * brute-force protection that login, signup and the labs' credential check have, and
   * nothing about the response says so — a blank `CAPTCHA_SITE_KEY` in an environment's
   * configuration is enough, which is exactly what an emptied CapRover field looks like.
   * The August 2026 black box audit read the login of a lab as having no captcha at all;
   * this branch is how that state can happen without anyone changing code.
   */
  public async validateCaptcha(token: string | undefined, action: string): Promise<boolean> {
    const siteKey: string | undefined = this.configService.getCaptchaSiteKey();

    if (!siteKey) {
      if (!this.configService.isLocal()) {
        this.logger.error(
          'Captcha site key is not configured outside a local environment: refusing the captcha. ' +
            'Set CAPTCHA_SITE_KEY — every credential entry point is unprotected until it is.'
        );
        return false;
      }
      this.logger.warn('Captcha site key not configured, skipping captcha validation.');
      return true;
    }
    if (!token) {
      return false;
    }
    try {
      const projectId = this.configService.getGcpProjectId();
      const projectPath = this.getClient().projectPath(projectId);

      const request = {
        parent: projectPath,
        assessment: {
          event: {
            token: token,
            siteKey,
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
