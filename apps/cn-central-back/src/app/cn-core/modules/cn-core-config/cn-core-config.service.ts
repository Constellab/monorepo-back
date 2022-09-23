import {Injectable, LogLevel} from '@nestjs/common';
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
  BlObjectStorageModuleConfig,
  BlTransportModuleConfig,
  blTransportQueueHub
} from '@monorepo/back-core-lib';


@Injectable()
export class CnCoreConfigService {

  constructor(protected configService: ConfigService) {
  }

  public getEnvironmentProfile(): CnEnvironmentProfile {
    return this.configService.get(CN_ENVIRONMENT_PROFILE_KEY);
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === CN_ENVIRONMENT_PROFILE_PROD_VALUE;
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

  public getObjectStorageModuleConfig(): BlObjectStorageModuleConfig {
    return {
      endpoint: this.configService.get('OBJECT_STORAGE_ENDPOINT'),
      region: this.configService.get('OBJECT_STORAGE_REGION'),
    };
  }

  public getTransportModuleConfig(): BlTransportModuleConfig {
    return {
      queue: blTransportQueueHub,
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

  public getWebsiteURL(): string {
    return this.configService.get('WEBSITE_URL');
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
}

