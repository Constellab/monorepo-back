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
   * An unconfigured site key is the off switch for the captcha, in every environment.
   *
   * A blank `CAPTCHA_SITE_KEY` — which is what an emptied or commented-out CapRover field
   * produces — means login, signup and the labs' credential check accept any token, including
   * none. Deliberate: an instance deployed without a reCAPTCHA key must still be usable, and
   * refusing instead would lock every credential route of that instance. The cost is that the
   * only brute-force protection those routes have is gone and no response says so, which is
   * how the August 2026 black box audit came to read a lab login as having no captcha at all.
   * The log line below is the only trace. Keep the key set wherever the captcha is expected.
   */
  public async validateCaptcha(token: string | undefined, action: string): Promise<boolean> {
    const siteKey: string | undefined = this.configService.getCaptchaSiteKey();

    if (!siteKey) {
      return this.answerWithoutSiteKey();
    }
    if (!token) {
      return false;
    }

    try {
      return await this.assessToken(token, action, siteKey);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error validating reCAPTCHA: ${errorMessage}`, errorStack);
      return false;
    }
  }

  /**
   * The verdict when no site key is configured: accepted, everywhere. Expected locally, where
   * there is nothing to call; outside it, logged as an error because the environment is running
   * without captcha. The reasoning is on {@link validateCaptcha}.
   */
  private answerWithoutSiteKey(): boolean {
    if (!this.configService.isLocal()) {
      this.logger.error(
        'Captcha site key is not configured outside a local environment: accepting the captcha. ' +
          'Set CAPTCHA_SITE_KEY — every credential entry point is unprotected until it is.'
      );
    } else {
      this.logger.warn('Captcha site key not configured, skipping captcha validation.');
    }
    return true;
  }

  /** Ask reCAPTCHA Enterprise what it makes of this token. */
  private async assessToken(token: string, action: string, siteKey: string): Promise<boolean> {
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
    const tokenProperties = response.tokenProperties;

    // Check if the token is valid
    if (!tokenProperties?.valid) {
      this.logger.warn(`Invalid reCAPTCHA token: ${tokenProperties?.invalidReason}`);
      return false;
    }

    // Check the risk score (0.0 to 1.0, where 1.0 is very likely a good interaction)
    const score = response.riskAnalysis?.score || 0;
    const threshold = 0.5;

    if (score < threshold) {
      this.logger.warn(`Low reCAPTCHA score: ${score}`);
      return false;
    }

    this.warnOnActionMismatch(action, tokenProperties.action);

    return true;
  }

  /**
   * For now only verify action to log a message, return error once all lab are on v0.20.0 or more
   */
  private warnOnActionMismatch(action: string, tokenAction: string | null | undefined): void {
    if (action && tokenAction !== action) {
      this.logger.warn(`Action mismatch. Expected: ${action}, Got: ${tokenAction}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.recaptchaClient) {
      await this.recaptchaClient.close();
    }
  }
}
