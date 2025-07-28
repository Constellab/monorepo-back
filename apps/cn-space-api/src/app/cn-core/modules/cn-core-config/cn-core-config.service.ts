import { BlMailConfig, BlObjectStorageCredentials, BlTransportModuleConfig } from '@monorepo/back-core-lib';
import { Inject, Injectable, Logger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
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
    return this.configService.get(CN_ENVIRONMENT_PROFILE_KEY);
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
    return this.configService.get('JWT_SECRET');
  }

  // return the OTHER JWT key used to encrypt other token (such as password forgotten or mail validation)
  public getOtherJwtSecret(): string {
    return this.configService.get('OTHER_JWT_SECRET');
  }

  public getApiUrl(): string {
    return this.configService.get('API_URL');
  }

  public getRobotUserMail(): string {
    return this.configService.get('ROBOT_USER_MAIL');
  }

  public getCustomerSuccessMail(): string {
    return this.configService.get('CUSTOMER_SUCCESS_MAIL');
  }

  public getSupportMail(): string {
    return this.configService.get('SUPPORT_MAIL');
  }

  public getOpenaiAPIKey(): string {
    return this.configService.get('OPENAI_API_KEY');
  }

  public getDatabaseConfig(): CnDatabaseConfig {
    return {
      host: this.configService.get('DATABASE_HOST'),
      port: this.getConfigNumber('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE'),
    };
  }

  public getMailConfig(): BlMailConfig {
    return {
      host: this.configService.get('MAIL_HOST'),
      port: this.getConfigNumber('MAIL_PORT'),
      secure: this.getConfigBoolean('MAIL_SECURE'),
      user: this.configService.get('MAIL_USER'),
      password: this.configService.get('MAIL_PASSWORD'),
      sender: this.configService.get('MAIL_SENDER'),
    };
  }

  public getDefaultObjectStorageEndPoint(): string {
    return this.configService.get('OBJECT_STORAGE_DEFAULT_ENDPOINT');
  }

  public getDefaultObjectStorageRegion(): string {
    return this.configService.get('OBJECT_STORAGE_DEFAULT_REGION');
  }

  public getDefaultObjectStorageCredentials(): BlObjectStorageCredentials {
    return {
      accessKeyId: this.configService.get('OBJECT_STORAGE_DEFAULT_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('OBJECT_STORAGE_DEFAULT_SECRET_KEY'),
    };
  }

  public getTransportModuleConfig(): BlTransportModuleConfig {
    return {
      password: this.configService.get('QUEUE_SERVICE_PASSWORD'),
      host: this.configService.get('QUEUE_SERVICE_HOST'),
      port: this.getConfigNumber('QUEUE_SERVICE_PORT'),
    };
  }

  public getFailedLoginLock(): number {
    return this.getConfigNumber('FAILED_LOGIN_LOCK');
  }

  public getFrontDomain(): string {
    return this.configService.get('FRONT_DOMAIN');
  }

  public getCommunityFrontUrl(): string {
    return this.configService.get('COMMUNITY_FRONT_URL');
  }

  public getCommunityApiUrl(): string {
    return this.configService.get('COMMUNITY_API_URL');
  }

  public getCommunityApiKey(): string {
    return this.configService.get('COMMUNITY_API_KEY');
  }

  protected getConfigNumber(configName: string): number {
    try {
      return parseInt(this.configService.get(configName), 10);
    } catch (error) {
      this.logger.error('Error while parsing config ' + configName + ' to number');
      throw error;
    }
  }

  protected getConfigBoolean(configName: string): boolean {
    const stringBool: string = this.configService.get(configName);

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
    return this.configService.get('LOG_PATH');
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
    return this.configService.get('OBJECT_STORAGE_DB_BACKUP_ENDPOINT');
  }

  public getDbBackupRegion(): string {
    return this.configService.get('OBJECT_STORAGE_DB_BACKUP_REGION');
  }

  /////////////////////////////// MAIN SSH  ///////////////////////////////

  public getMainSshPrivateKeyFilePath(): string {
    return this.configService.get('MAIN_SSH_PRIVATE_KEY_FILE_PATH');
  }

  /////////////////////////////// OVH ///////////////////////////////

  public getOvhServiceName(): string {
    return this.configService.get('OVH_SERVICE_NAME');
  }

  public getOvhAppKey(): string {
    return this.configService.get('OVH_APP_KEY');
  }

  public getOvhAppSecret(): string {
    return this.configService.get('OVH_APP_SECRET');
  }

  public getOvhConsumerKey(): string {
    return this.configService.get('OVH_CONSUMER_KEY');
  }

  public getOvhSshKey(): string {
    return this.configService.get('OVH_SSH_KEY_NAME');
  }

  /////////////////////////////// AZURE ///////////////////////////////

  public getAzureSubscriptionId(): string {
    return this.configService.get('AZURE_SUBSCRIPTION_ID');
  }

  public getAzureResourceGroup(): string {
    return this.configService.get('AZURE_RESOURCE_GROUP');
  }

  public getAzureSshKey(): string {
    return this.configService.get('AZURE_SSH_KEY_NAME');
  }

  public getAzureNetwork(): string {
    return this.configService.get('AZURE_NETWORK');
  }

  public getAzureNetworkSubnet(): string {
    return this.configService.get('AZURE_NETWORK_SUBNET');
  }

  ////////////////////////////// OUTSCALE //////////////////////////////

  public getOutscaleAccessKey(): string {
    return this.configService.get('OUTSCALE_ACCESS_KEY_ID');
  }

  public getOutscaleSecretKey(): string {
    return this.configService.get('OUTSCALE_SECRET_KEY');
  }

  public getOutscaleSshKeyName(): string {
    return this.configService.get('OUTSCALE_SSH_KEY_NAME');
  }

  public getOutscaleSecurityGroup(): string {
    return this.configService.get('OUTSCALE_SECURITY_GROUP');
  }

  public getOutscaleSshPrivateKeyFilePath(): string {
    return this.configService.get('OUTSCALE_SSH_PRIVATE_KEY_FILE_PATH');
  }

  ////////////////////////////////// GCP //////////////////////////////////
  public getGcpProjectId(): string {
    return this.configService.get('GCP_PROJECT_ID');
  }

  public getGcpFirewallTag(): string {
    return this.configService.get('GCP_FIREWALL_TAG');
  }

  public getGcpSshPrivateKeyFilePath(): string {
    return this.configService.get('GCP_SSH_PRIVATE_KEY_FILE_PATH');
  }

  public getGcpCredentialsFilePath(): string {
    return this.configService.get('GOOGLE_APPLICATION_CREDENTIALS');
  }

  /////////////////////////////// LAB CONFIG ///////////////////////////////

  public getLabConfigurerRepoUrl(): string {
    return this.configService.get('LAB_CONFIGURER_REPO_URL');
  }

  public getLabConfigurerRepoBranch(): string {
    return this.configService.get('LAB_CONFIGURER_REPO_BRANCH');
  }

  public getDistPath(...path: string[]): string {
    return join(this.config.distFolder, ...path);
  }

  public getAssetPath(...path: string[]): string {
    return this.getDistPath(this.assets, ...path);
  }

  // return the lab manager version related to the current version of space
  public getLabManagerRecommendedVersion(): string {
    return this.configService.get('LAB_MANAGER_VERSION');
  }

  public getLabManagerStandaloneFrontVersion(): string {
    return this.configService.get('LAB_MANAGER_STANDALONE_FRONT_VERSION');
  }

  public getCaptchaSecretKey(): string {
    return this.configService.get('CAPTCHA_SECRET_KEY');
  }

  public getCaptchaSiteKey(): string {
    return this.configService.get('CAPTCHA_SITE_KEY');
  }

  /////////////////////////// YOUTUBE ///////////////////////////
  public getYoutubeApiKey(): string {
    return this.configService.get('YOUTUBE_API_KEY');
  }

  public getYoutubeTutorialPlaylistId(): string {
    return this.configService.get('YOUTUBE_TUTORIAL_PLAYLIST_ID');
  }

  /////////////////////////// OTHER ///////////////////////////
  /**
   * List of user email to notify when a new user is created
   */
  public newUserNotifReceiver(): string[] {
    return this.configService.get('NEW_USER_NOTIF_RECEIVERS').split(',');
  }

  public getFolderIdToCopyOnSignup(): string {
    return this.configService.get('FOLDER_ID_TO_COPY_ON_SIGNUP');
  }
}
