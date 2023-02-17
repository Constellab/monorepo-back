import {Inject, Injectable, LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
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
import {CN_CORE_MODULE_CONFIG, CnCoreConfigModuleConfig} from './cn-core-module-config.class';
import {join} from 'path';


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

  public getGencoveryContactMail(): string {
    return this.configService.get('GENCOVERY_CONTACT_MAIL');
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

  public getReportImageObjectStorageBucket(): string {
    return this.isProduction() ? 'constellab-report-prod' : 'constellab-report-pre-prod';
  }

  public getReportViewObjectStorageBucket(): string {
    return this.isProduction() ? 'constellab-report-view-prod' : 'constellab-report-view-pre-prod';
  }


  public getFailedLoginLock(): number {
    return this.getConfigNumber('FAILED_LOGIN_LOCK');
  }

  public getCentralFrontDomain(): string {
    return this.configService.get('FRONT_DOMAIN');
  }

  public getHubFrontUrl(): string {
    return this.configService.get('HUB_FRONT_URL');
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
      throw Error('Error while parsing config ' + configName + ' to boolean');
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

  public getCommentObjectStorageBucket(): string {
    return this.isProduction() ? 'constellab-comment-image-prod' : 'constellab-comment-image-pre-prod';
  }

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

  public getSshPrivateKey(): string {
    return this.configService.get('SSH_PRIVATE_KEY');
  }

  public getGwsGitlabUsername(): string {
    return this.configService.get('GWS_GITLAB_USERNAME');
  }

  public getGwsGitlabPassword(): string {
    return this.configService.get('GWS_GITLAB_PASSWORD');
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
  public getLabManagerVersion(): string {
    return '1.0.0';
  }
}

