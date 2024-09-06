import { Inject, Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CN_ENVIRONMENT_PROFILE_KEY,
  CN_ENVIRONMENT_PROFILE_PROD_VALUE,
  CN_RABBITMQ_PASSWORD_KEY,
  CN_RABBITMQ_PORT_KEY,
  CN_RABBITMQ_URL_KEY,
  CN_RABBITMQ_USER_KEY,
  CnDatabaseConfig,
  CnEnvironmentProfile
} from '../../model/config/cn-config.class';
import {
  BlMailConfig,
  BlObjectStorageCredentials,
  BlTransportModuleConfig,
  blTransportQueueConstellabUser
} from '@monorepo/back-core-lib';
import { CN_CORE_MODULE_CONFIG, CnCoreConfigModuleConfig } from './cn-core-module-config.class';
import { join } from 'path';


@Injectable()
export class CnCoreConfigService {

  private readonly assets = 'assets';

  constructor(protected configService: ConfigService,
              @Inject(CN_CORE_MODULE_CONFIG) private config: CnCoreConfigModuleConfig) {
  }

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

  public getSalesMail(): string {
    return this.configService.get('SALES_MAIL');
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
      database: this.configService.get('DATABASE')
    };
  }

  public getMailConfig(): BlMailConfig {
    return {
      host: this.configService.get('MAIL_HOST'),
      port: this.getConfigNumber('MAIL_PORT'),
      secure: this.getConfigBoolean('MAIL_SECURE'),
      user: this.configService.get('MAIL_USER'),
      password: this.configService.get('MAIL_PASSWORD'),
      sender: this.configService.get('MAIL_SENDER')
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
      queue: blTransportQueueConstellabUser,
      username: this.configService.get(CN_RABBITMQ_USER_KEY),
      password: this.configService.get(CN_RABBITMQ_PASSWORD_KEY),
      url: this.configService.get(CN_RABBITMQ_URL_KEY),
      port: this.configService.get(CN_RABBITMQ_PORT_KEY),
    };
  }

  public getFailedLoginLock(): number {
    return this.getConfigNumber('FAILED_LOGIN_LOCK');
  }

  public getCentralFrontDomain(): string {
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
      console.error('Error while parsing config ' + configName + ' to number');
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
    return this.configService.get('OVH_SSH_KEY');
  }

  /////////////////////////////// AZURE ///////////////////////////////

  public getAzureSubscriptionId(): string {
    return this.configService.get('AZURE_SUBSCRIPTION_ID');
  }

  public getAzureResourceGroup(): string {
    return this.configService.get('AZURE_RESOURCE_GROUP');
  }

  public getAzureSshKey(): string {
    return this.configService.get('AZURE_SSH_KEY');
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
    return this.configService.get('OUTSCALE_SSH_KEY');
  }

  public getOutscaleSecurityGroup(): string {
    return this.configService.get('OUTSCALE_SECURITY_GROUP');
  }

  /////////////////////////////// LAB CONFIG ///////////////////////////////

  public getDockerRegistryUrl(): string {
    return this.configService.get('DOCKER_REGISTRY_URL');
  }

  public getDockerRegistryUsername(): string {
    return this.configService.get('DOCKER_REGISTRY_USERNAME');
  }

  public getDockerRegistryPassword(): string {
    return this.configService.get('DOCKER_REGISTRY_PASSWORD');
  }

  public getLabConfigurerRepoUrl(): string {
    return this.configService.get('LAB_CONFIGURER_REPO_URL');
  }

  public getLabConfigurerRepoBranch(): string {
    return this.configService.get('LAB_CONFIGURER_REPO_BRANCH');
  }

  /**
   * List of user email to notify when a new user is created
   */
  public newUserNotifReceiver(): string[] {
    return this.configService.get('NEW_USER_NOTIF_RECEIVERS').split(',');
  }


  public getDistPath(...path: string[]): string {
    return join(this.config.distFolder, ...path);
  }

  public getAssetPath(...path: string[]): string {
    return this.getDistPath(this.assets, ...path);
  }

  // return the lab manager version related to the current version of central
  public getLabManagerRecommendedVersion(): string {
    return this.configService.get('LAB_MANAGER_VERSION');
  }

  public getLabDesktopWindowsExeUrl(): string {
    return this.configService.get('LAB_DESKTOP_WINDOWS_EXE_URL');
  }

  public getLabDesktopMacExeUrl(): string {
    return this.configService.get('LAB_DESKTOP_MAC_EXE_URL');
  }

  public getCaptchaSecretKey(): string {
    return this.configService.get('CAPTCHA_SECRET_KEY');
  }

  public getCaptchaSiteKey(): string {
    return this.configService.get('CAPTCHA_SITE_KEY');
  }
}

