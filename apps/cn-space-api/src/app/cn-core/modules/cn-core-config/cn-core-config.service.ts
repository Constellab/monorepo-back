import { BlMailConfig, BlObjectStorageCredentials, BlTransportModuleConfig } from '@monorepo/back-core-lib';
import { Inject, Injectable, Logger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { CN_JWT_CONFIG } from '../../../cn-auth/cn-jwt.config';
import {
  CN_ENVIRONMENT_PROFILE_KEY,
  CN_ENVIRONMENT_PROFILE_PROD_VALUE,
  CnDatabaseConfig,
  CnEnvironmentProfile,
} from '../../model/config/cn-config.class';
import { CN_CORE_MODULE_CONFIG, CnCoreConfigModuleConfig } from './cn-core-module-config.class';

@Injectable()
export class CnCoreConfigService {
  private readonly assets = 'assets';

  private logger = new Logger(CnCoreConfigService.name);

  constructor(
    protected configService: ConfigService,
    @Inject(CN_CORE_MODULE_CONFIG) private config: CnCoreConfigModuleConfig
  ) {}

  public getEnvironmentProfile(): CnEnvironmentProfile {
    const profile: CnEnvironmentProfile | undefined = this.configService.get(CN_ENVIRONMENT_PROFILE_KEY);
    if (profile == null) {
      throw Error(`Missing config value for '${CN_ENVIRONMENT_PROFILE_KEY}'`);
    }
    return profile;
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === CN_ENVIRONMENT_PROFILE_PROD_VALUE;
  }

  public isDev(): boolean {
    return this.getEnvironmentProfile() === 'dev';
  }

  public isTest(): boolean {
    return this.getEnvironmentProfile() === 'test';
  }

  public isLocal(): boolean {
    const env: CnEnvironmentProfile = this.getEnvironmentProfile();
    return env === 'dev' || env === 'docker' || env === 'test';
  }

  public getJwtSecret(): string {
    return this.getConfigString('JWT_SECRET');
  }

  // return the OTHER JWT key used to encrypt other token (such as password forgotten or mail validation)
  public getOtherJwtSecret(): string {
    return this.getConfigString('OTHER_JWT_SECRET');
  }

  /**
   * Lifetimes of the session token pair, in seconds.
   *
   * Optional in the environment: the defaults in `CN_JWT_CONFIG` apply when unset, so a
   * deployment that says nothing gets the values in code rather than no session at all.
   */
  public getAccessTokenDurationInSeconds(): number {
    return this.getConfigNumberOrDefault(
      'ACCESS_TOKEN_DURATION_SECONDS',
      CN_JWT_CONFIG.defaultAccessTokenDurationInSeconds
    );
  }

  public getRefreshTokenDurationInSeconds(): number {
    return this.getConfigNumberOrDefault(
      'REFRESH_TOKEN_DURATION_SECONDS',
      CN_JWT_CONFIG.defaultRefreshTokenDurationInSeconds
    );
  }

  public getApiUrl(): string {
    return this.getConfigString('API_URL');
  }

  public getRobotUserMail(): string {
    return this.getConfigString('ROBOT_USER_MAIL');
  }

  public getCustomerSuccessMail(): string {
    return this.getConfigString('CUSTOMER_SUCCESS_MAIL');
  }

  public getSupportMail(): string {
    return this.getConfigString('SUPPORT_MAIL');
  }

  public getOpenaiAPIKey(): string {
    return this.getConfigString('OPENAI_API_KEY');
  }

  public getDatabaseConfig(): CnDatabaseConfig {
    return {
      host: this.getConfigString('DATABASE_HOST'),
      port: this.getConfigNumber('DATABASE_PORT'),
      username: this.getConfigString('DATABASE_USER'),
      password: this.getConfigString('DATABASE_PASSWORD'),
      database: this.getConfigString('DATABASE'),
    };
  }

  public getMailConfig(): BlMailConfig {
    return {
      host: this.getConfigString('MAIL_HOST'),
      port: this.getConfigNumber('MAIL_PORT'),
      secure: this.getConfigBoolean('MAIL_SECURE'),
      user: this.getConfigString('MAIL_USER'),
      password: this.getConfigString('MAIL_PASSWORD'),
      sender: this.getConfigString('MAIL_SENDER'),
    };
  }

  public getDefaultObjectStorageEndPoint(): string {
    return this.getConfigString('OBJECT_STORAGE_DEFAULT_ENDPOINT');
  }

  public getDefaultObjectStorageRegion(): string {
    return this.getConfigString('OBJECT_STORAGE_DEFAULT_REGION');
  }

  public getDefaultObjectStorageCredentials(): BlObjectStorageCredentials {
    return {
      accessKeyId: this.getConfigString('OBJECT_STORAGE_DEFAULT_ACCESS_KEY_ID'),
      secretAccessKey: this.getConfigString('OBJECT_STORAGE_DEFAULT_SECRET_KEY'),
    };
  }

  public getTransportModuleConfig(): BlTransportModuleConfig {
    return {
      password: this.getConfigString('QUEUE_SERVICE_PASSWORD'),
      host: this.getConfigString('QUEUE_SERVICE_HOST'),
      port: this.getConfigNumber('QUEUE_SERVICE_PORT'),
    };
  }

  public getFailedLoginLock(): number {
    return this.getConfigNumber('FAILED_LOGIN_LOCK');
  }

  public getFrontDomain(): string {
    return this.getConfigString('FRONT_DOMAIN');
  }

  public getCommunityFrontUrl(): string {
    return this.getConfigString('COMMUNITY_FRONT_URL');
  }

  public getCommunityApiUrl(): string {
    return this.getConfigString('COMMUNITY_API_URL');
  }

  public getCommunityApiKey(): string {
    return this.getConfigString('COMMUNITY_API_KEY');
  }

  protected getConfigString(configName: string): string {
    const value: string | undefined = this.configService.get(configName);
    if (value == null) {
      throw Error(`Missing config value for '${configName}'`);
    }
    return value;
  }

  protected getConfigNumber(configName: string): number {
    try {
      return parseInt(this.getConfigString(configName), 10);
    } catch (error) {
      this.logger.error('Error while parsing config ' + configName + ' to number');
      throw error;
    }
  }

  /**
   * Read an optional numeric config value, falling back to `defaultValue` when it is
   * absent, empty or not a number.
   *
   * The counterpart to {@link getConfigNumber} for the values whose absence is a valid
   * state rather than a misconfiguration — so a caller states which of the two it means
   * by the method it reaches for.
   */
  protected getConfigNumberOrDefault(configName: string, defaultValue: number): number {
    const raw: string | undefined = this.configService.get(configName);
    if (raw == null || raw.trim().length === 0) {
      return defaultValue;
    }
    const parsed: number = parseInt(raw, 10);
    // Non-positive is refused along with NaN: every caller here is a duration, and a zero
    // or negative one is never what was meant — a token expiring the moment it is minted
    // puts the front in a renewal loop instead of failing where it was configured.
    if (Number.isNaN(parsed) || parsed <= 0) {
      this.logger.warn(`Config '${configName}' is not a positive number ('${raw}'), using ${defaultValue}`);
      return defaultValue;
    }
    return parsed;
  }

  protected getConfigBoolean(configName: string): boolean {
    const stringBool: string = this.getConfigString(configName);

    if (stringBool === 'false') {
      return false;
    } else if (stringBool === 'true') {
      return true;
    } else {
      throw Error(`Error while parsing config ${configName} value '${stringBool}' to boolean`);
    }
  }

  public getLogLevel(): LogLevel {
    return this.configService.get('LOG_LEVEL') ?? 'log';
  }

  public getLogPath(): string {
    return this.getConfigString('LOG_PATH');
  }

  public getUserProfilePictureObjectStorageBucket(): string {
    return this.isProduction() ? 'constellab-user-profile-picture' : 'constellab-user-profile-picture';
  }

  public getSpaceImageBucket(): string {
    return this.isProduction() ? 'constellab-space-image-prod' : 'constellab-space-image-pre-prod';
  }

  public getDbBackupBucket(): string {
    return this.isProduction() ? 'constellab-db-backup-prod' : 'constellab-db-backup-pre-prod';
  }

  public getDbBackupEndpoint(): string {
    return this.getConfigString('OBJECT_STORAGE_DB_BACKUP_ENDPOINT');
  }

  public getDbBackupRegion(): string {
    return this.getConfigString('OBJECT_STORAGE_DB_BACKUP_REGION');
  }

  /////////////////////////////// MAIN SSH  ///////////////////////////////

  public getMainSshPrivateKeyFilePath(): string {
    return this.getConfigString('MAIN_SSH_PRIVATE_KEY_FILE_PATH');
  }

  /////////////////////////////// OVH ///////////////////////////////

  public getOvhServiceName(): string {
    return this.getConfigString('OVH_SERVICE_NAME');
  }

  public getOvhAppKey(): string {
    return this.getConfigString('OVH_APP_KEY');
  }

  public getOvhAppSecret(): string {
    return this.getConfigString('OVH_APP_SECRET');
  }

  public getOvhConsumerKey(): string {
    return this.getConfigString('OVH_CONSUMER_KEY');
  }

  public getOvhSshKey(): string {
    return this.getConfigString('OVH_SSH_KEY_NAME');
  }

  /////////////////////////////// AZURE ///////////////////////////////

  public getAzureSubscriptionId(): string {
    return this.getConfigString('AZURE_SUBSCRIPTION_ID');
  }

  public getAzureResourceGroup(): string {
    return this.getConfigString('AZURE_RESOURCE_GROUP');
  }

  public getAzureSshKey(): string {
    return this.getConfigString('AZURE_SSH_KEY_NAME');
  }

  public getAzureNetwork(): string {
    return this.getConfigString('AZURE_NETWORK');
  }

  public getAzureNetworkSubnet(): string {
    return this.getConfigString('AZURE_NETWORK_SUBNET');
  }

  ////////////////////////////// OUTSCALE //////////////////////////////

  public getOutscaleAccessKey(): string {
    return this.getConfigString('OUTSCALE_ACCESS_KEY_ID');
  }

  public getOutscaleSecretKey(): string {
    return this.getConfigString('OUTSCALE_SECRET_KEY');
  }

  public getOutscaleSshKeyName(): string {
    return this.getConfigString('OUTSCALE_SSH_KEY_NAME');
  }

  public getOutscaleSecurityGroup(): string {
    return this.getConfigString('OUTSCALE_SECURITY_GROUP');
  }

  public getOutscaleSshPrivateKeyFilePath(): string {
    return this.getConfigString('OUTSCALE_SSH_PRIVATE_KEY_FILE_PATH');
  }

  ////////////////////////////////// GCP //////////////////////////////////
  public getGcpProjectId(): string {
    return this.getConfigString('GCP_PROJECT_ID');
  }

  public getGcpFirewallTag(): string {
    return this.getConfigString('GCP_FIREWALL_TAG');
  }

  public getGcpSshPrivateKeyFilePath(): string {
    return this.getConfigString('GCP_SSH_PRIVATE_KEY_FILE_PATH');
  }

  public getGcpCredentialsFilePath(): string {
    return this.getConfigString('GOOGLE_APPLICATION_CREDENTIALS');
  }

  /////////////////////////////// LAB CONFIG ///////////////////////////////

  public getLabConfigurerRepoUrl(): string {
    return this.getConfigString('LAB_CONFIGURER_REPO_URL');
  }

  public getLabConfigurerRepoBranch(): string {
    return this.getConfigString('LAB_CONFIGURER_REPO_BRANCH');
  }

  public getDistPath(...path: string[]): string {
    return join(this.config.distFolder, ...path);
  }

  public getAssetPath(...path: string[]): string {
    return this.getDistPath(this.assets, ...path);
  }

  // return the lab manager version related to the current version of space
  public getLabManagerRecommendedVersion(): string {
    return this.getConfigString('LAB_MANAGER_VERSION');
  }

  public getLabManagerStandaloneFrontVersion(): string {
    return this.getConfigString('LAB_MANAGER_STANDALONE_FRONT_VERSION');
  }

  public getCaptchaSiteKey(): string {
    return this.getConfigString('CAPTCHA_SITE_KEY');
  }

  /////////////////////////// YOUTUBE ///////////////////////////
  public getYoutubeApiKey(): string {
    return this.getConfigString('YOUTUBE_API_KEY');
  }

  public getYoutubeTutorialPlaylistId(): string {
    return this.getConfigString('YOUTUBE_TUTORIAL_PLAYLIST_ID');
  }

  /////////////////////////// OTHER ///////////////////////////
  /**
   * List of user email to notify when a new user is created
   */
  public newUserNotifReceiver(): string[] {
    return this.getConfigString('NEW_USER_NOTIF_RECEIVERS').split(',');
  }

  public getFolderIdToCopyOnSignup(): string {
    return this.getConfigString('FOLDER_ID_TO_COPY_ON_SIGNUP');
  }

  public getReflexAccessToken(): string {
    return this.getConfigString('REFLEX_ACCESS_TOKEN');
  }

  // Max duration to keep a running server in temporary status (not fully started)
  public getStartedServerTempStatusMaxDurationMinutes(): number {
    return this.getConfigNumber('STARTED_SERVER_TEMP_STATUS_MAX_DURATION_MINUTES');
  }
}
